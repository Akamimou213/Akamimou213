# Review: Illyism/seo-skills (checked 19 Oct 2026, commit a47acc9)

Source: https://github.com/Illyism/seo-skills (MIT). Repo by Ilias Ism, who also sells LinkDR (backlinks) and AI SEO Tracker — several skills route to those paid products. Read with that in mind.

## Verdict

**Adopt `seo-autopilot` as the operating loop for Codex — adapted, not verbatim.** Its structure (state lives in a `seo/` folder in the repo; daily health/fact check, weekly page-2→page-1 + AI-answer check + competitor sitemap diff, monthly keyword map/articles/comparisons/tool) is exactly what a `/loop` Codex run needs. Our adapted version: `codex/00-SEO-AUTOPILOT-LOOP.md`.

| Skill | Use it? | How we use it / why not |
|---|---|---|
| seo-autopilot | **Yes, adapted** | Basis for the Codex loop. Changes: ship mode = PR for review (health/YMYL content); articles only publish after medical review (`review_status: approved`); no "12 fixes/week" quota; GSC/Bing data required before "page 2→1" work. |
| seo-title-optimization | **Yes** | Folded into `blogs/_EDITORIAL_STANDARD.md`: SERP-as-brief, intent-matched title pattern, 40–55 char ideal, title/H1/slug/description aligned. |
| intro | **Yes** | Folded into the standard: short intent-matched intro + "In this guide" journey teaser linking to H2 anchors. |
| customer-journey | **Yes** | Used to structure the AI prompt panel by awareness stage (unaware → most aware). |
| understand-customers | Partly | Our VOC research (Reddit, reviews, autocomplete) replaces its brainstorm-from-imagination prompts with real quotes. |
| blog-refresher | **Later** | Use from month 3 on pages with GSC impressions at positions 8–20. Useless before we have ranking data. |
| blitz-seo | **No (not now)** | The skill itself says not for "brand-new domains with zero authority" — getregular.com has ~3 ranking keywords. Its daily "3–5 new backlinks" and "re-submit in GSC daily" are not sound practice; the cited result is a single anecdote. Revisit for `/poop-tracker` once it sits at positions 5–20. |
| linkdr | **No** | Paid placements that pass link equity are a link scheme under Google spam policies (https://developers.google.com/search/docs/essentials/spam-policies#link-spam). For a health app, the downside (manual action, trust) outweighs the upside. Earn links via tools/templates/roundup inclusion instead. |
| diff-marketing, scribiz, blitz-copy | Optional | Changelog from app releases (diff-marketing) is useful for the `/changelog` page and freshness; not core to this project. |
