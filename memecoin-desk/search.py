"""SEARCH: finds new tokens on Pump.fun and Raydium in real time and turns the ones with real
activity into leads. Every lead carries an on-chain reason.

Feeds (each reconnects on its own):
  * PumpPortal websocket: every pump.fun and LaunchLab ("bonk") launch, and every graduation
    (pump.fun -> PumpSwap, LaunchLab -> Raydium CPMM). The same socket streams trades by the
    wallets in data/whales.txt for WHALE.
  * Solana RPC logsSubscribe on the Raydium CPMM and AMM v4 programs: pool creations.
  * Backup poll (GeckoTerminal new pools, DexScreener new profiles) in case a socket is down.

New tokens go into the nursery. Every minute SEARCH re-reads the nursery in batches of 30 from
DexScreener and promotes a token to a lead once its 1-hour volume and liquidity clear the floor.
"""
import json
import threading
import time

from core import S, SR, ds_pairs_by_mint, f, main_pair, rpc, tag
from wsclient import WebSocket

QUOTES = {"So11111111111111111111111111111111111111112", "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCzBpVEJ4V"}
# Exact pool-creation log lines. "Instruction: InitializeAccount3" appears in ordinary swaps, so
# a substring match would flag old tokens as new pools.
INIT_LOGS = ("Program log: Instruction: Initialize",)                       # CPMM, exact line
INIT_PREFIX = "Program log: initialize2: InitializeInstruction2"            # AMM v4, params follow
MAX_NEW_POOL_AGE_MIN = 120
GT_DEXES = {"pump-fun", "pumpswap", "raydium", "raydium-clmm", "raydium-cp", "raydium-launchlab"}


class Search:
    seat = "SEARCH"

    def __init__(self, desk, whales=None):
        self.d, self.cfg = desk, desk.cfg["search"]
        self.whales = whales or {}
        self.ws_state = {"pumpportal": "off", "raydium": "off"}
        self.seen = 0

    # ---------------------------------------------------------------- nursery
    def add(self, mint, source, creator=None, pool=None, priority=False, note=None):
        if not mint or mint in QUOTES:
            return
        st = self.d.store
        row = st.one("SELECT mint, source, status FROM watch WHERE mint=?", (mint,))
        now = int(self.d.clock())
        if row:
            if priority and source not in (row["source"] or "").split("+"):
                st.x("UPDATE watch SET source=?, status='watch', last_check=0, note=? WHERE mint=?",
                     (f"{row['source']}+{source}", note, mint))
            return
        st.x("INSERT INTO watch (mint, source, first_seen, creator, pool, last_check, status, note) VALUES (?,?,?,?,?,?,?,?)",
             (mint, source, now, creator, pool, 0 if priority else now, "watch", note))
        self.seen += 1

    # ---------------------------------------------------------------- feeds
    def pumpportal_loop(self):
        backoff = 2
        while not self.d.stop.is_set():
            try:
                ws = WebSocket(self.cfg["pumpportal_ws"])
                ws.send_json({"method": "subscribeNewToken"})
                ws.send_json({"method": "subscribeMigration"})
                if self.whales:
                    ws.send_json({"method": "subscribeAccountTrade", "keys": list(self.whales)})
                self.ws_state["pumpportal"] = "live"
                self.d.say(self.seat, "info", f"PumpPortal live: launches, graduations, {len(self.whales)} tracked wallets")
                backoff = 2
                while not self.d.stop.is_set():
                    m = json.loads(ws.recv())
                    self.on_pumpportal(m)
            except Exception as e:
                self.ws_state["pumpportal"] = "down"
                self.d.say(self.seat, "warn", f"PumpPortal socket dropped ({type(e).__name__}); retry in {backoff}s")
                self.d.stop.wait(backoff)
                backoff = min(backoff * 2, 60)

    def on_pumpportal(self, m):
        tx = m.get("txType")
        mint = m.get("mint")
        if tx == "create":
            pool = m.get("pool") or "pump"
            self.add(mint, "pump.fun launch" if pool == "pump" else f"{pool} launch", creator=m.get("traderPublicKey"), pool=pool)
        elif tx in ("migrate", "migration") or (tx is None and mint and not m.get("message")):
            self.add(mint, "graduated", pool=m.get("pool"), priority=True,
                     note=f"graduated to {m.get('pool') or 'AMM'}")
            self.d.say(self.seat, "info", f"graduation {mint[:6]}… → {m.get('pool') or 'AMM'}")
        elif tx in ("buy", "sell") and m.get("traderPublicKey") in self.whales:
            w = m["traderPublicKey"]
            sig = m.get("signature") or f"{w}:{mint}:{time.time()}"
            self.d.store.x("INSERT OR IGNORE INTO whale_buys VALUES (?,?,?,?,?,?,?)",
                           (w, self.whales[w], mint, int(self.d.clock()), f(m.get("solAmount")), tx, sig))
            if tx == "buy":
                self.add(mint, f"whale buy ({self.whales[w]})", priority=True, note=f"{self.whales[w]} bought {f(m.get('solAmount'), 0):.2f} SOL")

    def raydium_loop(self):
        progs = self.cfg["raydium_programs"]
        backoff = 2
        while not self.d.stop.is_set():
            try:
                ws = WebSocket(self.cfg["solana_ws"])
                for i, p in enumerate(progs, 1):
                    ws.send_json({"jsonrpc": "2.0", "id": i, "method": "logsSubscribe",
                                  "params": [{"mentions": [p]}, {"commitment": "confirmed"}]})
                self.ws_state["raydium"] = "live"
                self.d.say(self.seat, "info", f"Raydium pool-creation logs live ({', '.join(progs.values())})")
                backoff = 2
                while not self.d.stop.is_set():
                    m = json.loads(ws.recv())
                    v = ((m.get("params") or {}).get("result") or {}).get("value") or {}
                    logs = v.get("logs") or []
                    if v.get("err") is None and any(l.strip() in INIT_LOGS or l.startswith(INIT_PREFIX) for l in logs):
                        threading.Thread(target=self.resolve_pool_tx, args=(v.get("signature"),), daemon=True).start()
            except Exception as e:
                self.ws_state["raydium"] = "down"
                self.d.say(self.seat, "warn", f"Raydium log socket dropped ({type(e).__name__}); retry in {backoff}s")
                self.d.stop.wait(backoff)
                backoff = min(backoff * 2, 60)

    def resolve_pool_tx(self, sig):
        try:
            tx = rpc(self.d.cfg, "getTransaction", [sig, {"encoding": "jsonParsed", "maxSupportedTransactionVersion": 0,
                                                          "commitment": "confirmed"}])
        except Exception:
            return
        if not tx:
            return
        mints = {b.get("mint") for b in (tx.get("meta") or {}).get("postTokenBalances") or []} - QUOTES - {None}
        for mnt in mints:
            self.add(mnt, "Raydium pool created", priority=True, note=f"pool init tx {sig[:10]}…")

    def backup_poll_loop(self):
        while not self.d.stop.is_set():
            try:
                d = S.get_json("https://api.geckoterminal.com/api/v2/networks/solana/new_pools?page=1&include=dex", ttl=30)
                for p in d.get("data") or []:
                    rel = p.get("relationships") or {}
                    dex = ((rel.get("dex") or {}).get("data") or {}).get("id")
                    base = ((rel.get("base_token") or {}).get("data") or {}).get("id", "")
                    if dex in GT_DEXES and base.startswith("solana_"):
                        self.add(base[7:], f"new pool ({dex})", pool=dex)
                for t in S.ds_profiles_latest() or []:
                    if t.get("chainId") == "solana":
                        self.add(t.get("tokenAddress"), "DexScreener new profile")
            except Exception as e:
                self.d.say(self.seat, "warn", f"backup poll failed: {e}")
            self.d.stop.wait(self.cfg["poll_backup_sec"])

    # ---------------------------------------------------------------- nursery sweep -> leads
    def sweep_loop(self):
        while not self.d.stop.is_set():
            try:
                self.sweep()
            except Exception as e:
                self.d.say(self.seat, "warn", f"nursery sweep failed: {type(e).__name__}: {e}")
            self.d.stop.wait(self.cfg["nursery_check_sec"])

    def sweep(self):
        st, c = self.d.store, self.cfg
        now = int(self.d.clock())
        self.d.busy(self.seat, "sweeping")
        st.x("UPDATE watch SET status='expired' WHERE status='watch' AND first_seen < ?", (now - c["nursery_max_age_sec"],))
        n = st.one("SELECT COUNT(*) n FROM watch WHERE status='watch'")["n"]
        if n > c["nursery_max"]:  # keep the newest
            st.x("UPDATE watch SET status='expired' WHERE mint IN (SELECT mint FROM watch WHERE status='watch' "
                 "ORDER BY first_seen ASC LIMIT ?)", (n - c["nursery_max"],))
        due = st.q("SELECT * FROM watch WHERE status='watch' AND (last_check=0 OR first_seen <= ?) "
                   "ORDER BY last_check ASC LIMIT 600", (now - c["nursery_min_age_sec"],))
        if not due:
            self.d.busy(self.seat, "listening")
            return
        pairs = ds_pairs_by_mint([r["mint"] for r in due])
        for r in due:
            mint = r["mint"]
            ps = pairs.get(mint) or []
            p = main_pair(ps, mint)
            if not p:
                st.x("UPDATE watch SET last_check=? WHERE mint=?", (now, mint))
                if now - r["first_seen"] > 1800:
                    st.x("UPDATE watch SET status='dropped', note='no pair after 30 min' WHERE mint=?", (mint,))
                continue
            vol_h1 = sum(f((q.get("volume") or {}).get("h1"), 0) for q in ps
                         if (q.get("baseToken") or {}).get("address") == mint)
            liq = SR.total_liquidity(ps, mint, "solana") or f((p.get("liquidity") or {}).get("usd"))
            tx5 = (p.get("txns") or {}).get("m5") or {}
            st.x("UPDATE watch SET last_check=?, vol_h1=?, liq=? WHERE mint=?", (now, vol_h1, liq, mint))
            if vol_h1 >= 10_000:
                st.snap(mint, now, price=f(p.get("priceUsd")), liq=liq, mcap=f(p.get("marketCap")) or f(p.get("fdv")),
                        vol_h1=vol_h1, buys_m5=tx5.get("buys"), sells_m5=tx5.get("sells"))
            age = now - r["first_seen"]
            if age > 1200 and vol_h1 < c["drop_if_vol_h1_below_after_20min"] and "whale" not in (r["source"] or ""):
                st.x("UPDATE watch SET status='dropped', note=? WHERE mint=?", (f"1h vol {SR.usd(vol_h1)} after 20 min", mint))
                continue
            if vol_h1 >= c["lead_min_vol_h1_usd"] and (liq or 0) >= c["lead_min_liquidity_usd"]:
                if r["last_lead_ts"] and now - r["last_lead_ts"] < c["relead_after_sec"]:
                    continue
                self.make_lead(r, p, ps, vol_h1, liq, now)
        self.d.busy(self.seat, "listening")

    def make_lead(self, r, p, ps, vol_h1, liq, now):
        st = self.d.store
        mint = r["mint"]
        tx1 = (p.get("txns") or {}).get("h1") or {}
        created = min((q.get("pairCreatedAt") or 1e15) for q in ps) / 1000
        age_min = (now - min(created, r["first_seen"])) / 60
        if "Raydium pool" in (r["source"] or "") and age_min > MAX_NEW_POOL_AGE_MIN:
            st.x("UPDATE watch SET status='dropped', note=? WHERE mint=?", (f"not new: first pair {age_min / 60:.0f} h old", mint))
            return
        base = p.get("baseToken") or {}
        reason = (f"{r['note'] or r['source']}; 1h vol {SR.usd(vol_h1)} over {tx1.get('buys', 0):,} buys / "
                  f"{tx1.get('sells', 0):,} sells on {p.get('dexId')}; liq {SR.usd(liq)}; age {age_min:.0f} min")
        lead_id = st.x("INSERT INTO leads (mint, symbol, name, source, reason, creator, pool, created_ts, stage, status) "
                       "VALUES (?,?,?,?,?,?,?,?,?,?)",
                       (mint, base.get("symbol"), base.get("name"), r["source"], reason, r["creator"], p.get("dexId"),
                        now, "SEARCH", "open"))
        st.x("UPDATE watch SET last_lead_ts=? WHERE mint=?", (now, mint))
        self.d.say(self.seat, "lead", f"{tag(lead_id)} {base.get('symbol')} — {reason}", lead_id)
        self.d.hand(self.seat, lead_id)

    def threads(self):
        return [self.pumpportal_loop, self.raydium_loop, self.backup_poll_loop, self.sweep_loop]
