"""Rebuild the study table in science/evidence/index.md from the evidence library.

Reads science/evidence-library.csv (written by build_evidence_library.py from
PubMed) and replaces everything between the markers

    <!-- LIBRARY:START -->
    <!-- LIBRARY:END -->

in science/evidence/index.md with one Markdown table per evidence tier,
strongest tier first. Bibliographic fields are copied from the CSV as-is; they
are never typed by hand. Copy outside the markers is left untouched.

Run after build_evidence_library.py:
    python3 science/build_evidence_index.py
"""

import collections
import csv
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent
CSV_PATH = HERE / "evidence-library.csv"
PAGE = HERE / "evidence" / "index.md"
START, END = "<!-- LIBRARY:START -->", "<!-- LIBRARY:END -->"

# Same order as TIERS in build_evidence_library.py, plus its fallback "Study".
TIER_ORDER = [
    "Guideline",
    "Systematic review / meta-analysis",
    "Randomized trial",
    "Clinical study",
    "Review",
    "Study",
    "RETRACTED",
]
TIER_NOTES = {
    "Guideline": "Clinical practice guidelines and consensus statements from professional bodies.",
    "Systematic review / meta-analysis": "Studies that pool the results of many earlier studies.",
    "Randomized trial": "Studies PubMed indexes as randomized controlled trials.",
    "Clinical study": "Clinical trials, validation, comparative and observational studies (by PubMed publication type).",
    "Review": "Narrative and expert reviews.",
    "Study": "Other original research, including surveys and population studies.",
    "RETRACTED": "Retracted papers. Listed only so readers can see we don't rely on them; never cite their findings.",
}

# Content clusters (where a study is cited) -> /learn hub slug, for the topic filter.
CLUSTER_TO_HUB = {
    "stool-bristol": "poop",
    "poop": "poop",
    "food-symptom-diary": "food-and-symptoms",
    "ibs": "ibs",
    "bloating-gas": "bloating",
    "constipation": "constipation",
    "diarrhea": "diarrhea",
    "apps-comparisons": "gut-health-apps",
    "gut-health-apps": "gut-health-apps",
    "doctor-prep": "doctor-visits",
}
HUB_ORDER = ["poop", "food-and-symptoms", "ibs", "bloating", "constipation",
             "diarrhea", "gut-health-apps", "doctor-visits"]


def cell(text):
    """Make a value safe inside a Markdown table cell."""
    return re.sub(r"\s+", " ", (text or "").replace("|", "\\|")).strip()


def hubs(cited_in):
    found = {CLUSTER_TO_HUB[c] for c in cited_in.split(";") if c in CLUSTER_TO_HUB}
    return ", ".join(h for h in HUB_ORDER if h in found) or "general"


def build_table(rows):
    groups = collections.defaultdict(list)
    for r in rows:
        tier = r["evidence_tier"] if r["evidence_tier"] in TIER_ORDER else "Study"
        groups[tier].append(r)

    out = [
        f"_Generated from `science/evidence-library.csv` by `science/build_evidence_index.py`: "
        f"{len(rows)} studies. Do not edit by hand._",
        "",
    ]
    for tier in TIER_ORDER:
        items = sorted(groups.get(tier, []), key=lambda r: (-int(r["year"] or 0), r["first_author"]))
        if not items:
            continue
        out += [f"### {tier} ({len(items)})", "", TIER_NOTES[tier], "",
                "| Title | First author | Journal | Year | Topics | PubMed |",
                "|---|---|---|---|---|---|"]
        for r in items:
            out.append(
                f"| {cell(r['title'])} | {cell(r['first_author'])} | *{cell(r['journal'])}* | "
                f"{cell(r['year'])} | {hubs(r['cited_in'])} | "
                f"[PMID {r['pmid']}]({r['pubmed_url']}) |"
            )
        out.append("")
    return "\n".join(out).rstrip() + "\n"


def main():
    with CSV_PATH.open(encoding="utf-8", newline="") as f:
        rows = list(csv.DictReader(f))
    page = PAGE.read_text(encoding="utf-8")
    if page.count(START) != 1 or page.count(END) != 1 or page.index(START) > page.index(END):
        sys.exit(f"{PAGE}: expected exactly one {START} ... {END} block")
    head, rest = page.split(START, 1)
    _, tail = rest.split(END, 1)
    PAGE.write_text(f"{head}{START}\n\n{build_table(rows)}\n{END}{tail}", encoding="utf-8")
    print(f"Wrote {len(rows)} studies to {PAGE.relative_to(HERE.parent)}")


if __name__ == "__main__":
    main()
