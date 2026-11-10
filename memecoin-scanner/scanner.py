"""Trench scanner: run the playbook's 90-second dossier on a token, or screen what's trending.

Usage (Python 3.9+, no dependencies):
  python3 scanner.py scan <CONTRACT_ADDRESS> [--chain solana|bsc|base|ethereum] [--bankroll 2000 --risk 1]
  python3 scanner.py trending [--chain solana|all] [--limit 15] [--candles]
  add --json to either for machine-readable output.

Read-only: it never touches a wallet or signs anything.
"""
import argparse
import json
import os
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # works under `python3 -I` too
import rules  # noqa: E402
import sources as S

SOL_RE = re.compile(r"^[1-9A-HJ-NP-Za-km-z]{32,44}$")
EVM_RE = re.compile(r"^0x[0-9a-fA-F]{40}$")
POOLID_RE = re.compile(r"^0x[0-9a-fA-F]{64}$")  # Uniswap v4 pool id (or a tx hash)


def candles_with_curve(chain, pair, pairs, address):
    """1-min candles for the main pool; for a coin that graduated within the hour, prepend the
    pump.fun bonding-curve candles so the 60-min high and 30-min volume cover its whole life."""
    main = []
    try:
        main = S.gt_minute_candles(chain, pair["pairAddress"], 60, address)
    except S.SourceError:
        pass
    created = (pair.get("pairCreatedAt") or 0) / 1000
    curves = [p for p in pairs if p.get("dexId") == "pumpfun"
              and (p.get("baseToken") or {}).get("address", "").lower() == address.lower()]
    if pair.get("dexId") != "pumpfun" and curves and time.time() - created < 3600:
        curve = max(curves, key=lambda p: (((p.get("txns") or {}).get("h24") or {}).get("buys") or 0))
        try:
            old = S.gt_minute_candles(chain, curve["pairAddress"], 60, address)
            seen = {c[0] for c in main}
            main = sorted(main + [c for c in old if c[0] not in seen])
        except S.SourceError:
            pass
    if not main:
        raise S.SourceError("no 1-minute candles (rate-limited or pool too new)")
    return main


def collect(address, chain=None, candles=True):
    """Fetch everything the dossier needs. Failures are recorded, never raised."""
    address = address.strip()
    # Accept a DexScreener link (dexscreener.com/<chain>/<pair>): URLs carry the *pool* address,
    # lowercased, so resolve it to the token through the pairs endpoint.
    m = re.search(r"dexscreener\.com/([a-z0-9]+)/([A-Za-z0-9]+)", address)
    if m:
        try:
            p = S.ds_pair(m.group(1), m.group(2))
            if p:
                address, chain = p["baseToken"]["address"], p["chainId"]
        except S.SourceError:
            pass
    if POOLID_RE.match(address):
        # A 32-byte id is a v4 pool id (v4 pools have no address of their own) or a tx hash.
        try:
            hit = [p for p in S.ds_search(address) if p.get("pairAddress", "").lower() == address.lower()]
        except S.SourceError:
            hit = []
        if hit:
            address, chain = hit[0]["baseToken"]["address"], hit[0]["chainId"]
    raw = dict(address=address, chain=chain, pairs=[], candles=None, rugcheck=None, goplus=None, honeypot=None, errors=[])
    if not (SOL_RE.match(address) or EVM_RE.match(address)):
        raw["errors"].append("That doesn't look like a token address, a pool id or a DexScreener link"
                             + (" (no pool found for this 32-byte id: it may be a transaction hash)." if POOLID_RE.match(address) else "."))
        return raw
    try:
        raw["pairs"] = S.ds_tokens(chain, [address]) if chain else S.ds_token_pairs(address)
    except S.SourceError as e:
        raw["errors"].append(f"DexScreener: {e}")
    pair = rules.main_pair(raw["pairs"], address)
    chain = chain or (pair or {}).get("chainId") or ("solana" if SOL_RE.match(address) else None)
    raw["chain"] = chain

    jobs = {}
    with ThreadPoolExecutor(max_workers=3) as ex:
        if pair and candles:
            jobs["candles"] = ex.submit(candles_with_curve, chain, pair, raw["pairs"], address)
        if chain == "solana":
            jobs["rugcheck"] = ex.submit(S.rugcheck_report, address)
        elif chain:
            jobs["goplus"] = ex.submit(S.goplus_token, chain, address)
            jobs["honeypot"] = ex.submit(S.honeypot_is, chain, address)
        for k, f in jobs.items():
            try:
                raw[k] = f.result()
            except S.SourceError as e:
                raw["errors"].append(f"{k}: {e}")
            except Exception as e:  # defensive: never let one source sink the scan
                raw["errors"].append(f"{k}: {type(e).__name__}: {e}")
    return raw


def scan(address, chain=None, bankroll=None, risk_pct=1.0, candles=True):
    return rules.evaluate(collect(address, chain, candles), bankroll=bankroll, risk_pct=risk_pct)


# ---------------------------------------------------------------- Trending screener
def trending_candidates(chain="solana"):
    """Union of DexScreener top boosts, latest profiles/boosts and GeckoTerminal trending pools."""
    seen, out, errs = set(), [], []

    def add(ch, addr, src, extra=None):
        if not addr or (chain != "all" and ch != chain):
            return
        key = (ch, addr)
        if key in seen:
            for c in out:
                if (c["chain"], c["address"]) == key:
                    c["sources"].append(src)
            return
        seen.add(key)
        out.append(dict(chain=ch, address=addr, sources=[src], **(extra or {})))

    for fn, label in ((S.ds_boosts_top, "boost-top"), (S.ds_boosts_latest, "boost-new"), (S.ds_profiles_latest, "profile-new")):
        try:
            for t in fn():
                add(t.get("chainId"), t.get("tokenAddress"), label)
        except S.SourceError as e:
            errs.append(f"{label}: {e}")
    for ch in ([chain] if chain != "all" else ["solana", "base", "bsc"]):
        try:
            for p in S.gt_trending(ch):
                base = p["relationships"]["base_token"]["data"]["id"].split("_", 1)[1]
                add(ch, base, "gecko-trending", dict(gt_vol_m30=(p["attributes"].get("volume_usd") or {}).get("m30")))
        except (S.SourceError, KeyError, IndexError) as e:
            errs.append(f"gecko-trending {ch}: {e}")
    return out, errs


def trending(chain="solana", limit=15, candles=False, bankroll=None, risk_pct=1.0, min_liq=5_000):
    cands, errs = trending_candidates(chain)
    # One batched DexScreener call per chain gives market data for every candidate.
    by_chain = {}
    for c in cands:
        by_chain.setdefault(c["chain"], []).append(c)
    pairs_by = {}
    for ch, cs in by_chain.items():
        try:
            for p in S.ds_tokens(ch, [c["address"] for c in cs]):
                pairs_by.setdefault((ch, p["baseToken"]["address"].lower()), []).append(p)
        except S.SourceError as e:
            errs.append(f"DexScreener {ch}: {e}")
    pre = []
    for c in cands:
        ps = pairs_by.get((c["chain"], c["address"].lower()), [])
        mp = rules.main_pair(ps, c["address"])
        if not mp or (rules._f((mp.get("liquidity") or {}).get("usd"), 0) < min_liq):
            continue
        c["pairs"] = ps
        c["_vol_h1"] = rules._f((mp.get("volume") or {}).get("h1"), 0)
        pre.append(c)
    # Momentum first: deepest 1h volume gets the full dossier.
    pre.sort(key=lambda c: -c["_vol_h1"])
    pre = pre[:limit]

    def run(c):
        raw = dict(address=c["address"], chain=c["chain"], pairs=c["pairs"], candles=None, rugcheck=None,
                   goplus=None, honeypot=None, errors=[], gt_vol_m30=c.get("gt_vol_m30"))
        mp = rules.main_pair(c["pairs"], c["address"])
        try:
            if candles:
                raw["candles"] = S.gt_minute_candles(c["chain"], mp["pairAddress"], 60, c["address"])
        except S.SourceError as e:
            raw["errors"].append(f"candles: {e}")
        try:
            if c["chain"] == "solana":
                raw["rugcheck"] = S.rugcheck_report(c["address"])
            else:
                raw["goplus"] = S.goplus_token(c["chain"], c["address"])
        except S.SourceError as e:
            raw["errors"].append(str(e))
        d = rules.evaluate(raw, bankroll=bankroll, risk_pct=risk_pct)
        d["sources"] = c["sources"]
        d.pop("candles", None)
        return d

    with ThreadPoolExecutor(max_workers=3) as ex:
        res = list(ex.map(run, pre))
    res.sort(key=lambda d: (rules.VERDICT_RANK.get(d["verdict"], 9), -(d.get("vol30") or 0)))
    return dict(chain=chain, scanned_at=int(time.time()), candidates=len(cands), results=res, errors=errs)


# ---------------------------------------------------------------- CLI output
ICON = {"pass": "✓", "fail": "✗", "warn": "!", "unknown": "?", "info": "·"}
COLOR = {"pass": "32", "fail": "31", "warn": "33", "unknown": "35", "info": "90",
         "A-SETUP": "1;32", "GO": "32", "GO · HALF SIZE": "33", "INCOMPLETE": "35", "SKIP": "1;31", "NO DATA": "90"}


def c(s, code, on=sys.stdout.isatty()):
    return f"\033[{code}m{s}\033[0m" if on else s


def print_dossier(d):
    print()
    title = f"{d.get('symbol') or '?'} · {d.get('name') or ''}".strip(" ·")
    print(c(title, "1"), f"({d.get('chain')}, {d.get('dex') or '–'}{', ' + d['launchpad'] if d.get('launchpad') else ''})")
    print(d["address"])
    if d.get("price") is not None:
        print(f"price {rules.price_fmt(d['price'])}  liq {rules.usd(d.get('liquidity'))}  mcap {rules.usd(d.get('mcap'))}"
              f"  vol30 {rules.usd(d.get('vol30'))}  vol24h {rules.usd(d.get('vol_h24'))}")
    print()
    print(c(f"  {d['verdict']}  ", COLOR.get(d["verdict"], "0") + ";7"), d.get("reason", ""))
    stage = None
    for ch in d["checks"]:
        if ch["stage"] != stage:
            stage = ch["stage"]
            print("\n" + c(rules.STAGE_LABEL[stage].upper(), "1"))
        mark = c(ICON[ch["status"]], COLOR[ch["status"]])
        line = f"  {mark} {ch['label']:<22} {ch['value']}"
        if ch["status"] not in ("info",):
            line += c(f"   [{ch['rule']} · {ch['tag']}]", "90")
        print(line)
        if ch["note"] and ch["status"] != "pass":
            print(c(f"      {ch['note']}", "90"))
    if d.get("sizing"):
        s = d["sizing"]
        print("\n" + c("SIZE", "1"))
        print(f"  position {rules.usd(s['position'])}  (risk {rules.usd(s['risk_usd'])} = {s['risk_pct']}% of {rules.usd(s['bankroll'])}"
              f"{', half size' if s['half_size'] else ''}{', capped at 2% of pool' if s['capped_by_liquidity'] else ''})")
    if d.get("exits"):
        e = d["exits"]
        print("\n" + c("EXITS", "1") + c("  (re-anchor to your fill)", "90"))
        print(f"  TP 2x {rules.price_fmt(e['take_profit'])}   SL −50% {rules.price_fmt(e['stop'])}   time stop {e['time_stop_min']} min")
    if d.get("errors"):
        print("\n" + c("Source issues: " + "; ".join(d["errors"]), "90"))
    print()


def print_trending(t):
    print(c(f"\nTrending · {t['chain']} · {len(t['results'])} of {t['candidates']} candidates scored", "1"))
    print(c(f"{'verdict':<15}{'token':<14}{'vol30':>10}{'liq':>10}{'mcap':>10}  first failing / missing check", "90"))
    for d in t["results"]:
        print(c(f"{d['verdict']:<15}", COLOR.get(d["verdict"], "0")) +
              f"{(d.get('symbol') or '?')[:13]:<14}{rules.usd(d.get('vol30')):>10}{rules.usd(d.get('liquidity')):>10}"
              f"{rules.usd(d.get('mcap')):>10}  {d.get('reason', '')[:80]}")
        print(c(f"{'':15}{d['address']}  [{', '.join(d.get('sources', []))}]", "90"))
    if t["errors"]:
        print(c("\nSource issues: " + "; ".join(t["errors"]), "90"))
    print(c("\nTrending uses estimated 30-min volume and no 60-min high. Run `scan` on a row before acting.\n", "90"))


def main(argv=None):
    ap = argparse.ArgumentParser(description="Trench Playbook scanner (read-only).")
    sub = ap.add_subparsers(dest="cmd", required=True)
    a = sub.add_parser("scan", help="Run the 90-second dossier on one token")
    a.add_argument("address")
    a.add_argument("--chain", help="solana, bsc, base, ethereum… (auto-detected if omitted)")
    a.add_argument("--bankroll", type=float)
    a.add_argument("--risk", type=float, default=1.0, help="risk %% of bankroll per trade (playbook: 0.5–1)")
    a.add_argument("--json", action="store_true")
    t = sub.add_parser("trending", help="Screen boosted / trending tokens")
    t.add_argument("--chain", default="solana", help="solana, base, bsc… or all")
    t.add_argument("--limit", type=int, default=15)
    t.add_argument("--candles", action="store_true", help="fetch 1-min candles for each (slower, exact gate)")
    t.add_argument("--json", action="store_true")
    args = ap.parse_args(argv)

    if args.cmd == "scan":
        d = scan(args.address, args.chain, args.bankroll, args.risk)
        if args.json:
            print(json.dumps(d, indent=2))
        else:
            print_dossier(d)
        return 0 if d["verdict"] not in ("NO DATA",) else 1
    r = trending(args.chain, args.limit, args.candles)
    print(json.dumps(r, indent=2) if args.json else "", end="")
    if not args.json:
        print_trending(r)
    return 0


if __name__ == "__main__":
    sys.exit(main())
