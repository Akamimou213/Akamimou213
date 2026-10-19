#!/usr/bin/env python3
"""Generate blogs/<cluster>/_CLUSTER.md from article frontmatter + topic plan (skips existing unless --force)."""
import csv, glob, os, re, sys, yaml
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
plan = {r["slug"]: r for r in csv.DictReader(open(os.path.join(ROOT, "keywords/blog-topic-plan.csv")))}
force = "--force" in sys.argv
for d in sorted(glob.glob(os.path.join(ROOT, "blogs/*/"))):
    out = os.path.join(d, "_CLUSTER.md")
    if os.path.exists(out) and not force: continue
    arts = []
    for f in glob.glob(d + "*.md"):
        if os.path.basename(f).startswith("_"): continue
        t = open(f).read(); m = re.match(r"^---\n(.*?)\n---\n(.*)$", t, re.S)
        fm = yaml.safe_load(m.group(1)); body = m.group(2)
        notes = re.search(r"<!--\s*WRITER NOTES:(.*?)-->", body, re.S)
        words = len(re.findall(r"\b\w+\b", re.sub(r"<!--.*?-->", "", body, flags=re.S)))
        p = plan.get(fm["slug"], {})
        arts.append((int(p.get("order") or 99), fm, words, p, (notes.group(1).strip() if notes else "")))
    if not arts: continue
    arts.sort(key=lambda a: a[0])
    name = os.path.basename(os.path.dirname(d))
    L = [f"# Cluster: {name}", "", f"{len(arts)} drafts · all `review_status: draft-needs-medical-review` · generated from frontmatter by `scripts/build_cluster_index.py`", "",
         "| # | Slug | Title | Primary keyword | Volume / tier | Words | Pillar | Feature deps |", "|---|---|---|---|---|---|---|---|"]
    for o, fm, w, p, _ in arts:
        L.append(f"| {o} | `{fm['slug']}` | {fm['title']} | {fm['primary_keyword']} | {p.get('volume_or_tier','')[:40]} | {w} | `{fm.get('pillar','')}` | {', '.join(fm.get('feature_dependencies') or []) or '—'} |")
    L += ["", "## Internal link map", ""]
    for o, fm, *_ in arts: L.append(f"- `{fm['slug']}` → " + ", ".join(f"`{x}`" for x in (fm.get("internal_links") or [])))
    L += ["", "## Publish order", "", "Publish in the order above (by opportunity score), after the pillar page is live and `/blog/when-to-see-doctor-bowel-changes` exists.", "", "## Reviewer questions (from writer notes)", ""]
    for o, fm, _, _, n in arts:
        q = re.search(r"open questions for medical reviewer:(.*)", n, re.S | re.I)
        L.append(f"- **{fm['slug']}**: " + (q.group(1).strip().replace("\n", " ")[:600] if q else "see writer notes at end of file"))
    open(out, "w").write("\n".join(L) + "\n"); print("wrote", os.path.relpath(out, ROOT))
