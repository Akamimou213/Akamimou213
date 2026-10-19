# Get Regular blog editorial standard

Every blog in `blogs/<cluster>/` follows this standard. Codex imports the files as-is (MDX-compatible Markdown with YAML frontmatter). Writers must not deviate from the frontmatter schema.

## 1. Who we write for

People who are mid-problem with their digestion: bloated after meals, irregular, stuck in an IBS flare, confused by their stool, or about to see a GI doctor. They search in plain language ("why do I poop right after eating", "is type 6 poop bad") and they are tired of generic "eat more fiber" content. They want: a straight answer, what's normal vs. when to see a doctor, and a practical method to figure out *their own* pattern.

Get Regular's honest role: the app makes the "figure out your own pattern" part easy — log meals (photo or text), stool (Bristol type), and symptoms in one timeline; AI-assisted insights surface *possible* patterns to test and discuss with a clinician. It does not diagnose, treat, or prove causation.

## 2. Article anatomy (in this order)

1. **Frontmatter** (schema below).
2. **H1** = the title (one H1 only; it is rendered from `title`, so do NOT repeat it as `#` in the body).
3. **Answer box** (`> **Quick answer:** …`) — 40–80 words that directly answer the query in plain language. Must stand alone if quoted by Google or an AI assistant. No brand mention required here.
4. **Intro** (60–120 words, short sentences) — match the intent pattern (definition-first, how-to, listicle, or evidence/debate), say why it matters to the reader, then a **journey teaser**: "In this guide:" + 3–5 bullets linking to the H2 anchors. Vary the closing line; never "Let's dive in".
5. **Key takeaways** — 3–5 bullets.
6. **Body** — question-led H2s mirroring real user questions (from the question bank / pain points). Use tables, numbered steps, comparison grids, and definitions wherever they help. Short paragraphs (≤4 sentences).
7. **Original asset** — at least one per article: a worked tracking example (a filled 3–7 day log table), a checklist, a decision table, a template, or a "what to record" schema. Label illustrative data as illustrative.
8. **"How to track this" section** — the natural product bridge: what to record, for how long, how to read it; then how Get Regular does it (only features in the product fact sheet). One soft CTA here.
9. **When to see a doctor** — red-flag symptoms (blood in stool, black/tarry stool, unintended weight loss, persistent fever, nocturnal symptoms waking you, severe pain, anemia, symptoms starting after 50, family history of colorectal cancer/IBD/celiac, persistent change in bowel habit). Adapt to topic. Mandatory on any symptom article.
10. **FAQ** — 3–6 real questions (from autocomplete/PAA/Reddit) with 2–4-sentence answers. (FAQ rich results are gone in Google, but FAQ content is useful to readers and to answer engines.)
11. **Sources** — numbered list of primary/authoritative sources actually cited in the text (NIDDK/NIH, NHS, Mayo Clinic, Cleveland Clinic, ACG/AGA guidelines, Rome Foundation, Monash University, peer-reviewed papers via PubMed/PMC, NICE). Each with title + URL. Cite inline as `[1]`.
12. **Medical disclaimer** line (short; template below).

## 3. Frontmatter schema (required keys)

```yaml
---
title: "Bristol Stool Chart: What the 7 Poop Types Mean"   # 40–55 chars ideal, 60 max; primary query near the front
slug: "bristol-stool-chart-types"            # kebab-case, no dates, no stop-word bloat
cluster: "stool-bristol"                      # one of the cluster ids
description: "…"                             # meta description, 140–160 chars, includes primary keyword naturally
primary_keyword: "bristol stool chart types"
secondary_keywords: ["poop types", "stool consistency chart", "type 4 poop"]
search_intent: "informational"               # informational | commercial | transactional | navigational
funnel: "TOFU"                                # TOFU | MOFU | BOFU
pillar: "/tools/bristol-stool-chart"          # the pillar/product page this article supports
internal_links: ["/poop-tracker", "/learn/how-often-should-you-poop"]   # URLs actually linked in body
author: "Get Regular Editorial Team"          # replace with a real named author before publish
medical_reviewer: "PENDING"                   # MUST be a real qualified reviewer before publish
review_status: "draft-needs-medical-review"
date_published: null                          # set at publish
date_updated: null
reading_time_min: 8
schema_type: "BlogPosting"                    # BlogPosting | HowTo-style article (still BlogPosting) | CollectionPage
og_image_brief: "Clean illustrated 7-type Bristol chart in brand palette"
cta_variant: "bristol-log"                    # used by Codex to pick the App Store campaign link (ct= value)
sources_count: 6
---
```

## 4. Voice

- Calm, candid, a little warm, occasionally lightly playful about poop — never gross, never cutesy, never fear-mongering.
- Use the words people use: "poop" and "bowel movement" both; "bloated", "flare", "trigger foods". Define clinical terms once.
- Second person ("you"). Concrete numbers with sources. No filler intros ("In today's fast-paced world…"). No "In conclusion".
- Possible-pattern language: "may", "can be associated with", "a pattern worth testing" — never "the app will find your triggers" or "diagnose".
- No unsupported stats. Every number has a citation.

## 5. Product claims — hard rules

- Only claim features listed as VERIFIED in `research/product-fact-sheet.md`. Anything marked unverified → don't mention, or phrase generically ("log it in any diary or an app like Get Regular").
- Never: "clinically validated", "diagnoses", "cures", "finds your triggers", "FDA", invented ratings/user counts/testimonials.
- Never claim competitors lack a feature. Comparison articles state facts with a "checked on <date>" note and disclose that Get Regular publishes the article.
- Mention Get Regular naturally 2–4 times max per article; the article must be genuinely useful even if the reader never downloads.

## 6. SEO / AEO on-page rules

- Treat the SERP as the brief: before writing, read the current top results for the primary keyword and state (in the writer notes) what this article has that none of them has. If nothing, don't write it.
- Title pattern must match intent: definition ("What Is…/What … Means"), how-to ("How to…"), listicle ("N Best…/N Reasons…"), comparison ("A vs B: …"), problem ("Why Do I… / Is It Normal…"). One pattern per article. Align title, H1, slug and description on one topic.

- Primary keyword in title, slug, description, first 100 words, and at least one H2 — naturally.
- H2s phrased as the questions users ask. Each H2 section opens with a 1–2-sentence direct answer, then detail (this is what answer engines lift).
- Include at least one table. Include definitions as "X is …" sentences.
- 3–6 internal links with descriptive anchors: 1 up to the pillar, 2–4 to sibling articles in the cluster, 0–1 cross-cluster. Use the target slugs from `keywords/blog-topic-plan.csv`; Codex will validate links at build time.
- 4–10 external citations to primary sources.
- Length: whatever the intent needs. Typical 1,200–2,200 words. Don't pad.
- Image placeholders as `![alt text](/images/blog/<slug>/<name>.webp "IMAGE BRIEF: …")` — 1–3 per article, alt text descriptive.

## 7. Disclaimer template

> *This article is for general education and isn't medical advice. Get Regular is a tracking app — it doesn't diagnose or treat any condition. If you have red-flag symptoms or ongoing changes in your digestion, talk to a doctor.*

## 8. Publish gate (Codex must enforce via `review_status`)

Articles with `review_status: draft-needs-medical-review` must render with `noindex` or not be routed in production. Only `review_status: approved` is published to the sitemap.
