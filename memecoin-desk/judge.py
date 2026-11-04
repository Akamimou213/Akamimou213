"""JUDGE: four closed questions on HEAD's dossier, answered with probabilities. Code decides.

The judge never chats and never sizes. It answers the same four questions, with the same
wording, on every lead, so the answers can be compared across days. The gate that turns answers
into a verdict lives in `apply_gate` and reads its thresholds from config.json; nothing here
changes them.

Two backends answer the questions:
  rules   deterministic, offline, < 1 ms. Answers from the dossier's numbers with fixed weights.
  claude  the Claude API with a JSON schema. Needs `pip install anthropic` and ANTHROPIC_API_KEY.

If the backend fails, times out or refuses, there is no answer, and no answer is a pass.
"""
import json
import math
import time

# ---- The four questions. Same wording, every lead. Edit here and nowhere else. ------------
QUESTIONS = {
    "organic": dict(
        kind="noul",
        text="Are holders growing because of many independent buyers, not one wallet walking the price up?",
        yes="Holders rose faster than price over the last hour, buys outnumber sells in both 5-minute windows, "
            "and no single wallet or linked cluster holds a large share.",
        no="Price rose faster than holders, or a few wallets, a linked cluster or tiny repeated trades "
           "account for the buying."),
    "late": dict(
        kind="noul",
        text="Did most of the move already happen before this lead reached the desk?",
        yes="Price is within 7% of its 60-minute high, or already up several times over the last hours.",
        no="Price has pulled back 7-30% from its 60-minute high, and the hourly gain is modest."),
    "exit_risk": dict(
        kind="score",
        text="How hard would it be to sell this position?",
        levels={1: "Deep liquidity: the order is under 0.5% of the pool.",
                2: "The order is 0.5-1% of the pool.",
                3: "The order is 1-2% of the pool.",
                4: "The order is 2-4% of the pool, or liquidity is thin against market cap.",
                5: "The order would be a big part of the pool (over 4%)."}),
    "action": dict(
        kind="choice",
        text="What should the desk do with this lead now?",
        options={"buy": "Clean setup: organic buying, not late, easy exit. Enter now.",
                 "watch": "Interesting, not yet. Ask again in 30 minutes.",
                 "pass": "No."}),
}


def _sig(x):
    return 1 / (1 + math.exp(-x))


def _num(d, *path):
    for k in path:
        if not isinstance(d, dict) or d.get(k) in (None, "missing"):
            return None
        d = d[k]
    try:
        return float(d)
    except (TypeError, ValueError):
        return None


# ---- Backend: rules ---------------------------------------------------------------------
def rules_backend(dossier):
    """Answers from the dossier's numbers. Each weight is a stated check, not a vibe."""
    why = {"organic": [], "late": []}

    # organic
    lo = 0.0
    hg = _num(dossier, "holders", "growth_1h_pct")
    pc = _num(dossier, "price", "change_same_hour_pct")
    if hg is not None and pc is not None:
        if hg > pc:
            lo += 1.0; why["organic"].append(f"holders +{hg:.0f}% vs price {pc:+.0f}%")
        else:
            lo -= 1.0; why["organic"].append(f"price {pc:+.0f}% outran holders {hg:+.0f}%")
    else:
        why["organic"].append("holder history missing")
    w = dossier.get("flow_5m") or {}
    ratios = []
    for k in ("now", "prev"):
        b, s = _num(w, k, "buys"), _num(w, k, "sells")
        if b is not None and s is not None and b + s > 0:
            ratios.append(b / max(s, 1))
    if len(ratios) == 2:
        if min(ratios) >= 1.0:
            lo += 0.6; why["organic"].append("buys > sells in both 5m windows")
        elif max(ratios) < 0.8:
            lo -= 0.7; why["organic"].append("sells > buys in both 5m windows")
    elif ratios:
        lo += 0.2 if ratios[0] >= 1 else -0.3
    avg = _num(dossier, "flow_1h", "avg_trade_usd")
    if avg is not None and avg < 15:
        lo -= 0.9; why["organic"].append(f"avg trade ${avg:.0f}: bot churn")
    top10 = _num(dossier, "holders", "top10_pct")
    if top10 is not None and top10 <= 12:
        lo += 0.3
    ins = _num(dossier, "holders", "insider_wallets")
    if ins:
        lo -= 0.8; why["organic"].append(f"{ins:.0f} linked wallets")
    bundle = _num(dossier, "holders", "bundle_pct")
    if bundle and bundle > 8:
        lo -= 0.8; why["organic"].append(f"bundle signature {bundle:.0f}%")
    if (dossier.get("whale") or {}).get("result") == "confirm":
        lo += 0.4; why["organic"].append("tracked wallet bought")
    p_org = _sig(lo)

    # late
    ll = -0.4
    below = _num(dossier, "price", "below_60m_high_pct")
    if below is not None:
        if below < 7:
            ll += 1.4; why["late"].append(f"{below:.0f}% below 60m high (buying the top lost −16.4%)")
        elif below <= 30:
            ll -= 1.2; why["late"].append(f"pulled back {below:.0f}%")
        else:
            ll += 0.3; why["late"].append(f"{below:.0f}% off the high: a dump, not a dip")
    else:
        why["late"].append("60m high missing")
    h1 = _num(dossier, "price", "change_1h_pct")
    h6 = _num(dossier, "price", "change_6h_pct")
    if h1 is not None and h1 > 150:
        ll += 0.8; why["late"].append(f"+{h1:.0f}% in 1h")
    if h6 is not None and h6 > 500:
        ll += 0.8; why["late"].append(f"+{h6:.0f}% in 6h")
    p_late = _sig(ll)

    # exit risk: deterministic from order share of pool
    share = _num(dossier, "order", "share_of_pool_pct")
    liq_mcap = _num(dossier, "market", "liquidity_to_mcap_pct")
    if share is None:
        lvl = 5
    else:
        lvl = 1 if share <= 0.5 else 2 if share <= 1 else 3 if share <= 2 else 4 if share <= 4 else 5
    if liq_mcap is not None and liq_mcap < 10:
        lvl = max(lvl, 4)
    exit_p = {k: (1.0 if k == lvl else 0.0) for k in range(1, 6)}  # arithmetic, not a judgment

    # action: buy only when every leg holds; watch when the lead is unsettled
    exit_ok = sum(v for k, v in exit_p.items() if k <= 3)
    window = 1.0 if dossier.get("utc_hour") is not None and dossier["utc_hour"] < 8 else 0.9
    p_buy = p_org * (1 - p_late) * exit_ok * window
    if hg is None:
        p_buy *= 0.5  # organic can't be confirmed without holders-vs-price over the hour
    unsure = 1 - abs(2 * p_org - 1)
    p_watch = (1 - p_buy) * 0.6 * unsure
    if (hg is None or len(ratios) < 2) and p_late < 0.5:
        # not yet: the facts that decide "organic" don't exist yet, so ask again when they do
        p_watch = (1 - p_buy) * 0.75
        why["organic"].append("history too short: watch")
    p_pass = max(0.0, 1 - p_buy - p_watch)
    return dict(organic=dict(yes=round(p_org, 3)), late=dict(yes=round(p_late, 3)),
                exit_risk={str(k): round(v, 3) for k, v in exit_p.items()},
                action=dict(buy=round(p_buy, 3), watch=round(p_watch, 3), **{"pass": round(p_pass, 3)}),
                why=why)


# ---- Backend: claude ---------------------------------------------------------------------
def _schema():
    prob = {"type": "number"}
    return {
        "type": "object",
        "properties": {
            "organic_yes": prob, "late_yes": prob,
            "exit_risk": {"type": "object", "properties": {str(k): prob for k in range(1, 6)},
                          "required": [str(k) for k in range(1, 6)], "additionalProperties": False},
            "action": {"type": "object", "properties": {k: prob for k in ("buy", "watch", "pass")},
                       "required": ["buy", "watch", "pass"], "additionalProperties": False},
        },
        "required": ["organic_yes", "late_yes", "exit_risk", "action"],
        "additionalProperties": False,
    }


SYSTEM = ("You answer four closed questions about one Solana token, using only the dossier given. "
          "For each question give the probability of each option; probabilities for one question sum to 1. "
          "A field marked \"missing\" is unknown: do not assume a value for it. Return only the JSON.")


def _prompt(dossier):
    lines = ["DOSSIER", json.dumps(dossier, indent=1, sort_keys=True), "", "QUESTIONS"]
    for qid, q in QUESTIONS.items():
        lines.append(f"[{qid}] {q['text']}")
        if q["kind"] == "noul":
            lines += [f"  yes: {q['yes']}", f"  no: {q['no']}"]
        elif q["kind"] == "score":
            lines += [f"  {k}: {v}" for k, v in q["levels"].items()]
        else:
            lines += [f"  {k}: {v}" for k, v in q["options"].items()]
    return "\n".join(lines)


def claude_backend(dossier, cfg):
    import anthropic  # optional dependency, only for this backend
    jc = cfg["judge"]
    client = anthropic.Anthropic(timeout=jc.get("timeout_sec", 20), max_retries=0)
    resp = client.beta.messages.create(
        model=jc.get("claude_model", "claude-opus-5-5"),
        max_tokens=2000,
        system=SYSTEM,
        output_config={"effort": jc.get("claude_effort", "low"),
                       "format": {"type": "json_schema", "schema": _schema()}},
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",
        messages=[{"role": "user", "content": _prompt(dossier)}],
    )
    if resp.stop_reason != "end_turn":
        raise RuntimeError(f"no answer (stop_reason={resp.stop_reason})")
    data = json.loads(next(b.text for b in resp.content if b.type == "text"))

    def norm(d):
        d = {k: min(1.0, max(0.0, float(v))) for k, v in d.items()}
        t = sum(d.values()) or 1.0
        return {k: round(v / t, 3) for k, v in d.items()}
    return dict(organic=dict(yes=round(min(1, max(0, data["organic_yes"])), 3)),
                late=dict(yes=round(min(1, max(0, data["late_yes"])), 3)),
                exit_risk=norm(data["exit_risk"]), action=norm(data["action"]), why={},
                model=resp.model)


# ---- Ask + gate --------------------------------------------------------------------------
def ask(dossier, cfg):
    """Returns (answers, error, ms). error is set when there is no usable answer."""
    t0 = time.perf_counter()
    try:
        backend = cfg["judge"]["backend"]
        if backend == "rules":
            a = rules_backend(dossier)
        elif backend == "claude":
            a = claude_backend(dossier, cfg)
        else:
            raise ValueError(f"unknown judge backend {backend!r}")
        return a, None, (time.perf_counter() - t0) * 1000
    except Exception as e:
        return None, f"{type(e).__name__}: {e}", (time.perf_counter() - t0) * 1000


def top(d):
    k = max(d, key=d.get)
    return k, d[k]


def apply_gate(answers, cfg, watch_count=0):
    """Fixed gate. Returns dict(final=buy|watch|pass, killed_by=..., score=...).

    buy only if ALL: action=buy with p >= buy_p_min, organic=yes with p >= organic_p_min,
    late=no, exit_risk <= max, and analyst score (= p(buy)) >= analyst_score_floor.
    watch -> ask once more later; a second watch is a pass.
    """
    g, jc = cfg["judge"]["gate"], cfg["judge"]
    if answers is None:
        return dict(final="pass", killed_by="no answer", score=None)
    act, p_act = top(answers["action"])
    p_org = answers["organic"]["yes"]
    late = "yes" if answers["late"]["yes"] >= 0.5 else "no"
    lvl, _ = top(answers["exit_risk"])
    lvl = int(lvl)
    score = answers["action"]["buy"]
    facts = dict(action=act, p_action=p_act, organic_p=p_org, late=late, late_p=answers["late"]["yes"],
                 exit_risk=lvl, score=score)
    if act == "buy":
        fails = []
        if p_act < g["buy_p_min"]:
            fails.append(f"buy p {p_act:.2f} < {g['buy_p_min']:.2f}")
        if p_org < g["organic_p_min"]:
            fails.append(f"organic p {p_org:.2f} < {g['organic_p_min']:.2f}")
        if late != g["late_must_be"]:
            fails.append(f"late = {late} (p {answers['late']['yes']:.2f})")
        if lvl > g["exit_risk_max"]:
            fails.append(f"exit_risk {lvl} > {g['exit_risk_max']}")
        if score < jc["analyst_score_floor"]:
            fails.append(f"analyst score {score:.2f} < {jc['analyst_score_floor']:.2f}")
        if fails:
            return dict(final="pass", killed_by="; ".join(fails), **facts)
        return dict(final="buy", killed_by=None, **facts)
    if act == "watch":
        if watch_count >= 1 and jc.get("second_watch_is_pass", True):
            return dict(final="pass", killed_by="second watch", **facts)
        return dict(final="watch", killed_by=None, **facts)
    return dict(final="pass", killed_by=f"action = pass (p {p_act:.2f})", **facts)
