"""Optional Telegram push for collector alerts.

Set TELEGRAM_BOT_TOKEN (from @BotFather) and TELEGRAM_CHAT_ID (your user or group id).
Without them, alerts only go to the console and the dashboard.
"""
import json
import os
import urllib.parse
import urllib.request

import rules


def enabled():
    return bool(os.environ.get("TELEGRAM_BOT_TOKEN") and os.environ.get("TELEGRAM_CHAT_ID"))


def send(text):
    if not enabled():
        return False
    url = f"https://api.telegram.org/bot{os.environ['TELEGRAM_BOT_TOKEN']}/sendMessage"
    body = urllib.parse.urlencode(dict(chat_id=os.environ["TELEGRAM_CHAT_ID"], text=text,
                                       disable_web_page_preview="true")).encode()
    try:
        with urllib.request.urlopen(urllib.request.Request(url, data=body), timeout=15) as r:
            return json.load(r).get("ok", False)
    except Exception as e:  # never let a notification failure stop the collector
        print("telegram:", e, flush=True)
        return False


def alert(d, g, skipped=None):
    e = d.get("exits") or {}
    s = d.get("sizing") or {}
    lines = [
        f"{d['verdict']}: {d.get('symbol')} ({d.get('chain')})",
        d.get("address", ""),
        f"vol30 {rules.usd(g['vol30'])} · {-g['off_high'] * 100:.1f}% below 60m high · liq {rules.usd(d.get('liquidity'))} · mcap {rules.usd(d.get('mcap'))}",
        f"price {rules.price_fmt(d.get('price'))} → TP {rules.price_fmt(e.get('take_profit'))} / SL {rules.price_fmt(e.get('stop'))} / 60 min",
    ]
    if s:
        lines.append(f"size {rules.usd(s.get('position'))}" + (" (half)" if s.get("half_size") else ""))
    if skipped:
        lines.append(f"paper trade skipped: {skipped}")
    warns = [c["label"] for c in d.get("checks", []) if c["status"] == "warn"]
    if warns:
        lines.append("check: " + ", ".join(warns))
    if d.get("url"):
        lines.append(d["url"])
    lines.append("Re-check the chart before buying.")
    send("\n".join(lines))


def closed(tr, res, pnl):
    send(f"paper {res['exit_reason']}: {tr['symbol']} {res['ret'] * 100:+.1f}% ({rules.usd(pnl)})")
