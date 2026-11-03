"""SQLite store for the desk. One file (data/desk.db), shared by every seat and the CLI.

Every seat writes what it decided and why: the thread (`events`) is the desk's memory and the
source of the evening report and the Sunday calibration table.
"""
import json
import os
import sqlite3
import threading
import time

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_DB = os.path.join(HERE, "data", "desk.db")

SCHEMA = """
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT, mint TEXT, symbol TEXT, name TEXT, source TEXT, reason TEXT,
  creator TEXT, pool TEXT, created_ts INTEGER, stage TEXT, status TEXT, kill_reason TEXT,
  risk TEXT, whale TEXT, dossier TEXT, verdict TEXT, watch_count INTEGER DEFAULT 0, next_ask_ts INTEGER,
  price_at_verdict REAL, verdict_ts INTEGER, price_24h REAL, followup_ts INTEGER);
CREATE INDEX IF NOT EXISTS leads_mint ON leads (mint, created_ts);
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT, ts REAL, seat TEXT, lead_id INTEGER, kind TEXT, msg TEXT, data TEXT);
CREATE INDEX IF NOT EXISTS events_ts ON events (ts);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT, lead_id INTEGER, mint TEXT, symbol TEXT, staged_ts INTEGER,
  expires_ts INTEGER, price REAL, size_usd REAL, liquidity REAL, status TEXT, decided_ts INTEGER, note TEXT);
CREATE TABLE IF NOT EXISTS positions (
  id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER, lead_id INTEGER, mint TEXT, symbol TEXT,
  entry_ts INTEGER, entry_price REAL, size_usd REAL, cost_usd REAL, remaining REAL DEFAULT 1.0,
  peak_price REAL, last_price REAL, last_liq REAL, stop_price REAL, trail_active INTEGER DEFAULT 0,
  status TEXT, exit_ts INTEGER, exit_price REAL, exit_reason TEXT, proceeds_usd REAL DEFAULT 0, pnl_usd REAL, ret REAL);
CREATE TABLE IF NOT EXISTS equity (ts INTEGER, cash REAL, equity REAL);
CREATE TABLE IF NOT EXISTS watch (
  mint TEXT PRIMARY KEY, source TEXT, first_seen INTEGER, creator TEXT, pool TEXT, last_check INTEGER,
  vol_h1 REAL, liq REAL, status TEXT, last_lead_ts INTEGER, note TEXT);
CREATE TABLE IF NOT EXISTS snaps (mint TEXT, ts INTEGER, price REAL, liq REAL, mcap REAL, vol_h1 REAL,
  buys_m5 INTEGER, sells_m5 INTEGER, holders INTEGER);
CREATE INDEX IF NOT EXISTS snaps_mint ON snaps (mint, ts);
CREATE TABLE IF NOT EXISTS rug_registry (wallet TEXT, role TEXT, mint TEXT, ts INTEGER, note TEXT,
  PRIMARY KEY (wallet, mint));
CREATE TABLE IF NOT EXISTS whale_buys (wallet TEXT, label TEXT, mint TEXT, ts INTEGER, sol REAL, side TEXT, sig TEXT PRIMARY KEY);
CREATE INDEX IF NOT EXISTS wb_mint ON whale_buys (mint, ts);
CREATE TABLE IF NOT EXISTS commands (id INTEGER PRIMARY KEY AUTOINCREMENT, ts REAL, origin TEXT, text TEXT, done INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT);
"""


class Store:
    """Thread-safe wrapper: one connection, one lock. Seats call small methods, never raw SQL."""

    def __init__(self, path=DEFAULT_DB):
        if path != ":memory:":
            os.makedirs(os.path.dirname(path), exist_ok=True)
        self.db = sqlite3.connect(path, timeout=30, check_same_thread=False)
        self.db.row_factory = sqlite3.Row
        if path != ":memory:":
            self.db.execute("PRAGMA journal_mode=WAL")
        self.db.executescript(SCHEMA)
        self.lock = threading.RLock()

    # ---------------------------------------------------------------- generic
    def q(self, sql, args=()):
        with self.lock:
            return [dict(r) for r in self.db.execute(sql, args)]

    def one(self, sql, args=()):
        r = self.q(sql, args)
        return r[0] if r else None

    def x(self, sql, args=()):
        with self.lock:
            cur = self.db.execute(sql, args)
            self.db.commit()
            return cur.lastrowid

    def meta(self, k, default=None):
        r = self.one("SELECT v FROM meta WHERE k=?", (k,))
        return json.loads(r["v"]) if r else default

    def set_meta(self, k, v):
        self.x("INSERT OR REPLACE INTO meta VALUES (?, ?)", (k, json.dumps(v)))

    # ---------------------------------------------------------------- thread
    def event(self, seat, kind, msg, lead_id=None, data=None, ts=None):
        return self.x("INSERT INTO events (ts, seat, lead_id, kind, msg, data) VALUES (?,?,?,?,?,?)",
                      (ts if ts is not None else time.time(), seat, lead_id, kind, msg, json.dumps(data) if data is not None else None))

    def recent_events(self, n=200):
        return list(reversed(self.q("SELECT * FROM events ORDER BY id DESC LIMIT ?", (n,))))

    # ---------------------------------------------------------------- leads
    def lead(self, lead_id):
        r = self.one("SELECT * FROM leads WHERE id=?", (lead_id,))
        if r:
            for k in ("risk", "whale", "dossier", "verdict"):
                r[k] = json.loads(r[k]) if r[k] else None
        return r

    def set_lead(self, lead_id, **kv):
        for k in ("risk", "whale", "dossier", "verdict"):
            if k in kv and not isinstance(kv[k], (str, type(None))):
                kv[k] = json.dumps(kv[k])
        cols = ", ".join(f"{k}=?" for k in kv)
        self.x(f"UPDATE leads SET {cols} WHERE id=?", (*kv.values(), lead_id))

    # ---------------------------------------------------------------- snapshots
    def snap(self, mint, ts, price=None, liq=None, mcap=None, vol_h1=None, buys_m5=None, sells_m5=None, holders=None):
        self.x("INSERT INTO snaps VALUES (?,?,?,?,?,?,?,?,?)", (mint, int(ts), price, liq, mcap, vol_h1, buys_m5, sells_m5, holders))

    def snap_near(self, mint, ts, field, tol=900):
        """Snapshot closest to `ts` (within ±`tol` s) that has `field` set."""
        return self.one(f"SELECT * FROM snaps WHERE mint=? AND ts BETWEEN ? AND ? AND {field} IS NOT NULL "
                        "ORDER BY ABS(ts - ?) LIMIT 1", (mint, int(ts - tol), int(ts + tol), int(ts)))

    # ---------------------------------------------------------------- money
    def cash(self):
        return float(self.meta("cash", 0.0))

    def set_cash(self, v):
        self.set_meta("cash", round(v, 6))

    def open_positions(self):
        return self.q("SELECT * FROM positions WHERE status='open' ORDER BY id")

    def equity_now(self):
        eq = self.cash()
        for p in self.open_positions():
            px = p["last_price"] or p["entry_price"]
            eq += p["size_usd"] * p["remaining"] * px / p["entry_price"]
        return eq

    def record_equity(self):
        self.x("INSERT INTO equity VALUES (?,?,?)", (int(time.time()), self.cash(), self.equity_now()))

    # ---------------------------------------------------------------- commands (APPROVE from any terminal/phone)
    def push_command(self, text, origin="cli"):
        return self.x("INSERT INTO commands (ts, origin, text) VALUES (?,?,?)", (time.time(), origin, text.strip()))

    def take_commands(self):
        with self.lock:
            rows = [dict(r) for r in self.db.execute("SELECT * FROM commands WHERE done=0 ORDER BY id")]
            if rows:
                self.db.execute(f"UPDATE commands SET done=1 WHERE id IN ({','.join('?' * len(rows))})", [r["id"] for r in rows])
                self.db.commit()
            return rows
