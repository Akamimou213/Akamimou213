# Get Regular site architecture: Science · Learn · Tools · Resources

**Prepared:** 20 October 2026. **Market:** US English. **Supersedes** `STRATEGY.md` §4 (URL map) where they conflict. The rest of the strategy stands.
**Model:** ZOE (zoe.com/our-science, /learn, /menoscale), adapted to a startup with **no proprietary studies yet** (teardown notes in §10).

## 0. The idea in one table

Each section does a different job. Together they cover every way people and AI engines find a health brand.

| Section | Captures | SEO job | AEO job (answer boxes, PAA) | GEO job (cited by AI) | Converts via |
|---|---|---|---|---|---|
| **/learn** | Symptom and "is this normal?" questions: the volume | 8 topic hubs × 10 articles, ranking on long-tail questions | Answer-first paragraphs, tables, FAQs | Clinician-reviewed explainers with primary citations | Tool → email → App Store |
| **/tools** | People who want to *do* something: check, compare, print | Bristol chart (74K/mo) and "poop chart" (33K/mo) are the biggest owned-tool terms | Tool pages answer "what type is my poop?" directly | Tools become unique, linkable assets that roundups and AI cite | Result → App Store CPP + optional email |
| **/science** | Trust and "does it work?" questions, plus "what does research say about X" | Evidence topic pages ("fiber and constipation: what studies show") | Direct, dated answers with study tables | **Highest GEO value:** ChatGPT shifted health citations toward primary sources (PubMed #4, Ahrefs Oct 2026). A curated synthesis that links PubMed is the kind of page that gets cited | Credibility for every other page |
| **/resources** | People who want something to keep: printables, templates, a sample report | "bristol stool chart pdf" (1.3K), "food diary template" (880), "food diary pdf" (210) | — | Linkable assets for dietitians, charities and journalists (earned mentions) | Optional email + App Store |

**The big picture (AI visibility):** AI engines recommend brands they can (1) find in sources they already read, (2) describe accurately from official pages, and (3) see cited by others. Learn and Science build (1) and (3). `/app` and `/science/how-our-ai-works` fix (2). Tools and Resources earn the third-party mentions. The App Store listing (`aso/`) carries all of it into "best app" answers.

## 1. URL map

```
/                                   brand + category
/app                                facts page (price, platforms, features, limits) — unchanged

/science                            hub: how Get Regular uses evidence and AI
/science/how-our-ai-works           (moves from /how-ai-works; 301) inputs, outputs, scores, data flow, limits
/science/gut-health-score           method page: what the score summarizes, weights in plain words, limits
/science/clinical-review            who reviews what, when, credentials, disclosure
/science/evidence                   library: every study we cite (60 today), filterable by topic and evidence type
/science/evidence/<topic>           topic syntheses: "What research says about …" (12 planned, §2.3)
/science/research                   our research program: consent, what we'll study, what we'll publish (honest "coming")

/learn                              hub of hubs: search + 8 topic hubs + popular questions
/learn/poop                         hub: stool, Bristol, color, frequency            (cluster C1)
/learn/food-and-symptoms            hub: food–symptom diary, triggers                (C2)
/learn/ibs                          hub                                              (C3)
/learn/bloating                     hub                                              (C4)
/learn/constipation                 hub                                              (C5)
/learn/diarrhea                     hub                                              (C6)
/learn/gut-health-apps              hub: apps, AI, comparisons                       (C7)
/learn/doctor-visits                hub: GI appointment prep                         (C8)
/learn/<article-slug>               flat article URLs (ZOE pattern); hub shown in breadcrumb, not path

/tools                              hub
/tools/bristol-stool-chart          interactive "what's my type?" + printable        T1
/tools/how-regular-are-you          bowel-habits self-check (prototype built)        T2
/tools/poop-color-chart             color checker with red-flag colors               T3
/tools/why-am-i-bloated             bloating timing check                            T4
/tools/gi-appointment-prep          checklist builder → PDF                          T5

/resources                          hub: downloads and references
/resources/bristol-stool-chart-pdf  printable (landing page + PDF)
/resources/food-symptom-diary-pdf   printable diary (blank + worked example)
/resources/ibs-food-diary-template  printable
/resources/bowel-movement-log-pdf   printable
/resources/sample-doctor-report     what the PDF Doctor Report looks like (sample data)
/resources/glossary                 Bristol, Rome, FODMAP, transit time … (DefinedTermSet)
/resources/press                    facts, logos, screenshots, founder and advisor bios (for journalists and roundups)
```

**Why flat `/learn/<slug>`:** articles can move between hubs without redirects. It matches ZOE and keeps URLs short for AI citation. Hubs carry the hierarchy through breadcrumbs (`BreadcrumbList`) and internal links.

**Changes from the 19 Oct plan (decision: Science/Learn/Tools/Resources, owner 20 Oct 2026):**

| Was | Now | Action |
|---|---|---|
| `/blog/<slug>` (1 live post, 80 drafts) | `/learn/<slug>` | 301 `/blog/what-your-poop-is-trying-to-tell-you` → `/learn/…`; `/blog` → `/learn`. Codex spec 02 C1–C2: change the route only, keep the loader and publish gate |
| `/resources/<pillar>` (7 pillar copies in `onpage/resources-*.md`) | Pillar copy splits: the explainer goes to the hub (`/learn/<topic>`), the printable to `/resources/*-pdf`, the interactive part to `/tools/*` | Mapping in §3.2 |
| `/how-ai-works` | `/science/how-our-ai-works` | 301; copy in `onpage/how-ai-works.md` unchanged |
| `/poop-tracker`, `/food-symptom-tracker`, `/ibs-tracker` | unchanged (product pages) | Each links to its matching hub, tool and resource |

## 2. /science: credibility without pretending

### 2.1 The honesty rule

ZOE's science section works because ZOE runs studies (PREDICT, 60+ papers) and validated its own MenoScale (Kim et al., *Post Reproductive Health* 2025). **Get Regular has none of that yet.** So the section must not imitate it: no "our studies", no "clinically validated", no invented norms. What we can credibly publish:

1. **How our AI works**: inputs, outputs, limits, data flow. This is the most-asked trust question for an AI health app, and ChatGPT fan-out searches brand sites for exactly this.
2. **Method pages for every score**, in plain words.
3. **An evidence library** of the 60 studies our content already cites, every reference pulled from PubMed (`science/build_evidence_library.py`).
4. **Topic syntheses**: "what the research says about X", each built on guidelines and trials, with study tables.
5. **Who reviews what**: the clinical advisor's actual role, with consent and disclosure.
6. **A research program page**: the app already has a "Research consent" option (v2.0.0). State what will be studied, how consent works and what will be published. Our first aggregate, de-identified data report becomes the ZOE-style PR and citation asset (STRATEGY §7.6). Don't claim it before it exists.

### 2.2 Page specs

| Page | H1 | Sections | Schema |
|---|---|---|---|
| `/science` | The science behind Get Regular | What we track and why · How our AI works (summary + link) · Our scores (links) · Evidence library (latest 6 + topics) · Clinical review · Research program · What we don't claim | `WebPage` + `ItemList` of child pages; `Organization` @id |
| `/science/how-our-ai-works` | How Get Regular's AI works | From `onpage/how-ai-works.md`, plus an **evidence box** citing the AI stool-classification and meal-photo studies (2022 smartphone-AI Bristol study, PMID 35288511; ChatGPT meal-photo nutrient estimation, PMID 40004936; image-based dietary assessment scoping review, PMID 39546777), stating what they show and what they don't about *our* app | `MedicalWebPage` + `citation` (ScholarlyArticle with PubMed `sameAs`) |
| `/science/gut-health-score` | How the Gut Health Score works | Inputs · 7-day weighting (privacy policy) · What raises or lowers it · What it isn't · [CONFIRM weights from product] | `WebPage` + `DefinedTerm` |
| `/science/evidence` | The research we use | Filter chips by topic (8 hubs) and evidence type (guideline, systematic review, trial, study, review) · each card shows title, first author, journal, year, evidence type, "used in" links and PubMed/DOI · "How we choose evidence" | `CollectionPage` + `ItemList` of `ScholarlyArticle` (name, author, datePublished, isPartOf Periodical, identifier PMID/DOI, `sameAs` PubMed) |
| `/science/evidence/<topic>` | What the research says about [topic] | **Short answer** (2–3 sentences) · Study table (study, design, n, finding, limits) · What guidelines recommend · What's uncertain · What this means if you're tracking · Sources | `MedicalWebPage` + `citation[]` + `reviewedBy` (with consent) + `lastReviewed` |
| `/science/clinical-review` | Who reviews our content | Advisor card (credentials, institution, outside profile link, what he reviewed and when, compensation disclosure) · our editorial standard · how to report an error | `Person` (`hasCredential`, `affiliation`, `sameAs`), only with consent |
| `/science/research` | Our research program | Why · what the in-app research consent covers [CONFIRM] · privacy · what we'll publish and when · contact for researchers | `WebPage` |

### 2.3 Evidence topic pages (first 12, all backed by studies already in the library)

| Topic page | Target questions (Google + AI) | Core evidence (PMIDs in `science/evidence-library.csv`) | Hub |
|---|---|---|---|
| bristol-stool-scale | is the bristol stool chart accurate, what does the bristol scale measure | 9299672, 27492648, 8881820 | poop |
| how-often-should-you-poop-studies | normal bowel frequency study | 1624166, 12229965 | poop |
| gut-transit-time | how long does food take to become poop | 26223837, 31565841, 8977347 | poop |
| fiber-and-constipation | does fiber help constipation, best fiber for constipation | 37204227, 8995945, 23545709, 32619212 | constipation |
| food-diaries-vs-memory | does a food diary help IBS, are symptom diaries accurate | 30394943, 21063776, 23644955 | food-and-symptoms |
| lactose-intolerance | how common is lactose intolerance, lactose and IBS | 28690131, 20404262, 30560578, 20186234 | food-and-symptoms |
| gluten-without-celiac | is non-celiac gluten sensitivity real | 23648697, 40706614 | food-and-symptoms |
| ibs-diet-guidelines | low FODMAP evidence, what guidelines say about IBS diet | 33315591, 41713703, 42753081 | ibs |
| stress-and-ibs | does stress cause IBS flares | 42150709, 25339801, 9144039 | ibs |
| post-infectious-ibs | can food poisoning cause IBS | 28069350 | ibs |
| bloating-research | why do I bloat, bloating vs distension | 37452811, 36396061, 32246999, 28508867 | bloating |
| gut-microbiome-tests | do gut microbiome tests work | 39647502 (international consensus 2025) | gut-health-apps |
| ai-stool-and-meal-photos | can AI read a poop photo, how accurate are AI food trackers | 35288511, 40004936, 39546777, 27938425 | gut-health-apps |

**Rome V note:** the library already includes 2026 Rome V papers (41713703, 42753081). Every page and tool that cites Rome IV thresholds (including `/tools/how-regular-are-you`) must be checked by the clinical reviewer against Rome V before publishing.

## 3. /learn: where the traffic is

### 3.1 Hub template (8 hubs)

Order:
1. H1 (the topic in plain words, e.g. "Poop: what's normal, what's not")
2. **Short answer** box
3. "Start here" (3 cornerstone articles)
4. Tool card (the matching `/tools/*`)
5. All articles grouped by question type ("Is this normal?", "Why does it happen?", "What helps?", "When to see a doctor")
6. Printable card
7. "The research" (links to 2–3 `/science/evidence/*` pages)
8. Red-flag box
9. App CTA with the hub's App Store Custom Product Page

Schema: `CollectionPage` + `BreadcrumbList` + `ItemList`.

### 3.2 Cluster → hub → tool → resource → evidence

| Cluster (drafts) | Hub | Tool | Resource | Evidence pages | Product page / App Store custom page |
|---|---|---|---|---|---|
| C1 Stool & Bristol (10) | /learn/poop | T1 Bristol chart, T3 color chart | Bristol chart PDF, bowel movement log | bristol-stool-scale, how-often, transit-time | /poop-tracker · default |
| C2 Food–symptom diary (10) | /learn/food-and-symptoms | T2 quiz | food-symptom diary PDF | food-diaries-vs-memory, lactose, gluten | /food-symptom-tracker · bloating |
| C3 IBS (10) | /learn/ibs | T2 quiz | IBS food diary template | ibs-diet-guidelines, stress, post-infectious | /ibs-tracker · IBS |
| C4 Bloating & gas (10) | /learn/bloating | T4 bloating check | food-symptom diary PDF | bloating-research | /food-symptom-tracker · bloating |
| C5 Constipation (10) | /learn/constipation | T2 quiz | bowel movement log | fiber-and-constipation | /poop-tracker · constipation |
| C6 Diarrhea & urgency (10) | /learn/diarrhea | T2 quiz, T3 color | food-symptom diary PDF | lactose | /poop-tracker · default |
| C7 Apps, AI & comparisons (10) | /learn/gut-health-apps | — | sample Doctor Report | ai-stool-and-meal-photos, microbiome-tests | /app · default |
| C8 Doctor prep (10) | /learn/doctor-visits | T5 appointment prep | sample Doctor Report, checklist PDF | food-diaries-vs-memory | /app · Doctor Report |

Existing pillar copy reuse: `onpage/resources-bristol-stool-chart.md` → T1 + Bristol PDF + /learn/poop. `resources-food-symptom-diary.md` and `resources-ibs-food-diary.md` → hubs + PDFs. `resources-bloating-after-eating.md` → /learn/bloating + T4. `resources-constipation-diary.md` and `resources-food-diary-for-diarrhea.md` → hubs + logs. `resources-gi-appointment-prep.md` → T5 + /learn/doctor-visits.

The publish gate is unchanged: an article ships only after a named clinician approves it, **one hub at a time** (hub + 3 articles + its tool), in the order C1 → C2 → C3 → C5 → C4 → C6 → C8 → C7.

## 4. /tools: built to rank, not just to capture

### 4.1 Priorities by demand

| # | Tool | Main queries (US/mo, Semrush 6 Oct; "AC" = autocomplete only) | Why build it | Lead capture |
|---|---|---|---|---|
| T1 | **Bristol Stool Chart: what's my type?** | bristol stool chart 74,000 · poop chart 33,100 · bristol stool scale 5,400 · bowel movement chart 2,400 · type 6 1,000 … (40+ variants) | The single biggest owned-intent term in the category. Today's SERP is clinic PDFs and static images; an interactive, cited, mobile-first chart is a clear upgrade. KD 50–68, so it's a 6–12 month play built on links | Printable PDF (optional email), "track your type for 7 days" → App Store |
| T2 | **How regular are you?** (built: `tools/how-regular-are-you/`) | AC: "am i constipated quiz", "do i have ibs quiz", "ibs quiz free", "**ibs quiz no email**", "gut health quiz free", "bowel health quiz" | Long-tail quiz demand, plus the best destination for **paid social and creators** (MenoScale's traffic is press- and podcast-led, not SEO) | Result first, email optional (see §6) |
| T3 | **Poop color chart** | bowel movement color chart 1,900 · green poop (C1 draft) · yellow diarrhea (C6) | High intent, strong red-flag duty (black, red, pale stool) | Optional email |
| T4 | **Why am I bloated?** | why am i so bloated i look pregnant 18,100 · why am i so bloated 8,100 · why am i always bloated 4,400 · why am i bloated after eating 320 | Huge question cluster. A 6-question timing check (after meals vs end of day, with which foods, with cycle, with stool changes) maps to the C4 articles | Optional email |
| T5 | **GI appointment prep** | questions to ask gastroenterologist, symptom diary for doctor (C8) | Small volume, highest-intent audience, ties to the Doctor Report | PDF via email |

### 4.2 Tool page template (every tool)

- **Above the fold:** H1 with the query wording, one-line promise, start button. All server-rendered (the T10 lesson: no JS-only H1).
- **The tool.** Client-side, with nothing sent anywhere until the user opts in.
- **Result:** score or type, plain explanation with citations, 3 things to try, red-flag override, App Store CTA (matching App Store Custom Product Page + `ct`), optional email.
- **Below the tool, indexable content:** short answer, a method table ("what this check looks at"), "is this a diagnosis?", FAQ, sources, reviewer, last reviewed. This is what ranks and gets cited; the tool itself doesn't.
- **Results are not indexable** and have no shareable URLs with answers in them (ZOE does the same: its quiz subdomain is `noindex`).
- **Schema:** `WebApplication` (HealthApplication, free) + `MedicalWebPage` with `citation`. Add visible FAQ text; don't rely on FAQ rich results.

### 4.3 T2 prototype: what's built

`tools/how-regular-are-you/`. Open `prototype.html` in a browser.

- **Questions** (10, or 11 with the pain branch): Bristol type (illustrated), frequency, straining, unfinished feeling, urgency, pain (+ days per week), bloating, duration, warning signs, goal.
- **Output:**
  - A 0–100 Regularity Score, with transparent editorial weights.
  - 4 bands, and 9 patterns (regular, slow, constipation-leaning, loose-leaning, alternating, bloating, IBS-type C/D/mixed).
  - Each pattern has its own copy, citations, "3 things to try" and App Store custom page.
  - Warning signs move a "talk to a doctor" card to the top, above any app pitch.
- **Code:** `quiz.js` (pure scoring), `copy.js` (all result copy, so the clinical reviewer edits one file), `index.html` (UI + SEO content + JSON-LD), `quiz.test.mjs` (11 tests, including every answer combination). `node build.mjs` writes the single-file `prototype.html`.
- **Checked:** walked through in Chromium on desktop (1280px) and mobile (390px) with no console errors.
- **Port to Next.js:** a `/tools/how-regular-are-you` route renders the content section on the server; the quiz is a client component importing `quiz.js` and `copy.js` unchanged.

## 5. /resources: things people keep and share

Each printable gets an indexable HTML landing page (what it is, how to use it, a preview image, sources) plus the PDF. The download works **without** email; the email offer is "send me this plus a 7-day plan". The press page holds the fact sheet's entity descriptions, logos, screenshots and bios. Journalists and roundup editors copy from it, which is how the facts reach AI answers.

## 6. Email capture → App Store: the flow and its guardrails

**Flow:** tool result or printable → optional email with separate consents → double opt-in → sequence → App Store (with the matching custom page and `ct` token).

| Day | Email | CTA |
|---|---|---|
| 0 | Your result + the printable + how to log for 7 days | App Store |
| 2 | "What your pattern usually means" (from the matching /learn hub) | Article |
| 4 | One thing to test this week (by pattern: fiber ramp, caffeine check, timing log) | App Store |
| 7 | "Your 7 days: what to look for" + Doctor Report sample | App Store |
| 14 | Monthly newsletter, **only with marketing consent** | — |

**Guardrails.** The pending compliance research is in §11. These apply regardless:
- **Results never require an email.** This follows the "ibs quiz no email" search demand, Google's helpful-content expectations and trust for a health brand. ZOE gates its result behind email; we deliberately don't. If capture rates disappoint, A/B test gating the *extended plan*, never the result.
- **Separate, unticked consent** for (a) storing quiz answers to send results and (b) marketing email. ZOE's US flow defaults to marketing-on; don't copy that.
- **No quiz answers, scores, patterns or warning-sign data to ad platforms.** Meta and TikTok pixels on tool pages may receive only page views, or nothing. Fire `Lead` server-side without health fields, or not at all. This follows the FTC GoodRx (2023) and BetterHelp (2023) actions and the Health Breach Notification Rule.
- The ESP (Kit is already a listed processor in the privacy policy) stores the pattern as a tag only under the health-data consent. Washington's My Health My Data Act and similar state laws treat bowel-symptom answers as consumer health data. Legal must approve the consent text (versioned in the payload as `consent_text_version`).
- The App Store `ct` tokens (`quiz-ibs-c` …) reveal a pattern to Apple's aggregate analytics only. If legal prefers, switch to neutral codes (`q1`…`q9`) with the mapping kept internally.

## 7. The AI-visibility layer (applies to every page above)

1. **One entity graph.** `Organization` (#org), `WebSite`, `MobileApplication` (#app), `Person` (#advisor, with consent). Every page references these by `@id`, never redefining them.
2. **Answer-first.** Each page opens with a 2–3 sentence answer that could be quoted alone, then a table, then depth.
3. **Dated and reviewed.** Every Learn, Science and Tool page shows "Last reviewed [date] by [name]", with `lastReviewed` and `reviewedBy` in the markup.
4. **Primary citations.** Science pages link PubMed or the DOI, and Learn articles cite at least one guideline or study per claim cluster. This is the content type ChatGPT moved toward in 2026.
5. **Things only we can publish.** The tools, the method pages, the sample Doctor Report and, later, consented aggregate data. These earn citations; another generic explainer doesn't.
6. **llms.txt** listing the hubs, tools, science pages and `/app`. It's cheap and harmless, but Google says it isn't used, so don't expect lift (GEO strategy §10).
7. **Measure.** Add the new prompts in §8 to `geo/ai-prompt-panel.csv` and run `geo/tracker/run_panel.py` monthly.

## 8. New prompts for the AI-visibility panel

Added to `geo/ai-prompt-panel.csv` (54 prompts now; clusters `tool-quiz`, `tool-bristol`, `science`, `resources`, `learn`):
- "is there a free quiz to check if I'm constipated"
- "interactive bristol stool chart what type is my poop"
- "what does research say about fiber for constipation"
- "do gut microbiome tests actually work"
- "can AI tell what type my poop is from a photo"
- "printable food and symptom diary for IBS"
- "what does green poop mean"

## 9. Build order and KPIs

| Phase | Ship | KPI (judge on the right layer) |
|---|---|---|
| 0 (now) | Technical blockers T1–T15, `/app`, claims removed | Indexed URLs, 0 critical AI errors on the branded prompts |
| 1 (weeks 1–4) | `/science` hub + how-our-ai-works + evidence library; `/learn/poop` hub + 3 C1 articles; **T1 Bristol chart**; Bristol PDF | Impressions on "bristol stool chart" variants; tool completions; App Store clicks per tool |
| 2 (weeks 4–8) | **T2 quiz** (after clinical + legal review); 4 evidence topic pages; C2 + C3 hubs | Quiz completion rate (start → result), email opt-in %, App Store CTR from result, installs per App Store custom page |
| 3 (weeks 8–12) | T3, T4; C5, C4 hubs; resources hub; press page | Non-brand clicks per hub; third-party citations (`third_party_citation` in the tracker) |

**Funnel events** (no health data in any of them): `tool_start`, `quiz_step`, `quiz_complete`, `email_submit`, `pdf_download`, `app_store_click` (placement, tool). The App Store side is App Store Connect installs by custom page and `ct`.

## 10. ZOE: what we copy and what we don't (teardown, 20 Oct 2026)

| Copy | Don't copy |
|---|---|
| Score out of 100 + plain bands; short screens with a progress bar | "World's largest study" claims and a 60-paper wall; we have no studies of our own yet |
| Tool in the main nav, deep-linked from related articles | Email gate before results, and US marketing opt-in on by default |
| Landing-page FAQ covering scoring, science, data use and disclaimer | Generic titles ("Our Science"), no meta descriptions, Organization-only schema (ZOE's gaps; we do better) |
| Optional, separate research-consent step ("same score either way"); ours waits for a defined research program | "Compared with people like you" norms; only with real data |
| Scientist cards with credentials, institution and outside profile | A "board"; we credit one named clinical reviewer per page, with consent |
| Printable version of the questionnaire | Science that lives only as outbound links; every topic gets its own indexable page |

ZOE's reach comes from its podcast (reported to touch ~40% of sales), press and a famous scientist; organic search is about a third of its traffic (Semrush estimate). **The tools won't bring traffic by themselves.** Plan T2 as the destination for paid social, creators and email, and T1 and the Learn hubs as the organic engine.

## 11. Open decisions and [CONFIRM] items

1. **Clinical reviewer** for the tools and science pages (named, consenting). Also: the Rome V check on T2 thresholds.
2. **Legal:** consent text, ESP data handling, pixel policy on tool pages, `ct` token style.
3. **Product:** Gut Health Score weights for `/science/gut-health-score`; what the in-app research consent covers.
4. **Email endpoint:** a Kit form, or a first-party API route that double-opts-in and stores consent records.
5. **App Store Custom Product Page IDs** once approved, so the tools deep-link to the right page.
