#!/usr/bin/env python3
"""Post-deploy SEO check for getregular.com. Run after every deploy:

    python3 scripts/seo_check.py                       # live site
    python3 scripts/seo_check.py --base https://preview-url.vercel.app

Checks the crawl basics Google, Bing and AI answer engines depend on:
redirects, robots.txt, the sitemap, and for every sitemap URL: status,
canonical, noindex, title, description, H1 in the server HTML, JSON-LD.
Exit code 1 if any FAIL. Standard library only.
"""
import argparse, json, re, sys, urllib.error, urllib.request
from datetime import date
from xml.etree import ElementTree as ET

UA = "Mozilla/5.0 (compatible; GetRegularSEOCheck/1.0)"
# Search and AI answer crawlers that must not be blocked (training bots are an owner decision).
MUST_ALLOW = ["Googlebot", "Bingbot", "OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "Claude-SearchBot", "Applebot"]

results = []
def report(level, what, detail=""):
    results.append((level, what, detail))
    print(f"[{level}] {what}" + (f"  ({detail})" if detail else ""))

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k): return None
opener = urllib.request.build_opener(NoRedirect)

def get(url):
    """Return (status, headers, body) without following redirects."""
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        r = opener.open(req, timeout=30)
        return r.status, r.headers, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.headers, e.read().decode("utf-8", "replace") if e.fp else ""

def check_redirects(www):
    apex = www.replace("://www.", "://")
    for src in (apex + "/", www.replace("https://", "http://") + "/"):
        st, h, _ = get(src)
        loc = h.get("Location", "") if h else ""
        if st in (301, 308) and loc.rstrip("/") == www:
            report("PASS", f"{src} -> {loc} ({st})")
        elif st in (302, 307):
            report("FAIL", f"{src} redirects with temporary {st}", "use 301 or 308")
        else:
            report("FAIL", f"{src} returned {st} -> {loc or 'no redirect'}", f"expected 308 to {www}/")

def parse_robots(txt):
    groups, cur, last_was_agent = [], None, False
    for line in txt.splitlines():
        line = line.split("#")[0].strip()
        if ":" not in line: continue
        k, v = [x.strip() for x in line.split(":", 1)]
        k = k.lower()
        if k == "user-agent":
            if not last_was_agent: cur = {"agents": [], "disallow": []}; groups.append(cur)
            cur["agents"].append(v.lower()); last_was_agent = True
        else:
            last_was_agent = False
            if k == "disallow" and cur is not None and v: cur["disallow"].append(v)
    return groups

def check_robots(www):
    st, h, body = get(www + "/robots.txt")
    if st != 200:
        report("FAIL", f"robots.txt returned {st}"); return
    report("PASS", "robots.txt returns 200")
    if not re.search(rf"^sitemap:\s*{re.escape(www)}/sitemap\.xml\s*$", body, re.I | re.M):
        report("FAIL", "robots.txt has no 'Sitemap: " + www + "/sitemap.xml' line")
    else:
        report("PASS", "robots.txt points to the www sitemap")
    groups = parse_robots(body)
    for bot in MUST_ALLOW:
        g = next((g for g in groups if bot.lower() in g["agents"]), None) or next((g for g in groups if "*" in g["agents"]), None)
        if g and "/" in g["disallow"]:
            report("FAIL", f"robots.txt blocks {bot} from the whole site")
    report("INFO", "robots.txt user-agents: " + ", ".join(sorted({a for g in groups for a in g["agents"]})) or "none")

def sitemap_urls(www):
    st, h, body = get(www + "/sitemap.xml")
    if st != 200:
        report("FAIL", f"sitemap.xml returned {st}"); return []
    try:
        root = ET.fromstring(body.encode())
    except ET.ParseError as e:
        report("FAIL", "sitemap.xml is not valid XML", str(e)); return []
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    if root.tag.endswith("sitemapindex"):
        urls = []
        for loc in root.findall("s:sitemap/s:loc", ns):
            _, _, sub = get(loc.text.strip())
            urls += [(u.findtext("s:loc", "", ns).strip(), u.findtext("s:lastmod", "", ns).strip()) for u in ET.fromstring(sub.encode()).findall("s:url", ns)]
    else:
        urls = [(u.findtext("s:loc", "", ns).strip(), u.findtext("s:lastmod", "", ns).strip()) for u in root.findall("s:url", ns)]
    report("PASS" if urls else "FAIL", f"sitemap.xml lists {len(urls)} URLs")
    today = date.today().isoformat()
    for loc, lastmod in urls:
        if not loc.startswith(www):
            report("FAIL", f"sitemap URL not on {www}", loc)
        if lastmod and lastmod[:10] > today:
            report("FAIL", f"sitemap lastmod in the future", f"{loc} {lastmod}")
    return [loc for loc, _ in urls]

def check_page(url, titles):
    st, h, body = get(url)
    if st != 200:
        report("FAIL", f"{url} returned {st}", (h.get("Location") if h else "") or "sitemap URLs must return 200 with no redirect"); return
    problems = []
    robots_meta = re.findall(r'<meta[^>]+name=["\']robots["\'][^>]*content=["\']([^"\']+)', body, re.I)
    xrobots = (h.get("X-Robots-Tag") or "") if h else ""
    if any("noindex" in m.lower() for m in robots_meta) or "noindex" in xrobots.lower():
        problems.append("noindex (remove it from the sitemap, or remove the noindex)")
    canon = re.search(r'<link[^>]+rel=["\']canonical["\'][^>]*href=["\']([^"\']+)', body, re.I) or re.search(r'<link[^>]+href=["\']([^"\']+)["\'][^>]*rel=["\']canonical', body, re.I)
    if not canon: problems.append("no canonical")
    elif canon.group(1).rstrip("/") != url.rstrip("/"): problems.append(f"canonical points elsewhere: {canon.group(1)}")
    titles_found = re.findall(r"<title[^>]*>(.*?)</title>", body, re.I | re.S)
    if not titles_found: problems.append("no <title>")
    else:
        t = titles_found[0].strip()
        if len(titles_found) > 1: problems.append(f"{len(titles_found)} <title> tags")
        titles.setdefault(t, []).append(url)
    if not re.search(r'<meta[^>]+name=["\']description["\']', body, re.I): problems.append("no meta description")
    h1 = re.search(r"<h1[^>]*>(.*?)</h1>", body, re.I | re.S)
    if not h1 or not re.sub(r"<[^>]+>", "", h1.group(1)).strip(): problems.append("no H1 text in the server HTML")
    for block in re.findall(r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', body, re.I | re.S):
        try: json.loads(block)
        except ValueError: problems.append("JSON-LD does not parse")
    report("FAIL" if problems else "PASS", url, "; ".join(problems))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="https://www.getregular.com")
    a = ap.parse_args()
    www = a.base.rstrip("/")
    print(f"SEO check for {www} on {date.today()}\n")
    if "://www." in www: check_redirects(www)
    check_robots(www)
    st, _, _ = get(www + "/llms.txt")
    report("INFO", f"llms.txt returned {st}", "optional; not a ranking factor")
    titles = {}
    for u in sitemap_urls(www):
        check_page(u, titles)
    for t, us in titles.items():
        if len(us) > 1: report("FAIL", f"duplicate title on {len(us)} pages", t)
    fails = sum(1 for r in results if r[0] == "FAIL")
    print(f"\n{fails} FAIL, {sum(1 for r in results if r[0] == 'PASS')} PASS")
    sys.exit(1 if fails else 0)

if __name__ == "__main__":
    main()
