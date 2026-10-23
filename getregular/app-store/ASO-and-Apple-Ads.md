# Get Regular: ASO and Apple Ads plan (US)

Data was pulled on 2026-10-23 from the iTunes Lookup and Search APIs and from the apps.apple.com pages. Apple's rules were checked against its own documentation. Search ranks below come from a proxy (the iTunes Search API), not from App Store search. Check them on a device or in an ASO tool before you act on them.

## 1. Where the listing stands

| Field | Today | Problem |
|---|---|---|
| Title | `Get Regular: AI Gut Health` (26/30) | "Gut health" is the broadest and most crowded term. "Poop", the niche's highest-intent word, is missing. |
| Subtitle | `Food, Stool & Symptom Tracking` (30/30) | "IBS", "bloating" and "constipation" appear nowhere in the indexed fields. |
| Ratings (US) | 4.92★ from **13** | Too few to help conversion. Competitors have 1,100 to 16,000 (Balloon 1,134; Plop 1,503; Bowelle 2,248; Cara Care 4,667). |
| Price | $12.99/mo; $79.99 founding yearly; $99.99/yr | This is the top of the stool-tracker range. Balloon is $59.99/yr; PoopCheck and Plop are about $30–50/yr. |
| Privacy label | "Data Used to Track You: Identifiers"; Third-Party Advertising: Device ID; Precise Location linked to identity | This is a trust problem for a stool-photo health app. Confirm it matches the app's real behavior, since it is probably an attribution SDK, and minimize it. Then you can say something true about privacy. |
| Description | Opens with a tagline and has 13 feature bullets. Dr. Schopis is not named. No Q&A. | It fails the AppTweak "AI-readable" check (see §3). |
| Features missing from the copy | Doctor Report PDF, manual Bristol entry without a photo, hydration and time on the toilet, period tracking, Apple Health, Experiments, stool-photo privacy mode | These are the specifics that answer "Can it…?" prompts. |

Proxy ranks for Get Regular (US): "gut health" #19, "bristol stool" #13, "stool analysis" #23. It is not in the top 25 for "poop tracker", "poop", "ibs", "ibs tracker", "bloating", "constipation", "bowel movement", "food diary" or "symptom tracker".

AppTweak found that the Apple App Store is the most-cited source in ChatGPT app recommendations, at 37.6% of citations (US, May 2026). Your listing is the biggest AI-visibility lever you control directly.

## 2. New metadata (recommended: option A)

Apple combines words across the title, subtitle and keyword field. The keyword field holds 100 characters, comma-separated with no spaces. Don't repeat words or use plurals, and don't use competitor names ([Apple: App Store search](https://developer.apple.com/app-store/search/)).

**Option A, broad and niche together (recommended)**
- Title (30): `Get Regular: Poop & Gut Health`
- Subtitle (29): `AI Stool Scan, IBS & Food Log`
- Keywords (100): `tracker,bloating,constipation,bristol,bowel,movement,digestion,symptom,diary,fodmap,diarrhea,trigger`

The combined fields cover poop tracker, gut health tracker, IBS tracker, stool scan, Bristol stool, bowel movement, food diary, food log, symptom tracker, food trigger, FODMAP tracker, constipation tracker and bloating.

**Option B, niche first (to test second)**
- Title (28): `Get Regular: AI Poop Tracker`
- Subtitle (28): `Gut Health, IBS & Food Diary`
- Keywords (100): `stool,scanner,bloating,constipation,bristol,bowel,movement,digestion,symptom,fodmap,diarrhea,trigger`

Why A first: it keeps "gut health", where Get Regular already has some relevance, and adds "poop". In the niche, "poop" is the word the direct rivals (Balloon, PoopCheck, Plop, PoopID, Flush) all put in their titles. Title and subtitle changes can't be A/B tested, so ship A, hold it for 3–4 weeks, read the ranks, then decide whether to try B.

Before shipping, check the Apple Ads keyword popularity score for each term. In Apple Ads Advanced, the keyword recommendations show popularity. Swap out any term rated near zero.

## 3. Long description, AI-readable (draft for review)

It follows AppTweak's structure: an opening line, then audience, a few use cases, features tied to outcomes, questions, and trust details. The long description doesn't affect App Store search rank. It does feed AI answers and conversion. Every claim below must be checked by the team, and Dr. Schopis must approve the wording about him.

> **Get Regular is an AI gut health app that helps adults with bloating, constipation or IBS symptoms find out what's driving how they feel. It analyzes your stool photos, meals and symptoms together and turns them into daily gut scores and personal next steps.** Built with board-certified gastroenterologist Dr. Michael Schopis, MD.
>
> **WHO IT'S FOR**
> • People with IBS-type symptoms, bloating, constipation or unpredictable digestion
> • Anyone who wants to stop guessing which foods agree with them
> • People preparing for a GI appointment who want real data, not memory
>
> **WHAT YOU CAN DO**
> • Track your poop in 10 seconds. Snap a photo and the AI tells you your Bristol Stool Scale type. Prefer no photo? Pick the type manually.
> • Find your food triggers. Log meals by photo and Get Regular links them to your symptoms and stool patterns.
> • Get regular. See frequency, fiber, hydration and time on the toilet, and what is moving your Regular score.
> • Walk into your doctor's office prepared. Export a Doctor Report PDF with your patterns.
>
> **HOW IT HELPS**
> • Daily Gut and Nutrition scores update with every log, so you see what changed today.
> • Gut Check, your AI advisor, answers questions about your own data.
> • Personalized experiments test one change at a time, like more fiber or less coffee, so you learn what works for you.
> • A weekly digest summarizes your week's patterns.
> • Works with Apple Health. Optional period tracking shows cycle-related gut changes.
>
> **CAN GET REGULAR HELP WITH IBS?**
> It helps you track IBS symptoms, stool type and food triggers in one place, and spot patterns to discuss with your doctor. It does not diagnose IBS.
>
> **DO I HAVE TO PHOTOGRAPH MY POOP?**
> No. You can log your Bristol type manually. If you do use photos, [describe the privacy mode, where photos are stored and how to delete them; only say what is true].
>
> **WHO BUILT IT?**
> Get Regular Health, Inc., with board-certified gastroenterologist Dr. Michael Schopis, MD, who reviewed the app's analysis against current gastroenterology guidelines.
>
> **IS IT A REPLACEMENT FOR MY DOCTOR?**
> No. Get Regular is a wellness tracker. See a doctor for blood in your stool, black stool, unexplained weight loss, or symptoms that wake you at night.
>
> [Subscription terms / legal]

Also:
- **Promotional text:** rotate it monthly with the content calendar (for example "New: Doctor Report PDF", "January Gut Reset"). It doesn't affect rank, but it does affect conversion.
- **Release notes:** name the feature ("Doctor Report", "Hydration tracking"). Release notes are crawlable text on apps.apple.com.
- **Screenshots 1–3:** stool scan, then trigger insight, then Doctor Report. Use the same words as the title and subtitle so the listing reads as one consistent message.
- **Regulated medical device status:** declare it in App Store Connect before early 2027, or updates will be blocked. The rule covers Health & Fitness apps in the US, UK and EEA ([Apple, Mar 26 2026](https://developer.apple.com/news/?id=nyqbfz1y)). If the honest answer is "No", keep every surface wellness-framed: "track, understand, discuss with your doctor", never "diagnose" or "detect".
- **Accessibility labels:** declare what is supported.
- **App Store tags (US):** check the generated tags under App Store Connect → App Information and deselect any that are wrong ([Apple](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-tags/)).

## 4. Custom product pages: organic and paid

Since October 2025, up to 70 custom product pages can have keywords assigned. Each one can appear in search results for those keywords in place of the default page ([Apple](https://developer.apple.com/app-store/search/)). Build four, and reuse them as Apple Ads ad variations:

| CPP | Assigned keywords | Screenshot 1 headline |
|---|---|---|
| AI poop scanner | poop scanner, stool analysis, poop analyzer, bristol stool | "Snap it. Know your Bristol type in seconds." |
| IBS & bloating triggers | ibs tracker, bloating, food trigger, food symptom tracker | "Find the foods behind your bloating." |
| Constipation / get regular | constipation, bowel movement tracker, poop tracker | "See what keeps you regular." |
| Gut health score | gut health, gut health tracker, digestion | "Your daily gut score, from your own data." |

Each keyword combination can be assigned to only one page.

## 5. Ratings and reviews

13 ratings is the biggest conversion drag and a weak signal for both App Store search and AI answers.

- **Prompt with the system review prompt only** (`requestReview`). It is capped at 3 prompts per 365 days. Don't add a "Do you like us?" gate in front of it: Apple guideline 5.6.1 restricts custom review prompts.
- **When to prompt:**
  1. After the first weekly digest the user opens, if they have 5 or more logged days.
  2. When the Gut or Regular score improves week over week, or after a 7-day run of Bristol type 3–4.
  3. Right after a Doctor Report is generated.
- **Never prompt** during onboarding, at the paywall, right after a stool photo, after an AI miss ("food not recognized"), or on a high-symptom day.
- **Get specific reviews:** AI reads reviews as evidence of what the app is for. An in-app question like "What did Get Regular help you figure out this week?" leads to reviews that name use cases ("found out dairy was my trigger"). Don't script reviews and don't offer incentives.
- **Reply to every review under 5★** in App Store Connect, using the positioning language. Developer replies are public text.
- **Target:** 13 → 150+ US ratings in 6 months. This is a target, not a forecast; it depends on active users.

## 6. Apple Ads

### What Apple offers now (verified)
- **Placements:** search results, Search tab, Today tab, and product pages ("You Might Also Like") ([Apple](https://ads.apple.com/app-store/help/ad-placements/0081-ad-placement-options)).
- **Ad position:** search-results ads can now show at the top or further down the page. You can't choose or bid for a position ([Apple](https://ads.apple.com/app-store/help/ad-placements/0082-search-results)).
- **Maximize Conversions** (Feb 2026): Search Match plus automated bidding to a target CPA. Apple suggests enough budget for at least 5 conversions a day and at least 2 weeks before judging ([Apple](https://ads.apple.com/app-store/best-practices/maximize-conversions)).
- **Recommended structure:** Brand, Category and Competitor campaigns (exact match, Search Match off), plus Discovery (broad match plus Search Match, with exact negatives) ([Apple](https://ads.apple.com/app-store/best-practices/campaign-structure)).

### Campaigns (US, search results first)

| Campaign | Settings | Starter keywords | Starting max CPT bid |
|---|---|---|---|
| Brand | Exact, Search Match off | get regular, getregular, get regular app, get regular gut health | $0.50–1.50 |
| Category: stool | Exact, CPP "AI poop scanner" | poop tracker, poop app, poop scanner, stool tracker, stool analysis, poop analyzer, bowel movement tracker, bristol stool chart, bristol stool scale | $1.50–3.00 |
| Category: IBS / bloating | Exact, CPP "IBS & bloating" | ibs tracker, ibs app, bloating, bloating tracker, food symptom tracker, food trigger tracker, food sensitivity tracker, fodmap tracker, constipation, constipation tracker | $1.50–3.50 |
| Category: gut health | Exact, CPP "gut health score" | gut health, gut health app, gut health tracker, digestive health, digestion tracker | $1.25–3.00 |
| Competitor | Exact | balloon poop tracker, plop, poopcheck, flush poop, poopid, cara care, bowelle, mysymptoms, gutly, unbloated, flarecare | $0.75–2.00 |
| Discovery | Ad group A: broad match, Search Match off. Ad group B: Search Match only. Add every exact term from the other campaigns as an exact negative. | — | $0.75–1.50, or Maximize Conversions with a target CPA of $3–5 |

**Shared negatives:** poop map, poop game, ibis, ibis paint, toilet finder, face bloat, calorie counter, weight loss, period tracker, microbiome test, gut test kit.

**Competitor terms:**
- Apple's relevance filter may not serve some of them.
- Conversion runs lower; US competitor campaigns convert at about 50% vs about 73% for brand ([AppTweak benchmarks, Aug 2026](https://www.apptweak.com/en/aso-blog/apple-ads-benchmarks)).

### Can you afford it? (assumptions, check against your own data)
- Benchmarks:
  - US Health & Fitness: CPT about $1.64–1.68, CPI about $3.0–3.8, conversion about 50–54% ([AppTweak](https://www.apptweak.com/en/aso-blog/apple-ads-benchmarks), [Adapty, Jul 2026](https://adapty.io/blog/apple-ads-benchmarks-2026/)).
  - Get Regular's 13 ratings will pull tap-through rate below the roughly 7.5% median.
- First-year value per install = annual price × net share after Apple's cut × install-to-paid rate
  - = $99.99 × 0.85 (Small Business Program, 15%) × 5% (assumed; Adapty puts Health & Fitness at 5–7.8%)
  - = **about $4.25**
- **Rule:** keep blended CPI at or under $3–4 until you have real trial-to-paid data, then rebuild this from that data.
- **Start** at $50–100/day: Brand plus the three Category groups. Add Discovery in week 2. Promote winning Search Match terms into the exact-match campaigns every week.
- **Hold back** Today tab and product-page ads until the app has 100+ ratings. Those ads pay for awareness, and a listing with 13 ratings wastes it.

### Why Apple Ads also feeds organic growth
- **Keyword research:** Search Match search-term reports show the real queries people use in this niche. Feed them into the content roadmap and the keyword field.
- **Organic rank (assumed):** paid installs on a keyword can lift organic rank for that keyword. This is widely observed but Apple doesn't document it, so treat it as a working assumption.
