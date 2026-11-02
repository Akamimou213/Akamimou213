"""Prove (or kill) the rules on the collector's own data.

  python3 validate.py               # text report
  python3 validate.py --json        # for the dashboard

Tigran's 148 calls were a hand-picked, in-sample set. The collector records every coin it
watches, minute by minute, whether or not it alerted. This replays rule variants over that
unbiased sample with the exact paper-trade mechanics (entry 1 min after the signal, 4.5 % fees,
stop fills at the observed price, liquidity pulls = −100 %) and asks:

  * does the playbook gate beat buying any active coin at random (the baseline)?
  * does it hold in both halves of the period (first half vs second half), not just overall?
  * which thresholds deserve to stay?

The replay tests the market rules (gate + exits). The contract/holder dossier is tested
separately by the paper journal, because safety data is only fetched for coins that pass the gate.
"""
import argparse
import json
import os
import random
import statistics
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import rules  # noqa: E402
import series as SR  # noqa: E402
import store  # noqa: E402

COOLDOWN = 60 * 60   # one entry per coin per hour
MIN_N = 50           # below this a result is noise (±11 pts on win rate at n=50)


def in_window(t):
    return time.gmtime(t).tm_hour < rules.WINDOW_UTC[1]


def below(g):
    return -g["off_high"] if g and g.get("off_high") is not None else None


# Each variant: name, description, predicate(g, t)
def variants():
    V = []

    def add(name, desc, f):
        V.append((name, desc, f))

    ok = lambda g: g and not g["vol_est"] and g["off_high"] is not None  # noqa: E731
    add("baseline", "Any watched coin with ≥ $10k 30-min volume (random entry)", lambda g, t: ok(g) and g["vol30"] >= 10_000)
    add("playbook", "Gate: vol30 ≥ $50k and 7–30% below 60-min high", lambda g, t: ok(g) and SR.gate_pass(g))
    add("playbook+window", "Gate, signals 00–08 UTC only", lambda g, t: ok(g) and SR.gate_pass(g) and in_window(t))
    add("a-setup", "vol30 ≥ $117k and 7–30% below", lambda g, t: ok(g) and SR.gate_pass(g, vol_min=rules.GATE_VOL30_A))
    add("volume-only", "vol30 ≥ $50k, any position vs high", lambda g, t: ok(g) and g["vol30"] >= 50_000)
    add("pullback-only", "7–30% below high, vol30 ≥ $10k", lambda g, t: ok(g) and g["vol30"] >= 10_000 and 0.07 <= below(g) <= 0.30)
    add("near-high", "AVOID rule: vol30 ≥ $50k but within 7% of the high", lambda g, t: ok(g) and g["vol30"] >= 50_000 and below(g) < 0.07)
    add("deep-dump", "AVOID rule: vol30 ≥ $50k but > 30% below the high", lambda g, t: ok(g) and g["vol30"] >= 50_000 and below(g) > 0.30)
    for vmin in (25_000, 100_000, 200_000):
        add(f"vol≥{vmin // 1000}k", f"Gate with vol30 ≥ ${vmin // 1000}k", lambda g, t, v=vmin: ok(g) and SR.gate_pass(g, vol_min=v))
    for lo, hi in ((0.10, 0.30), (0.07, 0.20), (0.15, 0.40)):
        add(f"pull {int(lo * 100)}–{int(hi * 100)}%", f"vol30 ≥ $50k, {int(lo * 100)}–{int(hi * 100)}% below",
            lambda g, t, a=lo, b=hi: ok(g) and SR.gate_pass(g, pull_min=a, pull_max=b))
    return V


def replay(db, since=0):
    toks = [(r["chain"], r["address"]) for r in db.execute("SELECT DISTINCT chain, address FROM snaps WHERE ts>=?", (since,))]
    V = variants()
    events = {name: [] for name, _, _ in V}
    pending = {name: 0 for name, _, _ in V}
    for ch, a in toks:
        snaps = store.series(db, ch, a, since=since)
        if len(snaps) < 10:
            continue
        ts = [s["ts"] for s in snaps]
        last_entry = {name: -10 ** 12 for name, _, _ in V}
        busy_until = {name: -10 ** 12 for name, _, _ in V}
        for i in range(len(snaps)):
            t = ts[i]
            g = None
            for name, _, f in V:
                if t - last_entry[name] < COOLDOWN or t < busy_until[name]:
                    continue
                if g is None:
                    g = SR.gate_at(snaps, ts, i) or {}
                if not g or not f(g, t):
                    continue
                res = SR.simulate(snaps[i:], t)
                last_entry[name] = t
                if not res or res["status"] != "closed":
                    pending[name] += 1
                    continue
                busy_until[name] = res["exit_ts"]
                events[name].append(dict(t=t, ret=res["ret"], why=res["exit_reason"], chain=ch, address=a))
    return V, events, pending


def stats(evs, seed=7):
    if not evs:
        return dict(n=0)
    r = [e["ret"] for e in evs]
    rnd = random.Random(seed)
    boots = sorted(statistics.fmean(rnd.choices(r, k=len(r))) for _ in range(2000)) if len(r) > 1 else [r[0]] * 2
    evs = sorted(evs, key=lambda e: e["t"])
    h = len(evs) // 2
    halves = [statistics.fmean(e["ret"] for e in part) if part else None for part in (evs[:h], evs[h:])]
    reasons = {}
    for e in evs:
        reasons[e["why"]] = reasons.get(e["why"], 0) + 1
    return dict(n=len(r), mean=statistics.fmean(r), median=statistics.median(r), win=sum(x > 0 for x in r) / len(r),
                lo=boots[int(0.05 * len(boots))], hi=boots[int(0.95 * len(boots)) - 1],
                first_half=halves[0], second_half=halves[1], exits=reasons, coins=len({(e["chain"], e["address"]) for e in evs}))


def journal(db):
    rows = [dict(r) for r in db.execute("SELECT * FROM trades WHERE status='closed' AND entry_price IS NOT NULL")]
    s = stats([dict(t=r["signal_ts"], ret=r["ret"], why=r["exit_reason"], chain=r["chain"], address=r["address"]) for r in rows])
    s["pnl"] = sum(r["pnl"] or 0 for r in rows)
    s["open"] = db.execute("SELECT COUNT(*) n FROM trades WHERE status!='closed'").fetchone()["n"]
    return s


def verdict_line(name, s, base):
    if s["n"] == 0:
        return "no events yet"
    if s["n"] < MIN_N:
        return f"too few events (need {MIN_N}+)"
    edge = s["mean"] - (base.get("mean") or 0) if base.get("n") else None
    both = s["first_half"] is not None and s["second_half"] is not None and s["first_half"] > 0 and s["second_half"] > 0
    if s["lo"] > 0 and both:
        return "holds: positive in both halves, 90% range above zero" + (f", beats baseline by {edge * 100:+.1f} pts" if edge is not None else "")
    if s["hi"] < 0:
        return "fails: 90% range below zero"
    return "unproven: range spans zero or halves disagree"


def build(db, since=0):
    V, events, pending = replay(db, since)
    span = db.execute("SELECT MIN(ts) a, MAX(ts) b, COUNT(DISTINCT address) n FROM snaps WHERE ts>=?", (since,)).fetchone()
    out = dict(generated=int(time.time()), span_from=span["a"], span_to=span["b"], coins=span["n"], variants=[], journal=journal(db))
    base = stats(events["baseline"])
    for name, desc, _ in V:
        s = stats(events[name])
        s.update(name=name, desc=desc, pending=pending[name], verdict=verdict_line(name, s, base))
        out["variants"].append(s)
    return out


def pctf(x):
    return "–" if x is None else f"{x * 100:+.1f}%"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=store.DEFAULT_DB)
    ap.add_argument("--days", type=float, default=0, help="only the last N days (0 = all)")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()
    db = store.connect(a.db)
    since = int(time.time() - a.days * 86400) if a.days else 0
    out = build(db, since)
    if a.json:
        print(json.dumps(out, indent=2))
        return
    hrs = ((out["span_to"] or 0) - (out["span_from"] or 0)) / 3600
    print(f"\nValidation on {out['coins']} coins, {hrs:.1f} h of 1-minute data (4.5% fees, 1-min entry delay)\n")
    print(f"{'rule':<18}{'n':>5}{'avg':>9}{'median':>9}{'win':>6}{'90% range':>20}{'1st half':>10}{'2nd half':>10}  verdict")
    for s in out["variants"]:
        if s["n"] == 0:
            print(f"{s['name']:<18}{0:>5}{'':>69}  {s['verdict']}" + (f" ({s['pending']} still open)" if s["pending"] else ""))
            continue
        rng = f"{pctf(s['lo'])} … {pctf(s['hi'])}"
        print(f"{s['name']:<18}{s['n']:>5}{pctf(s['mean']):>9}{pctf(s['median']):>9}{s['win'] * 100:>5.0f}%{rng:>20}"
              f"{pctf(s['first_half']):>10}{pctf(s['second_half']):>10}  {s['verdict']}")
    j = out["journal"]
    print(f"\nPaper journal (full dossier incl. safety): {j['n']} closed, {j['open']} open"
          + (f", avg {pctf(j['mean'])}, win {j['win'] * 100:.0f}%, P&L {rules.usd(j['pnl'])}" if j["n"] else ""))
    print("Kill switch (playbook §10): after 50 trades, average ≤ 0 → stop and diagnose.\n")


if __name__ == "__main__":
    main()
