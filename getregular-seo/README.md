# Get Regular SEO / AEO / GEO package

Research and content were done by Claude. Implementation is done by Codex in `avandame/getregular-landing`. Copy this folder into that repo as `seo/`.

## Start here

1. **`STRATEGY.md`**: decisions, architecture, cluster plan, roadmap and the open questions for the team.
2. **`codex/00-SEO-AUTOPILOT-LOOP.md`**: paste this into Codex `/loop`.
3. **`codex/01-technical-seo-tasks.md`**: technical fixes T1–T21, with code and acceptance tests.
4. **`codex/02-content-import-and-pages.md`**: how to import the blogs and build the product and resource pages.

## Folders

| Folder | Contents |
|---|---|
| `research/` | Product fact sheet (the single source of product truth), competitor gap analysis and pages, roundup and citation targets, voice-of-customer pain points, question bank, app-review insights, seo-skills review |
| `keywords/` | Keyword strategy (method, scoring, pillar map, cannibalization rules, quick wins, SERP evidence), keyword universe (1,599 rows), blog topic plan (80 topics) |
| `technical/` | Technical audit (F01–F29) and raw evidence: curl outputs, rendered DOM, Lighthouse |
| `geo/` | GEO/AEO strategy and the 47-prompt AI panel |
| `blogs/` | `_EDITORIAL_STANDARD.md` plus 8 cluster folders × 10 article drafts, each with a `_CLUSTER.md` |
| `onpage/` | Page copy for the homepage, `/app`, `/how-ai-works`, product pages and resource pillars |
| `codex/` | Implementation specs and the autopilot loop prompt |
| `science/` | The /science section: hub, how our AI works, score method, clinical review, research program, an 82-study evidence library pulled from PubMed, and 13 "what the research says" topic pages |
| `tools/` | Five free tools (Bristol stool chart, How regular are you? quiz, poop color chart, Why am I bloated?, GI appointment prep), with tests, single-file prototypes, and the privacy and licensing rules |
| `geo/tracker/` | Runs the prompt panel on real AI engines (ChatGPT, Perplexity, Gemini, Claude) with web search, then scores and saves the evidence |

## Status and limits (19 Oct 2026)

- **80 article drafts** (8 clusters × 10, ~181k words) and **13 page-copy files** are complete.
- `python3 scripts/validate_blogs.py` passes with 0 errors and 0 warnings. It checks frontmatter, internal links, citation numbering, duplicate keywords and banned claims.
- All 60 cited PubMed IDs were verified against NCBI.
- `scripts/build_cluster_index.py` rebuilds the `_CLUSTER.md` indexes.
- Every article is a **draft that needs medical review** (`review_status: draft-needs-medical-review`). Nothing has been published. Reviewer questions sit in each `_CLUSTER.md` and in the `WRITER NOTES` comment at the end of each file.
- About 100 `[CONFIRM]` flags in `onpage/` need answers from the owner. See STRATEGY §11.
- Search volumes come from one Semrush snapshot (6 Oct). Autocomplete-only terms are labeled "unmeasured".
- The AI-visibility results are a **web-search proxy**, not real assistant output.
- Reddit and People Also Ask could not be collected from this environment. See STRATEGY §10 for the manual protocol.
- We had no access to the repo, Search Console, App Store Connect or Vercel. The technical findings are outside-in.
