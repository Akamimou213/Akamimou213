"""WHALE, HEAD (dossier + scheduler) and JUDGE seats."""
import os
import time

import judge as J
from core import HERE, S, SR, ds_pairs_by_mint, f, main_pair, tag


def load_whales(path=None):
    path = path or os.path.join(HERE, "data", "whales.txt")
    out = {}
    if os.path.exists(path):
        for line in open(path):
            line = line.split("#")[0].strip()
            if not line:
                continue
            addr, _, label = line.partition(",")
            out[addr.strip()] = (label.strip() or addr.strip()[:6])
    return out


# ---------------------------------------------------------------- WHALE
class Whale:
    """Smart-money confirm. Reads tracked-wallet trades (PumpPortal stream) and top-holder overlap.
    It confirms or stays quiet. It never kills, unless config whale.require_confirm is true."""
    seat = "WHALE"

    def __init__(self, desk, whales):
        self.d, self.whales = desk, whales

    def loop(self):
        while not self.d.stop.is_set():
            lead_id = self.d.take(self.seat)
            if lead_id is None:
                self.d.busy(self.seat, "idle")
                continue
            self.d.busy(self.seat, f"checking {tag(lead_id)}")
            self.run(lead_id)

    def assess(self, lead):
        if not self.whales:
            return dict(result="missing", note="no tracked wallets in data/whales.txt", buys=[], holders=[])
        since = self.d.clock() - self.d.cfg["whale"]["lookback_min"] * 60
        buys = self.d.store.q("SELECT wallet, label, ts, sol FROM whale_buys WHERE mint=? AND side='buy' AND ts>=? ORDER BY ts",
                              (lead["mint"], since))
        owners = set(((lead.get("risk") or {}).get("facts") or {}).get("top_holder_owners") or [])
        holders = [dict(wallet=w, label=l) for w, l in self.whales.items() if w in owners]
        res = "confirm" if buys or holders else "quiet"
        return dict(result=res, buys=[dict(label=b["label"], minutes_ago=round((self.d.clock() - b["ts"]) / 60), sol=b["sol"])
                                      for b in buys], holders=holders)

    def run(self, lead_id):
        lead = self.d.store.lead(lead_id)
        w = self.assess(lead)
        self.d.store.set_lead(lead_id, whale=w)
        if w["result"] == "quiet" and self.d.cfg["whale"]["require_confirm"]:
            self.d.store.set_lead(lead_id, status="dead", kill_reason="WHALE: no tracked wallet bought")
            return self.d.say(self.seat, "dead", f"{tag(lead_id)} DEAD — no tracked wallet bought (whale.require_confirm)", lead_id)
        if w["result"] == "confirm":
            who = ", ".join([f"{b['label']} {b['minutes_ago']}m ago" for b in w["buys"]] + [h["label"] + " holds" for h in w["holders"]])
            self.d.say(self.seat, "ok", f"{tag(lead_id)} confirm — {who}", lead_id)
        else:
            self.d.say(self.seat, "info", f"{tag(lead_id)} {w['result']} — {w.get('note') or 'no tracked wallet in it'}", lead_id)
        self.d.hand(self.seat, lead_id)


# ---------------------------------------------------------------- HEAD: dossier
M = "missing"


def build_dossier(lead, pairs, store, cfg, equity, now, candles=None):
    """Facts only. No adjectives, no opinions from other seats. A gap is written as "missing"."""
    mint = lead["mint"]
    own = [p for p in pairs if (p.get("baseToken") or {}).get("address") == mint]
    p = main_pair(own, mint) or {}
    risk = (lead.get("risk") or {})
    rf = risk.get("facts") or {}
    price = f(p.get("priceUsd"))
    liq = f((p.get("liquidity") or {}).get("usd"))
    mcap = f(p.get("marketCap")) or f(p.get("fdv"))
    created = min([(q.get("pairCreatedAt") or 1e15) / 1000 for q in own] or [now])
    first = store.one("SELECT first_seen FROM watch WHERE mint=?", (mint,))
    launch = min(created, (first or {}).get("first_seen") or now)

    def v(x, nd=2):
        return M if x is None else round(x, nd)

    # holders and price over the same hour, from the desk's own snapshots
    h_now = rf.get("holders")
    # nearest holder snapshot to 1 h ago, accepted 25-95 min back; its real age goes in window_min
    old = store.snap_near(mint, now - 3600, "holders", tol=35 * 60)
    holders = dict(now=v(h_now, 0), one_hour_ago=v(old and old["holders"], 0), top10_pct=v(rf.get("top10_pct"), 1),
                   dev_pct=v(rf.get("dev_pct"), 2), insider_wallets=rf.get("insider_wallets", M), bundle_pct=v(rf.get("bundle_pct"), 1))
    if old and h_now and old["holders"]:
        holders["growth_1h_pct"] = round((h_now / old["holders"] - 1) * 100, 1)
        holders["window_min"] = round((now - old["ts"]) / 60)
    else:
        holders["growth_1h_pct"] = M
    pc = p.get("priceChange") or {}
    price_d = dict(usd=v(price, 12), change_1h_pct=v(f(pc.get("h1")), 1), change_6h_pct=v(f(pc.get("h6")), 1))
    if old and old["price"] and price:
        price_d["change_same_hour_pct"] = round((price / old["price"] - 1) * 100, 1)
    else:
        price_d["change_same_hour_pct"] = M
    hist = store.q("SELECT price FROM snaps WHERE mint=? AND ts>=? AND price IS NOT NULL", (mint, now - 3600))
    hi = max([r["price"] for r in hist] + ([price] if price else []), default=None)
    price_d["below_60m_high_pct"] = round((1 - price / hi) * 100, 1) if hi and price and len(hist) >= 10 else M
    price_d["vol_30m_usd"] = M
    recent = [c for c in candles or [] if c[0] >= now - 3600]
    if recent and price:
        # The desk's own snapshots are too short for a new lead: use the pool's 1-minute candles.
        # Highs use candle bodies (open/close): thin-pool wicks can be bad prints.
        hi_c = max([max(f(c[1], 0), f(c[4], 0)) for c in recent] + [price])
        if price_d["below_60m_high_pct"] == M and len(recent) >= 30:
            price_d["below_60m_high_pct"] = round((1 - price / hi_c) * 100, 1)
        price_d["vol_30m_usd"] = round(sum(f(c[5], 0) for c in recent if c[0] >= now - 1800))

    # buys vs sells, last two 5-minute windows
    tx5 = (p.get("txns") or {}).get("m5") or {}
    prev = store.snap_near(mint, now - 300, "buys_m5", tol=150)
    flow5 = dict(now=dict(buys=tx5.get("buys", M), sells=tx5.get("sells", M)),
                 prev=dict(buys=prev["buys_m5"], sells=prev["sells_m5"]) if prev else dict(buys=M, sells=M))
    tx1 = (p.get("txns") or {}).get("h1") or {}
    vol1 = sum(f((q.get("volume") or {}).get("h1"), 0) for q in own)
    n1 = (tx1.get("buys") or 0) + (tx1.get("sells") or 0)

    from sniper import position_fraction
    size = min(equity * position_fraction(cfg), (liq or 0) * cfg["sniper"]["max_pct_of_pool_liquidity"])
    whale = lead.get("whale") or {}
    return dict(
        lead_id=f"#{lead['id']:03d}", chain="solana", token=f"{lead.get('symbol')} ({mint})", dex=p.get("dexId", M),
        age_since_launch_min=round((now - launch) / 60), utc_hour=time.gmtime(now).tm_hour,
        market=dict(mcap_usd=v(mcap, 0), liquidity_usd=v(liq, 0),
                    liquidity_to_mcap_pct=round(liq / mcap * 100, 1) if liq and mcap else M),
        holders=holders, price=price_d, flow_5m=flow5,
        flow_1h=dict(buys=tx1.get("buys", M), sells=tx1.get("sells", M), volume_usd=v(vol1, 0),
                     avg_trade_usd=round(vol1 / n1, 1) if n1 else M),
        order=dict(size_usd=round(size, 2), share_of_pool_pct=round(size / liq * 100, 2) if liq else M),
        risk=dict(result=risk.get("status", M), checked=[f"{c['label']}: {c['value']}" for c in risk.get("checks") or []]),
        whale=dict(result=whale.get("result", M), buys=whale.get("buys") or [], holders=[h["label"] for h in whale.get("holders") or []]),
        social=dict(mentions_per_hour_now=M, mentions_per_hour_1h_ago=M),
        search_reason=lead.get("reason") or M,
    )


class Head:
    """Runs the thread: builds the dossier for every lead that reaches JUDGE, re-queues watches."""
    seat = "HEAD"

    def __init__(self, desk):
        self.d = desk

    def loop(self):
        while not self.d.stop.is_set():
            lead_id = self.d.take(self.seat, timeout=2.0)
            if lead_id is not None:
                self.d.busy(self.seat, f"dossier {tag(lead_id)}")
                try:
                    self.dossier(lead_id)
                except Exception as e:
                    self.d.store.set_lead(lead_id, status="dead", kill_reason=f"HEAD: dossier failed {e}")
                    self.d.say(self.seat, "pass", f"{tag(lead_id)} no dossier ({type(e).__name__}: {e}); pass", lead_id)
            self.requeue_watches()
            self.d.busy(self.seat, "running the thread")

    def dossier(self, lead_id):
        st = self.d.store
        lead = st.lead(lead_id)
        pairs = ds_pairs_by_mint([lead["mint"]]).get(lead["mint"]) or []
        candles = None
        p = main_pair(pairs, lead["mint"])
        if p and p.get("pairAddress"):
            try:
                candles = S.gt_minute_candles("solana", p["pairAddress"], 60, lead["mint"])
            except S.SourceError:
                candles = None   # the dossier then says "missing"; never a guess
        dos = build_dossier(lead, pairs, st, self.d.cfg, st.equity_now(), int(self.d.clock()), candles)
        st.set_lead(lead_id, dossier=dos)
        missing = sum(1 for k, val in _walk(dos) if val == M)
        self.d.say(self.seat, "info", f"{tag(lead_id)} dossier → JUDGE ({missing} fields missing)", lead_id)
        self.d.hand(self.seat, lead_id)

    def requeue_watches(self):
        """A watch is asked once more after 30 minutes, from RISK again so every fact is fresh."""
        now = int(self.d.clock())
        for r in self.d.store.q("SELECT id FROM leads WHERE status='watch' AND next_ask_ts<=?", (now,)):
            self.d.store.set_lead(r["id"], status="open")
            self.d.say(self.seat, "info", f"{tag(r['id'])} 30 min up: asking again from RISK", r["id"])
            self.d.store.set_lead(r["id"], stage="RISK")
            self.d.inbox["RISK"].put(r["id"])


def _walk(d, pre=""):
    if isinstance(d, dict):
        for k, val in d.items():
            yield from _walk(val, f"{pre}.{k}")
    else:
        yield pre, d


# ---------------------------------------------------------------- JUDGE
class JudgeSeat:
    seat = "JUDGE"

    def __init__(self, desk):
        self.d = desk

    def loop(self):
        while not self.d.stop.is_set():
            lead_id = self.d.take(self.seat)
            if lead_id is None:
                self.d.busy(self.seat, "idle")
                continue
            self.d.busy(self.seat, f"judging {tag(lead_id)}")
            self.run(lead_id)

    def run(self, lead_id):
        st = self.d.store
        lead = st.lead(lead_id)
        if (lead.get("risk") or {}).get("status") != "pass":   # never sees a token RISK killed
            return self.d.say(self.seat, "reject", f"{tag(lead_id)} refused: RISK did not pass it", lead_id)
        answers, err, ms = J.ask(lead["dossier"], self.d.cfg)
        g = J.apply_gate(answers, self.d.cfg, lead.get("watch_count") or 0)
        price = f(((lead["dossier"] or {}).get("price") or {}).get("usd"))
        verdict = dict(answers=answers, gate=g, error=err, ms=round(ms, 1), backend=self.d.cfg["judge"]["backend"],
                       config=self.d.cfg["_hash"], ts=int(self.d.clock()))
        kw = dict(verdict=verdict, verdict_ts=int(self.d.clock()), price_at_verdict=price)
        if getattr(self.d, "exit", None):
            dp = (lead["dossier"] or {}).get("price") or {}
            below = dp.get("below_60m_high_pct")
            self.d.exit.open_shadow(lead_id, lead["mint"], lead["symbol"], dict(
                verdict=g["final"], p_buy=(answers or {}).get("action", {}).get("buy"),
                position=("missing" if not isinstance(below, (int, float)) else "near high (<7%)" if below < 7
                          else "pullback 7-30%" if below <= 30 else "dump (>30%)"),
                utc_hour=(lead["dossier"] or {}).get("utc_hour")))
        if answers:
            a = answers
            probs = (f"organic {a['organic']['yes']:.2f} · late {a['late']['yes']:.2f} · exit_risk {g.get('exit_risk')} · "
                     f"buy {a['action']['buy']:.2f} / watch {a['action']['watch']:.2f} / pass {a['action']['pass']:.2f}")
        else:
            probs = f"no answer ({err})"
        if g["final"] == "buy":
            st.set_lead(lead_id, status="judged", **kw)
            self.d.say(self.seat, "buy", f"{tag(lead_id)} BUY — {probs} [{ms:.0f} ms]", lead_id, data=g)
            self.d.hand(self.seat, lead_id)
        elif g["final"] == "watch":
            st.set_lead(lead_id, status="watch", watch_count=(lead.get("watch_count") or 0) + 1,
                        next_ask_ts=int(self.d.clock()) + self.d.cfg["judge"]["watch_reask_min"] * 60, **kw)
            self.d.say(self.seat, "watch", f"{tag(lead_id)} WATCH — {probs}; ask again in "
                                           f"{self.d.cfg['judge']['watch_reask_min']} min", lead_id, data=g)
        else:
            st.set_lead(lead_id, status="passed", kill_reason=f"JUDGE: {g['killed_by']}", **kw)
            self.d.say(self.seat, "pass", f"{tag(lead_id)} PASS — {g['killed_by']} · {probs}", lead_id, data=g)
