"""SQLite storage for the collector: watched tokens, 1-minute snapshots, alerts and paper trades.

Snapshots of *every* watched coin are kept, not only the ones that alerted, so validate.py can
replay any rule variant on an unbiased sample later.
"""
import json
import os
import sqlite3
import time

DEFAULT_DB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "trench.db")

SCHEMA = """
CREATE TABLE IF NOT EXISTS tokens (
  chain TEXT, address TEXT, symbol TEXT, name TEXT, sources TEXT,
  first_seen INTEGER, last_seen INTEGER, active INTEGER DEFAULT 1, inactive_reason TEXT,
  safety TEXT, safety_ts INTEGER,
  PRIMARY KEY (chain, address));
CREATE TABLE IF NOT EXISTS snaps (
  chain TEXT, address TEXT, ts INTEGER, price REAL, liq REAL, liq_total REAL, mcap REAL,
  vol_m5 REAL, vol_h1 REAL, buys_h1 INTEGER, sells_h1 INTEGER, pair TEXT);
CREATE INDEX IF NOT EXISTS snaps_tok ON snaps (chain, address, ts);
CREATE INDEX IF NOT EXISTS snaps_ts ON snaps (ts);
CREATE TABLE IF NOT EXISTS alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER, chain TEXT, address TEXT, symbol TEXT,
  verdict TEXT, reason TEXT, price REAL, vol30 REAL, off_high REAL, liq REAL, mcap REAL,
  gate_source TEXT, dossier TEXT, trade_id INTEGER, skipped TEXT);
CREATE TABLE IF NOT EXISTS trades (
  id INTEGER PRIMARY KEY AUTOINCREMENT, alert_id INTEGER, chain TEXT, address TEXT, symbol TEXT,
  signal_ts INTEGER, signal_price REAL, entry_ts INTEGER, entry_price REAL, size REAL, half_size INTEGER,
  status TEXT, exit_ts INTEGER, exit_price REAL, exit_reason TEXT, ret REAL, pnl REAL, max_price REAL);
CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT);
"""


def connect(path=DEFAULT_DB):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    db = sqlite3.connect(path, timeout=30, check_same_thread=False)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA journal_mode=WAL")
    db.executescript(SCHEMA)
    return db


def set_meta(db, k, v):
    db.execute("INSERT OR REPLACE INTO meta VALUES (?, ?)", (k, json.dumps(v)))
    db.commit()


def get_meta(db, k, default=None):
    r = db.execute("SELECT v FROM meta WHERE k=?", (k,)).fetchone()
    return json.loads(r["v"]) if r else default


def series(db, chain, address, since=0, until=None):
    q = "SELECT ts, price, liq, liq_total, mcap, vol_m5, vol_h1, buys_h1, sells_h1 FROM snaps WHERE chain=? AND address=? AND ts>=?"
    args = [chain, address, since]
    if until:
        q += " AND ts<=?"
        args.append(until)
    return [dict(r) for r in db.execute(q + " ORDER BY ts", args)]


def now():
    return int(time.time())
