# Get Regular: canonical product fact sheet

**Observed:** 19 October 2026 (UTC). **Market:** US English, with GB, CA and AU storefront prices also checked.
**Owner:** SEO/GEO workstream. Other writers should take facts from this file rather than from memory or older drafts. Re-check the live sources before publishing anything about prices, ratings, versions or features.

> **Update 21 Oct 2026:** `product-walkthrough.md` documents the app screen by screen (App Store screenshots plus an in-app recording) and resolves several §11 questions: a 7-day trial on the paywall, what the Regular Score is, Apple Health reading Sleep and Steps, the free vs premium split, the Weekly Digest's 4-day threshold and the Doctor Report options. It also raises new issues for the team (§9 there). Where the two files differ, the walkthrough is newer.

**Status labels used below**
- **VERIFIED**: read directly from a primary source on the date shown.
- **COMPANY CLAIM**: published by Get Regular, but no independent evidence was found. Quote it as the company's claim or not at all.
- **THIRD-PARTY**: comes from a non-company source. Treat it as unconfirmed until the team signs off.
- **UNVERIFIED**: confirm with the team before using it.

**Primary sources (all fetched 2026-10-19)**

| ID | Source |
| --- | --- |
| S1 | Homepage: https://www.getregular.com/ (HTTP 200, Vercel/Next.js) |
| S2 | Privacy Policy: https://www.getregular.com/legal/privacy-policy ("Last update — June 8, 2026") |
| S3 | Terms of Service: https://www.getregular.com/legal/terms-of-service ("Last update — August 4, 2026") |
| S4 | iTunes Lookup API: `https://itunes.apple.com/lookup?id=6749188690&country=us` (also `gb`, `ca`) |
| S5 | US App Store page: https://apps.apple.com/us/app/get-regular-ai-gut-health/id6749188690 (IAP prices, privacy label, version history) |
| S6 | GB, CA and AU App Store pages for the same ID (IAP prices) |
| S7 | Blog: https://www.getregular.com/blog and https://www.getregular.com/blog/what-your-poop-is-trying-to-tell-you |
| S8 | https://www.getregular.com/sitemap.xml (200); https://www.getregular.com/robots.txt (404) |
| S9 | LinkedIn company page: https://www.linkedin.com/company/get-regular/ (public view) |
| S10 | Web search results for founder, advisor and press, 2026-10-19 (index snippets, not primary pages) |
| S11 | Manhattan Gastroenterology profile: https://www.manhattangastroenterology.com/doctors/dr-michael-schopis-md/ (seen via search) |

> The legal pages live at `/legal/privacy-policy` and `/legal/terms-of-service`. **`/privacy` returns 404.** Link to the `/legal/...` URLs only.

---

## 1. Identity

| Fact | Value | Status / source |
| --- | --- | --- |
| Brand name | Get Regular | VERIFIED S1, S4 |
| App Store name (US) | **Get Regular: AI Gut Health** | VERIFIED S4 |
| App Store subtitle (US) | **Food, Stool & Symptom Tracking** | VERIFIED S5 |
| App Store promotional text | "Finally understand your gut. Log your poop, meals, and symptoms, and uncover the patterns behind your bloating, energy, mood, digestion, and more." | VERIFIED S5 |
| App ID / bundle ID | 6749188690 / `com.getregular.app` | VERIFIED S4 |
| Seller / developer (current) | **Get Regular Health, Inc.** (Apple developer ID 1829153613) | VERIFIED S4 |
| Earlier developer name | Search-engine snapshots still show the listing as "by Athina Vandame", with 11 ratings, age 9+ and 75.8 MB. These are stale; Apple's live data shows Get Regular Health, Inc. | THIRD-PARTY S10 (stale index) |
| Website | https://www.getregular.com (apex `getregular.com` 307-redirects to www) | VERIFIED S1 |
| Contact | hello@getregular.com | VERIFIED S1, S2, S3 |
| Copyright line | © 2025 Get Regular Health, Inc. | VERIFIED S1, S5 |
| HQ / founded / size | New York City, NY; founded 2025; 2–10 employees; 227 LinkedIn followers | THIRD-PARTY S9 (LinkedIn self-reported) |
| Homepage title / meta | "Get Regular — Trust Your Gut Again" / "AI-powered gut health tracking. Analyze your stool, meals, and biomarkers for personalized insights — built with a board-certified gastroenterologist." | VERIFIED S1 |
| Name-collision risk | **getregulars.com** ("Regulars", a Danish hospitality-loyalty SaaS company, Instagram @getregulars) appears in search results for "getregular.com" | VERIFIED S10 |

## 2. Platforms and availability

| Fact | Value | Status / source |
| --- | --- | --- |
| iPhone | Yes. Requires iOS 15.1 or later | VERIFIED S4, S5 |
| iPad | Yes (universal) | VERIFIED S4, S5 |
| Mac / Vision Pro | Runs the iPad app on Apple-silicon Macs and visionOS. The store shows "Designed for iPad. Not verified for macOS." | VERIFIED S5 |
| Android | **No Android app found.** `play.google.com/store/apps/details?id=com.getregular.app` returns 404, Play search finds no Get Regular app, and the site says "Available on iOS". | VERIFIED (absence) 2026-10-19 |
| Web app | None found | VERIFIED (absence) S1 |
| Language | English only | VERIFIED S4, S5 |
| Size | 92.9 MB | VERIFIED S5 |
| Categories | Health & Fitness (primary), Lifestyle | VERIFIED S4 |
| Age rating | Store page: **13+** (contains User-Generated Content, Health or Wellness Topics, Social Media). The lookup API's legacy field shows "4+". The Terms require users to be **at least 13**. | VERIFIED S3, S4, S5 |
| Storefronts checked | US, GB, CA, AU, all live | VERIFIED S4, S6 |
| Homepage App Store link | Points to the **Canadian** storefront: `apps.apple.com/ca/app/get-regular/id6749188690` | VERIFIED S1 |

## 3. Versions and dates

| Fact | Value | Source |
| --- | --- | --- |
| Current version | **2.0.1**, released 18 Aug 2026 (optional calorie tracking, off by default; fix for meals wrongly rejected as "Food not recognized") | VERIFIED S4, S5 |
| Version 1.0 date | 08/21/2025 (version history) | VERIFIED S5 |
| `releaseDate` in lookup API | 2025-11-01 (probably the public availability date; ask the team which date to call the "launch") | VERIFIED S4 / UNVERIFIED meaning |
| Version history | 1.1 (20 Feb 2026) through 1.5 (19 Mar 2026): "We rebuilt Get Regular from the ground up". 1.6 (11 May 2026): Doctor Report, Period Tracking, Recipes. 1.7 (10 Jun): bug fixes including "Apple Health integration". 1.8.1 (13 Jun) and 1.8.2 (27 Jun): onboarding. 2.0.0 (13 Aug): Backlog tab, hydration, toilet time, notes, research consent. 2.0.1 (18 Aug): calorie tracking | VERIFIED S5 |

## 4. Ratings (snapshot only; do not hard-code)

| Storefront | Rating | Count | Source |
| --- | --- | --- | --- |
| US | 4.9 (4.92307) | 13 | VERIFIED S4, S5 |
| CA | 5.0 | 5 | VERIFIED S4 |
| GB | 5.0 | 1 | VERIFIED S4 |

The sample is small. Do not use "highly rated" or a star figure in copy or schema without the date and count.

## 5. Pricing (as listed on the App Store, 2026-10-19)

The app is **free to download, with auto-renewing subscriptions** (VERIFIED S4, S5).

| In-app purchase | US | GB | CA | AU |
| --- | --- | --- | --- | --- |
| Get Regular Monthly | $12.99 | £12.99 | CA$14.99 | A$12.99 |
| Get Regular Founding Yearly | $79.99 | £79.99 | CA$99.99 | A$129.99 |
| Get Regular Yearly | $99.99 | £99.99 | CA$129.99 | A$149.99 |

Notes (VERIFIED S3 unless marked otherwise):
- **Trial:** The Terms say "New subscribers *may be offered* a 7-day free trial." The App Store does not show a trial, so do not promise one. UNVERIFIED: current trial eligibility and length.
- **Premium features named in the Terms:** "Gut Check, Experiments, the Doctor Report, and personalized Recipes."
- **Free tier:** Not documented. UNVERIFIED: what a non-subscriber can use and whether there is a log limit.
- **"Founding Member" rate:** The Terms say the Yearly plan includes "any Founding Member rate where offered." UNVERIFIED: whether it is still on sale and who qualifies.
- **Billing:** Through Apple only. Refunds are handled by Apple, and cancelling keeps access until the end of the current period.
- **AU Monthly:** A$12.99 is lower than the US-dollar figure in nominal terms. That is what Apple displays; confirm with the team if it matters.

## 6. Features

Each feature is listed with where it is documented. The installed build was **not** tested, so wording should follow the source wording.

### 6.1 Logging
| Feature | Detail | Source |
| --- | --- | --- |
| Stool logging, photo | Snap a photo and the AI classifies it on the Bristol Stool Scale | S1, S4, S7 |
| Stool logging, manual | "Manual Bristol Scale entry (no photo required)" | S5 (v1.2+) |
| Stool photo privacy mode | "Enhanced privacy mode for stool photos" | S5 |
| No-go days | Logging a no-bowel-movement day; "No-go days don't break your streaks" | S5 (v1.2+, fixed v1.6) |
| Time on the toilet | Drag slider on stool logs, "averaged and fed into your gut analysis" | S5 (v2.0.0) |
| Meal logging | By photo or text; edit ingredients; one-tap re-log of recent meals; "Food not recognized" fix in 2.0.1 | S5 |
| Backdating | "Log entries up to 7 days in the past" with custom timestamps | S5 |
| Symptoms | "Track meals, symptoms, and lifestyle factors with simple taps" | S4 |
| Drinks / hydration | "10 drink types + custom", daily totals, personalized water goal | S5 (v2.0.0) |
| Supplements and medications | Supplements count toward the nutrition total; medications and supplements can be tracked | S2, S5 |
| Notes | Free-text notes on stool and food entries | S5 (v2.0.0) |
| Period tracking | Log period dates; cycle data is included in the Doctor Report | S5 (v1.6) |
| Calorie tracking | Optional and off by default | S4 (v2.0.1) |
| Apple Health | Release note mentions "Apple Health integration" fixes; profile shows sleep and steps | S5. **UNVERIFIED:** what is read or written |

### 6.2 Scores and insights
| Feature | Detail | Source |
| --- | --- | --- |
| Gut Health Score (daily) | "based on your past 7 days of entries, weighted toward the most recent data" | S2 |
| Nutrition Score (daily) | Daily nutrition score. "See Nutrition Score for foods you're considering" (homepage: "Check your food score first") | S1, S5 |
| Regular Score | "Daily Gut, Nutrition, and Regular Scores." The Backlog shows "your three scores" | S5. **UNVERIFIED:** definition |
| Gut-health streak | "consecutive days in Bristol 3-4 range" | S5 |
| Weekly Digest | "Weekly Digest with personalized AI insights"; "analyzing patterns across your food, stool, and symptom history" | S2, S4, S5 |
| Historical charts / Backlog | Charts with tag filtering; month heatmap of the three scores; highlight by symptom | S5 |
| Full nutrition breakdown | Macros and micronutrients, plus "gut-specific compounds (such as fiber, polyphenols, and prebiotics)" | S1, S2 |

### 6.3 AI features
| Feature | Detail | Source |
| --- | --- | --- |
| **Gut Check** (AI chat) | The privacy policy calls it the "AI health coach (Gut Check)"; the homepage calls it the "Gut Check AI advisor". "Ask what's been driving symptoms or what to eat tomorrow." Has chat history. Premium | S1, S2, S3, S4, S5 |
| Core memories | "Persistent health facts learned from your conversations" (for example intolerances, IBS or PCOS, medications) | S2 |
| **Experiments** | "Self-experiments suggested by the AI coach (e.g., 'try eliminating dairy for a week')", with protocols and daily tracking. Premium | S2, S3, S5 |
| Recommendations | "Data-driven food and supplement suggestions"; "How to improve meal/snack" | S4, S5 |
| Recipes | "Real dishes from world cuisines, personalized to your symptoms and goals." Premium | S3, S5 (v1.6) |

### 6.4 Sharing and export
| Feature | Detail | Source |
| --- | --- | --- |
| **Doctor Report** | "Generate a comprehensive PDF health report to share with your doctor. Includes bowel patterns, Bristol scale tracking, symptom frequency, diet quality analysis, food-symptom correlations, and nutrient patterns." Includes cycle data. Premium | S3, S5 (v1.6) |
| Social | "Invite your TMI friends, share your scores, and see who's most regular"; friends feed with comments and likes; Instagram share cards | S4, S5 |
| Raw data export (CSV) | **Not documented.** UNVERIFIED | — |

### 6.5 Other
Daily reminders at randomized times, logging streaks, an optional newsletter opt-in and a **"Research consent"** option (v2.0.0). UNVERIFIED: what that consent covers.

## 7. Data handling and AI processing (Privacy Policy, last updated 8 June 2026)

All rows are VERIFIED from S2 unless marked.
- **AI provider:** "Your food photos, stool photos, text descriptions, symptoms, medications, supplements, dietary preferences, and chat messages are sent to **OpenAI's API** for analysis."
- **Anonymization claim:** "Only anonymized content is sent for processing — no names, emails, or account identifiers are included." OpenAI "does not use API inputs to train their models." This is a COMPANY CLAIM. "Anonymized" is a strong term for photos and free text, so legal should review the wording.
- **Photos:** "compressed and sent to OpenAI… not permanently stored on our servers — only the analysis results are saved. You may log entries manually if you prefer not to upload images."
- **Infrastructure:** Supabase (authentication, database, storage), with encryption in transit and at rest, row-level security and JWT auth. Sentry handles crash reports ("no health data"), PostHog handles analytics ("does not include health data content") and Apple handles payments.
- **Marketing processors:** Meta and TikTok (ad measurement and attribution), Mailchimp, Kit, Modash, Instantly.ai and ManyChat.
- **Advertising:** "We do not sell, rent, or share your personal or health information with advertisers." Health data is not shared with ad partners. App Tracking Transparency (ATT) permission is requested where required.
- **Deletion:** In-app account deletion; "permanently removed from our systems within 30 days."
- **Rights named:** CCPA/CPRA, Washington My Health My Data Act and GDPR. Data may be transferred to the US. Breach notice within 60 days.
- **Children:** Not intended for users under 13.

**App Store privacy label (S5), as declared by the developer:**
- *Data used to track you:* Identifiers.
- *Data linked to you:* Health & Fitness, **Precise Location**, Contact Info (email, name), User Content (photos or videos) and Sensitive Info. Purposes: Developer's Advertising or Marketing, Analytics, Product Personalization and App Functionality.
- *Data not linked to you:* Device ID (Third-Party Advertising).

**Inconsistencies to resolve (send to the team):**
1. The label declares **Precise Location**, but the privacy policy never mentions location.
2. The label lists **Health under "Analytics"**, while the policy says PostHog "does not include health data content".
3. The label lists Contact Info under "Developer's Advertising or Marketing". That is consistent with the mailing list, but confirm.

## 8. People

| Person | Role | Status / source |
| --- | --- | --- |
| **Athina Vandame** | Founder (LinkedIn profile titled "Athina Vandame - Get Regular"). RocketReach lists her as "Founder and CEO". She is the only listed employee on the company LinkedIn page. Search snippets quote her LinkedIn as building Get Regular "after having resolved my 14 years of chronic constipation" and as a "solo consumer founder". Her Instagram bio reportedly says "cofounder @get.regular". | THIRD-PARTY S9, S10. **Confirm** title, the founder story and whether there is a co-founder |
| Adrianna Atiles | Named as another founder by RocketReach only | THIRD-PARTY S10. **UNVERIFIED; do not publish** |
| **Dr. Michael Schopis, MD** | Homepage: "Board-Certified Gastroenterologist · NY Presbyterian · Weill Cornell · Manhattan Gastroenterology" and "Clinical Advisor, Get Regular". His practice profile describes him as double board-certified (ABIM Internal Medicine and Gastroenterology), with residency and fellowship at Einstein/Montefiore. Healthgrades lists an NYU Langone affiliation (the sources conflict). | Role: COMPANY CLAIM S1. Credentials: THIRD-PARTY S10, S11. **Confirm** scope of work, compensation/disclosure, and approval for his name, quote and photo |

Advisor quote on the homepage (verbatim): *"The app's internal analysis and outputs underwent extensive scrutiny and tweaking to ensure it correctly follows all current major gastroenterology guidelines as it relates to gut health — reliably demonstrating that the app provides users with a convenient, evidence-based interpretation of their personal digestive wellbeing."*

## 9. Social and web presence

| Channel | URL | Status |
| --- | --- | --- |
| TikTok | https://www.tiktok.com/@getregular | Linked from S1. Account exists per search; follower count could not be read |
| Instagram | https://www.instagram.com/get.regular | Linked from S1. Fetch blocked (429); counts unknown |
| LinkedIn | https://www.linkedin.com/company/get-regular/ | Linked from S1: 227 followers, tagline "It's time to start trusting your gut." |
| YouTube | **None found** | Search 2026-10-19 |
| Product Hunt / Crunchbase / AlternativeTo | **Not found in search.** Direct URL checks returned 403, so this is inconclusive | Check manually |
| Wikidata / Wikipedia | No item found (API rate-limited); no article | — |
| Press / independent reviews | **None found.** Search finds only the App Store, getregular.com and a small creator (@guthealthgirlie0) on TikTok | S10 |
| Blog | 1 post: "What Your Poop Is Trying to Tell You", dated **October 20, 2026** (one day in the future relative to observation), byline "Get Regular Team", BlogPosting JSON-LD | S7 |

## 10. Homepage claims that need evidence (verbatim, S1)

| # | Claim (quoted) | Issue / what is needed |
| --- | --- | --- |
| C1 | "AI-Powered · **Clinically Validated** · Available on iOS" | No validation study, protocol or publication found. An advisor review is not clinical validation. **Remove the claim, or link a study** (population, method, outcomes, date). This is a high regulatory and accuracy risk. |
| C2 | "Get Regular analyzes your stool, meals, symptoms and **biomarkers**…" (also in the meta description) | No biomarker inputs (labs, tests) are documented in the app or policy. Define what "biomarkers" means or drop it. |
| C3 | "**40%** of people worldwide struggle with gut health issues." | Probably refers to the Rome Foundation Global Study (Sperber et al., *Gastroenterology* 2021: over 40% of people worldwide meet criteria for a disorder of gut-brain interaction). It needs a visible citation and accurate wording ("disorders of gut-brain interaction", not "gut health issues"). |
| C4 | "**$3,000+** what the average gut health sufferer spends per year on supplements, tests, and appointments before finding real answers." | No source found. Cite it or remove it. |
| C5 | "**3 years** the average time it takes someone with a gut disorder to get a correct diagnosis." | No source given. Diagnostic delay varies by condition; needs a specific citation. |
| C6 | "Built with a gastroenterologist, not just an algorithm." / "Developed with a board-certified gastroenterologist" | Document the advisor's role (what he reviewed, when, how) on a methodology page. |
| C7 | "AI cross-references everything against clinical GI guidance to find your patterns." | Name the guidance (for example Bristol Stool Form Scale; ACG/AGA/Rome IV references) on the methodology page. |
| C8 | "Photo your food, stool, and **symptoms**. Ten seconds, done." | Symptoms are logged by tap, not photo. Reword. |
| C9 | "Your daily Gut and Nutrition scores update **in real time** with every input." | The policy describes the Gut Health Score as a weighted 7-day score. Confirm the update behaviour. |
| C10 | "**Personalized dietary and supplement recommendations**…" | Supplement advice is a sensitive health claim. State its limits and that it is not medical advice. |
| C11 | "**Thousands of people** are already tracking, learning, and feeling better." | No count is published. Third-party snippet: a founder LinkedIn post said "1k users in 5 months… doubled". Give a dated number or soften the wording. "Feeling better" is an outcome claim. |
| C12 | Testimonials ("— Midwife", "— App user") | Keep permission records. FTC endorsement rules apply (typicality, material connections). |
| C13 | App Store: "AI-powered stool analysis grounded in clinical standards"; "Built with gastroenterology expertise"; "what may be causing your symptoms" | Causal phrasing. Prefer "patterns associated with". |

## 11. UNVERIFIED: confirm with the team

1. Is a 7-day free trial currently offered, to whom, and on which plans? Is the "Founding Yearly" plan still sold?
2. What does the free tier include (logging, scores, Weekly Digest)? What exactly is premium?
3. What is the official launch date: 21 Aug 2025 (v1.0) or 1 Nov 2025 (lookup `releaseDate`)?
4. How is the "Regular Score" defined, and how is the Nutrition Score computed?
5. What does Apple Health integration read or write?
6. Is there CSV/raw export, or only the PDF Doctor Report?
7. Which OpenAI models and data-retention settings are used (zero data retention?). Is "anonymized" accurate for images and free text?
8. Why does the privacy label declare precise location, and why is Health listed under Analytics?
9. Founder title(s), the founder story ("14 years of chronic constipation") and any co-founder (Adrianna Atiles?): which can be published?
10. Dr. Schopis: exact role, what he reviewed and when, compensation or equity disclosure, and approval for name, photo and quote reuse on other pages and in schema.
11. Evidence for "Clinically Validated", "40%", "$3,000+", "3 years" and "Thousands of people".
12. User count and markets (US-first? CA?). Why does the homepage link to the CA storefront?
13. Any Android or web plans (affects "iOS only" wording)?
14. Official social handles to list as `sameAs`, including whether a YouTube channel exists or is planned.
15. What does "Research consent" (v2.0.0) cover? It is needed before publishing any aggregate "original data".
16. Should the blog post date be corrected from 20 Oct 2026, and the byline given a named author or reviewer?

## 12. Approved entity descriptions (draft; needs team sign-off)

Use these word for word across the website (About / `/app`), App Store promotional text, social bios, directory listings, press kit and the `description` in Organization/MobileApplication schema. They contain only VERIFIED facts. Items marked [confirm] need sign-off.

**40 words**
> Get Regular is an iOS gut-health tracking app from Get Regular Health, Inc. Log meals, bowel movements (Bristol Stool Scale, photo or manual) and symptoms to see daily Gut Health and Nutrition Scores, weekly AI pattern insights and doctor-ready reports.

**120 words**
> Get Regular is a gut-health tracking app for iPhone and iPad, made by Get Regular Health, Inc. in New York [confirm city]. You log meals by photo or text, bowel movements on the Bristol Stool Scale (from a photo or by manual entry, no photo required) and digestive symptoms. The app turns these logs into daily Gut Health and Nutrition Scores and a Weekly Digest of patterns. With a subscription you get Gut Check, an AI chat that answers questions using your own history, plus guided food experiments and a PDF Doctor Report to share with your clinician. Get Regular was built with input from a board-certified gastroenterologist [confirm wording]. It supports wellness tracking and does not diagnose or treat any condition.

**One-line descriptor** (for directory "tagline" fields, at most 60 characters)
> Food, stool & symptom tracker with AI gut insights (iOS)

**Naming rules**
- Brand: "Get Regular", two words, capital G and R. Never "GetRegular" or "Get Regular app" as a name; use "the Get Regular app" in prose.
- AI chat: "Gut Check". Weekly summary: "Weekly Digest". Scores: "Gut Health Score" and "Nutrition Score".
- Company: "Get Regular Health, Inc."
- Say "iOS (iPhone and iPad)". Never imply Android.
- Do not use "clinically validated", "diagnose", "detect disease", "cure" or "FDA" anywhere unless legal and clinical review approve it.
