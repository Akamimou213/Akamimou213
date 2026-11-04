"""Trench Playbook rules as code.

`evaluate(raw, ...)` turns the raw API payloads gathered by scanner.collect() into a dossier:
a list of checks grouped by the playbook's 90-second order (gate -> contract -> liquidity ->
holders -> flow), a verdict, position size and the exit plan. It does no I/O, so it can be
tested on saved payloads.

Evidence tags follow the playbook: "data" = tested on the 148-call backtest, "source" = protocol
docs / published research, "thumb" = rule of thumb, not tested here.
"""
import time

# ---- Thresholds (Trench Playbook v1, 25 Oct 2026) ----------------------------------------
GATE_VOL30_MIN = 50_000        # 30-min volume floor (data)
GATE_VOL30_A = 117_000         # top-tercile volume -> A-setup (data)
GATE_PULLBACK_MIN = 0.07       # must be >= 7% below the 60-min high (data)
GATE_DEEP_DUMP = 0.30          # 30%+ below the high kept falling (data)
WINDOW_UTC = (0, 8)            # 00:00-08:00 UTC trade hardest (data)
MAX_TAX = 0.05                 # EVM buy/sell tax ceiling (source)
LP_SAFE_PCT = 95               # LP burned/locked share treated as permanent (source)
LIQ_TO_MCAP_MIN = 0.10         # liquidity >= 10% of mcap (thumb)
POS_MAX_SHARE_OF_LIQ = 0.02    # position <= 2% of pool liquidity (thumb)
TOP10_MAX = 30.0               # top 10 holders excl. pools <= 30% (thumb)
DEV_MAX = 5.0                  # dev holds <= 5% (thumb)
BUNDLE_WARN, BUNDLE_FAIL = 10.0, 15.0  # bundle % (thumb)
TP_MULT, SL_MULT, TIME_STOP_MIN = 2.0, 0.5, 60  # exit plan (data)
ROUND_TRIP_COST = 0.045        # budgeted fees (source)

STAGES = ["gate", "contract", "liquidity", "holders", "flow"]
STAGE_LABEL = {"gate": "Gate", "contract": "Contract", "liquidity": "Liquidity",
               "holders": "Holders", "flow": "Flow & context"}
DEAD = {"0x000000000000000000000000000000000000dead", "0x0000000000000000000000000000000000000000",
        "11111111111111111111111111111111", "1nc1nerator11111111111111111111111111111111"}
SUFFIX_PAD = [("pump", "pump.fun"), ("bonk", "Bonk.fun"), ("4444", "four.meme"),
              ("7777", "Flap"), ("8888", "Flap"), ("moon", "Moonshot"), ("bags", "Bags")]


def usd(x):
    if x is None:
        return "–"
    x = float(x)
    for div, s in ((1e9, "B"), (1e6, "M"), (1e3, "k")):
        if abs(x) >= div:
            return f"${x / div:.2f}{s}" if abs(x) < 10 * div else f"${x / div:.1f}{s}" if abs(x) < 100 * div else f"${x / div:.0f}{s}"
    return f"${x:.0f}" if abs(x) >= 10 else f"${x:.2f}"


def pct(x, signed=False):
    return "–" if x is None else (f"{x:+.1f}%" if signed else f"{x:.1f}%")


def price_fmt(p):
    if p is None:
        return "–"
    p = float(p)
    if p >= 1:
        return f"${p:,.4f}"
    s = f"{p:.12f}".rstrip("0")
    zeros = len(s.split(".")[1]) - len(s.split(".")[1].lstrip("0"))
    return f"${p:.{zeros + 4}f}"


def _chk(stage, cid, label, status, value, rule, tag, note=""):
    return dict(stage=stage, id=cid, label=label, status=status, value=value, rule=rule, tag=tag, note=note)


def _f(x, default=None):
    try:
        return float(x)
    except (TypeError, ValueError):
        return default


# ---- Pair helpers ------------------------------------------------------------------------
def main_pair(pairs, address):
    own = [p for p in pairs if (p.get("baseToken") or {}).get("address", "").lower() == address.lower()]
    own = own or pairs
    if not own:
        return None
    return max(own, key=lambda p: (_f((p.get("liquidity") or {}).get("usd"), 0), _f((p.get("volume") or {}).get("h24"), 0)))


def _tx24(p):
    t = (p.get("txns") or {}).get("h24") or {}
    return (t.get("buys") or 0) + (t.get("sells") or 0)


def data_consistency(pairs, address, chosen):
    """Flag when the busiest pool has no usable data, so the figures come from a minor pool.

    DexScreener sometimes lists a token's real pool with liquidity null and volume 0 while it
    still counts thousands of trades; the scanner would then fall back to a dust pool.
    """
    own = [p for p in pairs if (p.get("baseToken") or {}).get("address", "").lower() == address.lower()]
    if not own or not chosen:
        return None
    busiest = max(own, key=_tx24)
    if busiest is chosen or _tx24(busiest) < max(50, 5 * _tx24(chosen)):
        return None
    if _f((busiest.get("liquidity") or {}).get("usd")) and _f((busiest.get("volume") or {}).get("h24")):
        return None
    return _chk("liquidity", "data", "Data consistency", "unknown",
                f"{busiest.get('dexId')} pool: {_tx24(busiest):,} trades/24h but no liquidity or volume reported",
                "main pool fully reported", "source",
                f"Figures here come from a minor {chosen.get('dexId')} pool. Read liquidity and volume on the chart or "
                "RugCheck before trusting any number.")


def total_liquidity(pairs, address, chain, floor=1_000):
    """Liquidity summed over every pool where the token is the base asset (pools under $1k ignored)."""
    tot = 0.0
    for p in pairs:
        if (p.get("baseToken") or {}).get("address", "").lower() != address.lower():
            continue
        if chain and p.get("chainId") not in (None, chain):
            continue
        v = _f((p.get("liquidity") or {}).get("usd"), 0)
        if v >= floor:
            tot += v
    return tot or None


def launchpad_from_suffix(address):
    a = address.lower()
    for suf, name in SUFFIX_PAD:
        if a.endswith(suf):
            return name
    return None


def gate_metrics(candles, now, price=None):
    """vol30, high60 and % off the 60-min high from 1-minute candles."""
    if not candles:
        return None
    # Candles that stop more than 5 min ago (e.g. only the bonding curve of a coin that just
    # graduated) would understate both volume and the high: treat the gate as unknown.
    if max(c[0] for c in candles) < now - 300:
        return None
    v30 = sum(_f(c[5], 0) for c in candles if c[0] >= now - 1800)
    last60 = [c for c in candles if c[0] >= now - 3600]
    if not last60:
        return dict(vol30=v30, high60=None, off_high=None, price=price, candles=0)
    p = price if price else _f(candles[-1][4])
    hi = max([_f(c[2], 0) for c in last60] + ([p] if p else []))  # the live price can be the high
    off = (p / hi - 1) if (hi and p) else None
    return dict(vol30=v30, high60=hi, off_high=off, price=p, candles=len(last60))


def bundle_cluster(pcts, min_pct=1.0, tol=0.10, min_size=5):
    """Largest group of holders (each >= min_pct) whose sizes sit within ±tol of each other.

    Dev bundles buy from many fresh wallets in the same block with near-identical sizes, so a
    run of 5+ top holders at, say, 2.7–2.9% each is a strong bundle signature.
    """
    vals = sorted((p for p in pcts if p >= min_pct), reverse=True)
    best = []
    for centre in vals:
        grp = [v for v in vals if abs(v - centre) <= tol * centre]
        if len(grp) > len(best):
            best = grp
    return (len(best), sum(best)) if len(best) >= min_size else (0, 0.0)


# ---- Stage evaluators ---------------------------------------------------------------------
def _gate(raw, pair, now):
    out = []
    price = _f(pair.get("priceUsd"))
    g = gate_metrics(raw.get("candles"), now, price)
    est = False
    sg = raw.get("gate")  # gate computed by series.py from our own 1-minute snapshots
    if (g is None or g.get("off_high") is None) and sg and sg.get("vol30") is not None:
        g, est = dict(vol30=sg["vol30"], high60=sg.get("high60"), off_high=sg.get("off_high")), bool(sg.get("vol_est"))
    if g is None or g.get("vol30") is None:
        h1 = _f((pair.get("volume") or {}).get("h1"))
        m30 = _f(raw.get("gt_vol_m30"))
        if m30 is not None:
            g = dict(vol30=m30, high60=None, off_high=None)
        elif h1 is not None:
            g, est = dict(vol30=h1 / 2, high60=None, off_high=None), True
        else:
            g = dict(vol30=None, high60=None, off_high=None)
    v = g["vol30"]
    note = "Estimated as half the 1h volume: 1-minute candles unavailable." if est else ""
    if v is None:
        out.append(_chk("gate", "vol30", "30-min volume", "unknown", "–", "≥ $50k (≥ $117k preferred)", "data",
                        "No volume data."))
    else:
        st = "pass" if v >= GATE_VOL30_MIN else "fail"
        if est and st == "pass" and v < GATE_VOL30_MIN * 1.3:
            st = "unknown"
        out.append(_chk("gate", "vol30", "30-min volume", st, usd(v) + (" (est.)" if est else ""),
                        "≥ $50k (≥ $117k preferred)", "data",
                        note or ("A-setup volume." if v >= GATE_VOL30_A else
                                 "Thin: under $50k the backtest averaged −6.5%." if v < GATE_VOL30_MIN else "")))
    off = g.get("off_high")
    if off is None:
        out.append(_chk("gate", "pullback", "Below 60-min high", "unknown", "–", "7–30% below", "data",
                        "Needs 1-minute candles. Check the chart: never buy within 7% of the 60-min high."))
    else:
        below = -off
        if below < GATE_PULLBACK_MIN:
            st, n = "fail", "Within 7% of the high: those entries averaged −16.4%. Wait for the pullback."
        elif below > GATE_DEEP_DUMP:
            st, n = "fail", "30%+ off the high: deep dumps kept falling in the backtest."
        else:
            st, n = "pass", ""
        out.append(_chk("gate", "pullback", "Below 60-min high", st, f"{below * 100:.1f}% below {price_fmt(g['high60'])}",
                        "7–30% below", "data", n))
    hr = time.gmtime(now).tm_hour
    inwin = WINDOW_UTC[0] <= hr < WINDOW_UTC[1]
    out.append(_chk("gate", "window", "Trading window", "pass" if inwin else "warn", f"{hr:02d}:xx UTC",
                    "00:00–08:00 UTC", "data", "" if inwin else "Outside the window: only clean gate passes, half size."))
    return out, g, inwin


def _contract_sol(rc):
    out = []
    if rc is None:
        return [_chk("contract", "rugcheck", "Contract report", "unknown", "–", "RugCheck report", "source",
                     "RugCheck unavailable. Check mint/freeze authority manually.")]
    tok = rc.get("token") or {}
    mint = rc.get("mintAuthority", tok.get("mintAuthority"))
    frz = rc.get("freezeAuthority", tok.get("freezeAuthority"))
    out.append(_chk("contract", "mint", "Mint authority", "fail" if mint else "pass", "live" if mint else "revoked",
                    "revoked", "source", "Unlimited new supply can be printed." if mint else ""))
    out.append(_chk("contract", "freeze", "Freeze authority", "fail" if frz else "pass", "live" if frz else "revoked",
                    "revoked", "source", "Your tokens can be frozen so you can't sell." if frz else ""))
    ext = rc.get("token_extensions") or {}
    bad = []
    if ext.get("permanentDelegate"):
        bad.append("PermanentDelegate")
    if ext.get("transferHook") and (ext["transferHook"] or {}).get("programId") not in (None, "", "11111111111111111111111111111111"):
        bad.append("TransferHook")
    fee = _f((rc.get("transferFee") or {}).get("pct"), 0)
    if ext.get("transferFeeConfig") and fee > 0:
        bad.append(f"TransferFee {fee:g}%")
    das = ext.get("defaultAccountState")
    if das and "frozen" in str(das).lower():
        bad.append("DefaultAccountState=Frozen")
    if ext.get("nonTransferable"):
        bad.append("NonTransferable")
    if ext.get("pausable") or ext.get("pausableConfig"):
        bad.append("Pausable")
    out.append(_chk("contract", "ext", "Token-2022 extensions", "fail" if bad else "pass", ", ".join(bad) or "none dangerous",
                    "none of the six dangerous ones", "source"))
    meta = rc.get("tokenMeta") or {}
    if meta.get("mutable"):
        out.append(_chk("contract", "meta", "Metadata", "warn", "mutable", "immutable", "source",
                        "Name, ticker or image can change. Low risk alone."))
    if rc.get("rugged"):
        out.append(_chk("contract", "rugged", "RugCheck status", "fail", "rugged", "not rugged", "source"))
    dangers = [r for r in rc.get("risks") or [] if (r.get("level") or "").lower() == "danger"]
    warns = [r for r in rc.get("risks") or [] if (r.get("level") or "").lower() == "warn"]
    if dangers or warns:
        out.append(_chk("contract", "risks", "RugCheck flags", "fail" if dangers else "warn",
                        "; ".join(r.get("name", "?") for r in dangers + warns), "no danger flags", "source",
                        f"RugCheck normalised score {rc.get('score_normalised')} (higher = riskier)."))
    return out


def _contract_evm(gp, hp):
    out = []
    if gp is None and hp is None:
        return [_chk("contract", "goplus", "Contract report", "unknown", "–", "GoPlus / honeypot.is", "source",
                     "No EVM security data for this chain. Run honeypot.is and check owner powers manually.")]
    gp = gp or {}
    hp_res = (hp or {}).get("honeypotResult") or {}
    sim = (hp or {}).get("simulationResult") or {}
    honeypot = gp.get("is_honeypot") == "1" or gp.get("cannot_sell_all") == "1" or hp_res.get("isHoneypot") is True
    sim_ok = (hp or {}).get("simulationSuccess")
    out.append(_chk("contract", "honeypot", "Sell simulation", "fail" if honeypot else ("pass" if (gp or hp) else "unknown"),
                    "HONEYPOT" if honeypot else ("sells OK" if sim_ok or gp.get("is_honeypot") == "0" else "–"),
                    "sell succeeds", "source", "Simulation shows the state now; owner-toggled traps can pass it."))
    bt = _f(sim.get("buyTax"), None)
    st_ = _f(sim.get("sellTax"), None)
    bt = bt / 100 if bt is not None else _f(gp.get("buy_tax"), None)
    st_ = st_ / 100 if st_ is not None else _f(gp.get("sell_tax"), None)
    if bt is not None or st_ is not None:
        worst = max(bt or 0, st_ or 0)
        out.append(_chk("contract", "tax", "Buy / sell tax", "fail" if worst > MAX_TAX else "pass",
                        f"{(bt or 0) * 100:.1f}% / {(st_ or 0) * 100:.1f}%", "≤ 5%", "source"))
    powers = [n for k, n in [("slippage_modifiable", "modifiable tax"), ("hidden_owner", "hidden owner"),
                             ("owner_change_balance", "owner can change balances"), ("is_blacklisted", "blacklist"),
                             ("transfer_pausable", "trading pause"), ("trading_cooldown", "cooldown"),
                             ("is_mintable", "mintable"), ("can_take_back_ownership", "can reclaim ownership"),
                             ("selfdestruct", "selfdestruct"), ("personal_slippage_modifiable", "per-wallet tax")]
              if gp.get(k) == "1"]
    if gp:
        out.append(_chk("contract", "owner", "Owner powers", "fail" if powers else "pass", ", ".join(powers) or "none",
                        "none", "source"))
        out.append(_chk("contract", "proxy", "Upgradeable proxy", "fail" if gp.get("is_proxy") == "1" else "pass",
                        "yes" if gp.get("is_proxy") == "1" else "no", "not a proxy", "source"))
        if gp.get("is_open_source") == "0":
            out.append(_chk("contract", "source", "Verified source", "fail", "unverified", "verified", "source"))
    return out


def _liquidity(raw, pair, chain, size_usd):
    out = []
    liq = _f((pair.get("liquidity") or {}).get("usd"))
    mcap = _f(pair.get("marketCap")) or _f(pair.get("fdv"))
    dex = pair.get("dexId", "")
    # LP permanence
    if chain == "solana":
        rc = raw.get("rugcheck")
        mk = (rc or {}).get("markets") or []
        if dex == "pumpfun" or any(m.get("marketType") == "pump_fun" for m in mk) and not any(
                m.get("marketType") == "pump_fun_amm" for m in mk):
            out.append(_chk("liquidity", "lp", "LP", "pass", "bonding curve", "burned / locked", "source",
                            "Pre-bond: liquidity is the pump.fun curve; LP is burned automatically at graduation."))
        elif mk:
            def m_usd(m):
                lp = m.get("lp") or {}
                return _f(lp.get("quoteUSD"), 0) + _f(lp.get("baseUSD"), 0)
            top = max(mk, key=m_usd)
            lp = top.get("lp") or {}
            lk = _f(lp.get("lpLockedPct"), 0)
            mt = top.get("marketType", "")
            if "dlmm" in mt.lower() or "clmm" in mt.lower() or "whirlpool" in mt.lower():
                out.append(_chk("liquidity", "lp", "LP", "warn", f"{mt}: positions", "burned / locked", "source",
                                "Concentrated-liquidity positions can be withdrawn by their owner. Check who provides it."))
            else:
                out.append(_chk("liquidity", "lp", "LP burned / locked", "pass" if lk >= LP_SAFE_PCT else "fail",
                                f"{lk:.0f}% ({mt})", f"≥ {LP_SAFE_PCT}%", "source",
                                "" if lk >= LP_SAFE_PCT else "The deployer can pull this liquidity."))
        else:
            out.append(_chk("liquidity", "lp", "LP", "unknown", "–", "burned / locked", "source", "No market data from RugCheck."))
    else:
        gp = raw.get("goplus") or {}
        lph = gp.get("lp_holders") or []
        if lph:
            locked = sum(_f(h.get("percent"), 0) for h in lph
                         if str(h.get("is_locked")) == "1" or (h.get("address") or "").lower() in DEAD) * 100
            out.append(_chk("liquidity", "lp", "LP burned / locked", "pass" if locked >= LP_SAFE_PCT else "fail",
                            f"{locked:.0f}%", f"≥ {LP_SAFE_PCT}%", "source",
                            "" if locked >= LP_SAFE_PCT else "The LP holder can withdraw this liquidity."))
        else:
            out.append(_chk("liquidity", "lp", "LP", "unknown", dex or "–", "burned / locked", "source",
                            "No LP holder data (v4 hooks / launchpad pools). Check the locker or launchpad terms."))
    total = total_liquidity(raw.get("pairs") or [], raw["address"], chain) or liq
    if total is not None and mcap:
        r = total / mcap
        many = total and liq and total > liq * 1.02
        out.append(_chk("liquidity", "liqmcap", "Liquidity / mcap", "pass" if r >= LIQ_TO_MCAP_MIN else "fail",
                        f"{usd(total)} / {usd(mcap)} = {r * 100:.0f}%" + (" (all pools)" if many else ""), "≥ 10%", "thumb",
                        ("" if r >= LIQ_TO_MCAP_MIN else "Exit will cost more than entry. ")
                        + (f"Main pool alone {usd(liq)}; side pools can be withdrawn by their owners." if many else "")))
    else:
        out.append(_chk("liquidity", "liqmcap", "Liquidity / mcap", "unknown", usd(liq), "≥ 10%", "thumb"))
    if liq and size_usd:
        share = size_usd / liq
        out.append(_chk("liquidity", "impact", "Your size vs pool", "pass" if share <= POS_MAX_SHARE_OF_LIQ else "warn",
                        f"{usd(size_usd)} = {share * 100:.2f}% of pool", "≤ 1–2% of liquidity", "thumb",
                        f"Est. price impact ≈ {share * 100:.1f}% each way before fees."))
    return out, liq, mcap


def _holders_sol(rc):
    out = []
    if rc is None:
        return [_chk("holders", "top10", "Top 10 holders", "unknown", "–", "≤ 30% excl. pools", "thumb",
                     "No holder data. Check GMGN / Bubblemaps.")]
    known = rc.get("knownAccounts") or {}
    excl = {a for a, k in known.items() if (k.get("type") or "").upper() in ("AMM", "LOCKER")}
    excl |= {m.get("pubkey") for m in rc.get("markets") or []}
    for m in rc.get("markets") or []:
        lp = m.get("lp") or {}
        excl |= {m.get("liquidityA"), m.get("liquidityB"), lp.get("lpMint")}
    excl |= DEAD
    hs = [h for h in rc.get("topHolders") or [] if h.get("owner") not in excl and h.get("address") not in excl]
    pcts = [_f(h.get("pct"), 0) for h in hs]
    top10 = sum(pcts[:10])
    out.append(_chk("holders", "top10", "Top 10 holders", "pass" if top10 <= TOP10_MAX else "fail", pct(top10),
                    "≤ 30% excl. pools", "thumb", f"{rc.get('totalHolders') or '?'} holders in total."))
    creator = rc.get("creator")
    supply = _f((rc.get("token") or {}).get("supply"))
    cb = _f(rc.get("creatorBalance"), 0)
    dev = None
    if supply:
        dev = cb / supply * 100
        if dev > 100:
            dev = None
    if dev is None and creator:
        dev = sum(_f(h.get("pct"), 0) for h in rc.get("topHolders") or [] if h.get("owner") == creator)
    out.append(_chk("holders", "dev", "Dev holding", "unknown" if dev is None else ("pass" if dev <= DEV_MAX else "fail"),
                    pct(dev), "≤ 5%", "thumb", "Also check the dev's past coins on GMGN."))
    n, s = bundle_cluster(pcts[:20])
    st = "fail" if s > BUNDLE_FAIL else "warn" if s > BUNDLE_WARN else "pass" if n == 0 or s <= BUNDLE_WARN else "warn"
    out.append(_chk("holders", "bundle", "Bundle signature", st,
                    f"{n} wallets, {s:.1f}% at near-identical size" if n else "none found", "≤ 10–15%", "thumb",
                    "Heuristic from top-holder sizes. Confirm with GMGN bundler tags or Bubblemaps." if n else ""))
    ins = int(rc.get("graphInsidersDetected") or 0)
    ins_pct = sum(_f(h.get("pct"), 0) for h in hs if h.get("insider"))
    if ins or ins_pct:
        out.append(_chk("holders", "insiders", "Insider network", "fail" if ins_pct > BUNDLE_FAIL else "warn",
                        f"{ins} linked wallets" + (f", {ins_pct:.1f}% of supply" if ins_pct else ""), "low", "thumb",
                        "RugCheck found wallets funded from a common source."))
    else:
        out.append(_chk("holders", "insiders", "Insider network", "pass", "none detected", "low", "thumb"))
    return out


def _holders_evm(gp):
    if not gp:
        return [_chk("holders", "top10", "Top 10 holders", "unknown", "–", "≤ 30% excl. pools", "thumb",
                     "No holder data. Check the explorer or GMGN.")]
    out = []
    hs = [h for h in gp.get("holders") or [] if not (str(h.get("is_locked")) == "1" or (h.get("address") or "").lower() in DEAD
                                                     or ("pair" in (h.get("tag") or "").lower())
                                                     or ("pool" in (h.get("tag") or "").lower()))]
    pcts = [_f(h.get("percent"), 0) * 100 for h in hs]
    top10 = sum(pcts[:10])
    out.append(_chk("holders", "top10", "Top 10 holders", "pass" if top10 <= TOP10_MAX else "fail", pct(top10),
                    "≤ 30% excl. pools", "thumb",
                    f"{gp.get('holder_count') or '?'} holders. Contract holders other than tagged pairs are counted."))
    dev = max(_f(gp.get("creator_percent"), 0), _f(gp.get("owner_percent"), 0)) * 100
    out.append(_chk("holders", "dev", "Dev / owner holding", "pass" if dev <= DEV_MAX else "fail", pct(dev), "≤ 5%", "thumb"))
    n, s = bundle_cluster(pcts[:20])
    out.append(_chk("holders", "bundle", "Bundle signature", "fail" if s > BUNDLE_FAIL else "warn" if s > BUNDLE_WARN else "pass",
                    f"{n} wallets, {s:.1f}% at near-identical size" if n else "none found", "≤ 10–15%", "thumb"))
    if gp.get("honeypot_with_same_creator") not in (None, "0"):
        out.append(_chk("holders", "devhist", "Creator history", "fail", "previous honeypot", "clean", "source"))
    return out


def _flow(pair, now):
    out = []
    tx = (pair.get("txns") or {}).get("h1") or {}
    b, s = tx.get("buys") or 0, tx.get("sells") or 0
    v1 = _f((pair.get("volume") or {}).get("h1"), 0)
    if b + s:
        ratio = b / max(s, 1)
        out.append(_chk("flow", "bs", "Buys / sells (1h)", "warn" if ratio < 0.67 else "info", f"{b:,} / {s:,}",
                        "buyers hold up through the pullback", "thumb",
                        "Sellers dominate: distribution, not a pause." if ratio < 0.67 else ""))
        avg = v1 / (b + s)
        out.append(_chk("flow", "avgtrade", "Avg trade (1h)", "warn" if avg < 15 else "info", usd(avg), "–", "thumb",
                        "Tiny average trade: likely volume-bot churn. Discount the volume, check unique makers."
                        if avg < 15 else ""))
    created = pair.get("pairCreatedAt")
    if created:
        age_h = (now - created / 1000) / 3600
        out.append(_chk("flow", "age", "Pair age", "info", f"{age_h:.1f} h" if age_h < 48 else f"{age_h / 24:.0f} d", "–", "data"))
    boosts = (pair.get("boosts") or {}).get("active")
    if boosts:
        out.append(_chk("flow", "boost", "DexScreener boost", "info", f"{boosts} active", "–", "source",
                        "Paid placement: trending rank is bought, not earned."))
    pc = pair.get("priceChange") or {}
    out.append(_chk("flow", "chg", "Price change", "info",
                    " · ".join(f"{k} {pct(_f(pc.get(k)), True)}" for k in ("m5", "h1", "h6", "h24") if pc.get(k) is not None) or "–",
                    "–", "thumb"))
    return out


# ---- Main entry point ---------------------------------------------------------------------
VERDICT_RANK = {"A-SETUP": 0, "GO": 1, "GO · HALF SIZE": 2, "INCOMPLETE": 3, "SKIP": 4, "NO DATA": 5}


def evaluate(raw, now=None, bankroll=None, risk_pct=1.0):
    now = now or time.time()
    address = raw["address"]
    pair = main_pair(raw.get("pairs") or [], address)
    if not pair:
        return dict(address=address, chain=raw.get("chain"), verdict="NO DATA",
                    reason="No trading pair found on DexScreener.", checks=[], errors=raw.get("errors", []))
    chain = pair.get("chainId") or raw.get("chain")
    price = _f(pair.get("priceUsd"))

    # Sizing first, so the liquidity stage can test it against the pool.
    size = None
    if bankroll:
        size = bankroll * risk_pct / 100 / (1 - SL_MULT)

    gate, g, inwin = _gate(raw, pair, now)
    if chain == "solana":
        contract = _contract_sol(raw.get("rugcheck"))
    else:
        contract = _contract_evm(raw.get("goplus"), raw.get("honeypot"))
    liquidity, liq, mcap = _liquidity(raw, pair, chain, size)
    holders = _holders_sol(raw.get("rugcheck")) if chain == "solana" else _holders_evm(raw.get("goplus"))
    flow = _flow(pair, now)
    dc = data_consistency(raw.get("pairs") or [], address, pair)
    if dc:
        liquidity.insert(0, dc)
        # Market figures came from a minor pool: don't let them pass or fail the coin.
        for c in gate + liquidity:
            if c["id"] in ("vol30", "pullback", "liqmcap", "impact") and c["status"] in ("pass", "fail", "warn"):
                c["status"], c["note"] = "unknown", "From a minor pool, not the coin's real one: " + (c["note"] or "verify by hand.")
    checks = gate + contract + liquidity + holders + flow

    fails = [c for c in checks if c["status"] == "fail"]
    unknown = [c for c in checks if c["status"] == "unknown" and c["stage"] in ("gate", "contract", "liquidity", "holders")]
    a_setup = g.get("vol30") is not None and g["vol30"] >= GATE_VOL30_A and any(
        c["id"] == "pullback" and c["status"] == "pass" for c in checks)
    if fails:
        verdict, reason = "SKIP", f"{STAGE_LABEL[fails[0]['stage']]}: {fails[0]['label']} — {fails[0]['value']}"
    elif unknown:
        verdict, reason = "INCOMPLETE", "Check by hand: " + ", ".join(c["label"] for c in unknown)
    elif a_setup and inwin:
        verdict, reason = "A-SETUP", "High volume, pulled back, in window, every check passed."
    elif inwin:
        verdict, reason = "GO", "Gate and dossier pass."
    else:
        verdict, reason = "GO · HALF SIZE", "Passes, but outside 00–08 UTC: half size."

    sizing = None
    if size:
        mult = 1.0 if inwin else 0.5
        pos = size * mult
        cap = liq * POS_MAX_SHARE_OF_LIQ if liq else None
        capped = cap is not None and pos > cap
        sizing = dict(bankroll=bankroll, risk_pct=risk_pct, position=min(pos, cap) if capped else pos,
                      capped_by_liquidity=capped, half_size=not inwin,
                      risk_usd=(min(pos, cap) if capped else pos) * (1 - SL_MULT))
    exits = None
    if price:
        exits = dict(take_profit=price * TP_MULT, stop=price * SL_MULT, time_stop_min=TIME_STOP_MIN,
                     note="Set from your fill price, not this quote. Sell 100% at 2x; stop −50%; out after 60 min.")

    base = pair.get("baseToken") or {}
    info = pair.get("info") or {}
    rc = raw.get("rugcheck") or {}
    pad = ((rc.get("launchpad") or {}).get("name")) or launchpad_from_suffix(address)
    return dict(
        address=address, chain=chain, name=base.get("name"), symbol=base.get("symbol"),
        dex=pair.get("dexId"), pair=pair.get("pairAddress"), url=pair.get("url"), launchpad=pad,
        image=info.get("imageUrl"), socials=[s.get("url") for s in (info.get("socials") or []) + (info.get("websites") or [])],
        price=price, liquidity=liq, mcap=mcap, vol30=g.get("vol30"), high60=g.get("high60"), off_high=g.get("off_high"),
        vol_h1=_f((pair.get("volume") or {}).get("h1")), vol_h24=_f((pair.get("volume") or {}).get("h24")),
        in_window=inwin, verdict=verdict, reason=reason, checks=checks, sizing=sizing, exits=exits,
        candles=raw.get("candles") or [], errors=raw.get("errors", []), scanned_at=int(now),
    )
