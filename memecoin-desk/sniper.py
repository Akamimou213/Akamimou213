"""SNIPER stages orders and waits for APPROVE #id. EXIT manages every open position.

Capital-preservation rules enforced in code (config.json -> sniper / exit / limits):
  * SNIPER only stages a lead whose stored RISK result is "pass" and whose JUDGE gate is "buy".
  * Size = 8% of current equity, never more; also capped at 2% of pool liquidity and by cash.
    Judge confidence never changes size: a 0.92 buy gets the same size as a 0.71 buy.
  * No averaging down: never a second order on a mint with an open position.
  * No revenge trades: after a losing close, no new order for 30 min; never re-enter a mint that
    stopped you out in the last 24 h; 3 losses in a row pause the desk until the next UTC day.
  * Daily loss stop -5% of the day's opening equity; max 5 open positions; max 10 trades a day.
  * An approval is refused if it arrives after 3 minutes or after price ran 5% above the staged quote.
  * EXIT: hard stop -6% from fill; trailing stop only after +12% (6% under the peak); 60-min time
    stop; liquidity pull (pool -50%) exits at once. A stop fills at the price actually seen.

Modes: "paper" fills at the live quote plus price impact and fees. "manual" also prints the
Jupiter link and amount so you sign the swap in your own wallet; correct the fill with FILL #id
<price>. The desk never holds a private key and never signs.
"""
import json
import time

from core import S, SR, ds_pairs_by_mint, f, main_pair, tag, utc
from exits import ExitState


def dump_state(s):
    return dict(stop=s.stop, peak=s.peak, armed=s.armed, left=s.left, fills=s.fills, done=s.done)


def load_state(plan, entry, t0, raw):
    s = ExitState(plan, entry, t0)
    if raw:
        d = json.loads(raw) if isinstance(raw, str) else raw
        s.stop, s.peak, s.armed, s.left, s.done = d["stop"], d["peak"], d["armed"], d["left"], d["done"]
        s.fills = [tuple(x) for x in d["fills"]]
    return s


def position_fraction(cfg):
    """Share of equity per trade. Sized so a full stop-out (stop + fees) costs risk_per_trade_pct of the
    account, never more than max_pct_of_balance. Judge confidence never enters this."""
    sc, plan = cfg["sniper"], cfg["exit"]["plan"]
    risk = sc.get("risk_per_trade_pct")
    if not risk:
        return sc["max_pct_of_balance"]
    loss_if_stopped = plan["sl"] + 2 * sc["fee_per_side"]
    return min(sc["max_pct_of_balance"], risk / 100 / loss_if_stopped)


def day_start(ts):
    g = time.gmtime(ts)
    return int(ts) - g.tm_hour * 3600 - g.tm_min * 60 - g.tm_sec


class Limits:
    def __init__(self, desk):
        self.d = desk

    def check(self, mint):
        """None if a new order is allowed, else the reason it is not."""
        d, st, L = self.d, self.d.store, self.d.cfg["limits"]
        now = int(d.clock())
        if d.paused.is_set():
            return "desk paused"
        pause_until = st.meta("pause_until", 0)
        if pause_until > now:
            return f"paused until {utc(pause_until, '%m-%d %H:%M')} UTC ({st.meta('pause_reason', '')})"
        if st.one("SELECT id FROM positions WHERE mint=? AND status='open'", (mint,)):
            return "already holding this token: no averaging down"
        if st.one("SELECT id FROM orders WHERE mint=? AND status='staged'", (mint,)):
            return "an order for this token is already staged"
        recent_stop = st.one("SELECT exit_ts FROM positions WHERE mint=? AND status='closed' AND pnl_usd<0 AND exit_ts>=?",
                             (mint, now - L["no_reentry_after_stop_hours"] * 3600))
        if recent_stop:
            return f"this token stopped you out at {utc(recent_stop['exit_ts'], '%H:%M')}: no re-entry for {L['no_reentry_after_stop_hours']} h"
        last_loss = st.one("SELECT exit_ts FROM positions WHERE status='closed' AND pnl_usd<0 ORDER BY exit_ts DESC LIMIT 1")
        if last_loss and now - last_loss["exit_ts"] < L["cooldown_after_loss_min"] * 60:
            left = L["cooldown_after_loss_min"] - (now - last_loss["exit_ts"]) // 60
            return f"cooldown after a loss: {left} min left (no revenge trades)"
        if len(st.open_positions()) >= L["max_open_positions"]:
            return f"{L['max_open_positions']} positions already open"
        n_today = st.one("SELECT COUNT(*) n FROM positions WHERE entry_ts>=?", (day_start(now),))["n"]
        if n_today >= L["max_trades_per_day"]:
            return f"{L['max_trades_per_day']} trades already today"
        open_eq = st.meta(f"day_open_equity:{day_start(now)}")
        if open_eq is None:
            open_eq = st.equity_now()
            st.set_meta(f"day_open_equity:{day_start(now)}", open_eq)
        dd = (st.equity_now() / open_eq - 1) * 100 if open_eq else 0
        if dd <= L["daily_loss_stop_pct"]:
            return f"daily loss stop hit ({dd:.1f}% today)"
        return None

    def after_close(self, pnl):
        st, L = self.d.store, self.d.cfg["limits"]
        streak = st.meta("loss_streak", 0)
        streak = streak + 1 if pnl < 0 else 0
        st.set_meta("loss_streak", streak)
        if streak >= L["pause_after_consecutive_losses"]:
            until = day_start(self.d.clock()) + 86400
            st.set_meta("pause_until", until)
            st.set_meta("pause_reason", f"{streak} losses in a row")
            st.set_meta("loss_streak", 0)
            self.d.say("EXIT", "warn", f"{streak} losses in a row: desk paused until 00:00 UTC")


class Sniper:
    seat = "SNIPER"

    def __init__(self, desk):
        self.d = desk
        self.limits = Limits(desk)

    def loop(self):
        while not self.d.stop.is_set():
            lead_id = self.d.take(self.seat, timeout=0.5)
            if lead_id is not None:
                self.stage(lead_id)
            self.expire()
            n = self.d.store.one("SELECT COUNT(*) n FROM orders WHERE status='staged'")["n"]
            self.d.busy(self.seat, f"{n} staged, waiting for APPROVE" if n else "idle")

    def stage(self, lead_id):
        d, st, sc = self.d, self.d.store, self.d.cfg["sniper"]
        lead = st.lead(lead_id)
        # hard handoff: never stage anything RISK didn't pass and JUDGE didn't buy
        if (lead.get("risk") or {}).get("status") != "pass" or ((lead.get("verdict") or {}).get("gate") or {}).get("final") != "buy":
            return d.say(self.seat, "reject", f"{tag(lead_id)} refused: not passed by RISK and JUDGE", lead_id)
        why = self.limits.check(lead["mint"])
        if why:
            st.set_lead(lead_id, status="blocked", kill_reason=f"SNIPER: {why}")
            return d.say(self.seat, "reject", f"{tag(lead_id)} not staged — {why}", lead_id)
        try:
            p = main_pair(ds_pairs_by_mint([lead["mint"]]).get(lead["mint"]) or [], lead["mint"]) or {}
        except S.SourceError as e:
            return d.say(self.seat, "reject", f"{tag(lead_id)} not staged — no quote ({e})", lead_id)
        price, liq = f(p.get("priceUsd")), f((p.get("liquidity") or {}).get("usd"))
        if not price or not liq:
            return d.say(self.seat, "reject", f"{tag(lead_id)} not staged — no price or liquidity", lead_id)
        size = min(st.equity_now() * position_fraction(d.cfg), liq * sc["max_pct_of_pool_liquidity"], st.cash())
        if size < sc["min_order_usd"]:
            return d.say(self.seat, "reject", f"{tag(lead_id)} not staged — size {SR.usd(size)} under minimum", lead_id)
        now = int(d.clock())
        oid = st.x("INSERT INTO orders (lead_id, mint, symbol, staged_ts, expires_ts, price, size_usd, liquidity, status) "
                   "VALUES (?,?,?,?,?,?,?,?, 'staged')",
                   (lead_id, lead["mint"], lead["symbol"], now, now + sc["approve_ttl_sec"], price, size, liq))
        st.set_lead(lead_id, status="staged", stage="SNIPER")
        stop = price * (1 - d.cfg["exit"]["plan"]["sl"])
        d.say(self.seat, "staged",
              f"{tag(lead_id)} STAGED BUY {lead['symbol']} {SR.usd(size)} @ {SR.price_fmt(price)} "
              f"({size / liq * 100:.2f}% of pool) · stop {SR.price_fmt(stop)} · reply APPROVE {tag(lead_id)} "
              f"within {sc['approve_ttl_sec'] // 60} min", lead_id, data=dict(order_id=oid))

    def expire(self):
        now = int(self.d.clock())
        for o in self.d.store.q("SELECT * FROM orders WHERE status='staged' AND expires_ts<?", (now,)):
            self.d.store.x("UPDATE orders SET status='expired', decided_ts=?, note='no approval in time' WHERE id=?", (now, o["id"]))
            self.d.store.set_lead(o["lead_id"], status="expired", kill_reason="SNIPER: approval window passed")
            self.d.say(self.seat, "reject", f"{tag(o['lead_id'])} order expired: no APPROVE in time", o["lead_id"])

    # ---------------------------------------------------------------- your signature
    def approve(self, lead_id, origin="terminal"):
        d, st, sc = self.d, self.d.store, self.d.cfg["sniper"]
        o = st.one("SELECT * FROM orders WHERE lead_id=? AND status='staged' ORDER BY id DESC LIMIT 1", (lead_id,))
        if not o:
            return d.say(self.seat, "warn", f"APPROVE {tag(lead_id)}: no staged order")
        now = int(d.clock())
        if now > o["expires_ts"]:
            st.x("UPDATE orders SET status='expired', decided_ts=? WHERE id=?", (now, o["id"]))
            return d.say(self.seat, "reject", f"{tag(lead_id)} approval too late: order expired", lead_id)
        st.x("UPDATE orders SET status='checking' WHERE id=?", (o["id"],))
        why = self.limits.check(o["mint"])
        if why:
            st.x("UPDATE orders SET status='refused', decided_ts=?, note=? WHERE id=?", (now, why, o["id"]))
            return d.say(self.seat, "reject", f"{tag(lead_id)} approval refused — {why}", lead_id)
        try:
            p = main_pair(ds_pairs_by_mint([o["mint"]]).get(o["mint"]) or [], o["mint"]) or {}
        except S.SourceError as e:
            st.x("UPDATE orders SET status='staged' WHERE id=?", (o["id"],))
            return d.say(self.seat, "warn", f"{tag(lead_id)} no fresh quote ({e}); approve again", lead_id)
        px, liq = f(p.get("priceUsd")), f((p.get("liquidity") or {}).get("usd")) or o["liquidity"]
        if not px:
            st.x("UPDATE orders SET status='staged' WHERE id=?", (o["id"],))
            return d.say(self.seat, "warn", f"{tag(lead_id)} no fresh price; approve again", lead_id)
        moved = (px / o["price"] - 1) * 100
        if moved > sc["reject_if_price_moved_up_pct"]:
            st.x("UPDATE orders SET status='refused', decided_ts=?, note=? WHERE id=?", (now, f"price +{moved:.1f}%", o["id"]))
            st.set_lead(lead_id, status="refused", kill_reason=f"SNIPER: price ran +{moved:.1f}% before approval")
            return d.say(self.seat, "reject", f"{tag(lead_id)} refused — price ran +{moved:.1f}% since staging (no chasing)", lead_id)
        size = min(o["size_usd"], st.cash())
        impact = size / liq if liq else 0
        fill = px * (1 + impact)
        cost = size
        st.set_cash(st.cash() - cost)
        stop = fill * (1 - d.cfg["exit"]["plan"]["sl"])
        pid = st.x("INSERT INTO positions (order_id, lead_id, mint, symbol, entry_ts, entry_price, size_usd, cost_usd, peak_price, "
                   "last_price, last_liq, stop_price, status, plan) VALUES (?,?,?,?,?,?,?,?,?,?,?,?, 'open', ?)",
                   (o["id"], lead_id, o["mint"], o["symbol"], now, fill, size * (1 - sc["fee_per_side"]), cost, fill, fill, liq, stop,
                    json.dumps(d.cfg["exit"]["plan"])))
        st.x("UPDATE orders SET status='filled', decided_ts=?, note=? WHERE id=?", (now, f"approved via {origin}", o["id"]))
        st.set_lead(lead_id, status="traded", stage="EXIT")
        st.record_equity()
        d.say(self.seat, "fill", f"{tag(lead_id)} FILLED {o['symbol']} {SR.usd(size)} @ {SR.price_fmt(fill)} "
                                 f"(quote {SR.price_fmt(px)}, impact {impact * 100:.2f}%, fee {sc['fee_per_side'] * 100:.2f}%) · "
                                 f"stop {SR.price_fmt(stop)} · approved via {origin}", lead_id, data=dict(position_id=pid))
        if d.cfg["mode"] == "manual":
            d.say(self.seat, "info", f"{tag(lead_id)} sign it yourself: https://jup.ag/swap/SOL-{o['mint']} for {SR.usd(size)}; "
                                     f"then FILL {tag(lead_id)} <your price> to correct the entry", lead_id)

    def reject(self, lead_id, origin="terminal"):
        st = self.d.store
        o = st.one("SELECT * FROM orders WHERE lead_id=? AND status='staged' ORDER BY id DESC LIMIT 1", (lead_id,))
        if not o:
            return self.d.say(self.seat, "warn", f"REJECT {tag(lead_id)}: no staged order")
        st.x("UPDATE orders SET status='rejected', decided_ts=?, note=? WHERE id=?", (int(self.d.clock()), f"by you via {origin}", o["id"]))
        st.set_lead(lead_id, status="rejected", kill_reason="you rejected it")
        self.d.say(self.seat, "reject", f"{tag(lead_id)} rejected by you", lead_id)

    def correct_fill(self, lead_id, price):
        st = self.d.store
        p = st.one("SELECT * FROM positions WHERE lead_id=? AND status='open'", (lead_id,))
        if not p:
            return self.d.say(self.seat, "warn", f"FILL {tag(lead_id)}: no open position")
        stop = price * (1 - self.d.cfg["exit"]["plan"]["sl"])
        st.x("UPDATE positions SET entry_price=?, peak_price=MAX(peak_price, ?), stop_price=?, state=NULL, shadows=NULL WHERE id=?",
             (price, price, stop, p["id"]))
        self.d.say(self.seat, "info", f"{tag(lead_id)} entry corrected to {SR.price_fmt(price)}; stop {SR.price_fmt(stop)}", lead_id)


class Exit:
    seat = "EXIT"

    def __init__(self, desk, limits):
        self.d, self.limits = desk, limits

    def loop(self):
        while not self.d.stop.is_set():
            ops = self.d.store.open_positions()
            shadow = self.shadow_only()
            self.d.busy(self.seat, f"managing {len(ops)}" if ops else "idle")
            if ops or shadow:
                try:
                    pairs = ds_pairs_by_mint([p["mint"] for p in ops + shadow])
                    for p in ops:
                        q = main_pair(pairs.get(p["mint"]) or [], p["mint"]) or {}
                        self.tick(p, f(q.get("priceUsd")), f((q.get("liquidity") or {}).get("usd")))
                    for p in shadow:
                        q = main_pair(pairs.get(p["mint"]) or [], p["mint"]) or {}
                        px = f(q.get("priceUsd"))
                        if not px:
                            continue
                        if not p["entry_price"]:
                            self.d.store.x("UPDATE positions SET entry_price=?, entry_ts=? WHERE id=?", (px, int(self.d.clock()), p["id"]))
                            continue
                        self.tick_shadows(p, px, int(self.d.clock()))
                except S.SourceError as e:
                    self.d.say(self.seat, "warn", f"quote failed ({e}); stops still armed, retrying")
            self.d.stop.wait(self.d.cfg["exit"]["poll_sec"])

    def tick(self, p, px, liq, now=None):
        """One price update for one position: the live plan, then every shadow plan. Testable offline."""
        ec, st = self.d.cfg["exit"], self.d.store
        now = int(now or self.d.clock())
        if px is None:
            return None
        plan = json.loads(p["plan"]) if p.get("plan") else ec["plan"]
        state = load_state(plan, p["entry_price"], p["entry_ts"], p.get("state"))
        was_armed = state.armed
        shadows = self.tick_shadows(p, px, now)
        fills = state.bar(now, px, px, px, px)
        start_liq = (st.one("SELECT liquidity FROM orders WHERE id=?", (p["order_id"],)) or {}).get("liquidity")
        if liq is not None and start_liq and liq < start_liq * (1 - ec["liquidity_pull_exit_drop_pct"] / 100) and not state.done:
            fills = [state._sell(state.left, px if liq > 100 else 0.0, f"liquidity pulled ({SR.usd(liq)})")]
        if state.armed and not was_armed:
            self.d.say(self.seat, "info", f"{tag(p['lead_id'])} +{(state.peak / p['entry_price'] - 1) * 100:.1f}%: trailing stop armed "
                                          f"{plan['trail'] * 100:.0f}% under the peak", p["lead_id"])
        st.x("UPDATE positions SET last_price=?, last_liq=?, peak_price=?, stop_price=?, trail_active=?, state=?, shadows=? WHERE id=?",
             (px, liq, state.peak, state.stop, int(state.armed), json.dumps(dump_state(state)), json.dumps(shadows), p["id"]))
        why = None
        for frac, fpx, reason in fills:
            p = st.one("SELECT * FROM positions WHERE id=?", (p["id"],))
            if reason == "stop":
                reason = f"stop -{plan['sl'] * 100:.0f}%"
            elif reason == "trailing stop":
                reason = f"trailing stop ({(state.stop / p['entry_price'] - 1) * 100:+.1f}% level, peak {(state.peak / p['entry_price'] - 1) * 100:+.1f}%)"
            elif reason == "take profit":
                reason = f"take profit {plan['tp']:g}x"
            elif reason == "time stop":
                reason = f"time stop {plan['tmax']} min"
            why = self.sell(p, fpx, liq, frac, reason, now)
        return why

    def tick_shadows(self, p, px, now):
        """What the other plans would have done with this exact trade. Keeps running after the real close."""
        st, ec = self.d.store, self.d.cfg["exit"]
        shadows = json.loads(p["shadows"]) if p.get("shadows") else {}
        for sp in ec.get("shadow_plans") or []:
            ss = load_state(sp, p["entry_price"], p["entry_ts"], shadows.get(sp["name"]))
            if not ss.done:
                ss.bar(now, px, px, px, px)
                if ss.done:
                    net = ss.gross() * (1 - 2 * self.d.cfg["sniper"]["fee_per_side"]) - 1
                    st.x("INSERT INTO shadow_results VALUES (?,?,?,?,?,?)",
                         (p["id"], p["lead_id"], sp["name"], net, ss.fills[-1][2], now))
            shadows[sp["name"]] = dump_state(ss)
        if p["status"] != "open":
            st.x("UPDATE positions SET shadows=? WHERE id=?", (json.dumps(shadows), p["id"]))
        return shadows

    def shadow_only(self):
        """Closed trades and shadow-book entries whose shadow plans haven't all exited yet."""
        out, now = [], int(self.d.clock())
        for p in self.d.store.q("SELECT * FROM positions WHERE (status='closed' AND exit_ts>=?) OR (status='shadow' AND entry_ts>=?)",
                                (now - 4 * 3600, now - 4 * 3600)):
            sh = json.loads(p["shadows"]) if p["shadows"] else {}
            fresh = p["status"] == "shadow" and (not p["entry_price"] or not sh)
            if fresh or any(not v.get("done") for v in sh.values()):
                out.append(p)
        return out

    def open_shadow(self, lead_id, mint, symbol, tags):
        """Shadow book: a paper-only entry for a lead RISK passed, whatever JUDGE said. No cash moves.
        Entry is the first price EXIT sees after this (you are never instant)."""
        if not self.d.cfg["exit"].get("shadow_book", True):
            return
        self.d.store.x("INSERT INTO positions (lead_id, mint, symbol, entry_ts, size_usd, cost_usd, status, tags) "
                       "VALUES (?,?,?,?,0,0,'shadow',?)", (lead_id, mint, symbol, int(self.d.clock()), json.dumps(tags)))

    def sell(self, p, px, liq, frac, why, now):
        st, sc = self.d.store, self.d.cfg["sniper"]
        frac = min(frac, p["remaining"])
        notional = p["size_usd"] * frac * px / p["entry_price"]
        impact = min(notional / liq, 1.0) if liq else 0.0
        proceeds = notional * (1 - impact) * (1 - sc["fee_per_side"])
        st.set_cash(st.cash() + proceeds)
        remaining = round(p["remaining"] - frac, 6)
        total = (p["proceeds_usd"] or 0) + proceeds
        if remaining <= 1e-6:
            pnl = total - p["cost_usd"]
            ret = pnl / p["cost_usd"]
            st.x("UPDATE positions SET remaining=0, status='closed', exit_ts=?, exit_price=?, exit_reason=?, proceeds_usd=?, "
                 "pnl_usd=?, ret=? WHERE id=?", (now, px, why, total, pnl, ret, p["id"]))
            st.set_lead(p["lead_id"], status="closed")
            self.d.say(self.seat, "close", f"{tag(p['lead_id'])} CLOSED {p['symbol']} — {why} · {ret * 100:+.1f}% "
                                           f"({SR.usd(pnl) if pnl >= 0 else '-' + SR.usd(-pnl)}) after fees", p["lead_id"])
            self.limits.after_close(pnl)
        else:
            st.x("UPDATE positions SET remaining=?, proceeds_usd=? WHERE id=?", (remaining, total, p["id"]))
            self.d.say(self.seat, "info", f"{tag(p['lead_id'])} sold {frac * 100:.0f}% — {why}", p["lead_id"])
        st.record_equity()
        return why
