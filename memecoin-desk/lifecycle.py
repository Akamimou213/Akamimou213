"""How young memecoins move: lifecycle statistics from 1-minute candles (data/candles from backtest.py).

  python3 lifecycle.py [--out data/lifecycle.json]

For every pool with candles from its first minute: peak multiple and time to peak, the fall after the
peak, where price sits 1 h / 6 h / 24 h later, how volume is spread over the first hours, the ladder
(given 2x, how often 3x, 5x, 10x), and launch hour. Prices use candle bodies (open/close), not wicks.
"""
import argparse
import calendar
import json
import os
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from backtest import CDIR, dense  # noqa: E402


def q(xs, p):
    xs = sorted(xs)
    if not xs:
        return None
    k = (len(xs) - 1) * p
    lo, hi = int(k), min(int(k) + 1, len(xs) - 1)
    return xs[lo] + (xs[hi] - xs[lo]) * (k - lo)


def pools():
    out = []
    for fn in sorted(os.listdir(CDIR)):
        d = json.load(open(os.path.join(CDIR, fn)))
        cr = d["meta"].get("created")
        if not cr:
            continue
        cr = calendar.timegm(time.strptime(cr[:19], "%Y-%m-%dT%H:%M:%S"))
        c = dense(d["candles"])
        if len(c) < 60 or c[0][0] - cr > 600:      # need the first 10 minutes
            continue
        out.append(dict(name=d["meta"]["name"], dex=d["meta"]["dex"], created=cr, c=c))
    return out


def study(ps):
    rows = []
    for p in ps:
        c = p["c"]
        t0 = c[0][0]
        p0 = c[0][4] or c[0][1]
        if not p0:
            continue
        body = [max(r[1], r[4]) for r in c]
        end_t = c[-1][0]

        def at(minutes):
            t = t0 + minutes * 60
            if end_t < t:
                return None
            for r in c:
                if r[0] >= t:
                    return r[4] / p0
            return None
        w6 = [i for i, r in enumerate(c) if r[0] - t0 <= 6 * 3600]
        hi_i = max(w6, key=lambda i: body[i])
        peak = body[hi_i] / p0
        after = [r[4] for r in c[hi_i:]]
        fall = min(after) / body[hi_i] - 1 if after else None
        vol = [r[5] for r in c]
        v6 = sum(v for r, v in zip(c, vol) if r[0] - t0 <= 6 * 3600) or 1
        share = lambda m: sum(v for r, v in zip(c, vol) if r[0] - t0 <= m * 60) / v6  # noqa: E731
        # drawdowns on the way up: deepest dip below the running high before the peak
        run_hi, dip = 0, 0.0
        for r in c[:hi_i + 1]:
            run_hi = max(run_hi, max(r[1], r[4]))
            dip = min(dip, min(r[1], r[4]) / run_hi - 1 if run_hi else 0)
        rows.append(dict(name=p["name"], dex=p["dex"], hour=time.gmtime(p["created"]).tm_hour, peak6=peak,
                         t_peak_min=(c[hi_i][0] - t0) / 60, fall_after_peak=fall, x1h=at(60), x6h=at(360), x24h=at(1440),
                         vol_first30=share(30), vol_first120=share(120), dip_before_peak=max(dip, -0.95),
                         hours=(end_t - t0) / 3600))
    return rows


def summarize(rows):
    n = len(rows)
    pk = [r["peak6"] for r in rows]

    def pct(cond, xs):
        xs = [x for x in xs if x is not None]
        return round(sum(1 for x in xs if cond(x)) / len(xs) * 100, 1) if xs else None
    ladder = {}
    for m in (1.5, 2, 3, 5, 10):
        ladder[f"{m:g}x"] = pct(lambda x: x >= m, pk)
    cond = {}
    for a, b in ((2, 3), (2, 5), (3, 5), (5, 10)):
        base = [x for x in pk if x >= a]
        cond[f"{b}x given {a}x"] = round(sum(1 for x in base if x >= b) / len(base) * 100, 1) if base else None
    by_hour = {}
    for lo, hi in ((0, 8), (8, 16), (16, 24)):
        g = [r["peak6"] for r in rows if lo <= r["hour"] < hi]
        by_hour[f"{lo:02d}-{hi:02d} UTC"] = dict(n=len(g), median_peak=round(q(g, 0.5), 2) if g else None,
                                                 pct_2x=pct(lambda x: x >= 2, g))
    return dict(
        pools=n,
        peak_multiple_first_6h=dict(p25=q(pk, .25), median=q(pk, .5), p75=q(pk, .75), p90=q(pk, .9), max=max(pk)),
        reached=ladder, ladder_conditional=cond,
        minutes_to_peak=dict(p25=q([r["t_peak_min"] for r in rows], .25), median=q([r["t_peak_min"] for r in rows], .5),
                             p75=q([r["t_peak_min"] for r in rows], .75)),
        peak_in_first_30_min_pct=pct(lambda x: x <= 30, [r["t_peak_min"] for r in rows]),
        fall_after_peak=dict(median=q([r["fall_after_peak"] for r in rows if r["fall_after_peak"] is not None], .5),
                             p25=q([r["fall_after_peak"] for r in rows if r["fall_after_peak"] is not None], .25)),
        deepest_dip_on_way_to_peak=dict(median=q([r["dip_before_peak"] for r in rows], .5),
                                        p25=q([r["dip_before_peak"] for r in rows], .25)),
        above_start_after=dict(h1=pct(lambda x: x > 1, [r["x1h"] for r in rows]), h6=pct(lambda x: x > 1, [r["x6h"] for r in rows]),
                               h24=pct(lambda x: x > 1, [r["x24h"] for r in rows])),
        median_multiple_after=dict(h1=q([r["x1h"] for r in rows if r["x1h"]], .5), h6=q([r["x6h"] for r in rows if r["x6h"]], .5),
                                   h24=q([r["x24h"] for r in rows if r["x24h"]], .5)),
        below_half_after_24h_pct=pct(lambda x: x < 0.5, [r["x24h"] for r in rows]),
        n_with_24h=sum(1 for r in rows if r["x24h"] is not None),
        volume_share=dict(first_30_min=q([r["vol_first30"] for r in rows], .5), first_2_h=q([r["vol_first120"] for r in rows], .5)),
        by_launch_hour=by_hour,
    )


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=os.path.join(HERE, "data", "lifecycle.json"))
    a = ap.parse_args()
    rows = [r for r in study(pools()) if r["hours"] >= 6]   # full 6-hour window only
    groups = {"bonding curve (pump.fun, starts ~$4-5k mcap)": [r for r in rows if r["dex"] == "pump-fun"],
              "graduated / AMM pools (PumpSwap, Raydium, Meteora)": [r for r in rows if r["dex"] != "pump-fun"]}
    s = dict(all=summarize(rows), **{k: summarize(v) for k, v in groups.items() if v})
    s["note"] = ("Universe = pools that reached >= $50k 24h volume (GeckoTerminal), so these describe coins that got "
                 "traction, not every launch. Live graduation rate from pulse.py gives the base rate.")
    json.dump(dict(summary=s, rows=rows), open(a.out, "w"), indent=1)
    print(json.dumps(s, indent=1))


if __name__ == "__main__":
    main()
