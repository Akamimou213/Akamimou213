#!/usr/bin/env python3
"""Foundation audit (playbook step 1). Read-only: it fetches pages and reports, it changes nothing.

Usage:
  python3 seo-playbook/scripts/foundation_audit.py https://example.com > audit.md
  python3 seo-playbook/scripts/foundation_audit.py https://example.com --delay 1.5 --max-urls 200

Every PASS / FAIL / WARN line carries its proof (status code, header or line).
Standard library only, Python 3.8+.
"""
import argparse, datetime, gzip, json, re, sys, time, urllib.error, urllib.parse as up, urllib.request
from html import unescape

# Bots that decide whether the site shows up in live AI answers and search, then training-only bots.
LIVE_BOTS = {
    "Googlebot": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Bingbot": "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
    "OAI-SearchBot": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot",
    "ChatGPT-User": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot",
    "Claude-SearchBot": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-SearchBot/1.0; +Claude-SearchBot@anthropic.com)",
    "Claude-User": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-User/1.0; +Claude-User@anthropic.com)",
    "PerplexityBot": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
}
TRAINING_BOTS = {
    "GPTBot": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.1; +https://openai.com/gptbot",
    "ClaudeBot": "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
}
ROBOTS_TOKENS = ["googlebot", "bingbot", "oai-searchbot", "chatgpt-user", "claude-searchbot", "claude-user",
                 "perplexitybot", "gptbot", "claudebot", "google-extended", "ccbot"]
LIVE_TOKENS = {"googlebot", "bingbot", "oai-searchbot", "chatgpt-user", "claude-searchbot", "claude-user", "perplexitybot"}
BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
RETIRED = {"FAQPage": "FAQ rich results no longer show in Google Search", "HowTo": "HowTo rich results removed in 2023"}
REVIEW_TYPES = {"AggregateRating", "Rating", "Review"}

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k): return None

def fetch(url, ua=BROWSER_UA, follow=True, timeout=25):
    """Returns (status, final_url, headers dict lower-case, body text). status 0 = network error."""
    opener = urllib.request.build_opener() if follow else urllib.request.build_opener(NoRedirect)
    req = urllib.request.Request(url, headers={"User-Agent": ua, "Accept": "text/html,application/xml;q=0.9,*/*;q=0.8"})
    try: r = opener.open(req, timeout=timeout)
    except urllib.error.HTTPError as e: r = e
    except OSError as e: return 0, url, {}, str(e)
    raw = r.read() or b""
    raw = gzip.decompress(raw) if raw[:2] == b"\x1f\x8b" else raw
    headers = {k.lower(): v for k, v in r.headers.items()}
    return r.getcode(), r.geturl(), headers, raw.decode("utf-8", "replace")

def challenged(headers, body):
    """Bot-protection page instead of the site (SiteGround, Cloudflare, generic)."""
    h = " ".join(f"{k}:{v}" for k, v in headers.items()).lower()
    if "sg-captcha" in h or "cf-mitigated" in h: return True
    return bool(re.search(r"sgcaptcha|cf-challenge|challenge-platform|just a moment\.\.\.|captcha", body[:3000], re.I))

def text_of(html):
    return " ".join(unescape(re.sub(r"<[^>]+>", " ", html)).split())

def head_tags(html):
    attr = r"""([\w:-]+)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)"""
    clean = re.sub(r"(?is)<script\b.*?</script>", " ", html)
    return [(t.lower(), {k.lower(): unescape(v.strip("\"'")).strip() for k, v in re.findall(attr, raw)})
            for t, raw in re.findall(r"(?is)<(meta|link)\s([^>]*)>", clean)]

def page_facts(url, html, headers):
    tags = head_tags(html)
    meta = {a.get("name", "").lower(): a.get("content", "") for t, a in tags if t == "meta" and a.get("name")}
    canon = [up.urljoin(url, a.get("href", "")) for t, a in tags if t == "link" and "canonical" in a.get("rel", "").lower().split()]
    robots = " ".join(v for k, v in meta.items() if k in ("robots", "googlebot")).lower()
    xrt = headers.get("x-robots-tag", "").lower()
    body = re.sub(r"(?is)<(head|script|style|noscript|template)\b.*?</\1>", " ", html)
    return dict(
        title=text_of("".join(re.findall(r"(?is)<title[^>]*>(.*?)</title>", html)[:1])),
        description=meta.get("description"),
        canonical=canon, robots=robots, x_robots=xrt,
        noindex=bool(re.search(r"\b(noindex|none)\b", robots + " " + xrt)),
        h1=[text_of(h) for h in re.findall(r"(?is)<h1\b[^>]*>(.*?)</h1>", html)],
        words=len(re.findall(r"\w+", text_of(body))),
        lang=(re.findall(r"(?is)<html[^>]*\blang=[\"']?([\w-]+)", html) or [""])[0],
        hreflang={a.get("hreflang", "").lower(): up.urljoin(url, a.get("href", "")) for t, a in tags
                  if t == "link" and "alternate" in a.get("rel", "").lower().split() and a.get("hreflang")},
    )

def jsonld_nodes(html):
    """All JSON-LD objects (top level and @graph members), plus parse errors."""
    nodes, errors = [], 0
    for blob in re.findall(r"(?is)<script[^>]*application/ld\+json[^>]*>(.*?)</script>", html):
        try: data = json.loads(blob)
        except ValueError: errors += 1; continue
        for d in (data if isinstance(data, list) else [data]):
            if not isinstance(d, dict): continue
            nodes.extend(d["@graph"] if isinstance(d.get("@graph"), list) else [d])
    return nodes, errors

def types_of(node):
    t = node.get("@type", [])
    return t if isinstance(t, list) else [t]

def all_types(obj, out):
    if isinstance(obj, dict):
        out.extend(types_of(obj)); [all_types(v, out) for v in obj.values()]
    elif isinstance(obj, list):
        [all_types(v, out) for v in obj]
    return out

def robots_groups(txt):
    """{user-agent token: [(directive, path)]}, per RFC 9309 grouping."""
    groups, agents, in_rules = {}, [], False
    for line in txt.splitlines():
        k, _, v = line.split("#")[0].strip().partition(":")
        k, v = k.strip().lower(), v.strip()
        if k == "user-agent":
            agents = ([] if in_rules else agents) + [v.lower()]; in_rules = False
            for a in agents: groups.setdefault(a, [])
        elif k in ("allow", "disallow"):
            in_rules = True
            for a in agents: groups[a].append((k, v))
    return groups

def blocks_root(rules):
    return any(d == "disallow" and p in ("/", "/*") for d, p in rules) and not any(d == "allow" and p in ("/", "/*") for d, p in rules)

def sitemap_urls(url, delay, depth=0):
    code, _, headers, xml = fetch(url)
    locs = [unescape(l).strip() for l in re.findall(r"<loc>\s*(.*?)\s*</loc>", xml)]
    if "<sitemapindex" in xml and depth == 0:
        out = []
        for child in locs:
            time.sleep(delay); out.extend(sitemap_urls(child, delay, 1))
        return out
    return [(url, code, headers.get("content-type", ""), l) for l in locs]

class Report:
    def __init__(self): self.lines, self.counts = [], {"PASS": 0, "FAIL": 0, "WARN": 0, "INFO": 0}
    def h(self, t): self.lines.append(f"\n## {t}\n")
    def add(self, level, check, proof):
        self.counts[level] += 1
        icon = {"PASS": "✅ PASS", "FAIL": "❌ FAIL", "WARN": "⚠️ WARN", "INFO": "ℹ️ INFO"}[level]
        self.lines.append(f"- **{icon}** {check}. Proof: {proof}")
    def raw(self, s): self.lines.append(s)

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("site", help="https://example.com")
    ap.add_argument("--delay", type=float, default=1.0, help="seconds between requests (be gentle with bot protection)")
    ap.add_argument("--max-urls", type=int, default=300, help="cap on sitemap URLs checked")
    ap.add_argument("--repeat", type=int, default=5, help="times to request http:// to catch intermittent challenges")
    a = ap.parse_args()

    parts = up.urlsplit(a.site if "://" in a.site else "https://" + a.site)
    apex = parts.netloc.lower().removeprefix("www.")
    main_url = f"https://{parts.netloc.lower()}/"
    year = datetime.date.today().year
    R = Report()
    R.raw(f"# Foundation audit: {apex}\n\nRun {datetime.datetime.now(datetime.timezone.utc):%Y-%m-%d %H:%M} UTC by `seo-playbook/scripts/foundation_audit.py`. "
          "Read-only. Requests come from one cloud IP, so firewall rules keyed on real bot IPs can behave differently (see the CDN/host logs).")

    # 1. robots.txt
    R.h("1. robots.txt (live file)")
    code, _, headers, robots = fetch(main_url + "robots.txt")
    if code == 200:
        R.add("PASS", "robots.txt returns 200", f"`{headers.get('content-type', '?')}`")
    elif code == 404:
        R.add("WARN", "No robots.txt (404 means 'no rules' to Google)", "status 404"); robots = ""
    else:
        R.add("FAIL", "robots.txt does not return 200/404 (5xx or 429 can pause crawling)", f"status {code}"); robots = ""
    if robots:
        R.raw("\n```\n" + robots.strip()[:3000] + "\n```")
        if re.search(r"cloudflare|content-signal|managed", robots, re.I):
            R.add("WARN", "robots.txt has CDN-managed lines you may not have written", "Cloudflare/Content-Signal text present")
        g = robots_groups(robots)
        star = g.get("*", [])
        for tok in ROBOTS_TOKENS:
            rules = g.get(tok, star)
            src = f"group `{tok}`" if tok in g else "falls back to `*`"
            if blocks_root(rules):
                R.add("FAIL" if tok in LIVE_TOKENS else "INFO",
                      f"`{tok}` is blocked from the whole site" + ("" if tok in LIVE_TOKENS else " (training bot: a business decision)"), src)
        if not any(blocks_root(g.get(t, star)) for t in LIVE_TOKENS):
            R.add("PASS", "No live-answer bot (Googlebot, Bingbot, OAI-SearchBot, Claude-SearchBot, PerplexityBot, *-User) is blocked by robots.txt", "rules above")
        sm_lines = re.findall(r"(?im)^\s*sitemap:\s*(\S+)", robots)
    else:
        sm_lines = []

    # 2. What each bot actually gets
    time.sleep(a.delay)
    R.h("2. What each bot gets on the homepage (user-agent test)")
    R.raw("| Bot | Kind | Status | Challenge page | X-Robots-Tag |\n|---|---|---|---|---|")
    bad_live = []
    for kind, bots in (("live", LIVE_BOTS), ("training", TRAINING_BOTS)):
        for name, ua in bots.items():
            c, _, hd, body = fetch(main_url, ua=ua)
            ch = challenged(hd, body)
            R.raw(f"| {name} | {kind} | {c} | {'yes' if ch else 'no'} | {hd.get('x-robots-tag', '-')} |")
            if kind == "live" and (c != 200 or ch): bad_live.append(f"{name}={c}{' challenge' if ch else ''}")
            time.sleep(a.delay)
    R.raw("")
    if bad_live: R.add("FAIL", "A live-answer bot did not get a clean 200", ", ".join(bad_live))
    else: R.add("PASS", "Every live-answer bot user-agent got a clean 200", "table above")
    R.add("INFO", "This test only catches rules keyed on the user-agent. Rules on verified-bot IPs show only in the host/CDN logs", "-")

    # 3. Host and protocol variants
    R.h("3. One address: http/https and www/non-www")
    variants = [f"http://{apex}/", f"http://www.{apex}/", f"https://www.{apex}/", f"https://{apex}/"]
    for v in variants:
        seen = []
        tries = a.repeat if v.startswith("http://") else 2
        for _ in range(tries):
            c, _, hd, body = fetch(v, follow=False)
            seen.append((c, hd.get("location", ""), challenged(hd, body), hd.get("x-robots-tag", "")))
            time.sleep(a.delay)
        codes = ", ".join(f"{c}{'→' + loc if loc else ''}{' CHALLENGE' if ch else ''}{' x-robots:' + x if x else ''}" for c, loc, ch, x in seen)
        if v.rstrip("/") + "/" == main_url:
            ok = all(c == 200 and not ch for c, _, ch, _ in seen)
            R.add("PASS" if ok else "FAIL", f"Main address `{v}` answers 200 directly", codes)
        else:
            good = all(c in (301, 308) and loc.startswith(main_url.rstrip("/")) and not ch for c, loc, ch, _ in seen)
            chal = any(ch for _, _, ch, _ in seen)
            if good: R.add("PASS", f"`{v}` sends one permanent redirect to the main address", codes)
            elif chal: R.add("FAIL", f"`{v}` sometimes serves a bot challenge instead of a redirect", codes)
            else: R.add("FAIL", f"`{v}` does not 301/308 straight to the main address", codes)

    # 4. Homepage raw HTML
    time.sleep(a.delay)
    R.h("4. Homepage raw HTML (what a crawler that runs no JavaScript sees)")
    c, final, hd, html = fetch(main_url)
    f = page_facts(final, html, hd)
    R.add("PASS" if f["h1"] else "FAIL", "H1 present in raw HTML", f"{f['h1'][:2] or 'none'}")
    R.add("PASS" if f["words"] >= 150 else "FAIL", "Main text present in raw HTML", f"{f['words']} visible words")
    R.add("PASS" if f["title"] else "FAIL", "Title", f"`{f['title'][:120]}`")
    R.add("PASS" if f["description"] else "WARN", "Meta description", f"`{(f['description'] or 'none')[:160]}`")
    if len(f["canonical"]) == 1 and f["canonical"][0].rstrip("/") == final.rstrip("/"):
        R.add("PASS", "One self-referencing canonical", f"`{f['canonical'][0]}`")
    else:
        R.add("FAIL", "Canonical missing, duplicated or pointing elsewhere", f"{f['canonical'] or 'none'}")
    R.add("FAIL" if f["noindex"] else "PASS", "Homepage indexable (no noindex in meta or header)", f"meta=`{f['robots'] or '-'}` header=`{f['x_robots'] or '-'}`")

    # 5. Structured data
    R.h("5. Structured data (JSON-LD)")
    nodes, errors = jsonld_nodes(html)
    if errors: R.add("FAIL", "JSON-LD block does not parse", f"{errors} block(s)")
    top = [t for n in nodes for t in types_of(n)]
    nested = all_types(nodes, [])
    R.add("PASS" if nodes else "FAIL", "JSON-LD present", f"top-level types: {', '.join(map(str, top)) or 'none'}")
    biz = [n for n in nodes if set(types_of(n)) & {"Organization", "LocalBusiness", "ProfessionalService", "HousePainter", "Plumber",
                                                   "Electrician", "HomeAndConstructionBusiness", "GeneralContractor", "RoofingContractor", "Corporation"}]
    if not biz: R.add("FAIL", "No Organization / LocalBusiness entity", "-")
    logos = {(n.get("logo", {}).get("url") if isinstance(n.get("logo"), dict) else n.get("logo")) for n in biz if n.get("logo")}
    if len(logos) > 1: R.add("WARN", "Business entities use different logos (one brand, one logo)", "; ".join(map(str, logos)))
    standalone = [t for t in top if t in REVIEW_TYPES]
    if standalone: R.add("FAIL", "Standalone review/rating markup (self-serving stars aren't shown; must match visible reviews)", ", ".join(standalone))
    for n in biz:
        if "aggregateRating" in n or "review" in n:
            R.add("WARN", f"`{types_of(n)[0]}` carries aggregateRating/review (Google shows no stars for a business's own reviews)", n.get("@id", "-"))
    for t, why in RETIRED.items():
        if t in nested: R.add("WARN", f"`{t}` markup present: {why} (harmless; don't add more)", "-")
    if "WebSite" in top: R.add("PASS", "WebSite entity present (site name in results)", "-")

    # 6. Sitemap and every listed URL
    R.h("6. Sitemap: only indexable pages")
    sm_src = sm_lines or [main_url + "sitemap.xml"]
    entries = []
    for s in sm_src:
        time.sleep(a.delay); entries.extend(sitemap_urls(s, a.delay))
    if not entries:
        R.add("FAIL", "No sitemap URLs found", f"tried {sm_src}")
    else:
        R.add("PASS", "Sitemap found" + (" via robots.txt" if sm_lines else ""), f"{len(entries)} URLs in {len({e[0] for e in entries})} file(s)")
        R.raw("\n| URL | Status | Canonical | Indexable | Title |\n|---|---|---|---|---|")
        problems, future, alts = [], [], {}
        for _, _, _, u in entries[: a.max_urls]:
            time.sleep(a.delay)
            c, fin, hd, body = fetch(u)
            if challenged(hd, body):
                R.raw(f"| {u} | {c} | - | challenge page | - |"); problems.append(f"{u} challenge"); continue
            pf = page_facts(fin, body, hd)
            alts[u] = pf["hreflang"]
            canon_ok = len(pf["canonical"]) == 1 and pf["canonical"][0] == u
            row_ok = c == 200 and fin == u and canon_ok and not pf["noindex"]
            if not row_ok: problems.append(u)
            m = re.search(r"\b(20\d\d)\b", pf["title"])
            if m and int(m.group(1)) > year: future.append(f"`{pf['title']}`")
            R.raw(f"| {u} | {c}{' → ' + fin if fin != u else ''} | {'self' if canon_ok else (pf['canonical'] or ['none'])[0]} | {'no' if pf['noindex'] else 'yes'} | {pf['title'][:70]} |")
        R.raw("")
        if len(entries) > a.max_urls: R.add("INFO", f"Checked the first {a.max_urls} URLs only", f"{len(entries)} listed")
        if problems: R.add("FAIL", "Sitemap lists URLs that redirect, error, are noindexed or canonicalise elsewhere", "; ".join(problems[:10]))
        else: R.add("PASS", "Every checked sitemap URL is 200, self-canonical and indexable", f"{min(len(entries), a.max_urls)} URLs")
        if future: R.add("WARN", f"Titles dated after {year} (engines take dates at face value)", "; ".join(future))
        # Language versions (hreflang): only when the site declares any
        if any(alts.values()):
            R.h("6b. Language versions (hreflang)")
            no_self, no_return, missing, dead = [], [], [], []
            for u, m in alts.items():
                if not m: missing.append(u); continue
                if u not in m.values(): no_self.append(u)
                for lang_code, target in m.items():
                    if target == u or lang_code == "x-default": continue
                    if target in alts:
                        if u not in alts[target].values(): no_return.append(f"{u} → {target} ({lang_code})")
                    else:
                        time.sleep(a.delay); c = fetch(target)[0]
                        if c != 200: dead.append(f"{target} ({c})")
            langs = sorted({l for m in alts.values() for l in m})
            R.add("INFO", "Languages declared", ", ".join(langs))
            R.add("FAIL" if missing else "PASS", "Every checked sitemap page declares its language versions",
                  f"{len(missing)} without hreflang: " + "; ".join(missing[:8]) if missing else f"{len(alts)} pages")
            if no_self: R.add("WARN", "Pages whose hreflang set doesn't include themselves", "; ".join(no_self[:8]))
            if no_return: R.add("FAIL", "hreflang without a return link (both pages must point to each other, or Google ignores the pair)", "; ".join(no_return[:8]))
            if dead: R.add("FAIL", "hreflang points to URLs that don't return 200", "; ".join(dead[:8]))
            if not any(l == "x-default" for m in alts.values() for l in m): R.add("WARN", "No x-default (which version to show everyone else)", "-")
            if not (no_return or dead or missing): R.add("PASS", "hreflang pairs point to each other and to live pages", f"{len(alts)} pages")

    # 7. Extras
    R.h("7. Extras")
    time.sleep(a.delay)
    c404 = fetch(main_url + "zz-foundation-audit-404-test/")[0]
    R.add("PASS" if c404 == 404 else "FAIL", "Unknown URLs return a real 404 (no soft 404)", f"status {c404}")
    time.sleep(a.delay)
    cl, _, _, llms = fetch(main_url + "llms.txt")
    R.add("INFO", "llms.txt " + ("present" if cl == 200 else "absent") + " (optional; Google Search doesn't use it, little value on small sites)", f"status {cl}")
    if cl == 200:
        links = list(dict.fromkeys(re.findall(r"\]\((https?://[^)\s]+)\)", llms)))
        listed = {e[3] for e in entries}
        dead, off_sitemap = [], []
        for l in links:
            if up.urlsplit(l).netloc.lower().removeprefix("www.") != apex or l.endswith(".xml"): continue
            time.sleep(a.delay)
            c = fetch(l)[0]
            if c != 200: dead.append(f"{l} ({c})")
            elif l not in listed: off_sitemap.append(l)
        if dead: R.add("FAIL", "llms.txt links to pages that don't return 200 (AI tools get sent to dead pages)", "; ".join(dead))
        elif links: R.add("PASS", "Every same-site link in llms.txt returns 200", f"{len(links)} links")
        if off_sitemap: R.add("WARN", "Live pages linked from llms.txt but missing from the sitemap", "; ".join(off_sitemap))

    R.h("Totals")
    R.raw(" · ".join(f"{k} {v}" for k, v in R.counts.items()))
    R.raw("\nNot checked by this script: rendered DOM, Core Web Vitals, Search Console / Bing data, Business Profile. Use the skills listed in `seo-playbook/README.md`.")
    print("\n".join(R.lines))
    return 1 if R.counts["FAIL"] else 0

if __name__ == "__main__":
    sys.exit(main())
