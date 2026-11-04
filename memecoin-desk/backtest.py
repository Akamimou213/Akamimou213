"""Backtest entry gates x exit plans on recent Solana pools nobody hand-picked.

  python3 backtest.py fetch --pools 240        # 1-minute candles -> data/candles/ (cached, ~2 s per call)
  python3 backtest.py run                       # every gate x every exit plan, with 90% ranges and a time split

Method
  * Universe: the most-traded PumpSwap, pump.fun, Raydium and Meteora pools of the last 24 h plus the newest
    pools (GeckoTerminal). Includes rugs and dumps; only pools that traded at all are in it.
  * Signal at the close of minute t, from candles up to t only. Entry at the OPEN of minute t+1 (you are never
    instant). One position per pool at a time.
  * Exits on 1-minute candles, conservatively: inside a candle the stop is checked before the target, and the
    trailing stop uses the peak from earlier candles only. A stop fills at the stop or at the open if the candle
    gapped through it. Round-trip cost 4.5% (fees + slippage), as in the playbook.
  * No contract/holder filters here (history of holders isn't available); RISK only removes coins, so treat
    these numbers as the market the desk picks from.
"""
import argparse
import json
import math
import os
import random
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from core import S, f  # noqa: E402
from exits import ExitState  # noqa: E402

CDIR = os.path.join(HERE, "data", "candles")
GT = "https://api.geckoterminal.com/api/v2/networks/solana"
DEXES = ["pumpswap", "pump-fun", "raydium", "raydium-cp", "raydium-clmm", "meteora", "meteora-damm-v2"]
COST = 0.045


# ---------------------------------------------------------------- fetch
def universe(n):
    pools = {}
    for dex in DEXES:
        for page in range(1, 6):
            try:
                d = S.get_json(f"{GT}/dexes/{dex}/pools?sort=h24_tx_count_desc&page={page}", ttl=3600)
            except S.SourceError:
                break
            for p in d.get("data") or []:
                a = p["attributes"]
                base = ((p.get("relationships") or {}).get("base_token") or {}).get("data", {}).get("id", "")
                if base.endswith(("So11111111111111111111111111111111111111112", "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")):
                    continue
                pools[a["address"]] = dict(pool=a["address"], name=a["name"], dex=dex, created=a.get("pool_created_at"),
                                           vol24=f((a.get("volume_usd") or {}).get("h24"), 0))
            if len(pools) >= n * 2:
                break
    for page in range(1, 11):
        try:
            d = S.get_json(f"{GT}/new_pools?page={page}", ttl=3600)
        except S.SourceError:
            break
        for p in d.get("data") or []:
            a = p["attributes"]
            pools.setdefault(a["address"], dict(pool=a["address"], name=a["name"], dex="new", created=a.get("pool_created_at"),
                                                vol24=f((a.get("volume_usd") or {}).get("h24"), 0)))
    ranked = sorted(pools.values(), key=lambda x: -x["vol24"])
    return [p for p in ranked if p["vol24"] >= 50_000][:n]


def fetch(n, pages=2):
    os.makedirs(CDIR, exist_ok=True)
    pools = universe(n)
    print(f"universe: {len(pools)} pools with >= $50k 24h volume", flush=True)
    for i, p in enumerate(pools, 1):
        path = os.path.join(CDIR, p["pool"] + ".json")
        if os.path.exists(path):
            continue
        rows, before = [], None
        for _ in range(pages):
            url = f"{GT}/pools/{p['pool']}/ohlcv/minute?aggregate=1&limit=1000&currency=usd&token=base"
            if before:
                url += f"&before_timestamp={before}"
            try:
                d = S.get_json(url, ttl=10 ** 9)
            except S.SourceError as e:
                print(f"  {p['name']}: {e}", flush=True)
                break
            got = d.get("data", {}).get("attributes", {}).get("ohlcv_list") or []
            if not got:
                break
            rows += got
            before = min(r[0] for r in got)
            if len(got) < 1000:
                break
        if rows:
            json.dump(dict(meta=p, candles=sorted({r[0]: r for r in rows}.values())), open(path, "w"))
        if i % 20 == 0:
            print(f"  {i}/{len(pools)}", flush=True)


# ---------------------------------------------------------------- signals
def dense(c):
    """Fill missing minutes (no trades) with flat zero-volume candles."""
    out = []
    for r in c:
        if out:
            t, last = out[-1][0], out[-1][4]
            while r[0] - t > 60 and r[0] - t <= 3 * 3600:
                t += 60
                out.append([t, last, last, last, last, 0.0])
        out.append([r[0], f(r[1]), f(r[2]), f(r[3]), f(r[4]), f(r[5], 0)])
    return out


GATES = {
    "any minute, 1h vol >= $50k (desk filter only)": lambda s: s["v60"] >= 50_000,
    "random minute (baseline)": lambda s: True,
    "playbook gate: 30m vol >= $50k, 7-30% below 60m high": lambda s: s["v30"] >= 50_000 and 0.07 <= s["below"] <= 0.30,
    "gate + 00-08 UTC": lambda s: s["v30"] >= 50_000 and 0.07 <= s["below"] <= 0.30 and s["hour"] < 8,
    "A-setup: 30m vol >= $117k + pullback": lambda s: s["v30"] >= 117_000 and 0.07 <= s["below"] <= 0.30,
    "chasing: within 7% of 60m high, 30m vol >= $50k": lambda s: s["v30"] >= 50_000 and s["below"] < 0.07,
}


def states(c):
    """Rolling features at each minute close, from candles up to and including that minute."""
    v = [r[5] for r in c]
    pre = [0.0]
    for x in v:
        pre.append(pre[-1] + x)
    from collections import deque
    dq = deque()
    for i, r in enumerate(c):
        while dq and c[dq[-1]][2] <= r[2]:
            dq.pop()
        dq.append(i)
        while dq[0] <= i - 60:
            dq.popleft()
        if i < 60:
            yield i, None
            continue
        hi = c[dq[0]][2]
        yield i, dict(v30=pre[i + 1] - pre[i - 29], v60=pre[i + 1] - pre[i - 59], below=1 - r[4] / hi if hi else 0,
                      hour=time.gmtime(r[0]).tm_hour, ts=r[0])


# ---------------------------------------------------------------- exits
def _plans():
    cfg = json.load(open(os.path.join(HERE, "config.json")))
    seen, out = set(), []
    for p in [cfg["exit"]["plan"]] + cfg["exit"]["shadow_plans"] + [dict(name="hold 60 min, no stop", sl=0.999, tp=None,
                                                                         partial=None, arm=None, trail=None, tmax=60)]:
        if p["name"] not in seen:
            seen.add(p["name"])
            out.append(p)
    return out


PLANS = _plans()


def simulate(c, i, p):
    """Enter at the open of c[i]; return (net return, minutes held, reason). Uses the live exit engine."""
    entry = c[i][1]
    if not entry or entry <= 0:
        return None
    st = ExitState(p, entry, c[i][0])
    j = i
    for j in range(i, len(c)):
        t, o, h, l, cl = c[j][:5]
        body_hi, body_lo = max(o, cl), min(o, cl)
        # Targets and trails trigger on candle bodies only (thin-pool wicks can be 60x bad prints);
        # stops still see downside wicks, except prints more than 50% under the body.
        st.bar(t + 60, o, body_hi, max(l, body_lo * 0.5), cl)
        if st.done:
            break
    if not st.done:                           # ran out of data: mark at the last close
        st._sell(st.left, c[j][4], "end of data")
    return st.gross() * (1 - COST) - 1, j - i + 1, st.fills[-1][2]


MAX_AGE_H = 6   # the desk's nursery watches a token for its first 6 hours


def trades_for(series, gate, p, rng=None, sample=None, max_age_h=MAX_AGE_H):
    out = []
    for k, (created, c) in enumerate(series):
        busy_until = -1
        for i, s in states(c):
            if s is None or i + 1 >= len(c) or i < busy_until:
                continue
            if created is None or s["ts"] - created > max_age_h * 3600:
                continue
            if c[i][5] == 0 and c[i - 1][5] == 0:   # dead minute: no one to trade with
                continue
            if sample is not None and rng.random() > sample:
                continue
            if not gate(s):
                continue
            r = simulate(c, i + 1, p)
            if r is None:
                continue
            out.append(dict(ret=r[0], mins=r[1], why=r[2], ts=s["ts"], pool=k))
            busy_until = i + 1 + r[1] + 1
    return out


def stats(tr, seed=7):
    if not tr:
        return dict(n=0)
    rs = [t["ret"] for t in tr]
    n = len(rs)
    mean = sum(rs) / n
    rng = random.Random(seed)
    by_pool = {}
    for t in tr:
        by_pool.setdefault(t["pool"], []).append(t["ret"])
    groups = list(by_pool.values())
    boots = []
    for _ in range(800):          # resample whole pools: trades in one coin are not independent
        pick = [rng.choice(groups) for _ in groups]
        flat = [x for g in pick for x in g]
        boots.append(sum(flat) / len(flat))
    boots.sort()
    srt = sorted(rs)
    median = srt[n // 2]
    capped = sum(min(r, 2.0) for r in rs) / n
    wins = [r for r in rs if r > 0]
    losses = [r for r in rs if r <= 0]
    tr = sorted(tr, key=lambda t: t["ts"])
    half = n // 2
    h1 = sum(t["ret"] for t in tr[:half]) / max(half, 1)
    h2 = sum(t["ret"] for t in tr[half:]) / max(n - half, 1)
    # growth per trade at 1% account risk: position = 1% / stop distance (capped at 8%)
    return dict(n=n, pools=len(groups), median=median, capped=capped, mean=mean, lo=boots[int(0.05 * 800)], hi=boots[int(0.95 * 800)], win=len(wins) / n,
                avg_win=sum(wins) / len(wins) if wins else 0, avg_loss=sum(losses) / len(losses) if losses else 0,
                h1=h1, h2=h2, worst=min(rs), mins=sum(t["mins"] for t in tr) / n)


SIZINGS = {
    "fixed 8% of balance": lambda p: 0.08,
    "risk 1% of balance": lambda p: min(0.08, 0.01 / (p["sl"] + COST)),
    "risk 2% of balance": lambda p: min(0.16, 0.02 / (p["sl"] + COST)),
}


def equity(trades, p, frac_fn, start=1000.0, per_day=10, max_open=5):
    """Replay trades in time order on one account: desk limits (10 a day, 5 open), size from current balance."""
    eq, peak, dd, n = start, start, 0.0, 0
    open_until, day, today = [], None, 0
    for t in sorted(trades, key=lambda t: t["ts"]):
        d = t["ts"] // 86400
        if d != day:
            day, today = d, 0
        open_until = [u for u in open_until if u > t["ts"]]
        if today >= per_day or len(open_until) >= max_open:
            continue
        eq += eq * frac_fn(p) * t["ret"]
        today += 1
        n += 1
        open_until.append(t["ts"] + t["mins"] * 60)
        peak = max(peak, eq)
        dd = min(dd, eq / peak - 1)
    return eq, dd, n


def load():
    """(created_ts, candles) for pools whose candles start within an hour of the pool's creation."""
    import calendar
    out, skipped = [], 0
    for fn in sorted(os.listdir(CDIR)):
        d = json.load(open(os.path.join(CDIR, fn)))
        c = dense(d["candles"])
        cr = d["meta"].get("created")
        cr = calendar.timegm(time.strptime(cr[:19], "%Y-%m-%dT%H:%M:%S")) if cr else None
        if len(c) < 120 or cr is None or c[0][0] - cr > 3600:
            skipped += 1
            continue
        out.append((cr, c))
    return out, skipped


def run(args):
    series, skipped = load()
    mins = sum(len(c) for _, c in series)
    span = (min(c[0][0] for _, c in series), max(c[-1][0] for _, c in series))
    print(f"{len(series)} young pools (from launch; {skipped} older pools left out) · {mins:,} pool-minutes · "
          f"{time.strftime('%m-%d %H:%M', time.gmtime(span[0]))} → {time.strftime('%m-%d %H:%M', time.gmtime(span[1]))} UTC · "
          f"signals in the first {MAX_AGE_H} h of each pool · cost {COST * 100:.1f}% round trip\n")
    res = {}
    rng = random.Random(1)
    for gname, gate in GATES.items():
        for p in PLANS:
            sample = 0.02 if gname.startswith("random") else None
            tr = trades_for(series, gate, p, rng, sample)
            res[(gname, p["name"])] = stats(tr)
    pc = lambda x: f"{x * 100:+.1f}%"  # noqa: E731
    for gname in GATES:
        print(f"== {gname}")
        print(f"   {'exit plan':<44}{'n':>5}{'pools':>6}{'avg':>8}{'capped':>8}{'median':>8}{'90% range':>18}{'win':>5}{'avg win':>9}{'avg loss':>9}{'1st half':>9}{'2nd half':>9}")
        for p in PLANS:
            s = res[(gname, p["name"])]
            if not s["n"]:
                print(f"   {p['name'][:43]:<44}{0:>5}")
                continue
            print(f"   {p['name'][:43]:<44}{s['n']:>5}{s['pools']:>6}{pc(s['mean']):>8}{pc(s['capped']):>8}{pc(s['median']):>8}"
                  f"{pc(s['lo']) + ' .. ' + pc(s['hi']):>18}{s['win'] * 100:>4.0f}%{pc(s['avg_win']):>9}{pc(s['avg_loss']):>9}"
                  f"{pc(s['h1']):>9}{pc(s['h2']):>9}")
        print()
    days = max(1e-9, (span[1] - span[0]) / 86400)
    print(f"== $1,000 account, desk limits (10 trades/day, 5 open), over {days:.1f} days")
    for gname in ("playbook gate: 30m vol >= $50k, 7-30% below 60m high", "any minute, 1h vol >= $50k (desk filter only)"):
        print(f"   {gname}")
        print(f"   {'exit plan':<44}" + "".join(f"{k:>30}" for k in SIZINGS))
        for p in PLANS:
            tr = trades_for(series, GATES[gname], p)
            cells = []
            for k, fn in SIZINGS.items():
                e, dd, n = equity(tr, p, fn)
                cells.append(f"${e:,.0f} (dd {dd * 100:.0f}%, {n} tr)")
            print(f"   {p['name'][:43]:<44}" + "".join(f"{c:>30}" for c in cells))
        print()
    if args.json:
        json.dump({f"{g} | {p}": v for (g, p), v in res.items()}, open(args.json, "w"), indent=1)


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    fe = sub.add_parser("fetch")
    fe.add_argument("--pools", type=int, default=240)
    fe.add_argument("--pages", type=int, default=2)
    ru = sub.add_parser("run")
    ru.add_argument("--json")
    a = ap.parse_args()
    if a.cmd == "fetch":
        fetch(a.pools, a.pages)
    else:
        run(a)


if __name__ == "__main__":
    main()
