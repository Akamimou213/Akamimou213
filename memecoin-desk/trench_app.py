"""Trench: one live trading screen for Solana memecoins (radar + chart + ticket + positions).

  python3 trench_app.py                 # http://127.0.0.1:8790
  python3 trench_app.py --port 8790 --host 0.0.0.0

Live feeds: PumpPortal (every launch and graduation), DexScreener (profiles, boosts, prices), GeckoTerminal
(new and trending pools, candles, trades), RugCheck (contract, LP, holders), Telegram public channel pages
(calls). Paper trading by default: a Buy is filled at the live quote plus price impact and fees, and the
exit plan runs on the server. No keys, no signing: for a real trade the ticket opens Jupiter.
"""
import argparse
import base64
import calendar
import ssl
import html as H
import json
import os
import re
import sqlite3
import sys
import threading
import time
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import risk as RK  # noqa: E402
from core import Desk, S, SR, f, load_config, main_pair  # noqa: E402
from exits import ExitState  # noqa: E402
from store import Store  # noqa: E402
from wsclient import WebSocket  # noqa: E402

QUOTES = {"So11111111111111111111111111111111111111112", "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCzBpVEJ4V"}
GT = "https://api.geckoterminal.com/api/v2/networks/solana"
CA_RE = re.compile(r"\b[1-9A-HJ-NP-Za-km-z]{32,44}\b")
COST_SIDE = 0.0225
ACTIVITY_CHECKS = {"vol"}     # volume is a trading filter, not a safety check: it never marks a coin dead

PLANS = {
    "call": dict(name="Call · 2x / −50% / 24h", sl=0.5, tp=2.0, partial=None, arm=None, trail=None, tmax=24 * 60),
    "fresh": dict(name="Fresh · 2x / −50% / 60m", sl=0.5, tp=2.0, partial=None, arm=None, trail=None, tmax=60),
    "momentum": dict(name="Momentum · −6% / trail 6% after +12% / 60m", sl=0.06, tp=None, partial=None, arm=0.12, trail=0.06, tmax=60),
    "runner": dict(name="Runner · half at 2x, trail 25% / −40% / 24h", sl=0.4, tp=2.0, partial=0.5, arm=1.0, trail=0.25, tmax=24 * 60),
}

SCHEMA = """
CREATE TABLE IF NOT EXISTS pos (id INTEGER PRIMARY KEY AUTOINCREMENT, mint TEXT, symbol TEXT, plan TEXT, entry_ts INTEGER,
  entry REAL, size REAL, cost REAL, liq REAL, state TEXT, last REAL, peak REAL, status TEXT, exit_ts INTEGER, exit_px REAL,
  why TEXT, proceeds REAL DEFAULT 0, pnl REAL, ret REAL, source TEXT);
CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT);
"""


class App:
    def __init__(self, cfg):
        self.cfg = cfg
        self.lock = threading.RLock()
        self.coins = {}          # mint -> dict
        self.calls = []          # recent channel calls
        self.flow = []           # (ts, kind) launches / graduations
        self.feeds = {"pumpportal": "off", "telegram": "off", "dexscreener": "off", "geckoterminal": "off", "rugcheck": "off"}
        self.sol = None
        self.db = sqlite3.connect(os.path.join(HERE, "data", "trench.db"), check_same_thread=False)
        self.db.row_factory = sqlite3.Row
        self.db.executescript(SCHEMA)
        self.dlock = threading.Lock()
        self.tlock = threading.RLock()   # one trade at a time: buys, sells and exit ticks never interleave
        if self.kv("cash") is None:
            self.set_kv("cash", cfg["start_balance_usd"])
        self.desk = Desk(cfg, Store(os.path.join(HERE, "data", "trench_risk.db")))
        self.dev = RK.DevHistory(self.desk)
        self.stop = threading.Event()

    # ---------------------------------------------------------------- storage
    def q(self, sql, a=()):
        with self.dlock:
            return [dict(r) for r in self.db.execute(sql, a)]

    def x(self, sql, a=()):
        with self.dlock:
            c = self.db.execute(sql, a)
            self.db.commit()
            return c.lastrowid

    def kv(self, k):
        r = self.q("SELECT v FROM kv WHERE k=?", (k,))
        return json.loads(r[0]["v"]) if r else None

    def set_kv(self, k, v):
        self.x("INSERT OR REPLACE INTO kv VALUES (?,?)", (k, json.dumps(v)))

    # ---------------------------------------------------------------- coins
    def add(self, mint, source, **kw):
        if not mint or mint in QUOTES:
            return
        with self.lock:
            c = self.coins.get(mint)
            if not c:
                c = self.coins[mint] = dict(mint=mint, first_seen=time.time(), sources=[], checked=0, enriched=0, safety=None)
            if source not in c["sources"]:
                c["sources"].append(source)
            c.update({k: v for k, v in kw.items() if v is not None})

    # ---------------------------------------------------------------- feeds
    def pumpportal(self):
        while not self.stop.is_set():
            try:
                ws = WebSocket("wss://pumpportal.fun/api/data")
                ws.send_json({"method": "subscribeNewToken"})
                ws.send_json({"method": "subscribeMigration"})
                self.feeds["pumpportal"] = "live"
                while not self.stop.is_set():
                    m = json.loads(ws.recv())
                    if m.get("message"):
                        continue
                    now = time.time()
                    if m.get("txType") == "create":
                        self.flow.append((now, "launch"))
                        self.add(m.get("mint"), "launch", symbol=m.get("symbol"), name=m.get("name"), creator=m.get("traderPublicKey"))
                    elif m.get("mint"):
                        self.flow.append((now, "graduation"))
                        self.add(m["mint"], "graduated", graduated_ts=now)
                    self.flow = [x for x in self.flow if x[0] > now - 3600]
            except Exception:
                self.feeds["pumpportal"] = "reconnecting"
                self.stop.wait(3)

    def discovery(self):
        while not self.stop.is_set():
            try:
                for t in S.ds_profiles_latest() or []:
                    if t.get("chainId") == "solana":
                        self.add(t.get("tokenAddress"), "profile")
                for t in (S.ds_boosts_latest() or []) + (S.ds_boosts_top() or []):
                    if t.get("chainId") == "solana":
                        self.add(t.get("tokenAddress"), "boost")
                self.feeds["dexscreener"] = "live"
            except Exception:
                self.feeds["dexscreener"] = "error"
            for path in ("new_pools?page=1&include=dex", "trending_pools?duration=1h&page=1"):
                try:
                    d = S.get_json(f"{GT}/{path}", ttl=50)
                    for p in d.get("data") or []:
                        base = ((p.get("relationships") or {}).get("base_token") or {}).get("data", {}).get("id", "")
                        if base.startswith("solana_"):
                            self.add(base[7:], "trending" if "trending" in path else "new pool")
                    self.feeds["geckoterminal"] = "live"
                except Exception:
                    self.feeds["geckoterminal"] = "rate limited"
            try:
                sol = S.ds_tokens("solana", ["So11111111111111111111111111111111111111112"])
                usdc = [p for p in sol if (p.get("quoteToken") or {}).get("symbol") in ("USDC", "USDT")]
                b = max(usdc or sol, key=lambda p: f((p.get("liquidity") or {}).get("usd"), 0))
                self.sol = dict(price=f(b.get("priceUsd")), h24=f((b.get("priceChange") or {}).get("h24")))
            except Exception:
                pass
            self.stop.wait(60)

    def tg_get(self, url):
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 trench"})
        return urllib.request.urlopen(req, timeout=20).read().decode("utf-8", "replace")

    @staticmethod
    def tg_posts(page):
        """[(post id, unix ts, own text, quoted post id)] from a t.me page; the quoted (reply) block is not the post's text."""
        out = []
        blocks = page.split('class="tgme_widget_message_wrap')[1:] or [page]   # a single-post page has no wrap
        for block in blocks:
            pid = (re.search(r'data-post="([^"]+)"', block) or [None, None])[1]
            tm = re.search(r'<time datetime="([^"]+)"', block)
            reply = re.search(r'<a class="tgme_widget_message_reply[^"]*" href="https://t.me/([^"?]+)"', block)
            own = re.sub(r'<a class="tgme_widget_message_reply[^"]*".*?</a>', "", block, flags=re.S)
            tx = re.search(r'<div class="tgme_widget_message_text[^"]*"[^>]*>(.*?)</div>', own, re.S)
            if not (pid and tm):
                continue
            text = re.sub(r"<[^>]+>", "", H.unescape(re.sub(r"<br\s*/?>", "\n", tx.group(1)))) if tx else ""
            out.append((pid, calendar.timegm(time.strptime(tm.group(1)[:19], "%Y-%m-%dT%H:%M:%S")), text,
                        reply.group(1) if reply else None))
        return out

    def tg_original(self, pid, cache):
        """The full text and time of one post (the call a brag quotes)."""
        if pid not in cache:
            try:
                posts = self.tg_posts(self.tg_get(f"https://t.me/{pid}?embed=1&mode=tme"))
                cache[pid] = posts[0] if posts else None
            except Exception:
                cache[pid] = None
        return cache[pid]

    def telegram(self):
        seen, originals = set(), {}
        first = True
        while not self.stop.is_set():
            for ch in self.cfg.get("app", {}).get("channels", []):
                try:
                    page = self.tg_get(f"https://t.me/s/{ch}")
                    title = H.unescape((re.search(r"<title>(.*?)</title>", page) or [None, ch])[1]).replace(" – Telegram", "")
                    posts = self.tg_posts(page)
                    if first and posts:                      # backfill a few pages on start
                        oldest = min(int(p[0].split("/")[-1]) for p in posts)
                        for _ in range(3):
                            more = self.tg_posts(self.tg_get(f"https://t.me/s/{ch}?before={oldest}"))
                            if not more:
                                break
                            posts += more
                            oldest = min(int(p[0].split("/")[-1]) for p in more)
                    for pid, ts, text, quoted in posts:
                        if pid in seen:
                            continue
                        seen.add(pid)
                        brag = re.match(r"^\s*(\d+(?:\.\d+)?)x", text)
                        src_pid, src_ts, src_text = pid, ts, text
                        if brag and quoted:
                            o = self.tg_original(quoted, originals)
                            if not o:
                                continue
                            src_pid, src_ts, src_text = o[0], o[1], o[2]
                        cas = [c for c in CA_RE.findall(src_text) if not c.startswith("http")]
                        chain = (re.search(r"\((?:\W*)?(SOL|RBH|BSC|BASE|ETH)\)", src_text) or [None, None])[1]
                        if not cas or chain != "SOL" or re.match(r"^\s*\d+(?:\.\d+)?x", src_text):
                            continue
                        ca = cas[-1]
                        with self.lock:
                            old = next((c for c in self.calls if c["id"] == src_pid), None)
                            call = old or dict(id=src_pid, channel=title, ts=src_ts, mint=ca, text=src_text[:500],
                                               ticker=(re.search(r"\$([A-Za-z0-9]+)", src_text) or [None, None])[1], brags=[])
                            if brag:
                                call["brags"] = sorted(set(call.get("brags", []) + [float(brag.group(1))]))
                                call["last_brag_ts"] = max(call.get("last_brag_ts", 0), ts)
                            self.calls = sorted([c for c in self.calls if c["id"] != src_pid] + [call], key=lambda c: -c["ts"])[:80]
                        self.add(ca, "call", call_ts=src_ts, call_channel=title)
                    self.feeds["telegram"] = "live"
                except Exception:
                    self.feeds["telegram"] = "error"
            first = False
            self.stop.wait(60)

    # ---------------------------------------------------------------- refresh: live numbers for every coin
    def refresh(self):
        while not self.stop.is_set():
            now = time.time()
            with self.lock:
                mints = list(self.coins)
                # forget dead coins; keep calls, open positions and anything with volume
                held = {p["mint"] for p in self.q("SELECT mint FROM pos WHERE status='open'")}
                for m in mints:
                    c = self.coins[m]
                    if m in held or "call" in c["sources"] or "search" in c["sources"] or now - c.get("viewed", 0) < 3600:
                        continue
                    if now - c["first_seen"] > 1800 and (c.get("vol_h1") or 0) < 3000:
                        del self.coins[m]
                    elif now - c["first_seen"] > 8 * 3600 and (c.get("vol_h1") or 0) < 20000:
                        del self.coins[m]
                due = sorted([m for m in self.coins if now - self.coins[m]["checked"] > 20 and now - self.coins[m]["first_seen"] > 60],
                             key=lambda m: self.coins[m]["checked"])[:600]
            for i in range(0, len(due), 30):
                chunk = due[i:i + 30]
                try:
                    pairs = S.ds_tokens("solana", chunk)
                except Exception:
                    continue
                by = {}
                for p in pairs or []:
                    by.setdefault((p.get("baseToken") or {}).get("address"), []).append(p)
                for m in chunk:
                    ps = by.get(m) or []
                    p = main_pair(ps, m)
                    with self.lock:
                        c = self.coins.get(m)
                        if not c:
                            continue
                        c["checked"] = time.time()
                        if not p:
                            continue
                        tx1, tx5 = (p.get("txns") or {}).get("h1") or {}, (p.get("txns") or {}).get("m5") or {}
                        pc = p.get("priceChange") or {}
                        created = min((q.get("pairCreatedAt") or 1e16) for q in ps) / 1000
                        info = p.get("info") or {}
                        c.update(symbol=(p.get("baseToken") or {}).get("symbol") or c.get("symbol"),
                                 name=(p.get("baseToken") or {}).get("name") or c.get("name"),
                                 price=f(p.get("priceUsd")), mcap=f(p.get("marketCap")) or f(p.get("fdv")),
                                 liq=SR.total_liquidity(ps, m, "solana") or f((p.get("liquidity") or {}).get("usd")),
                                 vol_h1=sum(f((q.get("volume") or {}).get("h1"), 0) for q in ps),
                                 vol_m5=sum(f((q.get("volume") or {}).get("m5"), 0) for q in ps),
                                 buys_h1=tx1.get("buys"), sells_h1=tx1.get("sells"), buys_m5=tx5.get("buys"), sells_m5=tx5.get("sells"),
                                 chg_m5=f(pc.get("m5")), chg_h1=f(pc.get("h1")), chg_h6=f(pc.get("h6")), chg_h24=f(pc.get("h24")),
                                 created=min(created, c["first_seen"]), dex=p.get("dexId"), pair=p.get("pairAddress"), url=p.get("url"),
                                 image=info.get("imageUrl"), socials=[s.get("url") for s in (info.get("socials") or []) + (info.get("websites") or [])][:4],
                                 boosts=(p.get("boosts") or {}).get("active"), pools=len(ps))
                self.feeds["dexscreener"] = "live"
            self.stop.wait(5)

    # ---------------------------------------------------------------- enrich: 24 h range + safety for the coins that matter
    def enrich(self):
        while not self.stop.is_set():
            now = time.time()
            with self.lock:
                cand = [c for c in self.coins.values() if c.get("pair") and ((c.get("vol_h1") or 0) >= 20000 or "call" in c["sources"])
                        and now - c["enriched"] > 300]
                cand.sort(key=lambda c: -((c.get("vol_h1") or 0) + (1e9 if "call" in c["sources"] else 0)))
            for c in cand[:3]:          # GeckoTerminal allows ~30 calls a minute; leave room for what you click
                self.enrich_one(c["mint"])
            self.stop.wait(12)

    def enrich_one(self, mint, force=False):
        with self.lock:
            c = self.coins.get(mint)
            if not c or not c.get("pair"):
                return
            pair = c["pair"]
        upd = dict(enriched=time.time())
        try:
            d = S.get_json(f"{GT}/pools/{pair}/ohlcv/minute?aggregate=15&limit=100&currency=usd&token={mint}", ttl=240)
            bars = sorted(d["data"]["attributes"]["ohlcv_list"])
            day = [b for b in bars if b[0] >= time.time() - 86400]
            if day:
                # candle bodies: a single bad wick on a thin pool would fake a 24 h high or low
                upd.update(high24=max(max(b[1], b[4]) for b in day), low24=min(min(b[1], b[4]) for b in day))
            self.feeds["geckoterminal"] = "live"
        except Exception:
            self.feeds["geckoterminal"] = "rate limited"
        try:
            rc = S.rugcheck_report(mint)
            pairs = S.ds_tokens("solana", [mint])
            _, checks, facts = RK.evaluate(mint, pairs, rc, self.dev, self.cfg)
            fail = next((ch for ch in checks if not ch["ok"] and ch["id"] not in ACTIVITY_CHECKS), None)
            status = "dead" if fail else "pass"
            upd.update(safety=status, safety_why=(f"{fail['label']}: {fail['value']}" if fail else None), checks=checks,
                       top10=facts.get("top10_pct"), dev_pct=facts.get("dev_pct"), holders=facts.get("holders"),
                       insiders=facts.get("insider_wallets"), bundle=facts.get("bundle_pct"), lp=facts.get("lp"),
                       top_holders=[dict(owner=h.get("owner"), pct=f(h.get("pct"))) for h in RK.top_holders_excl(rc)[:10]] if rc else [])
            self.feeds["rugcheck"] = "live"
        except Exception as e:
            upd.update(safety="unknown", safety_why=f"check failed: {type(e).__name__}")
            self.feeds["rugcheck"] = "error"
        with self.lock:
            if mint in self.coins:
                self.coins[mint].update(upd)

    # ---------------------------------------------------------------- tags
    @staticmethod
    def live_range(c):
        """Distance from the 24 h high and low at the current price (the range itself refreshes every 5 min)."""
        p, hi, lo = c.get("price"), c.get("high24"), c.get("low24")
        if not (p and hi and lo):
            return None, None
        hi = max(hi, p)
        lo = min(lo, p)
        return 1 - p / hi, p / lo - 1

    def tag(self, c, now):
        age_h = (now - c["created"]) / 3600 if c.get("created") else None
        b, above = self.live_range(c)
        tags = []
        if c.get("safety") == "dead":
            return ["dead"], age_h
        if age_h is not None and age_h < 48 and b is not None and 0.2 <= b <= 0.6 and (above or 0) >= 1.0 \
                and (c.get("vol_h1") or 0) >= 50000 and c.get("safety") == "pass":
            tags.append("setup")
        if b is not None and b < 0.07 and (c.get("chg_h6") or 0) > 50:
            tags.append("top")
        if "call" in c["sources"]:
            tags.append("call")
        if age_h is not None and age_h < 1:
            tags.append("new")
        return tags, age_h

    # ---------------------------------------------------------------- trading (paper)
    def equity(self):
        eq = self.kv("cash")
        for p in self.q("SELECT * FROM pos WHERE status='open'"):
            st = json.loads(p["state"])
            eq += p["size"] * st["left"] * (p["last"] or p["entry"]) / p["entry"]
        return eq

    def size_for(self, plan, liq):
        sc = self.cfg["sniper"]
        frac = min(sc["max_pct_of_balance"], sc.get("risk_per_trade_pct", 1) / 100 / (plan["sl"] + 2 * COST_SIDE))
        return max(0.0, min(self.equity() * frac, (liq or 0) * sc["max_pct_of_pool_liquidity"], self.kv("cash")))

    def blocked(self, mint):
        L = self.cfg["limits"]
        now = time.time()
        with self.lock:
            c = self.coins.get(mint) or {}
        if c.get("safety") == "dead":
            return "safety: " + (c.get("safety_why") or "failed")
        if c.get("safety") != "pass":
            return "safety check still running" if c.get("enriching") or not c.get("checks") else "safety check could not run"
        if self.q("SELECT id FROM pos WHERE mint=? AND status='open'", (mint,)):
            return "already holding it: no averaging down"
        stopped = self.q("SELECT exit_ts FROM pos WHERE mint=? AND status='closed' AND pnl<0 AND exit_ts>=?",
                         (mint, now - L["no_reentry_after_stop_hours"] * 3600))
        if stopped:
            return f"lost on this coin {int((now - stopped[0]['exit_ts']) / 60)} min ago: no re-entry for {L['no_reentry_after_stop_hours']} h"
        if len(self.q("SELECT id FROM pos WHERE status='open'")) >= L["max_open_positions"]:
            return f"{L['max_open_positions']} positions open"
        last = self.q("SELECT exit_ts FROM pos WHERE status='closed' AND pnl<0 ORDER BY exit_ts DESC LIMIT 1")
        if last and now - last[0]["exit_ts"] < L["cooldown_after_loss_min"] * 60:
            return f"cooldown after a loss: {int(L['cooldown_after_loss_min'] - (now - last[0]['exit_ts']) / 60)} min"
        day0 = now - now % 86400
        closed = self.q("SELECT SUM(pnl) s FROM pos WHERE status='closed' AND exit_ts>=?", (day0,))[0]["s"] or 0
        if closed / self.cfg["start_balance_usd"] * 100 <= L["daily_loss_stop_pct"]:
            return "daily loss stop hit"
        return None

    def buy(self, mint, plan_key):
        with self.tlock:
            return self._buy(mint, plan_key)

    def _buy(self, mint, plan_key):
        plan = PLANS.get(plan_key)
        if not plan:
            return dict(error="unknown plan")
        why = self.blocked(mint)
        if why:
            return dict(error=why)
        pairs = S.ds_tokens("solana", [mint])
        p = main_pair(pairs, mint)
        if not p or not f(p.get("priceUsd")):
            return dict(error="no live price")
        px, liq = f(p.get("priceUsd")), f((p.get("liquidity") or {}).get("usd"))
        size = self.size_for(plan, liq)
        if size < 5:
            return dict(error="size under $5")
        fill = px * (1 + size / liq if liq else 1)
        st = ExitState(plan, fill, int(time.time()))
        self.set_kv("cash", self.kv("cash") - size)
        with self.lock:
            c = self.coins.get(mint, {})
        pid = self.x("INSERT INTO pos (mint, symbol, plan, entry_ts, entry, size, cost, liq, state, last, peak, status, source) "
                     "VALUES (?,?,?,?,?,?,?,?,?,?,?, 'open', ?)",
                     (mint, (p.get("baseToken") or {}).get("symbol"), plan_key, int(time.time()), fill, size * (1 - COST_SIDE), size, liq,
                      json.dumps(dict(stop=st.stop, peak=st.peak, armed=st.armed, left=1.0, fills=[], done=False)), fill, fill,
                      ",".join(c.get("sources", []))))
        self.add(mint, "position")
        return dict(ok=True, id=pid, fill=fill, size=size)

    def sell(self, p, px, liq, frac, why):
        notional = p["size"] * frac * px / p["entry"]
        proceeds = notional * (1 - min(notional / liq, 1) if liq else 1) * (1 - COST_SIDE)
        self.set_kv("cash", self.kv("cash") + proceeds)
        return proceeds

    def manage(self):
        while not self.stop.is_set():
            ops = self.q("SELECT * FROM pos WHERE status='open'")
            if ops:
                try:
                    pairs = S.ds_tokens("solana", list({p["mint"] for p in ops}))
                except Exception:
                    pairs = None
                for p in ops:
                    try:
                        if pairs is None:
                            continue
                        q = main_pair([x for x in pairs if (x.get("baseToken") or {}).get("address") == p["mint"]], p["mint"]) or {}
                        px, liq = f(q.get("priceUsd")), f((q.get("liquidity") or {}).get("usd"))
                        if px:
                            self.tick(p["id"], px, liq)
                        elif time.time() - p["entry_ts"] > PLANS[p["plan"]]["tmax"] * 60 + 600:
                            # no price for 10 min past the time limit: the coin stopped trading
                            self.tick(p["id"], 0.0, 0.0, manual=1.0, why="no price after the time limit (counted as lost)")
                    except Exception:
                        pass
            self.stop.wait(4)

    def tick(self, pid, px, liq, manual=None, why="sold by you"):
        with self.tlock:
            rows = self.q("SELECT * FROM pos WHERE id=? AND status='open'", (pid,))   # fresh row: never act on a stale copy
            if not rows:
                return False
            self._tick(rows[0], px, liq, manual, why)
            return True

    def _tick(self, p, px, liq, manual, manual_why):
        plan = PLANS[p["plan"]]
        raw = json.loads(p["state"])
        st = ExitState(plan, p["entry"], p["entry_ts"])
        st.stop, st.peak, st.armed, st.left, st.done = raw["stop"], raw["peak"], raw["armed"], raw["left"], raw["done"]
        st.fills = [tuple(x) for x in raw["fills"]]
        if manual:
            fills = [st._sell(st.left * manual, px, manual_why)]
        else:
            fills = st.bar(int(time.time()), px, px, px, px)
            if liq is not None and p["liq"] and liq < p["liq"] * 0.5 and not st.done:
                fills = [st._sell(st.left, px, "liquidity pulled")]
        got = p["proceeds"] or 0
        for frac, fpx, why in fills:
            got += self.sell(p, fpx, liq, frac, why)
        state = json.dumps(dict(stop=st.stop, peak=st.peak, armed=st.armed, left=st.left, fills=st.fills, done=st.done))
        if st.done:
            pnl = got - p["cost"]
            self.x("UPDATE pos SET state=?, last=?, peak=?, status='closed', exit_ts=?, exit_px=?, why=?, proceeds=?, pnl=?, ret=? WHERE id=?",
                   (state, px, st.peak, int(time.time()), px, fills[-1][2], got, pnl, pnl / p["cost"], p["id"]))
        else:
            self.x("UPDATE pos SET state=?, last=?, peak=?, proceeds=? WHERE id=?", (state, px, st.peak, got, p["id"]))

    # ---------------------------------------------------------------- API payloads
    def state(self, view):
        now = time.time()
        rows = []
        with self.lock:
            for c in self.coins.values():
                if not c.get("price"):
                    continue
                tags, age_h = self.tag(c, now)
                if view == "setups" and "setup" not in tags:
                    continue
                if view == "calls" and "call" not in tags:
                    continue
                if view == "new" and (age_h is None or age_h > 1):
                    continue
                if view == "all" and (c.get("vol_h1") or 0) < 5000 and "call" not in tags:
                    continue
                if age_h is not None and age_h > 24 * 7 and "call" not in tags and "position" not in c["sources"]:
                    continue
                below, _ = self.live_range(c)
                rows.append(dict(mint=c["mint"], symbol=c.get("symbol"), image=c.get("image"), age_h=age_h, mcap=c.get("mcap"),
                                 liq=c.get("liq"), vol_h1=c.get("vol_h1"), vol_m5=c.get("vol_m5"), chg_m5=c.get("chg_m5"),
                                 chg_h1=c.get("chg_h1"), buys_h1=c.get("buys_h1"), sells_h1=c.get("sells_h1"),
                                 below_high=below, safety=c.get("safety"), safety_why=c.get("safety_why"),
                                 tags=tags, call_ts=c.get("call_ts"), sources=c["sources"]))
        rows.sort(key=lambda r: ("setup" not in r["tags"], "call" not in r["tags"], -(r["vol_h1"] or 0)))
        with self.lock:
            n_setups = sum(1 for c in self.coins.values() if c.get("price") and "setup" in self.tag(c, now)[0])
        launches = sum(1 for t, k in self.flow if k == "launch" and t > now - 900)
        grads = sum(1 for t, k in self.flow if k == "graduation" and t > now - 900)
        ops = []
        for p in self.q("SELECT * FROM pos WHERE status='open' ORDER BY entry_ts DESC"):
            st = json.loads(p["state"])
            ops.append(dict(id=p["id"], mint=p["mint"], symbol=p["symbol"], plan=PLANS[p["plan"]]["name"], entry=p["entry"], last=p["last"],
                            ret=(p["last"] / p["entry"] - 1) if p["last"] else 0, value=p["size"] * st["left"] * (p["last"] or p["entry"]) / p["entry"],
                            stop=st["stop"], peak=p["peak"], armed=st["armed"], left=st["left"], tp=(PLANS[p["plan"]]["tp"] or 0) * p["entry"] or None,
                            ends=p["entry_ts"] + PLANS[p["plan"]]["tmax"] * 60))
        closed = self.q("SELECT id, symbol, plan, ret, pnl, why, exit_ts FROM pos WHERE status='closed' ORDER BY exit_ts DESC LIMIT 30")
        for c in closed:
            c["plan"] = PLANS.get(c["plan"], {}).get("name", c["plan"])
        stats = self.q("SELECT COUNT(*) n, SUM(pnl>0) w, SUM(pnl) s FROM pos WHERE status='closed'")[0]
        return dict(ts=now, feeds=self.feeds, sol=self.sol, launches_h=launches * 4, grads_h=grads * 4, n_setups=n_setups,
                    tracked=len(self.coins), coins=rows[:150], calls=self.calls[:25], cash=self.kv("cash"), equity=self.equity(),
                    start=self.cfg["start_balance_usd"], positions=ops, closed=closed, stats=stats,
                    plans={k: v["name"] for k, v in PLANS.items()}, mode=self.cfg["mode"])

    def coin(self, mint, tf):
        with self.lock:
            c = dict(self.coins.get(mint) or {})
        if not c:
            self.add(mint, "search")
            c = dict(self.coins[mint])
        if not c.get("pair"):
            try:
                pairs = S.ds_tokens("solana", [mint])
                p = main_pair(pairs, mint)
                if p:
                    with self.lock:
                        self.coins[mint].update(pair=p.get("pairAddress"), price=f(p.get("priceUsd")), symbol=(p.get("baseToken") or {}).get("symbol"),
                                                created=min((q.get("pairCreatedAt") or 1e16) for q in pairs) / 1000,
                                                liq=f((p.get("liquidity") or {}).get("usd")), mcap=f(p.get("marketCap")) or f(p.get("fdv")),
                                                url=p.get("url"))
                        c = dict(self.coins[mint])
            except Exception:
                pass
        if not c.get("checks") and not c.get("enriching") and c.get("pair"):
            # safety and the 24 h range take a few seconds (dev funding trace): run them in the background
            with self.lock:
                self.coins[mint]["enriching"] = True

            def run():
                try:
                    self.enrich_one(mint)
                finally:
                    with self.lock:
                        if mint in self.coins:
                            self.coins[mint]["enriching"] = False
            threading.Thread(target=run, daemon=True).start()
        with self.lock:
            if mint in self.coins:
                self.coins[mint]["viewed"] = time.time()
        c["below_high"], c["above_low"] = self.live_range(c)
        out = dict(coin=c, candles=[], trades=[], pools=[])
        if c.get("pair"):
            agg = {"1m": ("minute", 1, 240), "5m": ("minute", 5, 288), "15m": ("minute", 15, 200), "1h": ("hour", 1, 168)}[tf]
            try:
                d = S.get_json(f"{GT}/pools/{c['pair']}/ohlcv/{agg[0]}?aggregate={agg[1]}&limit={agg[2]}&currency=usd&token={mint}", ttl=20)
                out["candles"] = sorted(b for b in d["data"]["attributes"]["ohlcv_list"]
                                        if len(b) >= 6 and all(v is not None for v in b[:6]))   # the chart rejects gaps
            except Exception as e:
                out["candles_error"] = str(e)
            try:
                d = S.get_json(f"{GT}/pools/{c['pair']}/trades?trade_volume_in_usd_greater_than=0", ttl=10)
                for t in (d.get("data") or [])[:40]:
                    a = t["attributes"]
                    out["trades"].append(dict(ts=a.get("block_timestamp"), side=a.get("kind"), usd=f(a.get("volume_in_usd")),
                                              wallet=a.get("tx_from_address"), price=f(a.get("price_to_in_usd") if a.get("kind") == "buy" else a.get("price_from_in_usd"))))
            except Exception:
                pass
        with self.lock:
            out["calls"] = [x for x in self.calls if x["mint"] == mint]
        tags, age_h = self.tag(c, time.time()) if c.get("price") else ([], None)
        out.update(tags=tags, age_h=age_h)
        plan_key = "call" if "call" in c.get("sources", []) else "fresh"
        out["ticket"] = {k: dict(name=v["name"], size=self.size_for(v, c.get("liq")), sl=v["sl"], tp=v["tp"], arm=v["arm"], trail=v["trail"],
                                 tmax=v["tmax"]) for k, v in PLANS.items()}
        out["default_plan"] = plan_key
        out["blocked"] = self.blocked(mint)
        return out


# ---------------------------------------------------------------- HTTP
def make_handler(app, page, password=None):
    static = os.path.join(HERE, "static")
    want = "Basic " + base64.b64encode(f"trench:{password}".encode()).decode() if password else None

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *a):
            pass

        def authorized(self):
            if not want or self.headers.get("Authorization") == want:
                return True
            self.send_response(401)
            self.send_header("WWW-Authenticate", 'Basic realm="Trench"')
            self.end_headers()
            return False

        def send(self, code, body, ctype="application/json"):
            data = body if isinstance(body, bytes) else json.dumps(body, default=str).encode()
            self.send_response(code)
            self.send_header("Content-Type", ctype)
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(data)

        def do_GET(self):
            if not self.authorized():
                return
            u = urllib.parse.urlparse(self.path)
            qs = urllib.parse.parse_qs(u.query)
            try:
                if u.path in ("/", "/index.html"):
                    return self.send(200, open(page, "rb").read(), "text/html; charset=utf-8")
                if u.path == "/static/lightweight-charts.js":
                    return self.send(200, open(os.path.join(static, "lightweight-charts.js"), "rb").read(), "text/javascript")
                if u.path == "/api/state":
                    return self.send(200, app.state(qs.get("view", ["all"])[0]))
                if u.path == "/api/coin":
                    mint = qs.get("mint", [""])[0].strip()
                    if not CA_RE.fullmatch(mint):
                        return self.send(400, dict(error="not a Solana mint"))
                    return self.send(200, app.coin(mint, qs.get("tf", ["5m"])[0] if qs.get("tf", ["5m"])[0] in ("1m", "5m", "15m", "1h") else "5m"))
                return self.send(404, dict(error="not found"))
            except Exception as e:
                return self.send(500, dict(error=f"{type(e).__name__}: {e}"))

        def do_POST(self):
            if not self.authorized():
                return
            u = urllib.parse.urlparse(self.path)
            try:
                n = min(int(self.headers.get("Content-Length") or 0), 10000)
                body = json.loads(self.rfile.read(n) or b"{}")
                if not isinstance(body, dict):
                    raise ValueError("body must be a JSON object")
            except Exception:
                return self.send(400, dict(error="bad request"))
            try:
                if u.path == "/api/buy":
                    return self.send(200, app.buy(str(body.get("mint", "")), str(body.get("plan", ""))))
                if u.path == "/api/sell":
                    p = app.q("SELECT * FROM pos WHERE id=? AND status='open'", (int(body.get("id", 0)),))
                    if not p:
                        return self.send(200, dict(error="no such open position"))
                    pairs = S.ds_tokens("solana", [p[0]["mint"]])
                    q = main_pair(pairs, p[0]["mint"]) or {}
                    px = f(q.get("priceUsd"))
                    if not px:
                        return self.send(200, dict(error="no live price"))
                    done = app.tick(p[0]["id"], px, f((q.get("liquidity") or {}).get("usd")), manual=min(1.0, max(0.1, float(body.get("frac", 1)))))
                    return self.send(200, dict(ok=True) if done else dict(error="position already closed"))
                return self.send(404, dict(error="not found"))
            except Exception as e:
                return self.send(500, dict(error=f"{type(e).__name__}: {e}"))
    return Handler


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=8790)
    ap.add_argument("--host", default="127.0.0.1")
    ap.add_argument("--password", default=os.environ.get("TRENCH_PASSWORD"),
                    help="ask for this password (user name: trench); use it with --host 0.0.0.0")
    a = ap.parse_args()
    try:
        req = urllib.request.Request("https://api.dexscreener.com/token-profiles/latest/v1", headers=S.UA)
        urllib.request.urlopen(req, timeout=15).read(1)
    except Exception as e:
        if isinstance(getattr(e, "reason", None), ssl.SSLCertVerificationError) or "CERTIFICATE_VERIFY_FAILED" in str(e):
            sys.exit("Python can't verify HTTPS certificates on this computer.\n"
                     "On a Mac: open Applications > Python 3.x and double-click 'Install Certificates.command', then start Trench again.")
        print(f"Warning: can't reach DexScreener yet ({e}). Check the internet connection; Trench keeps trying.", flush=True)
    if a.host not in ("127.0.0.1", "localhost") and not a.password:
        print("Warning: Trench is open to your network with no password. Add --password <something>.", flush=True)
    cfg = load_config()
    if cfg["mode"] not in ("paper", "manual"):
        sys.exit("mode must be paper or manual")
    os.makedirs(os.path.join(HERE, "data"), exist_ok=True)
    app = App(cfg)
    for t in (app.pumpportal, app.discovery, app.telegram, app.refresh, app.enrich, app.manage):
        threading.Thread(target=t, daemon=True).start()
    srv = ThreadingHTTPServer((a.host, a.port), make_handler(app, os.path.join(HERE, "trench_app.html"), a.password))
    print(f"Trench on http://{'127.0.0.1' if a.host in ('0.0.0.0', '') else a.host}:{a.port}  (Ctrl+C to stop)", flush=True)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        app.stop.set()


if __name__ == "__main__":
    main()
