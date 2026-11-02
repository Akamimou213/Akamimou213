"""Gate metrics and trade simulation from our own 1-minute snapshot series.

Shared by collector.py (live alerts and paper trades) and validate.py (replay), so the paper
journal and the backtest follow exactly the same rules.

A snapshot is a dict with ts, price, liq (main pool), liq_total, mcap, vol_m5, vol_h1.
"""
import bisect

import rules

MIN_HISTORY = 45 * 60      # need 45 min of our own history before trusting the 60-min high
SAMPLE_TOL = 100           # a 5-min volume sample must sit within ±100 s of its slot
ENTRY_DELAY = 60           # paper entry fills at the first snapshot ≥ 60 s after the signal
STALE_EXIT = 15 * 60       # no data for 15 min: close at the last price, flagged
DEAD_LIQ = 1_000           # pool drained below $1k: close at −100 %


def gate_from_series(snaps, t):
    """vol30 / high60 / off_high at time t using only snapshots at or before t."""
    ts = [s["ts"] for s in snaps]
    i = bisect.bisect_right(ts, t) - 1
    return gate_at(snaps, ts, i, t) if i >= 0 else None


def gate_at(snaps, ts, i, t=None):
    """Gate at snapshot index i (ts = the snapshots' timestamps, sorted). O(60) per call."""
    t = snaps[i]["ts"] if t is None else t
    cur = snaps[i]
    if t - cur["ts"] > 180 or not cur["price"]:
        return None
    # 30-min volume: six non-overlapping 5-min windows ending at t, t-5m, ... t-25m.
    vol30, ok = 0.0, True
    for k in range(6):
        slot = t - k * 300
        j = bisect.bisect_left(ts, slot, 0, i + 1)
        cands = [x for x in (j - 1, j) if 0 <= x <= i]
        near = min(cands, key=lambda x: abs(ts[x] - slot)) if cands else None
        if near is None or abs(ts[near] - slot) > SAMPLE_TOL or snaps[near]["vol_m5"] is None:
            ok = False
            break
        vol30 += snaps[near]["vol_m5"]
    est = False
    if not ok:
        if cur["vol_h1"] is None:
            return None
        vol30, est = cur["vol_h1"] / 2, True
    covered = t - ts[0]
    lo = bisect.bisect_left(ts, t - 3600, 0, i + 1)
    win = [snaps[x]["price"] for x in range(lo, i + 1) if snaps[x]["price"]]
    high60 = max(win) if win and covered >= MIN_HISTORY else None
    off = (cur["price"] / high60 - 1) if high60 else None
    return dict(vol30=vol30, vol_est=est, high60=high60, off_high=off, price=cur["price"],
                liq=cur["liq"], liq_total=cur.get("liq_total") or cur["liq"], mcap=cur["mcap"], history_min=covered // 60)


def gate_pass(g, vol_min=rules.GATE_VOL30_MIN, pull_min=rules.GATE_PULLBACK_MIN, pull_max=rules.GATE_DEEP_DUMP):
    if not g or g["vol_est"] or g["off_high"] is None:
        return False
    below = -g["off_high"]
    return g["vol30"] >= vol_min and pull_min <= below <= pull_max


def simulate(snaps, signal_ts, tp=rules.TP_MULT, sl=rules.SL_MULT, time_stop=rules.TIME_STOP_MIN * 60,
             cost=rules.ROUND_TRIP_COST, delay=ENTRY_DELAY):
    """Paper-trade one signal on the series. Returns None if it can't be entered yet.

    Entry: first snapshot ≥ signal + delay (you react a minute late).
    Take profit fills exactly at tp × entry (a resting limit); the stop fills at the observed
    price, which can be well below −50 % in a crash; liquidity drained → −100 %.
    """
    after = [s for s in snaps if s["ts"] >= signal_ts + delay and s["price"]]
    if not after:
        return None
    e = after[0]
    entry, ets = e["price"], e["ts"]
    res = dict(entry_ts=ets, entry_price=entry, status="open", max_price=entry)
    last = e
    for s in after[1:]:
        if s["ts"] - last["ts"] > STALE_EXIT:
            return _close(res, last["ts"], last["price"], "data gap", cost)
        last = s
        res["max_price"] = max(res["max_price"], s["price"])
        if (s.get("liq") or 0) < DEAD_LIQ:
            return _close(res, s["ts"], 0.0, "liquidity pulled", cost)
        if s["price"] >= entry * tp:
            return _close(res, s["ts"], entry * tp, "take profit", cost)
        if s["price"] <= entry * sl:
            return _close(res, s["ts"], s["price"], "stop", cost)
        if s["ts"] - ets >= time_stop:
            return _close(res, s["ts"], s["price"], "time stop", cost)
    return res


def _close(res, ts, price, why, cost):
    res.update(status="closed", exit_ts=ts, exit_price=price, exit_reason=why,
               ret=(price / res["entry_price"]) * (1 - cost) - 1 if res["entry_price"] else -1.0)
    return res
