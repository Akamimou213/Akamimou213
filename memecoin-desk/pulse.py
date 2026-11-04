"""Market pulse: how busy the trenches are right now.

  python3 pulse.py --minutes 15 --out data/pulse.json

Listens to PumpPortal for N minutes and counts every pump.fun / LaunchLab launch and every
graduation, then adds SOL price and the current trending board (GeckoTerminal) and the
DexScreener boost board. Read-only; no keys.
"""
import argparse
import collections
import json
import os
import sys
import threading
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from core import S, f  # noqa: E402
from wsclient import WebSocket  # noqa: E402

SOL = "So11111111111111111111111111111111111111112"


def listen(minutes):
    counts = collections.Counter()
    per_min = collections.Counter()
    first_buys, mcaps, grads = [], [], []
    stop = time.time() + minutes * 60
    while time.time() < stop:
        try:
            ws = WebSocket("wss://pumpportal.fun/api/data")
            ws.send_json({"method": "subscribeNewToken"})
            ws.send_json({"method": "subscribeMigration"})
            ws.sock.settimeout(30)
            while time.time() < stop:
                m = json.loads(ws.recv())
                if m.get("message"):
                    continue
                minute = int(time.time() // 60)
                if m.get("txType") == "create":
                    pool = m.get("pool") or "pump"
                    counts[f"launch:{pool}"] += 1
                    per_min[minute] += 1
                    if f(m.get("solAmount")) is not None:
                        first_buys.append(f(m.get("solAmount")))
                    if f(m.get("marketCapSol")) is not None and pool == "pump":
                        mcaps.append(f(m.get("marketCapSol")))
                elif m.get("mint"):
                    counts[f"graduation:{m.get('pool') or 'amm'}"] += 1
                    grads.append(dict(mint=m["mint"], pool=m.get("pool"), ts=int(time.time())))
            ws.close()
        except Exception as e:  # reconnect
            counts["reconnects"] += 1
            time.sleep(2)
    return counts, per_min, first_buys, mcaps, grads


def board():
    out = {}
    try:
        p = S.ds_tokens("solana", [SOL])
        usdc = [x for x in p if (x.get("quoteToken") or {}).get("symbol") in ("USDC", "USDT")]
        best = max(usdc or p, key=lambda x: f((x.get("liquidity") or {}).get("usd"), 0))
        out["sol_usd"] = f(best.get("priceUsd"))
        out["sol_change_24h"] = f((best.get("priceChange") or {}).get("h24"))
    except Exception as e:
        out["sol_error"] = str(e)
    try:
        rows = []
        for p in S.gt_trending("solana", "1h")[:15]:
            a = p["attributes"]
            rows.append(dict(name=a.get("name"), pool=a.get("address"), mcap=f(a.get("market_cap_usd")) or f(a.get("fdv_usd")),
                             liq=f(a.get("reserve_in_usd")), vol_h1=f((a.get("volume_usd") or {}).get("h1")),
                             chg_h1=f((a.get("price_change_percentage") or {}).get("h1")),
                             chg_h24=f((a.get("price_change_percentage") or {}).get("h24")),
                             created=a.get("pool_created_at")))
        out["trending"] = rows
    except Exception as e:
        out["trending_error"] = str(e)
    try:
        b = S.ds_boosts_top() or []
        out["boosts_top_solana"] = sum(1 for x in b if x.get("chainId") == "solana")
    except Exception:
        pass
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--minutes", type=float, default=15)
    ap.add_argument("--out", default=os.path.join(HERE, "data", "pulse.json"))
    a = ap.parse_args()
    t0 = time.time()
    counts, per_min, buys, mcaps, grads = listen(a.minutes)
    mins = max((time.time() - t0) / 60, 1e-9)
    launches = sum(v for k, v in counts.items() if k.startswith("launch:"))
    gradn = sum(v for k, v in counts.items() if k.startswith("graduation:"))
    pulse = dict(ts=int(time.time()), minutes=round(mins, 1), launches=launches, launches_per_hour=round(launches / mins * 60),
                 graduations=gradn, graduations_per_hour=round(gradn / mins * 60),
                 graduation_rate_pct=round(gradn / launches * 100, 2) if launches else None,
                 by_type={k: v for k, v in counts.items()},
                 median_dev_buy_sol=sorted(buys)[len(buys) // 2] if buys else None,
                 dev_buy_over_1_sol_pct=round(sum(1 for b in buys if b >= 1) / len(buys) * 100, 1) if buys else None,
                 graduated=grads[-20:], **board())
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    json.dump(pulse, open(a.out, "w"), indent=1)
    print(json.dumps({k: v for k, v in pulse.items() if k not in ("trending", "graduated")}, indent=1))


if __name__ == "__main__":
    main()
