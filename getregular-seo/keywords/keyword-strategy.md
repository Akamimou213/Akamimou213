# Get Regular — Keyword Strategy & Topic Clusters (US, English)

**Prepared:** 19 October 2026 · **Domain:** getregular.com (Semrush AS 7, 3 ranking keywords) · **Goal:** pick keywords and clusters we can rank for in 3–9 months that lead to iPhone installs, then pick 10 blog topics per cluster.

**Companion files (same folder)**
- `keyword-universe.csv`: 1,599 keywords with cluster, source, volume/KD or demand tier, intent, feasibility, priority and target URL.
- `blog-topic-plan.csv`: 80 blog topics (8 clusters × 10), each with opportunity score, score factors, feasibility evidence, app tie-in, pillar link, YMYL note and merge notes.

**URL conventions:** blog posts at `/blog/<slug>`; tools, guides and printables at `/resources/<slug>`; product and pillar pages at the root (`/poop-tracker`, `/food-symptom-tracker`, `/ibs-tracker`, `/science`, `/privacy`, `/gut-health-app-comparison`). These replace the `/features/`, `/guides/`, `/tools/` and `/learn/` paths in the 6 Oct execution plan.

---

## 1. Method

| Step | What was done | Output |
|---|---|---|
| 1. Workbook baseline | Read all 662 terms in `master_keywords.csv` (US volume, KD, intent, competitor positions), plus the shortlist, clusters, SERPs (4 Semrush US snapshots), competitor keywords, gap sample and the 6 Oct execution plan. Semrush was **not** queried (API units = 0). | Measured volume/KD for 461 demand-report terms |
| 2. Autocomplete expansion | 48 seeds × (seed + a–z + 8 question prefixes) = **1,680 Google autocomplete queries** (`hl=en&gl=us`, 0.3 s throttle). This returned **9,658 unique suggestions**. Noise was filtered out: pets, babies/kids, India locations, non-English, non-GI conditions and single-hit long tail. **937 suggestions were kept.** | Raw: `scratchpad/kw/autocomplete_raw.jsonl`; aggregated: `scratchpad/kw/autocomplete_agg.csv` |
| 3. Live SERP checks | **82 live US web-search SERPs** checked for candidate topics, plus the 4 Semrush SERPs in the workbook. For each one, the ranking domains were recorded and classified (see Appendix A). | Feasibility H / M-H / M / L-M / L with one line of evidence per topic |
| 4. Clustering & dedupe | Each keyword was assigned to one of 8 clusters by intent. Topics whose SERPs overlap were merged, and every keyword has exactly one owner URL. | `keyword-universe.csv`, `blog-topic-plan.csv` |
| 5. Scoring | Topics and keywords were scored with the opportunity model in §2, then ordered by score within each cluster. | `opportunity_score`, `score_factors` columns |

**Honesty rules applied**
- Autocomplete has no volumes. Those keywords are marked `unmeasured (autocomplete-validated)` and given a **demand tier**: High = surfaced in ≥8 prefix queries, or rank 1 in ≥4; Med = ≥3 queries, or rank ≤3 in ≥2; Low = everything else. The reason (hit count, best rank) is stored in the `notes` column. No numbers were invented.
- Where a topic's exact SERP was not checked, the evidence column says "Not live-checked" and names the adjacent SERP or KD it was inferred from.
- Volumes are Semrush modelled US monthly searches from the 6 Oct workbook. Do not add up variant volumes.

---

## 2. Opportunity scoring model

**Opportunity (0–100) = Σ(weight × factor) ÷ 5 × 100.** Each factor is scored 1–5.

| Factor | Weight | 5 | 3 | 1 |
|---|---|---|---|---|
| **D** Demand | 20% | ≥5,000/mo | 200–999/mo, or autocomplete Med | <50/mo or analyst-only (autocomplete High = 4, Low = 2) |
| **R** Rankability (SERP weakness + KD) | 25% | **H**: top 10 has forums, apps, Etsy/Amazon, PDFs, small blogs, AI-content farms (Ubie/Doctronic), patents | **M**: mixed. Some Cleveland/Healthline, but clinic blogs or startups also rank | **L**: all Mayo/Cleveland/NHS/Healthline/WebMD (M-H = 4, L-M = 2) |
| **I** Intent fit to tracking/app | 20% | tracker / diary / log / chart / template / app | specific food or symptom question where logging is the natural next step = 4; general explainer = 3 | care/diagnosis |
| **C** Conversion proximity | 15% | BOFU (app choice) | TOFU with a strong tracking angle | generic TOFU = 2 |
| **E** Evidence advantage | 10% | we can show a real app log or demo that answers the query | worked example / printable = 4 | generic text = 2 |
| **Y** YMYL risk (inverted) | 10% | low risk | medium | high (red flags, medication, diagnosis) |

**Feature gate (−8):** a topic whose app tie-in depends on an **unverified capability** gets 8 points off its score. The capabilities are: export/share, Apple Health sync, stress/cycle context fields, heartburn symptom and pricing. Do not publish these until product QA confirms the feature exists. There are 9 such topics, marked `gate-8` in `score_factors`.

**Keyword priorities in the universe**
- **P1**: primary keyword of a planned topic with score ≥70, or a keyword owned by a product page or first-wave pillar.
- **P2**: secondary keyword of a planned topic, or a backlog candidate. A backlog candidate has volume ≥200 and KD ≤40, or autocomplete tier High.
- **P3**: in scope but long tail, or a long-term head term.
- **Hold**: care, medication, test, pregnancy or red-flag intent.
- **Exclude**: out of scope.

---

## 3. Cluster overview (8 clusters)

We kept 8 clusters. **FODMAP sits inside C3 (IBS)**: the workbook puts FODMAP on "Hold" for product fit, so it is framed only as logging reintroduction challenges. **Doctor prep (C8) stays a separate cluster** rather than being merged. Its SERPs are the weakest in the set (local clinics, 2017 Healio, Q&A sites), and the output of tracking — a log you bring to a visit — is the product's clearest job. Demand is smaller, so treat it as a conversion and E-E-A-T cluster, not a traffic cluster.

| # | Cluster | Pillar (MOFU resource) | Product page (BOFU) | Representative demand | Ranking reality (3–9 mo) |
|---|---|---|---|---|---|
| C1 | Stool & Bristol tracking (types, colors, frequency, normal) | `/resources/bristol-stool-chart` | `/poop-tracker` | bristol stool chart 74,000 / KD 68 (long-term); bristol stool chart pdf 1,300 / 40; how often should you poop 18,100 / 43; poop tracker app 590 / 33 | Type-specific, printable and "how to track" queries are winnable now. The head term is a 12+ month target. |
| C2 | Food–symptom diary & food triggers / intolerance | `/resources/food-symptom-diary` (printable) | `/food-symptom-tracker` | food diary for food intolerance 720 / 36; food diary template 880 / 33; food and symptom diary 70 / 14 | SERPs are full of PDFs, Amazon journals and test-kit sellers. This is the best fit for an evidence-led diary page. |
| C3 | IBS tracking & IBS food diary (incl. low-FODMAP logging) | `/resources/ibs-food-diary` (printable + worked example) | `/ibs-tracker` | irritable bowel syndrome food diary 2,400 / 25; ibs food diary 1,000 / 27; ibs symptoms foods to avoid 2,900 / 30; "apps for tracking ibs" (strongest autocomplete hit) | The diary SERP is PDFs plus Bowelle at #5–7. Flare, subtype and reintroduction SERPs are app sites and Etsy. |
| C4 | Bloating & gas | `/resources/bloating-after-eating` (hub + bloating diary section) | `/food-symptom-tracker` | why am i so bloated 8,100 / 36; can coffee cause bloating 2,400 / 17; bloating after eating 8,100 / 74 (long-term) | Food-specific bloat questions (coffee, gluten, dairy, fiber, salad) are dominated by brand blogs and Ubie. |
| C5 | Constipation & regularity | `/resources/constipation-diary` | `/poop-tracker` | can constipation cause back pain 12,100 / 17; do bananas cause constipation 12,100 / 29; can constipation cause nausea 8,100 / 20; does cheese cause constipation 5,400 / 33 | The best measured-volume / low-KD quick wins in the dataset. Balloon already ranks in this cluster. |
| C6 | Diarrhea & urgency | `/resources/food-diary-for-diarrhea` | `/poop-tracker` + `/food-symptom-tracker` | food diary for diarrhea 9,900 / 37 (validate); can stress cause loose bowel movements 3,600 / 43; "diarrhea after eating …" has 300+ autocomplete variants | Very weak SERPs: Ubie, patents, telehealth blogs. YMYL needs care. |
| C7 | Gut health apps, AI & comparisons (BOFU) | `/gut-health-app-comparison` | `/` (homepage), `/science`, `/privacy` | gut health app 70 / 39; poop tracker app 590 / 33; apps for ibs 140 / 34 | "Best X app" SERPs are vendor self-rankings plus a 2020 Healthline roundup. A tested, disclosed comparison can compete. |
| C8 | Doctor / dietitian visit prep & sharing logs | `/resources/gastroenterologist-appointment-prep` | `/poop-tracker`, `/food-symptom-tracker` (export, once verified) | symptom diary 90 / 28; "how long does it take to get an appointment with a gastroenterologist" (autocomplete, 14 queries) | Local clinics and Q&A sites rank. Low volume, high trust value. |

---

## 4. Pillar / product page map

Blogs link **up** to their pillar in the first 30% of the post, and to the product page from the tracking section. Pillars link down to every child post. Product pages link to the pillar plus the 2–3 posts with the highest conversion.

| URL | Type | Owns (primary + key variants) | Children |
|---|---|---|---|
| `/` | Product (brand) | gut health app, gut health tracker (app), get regular, digestive health app | C7 posts |
| `/poop-tracker` | Product | poop tracker app, poop tracker, poop app, bowel movement tracker (app), stool tracker, bristol stool chart app, constipation tracker app | C1, C5, C6 posts |
| `/food-symptom-tracker` | Product | food and symptom tracker (app), food symptom tracker app, food sensitivity tracker, food trigger tracker, bloating tracker/app | C2, C4, C6 posts |
| `/ibs-tracker` | Product (new, P2) | ibs tracker, ibs tracker app, ibs symptom tracker, ibs food diary app | C3 posts |
| `/science` | Trust / method | gut health ai, ai gut health app (methodology), gut health score method | gut-health-score-explained, ai-gut-health-apps |
| `/privacy` | Trust | gut health app privacy facts | gut-health-app-privacy, poop-photo-analysis |
| `/gut-health-app-comparison` | Comparison hub (P3, after testing) | best gut health app(s), apps for gut health | best-poop-tracker-apps, best-ibs-apps, best-food-symptom-tracker-apps, free-gut-health-apps, mysymptoms-alternatives |
| `/resources/bristol-stool-chart` | Tool / reference | bristol stool chart, bristol stool scale, poop chart, types of poop, stool types, bowel movement chart | C1 posts; `/resources/bristol-stool-chart-pdf` |
| `/resources/food-symptom-diary` | Guide + printable | food and symptom diary (+pdf/template), food diary template, food diary pdf, symptom diary template | C2 posts |
| `/resources/ibs-food-diary` | Guide + printable + worked example | irritable bowel syndrome food diary, ibs food diary, how to keep a food diary for ibs, ibs food diary template/pdf, ibs symptom tracker printable | C3 posts |
| `/resources/bloating-after-eating` | Hub | bloating after eating, bloated after eating, why do i bloat after eating, feeling bloated after eating (+ bloating diary) | C4 posts |
| `/resources/constipation-diary` | Guide + printable | constipation diary/tracker, bowel diary, food diary for constipation | C5 posts |
| `/resources/food-diary-for-diarrhea` | Guide + printable (**validate first**) | food diary for diarrhea (9,900 / 37), diarrhea diary | C6 posts |
| `/resources/gastroenterologist-appointment-prep` | Guide + checklist | how to prepare for a gastroenterologist appointment, what to expect at a gastroenterologist appointment | C8 posts |

**Build order (pillars and products):** `/poop-tracker`, `/food-symptom-tracker`, `/resources/ibs-food-diary`, `/resources/food-symptom-diary`, then `/resources/bristol-stool-chart` with its PDF, `/resources/constipation-diary`, `/resources/bloating-after-eating`, `/resources/food-diary-for-diarrhea` (after validating intent), `/resources/gastroenterologist-appointment-prep`, `/ibs-tracker`, and `/gut-health-app-comparison` (only after hands-on tests).

---

## 5. Head terms vs long tail

| Tier | Examples | Plan |
|---|---|---|
| **Long-term head terms (12+ months, not a 3–9 month KPI)** | bristol stool chart 74,000 / 68; poop chart 33,100 / 59; types of poop 9,900 / 50; bloating after eating 8,100 / 74; constipation 135,000 / 83; gut health 33,100 / 73 | Give each one a single canonical pillar. Build internal links from 10 children and earn links with the printable/tool. Track impressions, not rank. |
| **Mid-tail with measured demand and low KD (primary 3–9 month targets)** | can constipation cause back pain 12,100 / 17; can constipation cause nausea 8,100 / 20; do bananas cause constipation 12,100 / 29; does cheese cause constipation 5,400 / 33; can coffee cause bloating 2,400 / 17; does creatine make you bloated 5,400 / 26; irritable bowel syndrome food diary 2,400 / 25; bristol stool chart type 4 390 / 23; bowel movements with white mucus 8,100 / 7 (YMYL) | These are the core of the first 60 posts. Each gets one page with a natural tracking angle. |
| **Autocomplete-validated long tail on weak SERPs (fastest wins, unmeasured volume)** | diarrhea after eating; urgent bowel movement in the morning; is bloating a sign of gluten/dairy intolerance; does fiber cause bloating; ibs flare up; how to track bowel movements; GLP-1 diarrhea | Publish early. Their SERPs are app sites, Etsy/Amazon, Ubie/Doctronic AI pages, telehealth blogs and patents. Verify demand in GSC within 8 weeks. |
| **BOFU (small volume, highest conversion)** | poop tracker app 590 / 33; apps for ibs 140 / 34; food symptom tracker app 70 / 28; best poop tracker app; mysymptoms alternative | Product pages first. Comparisons only after documented hands-on tests with ownership disclosed. The App Store still takes the top 3 for "app" queries, so pair this work with ASO. |

---

## 6. Cannibalization rules

1. **One URL per intent.** Each keyword in `keyword-universe.csv` has one `target_url`. A new page cannot target a keyword already owned elsewhere without re-mapping it in the universe first.
2. **App vs best-of vs how-to.** The singular app query ("poop tracker app") belongs to the product page. Plural or "best" ("best poop tracker apps") belongs to the comparison post. "How to track…" belongs to the blog guide.
3. **Template vs example vs guide.** Template/PDF/printable intent belongs to the `/resources/` pillar. "Example" belongs to a blog post with a filled-in week. Condition-specific diaries (IBS, diarrhea, constipation, intolerance, reflux, allergy) are separate only where the SERP differs; that was checked live for IBS, diarrhea, intolerance, reflux and allergy.
4. **Same food, different symptom = different page; same symptom, different wording = one page.** Coffee has two pages: bloating (C4) and poop/diarrhea (C6). Dairy has three: bloating (C4), diarrhea (C6) and constipation (inside cheese, C5).
5. **Bristol types.** The tool owns the chart terms. Type 3–4 ("healthy"), 5–7 (loose) and 1–2 (hard) each get one post. There is no separate post per type number.
6. **Stress.** There are three stress pages, each with a different symptom SERP: IBS flare (C3), constipation (C5) and loose stools (C6). They must cross-link and must not drift into general stress advice.

**Merges made (recorded in `merge_note`)**
- `how-often-should-you-poop` absorbs "is it normal to poop 3 times a day", "frequent bowel movements" and "how many bowel movements a day is normal".
- `havent-pooped-in-days` absorbs the 2, 3, 4, 5 and 7-day variants and "no bowel movement in 7 days but passing gas".
- `why-am-i-so-bloated` absorbs "always bloated", "look pregnant" and "bloated all the time".
- `diarrhea-after-eating` absorbs "sudden urge to poop after eating" and "why do I poop right after I eat".
- `coffee-poop` absorbs "diarrhea after drinking coffee". GoodRx ranks one page for both.
- `how-to-identify-food-triggers` absorbs "how long to keep a food diary".
- "Bloating diary template" folds into `/resources/food-symptom-diary` and `/resources/bloating-after-eating`.
- "IBS symptom tracker printable" and "how to keep a food diary for IBS" fold into `/resources/ibs-food-diary`.
- "What to expect at a gastroenterologist appointment" folds into the C8 pillar.
- Food-specific "diarrhea after eating [restaurant/food]" tails are covered as sections or FAQs, not separate pages.

---

## 7. Top 30 quick wins

These are topics with live SERP feasibility of H or M-H, sorted by opportunity score. Scores include the feature-gate penalty.

| # | Cl. | URL | Primary keyword | Volume / tier | KD | Feas. | Score |
|---|---|---|---|---|---|---|---|
| 1 | C1 | `/blog/how-to-track-bowel-movements` | how to track bowel movements | autocomplete Med (15 queries) | n/a | H | 93 |
| 2 | C2 | `/blog/food-symptom-diary-example` | food and symptom diary example | autocomplete Med | n/a | H | 89 |
| 3 | C3 | `/blog/ibs-flare-up-tracking` | ibs flare up | autocomplete Med-High | n/a | H | 89 |
| 4 | C6 | `/blog/diarrhea-after-eating` | diarrhea after eating | autocomplete High | n/a | H | 89 |
| 5 | C1 | `/resources/bristol-stool-chart-pdf` | bristol stool chart pdf | 1,300 | 40 | H | 88 |
| 6 | C5 | `/blog/cheese-and-constipation` | does cheese cause constipation | 5,400 | 33 | H | 88 |
| 7 | C7 | `/blog/best-ibs-apps` | best ibs app / apps for tracking ibs | autocomplete (22 queries); apps for ibs 140 | 34–37 | H | 88 |
| 8 | C7 | `/blog/best-food-symptom-tracker-apps` | best food symptom tracker app | autocomplete Low-Med | 27 (rel.) | H | 88 |
| 9 | C2 | `/blog/food-diary-for-food-intolerance` | food diary for food intolerance | 720 | 36 | H | 87 |
| 10 | C4 | `/blog/can-coffee-cause-bloating` | can coffee cause bloating | 2,400 | 17 | H | 86 |
| 11 | C5 | `/blog/regular-poop-schedule` | how to get on a regular poop schedule | autocomplete Med | n/a | H | 85 |
| 12 | C8 | `/blog/gastroenterologist-wait-time` | how long does it take to get an appointment with a gastroenterologist | autocomplete High | n/a | H | 85 |
| 13 | C2 | `/blog/food-symptom-patterns` | food and symptom correlation | analyst, Low | n/a | H | 84 |
| 14 | C2 | `/blog/photo-food-diary` | photo food diary | analyst, Low | n/a | H | 84 |
| 15 | C4 | `/blog/fiber-bloating` | does fiber cause bloating | autocomplete High | n/a | H | 84 |
| 16 | C7 | `/blog/gut-health-score-explained` | gut health score | 20 (+ autocomplete 18 queries) | n/a | H | 84 |
| 17 | C7 | `/blog/ai-gut-health-apps` | ai gut health app | 20 | n/a | H | 84 |
| 18 | C2 | `/blog/how-to-identify-food-triggers` | how to identify food triggers | 20 + autocomplete | n/a | H | 83 |
| 19 | C1 | `/blog/how-long-does-it-take-food-to-become-poop` | how long does it take food to turn into poop | autocomplete Med | n/a | H | 82 |
| 20 | C4 | `/blog/gluten-bloating` | is bloating a sign of gluten intolerance | autocomplete High | n/a | H | 82 |
| 21 | C4 | `/blog/bloated-at-night` | why am i bloated every night | SERP-checked, Med | n/a | H | 82 |
| 22 | C6 | `/blog/urgent-bowel-movement-morning` | urgent bowel movement first thing in the morning | autocomplete High | n/a | H | 82 |
| 23 | C7 | `/blog/mysymptoms-alternatives` | mysymptoms alternative | SERP-checked, Low | n/a | H | 82 |
| 24 | C2 | `/blog/delayed-food-intolerance-symptoms` | how long after eating do food intolerance symptoms start | SERP-validated, Med | n/a | H | 80 |
| 25 | C3 | `/blog/ibs-c-vs-ibs-d` | ibs-c vs ibs-d | autocomplete Med | n/a | M-H | 80 |
| 26 | C4 | `/blog/bloated-after-salad` | bloated after eating salad | autocomplete Med | n/a | H | 80 |
| 27 | C5 | `/blog/can-constipation-cause-nausea` | can constipation cause nausea | 8,100 | 20 | H | 80 |
| 28 | C2 | `/blog/elimination-diet-tracking` | elimination diet tracker | 30 | 46 | H | 79 |
| 29 | C3 | `/blog/low-fodmap-reintroduction-tracking` | low fodmap reintroduction tracker | autocomplete Low-Med | 34 (rel.) | H | 79 |
| 30 | C4 | `/blog/creatine-bloating` | does creatine make you bloated | 5,400 | 26 | H | 79 |

Just outside the top 30 are four measured high-volume, low-KD constipation and IBS posts:
- `/blog/can-constipation-cause-back-pain`: 12,100 / KD 17, M-H, score 79.
- `/blog/bananas-and-constipation`: 12,100 / KD 29, M, score 78.
- `/blog/can-stress-cause-constipation`: 5,400 / KD 33, gated, score 67.
- `/blog/ibs-trigger-foods`: 2,900 / KD 30, score 70.

Schedule these in the first wave too. Their traffic ceiling is higher than many unmeasured quick wins.

**Suggested first 90 days**
1. **Weeks 1–4:** build the 2 product pages and the IBS diary pillar. Publish these posts:
   - how-to-track-bowel-movements
   - bristol-stool-chart-pdf
   - food-symptom-diary-example
   - can-coffee-cause-bloating
   - cheese-and-constipation
   - can-constipation-cause-back-pain
2. **Weeks 5–8:** build the food-symptom-diary pillar and publish:
   - diarrhea-after-eating
   - ibs-flare-up-tracking
   - food-diary-for-food-intolerance
   - gluten-bloating
   - fiber-bloating
   - bananas-and-constipation
   - can-constipation-cause-nausea
   - urgent-bowel-movement-morning
3. **Weeks 9–13:** build the Bristol tool, then publish the remaining quick wins and the first comparison (best-ibs-apps), once the apps have been tested.

---

## 8. YMYL & product guardrails

- Every post in C1, C5 and C6 links to `/blog/when-to-see-doctor-bowel-changes` and lists red flags above the fold: blood, black or pale stool, fever, weight loss, vomiting with no gas, symptoms over 2 weeks, nocturnal diarrhea, new symptoms after 50.
- Posts with YMYL = High need a named clinician reviewer before publishing:
  - mucus-in-stool
  - poop-color-chart
  - havent-pooped-in-days
  - why-am-i-so-bloated
  - bloating-after-eating-very-little
  - constipation-then-diarrhea
  - yellow-diarrhea
  - glp1-diarrhea-tracking
  - can-ibs-start-suddenly
  - how-is-ibs-diagnosed
  - food-allergy-diary
  - when-to-see-doctor-bowel-changes
- **Product claims to verify before publishing:**
  - export / PDF share
  - Apple Health (HealthKit) sync
  - stress, sleep and menstrual-cycle context fields
  - heartburn/reflux as a symptom
  - pricing and trial
  - whether stool entry is manual Bristol or photo-based (the App Store listing says manual)
- Never imply that the app diagnoses IBS or intolerance, or provides a FODMAP database. AI insights are "possible patterns".

---

## 9. Limits

- Volumes and KD come from one Semrush snapshot (6 Oct 2026). The 9,900/mo "food diary for diarrhea" estimate is still flagged "validate first".
- Autocomplete tiers are relative popularity signals within each seed, not volumes.
- Live SERP checks are a single, non-personalized US web-search snapshot. Rankings move, and Ubie/Doctronic AI pages are volatile.
- 8 of the 80 topics are marked "Not live-checked". About 10 more rely on a closely related sibling SERP (for example, type 6 standing in for type 4, or the bread SERP standing in for gluten). The evidence column names the source in every case.

---

## Appendix A — Live SERP evidence (82 checks, 19 Oct 2026)

Feasibility key: **H** = weak SERP (apps, forums, Etsy/Amazon, PDFs, small blogs, AI-content pages, patents); **M** = mixed; **L** = authority-only.

| Query | Who ranks (top ~9) | Feas. |
|---|---|---|
| how to track bowel movements | LiveScience (2014), CareClinic, App Store ×4, WebMD, Plop, Play | H |
| poop tracker app | Play ×3, LiveScience, App Store ×2, poop-tracker.com, Balloon listicle | M (stores) |
| bowel movement chart printable / poop tracker printable free | Etsy, InkPx ×3, Bladder&Bowel UK, NHSGGC, TemplateRoller, community PDFs, DocHub, Pinterest | H |
| bristol stool chart app | Play, GitHub, App Store, CareClinic, LiveScience, Digbi, bristolstoolchart.net, Plop | H |
| bristol stool chart type 6 meaning | CDHF, Wikipedia, Cleveland, Ubie, GoodRx, YouTube, Healthline, Stanford, Manhattan Gastro | M |
| floating poop meaning | Ubie ×2, UnityPoint, Throne, Yahoo, GI Center TX, Wikipedia, Exact Sciences, WebMD | M-H |
| is it normal to poop 3 times a day | HealthPartners, Throne, ZOE, MedicineNet, GoodRx, HealthCentral, BuzzRx, small GI blog, Healthline | M |
| mucus in stool after eating | TheHealthy, MNT, Cara Care, HealthCentral, respiratory-therapy site, DigestiveHealthHub, GI blog, WebMD, Healthline | M |
| why does my poop smell so bad all of a sudden | Ubie ×4, MD Anderson, Healthline, DigestiveHealthHub, Acibadem, AOL | M-H |
| poop color after eating beets | Cleveland, LiveScience, Yahoo, Wikipedia, Healthline | L-M |
| yellow poop meaning | Narayana, Healthgrades, Ubie, ZOE, Guts UK, dog site, Wikipedia, Biomel, Ayurveda | M |
| why is my poop green | Cleveland, GoodRx, Ubie, Baptist, Northwestern, pediatric clinic, UnityPoint, Manhattan Gastro, Healthline | L-M |
| how long does it take food to turn into poop | Ubie, Greatist, Michigan Gastro, kids blog, Bonny, United Digestive, trial PDF, hospital FAQ | H |
| sudden urge to poop after eating | Ubie, SingleCare, MNT, LifeMD, United Gastro, Liv Hospital ×2, Healthline, AOL | M-H |
| how to identify food triggers | Greatist, binge-eating clinic, WeightWise, Renee Clerkin, UK intolerance blog, Bala, Triggerbites, Healthline | H |
| food intolerance diary how long | NHS Tayside, Allergy UK PDF, Wikipedia, Allergy Resources, Intolerance Friendly Kitchen ×2, Smartblood ×3 | H |
| food diary for food intolerance | Amazon ×3, Everlywell, Intolerance Friendly Kitchen ×2, DietSleuth, Smartblood, App Store | H |
| delayed food intolerance symptoms how long after eating | Wikipedia + Smartblood ×8 | H |
| food intolerance symptoms | Allergy UK, Cleveland, patent, CHOP, PMC, Mayo, BetterHealth, MD Anderson, NHS | **L** (dropped as a topic) |
| are food intolerance tests worth it | The Gut Experts, Healthline, Cleveland, Northwestern, Roman, spam page, HealthUnlocked ×3 | M-H |
| can you suddenly develop a food intolerance | Ubie, DNA Health, Backfit, Everlywell, Healthpath, CheckMyBody, Smartblood ×3 | H |
| food sensitivity tracker app | App Store, Play, App Store, MakeUseOf, Fig, Gutivate, Triggerbites, InsiderBits, agency blog | H |
| elimination diet tracker | Etsy ×2, Amazon ×3, Wikipedia, Vyla, Triggerbites | H |
| food diary for acid reflux | Amazon ×3, Healthline ×2, Numan, App Store, DietSleuth, Fox | H |
| ai food photo symptom tracker gut | App Store ×3, Play ×2, GitHub, GutHub, GutSync, EatSense | H |
| food diary for diarrhea | IFFGD, Walgreens, FoodChain PDF, WGO PDF, NHS Scotland, Stanford PDF, Amazon, Bowelle (App Store), Healthify, Calm&Happy Gut | H |
| diarrhea immediately after eating | Ubie ×3, USPTO patent, Silver Fern, Mool, Liv Hospital, Healthline ×2 | H |
| diarrhea after drinking coffee | Ubie ×3, GoodRx, JustAnswer, patient.info, spam calculator site, Dripshipper | H |
| why does coffee make me poop | GoodRx, ZOE, Cleveland, Bones Coffee, Ember, MobiDoctor, Substack, Healthline, Fox | M |
| urgent bowel movement first thing in the morning | Ubie, theSkimm, InnerBuddies, Endocare UK, NCBI ×2, nutrition clinic, GutCare app, Aether | H |
| diarrhea after eating fatty foods | Doctronic, MNT, Healthline, Ubie ×2, health-coach blog, Korean clinic, arXiv, Liv Hospital | H |
| diarrhea after drinking alcohol | Vinmec, Cleveland, Monument, Hartford, patents ×2, AU GI clinic, NCBI, detox center | M-H |
| diarrhea after eating dairy how long | Ubie, WebMD, Wikipedia, Healthline, KidsHealth, Merck, Lactaid, JustAnswer, Cleveland | L-M |
| can stress cause loose bowel movements | GoodRx, MNT, Ubie ×3, Nurx, NCBI rat study, hospital, Mool | H |
| constipation then diarrhea | MNT ×2, Dulcolax, WebMD, Harvard, CRUK, AAFP, CV Gastro, Healthline | L-M |
| diarrhea on zepbound/wegovy (food tracking) | Doctronic, Ubie ×2, Noom, MeAgain ×2, Potere, Hers, Fella | H |
| can coffee cause bloating | Happy Pear, MNT, GoodRx, Nue Co, coffee brands ×3, nutrition blog, Substack | H |
| does dairy cause bloating | Ubie, Wikipedia, Dietitians AU, Mayo, Allied Digestive, Fox ×2, Healthline, Substack | M |
| bloated after eating bread | Doctronic, Ubie, bakery blogs ×3, 2016 blog, YorkTest, Cleveland, Healthline | H |
| bloating from fiber supplement | nutri.it.com, NCBI, Parsley, Mayo, patents ×2, ScienceInsights, Frontiers | H |
| why am i bloated every night | Ubie, HUM, JustAnswer, Natren, Mito, MFM, MNT, AOL, Healthline | H |
| bloated after eating salad | Ubie, FeastGood, Verdant, SelfDecode, Nutrition&Vitality, FastFoodClub, NCBI ×2 (off-topic), AOL | H |
| excessive gas after eating | Keck, MNT, GI clinics ×3, Everlywell, Cleveland, BetterHealth, supplement blog | M-H |
| why am i so bloated | MedicineNet, Main Line, United Digestive, Bass Medical, Texas Health, NYGA, OB-GYN clinic, Substack ×2 | M-H |
| how to tell if bloating is from food | ScienceFocus, Ombre, familydoctor.org, Healthdirect, UPMC, Mayo Press, Smartblood, OB-GYN, Substack | M-H |
| does creatine make you bloated | MuscleTech, 1st Phorm, Credihealth, Naked, As-It-Is, Dr Axe, Healthline, Tua Saude | H |
| stomach bloating after eating very little | Ubie ×2, Wikipedia, Cleveland, Mayo, YouTube, NYGA, Roswell Park, NHS | L-M |
| bloating diary template | WGO PDF, A.Vogel, Stanford PDF, Health NZ PDF, NHS PDF, Wikipedia, IBS PDF, Smartblood, PlanWiz, Calm&Happy Gut | H |
| how to keep a food diary for ibs | Gourmend, Acibadem, mySymptoms, Velora, Templacity, DietSleuth, IBS Clinics, GoGo Microbiome, Smartblood | H |
| ibs symptom tracker printable | Etsy ×7, VectorDad, IrritableBowelSyndrome.net | H |
| ibs flare up tracker | App Store ×2, CareClinic, dietitian, FlareCare ×3, GoGo Microbiome, IBSPal | H |
| ibs flare up what to eat | Ubie, Healthgrades, CDHF, CLS Health, Cleveland, Nourish, GI Alliance, CV Gastro, Hudson River GI | M |
| ibs-c vs ibs-d how to tell | Ubie, Functional Gut Clinic, Healthline, Mindset Health, Wikipedia, GI clinics ×2, IncitefulMed, Ayurveda | M-H |
| low fodmap reintroduction tracker | Etsy ×4, Amazon, dietitian PDF, Triggerbites, fodmaptracker.com, Nutrient-metrics | H |
| ibs triggers list stress food | MedicineNet, Ubie ×2, NAFC, IBS.ie, Modify Health, NCBI, Atlantic Health, Cleveland | M |
| ibs vs food intolerance | Ubie, PMC ×2, NextBio, GI Alliance, Intoleran, ScienceDirect, GI Consultants, DietSleuth | M-H |
| does ibs flare up during period | A.Vogel, Dr Brighten, NCBI ×3, WUKA, IBS Clinics, Windsor GI, Healthline | H |
| can ibs appear suddenly later in life | UCLA, Prevention AU, MNT, InnerBuddies, Allied Digestive, IBS Clinics, GAT GI, Quora, NCBI | M |
| best ibs app 2026 | Lin Health, FODMAP blog, Wikipedia ×2, Vyla, Calm Gut, Mouth To Gut, GutTrace, Nutrola | H |
| haven't pooped in 5 days | Ubie ×2, Balloon, Substack, HealthUnlocked ×2, NPR ×2, Healthline | M |
| constipation tracker app | Play, App Store ×2, CareClinic, Play, Outputs, Balloon, Plop, App Store | H |
| constipated after traveling | Ubie, Cleveland, Dulcolax, Cary Gastro, Needham Gastro, Healthline, PubMed, Goodreads, Substack | M |
| does cheese cause constipation | Yahoo, JustAnswer, Cheese Scientist, Johns Hopkins, ClinicalTrials, Health Digest, GutClarity, dairy site, clinic | H |
| how to get on a regular poop schedule | JPost, GoodRx, BuzzFeed, Optimist Daily, Bustle, Substack, AOL ×3 | H |
| constipation after starting fiber | Substack, ClinicalTrials ×2, Mayo News, Step One Foods, GoodRx, Ubie, MNT | H |
| can constipation cause back pain | Cleveland, Oshi, HealthCentral, BuzzRx, spine/chiro clinics ×4, Healthline | M-H |
| do bananas cause constipation | Baptist, MNT, Darwin Nutrition, Healthline, HealthPartners, Leicester Bowel Clinic | M |
| can stress cause constipation | MNT, GoodRx, MiraLAX, MFM, coaching blog, Dulcolax, screening clinic, MH clinic, Healthline | M-H |
| can constipation cause nausea | Doctronic, urgent care, UCF Health, Prime Health, Nourish, JustAnswer ×2, Wikipedia, Windsor GI | H |
| how to prepare for gastroenterologist appointment | Children's Dayton, Acibadem ×2, Unio ×2, Austin Gastro, MyCrohns&Colitis, SIU Med, Liv Hospital | H |
| how long to get an appointment with a gastroenterologist | Unio, WebMD ×2, CareCredit, MagnetHealth ×2, Triborough GI, DDC, Stanford report | H |
| questions to ask gastroenterologist about ibs | Healio 2017, WGO PDF, UMMS, MyCrohns&Colitis, GI center, Healthgrades, aidyhq, HelpForIBS ×2 | H |
| what to tell your doctor about bowel movements | MedStar, HealthPartners, Cedars, Mayo, UCLA, AOL, SC Gastro, TAMU, Harvard | M |
| symptom diary for doctor template | UNSW, Healthify, Data4Life, Houston Methodist, CareClinic, Pinterest, FileIt, Bearable, Endolog | H |
| what to bring to first dietitian appointment for ibs | Nourish ×2, Acibadem, Everyday Nutrition, Fay, Hartwood, Templacity, ReBalanced, DoctorVisitPrep, Rochester Gastro | H |
| food allergy diary | Amazon ×4, Kids With Food Allergies, AllergyForce, Allergy Resources, Friendly Pantry, DOAJ | M-H |
| how to describe abdominal pain to your doctor | Advocate, Providence, Gastro Consultants, ER blog, Curasia ×2, NIH/NICHD, Healthline, RMG Gastro | M |
| best gut health app | Play, Lin Health, Welling, InnerBuddies, GutTrace, Biomeo, Plop, Nutrola, Healthline (2020) | H (vendor lists) |
| gut health score app what does it mean | App Store, Throne help ×2, Play, ZOE, gCode, Plop, NutriScanner, App Store | H |
| mysymptoms alternative app | AppBrain, Triggerbites ×2, AlternativeTo ×5, App Store | H |
| track bowel movements apple health iphone | App Store ×5, CareClinic, Outputs, Balloon, Plop | H |

*(The table shows 81 rows for the 82 checks: the two printable queries share a row. The 4 Semrush SERPs — poop tracker app, ibs food diary, food and symptom diary, gut health app — are in `inputs/workbook/serps.csv`.)*
