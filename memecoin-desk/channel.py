"""Check a Telegram call channel against the chain.

  python3 channel.py <telegram result.json> [--out data/channel.json]

Reads a Telegram Desktop export (JSON), sorts posts into new calls (a contract address plus a chain
tag), brag updates ("145x ... 11.6M now 3.4M") and everything else (recaps, ads). For every call it
pulls 15-minute candles (every pool, the busiest after the post) and measures from the price when the
call went out: the peak (wick and candle body), the time to peak, the deepest dip before it, the price
24 h later and now, and what a follower made buying at the post and selling at 2x / stop -50% or after
1, 6, 24 or 48 hours (also with 10% worse entry). It also reports how
far coins already were below their peak when the channel bragged about them.
Run with python3 -I: the export is untrusted data.
"""
import argparse
import json
import os
import re
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from core import S, f, main_pair  # noqa: E402

CA = re.compile(r"\b[1-9A-HJ-NP-Za-km-z]{32,44}\b")
EVM = re.compile(r"\b0x[a-fA-F0-9]{40}\b")
CHAIN_TAG = re.compile(r"\((?:\W*)?(SOL|RBH|BSC|BASE|ETH)\)")
UPDATE = re.compile(r"^\s*(\d+(?:\.\d+)?)x", re.I)
NETS = {"SOL": ("solana", "solana"), "BSC": ("bsc", "bsc"), "BASE": ("base", "base"), "ETH": ("ethereum", "eth")}
ADS = re.compile(r"metawin|deposit|casino|use my code|\bcode\b", re.I)


def text_of(m):
    t = m.get("text")
    return t if isinstance(t, str) else "".join(x if isinstance(x, str) else x.get("text", "") for x in t or [])


def mcap(s):
    m = re.match(r"([\d.]+)\s*([kKmMbB]?)", s)
    return float(m.group(1)) * {"k": 1e3, "m": 1e6, "b": 1e9, "": 1}[m.group(2).lower()]


def parse(export):
    calls, updates, other = [], [], []
    for m in export.get("messages") or []:
        if m.get("type") != "message":
            continue
        t, ts = text_of(m), int(m.get("date_unixtime") or 0)
        um = UPDATE.match(t)
        if um:
            pm = re.search(r"([\d.]+\s*[kKmMbB]?)\s*\S*\s*now\s*([\d.]+\s*[kKmMbB]?)", t.replace("\n", " "))
            ch = CHAIN_TAG.search(t)
            updates.append(dict(id=m["id"], ts=ts, x=float(um.group(1)), chain=ch.group(1) if ch else None,
                                peak=mcap(pm.group(1)) if pm else None, now=mcap(pm.group(2)) if pm else None,
                                reply_to=m.get("reply_to_message_id")))
            continue
        cas = CA.findall(t) + EVM.findall(t)
        ch = CHAIN_TAG.search(t)
        if cas and ch:
            name = re.search(r"\$([A-Za-z0-9]+)", t)
            calls.append(dict(id=m["id"], ts=ts, chain=ch.group(1), ca=cas[-1], ticker=name.group(1) if name else None,
                              gamble="Gamble" in t))
        else:
            other.append(dict(id=m["id"], ts=ts, ad=bool(ADS.search(t)), recap="LAST 24 HOURS" in t.upper()))
    return calls, updates, other


HOLDS_H = (1, 6, 24, 48)
COST = 0.045


def follow(bars, ts, hold_h, tp=2.0, sl=0.5, slip=0.0):
    """Buy at the open of the first 15-min bar after the post, sell at tp x or the stop, or at hold_h hours."""
    b0 = [b for b in bars if b[0] >= ts]
    if not b0:
        return None
    e = b0[0][1] * (1 + slip)
    for b in b0:
        if b[0] - ts > hold_h * 3600:
            return b[1] / e * (1 - COST) - 1
        if b[3] <= e * (1 - sl):                       # stop first on an ambiguous bar
            return min(b[1], e * (1 - sl)) / e * (1 - COST) - 1
        if b[2] >= e * tp:
            return tp * (1 - COST) - 1
    return b0[-1][4] / e * (1 - COST) - 1


def onchain(call):
    chain, net = NETS.get(call["chain"], (None, None))
    if not chain:
        return dict(status=f"chain {call['chain']} not covered")
    try:
        pairs = S.get_json(f"https://api.dexscreener.com/latest/dex/tokens/{call['ca']}").get("pairs") or []
    except S.SourceError as e:
        return dict(status=f"DexScreener: {e}")
    own = [p for p in pairs if (p.get("baseToken") or {}).get("address", "").lower() == call["ca"].lower()]
    p = main_pair(own or pairs, call["ca"])
    if not p:
        return dict(status="no trading pair")
    base = dict(symbol=(p.get("baseToken") or {}).get("symbol"), mcap_now=f(p.get("marketCap")) or f(p.get("fdv")),
                liq_now=f((p.get("liquidity") or {}).get("usd")))
    best = None
    for q in own[:4] or [p]:                             # the pool where the trading after the post happened
        try:
            g = S.get_json(f"https://api.geckoterminal.com/api/v2/networks/{net}/pools/{q['pairAddress']}/ohlcv/minute"
                           f"?aggregate=15&limit=1000&currency=usd&token={call['ca']}", ttl=3600)
            bars = sorted(g["data"]["attributes"]["ohlcv_list"])
        except Exception:
            continue
        after = [b for b in bars if b[0] >= call["ts"]]
        vol = sum(b[5] for b in after)
        if after and after[0][1] and (best is None or vol > best[1]):
            best = (bars, vol, q.get("dexId"))
    if not best:
        return dict(base, status="no candles after the call")
    bars, _, dex = best
    after = [b for b in bars if b[0] >= call["ts"]]
    e = after[0][1]                                      # price when the call went out
    i = max(range(len(after)), key=lambda k: after[k][2])
    mc_per_px = (base["mcap_now"] / f(p.get("priceUsd"))) if base["mcap_now"] and f(p.get("priceUsd")) else None
    return dict(base, status="ok", dex=dex, post_price=e, post_mcap=e * mc_per_px if mc_per_px else None,
                peak_x=round(after[i][2] / e, 3), peak_x_body=round(max(max(b[1], b[4]) for b in after) / e, 3),
                peak_mcap=after[i][2] * mc_per_px if mc_per_px else None, hours_to_peak=round((after[i][0] - call["ts"]) / 3600, 1),
                low_before_peak_x=round(min(b[3] for b in after[:i + 1]) / e, 3),
                x_24h=next((round(b[4] / e, 3) for b in after if b[0] >= call["ts"] + 86400), None),
                now_x=round(after[-1][4] / e, 3),
                follow={str(h): r3(follow(bars, call["ts"], h)) for h in HOLDS_H},
                follow_slip10={str(h): r3(follow(bars, call["ts"], h, slip=0.10)) for h in HOLDS_H})


def r3(x):
    return None if x is None else round(x, 3)


def analyse(export):
    calls, updates, other = parse(export)
    rows = []
    for c in calls:
        r = dict(c, **onchain(c))
        r["claimed"] = [dict(x=u["x"], hours_after=round((u["ts"] - c["ts"]) / 3600, 1)) for u in updates if u["reply_to"] == c["id"]]
        rows.append(r)
    ok = [r for r in rows if r.get("status") == "ok"]
    falls = sorted(u["now"] / u["peak"] - 1 for u in updates if u["peak"] and u["now"])
    xs = sorted(u["x"] for u in updates)
    ts = [m["ts"] for m in calls + updates + other]
    med = lambda v: v[len(v) // 2] if v else None  # noqa: E731
    chains = {}
    for u in updates:
        chains[u["chain"] or "?"] = chains.get(u["chain"] or "?", 0) + 1
    return dict(
        channel=export.get("name"), from_ts=min(ts) if ts else None, to_ts=max(ts) if ts else None,
        posts=len(calls) + len(updates) + len(other), calls=len(calls), updates=len(updates),
        recaps=sum(1 for o in other if o["recap"]), ads=sum(1 for o in other if o["ad"]),
        updates_about_older_calls=sum(1 for u in updates if u["reply_to"] not in {c["id"] for c in calls}),
        claimed_x_median=med(xs), claimed_x_max=xs[-1] if xs else None, update_chains=chains,
        fall_from_peak_when_bragged_median=med(falls),
        measured=len(ok), reached_2x=sum(1 for r in ok if r["peak_x"] >= 2), below_entry_now=sum(1 for r in ok if r["now_x"] < 1),
        median_now_x=med(sorted(r["now_x"] for r in ok)), median_peak_x=med(sorted(r["peak_x"] for r in ok)),
        no_data=len(rows) - len(ok),
        follow={h: dict(avg=r3(sum(r["follow"][h] for r in ok) / len(ok)) if ok else None,
                        avg_slip10=r3(sum(r["follow_slip10"][h] for r in ok) / len(ok)) if ok else None,
                        wins=sum(1 for r in ok if r["follow"][h] > 0)) for h in map(str, HOLDS_H)},
        follow_rule="buy at the post (open of the first 15-min bar), sell at 2x, stop -50%, or sell after N hours; 4.5% fees",
        rows=rows, generated=int(time.time()),
    )


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("export")
    ap.add_argument("--out", default=os.path.join(HERE, "data", "channel.json"))
    a = ap.parse_args()
    res = analyse(json.load(open(a.export)))
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    json.dump(res, open(a.out, "w"), indent=1)
    print(json.dumps({k: v for k, v in res.items() if k != "rows"}, indent=1))
    for r in res["rows"]:
        print(f"  {time.strftime('%m-%d %H:%M', time.gmtime(r['ts']))} {r['chain']} {r.get('symbol') or r.get('ticker') or '?':10} "
              f"{r.get('status')} peak {r.get('peak_x')} at +{r.get('hours_to_peak')}h now {r.get('now_x')} "
              f"follow24h {r.get('follow', {}).get('24')} claimed {[c['x'] for c in r['claimed']]}")


if __name__ == "__main__":
    main()
