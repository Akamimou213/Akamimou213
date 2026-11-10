"""Dev history: who made this coin, what else they made, and who funded them.

`gather(chain, address, creator)` returns the raw facts that rules._dev() judges:

- **Earlier launches** (pump.fun): every bonding curve that names the same creator, found with one
  getProgramAccounts call, mapped to its mint and priced on DexScreener, so "3 earlier coins, all
  dead" is visible at scan time. Other launchpads (LaunchLab, Meteora, Raydium) aren't indexed yet:
  for those coins the check stays unknown.
- **First funder** (Solana): the wallet that sent the creator its first SOL, from its oldest
  transaction. Only traced when the whole history fits one 1,000-signature page.
- **Wallet age** (Solana): first transaction time, same condition.
- **Local registry** (all chains): every scan records creator and funder per coin in
  data/trench.db, so a creator or funder behind coins you've already seen is caught
  (Trench Playbook trap 5: one wallet created Finance Inu and controlled PEAK's metadata).
- **Rug list** (all chains): data/rug_wallets.txt here and in ../memecoin-desk.

Public RPC is rate-limited. Set SOLANA_RPC_URL (a free Helius key is enough) for reliable
results. When the history can't be read, the facts say so and the check reads "unknown":
it never turns into a pass.
"""
import json
import os
import sqlite3
import threading
import time
import urllib.error
import urllib.request

import sources as S

HERE = os.path.dirname(os.path.abspath(__file__))
# Same file as the collector's store (data/trench.db); TRENCH_DB moves it (Vercel can only write to /tmp).
DEFAULT_DB = os.environ.get("TRENCH_DB") or os.path.join(HERE, "data", "trench.db")
RUG_FILES = [os.path.join(HERE, "data", "rug_wallets.txt"),
             os.path.join(HERE, "..", "memecoin-desk", "data", "rug_wallets.txt")]
MAINNET, PUBLICNODE = "https://api.mainnet-beta.solana.com", "https://solana-rpc.publicnode.com"
# Measured Nov 2026: mainnet-beta rate-limits getSignaturesForAddress hard (20 s of 429s); publicnode serves it
# fast but refuses getProgramAccounts (403). So each method goes to the endpoint that serves it first.
PREFER_PUBLICNODE = {"getSignaturesForAddress", "getTransaction"}

PUMP_PROGRAM = "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
# pump.fun BondingCurve account: 8-byte discriminator, five u64 reserves/supply, `complete` bool, then
# the creator pubkey. Since 2025 the creator is an argument of `create`, not a signer, so the creator's
# own transactions don't show its launches; the bonding curves do.
CURVE_CREATOR_OFFSET = 8 + 5 * 8 + 1
TOKEN_PROGRAMS = ("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb", "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
MAX_LAUNCHES = 25        # earlier coins resolved and priced per scan
RPC_MIN_INTERVAL = 0.35  # seconds between RPC calls, per process

_rpc_lock = threading.Lock()
_rpc_last = [0.0]
_cache = {}              # creator -> (ts, facts); dev history changes slowly
CACHE_TTL = 15 * 60


def rpc(method, params):
    """One JSON-RPC call. SOLANA_RPC_URL first, then the public endpoints; 429/403 moves on."""
    if os.environ.get("SOLANA_RPC_URL"):
        urls = [os.environ["SOLANA_RPC_URL"]]
    else:
        urls = [PUBLICNODE, MAINNET] if method in PREFER_PUBLICNODE else [MAINNET, PUBLICNODE]
    body = json.dumps(dict(jsonrpc="2.0", id=1, method=method, params=params)).encode()
    err = None
    for attempt in range(2):
        for url in urls:
            with _rpc_lock:
                wait = RPC_MIN_INTERVAL - (time.time() - _rpc_last[0])
                if wait > 0:
                    time.sleep(wait)
                _rpc_last[0] = time.time()
            req = urllib.request.Request(url, data=body, headers={"content-type": "application/json",
                                                                  "User-Agent": "trench-scanner/1.0"})
            try:
                with urllib.request.urlopen(req, timeout=10) as r:
                    d = json.load(r)
                if "error" in d:
                    err = f"rpc {method}: {d['error'].get('message')}"
                    continue
                return d.get("result")
            except urllib.error.HTTPError as e:
                err = f"rpc {method}: HTTP {e.code}" + (" (rate limited)" if e.code == 429 else "")
            except Exception as e:  # network, JSON
                err = f"rpc {method}: {type(e).__name__}"
        time.sleep(1.5)
    raise S.SourceError(err or f"rpc {method} failed")


def _tx(sig):
    try:
        return rpc("getTransaction", [sig, {"encoding": "jsonParsed", "maxSupportedTransactionVersion": 1}])
    except S.SourceError as e:
        if "version" not in str(e).lower():
            raise
        return rpc("getTransaction", [sig, {"encoding": "jsonParsed", "maxSupportedTransactionVersion": 0}])


def first_funder(tx, wallet):
    """The wallet that sent `wallet` SOL in its first transaction (or that paid for it)."""
    msg = ((tx or {}).get("transaction") or {}).get("message") or {}
    for ins in msg.get("instructions") or []:
        p = ins.get("parsed")
        info = p.get("info") if isinstance(p, dict) else None
        if info and info.get("destination") == wallet and info.get("source"):
            return info["source"]
    keys = msg.get("accountKeys") or []
    payer = keys[0].get("pubkey") if keys and isinstance(keys[0], dict) else (keys[0] if keys else None)
    return payer if payer and payer != wallet else None


def pump_launches(creator):
    """(total curves, mints) for every pump.fun coin whose bonding curve names this creator."""
    curves = rpc("getProgramAccounts", [PUMP_PROGRAM, {
        "encoding": "base64", "dataSlice": {"offset": 0, "length": 0},
        "filters": [{"memcmp": {"offset": CURVE_CREATOR_OFFSET, "bytes": creator}}]}]) or []
    mints = []
    for c in curves[:MAX_LAUNCHES]:
        for prog in TOKEN_PROGRAMS:
            accs = (rpc("getTokenAccountsByOwner", [c["pubkey"], {"programId": prog}, {"encoding": "jsonParsed"}]) or {}).get("value") or []
            m = [a["account"]["data"]["parsed"]["info"]["mint"] for a in accs]
            if m:
                mints.append(m[0])
                break
    return len(curves), mints


def solana_history(creator, mint, pump=True):
    """Creator facts from Solana RPC. Raises SourceError when the history can't be read."""
    hit = _cache.get((creator, pump))
    if not (hit and time.time() - hit[0] < CACHE_TTL):
        sigs = rpc("getSignaturesForAddress", [creator, {"limit": 1000}]) or []
        full = len(sigs) < 1000
        out = dict(tx_count=len(sigs), history_complete=full, first_seen=None, funder=None,
                   launch_source=None, launch_total=None, launches=[])
        if full and sigs:
            out["first_seen"] = sigs[-1].get("blockTime")
            out["funder"] = first_funder(_tx(sigs[-1]["signature"]), creator)
        if pump:
            out["launch_total"], out["launches"] = pump_launches(creator)
            out["launch_source"] = "pump.fun bonding curves"
        hit = (time.time(), out)
        _cache[(creator, pump)] = hit
    out = dict(hit[1])
    if out["launch_total"] is not None:
        others = [m for m in out["launches"] if m != mint]
        out["launch_total"] -= len(out["launches"]) - len(others)
        out["launches"] = others
    return out


def price_launches(chain, mints):
    """Current state of earlier coins on DexScreener. A coin with no pair, or under $1k liquidity, is dead."""
    if not mints:
        return []
    pairs = S.ds_tokens(chain, mints[:30])
    best = {}
    for p in pairs:
        a = (p.get("baseToken") or {}).get("address")
        liq = ((p.get("liquidity") or {}).get("usd")) or 0
        if a in mints and liq >= (best.get(a) or {}).get("liq", -1):
            best[a] = dict(address=a, symbol=(p.get("baseToken") or {}).get("symbol"), liq=liq,
                           fdv=p.get("fdv"), url=p.get("url"))
    return [best.get(m) or dict(address=m, symbol=None, liq=0, fdv=None, url=None) for m in mints[:30]]


# ---------------------------------------------------------------- local registry and rug list
def rug_wallets():
    out = {}
    for path in RUG_FILES:
        if os.path.exists(path):
            for line in open(path, encoding="utf-8"):
                parts = [p.strip() for p in line.split("#")[0].split(",")]
                if parts and parts[0]:
                    out[parts[0]] = parts[1] if len(parts) > 1 and parts[1] else os.path.relpath(path, HERE)
    return out


def _db(path):
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    db = sqlite3.connect(path, timeout=30)
    db.row_factory = sqlite3.Row
    db.execute("CREATE TABLE IF NOT EXISTS creators (chain TEXT, address TEXT, symbol TEXT, creator TEXT, funder TEXT, "
               "ts INTEGER, PRIMARY KEY (chain, address))")
    return db


def registry_lookup(chain, address, creator, funder, db_path=DEFAULT_DB):
    """Other coins already seen with the same creator, or the same first funder."""
    try:
        db = _db(db_path)
        same_creator = [dict(r) for r in db.execute(
            "SELECT address, symbol, ts FROM creators WHERE creator=? AND NOT (chain=? AND address=?)",
            (creator, chain, address))] if creator else []
        same_funder = [dict(r) for r in db.execute(
            "SELECT address, symbol, creator, ts FROM creators WHERE funder=? AND creator<>? AND NOT (chain=? AND address=?)",
            (funder, creator or "", chain, address))] if funder else []
        db.close()
        return same_creator, same_funder
    except (sqlite3.Error, OSError):
        return [], []


def registry_record(chain, address, symbol, creator, funder, db_path=DEFAULT_DB):
    if not creator:
        return
    try:
        db = _db(db_path)
        db.execute("INSERT INTO creators VALUES (?,?,?,?,?,?) ON CONFLICT(chain, address) DO UPDATE SET "
                   "symbol=excluded.symbol, creator=excluded.creator, funder=COALESCE(excluded.funder, creators.funder)",
                   (chain, address, symbol, creator, funder, int(time.time())))
        db.commit()
        db.close()
    except (sqlite3.Error, OSError):
        pass


# ---------------------------------------------------------------- entry point
def creator_of(chain, rugcheck=None, goplus=None):
    if chain == "solana":
        return (rugcheck or {}).get("creator")
    return (goplus or {}).get("creator_address")


def gather(chain, address, creator, symbol=None, rpc_history=True, db_path=DEFAULT_DB, launchpad=None):
    """Everything rules._dev() needs. Never raises: failures go into `error`."""
    out = dict(creator=creator, chain=chain, history=None, launches_priced=[], same_creator=[], same_funder=[],
               rug_hits={}, error=None, skipped=None)
    if not creator:
        out["error"] = "creator unknown"
        return out
    funder = None
    if chain == "solana":
        if rpc_history:
            try:
                pump = (launchpad or "").lower().replace(".", "") in ("pumpfun", "pump fun") or address.endswith("pump")
                out["history"] = solana_history(creator, address, pump)
                funder = out["history"].get("funder")
                out["launches_priced"] = price_launches(chain, out["history"]["launches"])
            except S.SourceError as e:
                out["error"] = f"{e}. Set SOLANA_RPC_URL for a keyed RPC."
        else:
            out["skipped"] = "not read in the screener; scan the coin for its dev history"
    rugs = rug_wallets()
    out["rug_hits"] = {w: rugs[w] for w in (creator, funder) if w and w in rugs}
    out["same_creator"], out["same_funder"] = registry_lookup(chain, address, creator, funder, db_path)
    registry_record(chain, address, symbol, creator, funder, db_path)
    return out
