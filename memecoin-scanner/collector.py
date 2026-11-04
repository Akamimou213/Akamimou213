"""Trench collector: watches the market 24/7, alerts on playbook setups and paper-trades them.

  python3 collector.py                          # Solana, $1,000 paper bankroll, 1 % risk
  python3 collector.py --bankroll 2000 --risk 0.5 --chains solana,base
  TELEGRAM_BOT_TOKEN=... TELEGRAM_CHAT_ID=... python3 collector.py   # also push alerts to Telegram

Every minute it:
  1. discovers coins (DexScreener profiles/boosts, GeckoTerminal new + trending pools) every 3 min,
  2. snapshots every watched coin (price, liquidity, 5-min and 1-h volume) in one batched call per 30,
  3. computes the gate from its own series (30-min volume, % below 60-min high),
  4. runs the full dossier (RugCheck / GoPlus) only on coins that pass the gate,
  5. alerts on GO / A-SETUP, opens a paper trade (entry 1 min later, 4.5 % fees, real stop slippage)
     and manages it: TP 2x, stop −50 %, 60-min time stop,
  6. enforces the playbook's limits: 5 open positions, 10 trades per UTC day, −5 % daily stop.

All snapshots are stored (data/trench.db), alert or not, so validate.py can test the rules on
an unbiased sample. Read-only: no wallet, no keys, no real orders.
"""
import argparse
import json
import os
import signal
import sys
import time
import traceback

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import notify  # noqa: E402
import rules  # noqa: E402
import series as SR  # noqa: E402
import sources as S  # noqa: E402
import store  # noqa: E402

POLL = 60
DISCOVER_EVERY = 180
WATCH_MIN_LIQ = 10_000        # don't watch pools thinner than this
WATCH_MIN_VOL_H1 = 10_000     # ...or quieter than this when first seen
DROP_AFTER_QUIET = 90 * 60    # stop watching after 90 min with 1h volume < $5k
MAX_WATCH = 900               # 30 DexScreener calls per poll at most
ALERT_COOLDOWN = 60 * 60
SAFETY_TTL = 15 * 60
MAX_OPEN, MAX_TRADES_DAY, DAILY_STOP = 5, 10, -0.05

running = True


def log(*a):
    print(time.strftime("%H:%M:%S"), *a, flush=True)


# ---------------------------------------------------------------- discovery
def discover(chains):
    found = {}

    def add(ch, addr, src):
        if ch in chains and addr:
            found.setdefault((ch, addr), set()).add(src)

    for fn, src in ((S.ds_profiles_latest, "ds-profile"), (S.ds_boosts_latest, "ds-boost"), (S.ds_boosts_top, "ds-boost-top")):
        try:
            for t in fn():
                add(t.get("chainId"), t.get("tokenAddress"), src)
        except S.SourceError as e:
            log("discover", src, e)
    for ch in chains:
        for kind, call in (("gt-trend", lambda c: S.gt_trending(c, "5m")), ("gt-trend1h", lambda c: S.gt_trending(c, "1h")),
                           ("gt-new", lambda c: S.get_json(f"{S.GT}/networks/{S.GT_NETWORK.get(c, c)}/new_pools?page=1", ttl=60).get("data") or [])):
            try:
                for p in call(ch):
                    add(ch, p["relationships"]["base_token"]["data"]["id"].split("_", 1)[1], kind)
            except (S.SourceError, KeyError, IndexError, AttributeError) as e:
                log("discover", kind, ch, e)
    return found


# ---------------------------------------------------------------- one cycle
class Collector:
    def __init__(self, db, chains, bankroll, risk):
        self.db, self.chains, self.bankroll, self.risk = db, chains, bankroll, risk
        self.last_discover = 0
        self.pairs_cache = {}   # (chain, addr) -> latest DexScreener pairs list
        self.seeded = set()

    def watched(self):
        return [dict(r) for r in self.db.execute("SELECT * FROM tokens WHERE active=1")]

    def cycle(self):
        t = store.now()
        if t - self.last_discover >= DISCOVER_EVERY:
            self.last_discover = t
            self.add_new(discover(self.chains), t)
        self.poll(t)
        self.seed(t)
        self.manage_trades(t)
        self.scan_for_setups(t)
        store.set_meta(self.db, "status", dict(ts=t, watching=len(self.watched()), chains=self.chains,
                                               bankroll=self.bankroll, risk=self.risk))

    def add_new(self, found, t):
        known = {(r["chain"], r["address"]): r for r in self.db.execute("SELECT chain, address, active, sources FROM tokens")}
        fresh = [k for k in found if k not in known]
        # Re-activate known-but-dropped coins that show up in a trending feed again.
        for k in found:
            r = known.get(k)
            if r and not r["active"] and any(s.startswith("gt-trend") or s == "ds-boost-top" for s in found[k]):
                self.db.execute("UPDATE tokens SET active=1, inactive_reason=NULL, last_seen=? WHERE chain=? AND address=?", (t, *k))
        by = {}
        for ch, a in fresh:
            by.setdefault(ch, []).append(a)
        n = 0
        for ch, addrs in by.items():
            try:
                pairs = S.ds_tokens(ch, addrs)
            except S.SourceError as e:
                log("prefilter", e)
                continue
            grouped = {}
            for p in pairs:
                grouped.setdefault(p["baseToken"]["address"].lower(), []).append(p)
            for a in addrs:
                ps = grouped.get(a.lower(), [])
                mp = rules.main_pair(ps, a)
                ok = mp and rules._f((mp.get("liquidity") or {}).get("usd"), 0) >= WATCH_MIN_LIQ \
                    and rules._f((mp.get("volume") or {}).get("h1"), 0) >= WATCH_MIN_VOL_H1
                b = (mp or {}).get("baseToken") or {}
                self.db.execute("INSERT OR IGNORE INTO tokens (chain,address,symbol,name,sources,first_seen,last_seen,active,inactive_reason) "
                                "VALUES (?,?,?,?,?,?,?,?,?)",
                                (ch, a, b.get("symbol"), b.get("name"), ",".join(sorted(found[(ch, a)])), t, t,
                                 1 if ok else 0, None if ok else "below watch floor"))
                n += bool(ok)
        self.db.commit()
        if fresh:
            log(f"discovered {len(fresh)} new, watching {n} of them")

    def poll(self, t):
        rows = self.watched()
        if len(rows) > MAX_WATCH:  # keep the busiest
            rows = rows[:MAX_WATCH]
        by = {}
        for r in rows:
            by.setdefault(r["chain"], []).append(r["address"])
        for ch, addrs in by.items():
            try:
                pairs = S.ds_tokens(ch, addrs) if addrs else []
            except S.SourceError as e:
                log("poll", e)
                continue
            grouped = {}
            for p in pairs:
                grouped.setdefault(p["baseToken"]["address"].lower(), []).append(p)
            for a in addrs:
                ps = grouped.get(a.lower(), [])
                self.pairs_cache[(ch, a)] = ps
                mp = rules.main_pair(ps, a)
                if not mp:
                    continue
                v = mp.get("volume") or {}
                tx = (mp.get("txns") or {}).get("h1") or {}
                self.db.execute("INSERT INTO snaps VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
                                (ch, a, t, rules._f(mp.get("priceUsd")), rules._f((mp.get("liquidity") or {}).get("usd")),
                                 rules.total_liquidity(ps, a, ch), rules._f(mp.get("marketCap")) or rules._f(mp.get("fdv")),
                                 rules._f(v.get("m5")), rules._f(v.get("h1")), tx.get("buys"), tx.get("sells"), mp.get("pairAddress")))
                self.db.execute("UPDATE tokens SET last_seen=? WHERE chain=? AND address=?", (t, ch, a))
        # Drop coins that went quiet or lost their pool, unless a paper trade is open on them.
        open_ = {(r["chain"], r["address"]) for r in self.db.execute("SELECT chain, address FROM trades WHERE status!='closed'")}
        for r in rows:
            k = (r["chain"], r["address"])
            if k in open_:
                continue
            recent = store.series(self.db, *k, since=t - DROP_AFTER_QUIET)
            if not recent:
                if t - (r["first_seen"] or t) > 15 * 60:
                    self.deactivate(k, "no pair data")
                continue
            if recent[-1]["liq"] is not None and recent[-1]["liq"] < 5_000:
                self.deactivate(k, "liquidity < $5k")
            elif t - (r["first_seen"] or t) > DROP_AFTER_QUIET and all((s["vol_h1"] or 0) < 5_000 for s in recent):
                self.deactivate(k, "quiet 90 min")
        self.db.commit()

    def seed(self, t, per_cycle=8):
        """Backfill up to 60 min of history from GeckoTerminal 1-min candles for newly watched coins,
        so the gate can judge them at once instead of after 45 min of our own polling."""
        n = 0
        for r in self.watched():
            k = (r["chain"], r["address"])
            if k in self.seeded or n >= per_cycle:
                continue
            first = self.db.execute("SELECT MIN(ts) m FROM snaps WHERE chain=? AND address=?", k).fetchone()["m"]
            self.seeded.add(k)
            if first is None or t - first >= SR.MIN_HISTORY:
                continue
            mp = rules.main_pair(self.pairs_cache.get(k, []), r["address"])
            if not mp:
                continue
            n += 1
            try:
                cs = S.gt_minute_candles(r["chain"], mp["pairAddress"], 70, r["address"])
            except S.SourceError as e:
                if "rate limited" in str(e):
                    self.seeded.discard(k)  # try again next cycle
                    return
                continue
            liq = rules._f((mp.get("liquidity") or {}).get("usd"))
            mc = rules._f(mp.get("marketCap")) or rules._f(mp.get("fdv"))
            vols = {int(c[0]) // 60 * 60: float(c[5]) for c in cs}
            rows = []
            for c in cs:
                ts = int(c[0]) // 60 * 60
                if ts >= first - 30 or ts < t - 3900:
                    continue
                v5 = sum(vols.get(ts - 60 * i, 0.0) for i in range(5))
                rows.append((*k, ts, float(c[4]), liq, rules.total_liquidity(self.pairs_cache.get(k, []), r["address"], r["chain"]),
                             mc, v5, None, None, None, "seed:" + mp["pairAddress"]))
            self.db.executemany("INSERT INTO snaps VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", rows)
            self.db.commit()
            if rows:
                log(f"seeded {r['symbol']} with {len(rows)} min of candles")

    def deactivate(self, k, why):
        self.db.execute("UPDATE tokens SET active=0, inactive_reason=? WHERE chain=? AND address=?", (why, *k))

    # ------------------------------------------------------------ setups and alerts
    def scan_for_setups(self, t):
        for r in self.watched():
            k = (r["chain"], r["address"])
            snaps = store.series(self.db, *k, since=t - 4000)
            g = SR.gate_from_series(snaps, t)
            if not SR.gate_pass(g):
                continue
            last = self.db.execute("SELECT MAX(ts) m FROM alerts WHERE chain=? AND address=?", k).fetchone()["m"]
            if last and t - last < ALERT_COOLDOWN:
                continue
            self.evaluate_setup(r, g, t)

    def safety(self, r, t):
        if r["safety"] and r["safety_ts"] and t - r["safety_ts"] < SAFETY_TTL:
            return json.loads(r["safety"])
        out = {}
        try:
            if r["chain"] == "solana":
                out["rugcheck"] = S.rugcheck_report(r["address"])
            else:
                out["goplus"] = S.goplus_token(r["chain"], r["address"])
                try:
                    out["honeypot"] = S.honeypot_is(r["chain"], r["address"])
                except S.SourceError:
                    pass
        except S.SourceError as e:
            out["error"] = str(e)
        self.db.execute("UPDATE tokens SET safety=?, safety_ts=? WHERE chain=? AND address=?",
                        (json.dumps(out), t, r["chain"], r["address"]))
        return out

    def evaluate_setup(self, r, g, t):
        k = (r["chain"], r["address"])
        sf = self.safety(r, t)
        raw = dict(address=r["address"], chain=r["chain"], pairs=self.pairs_cache.get(k, []), candles=None, gate=g,
                   rugcheck=sf.get("rugcheck"), goplus=sf.get("goplus"), honeypot=sf.get("honeypot"),
                   errors=[sf["error"]] if sf.get("error") else [])
        d = rules.evaluate(raw, now=t, bankroll=self.bankroll, risk_pct=self.risk)
        go = d["verdict"] in ("A-SETUP", "GO", "GO · HALF SIZE")
        if not go:
            # Gate passed but the dossier said no: keep a record (useful for review), no alert push.
            self.db.execute("INSERT INTO alerts (ts,chain,address,symbol,verdict,reason,price,vol30,off_high,liq,mcap,gate_source,skipped) "
                            "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
                            (t, *k, d.get("symbol"), d["verdict"], d["reason"], d.get("price"), g["vol30"], g["off_high"],
                             d.get("liquidity"), d.get("mcap"), "series", "dossier"))
            self.db.commit()
            log(f"gate ok, dossier {d['verdict']}: {d.get('symbol')} — {d['reason']}")
            return
        skipped = self.limits_block(t)
        d.pop("candles", None)
        cur = self.db.execute("INSERT INTO alerts (ts,chain,address,symbol,verdict,reason,price,vol30,off_high,liq,mcap,gate_source,dossier,skipped) "
                              "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                              (t, *k, d.get("symbol"), d["verdict"], d["reason"], d.get("price"), g["vol30"], g["off_high"],
                               d.get("liquidity"), d.get("mcap"), "series", json.dumps(d), skipped))
        aid = cur.lastrowid
        if not skipped:
            size = (d.get("sizing") or {}).get("position")
            tc = self.db.execute("INSERT INTO trades (alert_id,chain,address,symbol,signal_ts,signal_price,size,half_size,status) "
                                 "VALUES (?,?,?,?,?,?,?,?, 'pending')",
                                 (aid, *k, d.get("symbol"), t, d.get("price"), size, int(not d["in_window"])))
            self.db.execute("UPDATE alerts SET trade_id=? WHERE id=?", (tc.lastrowid, aid))
        self.db.commit()
        log(f"ALERT {d['verdict']}: {d.get('symbol')} {r['address']} vol30 {rules.usd(g['vol30'])} "
            f"{-g['off_high'] * 100:.1f}% off high" + (f"  [paper skipped: {skipped}]" if skipped else ""))
        notify.alert(d, g, skipped)

    def limits_block(self, t):
        open_n = self.db.execute("SELECT COUNT(*) n FROM trades WHERE status!='closed'").fetchone()["n"]
        if open_n >= MAX_OPEN:
            return f"{MAX_OPEN} positions already open"
        day0 = t - t % 86400
        n_day = self.db.execute("SELECT COUNT(*) n FROM trades WHERE signal_ts>=?", (day0,)).fetchone()["n"]
        if n_day >= MAX_TRADES_DAY:
            return f"{MAX_TRADES_DAY} trades today"
        pnl = self.db.execute("SELECT COALESCE(SUM(pnl),0) p FROM trades WHERE status='closed' AND exit_ts>=?", (day0,)).fetchone()["p"]
        if self.bankroll and pnl <= DAILY_STOP * self.bankroll:
            return "daily −5 % stop hit"
        return None

    # ------------------------------------------------------------ paper trades
    def manage_trades(self, t):
        for tr in [dict(r) for r in self.db.execute("SELECT * FROM trades WHERE status!='closed'")]:
            snaps = store.series(self.db, tr["chain"], tr["address"], since=tr["signal_ts"])
            res = SR.simulate(snaps, tr["signal_ts"])
            if res is None:
                if t - tr["signal_ts"] > 10 * 60:
                    self.db.execute("UPDATE trades SET status='closed', exit_reason='never filled', ret=0, pnl=0 WHERE id=?", (tr["id"],))
                continue
            if tr["status"] == "pending":
                self.db.execute("UPDATE trades SET status='open', entry_ts=?, entry_price=? WHERE id=?",
                                (res["entry_ts"], res["entry_price"], tr["id"]))
                log(f"paper ENTRY {tr['symbol']} @ {rules.price_fmt(res['entry_price'])} (signal {rules.price_fmt(tr['signal_price'])})")
            self.db.execute("UPDATE trades SET max_price=? WHERE id=?", (res["max_price"], tr["id"]))
            if res["status"] == "closed":
                pnl = (tr["size"] or 0) * res["ret"]
                self.db.execute("UPDATE trades SET status='closed', exit_ts=?, exit_price=?, exit_reason=?, ret=?, pnl=? WHERE id=?",
                                (res["exit_ts"], res["exit_price"], res["exit_reason"], res["ret"], pnl, tr["id"]))
                log(f"paper EXIT {tr['symbol']} {res['exit_reason']} {res['ret'] * 100:+.1f}% ({rules.usd(pnl)})")
                notify.closed(tr, res, pnl)
        self.db.commit()


def main():
    ap = argparse.ArgumentParser(description="Trench collector (read-only, paper trading).")
    ap.add_argument("--chains", default="solana", help="comma list: solana,base,bsc,ethereum")
    ap.add_argument("--bankroll", type=float, default=1000)
    ap.add_argument("--risk", type=float, default=1.0)
    ap.add_argument("--db", default=store.DEFAULT_DB)
    ap.add_argument("--cycles", type=int, default=0, help="stop after N cycles (0 = run forever)")
    a = ap.parse_args()
    db = store.connect(a.db)
    c = Collector(db, a.chains.split(","), a.bankroll, a.risk)

    def stop(*_):
        global running
        running = False
    signal.signal(signal.SIGINT, stop)
    signal.signal(signal.SIGTERM, stop)
    log(f"collector started: chains={a.chains} bankroll=${a.bankroll:g} risk={a.risk}% db={a.db}"
        + ("  telegram on" if notify.enabled() else ""))
    n = 0
    while running:
        t0 = time.time()
        try:
            c.cycle()
        except Exception:
            traceback.print_exc()
        n += 1
        if a.cycles and n >= a.cycles:
            break
        while running and time.time() - t0 < POLL:
            time.sleep(1)
    log("collector stopped")


if __name__ == "__main__":
    main()
