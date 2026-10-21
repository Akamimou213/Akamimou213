# Get Regular: SEO, AEO & GEO master strategy (v2, 19 Oct 2026)

This upgrades the 6 Oct and 14 Oct plans with new research on 19 Oct: a live technical audit, competitor sitemaps and SERPs, 1,417 app reviews, ~2,900 autocomplete questions, a proxy test of AI answers, and 80 drafted articles. Detailed evidence lives in the linked files. This page holds the decisions.

## 1. Where we actually stand

| Signal | Today | Source |
|---|---|---|
| Organic footprint | ~3 ranking keywords, ~7 est. visits/mo (Semrush, 6 Oct). A search tool shows only the homepage indexed | inputs workbook; `technical/technical-audit.md` F29 |
| AI answers | Absent for **0/37** non-branded prompts in a web-search proxy. Competitors mySymptoms, Cara Care, Bowelle, Plop and Balloon dominate | `geo/geo-aeo-strategy.md` §0 |
| Third-party mentions | Listed in **0 of 30** verifiable app roundups and directories | `research/roundup-and-citation-targets.csv` |
| Site | Home, `/blog` (1 post) and 2 legal pages. H1 is invisible until JS runs, mobile LCP 22–23 s (lab). Apex→www is a 307, sitemap URLs redirect, no robots.txt, no canonicals, Canadian App Store links | `technical/technical-audit.md` |
| Trust risk | "Clinically Validated", "$3,000+/yr", "3 years to diagnosis" and "40%" appear with no source. App Store privacy label (location) doesn't match the privacy policy | F01; `research/product-fact-sheet.md` §10 |
| App Store | US 4.9★ from **13** ratings, vs Bowelle ~2.2K, Plop ~1.5K, Balloon ~1.1K | fact sheet |

**What this means:** there is almost nothing to optimize yet. The win comes from building the right pages on weak SERPs, fixing the 6 technical blockers, and getting Get Regular into the sources AI engines already read (App Store, roundups, YouTube). Ranking for "gut health" or "bristol stool chart" is a 12-month+ ambition, not the plan.

## 2. What changed vs the earlier plans

| Earlier plan | Now | Why |
|---|---|---|
| Ship 2–4 pages, delay content until demand validated | **8 clusters × 10 drafted articles + 9 pillars**, released cluster-by-cluster as medical review clears | Demand is now validated by 662 Semrush terms + 9,658 autocomplete suggestions + 82 live SERP checks. Many target SERPs are held by Ubie AI pages, patents, Etsy and PDFs: weak incumbents |
| `/features/…`, `/guides/…`, `/tools/…`, `/learn/…` | **`/blog/<slug>` (already live), `/resources/<slug>` (pillars and tools), root product pages (`/poop-tracker`, `/food-symptom-tracker`, `/ibs-tracker`, `/app`)** | `/blog` already exists and is indexed-eligible. Fewer folder types means fewer duplicate-intent mistakes |
| Comparisons "later, demand-dependent" | **Comparison and "alternatives" content is a P1 GEO play** (drafts done; publish after hands-on test notes) | AI answers for "best X app" are built from vendor self-rankings (Balloon, Triggerbites) and a 2020 Healthline list. A dated, disclosed, fair comparison has no real competition |
| AI visibility = technical eligibility | **AI visibility = being in the retrieved sources**: App Store listing (24/37 prompts), roundups, competitor "alternatives" pages, YouTube | Proxy test plus citation studies (`geo/geo-aeo-strategy.md` §1–2) |
| "Clinically validated" positioning | **Remove unsupported claims now; lead with "be heard by your doctor"** | Strongest motivation in 163 positive competitor reviews; Doctor Report is a verified Premium feature |

## 3. How we match intent (journey → page → prompt)

| Stage | What they type (Google / AI) | Page type that wins | Our page | CTA |
|---|---|---|---|---|
| Unaware / worried | "is green poop normal", "why am I bloated every night", "diarrhea right after eating" | Direct answer + what's normal + red flags | `/blog/*` symptom posts (C1, C4, C5, C6) | Soft: "track it for a week" → pillar printable |
| Problem-aware | "how to find food triggers", "food diary for IBS", "how to track bowel movements" | Method + worked example + printable | `/resources/*` pillars + C2/C3 posts | Printable first, app as the easier way |
| Solution-aware | "poop tracker app", "food and symptom tracker", "best IBS app" | App page with real UI, honest comparison | `/poop-tracker`, `/food-symptom-tracker`, `/ibs-tracker`, C7 posts | App Store (page-specific `ct=`) |
| Product-aware | "mySymptoms alternative", "Get Regular vs Bowelle", "is Get Regular free" | Fair comparison, facts page, pricing in plain text | C7 alternatives, `/app`, `/how-ai-works` | App Store |
| Most aware / pre-visit | "what to bring to gastroenterologist", "share symptom diary with doctor" | Checklist + Doctor Report demo | C8 posts + `/resources/gastroenterologist-appointment-prep` | App Store (Doctor Report) |

**Copy rules from the voice-of-customer data** (`research/pain-points-voc.md` §4): "poop" in H1s and "stool" or "bowel movement" in the body. Use "flare", "trigger foods", "bloated", "get regular". Reassure before facts. Every symptom page has a red-flag box. Answer "how long after eating" explicitly. Never promise a diagnosis.

## 4. Site architecture

```
/                               brand + category ("gut health app: food, poop & symptom tracking")
/app                            plain-text facts page for AI retrieval (price, platforms, features, data, limits)
/how-ai-works                   inputs, outputs, limits, OpenAI processing, advisor role
/poop-tracker                   product: bowel/Bristol tracking            ← C1, C5, C6
/food-symptom-tracker           product: meals + symptoms timeline         ← C2, C4, C6
/ibs-tracker                    product: IBS logging alongside care        ← C3
/resources/bristol-stool-chart  (+ -pdf)  tool + printable                 ← C1
/resources/food-symptom-diary   guide + printable                          ← C2
/resources/ibs-food-diary       guide + printable + worked week            ← C3
/resources/bloating-after-eating hub                                       ← C4
/resources/constipation-diary   guide + printable                          ← C5
/resources/food-diary-for-diarrhea guide + printable (validate demand)     ← C6
/resources/gastroenterologist-appointment-prep checklist                   ← C8
/gut-health-app-comparison      hub (after hands-on tests)                 ← C7
/blog/<slug>                    80 articles in 8 clusters (blogs/<cluster>/)
```

Linking rules: every blog links up to its pillar in the first 30% of the post and to its product page from the "how to track" section, plus 2–4 siblings. Pillars link to every child. Product pages link to their pillar plus their top 3 posts. Red-flag hub: `/blog/when-to-see-doctor-bowel-changes`.

## 5. Content plan: 8 clusters × 10 articles

Full list with keywords, volumes, KD, feasibility and evidence: `keywords/blog-topic-plan.csv`. Drafts: `blogs/<cluster>/`. Each cluster's `_CLUSTER.md` gives publish order and reviewer questions.

| Cluster | Folder | Pillar | Best first 3 (by opportunity score) |
|---|---|---|---|
| C1 Stool & Bristol | `stool-bristol/` | bristol-stool-chart | how-to-track-bowel-movements · bristol-stool-chart-pdf (1,300/KD 40) · how-long-does-it-take-food-to-become-poop |
| C2 Food–symptom diary | `food-symptom-diary/` | food-symptom-diary | food-symptom-diary-example · food-diary-for-food-intolerance (720/36) · food-symptom-patterns |
| C3 IBS | `ibs/` | ibs-food-diary (2,400/25) | ibs-flare-up-tracking · ibs-c-vs-ibs-d · low-fodmap-reintroduction-tracking |
| C4 Bloating & gas | `bloating-gas/` | bloating-after-eating | can-coffee-cause-bloating (2,400/17) · fiber-bloating · gluten-bloating |
| C5 Constipation | `constipation/` | constipation-diary | cheese-and-constipation (5,400/33) · can-constipation-cause-back-pain (12,100/17) · can-constipation-cause-nausea (8,100/20) |
| C6 Diarrhea & urgency | `diarrhea/` | food-diary-for-diarrhea (9,900/37, validate) | diarrhea-after-eating · urgent-bowel-movement-morning · stress-diarrhea (3,600/43) |
| C7 Apps, AI & comparisons | `apps-comparisons/` | gut-health-app-comparison | best-ibs-apps · best-food-symptom-tracker-apps · mysymptoms-alternatives |
| C8 Doctor prep | `doctor-prep/` | gastroenterologist-appointment-prep | when-to-see-doctor-bowel-changes (red-flag hub) · gastroenterologist-wait-time · questions-to-ask-gastroenterologist |

**Release cadence:** Ship one cluster's pillar plus its top 3 posts before starting the next cluster. That builds topical depth faster than spreading thin. Order: C1 → C2 → C3 → C5 → C4 → C6 → C8 → C7. C7 goes last because it needs hands-on test notes. Throughput is capped by medical review, not by writing. All 80 drafts exist, so the bottleneck is the reviewer's hours per week.

**Every article is gated:** `review_status: draft-needs-medical-review` renders noindex and stays out of the sitemap until a named, qualified reviewer approves it (`blogs/_EDITORIAL_STANDARD.md` §8). The clinical advisor (Michael Schopis, MD) is the obvious candidate, but only if he actually reviews the text.

## 6. Technical and on-page fixes (in order)

Spec with code and acceptance tests: `codex/01-technical-seo-tasks.md`.

1. **T10:** render the H1 and above-the-fold content visible in server HTML (fixes the blank no-JS viewport and LCP 22 s).
2. **T1:** canonical www. Apex→www as 308. Set `metadataBase` to www.
3. **T3 + T2:** `robots.ts` (search and answer bots explicitly allowed; training bots are an owner decision, default allow) and a sitemap built from the content registry with real dates. No future dates.
4. **T4:** self-canonical plus per-route title, description and OG. New homepage title direction: "Gut Health App for Food, Poop & Symptom Tracking | Get Regular" (owner approves wording).
5. **T14:** one `AppStoreLink` component with a storefront-neutral URL, `pt`/`ct` campaign tokens per page, and one `app_store_click` event.
6. **T11–T13:** lazy facades for the 6 TikTok players and the YouTube embed, `next/image` for the 875 KB and 743 KB PNGs, deferred PostHog.
7. **T15 (owner + reviewer):** remove or source the homepage claims.
8. **T6 + T7:** MDX blog registry with reviewer fields, plus an Organization, WebSite and MobileApplication JSON-LD graph (no invented ratings or prices).
9. Then the new pages (`codex/02-content-import-and-pages.md`, copy in `onpage/`).

## 7. GEO / AEO plan (being cited and recommended by AI)

Detail: `geo/geo-aeo-strategy.md`.

1. **Own the facts.** Build `/app` and `/how-ai-works` with plain-text price, platforms, features, data handling and limits. Use the same 40- and 120-word entity description everywhere (fact sheet §11).
2. **App Store listing = #1 retrieved source.** Rewrite the description to state manual Bristol entry, Doctor Report PDF, period tracking, Gut Check and pricing. Grow ratings with Apple's `SKStoreReviewController` at a value moment (e.g., after the first Weekly Digest or Doctor Report). Never gate requests on sentiment.
3. **Get into the sources AI already reads.** Pitch the roundups in `research/roundup-and-citation-targets.csv`: Healthline, MyGoodGut (updated 25 Sep 2026), Gutivate, Healthify, AlternativeTo, plus app listicles. Give them review access, the facts page and screenshots. Never pay for placement.
4. **Publish citable formats.** Answer-first sections, definitions, tables, worked logs and dated "last reviewed" lines. Write fair comparisons that admit where competitors are better.
5. **YouTube is open ground.** No independent gut or poop app review videos were found. Turn each pillar into a 3–6 min explainer with a transcript on the page. Turn TikTok slideshows into indexed pages (search-led concepts from the existing TikTok work).
6. **Reddit:** only disclosed founder or team participation where the subreddit allows it. Answer recurring questions and link only when the rules permit. Research protocol in §10.
7. **Measure monthly:** run `geo/ai-prompt-panel.csv` (47 prompts) across ChatGPT, Perplexity, Google AI Overviews/AI Mode, Gemini, Copilot and Claude. Score mention, recommendation, citation and **accuracy**. Pair it with GSC generative-AI impressions and Bing AI citations.

## 8. Off-page (earned, not bought)

- **Linkable assets:** the printable diaries, the Bristol chart PDF and tool, and the GI appointment checklist. Offer these to IBS charities, dietitian blogs and patient forums as free resources.
- **Product kit:** current screenshots, the facts page, founder bio (Athina Vandame, to be confirmed), advisor bio, pricing.
- **Directories:** AlternativeTo, Product Hunt, Crunchbase and LinkedIn company page, with consistent entity copy. Hold Wikidata until independent coverage exists.
- **Rejected:** paid links (LinkDR and similar), PBNs, link exchanges, fake reviews. See `research/seo-skills-review.md`.

## 9. Measurement and 90-day targets

| Layer | Metric | Tool | Day-90 target (directional, not a forecast) |
|---|---|---|---|
| Eligibility | Indexed priority URLs, CWV, crawl errors | GSC, Bing WMT, `scripts/seo_check.py` | All pillars and published posts indexed. Mobile LCP < 2.5 s (lab) |
| Search | Non-brand impressions and clicks by cluster | GSC | Impressions on ≥ 30 non-brand queries per published cluster |
| AI | Mention, citation and accuracy on the 47-prompt panel | Manual panel + GSC/Bing AI reports | Named in ≥ 3 prompts, 0 factual errors |
| Store | `app_store_click` by page and CTA. Downloads by `ct=` | PostHog, App Store Connect | Baseline established per page |
| Product | First meaningful log within 72 h, D7 logging, trial→paid | PostHog, RevenueCat | Separate cohort per campaign token |

Targets are deliberately modest. There is no baseline, and a new health domain usually needs 3–6 months before rankings stabilize. Judge clusters on store clicks and activation, not traffic.

## 10. Reddit research protocol (blocked in our environment, so run it manually)

Reddit returns 403 to our crawler and is excluded from our search tool. Run these searches in a browser. Copy recurring questions into `research/question-bank.csv` (`source_type=reddit`) and pain points into `pain-points-voc.md`:

- `site:reddit.com/r/IBS food diary app`
- `site:reddit.com/r/IBS "how long after eating"`
- `site:reddit.com/r/ibs bowelle OR mysymptoms OR "cara care"`
- `site:reddit.com/r/Constipation "regular" routine`
- `site:reddit.com/r/guthealth bloated every day`
- `site:reddit.com/r/FODMAPS reintroduction tracking`
- `site:reddit.com/r/SIBO OR r/IBS gastroenterologist appointment what to bring`
- `site:reddit.com/r/Zepbound OR r/Mounjaro OR r/Semaglutide diarrhea OR constipation`
- `site:reddit.com poop tracker app`

Use the threads to sharpen H2s and FAQs in the drafts. Don't quote usernames.

## 11. Decisions needed from the team (blocking)

1. **Medical reviewer.** Who, how many hours a week, and do they consent to a named byline and `reviewedBy` markup?
2. **Claims.** Remove or source "Clinically Validated", "$3,000+", "3 years", "40%" and "thousands of users".
3. **Privacy mismatch.** The App Store label says Precise Location; the policy is silent on it. Fix one of them.
4. **Feature facts.** What does the Apple Health integration read or write? Is there a CSV export, and a "no bowel movement today" log? What is the current trial? (Fact sheet §12 lists 16 questions.)
5. **Access.** Codex needs the repo (`avandame/getregular-landing`), and we need GSC (domain property verified), Bing WMT and App Store Connect campaign links.
6. **Training crawlers.** Default is allow (GPTBot, ClaudeBot, Google-Extended, CCBot). This is a business decision; see `codex/01` T3.
