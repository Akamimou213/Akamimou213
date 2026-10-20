"""Validate aso/metadata.json against App Store limits and Get Regular claim rules.

Limits (developer.apple.com App Store Connect Help + /app-store/search/, checked
2026-10-20): name 2-30 chars, subtitle 30, keywords 100 bytes comma-separated
with no spaces after commas, promotional text 170, description 4000. Apple
advises against repeating name/subtitle words in the keyword field and
against competitor names. Claim rules: research/product-fact-sheet.md §12.
"""

import json
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent
LIMITS = {"name": 30, "subtitle": 30, "promotional_text": 170, "description": 4000, "whats_new_template": 4000}
BANNED = [r"clinically[- ]validated", r"\bdiagnos(?:e|is|es)\b(?! or treat)", r"\bFDA\b", r"\bcure", r"biomarker",
          r"\$\d", r"\bAndroid\b(?!\s*app\.)", r"what(?:'s| is| may be) causing"]
ALLOWED_CONTEXT = [r"does not diagnose", r"No Android app"]
COMPETITORS = ["mysymptoms", "bowelle", "cara", "plop", "balloon", "careclinic", "bearable", "monash", "gutly"]


def words(s):
    return {w for w in re.findall(r"[a-z0-9]+", s.lower()) if len(w) > 2}


def check(meta):
    errs, notes = [], []
    for k, lim in LIMITS.items():
        v = meta.get(k)
        if v is None:
            continue
        n = len(v)
        (errs if n > lim else notes).append(f"{k}: {n}/{lim} chars")
    if not 2 <= len(meta["name"]) <= 30:
        errs.append("name must be 2-30 chars")
    kw = meta["keywords"]
    b = len(kw.encode("utf-8"))
    (errs if b > 100 else notes).append(f"keywords: {b}/100 bytes")
    if ", " in kw or kw != kw.strip():
        errs.append("keywords: no spaces after commas")
    terms = kw.split(",")
    if len(terms) != len(set(terms)):
        errs.append("keywords: duplicate term")
    if any(len(t) <= 2 for t in terms):
        errs.append("keywords: terms must be longer than 2 characters")
    dup = words(kw) & words(meta["name"] + " " + meta["subtitle"])
    if dup:
        errs.append(f"keywords repeat name/subtitle words: {sorted(dup)}")
    hit = [c for c in COMPETITORS if c in kw.lower() or c in meta["name"].lower() or c in meta["subtitle"].lower()]
    if hit:
        errs.append(f"competitor names in indexed fields: {hit}")
    text = " ".join(meta.get(k, "") for k in ("name", "subtitle", "promotional_text", "description"))
    scrubbed = text
    for a in ALLOWED_CONTEXT:
        scrubbed = re.sub(a, "", scrubbed, flags=re.I)
    for pat in BANNED:
        m = re.search(pat, scrubbed, re.I)
        if m:
            errs.append(f"claim rule: '{m.group(0)}' ({pat})")
    return errs, notes


def main():
    data = json.loads((HERE / "metadata.json").read_text())
    errs, notes = check(data["proposed"])
    alt = data.get("spanish_mexico_localization_test", {}).get("keywords")
    if alt:
        b = len(alt.encode())
        (errs if b > 100 else notes).append(f"es-MX keywords: {b}/100 bytes")
        overlap = set(alt.split(",")) & set(data["proposed"]["keywords"].split(","))
        if overlap:
            errs.append(f"es-MX keywords duplicate en-US terms: {sorted(overlap)}")
    for n in notes:
        print("ok   ", n)
    for e in errs:
        print("ERROR", e)
    sys.exit(1 if errs else 0)


if __name__ == "__main__":
    main()
