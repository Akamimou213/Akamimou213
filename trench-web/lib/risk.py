"""RISK: contract and rug check. One hard fail = dead. A check that cannot be run is a fail.

Hard checks (config.json -> risk):
  mint authority revoked · freeze authority revoked · LP burned/locked >= 95% (a pump.fun bonding
  curve counts as locked: nobody can withdraw it) · top 10 holders <= 20% excluding pools and
  lockers · 1-hour volume >= $50k on the token's own pools · dev wallet not linked to a known rug ·
  no RugCheck danger flags · no dangerous Token-2022 extensions · token not flagged rugged ·
  the busiest pool actually reports its numbers.

Dev-rug link = the creator, or the wallet that first funded the creator, appears in the rug
registry. The registry fills itself: HEAD re-prices every lead 24h later and records the creator
(and funder) of any token that lost >= 90%. You can seed it with data/rug_wallets.txt.
"""
import os

from core import HERE, S, SR, ds_pairs_by_mint, f, main_pair, rpc, tag

DANGEROUS_EXT = ("permanentDelegate", "transferHook", "transferFeeConfig", "nonTransferable", "pausable", "pausableConfig")
EMPTY = (None, "", "11111111111111111111111111111111")


def chk(cid, label, ok, value, rule):
    return dict(id=cid, label=label, ok=bool(ok), value=value, rule=rule)


def top_holders_excl(rc):
    """Top holders with pools, lockers and burn addresses removed (same exclusions as the scanner)."""
    known = rc.get("knownAccounts") or {}
    excl = {a for a, k in known.items() if (k.get("type") or "").upper() in ("AMM", "LOCKER")}
    for m in rc.get("markets") or []:
        lp = m.get("lp") or {}
        excl |= {m.get("pubkey"), m.get("liquidityA"), m.get("liquidityB"), lp.get("lpMint")}
    excl |= SR.DEAD
    return [h for h in rc.get("topHolders") or [] if h.get("owner") not in excl and h.get("address") not in excl]


def lp_status(rc, pair):
    """(locked_pct or None, label). Bonding-curve coins report 100 with label 'bonding curve'."""
    mk = rc.get("markets") or []
    dex = (pair or {}).get("dexId", "")
    pre_bond = dex == "pumpfun" or (any(m.get("marketType") == "pump_fun" for m in mk)
                                    and not any(m.get("marketType") == "pump_fun_amm" for m in mk))
    if pre_bond:
        return 100.0, "bonding curve"
    if not mk:
        return None, "no market data"

    def usd_(m):
        lp = m.get("lp") or {}
        return f(lp.get("quoteUSD"), 0) + f(lp.get("baseUSD"), 0)
    top = max(mk, key=usd_)
    mt = top.get("marketType", "")
    if any(x in mt.lower() for x in ("dlmm", "clmm", "whirlpool")):
        return 0.0, f"{mt}: withdrawable positions"
    return f((top.get("lp") or {}).get("lpLockedPct"), 0), mt


class DevHistory:
    """Creator -> first funder, and lookups against the rug registry."""

    def __init__(self, desk):
        self.d = desk
        self.cache = {}
        path = os.path.join(HERE, "data", "rug_wallets.txt")
        if os.path.exists(path):
            for line in open(path):
                w = line.split("#")[0].split(",")[0].strip()
                if w:
                    desk.store.x("INSERT OR IGNORE INTO rug_registry VALUES (?,?,?,?,?)", (w, "seed", "-", 0, "data/rug_wallets.txt"))

    def funder(self, wallet):
        if wallet in self.cache:
            return self.cache[wallet]
        pages = self.d.cfg["risk"]["dev_funder_trace_pages"]
        before, oldest = None, None
        for _ in range(pages):
            opts = {"limit": 1000}
            if before:
                opts["before"] = before
            sigs = rpc(self.d.cfg, "getSignaturesForAddress", [wallet, opts]) or []
            if not sigs:
                break
            oldest = sigs[-1]["signature"]
            if len(sigs) < 1000:
                break
            before = oldest
        else:
            self.cache[wallet] = (None, f"wallet has > {pages * 1000} txs; funder not traced")
            return self.cache[wallet]
        if not oldest:
            self.cache[wallet] = (None, "no history")
            return self.cache[wallet]
        tx = rpc(self.d.cfg, "getTransaction", [oldest, {"encoding": "jsonParsed", "maxSupportedTransactionVersion": 0}])
        src = None
        for ins in ((tx or {}).get("transaction") or {}).get("message", {}).get("instructions") or []:
            info = (ins.get("parsed") or {}).get("info") or {} if isinstance(ins.get("parsed"), dict) else {}
            if info.get("destination") == wallet and info.get("source"):
                src = info["source"]
                break
        if not src:
            keys = ((tx or {}).get("transaction") or {}).get("message", {}).get("accountKeys") or []
            payer = (keys[0].get("pubkey") if keys and isinstance(keys[0], dict) else (keys[0] if keys else None))
            src = payer if payer and payer != wallet else None
        self.cache[wallet] = (src, "first funding transfer" if src else "funder not found in first tx")
        return self.cache[wallet]

    def check(self, creator):
        """(ok, value). ok=False if linked to a rug, None if the check could not run."""
        if not creator:
            return None, "creator unknown"
        hit = self.d.store.one("SELECT * FROM rug_registry WHERE wallet=?", (creator,))
        if hit:
            return False, f"creator is in the rug registry ({hit['note'] or hit['mint']})"
        try:
            src, how = self.funder(creator)
        except Exception as e:
            return None, f"funder trace failed: {e}"
        if src:
            hit = self.d.store.one("SELECT * FROM rug_registry WHERE wallet=?", (src,))
            if hit:
                return False, f"funded by {src[:6]}…, in the rug registry ({hit['note'] or hit['mint']})"
        n = self.d.store.one("SELECT COUNT(*) n FROM rug_registry")["n"]
        return True, f"no link in {n} registry wallets; funder {src[:6] + '…' if src else 'n/a'} ({how})"


def evaluate(mint, pairs, rc, dev, cfg, creator_hint=None):
    """Pure-ish: returns (status, checks, facts). status is 'pass' or 'dead'."""
    rcfg = cfg["risk"]
    checks = []
    own = [p for p in pairs or [] if (p.get("baseToken") or {}).get("address") == mint]
    pair = main_pair(own, mint)
    facts = {}

    if rc is None:
        checks.append(chk("rugcheck", "Contract report", False, "RugCheck unavailable", "report required"))
        return "dead", checks, facts
    tok = rc.get("token") or {}
    mint_auth = rc.get("mintAuthority", tok.get("mintAuthority"))
    frz = rc.get("freezeAuthority", tok.get("freezeAuthority"))
    if rcfg["mint_must_be_revoked"]:
        checks.append(chk("mint", "Mint authority", not mint_auth, "live" if mint_auth else "revoked", "revoked"))
    if rcfg["freeze_must_be_revoked"]:
        checks.append(chk("freeze", "Freeze authority", not frz, "live" if frz else "revoked", "revoked"))

    lk, lbl = lp_status(rc, pair)
    if lbl == "bonding curve" and not rcfg["bonding_curve_counts_as_locked"]:
        lk = 0.0
    checks.append(chk("lp", "LP burned / locked", lk is not None and lk >= rcfg["lp_locked_min_pct"],
                      "unknown" if lk is None else f"{lk:.0f}% ({lbl})", f">= {rcfg['lp_locked_min_pct']}%"))

    hs = top_holders_excl(rc)
    top10 = sum(f(h.get("pct"), 0) for h in hs[:10]) if rc.get("topHolders") else None
    checks.append(chk("top10", "Top 10 holders", top10 is not None and top10 <= rcfg["top10_max_pct"],
                      "unknown" if top10 is None else f"{top10:.1f}%", f"<= {rcfg['top10_max_pct']}% excl. pools"))

    vol_h1 = sum(f((p.get("volume") or {}).get("h1"), 0) for p in own) if own else None
    dc = SR.data_consistency(own, mint, pair) if own else None
    if dc:
        checks.append(chk("data", "Main pool reports data", False, dc["value"], "busiest pool reports liquidity and volume"))
    checks.append(chk("vol", "1-hour volume", vol_h1 is not None and vol_h1 >= rcfg["min_vol_h1_usd"],
                      "unknown" if vol_h1 is None else SR.usd(vol_h1), f">= {SR.usd(rcfg['min_vol_h1_usd'])}"))

    if rc.get("rugged"):
        checks.append(chk("rugged", "RugCheck status", False, "rugged", "not rugged"))
    if rcfg["kill_rugcheck_danger_flags"]:
        dangers = [r.get("name", "?") for r in rc.get("risks") or [] if (r.get("level") or "").lower() == "danger"]
        checks.append(chk("danger", "RugCheck danger flags", not dangers, "; ".join(dangers) or "none", "none"))
    if rcfg["kill_token2022_dangerous_extensions"]:
        ext = rc.get("token_extensions") or {}
        bad = [k for k in DANGEROUS_EXT if ext.get(k) and not (k == "transferHook" and (ext[k] or {}).get("programId") in EMPTY)
               and not (k == "transferFeeConfig" and f((rc.get("transferFee") or {}).get("pct"), 0) == 0)]
        das = ext.get("defaultAccountState")
        if das and "frozen" in str(das).lower():
            bad.append("defaultAccountState=Frozen")
        checks.append(chk("ext", "Token-2022 extensions", not bad, ", ".join(bad) or "none dangerous", "none dangerous"))

    creator = rc.get("creator") or creator_hint
    if rcfg["dev_rug_link_kills"]:
        ok, val = dev.check(creator) if dev else (None, "dev check disabled")
        checks.append(chk("dev", "Dev wallet rug link", ok is True, val if ok is not None else f"could not check: {val}",
                          "no link to a known rug"))

    supply = f(tok.get("supply"))
    cb = f(rc.get("creatorBalance"), 0)
    dev_pct = cb / supply * 100 if supply and cb / supply <= 1 else None
    n_b, s_b = SR.bundle_cluster([f(h.get("pct"), 0) for h in hs[:20]])
    facts = dict(creator=creator, top10_pct=top10, dev_pct=dev_pct, holders=rc.get("totalHolders"),
                 insider_wallets=int(rc.get("graphInsidersDetected") or 0), bundle_pct=s_b if n_b else 0.0,
                 lp=f"{lk:.0f}% ({lbl})" if lk is not None else "unknown", vol_h1=vol_h1,
                 top_holder_owners=[h.get("owner") for h in hs[:30]])
    return ("pass" if all(c["ok"] for c in checks) else "dead"), checks, facts


class Risk:
    seat = "RISK"

    def __init__(self, desk):
        self.d = desk
        self.dev = DevHistory(desk)

    def loop(self):
        while not self.d.stop.is_set():
            lead_id = self.d.take(self.seat)
            if lead_id is None:
                self.d.busy(self.seat, "idle")
                continue
            self.d.busy(self.seat, f"checking {tag(lead_id)}")
            try:
                self.run(lead_id)
            except Exception as e:
                self.kill(lead_id, f"check crashed: {type(e).__name__}: {e}", [])

    def run(self, lead_id):
        st = self.d.store
        lead = st.lead(lead_id)
        mint = lead["mint"]
        try:
            pairs = ds_pairs_by_mint([mint]).get(mint) or []
        except S.SourceError as e:
            return self.kill(lead_id, f"DexScreener unavailable ({e})", [])
        try:
            rc = S.rugcheck_report(mint)
        except S.SourceError:
            rc = None
        status, checks, facts = evaluate(mint, pairs, rc, self.dev, self.d.cfg, lead.get("creator"))
        if rc and rc.get("totalHolders") is not None:
            p = main_pair(pairs, mint) or {}
            tx5 = (p.get("txns") or {}).get("m5") or {}
            st.snap(mint, self.d.clock(), price=f(p.get("priceUsd")), liq=f((p.get("liquidity") or {}).get("usd")),
                    mcap=f(p.get("marketCap")) or f(p.get("fdv")), vol_h1=facts.get("vol_h1"),
                    buys_m5=tx5.get("buys"), sells_m5=tx5.get("sells"), holders=rc.get("totalHolders"))
        result = dict(status=status, checks=checks, facts=facts)
        if status == "dead":
            first = next(c for c in checks if not c["ok"])
            return self.kill(lead_id, f"{first['label']}: {first['value']} (rule {first['rule']})", checks, result, facts)
        st.set_lead(lead_id, risk=result, creator=facts.get("creator"))
        names = ", ".join(c["label"].lower() for c in checks)
        self.d.say(self.seat, "ok", f"{tag(lead_id)} pass — checked {names}", lead_id)
        self.d.hand(self.seat, lead_id)

    def kill(self, lead_id, why, checks, result=None, facts=None):
        result = result or dict(status="dead", checks=checks, facts=facts or {})
        self.d.store.set_lead(lead_id, risk=result, status="dead", stage="RISK", kill_reason=f"RISK: {why}",
                              creator=(facts or {}).get("creator") or self.d.store.lead(lead_id).get("creator"))
        self.d.say(self.seat, "dead", f"{tag(lead_id)} DEAD — {why}", lead_id)
