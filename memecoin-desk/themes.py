"""THEMES (experimental): which narratives the money is rotating into, and whether each one is
speeding up or slowing down.

EXPERIMENTAL AND DISPLAY ONLY. Nothing in here feeds the gate:
  * it is not in HEAD's dossier, so JUDGE never sees it (rules or claude backend);
  * it never kills a lead, never stages an order and never changes a size;
  * it only writes a thread line per lead, a table in the evening report and `desk.py themes`.
It goes into the gate only after paper results show that coins in accelerating themes do better,
and only when the user asks.

How it works, every `themes.refresh_min` minutes:
  1. Universe: GeckoTerminal trending pools (1h / 6h / 24h), DexScreener top boosts, and nursery
     coins that did $10k+ in an hour over the last 6 h. Capped at `themes.max_coins`.
  2. DexScreener gives each coin's name, symbol, age and 1h / 6h / 24h volume.
  3. Each coin goes into every theme whose keywords match its name or symbol (`themes.buckets` in
     config.json). Words shared by 3+ unmatched coins become "auto:<word>" themes, so a new meta
     shows up before anyone adds it to the config.
  4. Per theme: 24h / 6h / 1h volume, the top coin's share, and two pace ratios:
        pace_6h = 6h volume / the 6h volume an even day would give   (>1 = speeding up)
        pace_1h = 1h volume / the 1h volume an even 6 h would give
     "Even" uses each coin's own age, so a 3-hour-old coin isn't read as accelerating just because
     its 24h volume only covers 3 hours.
  5. A snapshot goes into `theme_snaps`, so the next table can show the change vs `compare_hours` ago.

Caveats, printed with the table: volume is not price (high volume can be people selling),
memecoin volume includes wash trading and bots, and keyword buckets are rough.
"""
import re
import time

from core import S, SR, ds_pairs_by_mint, f

LABEL = "EXPERIMENTAL · display only · not in the gate"
STOP = {"the", "coin", "token", "sol", "solana", "on", "of", "and", "for", "in", "a", "to", "is", "my", "by",
        "official", "inu", "pump", "fun", "bonk", "meme", "memecoin", "new", "first", "real", "just", "it",
        "with", "you", "your", "this", "that", "who", "not", "are", "all", "dao", "wif"}


def words(text):
    """Lower-case words of a name or symbol; camelCase and digits split ('GTAVI6' -> gtavi, 6)."""
    text = re.sub(r"([a-z])([A-Z])", r"\1 \2", text or "")
    return [w for w in re.split(r"[^a-z0-9]+", text.lower()) if w]


def match(name, symbol, keywords):
    """A keyword matches a whole word; keywords of 4+ letters also match inside a word ('cat' does
    not match 'category', 'hypercat' needs 'cat' as its own entry to match)."""
    ws = set(words(name)) | set(words(symbol))
    flat = re.sub(r"[^a-z0-9]", "", f"{name} {symbol}".lower())
    for k in keywords:
        k = k.lower().strip()
        kf = re.sub(r"[^a-z0-9]", "", k)
        if not kf:
            continue
        if k in ws or kf in ws or (len(kf) >= 4 and kf in flat):
            return True
    return False


def _expected(vol_long, age_h, short_h, long_h):
    """Volume an even pace would put in the last `short_h` hours, given the coin's own age."""
    if not vol_long or not age_h or age_h <= 0:
        return 0.0
    return vol_long * min(short_h, age_h) / min(long_h, age_h)


def coin_row(mint, pairs, now):
    own = [p for p in pairs if (p.get("baseToken") or {}).get("address") == mint]
    if not own:
        return None
    main = SR.main_pair(own, mint) or own[0]
    base = main.get("baseToken") or {}
    vol = lambda k: sum(f((p.get("volume") or {}).get(k), 0) for p in own)   # noqa: E731
    created = min((p.get("pairCreatedAt") or 1e15) for p in own) / 1000
    age_h = max((now - created) / 3600, 0.25) if created < 1e12 else 24.0
    return dict(mint=mint, symbol=base.get("symbol") or "?", name=base.get("name") or "",
                vol_h1=vol("h1"), vol_h6=vol("h6"), vol_h24=vol("h24"), age_h=age_h)


def group(coins, buckets, auto_min=3):
    """{theme: [coin, ...]}. Config buckets first, then auto themes from words shared by unmatched coins."""
    out = {}
    matched = set()
    for theme, kws in buckets.items():
        for c in coins:
            if match(c["name"], c["symbol"], kws):
                out.setdefault(theme, []).append(c)
                matched.add(c["mint"])
    seen = {}
    known = {w for kws in buckets.values() for k in kws for w in words(k)}
    for c in coins:
        if c["mint"] in matched:
            continue
        for w in set(words(c["name"])) | set(words(c["symbol"])):
            if len(w) >= 3 and w not in STOP and w not in known and not w.isdigit():
                seen.setdefault(w, []).append(c)
    for w, cs in seen.items():
        if len({c["mint"] for c in cs}) >= auto_min:
            out[f"auto:{w}"] = cs
    return out


def summarize(theme, coins):
    v24 = sum(c["vol_h24"] for c in coins)
    v6 = sum(c["vol_h6"] for c in coins)
    v1 = sum(c["vol_h1"] for c in coins)
    e6 = sum(_expected(c["vol_h24"], c["age_h"], 6, 24) for c in coins)
    e1 = sum(_expected(c["vol_h6"], c["age_h"], 1, 6) for c in coins)
    top = max(coins, key=lambda c: c["vol_h24"])
    return dict(theme=theme, n=len(coins), vol_h24=v24, vol_h6=v6, vol_h1=v1,
                pace_6h=round(v6 / e6, 2) if e6 else None, pace_1h=round(v1 / e1, 2) if e1 else None,
                top_symbol=top["symbol"], top_share=round(top["vol_h24"] / v24, 2) if v24 else None,
                symbols=[c["symbol"] for c in sorted(coins, key=lambda c: -c["vol_h24"])[:5]])


def read(row, cfg):
    """One plain label. Thresholds live in config.json → themes."""
    if row["vol_h24"] and row["vol_h1"] < row["vol_h24"] * cfg["dead_if_1h_share_below"]:
        r = "dead now (no 1h volume)"
    elif (row["pace_6h"] or 0) >= cfg["speeding_up_pace"]:
        r = "speeding up"
    elif row["pace_6h"] is not None and row["pace_6h"] <= cfg["slowing_pace"]:
        r = "slowing"
    else:
        r = "steady"
    if (row["top_share"] or 0) >= cfg["one_coin_share"] and row["n"] > 1:
        r += f"; {row['top_symbol']} is {row['top_share'] * 100:.0f}% of it"
    elif row["n"] == 1:
        r += "; one coin"
    return r


def universe(store, cfg, now):
    mints = []
    for dur in ("1h", "6h", "24h"):
        try:
            for p in S.gt_trending("solana", dur):
                base = (((p.get("relationships") or {}).get("base_token") or {}).get("data") or {}).get("id", "")
                if base.startswith("solana_"):
                    mints.append(base[7:])
        except Exception:
            pass
    try:
        mints += [t.get("tokenAddress") for t in S.ds_boosts_top() or [] if t.get("chainId") == "solana"]
    except Exception:
        pass
    mints += [r["mint"] for r in store.q("SELECT mint FROM watch WHERE vol_h1>=10000 AND last_check>=? "
                                         "ORDER BY vol_h1 DESC LIMIT ?", (now - 6 * 3600, cfg["max_coins"]))]
    return list(dict.fromkeys(m for m in mints if m))[:cfg["max_coins"]]


def build(coins, cfg):
    groups = group(coins, cfg["buckets"], cfg["auto_min_coins"])
    rows = [summarize(t, cs) for t, cs in groups.items()]
    rows = [r for r in rows if r["vol_h24"] >= cfg["min_theme_vol_h24_usd"]]
    rows.sort(key=lambda r: -r["vol_h24"])
    for r in rows:
        r["read"] = read(r, cfg)
    return rows


def refresh(desk, pairs_fn=ds_pairs_by_mint, mints=None):
    """Fetch, group, store a snapshot. Returns the rows."""
    cfg, st = desk.cfg["themes"], desk.store
    now = int(desk.clock())
    mints = mints if mints is not None else universe(st, cfg, now)
    pairs = pairs_fn(mints) if mints else {}
    coins = [c for c in (coin_row(m, pairs.get(m) or [], now) for m in mints) if c]
    rows = build(coins, cfg)
    for r in rows:
        st.x("INSERT INTO theme_snaps (ts, theme, n, vol_h24, vol_h6, vol_h1, pace_6h, pace_1h, top_symbol, top_share, read, symbols) "
             "VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
             (now, r["theme"], r["n"], r["vol_h24"], r["vol_h6"], r["vol_h1"], r["pace_6h"], r["pace_1h"],
              r["top_symbol"], r["top_share"], r["read"], ",".join(r["symbols"])))
    st.set_meta("themes_ts", now)
    st.set_meta("themes_coins", len(coins))
    return rows


def latest(store):
    ts = store.meta("themes_ts")
    if not ts:
        return None, []
    return ts, store.q("SELECT * FROM theme_snaps WHERE ts=? ORDER BY vol_h24 DESC", (ts,))


def previous(store, theme, before_ts):
    return store.one("SELECT vol_h24, ts FROM theme_snaps WHERE theme=? AND ts<=? ORDER BY ts DESC LIMIT 1",
                     (theme, before_ts))


def table(desk, limit=15):
    st, cfg = desk.store, desk.cfg["themes"]
    ts, rows = latest(st)
    if not ts:
        return f"THEMES · {LABEL}\nno snapshot yet: run `desk.py themes --refresh` or keep the desk running"
    age = (int(desk.clock()) - ts) / 60
    out = [f"THEMES · {LABEL}",
           f"{time.strftime('%Y-%m-%d %H:%M', time.gmtime(ts))} UTC ({age:.0f} min ago) · "
           f"{st.meta('themes_coins', 0)} coins · change vs {cfg['compare_hours']} h ago",
           f"{'theme':<22} {'24h':>8} {'vs':>6} {'6h':>8} {'1h':>8} {'pace6h':>7} {'pace1h':>7}  read"]
    for r in rows[:limit]:
        prev = previous(st, r["theme"], ts - cfg["compare_hours"] * 3600)
        vs = f"{(r['vol_h24'] / prev['vol_h24'] - 1) * 100:+.0f}%" if prev and prev["vol_h24"] else "new"
        pc = lambda x: f"{x:.2f}x" if x is not None else "–"   # noqa: E731
        out.append(f"{r['theme'][:22]:<22} {SR.usd(r['vol_h24']):>8} {vs:>6} {SR.usd(r['vol_h6']):>8} "
                   f"{SR.usd(r['vol_h1']):>8} {pc(r['pace_6h']):>7} {pc(r['pace_1h']):>7}  {r['read']}")
    out.append("pace >1 = more volume than an even pace would give. Volume is not price; it includes "
               "sells, wash trading and bots. Keyword buckets are rough.")
    return "\n".join(out)


def themes_for(desk, name, symbol):
    """Latest rows whose theme this coin belongs to (for the per-lead thread line)."""
    cfg = desk.cfg["themes"]
    _, rows = latest(desk.store)
    hits = []
    for r in rows:
        t = r["theme"]
        kws = [t[5:]] if t.startswith("auto:") else cfg["buckets"].get(t)
        if kws and match(name, symbol, kws):
            hits.append(r)
    return hits


class ThemeClock:
    """Background loop owned by HEAD. Refreshes the theme table; never touches a lead's path."""

    def __init__(self, desk):
        self.d = desk

    def loop(self):
        cfg = self.d.cfg.get("themes") or {}
        if not cfg.get("enabled"):
            return
        while not self.d.stop.is_set():
            try:
                rows = refresh(self.d)
                hot = [r["theme"] for r in rows if r["read"].startswith("speeding up")][:3]
                self.d.say("HEAD", "info", f"themes ({LABEL}): {len(rows)} themes · speeding up: "
                                           f"{', '.join(hot) or 'none'}")
            except Exception as e:
                self.d.say("HEAD", "warn", f"themes refresh failed ({type(e).__name__}: {e}); desk unaffected")
            self.d.stop.wait(cfg["refresh_min"] * 60)


def note_lead(desk, lead):
    """Thread line for one lead. Display only: written to the thread, never to the dossier."""
    cfg = desk.cfg.get("themes") or {}
    if not cfg.get("enabled"):
        return None
    hits = themes_for(desk, lead.get("name"), lead.get("symbol"))
    if not hits:
        msg = "no tracked theme"
    else:
        msg = "; ".join(f"{h['theme']} ({h['read']}, pace6h {h['pace_6h'] if h['pace_6h'] is not None else '–'}x)"
                        for h in hits[:3])
    text = f"#{lead['id']:03d} theme: {msg} [{LABEL}]"
    desk.say("HEAD", "info", text, lead["id"])
    return text
