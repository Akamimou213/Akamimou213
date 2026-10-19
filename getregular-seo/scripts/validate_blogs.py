#!/usr/bin/env python3
"""Validate blog drafts: frontmatter schema, internal links, citations, lengths.
Usage: python3 scripts/validate_blogs.py  (run from getregular-seo/)"""
import csv, glob, os, re, sys
import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REQ = ["title", "slug", "cluster", "description", "primary_keyword", "search_intent", "funnel",
       "pillar", "internal_links", "review_status", "sources", "feature_dependencies"]
plan = list(csv.DictReader(open(os.path.join(ROOT, "keywords/blog-topic-plan.csv"))))
blog_slugs = {r["slug"] for r in plan}
FIXED = {"/", "/app", "/how-ai-works", "/poop-tracker", "/food-symptom-tracker", "/ibs-tracker",
         "/science", "/privacy", "/gut-health-app-comparison", "/legal/privacy-policy", "/legal/terms-of-service"}
RES = {"/resources/" + s for s in ["bristol-stool-chart", "bristol-stool-chart-pdf", "food-symptom-diary", "ibs-food-diary",
       "bloating-after-eating", "constipation-diary", "food-diary-for-diarrhea", "gastroenterologist-appointment-prep"]}
valid = FIXED | RES | {"/blog/" + s for s in blog_slugs} | {"/blog/what-your-poop-is-trying-to-tell-you"}

errors, warns, rows = [], [], []
files = sorted(f for f in glob.glob(os.path.join(ROOT, "blogs/*/*.md")) if not os.path.basename(f).startswith("_"))
seen_kw = {}
for f in files:
    rel = os.path.relpath(f, ROOT)
    txt = open(f).read()
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", txt, re.S)
    if not m:
        errors.append(f"{rel}: no frontmatter"); continue
    try:
        fm = yaml.safe_load(m.group(1))
    except Exception as e:
        errors.append(f"{rel}: YAML error {e}"); continue
    body = re.sub(r"<!--.*?-->", "", m.group(2), flags=re.S)
    for k in REQ:
        if k not in fm: errors.append(f"{rel}: missing {k}")
    slug = fm.get("slug")
    if slug != os.path.basename(f)[:-3]: errors.append(f"{rel}: slug != filename")
    if slug not in blog_slugs: warns.append(f"{rel}: slug not in topic plan")
    t, d = fm.get("title", ""), fm.get("description", "")
    if len(t) > 65: warns.append(f"{rel}: title {len(t)} chars")
    if not 120 <= len(d) <= 170: warns.append(f"{rel}: description {len(d)} chars")
    kw = (fm.get("primary_keyword") or "").lower()
    if kw in seen_kw: errors.append(f"{rel}: primary_keyword duplicates {seen_kw[kw]}")
    seen_kw[kw] = rel
    if re.search(r"(?m)^# ", body): errors.append(f"{rel}: body contains H1")
    if "Quick answer" not in body: warns.append(f"{rel}: no quick answer box")
    links = set(re.findall(r"\]\((/[^)\s#]*)", body))
    for l in links:
        if l.startswith("/images/"): continue
        if l.rstrip("/") not in valid and l != "/": errors.append(f"{rel}: unknown internal link {l}")
    declared = set(fm.get("internal_links") or [])
    used = {l for l in links if not l.startswith("/images/")}
    if used - declared: warns.append(f"{rel}: links not declared in internal_links: {sorted(used - declared)}")
    n_src = len(fm.get("sources") or [])
    cites = {int(x) for x in re.findall(r"\[(\d{1,2})\](?!\()", body)}
    if cites and max(cites) > n_src: errors.append(f"{rel}: cites [{max(cites)}] but only {n_src} sources")
    for bad in ["clinically validated", "diagnoses your", "cures ", "finds your triggers", "find your triggers"]:
        if bad in body.lower(): errors.append(f"{rel}: banned phrase '{bad.strip()}'")
    words = len(re.findall(r"\b\w+\b", body))
    rows.append((rel, words, n_src, len(used), fm.get("review_status"), ",".join(fm.get("feature_dependencies") or [])))

print(f"{len(files)} articles checked\n")
for r in rows: print("{:<62} {:>5}w {:>2}src {:>2}links {} {}".format(*r))
print(f"\nERRORS ({len(errors)})"); [print("  " + e) for e in errors]
print(f"WARNINGS ({len(warns)})"); [print("  " + w) for w in warns]
sys.exit(1 if errors else 0)
