"""Optional phone link: staged orders, fills, closes and reports go to Telegram, and you can sign
from the phone by replying APPROVE #047 or REJECT #047.

Set TELEGRAM_BOT_TOKEN (from @BotFather) and TELEGRAM_CHAT_ID (your own user id). Commands from
any other chat are ignored and logged.
"""
import json
import os
import urllib.parse
import urllib.request

PUSH_KINDS = {"staged", "fill", "close", "report", "warn"}


def enabled():
    return bool(os.environ.get("TELEGRAM_BOT_TOKEN") and os.environ.get("TELEGRAM_CHAT_ID"))


def _call(method, **params):
    url = f"https://api.telegram.org/bot{os.environ['TELEGRAM_BOT_TOKEN']}/{method}"
    data = urllib.parse.urlencode(params).encode()
    with urllib.request.urlopen(urllib.request.Request(url, data=data), timeout=40) as r:
        return json.load(r)


def send(text):
    if not enabled():
        return False
    try:
        return _call("sendMessage", chat_id=os.environ["TELEGRAM_CHAT_ID"], text=text[:4000],
                     disable_web_page_preview="true").get("ok", False)
    except Exception:
        return False


def listener(desk):
    """Desk listener: forward the events worth a phone buzz."""
    def on_event(ev):
        if ev["kind"] in PUSH_KINDS and ev["seat"] != "HEAD":
            send(f"{ev['seat']}: {ev['msg']}")
    return on_event


def poll_loop(desk):
    """Long-poll for APPROVE / REJECT / PAUSE / RESUME from your chat id only."""
    if not enabled():
        return
    me = str(os.environ["TELEGRAM_CHAT_ID"])
    offset = desk.store.meta("tg_offset", 0)
    while not desk.stop.is_set():
        try:
            res = _call("getUpdates", offset=offset, timeout=30).get("result") or []
        except Exception:
            desk.stop.wait(5)
            continue
        for u in res:
            offset = u["update_id"] + 1
            msg = u.get("message") or {}
            text = (msg.get("text") or "").strip()
            if not text:
                continue
            if str((msg.get("chat") or {}).get("id")) != me:
                desk.say("HEAD", "warn", f"ignored Telegram command from chat {(msg.get('chat') or {}).get('id')}")
                continue
            desk.store.push_command(text, origin="telegram")
        desk.store.set_meta("tg_offset", offset)
