# Homepage copy update: `/`

> Owner: SEO/CRO workstream. Prepared 19 Oct 2026. Codex renders this copy as written (spec `codex/02` §C4); wording changes need owner approval. Facts come only from `research/product-fact-sheet.md` (checked 19 Oct 2026). Items marked **[CONFIRM: …]** must be resolved by the owner before shipping.

## 0. Header block

| Field | Value |
|---|---|
| URL | `https://www.getregular.com/` (canonical, www, self-referencing) |
| review_status | `draft-needs-medical-review` (the page makes health statements: red flags, the Rome Foundation statistic, "not a diagnosis") |
| Primary keyword | gut health app |
| Owned variants | gut health tracker, gut health tracker app, digestive health app, get regular (brand), get regular app |
| Search intent | Navigational (brand) + commercial ("gut health app") |
| Title tag (58 chars) | `Gut Health App: Food, Poop & Symptom Tracker | Get Regular` |
| Meta description (155 chars) | `Get Regular is an iOS gut health app. Log meals, poop (Bristol scale) and symptoms, see weekly patterns, and bring a PDF report to your doctor.` |
| H1 | Option A (recommended): "Your gut is talking. Are you listening?" + visible category line (see §2). Option B: "The gut health app for tracking food, poop and symptoms" |
| OG title | Get Regular: the gut health app for food, poop & symptom tracking |
| OG description | Log meals, bowel movements and symptoms on your iPhone. See your patterns and walk into your next appointment with data. |
| OG image brief | 1200×630, compressed (<200 KB, WebP/PNG). iPhone showing the Today screen (Gut Health Score + a logged meal + a Bristol type 4 entry) on the brand background; wordmark top-left; no star ratings, no "clinically validated". Alt: "Get Regular app on iPhone showing a daily gut health score, a logged meal and a stool entry." |
| JSON-LD | `Organization` (`@id` https://www.getregular.com/#org), `WebSite` (`@id` https://www.getregular.com/#website), `MobileApplication` referenced by `@id` https://www.getregular.com/app#app (full node lives on `/app`). No `aggregateRating`, no `founder` until confirmed. |
| App Store `ct` tokens | `home-hero` (hero + sticky CTA), `home-footer` (final CTA). All other homepage CTAs use `home-hero` unless Codex adds section tokens (`home-trackers`, `home-report`) — optional. |
| App Store URL | Via `AppStoreLink`: `https://apps.apple.com/app/id6749188690?pt=[CONFIRM: provider token]&ct=<token>` (storefront-neutral; replaces the `/ca/` links, audit F17) |

**Internal links out (anchor → URL)**

| Anchor | URL | Section |
|---|---|---|
| Poop tracker | `/poop-tracker` | Use-case routes |
| Food & symptom tracker | `/food-symptom-tracker` | Use-case routes |
| IBS tracker | `/ibs-tracker` | Use-case routes |
| See what's in the app, prices and limits | `/app` | Pricing strip, footer |
| How our AI works | `/how-ai-works` | AI & privacy summary |
| Read the privacy policy | `/legal/privacy-policy` | AI & privacy summary |
| Bristol stool chart (free PDF) | `/resources/bristol-stool-chart` | Resources |
| Food & symptom diary template | `/resources/food-symptom-diary` | Resources |
| IBS food diary template | `/resources/ibs-food-diary` | Resources |
| Bloating after eating guide | `/resources/bloating-after-eating` | Resources |
| Constipation diary | `/resources/constipation-diary` | Resources |
| Food diary for diarrhea | `/resources/food-diary-for-diarrhea` | Resources |
| GI appointment checklist | `/resources/gastroenterologist-appointment-prep` | Doctor Report section + Resources |
| All articles | `/blog` | Journal |

**Pages that must link in:** every page (logo → `/`), `/app`, `/how-ai-works`, all three product pages (breadcrumb "Home"), all resources (breadcrumb), footer on every page with anchor "Get Regular — gut health app".

---

## 1. What to change (before → after)

| # | Element | Before (live, 19 Oct 2026) | After | Why |
|---|---|---|---|---|
| 1 | `<title>` | Get Regular — Trust Your Gut Again | Gut Health App: Food, Poop & Symptom Tracker \| Get Regular | Names the category and the jobs (audit F14). Keeps brand at end |
| 2 | Meta description | "AI-powered gut health tracking. Analyze your stool, meals, and **biomarkers** … built with a board-certified gastroenterologist." | See header (155 chars) | "Biomarkers" is undocumented (fact sheet §10 C2). New text lists only verified features |
| 3 | H1 | "Your gut is talking. Are you listening?" (rendered with `opacity:0` until JS) | Keep as Option A **plus** a visible category line directly under it, both server-rendered visible (T10). Option B available | Brand line stays; category becomes visible and crawlable (F04, F14) |
| 4 | Hero badge | "AI-Powered · **Clinically Validated** · Available on iOS" | "For iPhone & iPad · Photo or manual logging · Doctor-ready PDF report" | No validation study exists (F01, fact sheet C1). **Remove "Clinically Validated" everywhere at once** (site, App Store, socials) |
| 5 | Hero sub-copy | "Get Regular analyzes your stool, meals, symptoms and biomarkers to give you personalized insights." | "Log meals, bowel movements and symptoms in seconds. Get Regular turns them into daily scores and weekly patterns you can test — and a report you can bring to your doctor." | Drops "biomarkers"; adds the "be heard by your doctor" outcome (VOC §1.7) |
| 6 | Hero chips / marquee | "Find your triggers · Stop guessing · Feel better daily" | "Spot possible patterns · Stop guessing · Walk in with data" | "Find your triggers" and "feel better" are outcome promises (geo §10) |
| 7 | Stat "40%" | "40% of people worldwide struggle with gut health issues." | "In a Rome Foundation study of 73,076 adults in 33 countries, 40% of people surveyed online met the criteria for at least one disorder of gut-brain interaction (such as IBS or functional constipation)." + visible source link | Accurate wording + citation (Sperber et al., *Gastroenterology* 2021, PMID 32294476). The household-interview arm found 20.7% — wording must say "surveyed online" |
| 8 | Stat "$3,000+" | "what the average gut health sufferer spends per year…" | **Remove** unless the owner supplies a source **[CONFIRM: source or delete]** | No source found (C4) |
| 9 | Stat "3 years" | "the average time it takes … to get a correct diagnosis" | **Remove** unless sourced **[CONFIRM: source or delete]** | No source; diagnostic delay varies by condition (C5) |
| 10 | Problem section H2 | "You've been flushing your most powerful biomarker." | Keep the line as written (it's a metaphor about stool as information, not a claim about lab biomarkers) — or swap to "You've been flushing your best clue." if legal prefers | Low risk; owner choice |
| 11 | Step 01 copy | "Photo your food, stool, and **symptoms**. Ten seconds, done." | "Snap or type your meal. Log your poop by photo or pick the Bristol type yourself. Tap your symptoms." | Symptoms are tapped, not photographed (C8). Manual Bristol entry is a verified option |
| 12 | Step 02 copy | "AI cross-references everything against **clinical GI guidance** to find your patterns." | "AI looks across your food, stool and symptom history for possible patterns — using the Bristol Stool Form Scale doctors use." | Unnamed "guidance" claim (C7) until `/how-ai-works` names it |
| 13 | Step 03 copy | "…scores update **in real time** with every input." | "Your daily Gut Health and Nutrition Scores update as you log. The Gut Health Score looks at your last 7 days, weighted toward recent days." | Matches privacy policy definition (C9) **[CONFIRM: update timing]** |
| 14 | Step 04 copy | "Personalized dietary and **supplement** recommendations…" | "Get food ideas and self-experiments to try (like a week without dairy) — suggestions, not medical advice." | Supplement advice needs limits (C10) |
| 15 | Step 05 copy | "Watch it work." / "Your plan evolves as your gut does." | "Share it. Turn your logs into a PDF Doctor Report (Premium) for your next appointment." | Leads with the strongest verified job (Doctor Report) |
| 16 | Duplicate step markup | Desktop + mobile copies in DOM (5 H3 × 2) | One set of steps, responsive CSS | Audit F24/F26 |
| 17 | Community intro | "**Thousands of people** are already tracking, learning, and **feeling better**." | "Real people, real logs. Here's what they're saying." **[CONFIRM: if a dated user count exists, use "More than [N] people have logged with Get Regular (as of [date])"]** | No published count (C11); "feeling better" is an outcome claim |
| 18 | Testimonials | "— Midwife", "— App user" ×3 | Keep only quotes with written permission on file **[CONFIRM: permission records]**. Add label "User testimonials. Individual experiences; not typical results or medical advice." | FTC endorsement guidance (C12) |
| 19 | Science section | H2 "Built with a gastroenterologist, not just an algorithm." + "Developed with a board-certified gastroenterologist…" + quote "…reliably demonstrating…" | H2 "Built with input from a gastroenterologist." Body per §2.8. Quote: keep only if Dr. Schopis re-approves it in writing **[CONFIRM]**; recommended trim ends at "…as it relates to gut health." Add link "How our AI works" → `/how-ai-works` | "Reliably demonstrating" reads as validation (F01, C6) |
| 20 | App Store links | `apps.apple.com/ca/app/get-regular/id6749188690` (Canadian storefront, no tokens) | `AppStoreLink` with neutral URL + `ct` | F17 / T14 |
| 21 | Sections to add | — | (a) Use-case routes to the 3 trackers; (b) Doctor Report; (c) AI & privacy summary; (d) Pricing strip; (e) Resources; (f) FAQ | Homepage currently links only to `/blog` (audit §7) |
| 22 | Footer | "© 2025", Privacy, Terms (open in new tab) | Dynamic year; add Trackers, Resources, `/app`, `/how-ai-works`; legal links same tab; add "Get Regular is a wellness tracking app. It doesn't diagnose or treat any condition." | F26, F15 |
| 23 | Nav | The Problem · How It Works · Community · Science · Blog · Download | How it works · Trackers (Poop · Food & symptoms · IBS) · Resources · Journal · Download | Spec C4 navigation |
| 24 | Journal card date | "October 20, 2026" (future) | Real publish date | F11 |

---

## 2. Section-by-section copy (new homepage, in order)

### 2.1 Hero

- **Eyebrow / badge (replaces "AI-Powered · Clinically Validated · Available on iOS"):**
  `For iPhone & iPad · Photo or manual logging · Doctor-ready PDF report`
- **H1 — Option A (recommended, keeps brand line):**
  `Your gut is talking. Are you listening?`
- **Visible category line (rendered as a `<p class="lede">` immediately under the H1, server-rendered visible, same visual weight as current sub-copy):**
  `Get Regular is the gut health app for tracking food, poop and symptoms — on iPhone.`
- **H1 — Option B (category-first, use if A/B testing):**
  `The gut health app for tracking food, poop and symptoms`
  with brand line as the eyebrow above it: `Your gut is talking. Are you listening?`
- **Sub-copy:**
  Log meals, bowel movements and symptoms in seconds. Get Regular turns them into daily scores and weekly patterns you can test — and a report you can bring to your doctor.
- **Primary CTA (button, `ct=home-hero`):** `Download on the App Store` (official Apple badge)
- **Secondary CTA (text link):** `See what's free and what's Premium →` → `/app#pricing`
- **Microcopy under CTAs:** `Free to download · iOS 15.1 or later · No Android app yet`
- **Chips (static, no marquee duplication in DOM):** Spot possible patterns · Stop guessing · Walk in with data
- **Hero visual brief:** Poster-first (no autoplay iframe) phone mockup of the **Today** screen: Gut Health Score card, Nutrition Score card, one meal entry with photo thumbnail ("Oat bowl with berries"), one stool entry "Bristol type 4 · 8:12 am". Use a test account with dummy data. Export as `next/image` WebP, explicit width/height, `priority` only on this image.
  **Alt:** "Get Regular Today screen on iPhone showing a gut health score, nutrition score, a logged breakfast and a Bristol type 4 stool entry."

### 2.2 Use-case routes (NEW) — "What do you want to figure out?"

**H2:** What do you want to figure out?

Three cards, equal weight, each a full-card link (anchor text = card title).

| Card title (link) | Body (≤ 30 words) | Link |
|---|---|---|
| **Poop tracker** | "Is this normal?" Log every bowel movement by photo or by picking the Bristol type yourself. Track no-go days and time on the toilet. | `/poop-tracker` |
| **Food & symptom tracker** | "What's setting me off?" Log meals by photo or text, tap your symptoms, and see possible patterns across hours and days — not just the last meal. | `/food-symptom-tracker` |
| **IBS tracker** | "Why is this flaring?" Keep food, stool type, symptoms and period days in one timeline you can share with your GI or dietitian. | `/ibs-tracker` |

**Card visual briefs (one small screenshot each, dummy data):**
1. Poop: Bristol type picker screen (manual entry). Alt: "Manual Bristol stool type picker in the Get Regular app."
2. Food & symptoms: meal photo log with editable ingredients. Alt: "Meal logged from a photo with an editable ingredient list."
3. IBS: Backlog month heatmap highlighted by one symptom. Alt: "Monthly heatmap of gut scores with bloating days highlighted."

### 2.3 The problem (kept, rewritten)

**Eyebrow:** The problem
**H2:** You've been flushing your best clue.
*(Owner may keep the original "You've been flushing your most powerful biomarker." — see change #10.)*

**Stat block (single stat, cited):**
- **Number:** 40%
- **Text:** of adults surveyed online in a 33-country Rome Foundation study met the criteria for at least one disorder of gut-brain interaction, such as IBS or functional constipation.¹
- **Footnote (visible, small):** ¹ Sperber AD et al. Worldwide prevalence and burden of functional gastrointestinal disorders: Rome Foundation Global Study. *Gastroenterology*. 2021;160(1):99–114. 73,076 adults; 40.3% of internet-survey respondents and 20.7% of household-interview respondents. [PubMed](https://pubmed.ncbi.nlm.nih.gov/32294476/)

**Body (replaces the $3,000+ and 3-years stats):**
Most people with gut issues are told to "keep an eye on it." But memory is a bad diary. By the time you see a doctor, last Tuesday's bloating and Thursday's urgent dash are a blur — and "it's been bad for a while" is hard for anyone to act on.

### 2.4 How it works (rewritten, one DOM copy)

**Eyebrow:** How it works
**H2:** We turn gut feelings into gut data.

| Step | H3 | Body |
|---|---|---|
| 01 | Log it. | Snap or type your meal. Log your poop by photo or pick the Bristol type yourself — no photo required. Tap your symptoms. Most logs take seconds. |
| 02 | See your patterns. | Your daily Gut Health and Nutrition Scores update as you log. Each week, a Weekly Digest points out possible patterns across your food, stool and symptoms. |
| 03 | Test, don't guess. | Ask Gut Check (our AI chat) about your own history, or run a guided self-experiment — like a week without dairy — and log what happens. *(Premium)* |
| 04 | Share it. | Turn your logs into a PDF Doctor Report for your next appointment. *(Premium)* |

**Microcopy under steps:** `Suggestions, not diagnoses. Get Regular is a tracking app and doesn't diagnose or treat any condition.`
**Mid-page CTA (`ct=home-hero`):** `Start logging — free download`

**Visual brief:** 4-frame horizontal strip (stacked on mobile), real screens, dummy data: (1) meal photo log, (2) Today scores, (3) Gut Check chat answering "What's been different on my bloated days?", (4) first page of the Doctor Report PDF.
**Alts:** "Logging a meal by photo" · "Daily Gut Health and Nutrition Score cards" · "Gut Check AI chat answering a question about the user's own logs" · "First page of a Doctor Report PDF with a bowel pattern summary."

### 2.5 Doctor Report (NEW)

**Eyebrow:** Be heard at your next appointment
**H2:** Walk in with data, not "it's been bad for a while."

**Body:**
Doctors ask when it started, how often it happens and what your stool looks like. The Doctor Report answers in one PDF you can print or share. *(Premium)*

**What's in the report (verified list from the v1.6 release notes):**
- Bowel patterns and Bristol scale tracking
- Symptom frequency
- Diet quality analysis
- Possible food–symptom correlations
- Nutrient patterns
- Cycle data, if you track your period

**Note (small):** The report summarizes what you logged. It's a conversation starter for your clinician, not a diagnosis.

**Link:** `Getting ready for a GI visit? Use our free checklist →` → `/resources/gastroenterologist-appointment-prep`
**CTA (`ct=home-hero`):** `Get the app`

**Visual brief:** Two-page spread of a Doctor Report generated from a dummy test account (fictional name "Sample User"; dates within a single 14-day window). Must be a real export, not a mock-up. Blur nothing; no real user data.
**Alt:** "Sample Get Regular Doctor Report PDF showing Bristol type trends, symptom frequency and food–symptom notes over two weeks (dummy data)."

### 2.6 Community / testimonials (kept, softened)

**Eyebrow:** The movement
**H2:** The community is talking.
**Intro:** Real people, real logs. Here's what they're saying.
**[CONFIRM: replace intro with a dated user count only if one exists.]**

- Social embeds: replace the 6 TikTok iframes with click-to-load facades (poster image + play button; load player on click) — T11.
- Testimonial cards: keep the existing four quotes **only** if permission is on file **[CONFIRM]**. Do not edit their words.
- Label under the cards: `User testimonials. Individual experiences — not typical results or medical advice.`

### 2.7 Our AI & your privacy (NEW)

**H2:** What our AI does — and where your data goes

Two columns.

**Column 1 — H3: What the AI does**
- Reads your meal photos and descriptions to estimate ingredients and nutrition.
- Classifies stool photos on the Bristol Stool Form Scale (or skip photos and choose the type yourself).
- Looks across your history for possible patterns and answers your questions in Gut Check.
- It can be wrong. You can edit meal ingredients, and the app never diagnoses. **[CONFIRM: can users edit/override an AI-assigned Bristol type? If yes, add "or a stool type".]**

**Column 2 — H3: Where your data goes**
- To analyze your logs, photos, text, symptoms and chat messages are sent to OpenAI's API. Our privacy policy states that only anonymized content is sent — no names, emails or account IDs — and that OpenAI does not use API inputs to train its models.
- Photos are compressed for analysis and not permanently stored on our servers; only the results are saved.
- We don't sell your health data or share it with advertisers.
- Delete your account in the app and your data is permanently removed within 30 days.

**Links:** `How our AI works →` `/how-ai-works` · `Read the privacy policy →` `/legal/privacy-policy`

> **[CONFIRM before shipping this section]:** the App Store privacy label lists "Precise Location" and "Health" under Analytics, but the privacy policy doesn't mention location (fact sheet §7). Fix the label or the policy first, so this section and the App Store agree.

### 2.8 Built with input from a gastroenterologist (kept, reworded)

**Eyebrow:** Clinical input
**H2:** Built with input from a gastroenterologist.
**Body:** Get Regular's scoring and content were developed with input from Dr. Michael Schopis, MD, a board-certified gastroenterologist who serves as our clinical advisor. **[CONFIRM: exact scope — what he reviewed and when; disclosure of compensation/equity; approval of name, photo and title "Clinical Advisor".]**
**Advisor card:** Photo (`next/image`, 96×96 source, no preload — F07) · "Dr. Michael Schopis, MD · Board-certified gastroenterologist · Clinical Advisor, Get Regular" **[CONFIRM: affiliations line; sources conflict (Weill Cornell vs NYU Langone)]**
**Quote (only with fresh written approval, trimmed):**
"The app's internal analysis and outputs underwent extensive scrutiny and tweaking to ensure it correctly follows all current major gastroenterology guidelines as it relates to gut health." — Dr. Michael Schopis, Clinical Advisor, Get Regular
**Link:** `How our AI and scores work →` `/how-ai-works`
**Do not use:** "clinically validated", "evidence-based interpretation … reliably demonstrating", "FDA".

### 2.9 Pricing strip (NEW, plain text)

**H2:** What it costs
**Body:** Free to download. Premium unlocks Gut Check, Experiments, the Doctor Report and personalized Recipes. In the US, Premium is $12.99/month or $99.99/year; a Founding Yearly rate of $79.99 appears where offered. Prices vary by region — check the App Store. *(Prices checked 19 Oct 2026.)*
**[CONFIRM: what free users can do (logging? scores? Weekly Digest?) and whether a free trial is currently offered. Don't mention a trial until confirmed.]**
**Link:** `Full feature and pricing facts →` `/app#pricing`

### 2.10 Free resources (NEW)

**H2:** Free tools — no app required
**Intro:** Prefer paper first? Start here. Every guide has a free printable and links to the research behind it.

| Card (link text) | One-liner | URL |
|---|---|---|
| Bristol stool chart + 14-day log (PDF) | The 7 poop types in plain words, and what each can suggest. | `/resources/bristol-stool-chart` |
| Food & symptom diary template | The columns that actually reveal patterns: timing, portion, onset. | `/resources/food-symptom-diary` |
| IBS food diary + worked example week | What to log during a flare, and how to read it. | `/resources/ibs-food-diary` |
| Bloating after eating | Why it happens, how long it lasts and how to track it. | `/resources/bloating-after-eating` |
| Constipation diary | A bowel log for "I can't go" weeks. | `/resources/constipation-diary` |
| Food diary for diarrhea | Track onset time, stool type and urgency. | `/resources/food-diary-for-diarrhea` |
| GI appointment checklist | What to track for 2 weeks and bring to your gastroenterologist. | `/resources/gastroenterologist-appointment-prep` |

### 2.11 FAQ (NEW, visible HTML, no FAQPage markup)

**H2:** Questions people ask

**Is Get Regular free?**
It's free to download. Premium features — Gut Check, Experiments, the Doctor Report and Recipes — need a subscription: $12.99/month or $99.99/year in the US as of 19 Oct 2026 (prices vary by region). **[CONFIRM: free-tier features.]**

**Is there an Android app?**
Not yet. Get Regular runs on iPhone and iPad (iOS 15.1 or later). **[CONFIRM: any Android/web plans to mention.]**

**Do I have to photograph my poop?**
No. You can log a bowel movement by choosing the Bristol type yourself. Photo logging is optional, and the app has an enhanced privacy mode for stool photos.

**Can I log a day when I didn't go?**
Yes. You can log a no-go day, and no-go days don't break your streak.

**Will the app tell me what's wrong with me?**
No. Get Regular shows possible patterns in what you log. It doesn't diagnose or treat any condition. If you have blood in your stool, black stools, unexplained weight loss, or symptoms that wake you at night, see a doctor.

**Can I share my logs with my doctor?**
Yes, with Premium: the Doctor Report is a PDF with your bowel patterns, Bristol trends, symptom frequency, diet quality and possible food–symptom correlations.

### 2.12 Journal (kept)

**H2:** Fresh reads for a happier gut. (keep)
Show the 3 latest **published** posts (`review_status: approved`) with real dates. Link "View all →" `/blog`.

### 2.13 Final CTA (kept, reworded)

**Eyebrow:** Available now on iOS
**H2:** It's time to Get Regular.
**Body:** Log your first meal and your first poop today. In a week, you'll have a pattern worth talking about.
**CTA (`ct=home-footer`):** `Download on the App Store`
**Microcopy:** `Free to download · iPhone & iPad · Premium optional`
**Contact line (keep):** Questions, comments, or poop photos? hello@getregular.com *(owner may drop "or poop photos" — it invites sending health images by email)*

### 2.14 Footer (rewritten)

- Columns: **Trackers** (Poop tracker · Food & symptom tracker · IBS tracker) · **Resources** (all 7) · **Company** (The app: facts & pricing `/app` · How our AI works `/how-ai-works` · Journal `/blog` · Contact) · **Legal** (Privacy policy `/legal/privacy-policy` · Terms `/legal/terms-of-service`, same tab)
- Disclaimer line: `Get Regular is a wellness tracking app. It doesn't diagnose, treat or prevent any condition and isn't a substitute for medical care. In an emergency, call your local emergency number.`
- `© {currentYear} Get Regular Health, Inc.`

---

## 3. JSON-LD (homepage)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {"@type": "Organization", "@id": "https://www.getregular.com/#org",
     "name": "Get Regular", "legalName": "Get Regular Health, Inc.",
     "url": "https://www.getregular.com/", "email": "hello@getregular.com",
     "logo": "https://www.getregular.com/[CONFIRM: logo path].png",
     "sameAs": ["https://apps.apple.com/us/app/get-regular-ai-gut-health/id6749188690",
                "https://www.linkedin.com/company/get-regular/",
                "https://www.tiktok.com/@getregular",
                "https://www.instagram.com/get.regular"]},
    {"@type": "WebSite", "@id": "https://www.getregular.com/#website",
     "url": "https://www.getregular.com/", "name": "Get Regular",
     "publisher": {"@id": "https://www.getregular.com/#org"}, "inLanguage": "en"},
    {"@type": "WebPage", "@id": "https://www.getregular.com/#webpage",
     "url": "https://www.getregular.com/",
     "name": "Gut Health App: Food, Poop & Symptom Tracker | Get Regular",
     "isPartOf": {"@id": "https://www.getregular.com/#website"},
     "about": {"@id": "https://www.getregular.com/app#app"}}
  ]
}
```

## 4. Acceptance checks for Codex

- `curl -s https://www.getregular.com/ | grep -c "Clinically Validated"` → `0`.
- H1 and category line visible with JS disabled (no inline `opacity:0`).
- No "$3,000", "3 years", "biomarkers", "Thousands of people" in HTML unless the owner supplied a source and the copy was updated with it.
- Every App Store href contains `ct=home-hero` or `ct=home-footer` and no `/ca/`.
- Homepage links to all 3 product pages, `/app`, `/how-ai-works` and all 7 resources.
