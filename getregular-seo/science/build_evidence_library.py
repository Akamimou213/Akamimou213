"""Build the /science evidence library from the PubMed IDs our content cites.

Collects every pubmed.ncbi.nlm.nih.gov/<PMID> link in blogs/, onpage/ and
science/, plus science/extra_pmids.txt, fetches the bibliographic record from
NCBI E-utilities (esummary), and writes:

  science/evidence-library.csv    one row per study, with the clusters citing it
  science/evidence-library.json   same data, shaped for the /science/evidence page
                                  and ScholarlyArticle JSON-LD

Bibliographic fields come from NCBI only, never typed by hand. The plain-language
"what it found" summary is a separate, reviewed field (science/study-summaries.md).

Run: python3 science/build_evidence_library.py
"""

import collections
import csv
import json
import pathlib
import re
import time
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "science"
PMID_RE = re.compile(r"pubmed\.ncbi\.nlm\.nih\.gov/(\d{6,9})")
ESUMMARY = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id="

# Evidence tier by PubMed publication type, strongest first. Used for sorting
# and the badge on each study card; never shown as a quality grade.
TIERS = [
    ("Guideline", {"Practice Guideline", "Guideline", "Consensus Statement"}),
    ("Systematic review / meta-analysis", {"Systematic Review", "Meta-Analysis"}),
    ("Randomized trial", {"Randomized Controlled Trial"}),
    ("Clinical study", {"Clinical Trial", "Comparative Study", "Validation Study", "Observational Study", "Multicenter Study"}),
    ("Review", {"Review"}),
]


def cited_pmids():
    where = collections.defaultdict(set)
    for folder in ("blogs", "onpage", "science"):
        for f in (ROOT / folder).rglob("*.md"):
            text = f.read_text(encoding="utf-8")
            if "LIBRARY:START" in text:  # the generated library table cites everything; skip it
                continue
            topic = f.parent.name if folder == "blogs" else folder
            for pmid in PMID_RE.findall(text):
                where[pmid].add(topic)
    extra = OUT / "extra_pmids.txt"
    if extra.exists():
        for line in extra.read_text().splitlines():
            m = re.match(r"\s*(\d{6,9})\s*(?:#\s*(.*))?", line)
            if m:
                where[m.group(1)].add((m.group(2) or "science").strip().split()[0])
    return where


def fetch(pmids):
    recs = {}
    ids = sorted(pmids, key=int)
    for i in range(0, len(ids), 100):
        with urllib.request.urlopen(ESUMMARY + ",".join(ids[i:i + 100]), timeout=60) as r:
            res = json.load(r)["result"]
        for u in res.get("uids", []):
            recs[u] = res[u]
        time.sleep(0.4)  # NCBI asks for <= 3 requests/second without a key
    return recs


def tier(pubtypes):
    if "Retracted Publication" in pubtypes:
        return "RETRACTED"
    for name, types in TIERS:
        if types & set(pubtypes):
            return name
    return "Study"


def main():
    where = cited_pmids()
    recs = fetch(where)
    rows = []
    for pmid, topics in where.items():
        r = recs.get(pmid)
        if not r or "error" in r:
            print("NOT FOUND in PubMed:", pmid)
            continue
        authors = [a["name"] for a in r.get("authors", []) if a.get("authtype") == "Author"]
        doi = next((a["value"] for a in r.get("articleids", []) if a["idtype"] == "doi"), "")
        year = (r.get("pubdate") or r.get("epubdate") or "")[:4]
        rows.append({
            "pmid": pmid,
            "title": r.get("title", "").rstrip("."),
            "first_author": authors[0] if authors else "",
            "authors_short": (authors[0] + (" et al." if len(authors) > 1 else "")) if authors else "",
            "journal": r.get("source", ""),
            "year": year,
            "doi": doi,
            "publication_types": ";".join(r.get("pubtype", [])),
            "evidence_tier": tier(r.get("pubtype", [])),
            "cited_in": ";".join(sorted(topics)),
            "times_cited_by_us": len(topics),
            "pubmed_url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
        })
    order = {name: i for i, (name, _) in enumerate(TIERS)}
    rows.sort(key=lambda x: (order.get(x["evidence_tier"], 9), -x["times_cited_by_us"], -int(x["year"] or 0)))
    with open(OUT / "evidence-library.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0]))
        w.writeheader()
        w.writerows(rows)
    (OUT / "evidence-library.json").write_text(json.dumps(rows, indent=1, ensure_ascii=False))
    by_tier = collections.Counter(r["evidence_tier"] for r in rows)
    for r in rows:
        if r["evidence_tier"] == "RETRACTED":
            print(f"WARNING retracted: PMID {r['pmid']} ({r['authors_short']} {r['year']}) cited in {r['cited_in']}")
    print(f"{len(rows)} studies:", dict(by_tier))


if __name__ == "__main__":
    main()
