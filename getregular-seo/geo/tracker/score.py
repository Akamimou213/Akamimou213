"""Score one AI answer against the Get Regular fact sheet.

Implements the scoring rubric in geo/geo-aeo-strategy.md section 8.4:
mention, rank position, owned / store / third-party citation, competitor
list and critical accuracy errors. Pure functions, no network, so the
rubric can be tested offline (see test_score.py).
"""

import re
from urllib.parse import urlparse

APP_ID = "6749188690"
OWNED_HOSTS = ("getregular.com",)

# "Get Regular" the app. Excludes getregulars.com (Regulars, a Danish
# hospitality SaaS) and "get regular exercise"-style prose: we require the
# brand casing or the domain, then exclude the known collision.
BRAND_RE = re.compile(r"\bGet Regular\b|\bGetRegular\b|getregular\.com", re.I)
COLLISION_RE = re.compile(r"getregulars\b|\bRegulars\b")
PROSE_RE = re.compile(r"\bget regular (?:exercise|sleep|meals|bowel|check|physical|activity)", re.I)

# Competitors seen in the 19 Oct proxy panel (brands_seen, >= 2 prompts) plus
# the app-store names most often listed. Order does not matter.
COMPETITORS = [
    "mySymptoms", "Cara Care", "Bowelle", "Plop", "Balloon", "CareClinic",
    "Gutly", "Triggerbites", "Monash FODMAP", "Cronometer", "Bearable",
    "Gut AI", "Vyla", "Bloom", "Gut Pace", "Biome", "Mouth To Gut", "Endive",
    "Bowel Mover Pro", "Happy Poop", "Stooly", "Log Logger", "PoopCheck",
    "Poop AI", "BowelApp", "Happy Tummy", "Bloat Scan", "Debloaty", "EatSense",
    "My GutIQ", "Biomeo", "GutTrace", "Welling", "Nutrola", "Mahana", "Nerva",
    "Lin Health", "Zemedy", "Foody", "MyFitnessPal", "Cylinder", "Outputs",
    "Dookie Deluxe", "Poop Map", "PoopLog", "Poopify", "Bowelog", "Poopwell",
    "Doody", "Fig", "Spoonful", "Ate", "Nerva",
]
# Short or generic names only count when written like an app name.
AMBIGUOUS = {"Plop", "Balloon", "Bloom", "Biome", "Fig", "Ate", "Outputs", "Doody", "Endive", "Foody"}

# Critical errors (section 8.4): an answer that says any of these about
# Get Regular is wrong per research/product-fact-sheet.md (19 Oct 2026).
CRITICAL = [
    ("android", re.compile(r"\b(?:available|download|get it|is) on (?:Google Play|Android)|Android (?:app|version|and iOS)|iOS and Android|Android and iOS", re.I)),
    ("fda", re.compile(r"\bFDA[- ](?:approved|cleared|registered)", re.I)),
    ("clinically_validated", re.compile(r"clinically[- ](?:validated|proven|tested)", re.I)),
    ("diagnosis", re.compile(r"\b(?:diagnoses|can diagnose|detects? (?:IBS|cancer|disease|SIBO|celiac))", re.I)),
]
# US list prices on 19 Oct 2026. Any other $ figure near the brand is a
# price error unless it is one of these.
KNOWN_PRICES = {"12.99", "79.99", "99.99", "0", "0.00"}
PRICE_RE = re.compile(r"\$\s?(\d{1,3}(?:\.\d{2})?)")


def host(url):
    try:
        h = urlparse(url).hostname or ""
    except ValueError:
        return ""
    return h[4:] if h.startswith("www.") else h


def mentions_brand(text):
    for m in BRAND_RE.finditer(text):
        window = text[max(0, m.start() - 20): m.end() + 25]
        if COLLISION_RE.search(window) or PROSE_RE.search(window):
            continue
        return True
    return False


def first_index(text, name):
    if name in AMBIGUOUS:
        pat = r"(?<![A-Za-z])" + re.escape(name) + r"(?![a-z])"
        m = re.search(pat, text)  # case-sensitive for generic words
    else:
        m = re.search(r"(?<![A-Za-z])" + re.escape(name) + r"(?![A-Za-z])", text, re.I)
    return m.start() if m else -1


def ordered_brands(text):
    """Brands in order of first appearance, Get Regular included."""
    found = []
    for name in set(COMPETITORS):
        i = first_index(text, name)
        if i >= 0:
            found.append((i, name))
    if mentions_brand(text):
        found.append((BRAND_RE.search(text).start(), "Get Regular"))
    return [n for _, n in sorted(found)]


def brand_sentences(text):
    """Sentences that talk about Get Regular, for the accuracy checks."""
    parts = re.split(r"(?<=[.!?])\s+|\n+", text)
    return [p for p in parts if BRAND_RE.search(p)]


def accuracy_errors(text):
    errs = []
    near = " ".join(brand_sentences(text))
    if not near:
        return errs
    for label, pat in CRITICAL:
        if pat.search(near):
            # "not available on Android" is correct, not an error
            if label == "android" and re.search(r"\b(?:not|isn't|no|only on iOS|iOS[- ]only)\b", near, re.I):
                continue
            if label == "clinically_validated" and re.search(r"\bnot clinically|no (?:published )?clinical validation", near, re.I):
                continue
            errs.append(label)
    for p in PRICE_RE.findall(near):
        if p not in KNOWN_PRICES and p.rstrip("0").rstrip(".") not in KNOWN_PRICES:
            errs.append("price:$" + p)
    return errs


def recommendation_level(text, brands):
    """0 absent, 1 listed, 2 recommended for a use case, 3 top pick."""
    if "Get Regular" not in brands:
        return 0
    near = " ".join(brand_sentences(text)).lower()
    if brands and brands[0] == "Get Regular" and re.search(r"\b(?:best|top pick|our pick|#1|first choice|stands out)\b", near):
        return 3
    if re.search(r"\b(?:best for|good (?:choice|option) (?:for|if)|recommend|ideal for|great for|if you want)\b", near):
        return 2
    return 1


def score(answer, citations):
    """answer: str. citations: list of {"url", "title"} from the engine."""
    brands = ordered_brands(answer)
    urls = [c.get("url", "") for c in citations]
    hosts = [host(u) for u in urls]
    owned = [u for u, h in zip(urls, hosts) if h.endswith(OWNED_HOSTS)]
    store = [u for u in urls if "apps.apple.com" in u and APP_ID in u]
    # A citation whose title names us but is not ours: an earned mention.
    third = [c.get("url", "") for c in citations
             if mentions_brand(c.get("title", "") + " " + c.get("snippet", ""))
             and not host(c.get("url", "")).endswith(OWNED_HOSTS)
             and "apps.apple.com" not in c.get("url", "")]
    return {
        "mention": int("Get Regular" in brands),
        "recommendation_level": recommendation_level(answer, brands),
        "rank_position": (brands.index("Get Regular") + 1) if "Get Regular" in brands else "",
        "owned_citation": int(bool(owned)),
        "owned_urls": ";".join(sorted(set(owned))),
        "store_citation": int(bool(store)),
        "third_party_citation": int(bool(third)),
        "third_party_urls": ";".join(sorted(set(third))),
        "competitors": ";".join(b for b in brands if b != "Get Regular"),
        "cited_domains": ";".join(dict.fromkeys(h for h in hosts if h)),
        "accuracy_errors": ";".join(accuracy_errors(answer)),
    }
