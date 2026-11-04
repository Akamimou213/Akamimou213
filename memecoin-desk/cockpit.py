"""Build the Trench Cockpit snapshot: the numbers the published page shows and its Claude chat reads.

  python3 cockpit.py                    # read data/*.json and data/desk.db -> data/cockpit/<doc>.json
  python3 cockpit.py --pulse 10         # first listen to the market for 10 minutes (pulse.py)

Writes one JSON file per page document (pulse, desk, channel, research, meta). Claude then writes
them to the page's database (Artifact write_db with each file), so the page updates without being
republished. Every document carries `ts` and `source` so the page can say how fresh it is.
"""
import argparse
import json
import os
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
OUT = os.path.join(DATA, "cockpit")
sys.path.insert(0, HERE)


def load(name):
    p = os.path.join(DATA, name)
    return json.load(open(p)) if os.path.exists(p) else None


def r(x, n=3):
    return None if x is None else round(x, n)


def pulse_doc():
    p = load("pulse.json")
    if not p:
        return dict(ts=None, source="pulse.py has not run yet")
    keep = ("ts", "minutes", "launches", "launches_per_hour", "graduations", "graduations_per_hour", "graduation_rate_pct",
            "by_type", "median_dev_buy_sol", "dev_buy_over_1_sol_pct", "sol_usd", "sol_change_24h", "boosts_top_solana")
    d = {k: p.get(k) for k in keep}
    d["trending"] = [{k: t.get(k) for k in ("name", "mcap", "liq", "vol_h1", "chg_h1", "chg_h24", "created")}
                     for t in (p.get("trending") or [])[:12]]
    d["source"] = "PumpPortal live stream (launches, graduations), DexScreener (SOL, boosts), GeckoTerminal (trending 1h)"
    # keep a short history so the page compares this sample with earlier ones
    hp = os.path.join(DATA, "pulse_history.json")
    hist = json.load(open(hp)) if os.path.exists(hp) else []
    row = {k: d.get(k) for k in ("ts", "launches_per_hour", "graduations_per_hour", "sol_usd")}
    if d.get("ts") and all(h["ts"] != d["ts"] for h in hist):
        hist.append(row)
    hist = hist[-48:]
    json.dump(hist, open(hp, "w"))
    d["history"] = hist
    return d


def desk_doc(db_path):
    if not os.path.exists(db_path):
        return dict(ts=int(time.time()), running=False, source="no desk database found: start the desk with `python3 desk.py run`")
    from core import Desk, load_config
    from store import Store
    import report as R
    cfg = load_config()
    st = Store(db_path)
    desk = Desk(cfg, st)
    now = int(time.time())
    last_ev = st.one("SELECT MAX(ts) t FROM events")
    eq = st.equity_now()
    leads = st.q("SELECT status, COUNT(*) n FROM leads WHERE created_ts>=? GROUP BY status", (now - 86400,))
    kills = st.q("SELECT kill_reason, COUNT(*) n FROM leads WHERE created_ts>=? AND kill_reason IS NOT NULL "
                 "GROUP BY kill_reason ORDER BY n DESC LIMIT 8", (now - 86400,))
    pos = [dict(lead=p["lead_id"], symbol=p["symbol"], ret=r(p["last_price"] / p["entry_price"] - 1),
                stop=r(p["stop_price"] / p["entry_price"] - 1), trailing=bool(p["trail_active"]),
                minutes=int((now - p["entry_ts"]) / 60), size=r(p["size_usd"] * p["remaining"], 2))
           for p in st.open_positions()]
    staged = [dict(lead=o["lead_id"], symbol=o["symbol"], size=r(o["size_usd"], 2), price=o["price"],
                   expires_in=o["expires_ts"] - now) for o in st.q("SELECT * FROM orders WHERE status='staged'")]
    closed = [dict(lead=p["lead_id"], symbol=p["symbol"], ret=r(p["ret"]), pnl=r(p["pnl_usd"], 2), why=p["exit_reason"],
                   ts=p["exit_ts"]) for p in st.q("SELECT * FROM positions WHERE status='closed' ORDER BY exit_ts DESC LIMIT 12")]
    curve = [dict(ts=e["ts"], eq=r(e["equity"], 2)) for e in st.q("SELECT ts, equity FROM equity ORDER BY ts DESC LIMIT 240")][::-1]
    events = [dict(ts=int(e["ts"]), seat=e["seat"], kind=e["kind"], msg=e["msg"][:220]) for e in st.recent_events(60)]
    h2h = []
    for c in cfg["head"].get("compare") or []:
        rows = st.q("SELECT r.ret, p.tags FROM shadow_results r JOIN positions p ON p.id=r.position_id WHERE r.plan=?", (c["plan"],))
        rs = [x["ret"] for x in rows if (json.loads(x["tags"]) if x["tags"] else {}).get("position") == c["position"]]
        s = sorted(rs)
        h2h.append(dict(name=c["name"], n=len(rs), avg=r(sum(rs) / len(rs)) if rs else None,
                        capped=r(sum(min(x, 2.0) for x in rs) / len(rs)) if rs else None,
                        median=r(s[len(s) // 2]) if rs else None, win=r(sum(1 for x in rs if x > 0) / len(rs)) if rs else None))
    return dict(ts=now, running=bool(last_ev and last_ev["t"] and now - last_ev["t"] < 300), last_event_ts=int(last_ev["t"] or 0),
                mode=cfg["mode"], config=cfg["_hash"], start_balance=cfg["start_balance_usd"], equity=r(eq, 2), cash=r(st.cash(), 2),
                live_plan=cfg["exit"]["plan"]["name"], risk_per_trade_pct=cfg["sniper"].get("risk_per_trade_pct"),
                leads_24h={x["status"]: x["n"] for x in leads}, kills_24h=[dict(reason=k["kill_reason"][:90], n=k["n"]) for k in kills],
                positions=pos, staged=staged, closed=closed, equity_curve=curve, events=events, head_to_head=h2h,
                strategy_text=R.strategy(desk)[:6000], source=f"desk database {os.path.relpath(db_path, HERE)}")


def channel_doc():
    c = load("channel.json")
    if not c:
        return dict(ts=None, source="channel.py has not run yet")
    keep = [k for k in c if k != "rows"]
    d = {k: c[k] for k in keep}
    d["rows"] = [{k: x.get(k) for k in ("ts", "chain", "ticker", "symbol", "status", "peak_x", "hours_to_peak", "low_before_peak_x",
                                         "x_24h", "now_x", "playbook_exit_x", "mcap_now", "claimed", "gamble")} for x in c["rows"]]
    d["ts"] = c.get("generated")
    d["source"] = f"Telegram export of {c.get('channel')} + DexScreener + GeckoTerminal 15-min candles"
    return d


def research_doc():
    lc = load("lifecycle.json")
    bt = load("backtest.json")
    newest = 0
    cdir = os.path.join(DATA, "candles")
    if os.path.isdir(cdir):
        for fn in os.listdir(cdir)[:400]:
            try:
                newest = max(newest, json.load(open(os.path.join(cdir, fn)))["candles"][-1][0])
            except Exception:
                pass
    d = dict(ts=int(time.time()), data_ts=newest or None,
             source="backtest.py + lifecycle.py on GeckoTerminal 1-minute candles (data/candles)")
    if lc:
        d["lifecycle"] = lc["summary"]
    if bt:
        gates = {"desk": "any minute, 1h vol >= $50k (desk filter only)", "pullback": "playbook gate: 30m vol >= $50k, 7-30% below 60m high",
                 "near_high": "chasing: within 7% of 60m high, 30m vol >= $50k", "a_setup": "A-setup: 30m vol >= $117k + pullback",
                 "random": "random minute (baseline)"}
        table = {}
        for key, g in gates.items():
            for k, v in bt.items():
                gg, plan = k.split(" | ", 1)
                if gg == g and v.get("n"):
                    table.setdefault(plan, {})[key] = dict(n=v["n"], capped=r(v["capped"]), median=r(v["median"]),
                                                           lo=r(v["lo"]), hi=r(v["hi"]), both_halves=v["h1"] > 0 and v["h2"] > 0)
        d["backtest"] = table
    return d


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=os.path.join(DATA, "desk.db"))
    ap.add_argument("--pulse", type=float, default=0, help="listen to the market for N minutes first")
    ap.add_argument("--desk-label", default=None, help="say where the desk numbers come from (e.g. a test run)")
    a = ap.parse_args()
    if a.pulse:
        subprocess.run([sys.executable, "-I", os.path.join(HERE, "pulse.py"), "--minutes", str(a.pulse)], check=False)
    os.makedirs(OUT, exist_ok=True)
    docs = dict(pulse=pulse_doc(), desk=desk_doc(a.db), channel=channel_doc(), research=research_doc())
    docs["meta"] = dict(ts=int(time.time()), docs={k: v.get("ts") for k, v in docs.items()},
                        note="Snapshot written by cockpit.py. Ask Claude in Claude Code to refresh it.")
    if a.desk_label:
        docs["desk"]["source"] = a.desk_label
    for k, v in docs.items():
        path = os.path.join(OUT, f"{k}.json")
        json.dump(v, open(path, "w"), separators=(",", ":"))
        print(f"{k:9} {os.path.getsize(path):>7,} bytes  {path}")
    # the page with this snapshot built in, so it is complete before the live store answers
    tpl = open(os.path.join(HERE, "cockpit_page.html")).read()
    snap = json.dumps(docs, separators=(",", ":")).replace("</", "<\\/")
    page = tpl.replace("/*SNAPSHOT*/null", snap)
    open(os.path.join(OUT, "index.html"), "w").write(page)
    print(f"page      {len(page):>7,} bytes  {os.path.join(OUT, 'index.html')}")


if __name__ == "__main__":
    main()
