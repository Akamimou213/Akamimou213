"""HEAD reports: 24-hour follow-ups (which also fill the rug registry), the evening report and the
Sunday calibration check. All of them read the store; none of them change the gate.
"""
import os
import time
from datetime import datetime
from zoneinfo import ZoneInfo

from core import HERE, S, SR, ds_pairs_by_mint, f, main_pair, tag
from risk import DevHistory

REPORTS = os.path.join(HERE, "data", "reports")


def followups(desk, dev=None):
    """Re-price every lead 24h after it reached the desk. Record creators of tokens that died."""
    st, hc = desk.store, desk.cfg["head"]
    now = int(desk.clock())
    due = st.q("SELECT id, mint, creator, price_at_verdict, created_ts FROM leads WHERE followup_ts IS NULL AND created_ts<=? "
               "LIMIT 120", (now - hc["followup_hours"] * 3600,))
    if not due:
        return 0
    pairs = ds_pairs_by_mint([r["mint"] for r in due])
    for r in due:
        ps = pairs.get(r["mint"]) or []
        p = main_pair(ps, r["mint"]) or {}
        px = f(p.get("priceUsd"))
        first = st.one("SELECT price FROM snaps WHERE mint=? AND ts>=? AND price IS NOT NULL ORDER BY ts LIMIT 1",
                       (r["mint"], r["created_ts"] - 120))
        ref = r["price_at_verdict"] or (first or {}).get("price")
        st.set_lead(r["id"], price_24h=px if px is not None else 0.0, followup_ts=now)
        dead = (not ps) or (px is not None and ref and px <= ref * (1 - hc["rug_mark_drop_pct"] / 100))
        if dead and r["creator"]:
            note = f"{tag(r['id'])} {r['mint'][:6]}… fell ≥{hc['rug_mark_drop_pct']}% in 24h" if ps else f"{tag(r['id'])} delisted in 24h"
            st.x("INSERT OR IGNORE INTO rug_registry VALUES (?,?,?,?,?)", (r["creator"], "creator", r["mint"], now, note))
            if dev:
                try:
                    src, _ = dev.funder(r["creator"])
                    if src:
                        st.x("INSERT OR IGNORE INTO rug_registry VALUES (?,?,?,?,?)", (src, "funder", r["mint"], now, note + " (funder)"))
                except Exception:
                    pass
            desk.say("HEAD", "info", f"rug registry +{r['creator'][:6]}… ({note})", r["id"])
    return len(due)


def evening(desk, since=None, now=None):
    st = desk.store
    now = int(now or desk.clock())
    since = since or now - 86400
    leads = st.q("SELECT * FROM leads WHERE created_ts>=?", (since,))
    by = {}
    for l in leads:
        by[l["status"]] = by.get(l["status"], 0) + 1
    kills = {}
    for l in leads:
        if l["kill_reason"]:
            k = l["kill_reason"].split(" (rule")[0].split(":")[0:2]
            k = ":".join(k)[:60]
            kills[k] = kills.get(k, 0) + 1
    closed = st.q("SELECT * FROM positions WHERE status='closed' AND exit_ts>=? ORDER BY exit_ts", (since,))
    pnl = sum(p["pnl_usd"] for p in closed)
    wins = sum(1 for p in closed if p["pnl_usd"] > 0)
    eq = st.equity_now()
    start = desk.cfg["start_balance_usd"]
    lines = [f"TRENCH DESK · evening report · {time.strftime('%Y-%m-%d %H:%M', time.gmtime(now))} UTC · {desk.cfg['mode'].upper()}",
             f"Equity {SR.usd(eq)} ({(eq / start - 1) * 100:+.1f}% since start) · cash {SR.usd(st.cash())} · "
             f"{len(st.open_positions())} open",
             f"Leads 24h: {len(leads)} · " + " · ".join(f"{k} {v}" for k, v in sorted(by.items(), key=lambda x: -x[1])),
             "Top kill reasons: " + ("; ".join(f"{k} ×{v}" for k, v in sorted(kills.items(), key=lambda x: -x[1])[:6]) or "none"),
             f"Trades closed: {len(closed)} · {wins} green · P&L {'+' if pnl >= 0 else '-'}{SR.usd(abs(pnl))}"]
    for p in closed:
        lines.append(f"  {tag(p['lead_id'])} {p['symbol']}: {p['ret'] * 100:+.1f}% — {p['exit_reason']}")
    staged = st.q("SELECT status, COUNT(*) n FROM orders WHERE staged_ts>=? GROUP BY status", (since,))
    if staged:
        lines.append("Orders: " + " · ".join(f"{r['status']} {r['n']}" for r in staged))
    return "\n".join(lines)


def strategy(desk, now=None, days=7):
    """Shadow book: every exit plan on every lead RISK passed, split by JUDGE verdict and entry position.
    This is the desk testing its own strategy on its own, unpicked leads."""
    import json as _j
    st = desk.store
    now = int(now or desk.clock())
    rows = st.q("SELECT r.plan, r.ret, p.tags, p.status FROM shadow_results r JOIN positions p ON p.id=r.position_id WHERE r.ts>=?",
                (now - days * 86400,))
    live = desk.cfg["exit"]["plan"]["name"]

    def summ(rs):
        if not rs:
            return "–"
        s = sorted(rs)
        return (f"n {len(rs):>3} · avg {sum(rs) / len(rs) * 100:+6.1f}% · capped {sum(min(x, 2.0) for x in rs) / len(rs) * 100:+6.1f}% · "
                f"median {s[len(s) // 2] * 100:+6.1f}% · win {sum(1 for x in rs if x > 0) / len(rs) * 100:3.0f}%")
    plans = []
    for r_ in rows:
        if r_["plan"] not in plans:
            plans.append(r_["plan"])
    out = [f"STRATEGY · shadow book, last {days} days · every lead RISK passed, every exit plan, after fees · live plan: {live}"]
    if not rows:
        return out[0] + "\nNo shadow results yet."
    out.append("HEAD TO HEAD (switch the live strategy only when one side has 100+ trades, a positive capped average,")
    out.append("and a positive median in both halves of the period; see AUDIT.md)")
    for c in desk.cfg["head"].get("compare") or []:
        rs = [x["ret"] for x in rows if x["plan"] == c["plan"] and (_j.loads(x["tags"]) if x["tags"] else {}).get("position") == c["position"]]
        out.append(f"  {c['name']:<44}{summ(rs)}")
    out.append("")
    for plan in plans:
        rs = [x for x in rows if x["plan"] == plan]
        tagged = [(x, _j.loads(x["tags"]) if x["tags"] else {}) for x in rs]
        out.append(f"{'* ' if plan == live else '  '}{plan}")
        out.append(f"    {'all leads':<30}{summ([x['ret'] for x in rs])}")
        for key, vals in (("verdict", ("buy", "watch", "pass")),
                          ("position", ("near high (<7%)", "pullback 7-30%", "dump (>30%)", "missing"))):
            for v in vals:
                sub = [x["ret"] for x, t in tagged if t.get(key) == v]
                if sub:
                    out.append(f"    {(key + ' = ' + v):<30}{summ(sub)}")
    return "\n".join(out)


BUCKETS = [(0.70, 0.80, "0.70-0.79"), (0.80, 0.90, "0.80-0.89"), (0.90, 1.01, "0.90+")]


def calibration(desk, now=None, days=7):
    """The Sunday table. Honest by construction: it only counts, it never explains."""
    st = desk.store
    now = int(now or desk.clock())
    leads = [st.lead(r["id"]) for r in st.q("SELECT id FROM leads WHERE verdict IS NOT NULL AND verdict_ts>=?", (now - days * 86400,))]
    rows = []
    for lo, hi, name in BUCKETS:
        grp = [l for l in leads if l["verdict"]["answers"] and (l["verdict"]["gate"] or {}).get("action") == "buy"
               and lo <= l["verdict"]["answers"]["action"]["buy"] < hi]
        trades = [st.one("SELECT * FROM positions WHERE lead_id=? AND status='closed'", (l["id"],)) for l in grp]
        trades = [t for t in trades if t]
        green = sum(1 for t in trades if t["pnl_usd"] > 0)
        g24 = [l for l in grp if l["price_24h"] is not None and l["price_at_verdict"]]
        green24 = sum(1 for l in g24 if l["price_24h"] > l["price_at_verdict"])
        rows.append(dict(bucket=name, answers=len(grp), trades=len(trades), green=green,
                         win=(green / len(trades)) if trades else None, checked_24h=len(g24),
                         green_24h=(green24 / len(g24)) if g24 else None))
    passes = [l for l in leads if (l["verdict"]["gate"] or {}).get("final") == "pass"
              and l["price_24h"] is not None and l["price_at_verdict"]]
    pass_green = sum(1 for l in passes if l["price_24h"] > l["price_at_verdict"])

    def pc(x):
        return "–" if x is None else f"{x * 100:.0f}%"
    out = [f"JUDGE calibration · last {days} days · backend {desk.cfg['judge']['backend']}",
           f"{'p(buy)':<11}{'answers':>8}{'trades':>8}{'green':>7}{'win':>6}{'24h ck':>8}{'24h up':>8}"]
    for r in rows:
        out.append(f"{r['bucket']:<11}{r['answers']:>8}{r['trades']:>8}{r['green']:>7}{pc(r['win']):>6}"
                   f"{r['checked_24h']:>8}{pc(r['green_24h']):>8}")
    out.append(f"{'passes':<11}{len(passes):>8}{'':>8}{'':>7}{'':>6}{len(passes):>8}"
               f"{pc(pass_green / len(passes) if passes else None):>8}")
    lo_, hi_ = rows[0], rows[2]
    if lo_["win"] is not None and hi_["win"] is not None:
        if hi_["win"] <= lo_["win"]:
            out.append(f"0.90+ does NOT win more often than 0.70-0.79 ({pc(hi_['win'])} vs {pc(lo_['win'])}). "
                       "The judge's confidence is not calibrated: raise the threshold or drop a question.")
        else:
            out.append(f"0.90+ wins more often than 0.70-0.79 ({pc(hi_['win'])} vs {pc(lo_['win'])}).")
    else:
        out.append("Too few closed trades in the 0.70-0.79 and 0.90+ buckets to compare them yet.")
    return "\n".join(out)


class HeadClock:
    """Fires the evening report and the Sunday calibration at the configured local time."""

    def __init__(self, desk, notify=None):
        self.d, self.notify = desk, notify
        self.dev = DevHistory(desk)

    def loop(self):
        while not self.d.stop.is_set():
            try:
                followups(self.d, self.dev)
                self.maybe_reports()
                self.d.store.record_equity()
            except Exception as e:
                self.d.say("HEAD", "warn", f"report clock: {type(e).__name__}: {e}")
            self.d.stop.wait(60)

    def maybe_reports(self):
        hc = self.d.cfg["head"]
        tz = ZoneInfo(hc["report_tz"])
        now = datetime.fromtimestamp(self.d.clock(), tz)
        hh, mm = map(int, hc["report_time_local"].split(":"))
        if (now.hour, now.minute) < (hh, mm):
            return
        key = f"report:{now.date()}"
        if self.d.store.meta(key):
            return
        self.d.store.set_meta(key, True)
        os.makedirs(REPORTS, exist_ok=True)
        text = evening(self.d)
        if now.weekday() == hc["calibration_weekday"]:
            text += "\n\n" + calibration(self.d) + "\n\n" + strategy(self.d)
        open(os.path.join(REPORTS, f"{now.date()}.txt"), "w").write(text + "\n")
        self.d.say("HEAD", "report", f"evening report written (data/reports/{now.date()}.txt)")
        if self.notify:
            self.notify(text)
