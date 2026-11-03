"""Trench desk: seven seats, hard handoffs, and you sign every trade.

  python3 desk.py run                 live terminal (paper mode by default, see config.json)
  python3 desk.py run --headless      same desk, thread printed to stdout (for a VPS / tmux)
  python3 desk.py approve 47          sign staged order #047 from another terminal
  python3 desk.py reject 47
  python3 desk.py fill 47 0.000123    correct the entry after a manual fill
  python3 desk.py pause | resume
  python3 desk.py status              balance, open positions, staged orders
  python3 desk.py thread [-n 50]      last events with reasons
  python3 desk.py report              evening report now
  python3 desk.py calibrate           the Sunday judge-calibration table now
  python3 desk.py lead 47             everything the desk knows about one lead (dossier, answers, gate)

SEARCH -> RISK -> WHALE -> HEAD (dossier) -> JUDGE -> SNIPER -> APPROVE #id (you) -> EXIT
"""
import argparse
import json
import os
import re
import sys
import threading
import time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import report as R  # noqa: E402
import telegram as TG  # noqa: E402
from core import Desk, SR, load_config, tag, utc  # noqa: E402
from risk import Risk  # noqa: E402
from search import Search  # noqa: E402
from seats import Head, JudgeSeat, Whale, load_whales  # noqa: E402
from sniper import Exit, Sniper  # noqa: E402
from store import DEFAULT_DB, Store  # noqa: E402

CMD = re.compile(r"^(APPROVE|REJECT|FILL|PAUSE|RESUME|REPORT|CALIBRATE|QUIT)\b\s*#?0*(\d+)?\s*([\d.eE+-]+)?\s*$", re.I)


def build(cfg, store):
    desk = Desk(cfg, store)
    if store.meta("cash") is None:
        store.set_cash(cfg["start_balance_usd"])
        store.record_equity()
    whales = load_whales()
    desk.search = Search(desk, whales)
    desk.risk = Risk(desk)
    desk.whale = Whale(desk, whales)
    desk.head = Head(desk)
    desk.judge = JudgeSeat(desk)
    desk.sniper = Sniper(desk)
    desk.exit = Exit(desk, desk.sniper.limits)
    desk.clock_seat = R.HeadClock(desk, notify=TG.send if TG.enabled() else None)
    desk.feeds = desk.search.ws_state
    return desk


def handle(desk, text, origin):
    m = CMD.match(text.strip())
    if not m:
        return f"unknown command: {text!r}"
    verb, num, arg = m.group(1).upper(), m.group(2), m.group(3)
    lead = int(num) if num else None
    desk.store.event("HEAD", "info", f"command from {origin}: {text.strip()}", lead)
    if verb in ("APPROVE", "REJECT", "FILL") and lead is None:
        return f"{verb} needs a lead number, e.g. {verb} #047"
    if verb == "APPROVE":
        desk.sniper.approve(lead, origin)
    elif verb == "REJECT":
        desk.sniper.reject(lead, origin)
    elif verb == "FILL":
        if not arg:
            return "FILL #id <price>"
        desk.sniper.correct_fill(lead, float(arg))
    elif verb == "PAUSE":
        desk.paused.set()
        desk.say("HEAD", "warn", f"desk paused by you ({origin}): no new orders; EXIT still manages open positions")
    elif verb == "RESUME":
        desk.paused.clear()
        desk.store.set_meta("pause_until", 0)
        desk.say("HEAD", "info", f"desk resumed by you ({origin})")
    elif verb == "REPORT":
        desk.say("HEAD", "report", R.evening(desk).replace("\n", " | "))
    elif verb == "CALIBRATE":
        for line in R.calibration(desk).splitlines():
            desk.say("HEAD", "report", line)
    elif verb == "QUIT":
        desk.stop.set()
    return f"ok: {verb}{' ' + tag(lead) if lead else ''}"


def command_loop(desk):
    while not desk.stop.is_set():
        for c in desk.store.take_commands():
            try:
                handle(desk, c["text"], c["origin"])
            except Exception as e:
                desk.say("HEAD", "warn", f"command {c['text']!r} failed: {e}")
        desk.stop.wait(0.5)


def start(desk):
    targets = desk.search.threads() + [desk.risk.loop, desk.whale.loop, desk.head.loop, desk.judge.loop,
                                       desk.sniper.loop, desk.exit.loop, desk.clock_seat.loop,
                                       lambda: command_loop(desk)]
    if TG.enabled():
        desk.listeners.append(TG.listener(desk))
        targets.append(lambda: TG.poll_loop(desk))
    for t in targets:
        threading.Thread(target=t, daemon=True).start()
    cfg = desk.cfg
    desk.say("HEAD", "info", f"desk up · {cfg['mode']} · config {cfg['_hash']} · judge {cfg['judge']['backend']} · "
                             f"stop {cfg['exit']['hard_stop_pct']}% · trail after +{cfg['exit']['trail_activate_pct']}% · "
                             f"size ≤ {cfg['sniper']['max_pct_of_balance'] * 100:.0f}% · "
                             f"{len(desk.search.whales)} tracked wallets · Telegram {'on' if TG.enabled() else 'off'}")


def cmd_run(args, cfg):
    if cfg["mode"] not in ("paper", "manual"):
        sys.exit("config mode must be 'paper' or 'manual'. The desk never signs transactions itself.")
    desk = build(cfg, Store(args.db))
    last = desk.store.one("SELECT MAX(id) m FROM events")["m"] or 0
    start(desk)
    if args.headless or not sys.stdout.isatty():
        try:
            while not desk.stop.is_set():
                for e in desk.store.q("SELECT * FROM events WHERE id>? ORDER BY id", (last,)):
                    print(f"{utc(e['ts'])} {e['seat']:<6} {e['msg']}", flush=True)
                    last = e["id"]
                if args.minutes and time.time() - args._t0 > args.minutes * 60:
                    desk.stop.set()
                time.sleep(0.5)
        except KeyboardInterrupt:
            desk.stop.set()
    else:
        import tui
        tui.run(desk, lambda text, origin: handle(desk, text, origin))
    desk.stop.set()
    time.sleep(0.5)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--db", default=DEFAULT_DB)
    ap.add_argument("--config", default=None)
    sub = ap.add_subparsers(dest="cmd", required=True)
    r = sub.add_parser("run")
    r.add_argument("--headless", action="store_true")
    r.add_argument("--minutes", type=float, default=0, help="stop after N minutes (headless)")
    for verb in ("approve", "reject"):
        sub.add_parser(verb).add_argument("lead", type=int)
    fl = sub.add_parser("fill")
    fl.add_argument("lead", type=int)
    fl.add_argument("price", type=float)
    for verb in ("pause", "resume", "status", "report", "calibrate"):
        sub.add_parser(verb)
    th = sub.add_parser("thread")
    th.add_argument("-n", type=int, default=50)
    ld = sub.add_parser("lead")
    ld.add_argument("lead", type=int)
    args = ap.parse_args()
    args._t0 = time.time()
    cfg = load_config(args.config)

    if args.cmd == "run":
        return cmd_run(args, cfg)
    store = Store(args.db)
    if args.cmd in ("approve", "reject"):
        store.push_command(f"{args.cmd.upper()} #{args.lead}", origin="cli")
        print(f"queued {args.cmd.upper()} {tag(args.lead)} — the running desk picks it up within a second; check `desk.py thread`")
    elif args.cmd == "fill":
        store.push_command(f"FILL #{args.lead} {args.price}", origin="cli")
        print("queued")
    elif args.cmd in ("pause", "resume"):
        store.push_command(args.cmd.upper(), origin="cli")
        print("queued")
    elif args.cmd == "thread":
        for e in store.recent_events(args.n):
            print(f"{utc(e['ts'], '%m-%d %H:%M:%S')} {e['seat']:<6} {e['msg']}")
    elif args.cmd in ("report", "calibrate", "status"):
        desk = Desk(cfg, store)
        if args.cmd == "report":
            print(R.evening(desk))
        elif args.cmd == "calibrate":
            print(R.calibration(desk))
        else:
            import tui
            for text, _ in tui.render(desk, 130, 40):
                print(text.rstrip())
    elif args.cmd == "lead":
        print(json.dumps(store.lead(args.lead), indent=1, default=str))


if __name__ == "__main__":
    main()
