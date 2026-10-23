# Get Regular: organic growth plan (SEO, GEO/AEO, ASO, Apple Ads)

Prepared 2026-10-23 · US market · covers Nov 2026 to Apr 2027

## TL;DR

1. **Get Regular is currently missing from every surface that decides app recommendations.**
   - It doesn't appear in any of 20 non-brand gut-health searches or in any of 17 "best app" listicles.
   - It has 5 URLs in its sitemap and 13 US ratings.
   - Its App Store title and subtitle never mention "poop", "IBS", "bloating" or "constipation".
   - On Google, "getregular" also collides with a Danish company, Regulars (getregulars.com).
2. **For an app, the highest-leverage AI-visibility asset is the App Store listing, not the blog.** In AppTweak's study of 125k ChatGPT recommendation answers (US, May 2026), apps.apple.com was the most-cited source at 37.6%. App store listings overall made up 47.5%. Bowelle shows the effect: 5 URLs on its own site, yet it sits near the top of "best IBS tracking app" results and appears in 7 of 17 listicles.
3. **Pick one sharply defined niche and own it.** AI favours apps tied to a narrow, defensible intent (AppTweak calls this the Tiimo/Google Translate pattern). The niche that fits Get Regular's product and its name is: **AI stool tracking + regularity + food triggers, for people with constipation, bloating and IBS symptoms, built with a GI doctor.** Don't chase FODMAP (Monash has 345 pages), the microbiome (ZOE has 100+) or gut-brain therapy (Nerva has 100+ IBS pages).
4. **Content gap:** stool-literacy pages are the gap closest to the product. PoopCheck (about 40 pages) and Throne (about 70) run hubs for the Bristol chart, each Bristol type, each stool color and "why is my poop X"; Get Regular has one 395-word post. Throne, a brand, ranks #2 for "what does your poop color mean".
5. **Programmatic SEO: yes, but narrowly.** Three templates with real data and a doctor's review:
   - stool atlas (about 25 pages)
   - app comparisons and alternatives (about 15 pages)
   - a 25-page food pilot, scaled only if it indexes and engages
   
   Google now explicitly calls one-page-per-query-variation "scaled content abuse" ([Google, Jul 2026](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)).
6. **Parasite SEO in the Charles Floate sense: no.** Placing rank-bait pages on other high-authority domains violates Google's site reputation abuse policy, which has applied regardless of first-party involvement since Nov 2024. In a health category it also endangers the brand. Do instead **earned distribution on the platforms AI actually cites**:
   - YouTube and Reddit led by Dr. Schopis
   - real listicle inclusion
   - App Store reviews
   - an original data report
7. **ASO + Apple Ads:**
   - Rename to `Get Regular: Poop & Gut Health` / `AI Stool Scan, IBS & Food Log`.
   - Rewrite the description in AI-readable form.
   - Build 4 keyword-assigned custom product pages.
   - Fix the privacy label (it currently declares tracking).
   - Get to 150+ ratings.
   - Run Apple Ads on exact-match stool, IBS and gut terms, with blended CPI at or under $3–4 until trial-to-paid data exists.

Supporting files in this folder:

| File | What it is |
|---|---|
| `research/competitor-url-keywords.csv` | 2,885 competitor URLs with inferred keyword, cluster, page type and intent |
| `research/sitemap-url-counts.csv` | Sitemap sizes per domain |
| `research/content-roadmap-6-months.csv` | Page-by-page plan |
| `app-store/ASO-and-Apple-Ads.md` | Full ASO and Apple Ads plan |
| `site-drop-in/` | robots.txt, llms.txt, schema, technical fix list |
| `scripts/` | Sitemap crawler and keyword inference, so the analysis can be re-run monthly |

---

## 1. Baseline: where Get Regular stands

| Surface | Today | Source |
|---|---|---|
| Website | 5 URLs in sitemap: home, /blog, 1 article, 2 legal pages. No robots.txt. Canonicals point to the apex domain while the site 307-redirects to www. No canonical on home or /blog. No Organization or App schema. Article author is "Get Regular Team" with no medical reviewer. | Live crawl 2026-10-23 |
| Google / AI retrieval | Absent from 20 non-brand queries and 17 listicles. Brand query "getregular" shows Regulars (getregulars.com) at positions 1–4. | Web search proxy, 2026-10-23 |
| Third-party mentions | None found (press, Product Hunt, Reddit, review sites) | Same |
| App Store | 4.92★ from 13 US ratings. Title `Get Regular: AI Gut Health`, subtitle `Food, Stool & Symptom Tracking`. Proxy ranks: "gut health" #19, "bristol stool" #13, "stool analysis" #23; not ranked for poop, IBS, bloating or constipation. | iTunes Lookup / Search API |
| Trust | The privacy label declares "Data Used to Track You: Identifiers" and Precise Location. The home page says "Clinically Validated" with no linked evidence. | apps.apple.com, getregular.com |

**Measurement caveat:** I had no ChatGPT, Perplexity or Ahrefs API access. SERP data comes from a web-search proxy, and App Store ranks from the iTunes Search API, so neither is the live ranking. Month 1 includes setting up real tracking (§9).

## 2. How AI decides which apps to recommend, and what we're betting on

**From the AppTweak playbook** (125k ChatGPT responses, 9,489 app prompts, US, May 2026):
- An LLM makes two decisions:
  - which apps fit the intent, based on positioning consistency across surfaces
  - which sources it trusts as evidence, such as store listings, the brand's own site, reviews, Reddit, comparison pages and listicles
- A query "fans out" into sub-intents, such as triggers, a specific condition, comparisons and audience.
- Citations by source:
  - App Store 37.6%, Google Play 9.5%
  - other web 27%, mostly brand-owned product and support pages plus aggregators
  - no source at all 22.6%, meaning the answer came from training memory
- Source backing falls off below position 5: 84.5% of position-1 recommendations cite a source vs 24.5% at position 8. A newcomer can displace weakly backed apps.

**From Ahrefs**, verified against primary posts. These are correlational, they are not health-specific, and most use Ahrefs' own tool:

| Finding | What we do with it |
|---|---|
| "Best X" listicles are 43.8% of the page types ChatGPT cites for commercial "best" prompts ([Dec 2025](https://ahrefs.com/blog/best-lists-research/)) | Get Get Regular into third-party listicles. Publish one honest listicle of our own that includes rivals. |
| ChatGPT's top citations: Wikipedia 29.7%, homepages 23.8%, app stores 6.6% ([Oct 2025](https://ahrefs.com/blog/chatgpts-most-cited-pages/)). The thread's "67% non-influenceable" figure is wrong: these three add up to 60.1%. | Homepage and App Store listing are ours to control, so they come first. Wikipedia: no; Get Regular isn't notable yet, and writing your own article breaks Wikipedia's conflict-of-interest rules. |
| 28.3% of ChatGPT's most-cited pages have no Google organic keywords | AI visibility is partly separate from ranking, so a Reddit, YouTube and App Store presence can win even before SEO matures. |
| ChatGPT cites about 50% of the URLs it retrieves; Reddit is retrieved heavily but cited about 2% of the time ([Apr 2026](https://ahrefs.com/blog/why-chatgpt-cites-pages/)) | Reddit shapes the answer more than it earns the citation. Participate for influence, not for links. |
| Adding schema: no measurable citation lift ([May 2026](https://ahrefs.com/blog/schema-ai-citations/)) | Ship schema as hygiene (about 1 hour). It is not a KPI. |
| YouTube mentions have the strongest correlation with AI brand visibility, ρ≈0.737 ([Dec 2025](https://ahrefs.com/blog/ai-brand-visibility-correlations/)) | Correlation only, since brand size drives both. YouTube is still the cheapest place to get a GI doctor's face and words indexed. |
| AI Overviews cut desktop CTR for #1 by about 58% ([Feb 2026](https://ahrefs.com/blog/ai-overviews-reduce-clicks-update/)). 99.9% of AIO-triggering keywords are informational, but only about 21% of informational keywords trigger an AIO ([Nov 2025](https://ahrefs.com/blog/ai-overview-triggers/)). | Informational stool and constipation content will earn fewer clicks per ranking. Judge it on AI citations, branded search and installs, not on sessions. |

**Google's position** ([AI optimization guide, updated 2026-07-10](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)):
- Optimizing for generative AI search is "still SEO."
- You don't need llms.txt or special markup.
- Pages built for each query variation "violate Google's scaled content abuse spam policy."
- "Seeking inauthentic 'mentions'… isn't as helpful as it might seem."
- For health content: "trust is most important", and content must be "consistent with established expert consensus" ([helpful content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)).

**Where AppTweak, Ahrefs and the Charles Floate thread agree:** corroboration. One consistent description of the app, repeated across many independent, trusted sources, wins. So the plan starts with **one positioning sentence, used everywhere**: website, App Store, llms page, press, Reddit bio, YouTube channel description, founder and doctor bios:

> **Get Regular is an AI gut health app for adults with bloating, constipation or IBS symptoms. It analyzes your stool photos (Bristol Stool Scale), meals and symptoms together to find your personal triggers, and was built with board-certified gastroenterologist Dr. Michael Schopis.**

## 3. Competitors: who Google and AI surface, and their sitemaps

**How these were chosen:**
- Competitors were ranked on three things:
  - how often they appear in 17 "best X app" listicles
  - SERP slots across 20 intent queries
  - App Store relevance
- Then sitemaps were pulled for 16 domains. "Inferred keyword" = the URL slug minus stop-words, mapped to a topic cluster and page type (method in `scripts/infer.py`; output in `research/competitor-url-keywords.csv`).

**The top 5 for Get Regular's intents:**

| # | Competitor | Why it's top 5 | Sitemap | How it wins |
|---|---|---|---|---|
| 1 | **Cara Care** (Bayer) | In 13/17 listicles. #1 on both independent lists (Healthline, MyGoodGut, Sep 2026). 4,667 App Store ratings. | 295 URLs, but only 47 English (the rest German) | Brand age, listicle presence, App Store reviews, "alternatives" pages written by others |
| 2 | **mySymptoms** | In 9/17 listicles. Its Play page ranks #1 for "best gut health app". 4,050 ratings. | 529 URLs, mostly support Q&A (`/question/`, `/dwqa-answer/`) | Long tenure, clinician pages, App Store listing |
| 3 | **Bowelle** | In 7/17 listicles with an average position of 2.7. Ranks for "best IBS tracking app" and "IBS food diary". 2,248 ratings. | **5 URLs** | App Store listing plus third-party listicles. Proof that owned content isn't required for AI visibility. |
| 4 | **Plop** | Its domain ranks in 4/20 SERPs (gut health app, poop tracker, constipation, gastroenterologist-recommended). 1,503 ratings. | 108 URLs (18 pages × 6 languages) | Topic pages (/constipation/, /stool-color/, /fodmap-diet/) translated into 6 languages |
| 5 | **PoopCheck** | Owns "AI stool analysis app" with 5 of 9 results. The most direct feature rival. Only 36 ratings. | 118 URLs | Programmatic `/bristol/type-1…7/`, 10 `/compare/<rival>/` pages, color, baby-poop and FODMAP charts, a quiz, a browser demo, about 70 blog posts. Blocks GPTBot, OAI-SearchBot and ClaudeBot in robots.txt. |

**Content benchmarks.** These aren't the top-5 rivals, but they show the format that works:
- **Throne** (149 URLs; an AI toilet-camera stool analyzer):
  - one page per Bristol type and per stool color, plus a "why is my poop…" series
  - use-case pages: /pages/ibs, /constipation, /ibd
  - a page titled "How accurate is Throne? We compared our AI with five gastroenterologists"
  - ranks #2 for poop color
- **Balloon** (94): 22 constipation pages, /tools/, /knowledge-base/, /changelog/, self-ranking listicles.
- **Nerva** (1,163, multi-region):
  - 100 IBS pages, /compare/, /llms
  - location and clinician-directory pages (programmatic)
  - reports and research
- **ZOE** (1,340): 285 gut-related /learn pages, comparisons against MyFitnessPal and Cronometer.
- **Monash FODMAP** (621): 212 recipes and 336 blog posts. The FODMAP authority.
- **Dieta** (76): clinical validation, studies with Cedars-Sinai, but a messy site. The Dieta App Store listing now shows Vivante Health and 3 ratings.

**Apple's own view of the competitive set:** the "You Might Also Like" row on Get Regular's page shows TON AI, FlareCare, Tract, Unbloated, Bellyweather, Aloe and GERDBuddy. Use these as Apple Ads competitor and product-page targets.

## 4. Gap analysis

Topic coverage by number of URLs. **GR** = Get Regular.

| Topic | GR | PoopCheck | Balloon | Throne | Plop | Cara (EN) | Nerva | ZOE | Monash |
|---|---|---|---|---|---|---|---|---|---|
| Bristol chart + type pages | 1* | 11 | 1 | 8 | 1 | 0 | 0 | 0 | 0 |
| Stool color / shape / smell / float / mucus | 0 | 30 | 10 | ~60 | 3 | 5 | 1 | 10 | 0 |
| Constipation & regularity | 0 | 4 | 22 | 2† | 1 | 3 | 3 | 2 | 6 |
| Bloating & gas | 0 | 1 | 9 | 0 | 0 | 0 | 3 | 4 | 5 |
| IBS | 0 | 1 | 0 | 5 | 1 | 5 | 100 | 3 | 77 |
| FODMAP | 0 | 2 | 2 | 0 | 1 | 0 | 10 | 2 | 345 |
| Microbiome / probiotics / supplements | 0 | 16 | 6 | 0 | 2 | 0 | 1 | 103 | 9 |
| App vs app / alternatives / best-of | 0 | 11 | 2 | 0 | 0 | 0 | 5 | 5 | 3 |
| Tools / quizzes | 0 | 2 | 5 | 1 | 0 | 0 | 5 | 2 | 0 |
| Trust: research, validation, medical review, changelog, LLM page (hand count) | 0 | 2 | 7 | 3 | 0 | 0 | 15+ | 5 | 5 |

\*The existing post covers the Bristol scale, but its slug doesn't target it. †Throne has about 10 more constipation-intent posts ("haven't pooped in a week", "why is my poop so hard"); the classifier counts them as stool pages.

Counts come from classifying URL slugs (`scripts/infer.py`), so read them as ± a few. Cara counts English pages only.

**What the gaps mean, in priority order:**

1. **Stool literacy is the gap closest to the product.** Get Regular's core feature is stool photo → Bristol type, and the SERPs here are winnable by brands: Throne is #2, PLNKTN #7 for "bristol stool chart", Ubie holds 3 slots. Every one of these pages has a natural "log it for 7 days" CTA.
2. **Regularity and constipation match the brand name.** "Get Regular" is literally the outcome people search for. Balloon, with only 1,134 ratings, already proves the cluster works.
3. **There is no commercial layer.** Get Regular has no comparison, alternatives or listicle pages, which are exactly the formats AI cites for "best app" prompts. PoopCheck runs 10 comparison pages; Get Regular has none.
4. **There are no trust or entity pages.** Get Regular has a real gastroenterologist and no page about him, no explanation of how the AI works, no changelog and no LLM fact page. Throne's "we compared our AI with five gastroenterologists" page is the model.
5. **There are no tools.** A Bristol quiz or photo demo is the linkable asset in this niche (PoopCheck has /demo and a quiz; Balloon has /tools).
6. **Deliberately not chasing:** FODMAP food data (Monash's licensed data), general microbiome science (ZOE), gut-brain therapy (Nerva), German-language content (Cara). Link to them where it helps the reader instead of competing.

## 5. Programmatic SEO: verdict and templates

**Verdict: yes, with three templates. Each template needs unique data per page plus medical review; otherwise it is scaled content abuse.**

| Template | Pages | Per-page unique value | Gate before scaling |
|---|---|---|---|
| **Stool atlas**: `/stool/bristol-type-{1-7}`, `/stool/{color}-poop`, `/stool/{shape/texture}` | ~25 | Causes, what to try, red-flag box, GI-doctor note, link to the in-app scan | None. Small, fixed set, high intent; competitors prove the format |
| **Comparisons & alternatives**: `/compare/get-regular-vs-{app}`, `/alternatives/{app}-alternatives` | ~15 | Verified feature table, prices with a "last verified" date, "pick X if / pick Get Regular if", sources | Facts re-verified quarterly; never disparage |
| **Food → gut pages**: `/foods/{food}` ("does coffee make you poop", "does banana cause constipation") | Pilot 25 → up to 100 | USDA FoodData Central fiber per serving; FODMAP status *cited* to Monash, not copied (it's licensed data); typical gut effect with sources; Get Regular food score; "test it with an experiment" CTA | ≥70% indexed within 6 weeks and engagement at or above the blog median. Otherwise stop at 25. |

**Don't build:**
- city or "near me" pages (Get Regular doesn't provide local care)
- food × symptom or symptom × condition combinations
- one page per prompt variation
- AI-written pages published without review

Google names the last two explicitly ([AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [gen-AI content guidance](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content)), and health pages are held to the YMYL standard.

## 6. Parasite SEO: verdict and what to do instead

**Verdict: don't do "parasite SEO" as Charles Floate describes it.** Paying or arranging placement of keyword-targeted pages on high-authority hosts so they rank on the host's authority is what Google's **site reputation abuse** policy prohibits:
- The policy applies "regardless of whether there is first-party involvement" ([Google, Nov 2024](https://developers.google.com/search/blog/2024/11/site-reputation-abuse)).
- It is still enforced with demotions in the US. The Aug 2026 change softened it only in the EEA ([Google](https://developers.google.com/search/blog/2026/08/update-site-reputation-policy)).
- Press releases stuffed with optimized anchor text count as link spam ([spam policies](https://developers.google.com/search/docs/essentials/spam-policies)).
- For a health brand, the downside is bigger than lost rankings. It also means lost trust with doctors, journalists and Apple review.

**What to keep from Floate's list:** be present on the platforms AI grounds on, under your own name, with genuine value. Google says this is fine: bylined columns, user-generated content in forums, disclosed advertorials, and wire services judged on their merits.

| Channel | What to do | Why |
|---|---|---|
| **YouTube** (own channel) + reuse on TikTok and Reels | Dr. Schopis series: "GI doctor explains the Bristol chart", "Is green poop bad?", "What I tell constipated patients". Match each video to a stool-atlas page and embed it there. | Strongest AI-visibility correlate (ρ≈0.74); video transcripts are indexed. The TikTok account already exists. |
| **Reddit** | Follow Reddit's official brand playbook: disclose who you are, comment before posting, never "outright recommend your brand", and ask moderators via ModMail first. Run one AMA with Dr. Schopis during IBS Awareness Month (April 2027). Watch r/IBS, r/Constipation, r/SIBO, r/GutHealth, r/Ozempic and r/Celiac with Reddit Pro (free). | AI retrieves Reddit constantly, which shapes how it describes apps. A smaller app can show up next to bigger ones. Reddit's rules ban inauthentic promotion. |
| **Medium / LinkedIn / Substack** | Dr. Schopis's bylined column, for example "Notes from a GI clinic". Canonicalize back to getregular.com when cross-posting. | Legitimate bylined columns; builds the doctor's own entity |
| **Listicle inclusion** | Pitch independent lists: Healthline's 2020 list is stale (an update pitch), MyGoodGut (Sep 2026), health publishers. Also ask vendor lists that already include rivals (Balloon lists Plop and Bowelle; Dookie Deluxe; Triggerbites). Offer a free test account and a one-line positioning sentence. | "Best X" pages dominate AI citations for app prompts. Bowelle shows that inclusion beats owning content. |
| **Directories & profiles** | Product Hunt launch; AlternativeTo, SaaSHub; Crunchbase, LinkedIn, Tracxn and CB Insights profiles; Dr. Schopis's Doximity and practice bio linking to Get Regular | About 30 consistent, corroborating sources (Floate's "entity stacking"); these profiles already rank for "Cara Care alternatives" |
| **Press** | Two real news moments: (1) the "State of America's Gut" survey report (M5); (2) a validation write-up comparing the AI to GI-doctor ratings, if and when the data exists. Use a wire service for distribution, not for links. | Use the data as information gain; journalists and AI cite original statistics |

## 7. GEO / AEO plan: the AppTweak loop applied

The loop is Audit → Benchmark → Prioritize → Optimize → Measure.

**Prioritized intent clusters.** Own the first four; be present in the rest.

| Priority | Intent cluster | Example prompts |
|---|---|---|
| P1 | AI stool analysis | "app that analyzes poop photos", "AI poop scanner app", "app that tells my Bristol type from a photo" |
| P1 | Regularity / constipation tracking | "best app to track bowel movements", "app to help with constipation", "how do I track how often I poop" |
| P1 | Bloating & food triggers | "app to find which foods make me bloated", "best food and symptom tracker for bloating" |
| P1 | IBS tracking before a GI visit | "best IBS tracking app", "what should I track before my gastroenterologist appointment", "IBS-C tracker app" |
| P2 | Gut health app, general | "best gut health app", "gut health app recommended by gastroenterologist" |
| P2 | Comparison / alternatives | "Cara Care alternatives", "Balloon vs Plop", "apps like ZOE for digestion" |
| P2 | Brand | "what is Get Regular", "is Get Regular legit", "Get Regular reviews" |
| P3 | Life-stage / GLP-1 | "app to track Ozempic constipation", "postpartum constipation tracker", "period poops tracker" |

**What to change on each surface:**
- **App Store** (the largest cited source): the new title, subtitle and description in Q&A form, the four keyword-assigned CPPs, reviews that name use cases, release notes that name features. Details are in `app-store/ASO-and-Apple-Ads.md`.
- **Owned web:**
  - `/about/ai-info` (plain facts; Nerva's `/llms` and AppTweak's `/llm-and-ai-info` are the models) plus `llms.txt` (cheap, effect unproven)
  - `/how-it-works/ai-stool-analysis`, `/about/medical-review`, `/changelog`
  - `/for/{ibs, ibs-c, constipation, glp-1, celiac}` use-case pages
  - the stool atlas, the comparison pages and an honest "best poop tracker apps" page
- **Page format:**
  - Answer the question in the first 2 sentences under each heading.
  - One idea per section, with tables for comparisons.
  - A named author, "Medically reviewed by Michael Schopis, MD", and a last-updated date.
  - This is Floate's consensus approach plus information gain: match what already ranks, then add something new — the doctor's clinical note, Get Regular's aggregate patterns once the sample is large enough and consented, or a printable log.
- **External sources:** see §6.

## 8. ASO + Apple Ads (summary; full detail in `app-store/ASO-and-Apple-Ads.md`)

- **Metadata:**
  - Title `Get Regular: Poop & Gut Health`
  - Subtitle `AI Stool Scan, IBS & Food Log`
  - Keywords `tracker,bloating,constipation,bristol,bowel,movement,digestion,symptom,diary,fodmap,diarrhea,trigger`
  - All three are within Apple's limits. Check each term's Apple Ads popularity score before shipping.
- **Description:** rewrite in AppTweak's structure: "[App] is a [type] that helps [audience] [goal] by [capabilities]", 4 use cases, features tied to outcomes, questions ("Can Get Regular help with IBS?", "Do I have to photograph my poop?") and specific trust details (Dr. Schopis by name, real privacy facts).
- **Custom product pages:** four, with keywords assigned — AI poop scanner, IBS & bloating triggers, constipation, gut health score. Reuse them as Apple Ads ad variations.
- **Trust fixes:**
  - Audit the privacy label, which declares "Data Used to Track You".
  - Back up or soften "Clinically Validated".
  - Declare regulated-medical-device status before early 2027, or updates get blocked ([Apple](https://developer.apple.com/news/?id=nyqbfz1y)).
- **Reviews:** go from 13 to 150+ US ratings using `requestReview` after value moments (first weekly digest, a better score week over week, a Doctor Report), never during onboarding or at the paywall. Reply to every review under 5★.
- **Apple Ads:**
  - Campaigns: Brand, Category (stool / IBS-bloating / gut health), Competitor, Discovery (or Maximize Conversions).
  - Start at $50–100/day, with CPT bids of about $1.25–3.50.
  - US Health & Fitness benchmark: CPT ≈ $1.64–1.68 and CPI ≈ $3.0–3.8 (AppTweak / Adapty 2026).
  - Ceiling: blended CPI ≤ $3–4. Derivation: about $4.25 first-year value per install = $99.99 × 0.85 × an assumed 5% install-to-paid. Re-derive from real data after 4 weeks.
  - Hold Today-tab and product-page ads until 100+ ratings.

## 9. Measurement

| Layer | KPI | How |
|---|---|---|
| AI visibility | Share of prompts where Get Regular is mentioned, average position, sources cited | **Prompt panel:** about 40 prompts across the 8 clusters in §7. Run them weekly in ChatGPT (search on), Perplexity, Gemini and Google AI Mode, 3 runs each, logging mention, position and cited URLs. Answers change every ~2 days (Ahrefs), so read trends over 4+ weeks. Paid option: AppTweak AI Visibility for Apps — this is their playbook, and it tracks real app IDs. |
| AI referrals | Sessions from chatgpt.com, perplexity.ai, gemini, copilot; App Store "Web Referrer" installs | GA4 source/medium; App Store Connect → Analytics → Sources → Web Referrer |
| SEO | Indexed pages, non-brand impressions and clicks, top-10 keywords per cluster, AI Overview appearances | Google Search Console (including its generative-AI reporting, where available), Bing Webmaster Tools |
| ASO | Keyword ranks (poop tracker, stool analysis, bristol stool, ibs tracker, bloating, constipation, gut health), conversion rate, ratings count | ASO tool or manual on-device checks, App Store Connect |
| Apple Ads | TTR, CR, CPT, CPI, cost per trial, cost per paid user, Search Match term mining | Apple Ads plus MMP or RevenueCat cohort data |
| Business | Installs → trial → paid by source; branded search volume (Apple Ads popularity, GSC brand impressions) | The incrementality check: does branded search rise as AI mentions rise? |

**6-month targets.** These are targets, not forecasts; revise them after the M1 baseline.

| Area | Target |
|---|---|
| Owned site | 75+ quality pages indexed |
| Google | Top-10 positions for at least 10 stool and constipation keywords |
| AI visibility | Mentioned in 15–25% of P1 panel prompts in at least one AI engine |
| Listicles | Included in 3+ third-party listicles |
| App Store ratings | 150+ US ratings |
| App Store ranks | Top-10 proxy rank for "poop tracker" and "stool analysis" |
| Apple Ads | Blended CPI at or under break-even |

## 10. Six-month roadmap

Page-by-page detail with target keyword, intent, competitor coverage and information-gain angle is in `research/content-roadmap-6-months.csv`.

| Month | Theme | Ships |
|---|---|---|
| **M1 · Nov 2026** | Foundation | Technical fix list (`site-drop-in/README.md`); robots, llms, schema; `/about/ai-info`, `/about/medical-review`, `/how-it-works/ai-stool-analysis`; Bristol chart hub + 7 type pages; **App Store metadata + description + privacy label fix**; review prompts; Apple Ads Brand + Category; prompt-panel baseline; Product Hunt and directory profiles; YouTube channel with 4 Dr. Schopis shorts |
| **M2 · Dec 2026** | Stool atlas + commercial layer | Poop color hub + 9 color pages; "how often should you poop"; 5 `/compare/` pages (Cara Care, mySymptoms, Bowelle, Plop, PoopCheck); honest "best poop tracker apps"; holiday/travel constipation; 4 keyword-assigned CPPs; listicle outreach wave 1 |
| **M3 · Jan 2027** | New-year "gut reset"; regularity | 8 constipation pages; 5 `/for/` use-case pages; Bristol quiz tool; 25-page food pilot; "January Gut Reset" In-App Event; Apple Ads Discovery + Competitor |
| **M4 · Feb 2027** | Bloating & triggers | 8 bloating and trigger pages; 3 alternatives pages; honest "best gut health apps"; food pages +25 if the pilot passes; Reddit listening → first disclosed participation |
| **M5 · Mar 2027** | Colorectal Cancer Awareness Month | 5 red-flag pages under strict medical review (blood, mucus, pencil-thin, FIT vs colonoscopy); **State of America's Gut report** (n≈1,000 US survey, ~$1–3k panel cost, assumed) plus press release and distribution; float and undigested-food pages; food pages +50 if gated metrics hold |
| **M6 · Apr 2027** | IBS Awareness Month | 8 IBS pages written from a tracking angle; Reddit AMA with Dr. Schopis; more comparison pages; "IBS Awareness Month" In-App Event; 6-month review against §9 targets |

**Capacity:** about 75 editorial pages over 6 months is roughly 3 a week. That takes one writer (AI-assisted drafts are fine), about 2 hours a week of Dr. Schopis's review time, and about 1 day a month of developer time for templates and tools. If capacity is lower, cut in this order: food pages, then P3 life-stage pages, then lower-priority color pages. Don't cut M1 or the comparison layer.

## 11. Risks and compliance

- **YMYL:** every health page gets a named author, medical review and a visible review date. Use AI to draft but never publish unreviewed; Google's raters give the Lowest rating to pages that are mostly AI-generated with little added value.
- **Claims:** "Clinically Validated", any accuracy figure, and any "diagnose" language need evidence. That matters for the FTC, for Apple's medical-device declaration, and because AI repeats whatever it reads.
- **Privacy:** don't claim "private" or "no tracking" until the App Store privacy label supports it.
- **Comparison pages:** use only verifiable facts, dated. Never use competitor names in the App Store keyword field.
- **Reddit:** follow Reddit's rules and each subreddit's rules, always disclose, and never astroturf. Reddit Rule 2 forbids content manipulation.

## 12. What would change this plan

- **The prompt-panel baseline shows Get Regular already appearing** for a P1 cluster → shift budget from owned content to reviews and listicle inclusion for that cluster.
- **Apple Ads search-term data shows "poop" terms with low popularity** → switch to metadata option B, or move "IBS" into the title.
- **The food pilot fails its index or engagement gate** → stop at 25 pages and move that capacity to video.
- **A real validation study becomes available** (AI vs gastroenterologist ratings) → make it the centrepiece of PR and the trust pages. It is the strongest information-gain asset in this category (Throne and Dieta lead with theirs).
- **Trial-to-paid comes in well below 5%** → lower the Apple Ads CPI ceiling and lean harder on organic.

## Sources

**Studies, guidance and policy**
- AppTweak, *The AI visibility playbook for apps and games* (PDF, 2026), US data May 2026
- Ahrefs studies: listed inline in §2
- Google: [AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) · [Spam policies](https://developers.google.com/search/docs/essentials/spam-policies) · [Site reputation abuse update, Nov 2024](https://developers.google.com/search/blog/2024/11/site-reputation-abuse) · [Search Central updates](https://developers.google.com/search/updates) (FAQ rich results retired May 7, 2026; llms.txt note Jun 15, 2026)
- Apple: [App Store search](https://developer.apple.com/app-store/search/) · [Medical device status](https://developer.apple.com/news/?id=nyqbfz1y) · [Apple Ads placements](https://ads.apple.com/app-store/help/ad-placements/0081-ad-placement-options) · [Campaign structure](https://ads.apple.com/app-store/best-practices/campaign-structure) · [Maximize Conversions](https://ads.apple.com/app-store/best-practices/maximize-conversions)
- Reddit: [Rules](https://redditinc.com/policies/reddit-rules) · [Reddit Pro organic playbook](https://redditinc.com/hubfs/Reddit%20Inc/Content/Reddit%20Pros%20organic%20playbook.pdf)
- Apple Ads benchmarks: [AppTweak, Aug 2026](https://www.apptweak.com/en/aso-blog/apple-ads-benchmarks) · [Adapty, Jul 2026](https://adapty.io/blog/apple-ads-benchmarks-2026/)

**Competitor data**
- Sitemaps crawled 2026-10-23: cara.care, dietahealth.com, mysymptoms.net, monashfodmap.com, plopdiary.com, balloonguthealth.com, poopcheck.app, zoe.com, nervahealth.com, guttrace.com, poopid.app, bowelle.com, thronescience.com
- App Store data: iTunes Lookup / Search API, 2026-10-23

**Listicles checked**
- Independent: [Healthline](https://www.healthline.com/health/digestive-health/top-iphone-android-apps-gut-health), [MyGoodGut](https://mygoodgut.com/ibs/daily-life/tracking-apps/), [FODMAP Life](https://www.fodmaplife.com/fodmap-apps/), [MakeUseOf](https://www.makeuseof.com/best-apps-maintaining-low-fodmap-diet/)
- Written by app vendors: [Balloon](https://balloonguthealth.com/blog/best-ios-poop-trackers-for-2025), [GutTrace](https://guttrace.com/blog/best-gut-health-apps-2026), [Triggerbites](https://triggerbites.com/blog/best-cara-care-alternatives), [Dookie Deluxe](https://dookiedeluxe.com/learn/best-poop-tracker-apps)
