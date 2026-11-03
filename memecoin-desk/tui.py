"""The live terminal: balance, seat activity, equity curve, staged orders, positions, the thread.

`render(desk, width, height)` builds the whole screen as (text, colour) lines so it can be
printed or tested without curses. `run(desk)` draws it with curses and reads commands.
"""
import curses
import time

from core import SEATS, SR, tag, utc

BLOCKS = " ▁▂▃▄▅▆▇█"
KIND_COLOR = {"lead": "cyan", "ok": "green", "buy": "green", "fill": "green", "dead": "red", "pass": "red",
              "reject": "red", "watch": "yellow", "staged": "yellow", "warn": "yellow", "close": "white",
              "info": "dim", "report": "cyan"}


def money(x):
    return ("-" if x < 0 else "") + SR.usd(abs(x))


def equity_chart(points, width, height):
    """Area chart of equity, newest on the right. Returns `height` strings plus the axis labels."""
    if not points:
        return [" " * width] * height, None, None
    vals = [p for p in points][-width:]
    lo, hi = min(vals), max(vals)
    if hi - lo < 1e-9:
        lo, hi = lo * 0.995, hi * 1.005 + 1e-9
    cols = []
    for v in vals:
        cols.append((v - lo) / (hi - lo) * height * 8)
    rows = []
    for r in range(height - 1, -1, -1):
        line = ""
        for c in cols:
            fill = c - r * 8
            if fill >= 8:
                line += BLOCKS[8]
            elif fill > 0:
                line += BLOCKS[max(1, int(fill))]
            else:
                line += BLOCKS[1] if r == 0 else " "
        rows.append(line.ljust(width))
    return rows, lo, hi


def render(desk, width=120, height=40, cmd="", note=""):
    st, cfg = desk.store, desk.cfg
    now = desk.clock()
    out = []

    def add(text, color="white"):
        out.append((text[:width].ljust(width), color))

    eq = st.equity_now()
    start = cfg["start_balance_usd"]
    ops = st.open_positions()
    day0 = int(now) - int(now) % 86400
    n_today = st.one("SELECT COUNT(*) n FROM positions WHERE entry_ts>=?", (day0,))["n"]
    day_open = st.meta(f"day_open_equity:{day0}") or eq
    pause = st.meta("pause_until", 0)
    status = "PAUSED" if desk.paused.is_set() else (f"PAUSED to {utc(pause, '%H:%M')}" if pause > now else "LIVE")
    add(f" TRENCH DESK · {cfg['mode'].upper()} · {utc(now)} UTC · judge {cfg['judge']['backend']} · config {cfg['_hash']} · {status}",
        "title")
    add(f" Equity {money(eq)} ({(eq / start - 1) * 100:+.2f}%)   Cash {money(st.cash())}   Day {(eq / day_open - 1) * 100:+.2f}%   "
        f"Open {len(ops)}/{cfg['limits']['max_open_positions']}   Trades today {n_today}/{cfg['limits']['max_trades_per_day']}   "
        f"Size cap {cfg['sniper']['max_pct_of_balance'] * 100:.0f}% = {money(eq * cfg['sniper']['max_pct_of_balance'])}",
        "green" if eq >= start else "red")
    add("")

    # equity curve (left) + seats (right)
    ch_w = max(20, width // 2 - 4)
    ch_h = 8
    pts = [r["equity"] for r in st.q("SELECT equity FROM equity ORDER BY ts DESC LIMIT ?", (ch_w,))][::-1]
    rows, lo, hi = equity_chart(pts or [eq], ch_w, ch_h)
    seat_lines = [f" {'SEAT':<7}{'in':>5}{'out':>5}{'kill':>5}  doing / last"]
    for s in SEATS:
        x = desk.status[s]
        seat_lines.append(f" {s:<7}{x['n_in']:>5}{x['n_out']:>5}{x['n_kill']:>5}  {x['state'][:18]:<18} {x['last']}")
    feeds = getattr(desk, "feeds", {})
    if feeds:
        seat_lines.append(" feeds: " + " · ".join(f"{k} {v}" for k, v in feeds.items()))
    add(f" EQUITY CURVE  hi {money(hi) if hi else '–'}".ljust(ch_w + 4) + seat_lines[0], "cyan")
    for i in range(ch_h):
        right = seat_lines[i + 1] if i + 1 < len(seat_lines) else ""
        out.append(((" │" + rows[i] + "  " + right)[:width].ljust(width), "chart"))
    add(f" └ lo {money(lo) if lo else '–'}".ljust(ch_w + 4) + (seat_lines[ch_h + 1] if len(seat_lines) > ch_h + 1 else ""), "dim")
    add("")

    staged = st.q("SELECT * FROM orders WHERE status='staged' ORDER BY id")
    add(f" STAGED · waiting for your signature ({len(staged)})", "yellow")
    for o in staged:
        left = int(o["expires_ts"] - now)
        add(f"   {tag(o['lead_id'])} BUY {o['symbol']:<10} {money(o['size_usd']):>9} @ {SR.price_fmt(o['price']):<14} "
            f"expires {left // 60}:{left % 60:02d}   → type: APPROVE {tag(o['lead_id'])}  or  REJECT {tag(o['lead_id'])}", "yellow")
    if not staged:
        add("   none", "dim")
    add(f" POSITIONS ({len(ops)})", "cyan")
    for p in ops:
        ret = (p["last_price"] / p["entry_price"] - 1) * 100
        stop_pct = (p["stop_price"] / p["entry_price"] - 1) * 100
        mins = int((now - p["entry_ts"]) / 60)
        add(f"   {tag(p['lead_id'])} {p['symbol']:<10} {money(p['size_usd'] * p['remaining']):>9}  {ret:+6.1f}%  "
            f"stop {stop_pct:+.1f}%{' (trailing)' if p['trail_active'] else ''}  peak {(p['peak_price'] / p['entry_price'] - 1) * 100:+.1f}%  "
            f"{mins}/{cfg['exit']['time_stop_min']} min", "green" if ret >= 0 else "red")
    if not ops:
        add("   none", "dim")
    add("")

    used = len(out) + 3
    room = max(3, height - used)
    add(" THREAD", "cyan")
    for e in st.recent_events(room)[-room:]:
        add(f" {utc(e['ts'])} {e['seat']:<6} {e['msg']}", KIND_COLOR.get(e["kind"], "white"))
    while len(out) < height - 1:
        add("")
    out = out[:height - 1]
    out.append(((f" > {cmd}" + (f"    {note}" if note else ""))[:width].ljust(width), "input"))
    return out


def run(desk, handle_command):
    def main(scr):
        curses.curs_set(1)
        scr.nodelay(True)
        curses.start_color()
        curses.use_default_colors()
        pal = {"white": (curses.COLOR_WHITE, -1), "green": (curses.COLOR_GREEN, -1), "red": (curses.COLOR_RED, -1),
               "yellow": (curses.COLOR_YELLOW, -1), "cyan": (curses.COLOR_CYAN, -1), "dim": (curses.COLOR_WHITE, -1),
               "title": (curses.COLOR_BLACK, curses.COLOR_CYAN), "chart": (curses.COLOR_GREEN, -1),
               "input": (curses.COLOR_WHITE, -1)}
        attr = {}
        for i, (k, (fg, bg)) in enumerate(pal.items(), 1):
            curses.init_pair(i, fg, bg)
            attr[k] = curses.color_pair(i) | (curses.A_DIM if k == "dim" else 0) | (curses.A_BOLD if k in ("title", "input") else 0)
        buf, note, last = "", "commands: APPROVE #id · REJECT #id · FILL #id price · PAUSE · RESUME · REPORT · QUIT", 0
        while not desk.stop.is_set():
            try:
                ch = scr.get_wch()
            except curses.error:
                ch = None
            if ch is not None:
                if ch in ("\n", "\r", curses.KEY_ENTER):
                    if buf.strip():
                        note = handle_command(buf.strip(), "terminal") or ""
                    buf = ""
                elif ch in (curses.KEY_BACKSPACE, "\b", "\x7f"):
                    buf = buf[:-1]
                elif isinstance(ch, str) and ch.isprintable():
                    buf += ch
            if time.time() - last > 0.25 or ch is not None:
                h, w = scr.getmaxyx()
                for y, (text, color) in enumerate(render(desk, w - 1, h, buf, note)):
                    try:
                        scr.addstr(y, 0, text, attr.get(color, 0))
                    except curses.error:
                        pass
                scr.move(h - 1, min(w - 2, 3 + len(buf)))
                scr.refresh()
                last = time.time()
            time.sleep(0.03)
    curses.wrapper(main)
