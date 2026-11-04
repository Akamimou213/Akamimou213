"""Trench on Vercel: the request logic every API function shares.

Each function is stateless: it fetches what it needs, answers, and lets Vercel's CDN cache the answer for a
few seconds (Cache-Control s-maxage), so many viewers share one fetch and the free APIs don't rate-limit us.
Paper trades live in the browser; nothing about the user is stored here.
"""
import calendar
import html as H
import json
import os
import re
import sys
import threading
import time
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler

LIB = os.path.dirname(os.path.abspath(__file__))
if LIB not in sys.path:
    sys.path.insert(0, LIB)

import risk as RK  # noqa: E402
from core import S, SR, f, load_config, main_pair  # noqa: E402

CFG = load_config(os.path.join(LIB, "config.json"))
# A function lives for one request: a short gap between GeckoTerminal calls is enough (429s are retried once).
S.MIN_INTERVAL["api.geckoterminal.com"] = 1.0
GT = "https://api.geckoterminal.com/api/v2/networks/solana"
QUOTES = {"So11111111111111111111111111111111111111112", "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCzBpVEJ4V"}
MINT_RE = re.compile(r"^[1-9A-HJ-NP-Za-km-z]{32,44}$")
CA_RE = re.compile(r"\b[1-9A-HJ-NP-Za-km-z]{32,44}\b")
ACTIVITY_CHECKS = {"vol"}


class BadRequest(Exception):
    pass


def make(fn, cache_s):
    """Wrap fn(query) -> dict into a Vercel Python handler with CDN caching."""
    class handler(BaseHTTPRequestHandler):
        def do_GET(self):
            q = {k: v[0] for k, v in urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query).items()}
            try:
                body, code, cache = fn(q), 200, cache_s
            except BadRequest as e:
                body, code, cache = dict(error=str(e)), 400, 0
            except Exception as e:  # an upstream API failed: say so, don't cache it
                body, code, cache = dict(error=f"{type(e).__name__}: {e}"), 502, 0
            data = json.dumps(body, default=str, allow_nan=False).encode()
            self.send_response(code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Cache-Control", f"public, s-maxage={cache}, stale-while-revalidate={cache * 3}" if cache else "no-store")
            self.end_headers()
            self.wfile.write(data)

        def log_message(self, *a):
            pass
    return handler


def mint_arg(q):
    m = (q.get("mint") or "").strip()
    if not MINT_RE.match(m):
        raise BadRequest("not a Solana mint")
    return m


def finite(x):
    return x if isinstance(x, (int, float)) and x == x and abs(x) != float("inf") else None


# ---------------------------------------------------------------- coin rows
def row(mint, ps, now):
    p = main_pair(ps, mint)
    if not p:
        return None
    tx1, tx5 = (p.get("txns") or {}).get("h1") or {}, (p.get("txns") or {}).get("m5") or {}
    pc = p.get("priceChange") or {}
    created = min((q.get("pairCreatedAt") or 1e16) for q in ps) / 1000
    info = p.get("info") or {}
    return dict(mint=mint, symbol=(p.get("baseToken") or {}).get("symbol"), name=(p.get("baseToken") or {}).get("name"),
                image=info.get("imageUrl"), price=f(p.get("priceUsd")), mcap=f(p.get("marketCap")) or f(p.get("fdv")),
                liq=SR.total_liquidity(ps, mint, "solana") or f((p.get("liquidity") or {}).get("usd")),
                vol_h1=sum(f((x.get("volume") or {}).get("h1"), 0) for x in ps), vol_m5=sum(f((x.get("volume") or {}).get("m5"), 0) for x in ps),
                buys_h1=tx1.get("buys"), sells_h1=tx1.get("sells"), buys_m5=tx5.get("buys"), sells_m5=tx5.get("sells"),
                chg_m5=f(pc.get("m5")), chg_h1=f(pc.get("h1")), chg_h6=f(pc.get("h6")), chg_h24=f(pc.get("h24")),
                age_h=(now - created) / 3600 if created < 1e12 else None, dex=p.get("dexId"), pair=p.get("pairAddress"),
                url=p.get("url"), boosts=(p.get("boosts") or {}).get("active"))


def prices(mints):
    by = {}
    for p in S.ds_tokens("solana", mints) or []:
        by.setdefault((p.get("baseToken") or {}).get("address"), []).append(p)
    return by


def radar(q):
    now = time.time()
    found = {}

    lock = threading.Lock()

    def add(m, src):
        if m and m not in QUOTES:
            with lock:
                found.setdefault(m, set()).add(src)
    def from_ds():
        for fn, src in ((S.ds_profiles_latest, "profile"), (S.ds_boosts_latest, "boost"), (S.ds_boosts_top, "boost")):
            try:
                for t in fn() or []:
                    if t.get("chainId") == "solana":
                        add(t.get("tokenAddress"), src)
            except Exception:
                pass

    def from_gt():
        for path, src in (("new_pools?page=1", "new pool"), ("trending_pools?duration=1h&page=1", "trending"),
                          ("dexes/pumpswap/pools?sort=h24_tx_count_desc&page=1", "graduated")):
            try:
                for p in (S.get_json(f"{GT}/{path}", ttl=20).get("data") or []):
                    base = ((p.get("relationships") or {}).get("base_token") or {}).get("data", {}).get("id", "")
                    if base.startswith("solana_"):
                        add(base[7:], src)
            except Exception:
                pass
    # the two hosts are fetched at the same time; each keeps its own rate limit
    workers = [threading.Thread(target=from_ds), threading.Thread(target=from_gt)]
    for w in workers:
        w.start()
    for w in workers:
        w.join()
    for extra in (q.get("also") or "").split(","):          # coins the viewer holds or called: always priced
        if MINT_RE.match(extra.strip()):
            add(extra.strip(), "yours")
    mints = list(found)[:180]
    by = prices(mints)
    rows = []
    for m in mints:
        r = row(m, by.get(m) or [], now)
        if r and r["price"]:
            r["sources"] = sorted(found[m])
            rows.append(r)
    sol = None
    try:
        sp = S.ds_tokens("solana", ["So11111111111111111111111111111111111111112"])
        usdc = [p for p in sp if (p.get("quoteToken") or {}).get("symbol") in ("USDC", "USDT")]
        b = max(usdc or sp, key=lambda p: f((p.get("liquidity") or {}).get("usd"), 0))
        sol = dict(price=f(b.get("priceUsd")), h24=f((b.get("priceChange") or {}).get("h24")))
    except Exception:
        pass
    rows.sort(key=lambda r: -(r["vol_h1"] or 0))
    return dict(ts=now, sol=sol, coins=rows)


# ---------------------------------------------------------------- safety + 24 h range
class RugCheckDev:
    """Dev check from RugCheck's own flags (no rug registry on a stateless host)."""

    def __init__(self, rc):
        self.flags = [r.get("name", "") for r in (rc or {}).get("risks") or []]

    def check(self, creator):
        bad = [x for x in self.flags if "rug" in x.lower() and "creator" in x.lower()]
        if bad:
            return False, "; ".join(bad)
        return True, "no rugged tokens in the creator's RugCheck history"


def range_from(bars, now=None):
    now = now or time.time()
    day = [b for b in bars if b[0] >= now - 86400 and b[1] and b[4]]
    if not day:
        return {}
    return dict(high24=max(max(b[1], b[4]) for b in day), low24=min(min(b[1], b[4]) for b in day))


def check(q):
    mint = mint_arg(q)
    out = dict(mint=mint, ts=time.time())
    pairs = S.ds_tokens("solana", [mint])
    p = main_pair(pairs, mint)
    if p:
        try:
            d = S.get_json(f"{GT}/pools/{p['pairAddress']}/ohlcv/minute?aggregate=15&limit=100&currency=usd&token={mint}", ttl=120)
            out.update(range_from(d["data"]["attributes"]["ohlcv_list"]))
        except Exception as e:
            out["range_error"] = "rate limited" if "429" in str(e) else str(e)
    try:
        rc = S.rugcheck_report(mint)
    except Exception as e:
        out.update(safety="unknown", safety_why=f"RugCheck unavailable ({e})")
        return out
    _, checks, facts = RK.evaluate(mint, pairs, rc, RugCheckDev(rc), CFG)
    fail = next((c for c in checks if not c["ok"] and c["id"] not in ACTIVITY_CHECKS), None)
    out.update(safety="dead" if fail else "pass", safety_why=f"{fail['label']}: {fail['value']}" if fail else None, checks=checks,
               top10=facts.get("top10_pct"), dev_pct=finite(facts.get("dev_pct")), holders=facts.get("holders"),
               insiders=facts.get("insider_wallets"), bundle=facts.get("bundle_pct"), lp=facts.get("lp"),
               top_holders=[dict(owner=h.get("owner"), pct=f(h.get("pct"))) for h in RK.top_holders_excl(rc)[:10]])
    return out


# ---------------------------------------------------------------- coin view
TF = {"1m": ("minute", 1, 240), "5m": ("minute", 5, 288), "15m": ("minute", 15, 200), "1h": ("hour", 1, 168)}


def coin(q):
    mint = mint_arg(q)
    tf = q.get("tf") if q.get("tf") in TF else "5m"
    now = time.time()
    pairs = S.ds_tokens("solana", [mint])
    r = row(mint, pairs, now)
    out = dict(coin=r, candles=[], trades=[], ts=now)
    if not r:
        out["candles_error"] = "no trading pool on DexScreener yet"
        return out
    a = TF[tf]
    try:
        d = S.get_json(f"{GT}/pools/{r['pair']}/ohlcv/{a[0]}?aggregate={a[1]}&limit={a[2]}&currency=usd&token={mint}", ttl=10)
        out["candles"] = sorted(b for b in d["data"]["attributes"]["ohlcv_list"] if len(b) >= 6 and all(v is not None for v in b[:6]))
    except Exception as e:
        out["candles_error"] = "GeckoTerminal is rate-limiting: retrying" if "429" in str(e) else "chart data unavailable"
    try:
        d = S.get_json(f"{GT}/pools/{r['pair']}/trades?trade_volume_in_usd_greater_than=0", ttl=10)
        for t in (d.get("data") or [])[:40]:
            x = t["attributes"]
            out["trades"].append(dict(ts=x.get("block_timestamp"), side=x.get("kind"), usd=f(x.get("volume_in_usd")), wallet=x.get("tx_from_address")))
    except Exception as e:
        out["trades_error"] = "GeckoTerminal is rate-limiting: retrying" if "429" in str(e) else "trades unavailable"
    return out


def price_batch(q):
    mints = [m for m in (q.get("mints") or "").split(",") if MINT_RE.match(m)][:30]
    if not mints:
        raise BadRequest("no mints")
    by = prices(mints)
    out = {}
    for m in mints:
        p = main_pair(by.get(m) or [], m)
        if p:
            out[m] = dict(price=f(p.get("priceUsd")), liq=f((p.get("liquidity") or {}).get("usd")), symbol=(p.get("baseToken") or {}).get("symbol"))
    return dict(ts=time.time(), prices=out)


def history(q):
    """1-minute candles since a time, so the browser can replay a position's exit plan after being closed."""
    mint = mint_arg(q)
    since = int(float(q.get("since") or 0))
    p = main_pair(S.ds_tokens("solana", [mint]), mint)
    if not p:
        return dict(candles=[])
    bars, before = [], int(time.time()) + 60
    for _ in range(3):                                         # up to ~50 hours
        d = S.get_json(f"{GT}/pools/{p['pairAddress']}/ohlcv/minute?aggregate=1&limit=1000&currency=usd&token={mint}&before_timestamp={before}", ttl=30)
        got = sorted(b for b in d["data"]["attributes"]["ohlcv_list"] if len(b) >= 6 and all(v is not None for v in b[:6]))
        if not got:
            break
        bars = got + bars
        if got[0][0] <= since:
            break
        before = got[0][0]
    return dict(candles=[b for b in bars if b[0] >= since - 60])


# ---------------------------------------------------------------- channel calls
def tg_get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 trench"})
    return urllib.request.urlopen(req, timeout=12).read().decode("utf-8", "replace")


def tg_posts(page):
    out = []
    for block in page.split('class="tgme_widget_message_wrap')[1:] or [page]:
        pid = (re.search(r'data-post="([^"]+)"', block) or [None, None])[1]
        tm = re.search(r'<time datetime="([^"]+)"', block)
        reply = re.search(r'<a class="tgme_widget_message_reply[^"]*" href="https://t.me/([^"?]+)"', block)
        own = re.sub(r'<a class="tgme_widget_message_reply[^"]*".*?</a>', "", block, flags=re.S)
        tx = re.search(r'<div class="tgme_widget_message_text[^"]*"[^>]*>(.*?)</div>', own, re.S)
        if pid and tm:
            text = re.sub(r"<[^>]+>", "", H.unescape(re.sub(r"<br\s*/?>", "\n", tx.group(1)))) if tx else ""
            out.append((pid, calendar.timegm(time.strptime(tm.group(1)[:19], "%Y-%m-%dT%H:%M:%S")), text, reply.group(1) if reply else None))
    return out


def calls(q):
    chans = [c for c in (q.get("ch") or ",".join(CFG.get("app", {}).get("channels", []))).split(",") if re.match(r"^[A-Za-z0-9_]{4,40}$", c)][:5]
    found, originals = {}, {}
    for ch in chans:
        try:
            page = tg_get(f"https://t.me/s/{ch}")
        except Exception:
            continue
        title = H.unescape((re.search(r"<title>(.*?)</title>", page) or [None, ch])[1]).replace(" – Telegram", "")
        posts = tg_posts(page)
        if posts:
            oldest = min(int(p[0].split("/")[-1]) for p in posts)
            try:
                posts += tg_posts(tg_get(f"https://t.me/s/{ch}?before={oldest}"))
            except Exception:
                pass
        for pid, ts, text, quoted in posts:
            brag = re.match(r"^\s*(\d+(?:\.\d+)?)x", text)
            src = (pid, ts, text)
            if brag and quoted:
                if quoted not in originals and len(originals) < 12:
                    try:
                        o = tg_posts(tg_get(f"https://t.me/{quoted}?embed=1&mode=tme"))
                        originals[quoted] = o[0] if o else None
                    except Exception:
                        originals[quoted] = None
                if not originals.get(quoted):
                    continue
                src = originals[quoted][:3]
            cas = [c for c in CA_RE.findall(src[2]) if not c.startswith("http")]
            chain = (re.search(r"\((?:\W*)?(SOL|RBH|BSC|BASE|ETH)\)", src[2]) or [None, None])[1]
            if not cas or chain != "SOL" or re.match(r"^\s*\d+(?:\.\d+)?x", src[2]):
                continue
            c = found.setdefault(src[0], dict(id=src[0], channel=title, ts=src[1], mint=cas[-1], text=src[2][:500], brags=[],
                                              ticker=(re.search(r"\$([A-Za-z0-9]+)", src[2]) or [None, None])[1]))
            if brag:
                c["brags"] = sorted(set(c["brags"] + [float(brag.group(1))]))
    return dict(ts=time.time(), calls=sorted(found.values(), key=lambda c: -c["ts"])[:40])
