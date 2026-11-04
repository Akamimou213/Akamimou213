"""Shared plumbing for the seven seats: config, the store, the thread, and the hard handoffs.

Hard handoffs: each seat reads only its own inbox, and only the seat before it can put a lead
there. A seat never reaches back up the line or skips ahead:

  SEARCH -> RISK -> WHALE -> (HEAD builds dossier) -> JUDGE -> SNIPER -> [APPROVE #id] -> EXIT

SNIPER additionally re-reads the lead from the store and refuses anything whose recorded RISK
result is not "pass" or whose recorded JUDGE verdict is not "buy", so a bug upstream can't leak
a dead token into an order.
"""
import hashlib
import json
import os
import queue
import sys
import threading
import time

HERE = os.path.dirname(os.path.abspath(__file__))
SCANNER = os.path.join(os.path.dirname(HERE), "memecoin-scanner")
sys.path.append(SCANNER)  # after the desk dir: the scanner also has a store.py

import rules as SR  # noqa: E402  (scanner rules: formatting + contract/LP/holder parsing)
import sources as S  # noqa: E402  (scanner HTTP clients: DexScreener, GeckoTerminal, RugCheck)

SEATS = ["SEARCH", "RISK", "WHALE", "JUDGE", "SNIPER", "EXIT", "HEAD"]
NEXT = {"SEARCH": "RISK", "RISK": "WHALE", "WHALE": "HEAD", "HEAD": "JUDGE", "JUDGE": "SNIPER"}


def load_config(path=None):
    path = path or os.path.join(HERE, "config.json")
    raw = open(path, "rb").read()
    cfg = json.loads(raw)
    cfg["_hash"] = hashlib.sha256(raw).hexdigest()[:12]
    cfg["_path"] = path
    return cfg


class Desk:
    def __init__(self, cfg, store, clock=time.time):
        self.cfg, self.store, self.clock = cfg, store, clock
        self.inbox = {s: queue.Queue() for s in SEATS}
        self.status = {s: dict(state="idle", last="", ts=0, n_in=0, n_out=0, n_kill=0) for s in SEATS}
        self.stop = threading.Event()
        self.paused = threading.Event()
        self.listeners = []           # callables(event dict) — telegram, headless printer
        self.lock = threading.RLock()

    # ---------------------------------------------------------------- thread
    def say(self, seat, kind, msg, lead_id=None, data=None):
        """Post to the thread. Every decision and every rejection goes through here."""
        self.store.event(seat, kind, msg, lead_id, data, ts=self.clock())
        st = self.status[seat]
        st.update(last=msg, ts=self.clock())
        if kind in ("dead", "pass", "reject"):
            st["n_kill"] += 1
        ev = dict(ts=self.clock(), seat=seat, kind=kind, msg=msg, lead_id=lead_id)
        for fn in self.listeners:
            try:
                fn(ev)
            except Exception:
                pass

    def busy(self, seat, state):
        self.status[seat]["state"] = state

    # ---------------------------------------------------------------- handoffs
    def hand(self, from_seat, lead_id):
        to = NEXT[from_seat]
        self.store.set_lead(lead_id, stage=to)
        self.status[from_seat]["n_out"] += 1
        self.status[to]["n_in"] += 1
        self.inbox[to].put(lead_id)

    def take(self, seat, timeout=1.0):
        try:
            return self.inbox[seat].get(timeout=timeout)
        except queue.Empty:
            return None


def tag(lead_id):
    return f"#{lead_id:03d}" if lead_id is not None else ""


def utc(ts=None, fmt="%H:%M:%S"):
    return time.strftime(fmt, time.gmtime(ts if ts is not None else time.time()))


def f(x, default=None):
    try:
        return float(x)
    except (TypeError, ValueError):
        return default


def ds_pairs_by_mint(mints):
    """{mint: [pairs]} for Solana mints, batched 30 per DexScreener call."""
    out = {}
    mints = list(dict.fromkeys(mints))
    for i in range(0, len(mints), 30):
        chunk = mints[i:i + 30]
        for p in S.ds_tokens("solana", chunk) or []:
            m = (p.get("baseToken") or {}).get("address")
            if m in chunk:
                out.setdefault(m, []).append(p)
    return out


def main_pair(pairs, mint):
    return SR.main_pair(pairs or [], mint)


def rpc(cfg, method, params):
    url = os.environ.get("SOLANA_RPC_URL") or cfg["search"]["solana_rpc"]
    import urllib.request
    body = json.dumps(dict(jsonrpc="2.0", id=1, method=method, params=params)).encode()
    req = urllib.request.Request(url, data=body, headers={"content-type": "application/json", "User-Agent": "trench-desk/1.0"})
    last = None
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=20) as r:
                d = json.load(r)
            if "error" in d:
                raise S.SourceError(f"rpc {method}: {d['error'].get('message')}")
            return d.get("result")
        except S.SourceError:
            raise
        except Exception as e:  # 429 / network
            last = e
            time.sleep(1.5 * (attempt + 1))
    raise S.SourceError(f"rpc {method}: {last}")
