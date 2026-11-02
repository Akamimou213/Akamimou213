# Get Regular: acquisition plan and checklist

Written 2 Nov 2026. Scope: acquisition only (paid, ASO, Apple Search Ads, SEO, GEO, organic social). Product and retention are out of scope.

Data sources:
- PostHog project "Get Regular Production"
- the live App Store page (id 6749188690)
- the live site getregular.com
- Drive docs: "Apple ads", "Meta + TikTok App Event Fix", "The Rating Engine"

There is no Meta spend data in anything I could reach. The Motion workspace connected to this account is a different brand. Every cost figure below is a target that still needs checking against Ads Manager.

---

## 1. What the data says

Definitions:
- **New user**: a person's first `onboarding_step_viewed`. This is the nearest thing to an install; PostHog has no install event.
- **Trial**: `rc_trial_started_event`.
- **Paid**: `rc_trial_converted_event`.

### Last 7 days vs. since v2

v2.0.1 went live on 18 Aug. The app hasn't changed since, so the whole period is comparable.

| Step | Since v2 (17 Aug – 1 Nov) | Last 7 days (26 Oct – 1 Nov) | Week before (19–25 Oct) |
|---|---|---|---|
| New users | 4,067 | 174 | 199 |
| Onboarding completed | 3,011 (74%) | 141 (81%) | 169 (85%) |
| Sign-up completed | 2,789 (69%) | 127 (73%) | 161 (81%) |
| Paywall viewed | 2,536 (62%) | 107 (61%) | 150 (75%) |
| Paywall CTA tapped | 364 (14% of paywall views) | 26 (24%) | 23 (15%) |
| **Trial started** | **269 (6.6% of new users)** | **20 (11.5%)** | **22 (11.1%)** |
| Paid | 76 (29% of trials that have ended) | 1 (too early to judge) | 6 |

### Weekly trend: volume collapsed, trials held

| Week starting | New users | Trials | New user → trial |
|---|---|---|---|
| 17 Aug | 317 | 31 | 9.8% |
| 24 Aug | 452 | 55 | 12.2% |
| 7 Sep | 472 | 20 | 4.2% |
| 21 Sep | 549 | 31 | 5.6% |
| 5 Oct | 357 | 21 | 5.9% |
| 19 Oct | 199 | 22 | 11.1% |
| 26 Oct | 174 | 20 | 11.5% |

### By self-reported source

Source comes from the onboarding question (`referral_source`). This is the only channel attribution in PostHog today.

| Source | New users since v2 | Trials | New user → trial | Paid |
|---|---|---|---|---|
| (didn't answer) | 2,623 | 58 | 2.2% | 10 |
| TikTok | 661 | 35 | 5.3% | 12 |
| Instagram | 487 | 94 | 19.3% | 29 |
| Facebook | 145 | 49 | 33.8% | 15 |
| App Store search | 76 | 21 | 27.6% | 6 |
| Friend / family | 31 | 3 | 9.7% | 2 |

Weekly TikTok new users went 14 → 112 (21 Sep) → 13 last week. Meta (Instagram + Facebook) held at 55–90 a week, then halved to 32 last week. Meta still produced about 9–11 trials every week.

### What this means

1. **The volume drop is TikTok and other unattributed traffic, not Meta.** From late September to now, TikTok fell 90%. The "didn't answer" bucket fell 60%, and it moves with TikTok. Those users rarely start a trial, so total trials stayed at about 20 a week.
2. **Meta drives the business.** It accounts for 53% of trials (143 of 269) and 58% of paying users (44 of 76). Its new user → trial rate is 22.6%, four times TikTok's.
3. **App Store search has the strongest intent we have (27.6%) but almost no volume** (76 users in 11 weeks). That is the case for ASO and Apple Search Ads in one number.
4. **TikTok works for reach but not for revenue.** It brings attention, but those users don't buy. Use it as a creative test lab and top of funnel, and judge it on cost per trial, not views.
5. **Outside the US, users barely convert.** New user → trial is 9.4% in the US against 2.7% in the UK, 3.5% in Australia, 0.9% in Germany, and 0% in NL, ES, FR and NO. Paid money should stay US-only, with Canada as the only test market.
6. **The unit-economics ceiling is low. This is the most important number to check.** Net revenue from trial conversions since v2 was about $2,321, minus about $466 in refunds, across 76 payers. That is about **$24 net per payer**, or **about $7 per trial** at a 29% trial → paid rate. Unless renewals change the picture, Meta needs a **cost per trial under roughly $7–10** to pay back on the first charge. Pull Meta cost per trial for the same window and compare.
7. **Measurement is the biggest blocker.** 64% of new users have no source. PostHog has no install event, no spend data, and no Apple Search Ads attribution. You can't scale what you can't measure.

---

## 2. Current state of each channel

| Channel | Status | Evidence |
|---|---|---|
| Meta | Live, the only paid channel | About 32–90 new users and 9–11 trials a week |
| TikTok organic | Posting, but declining fast | 112 → 13 new users a week since 21 Sep |
| App Store / ASO | Weak | **13 ratings** (4.9★) after about 4,000 new users in 11 weeks. The title and subtitle are fine but don't rank. |
| Apple Search Ads | Strategy written in the "Apple ads" doc; live status unknown | 76 users from App Store search since v2 |
| SEO | **Starting to work** | 47 Google visitors last week vs 4–10 a week before, landing on `/learn/bowel-health/*` pages. Last crawl in Search Console was 23 Oct. |
| GEO (AI answers) | Not visible | 0 visits from ChatGPT, Perplexity, Gemini or Claude since August. `llms.txt` returns 404. |

### Technical SEO audit of getregular.com

Good already:
- 113 URLs in the sitemap: 92 under `/learn`, plus `/app`, `/science` and `/explore`
- canonical tags on every page checked
- Article and Breadcrumb schema, plus MobileApplication schema
- Smart App Banner
- robots.txt explicitly allows Googlebot, Bingbot, Applebot, OAI-SearchBot, Claude-SearchBot and PerplexityBot
- pages are server-rendered (4,400 words of real HTML on a learn page)

To fix:
- `/llms.txt` returns **404**
- The `<lastmod>` dates are unreliable: 85 URLs share the same date (2026-10-20) and 28 have none. Google ignores lastmod when every date is the same, so stamp each page's real modified date.
- The article author is an **Organization** ("Get Regular Editorial Team"). There's no named person, no `reviewedBy` and no `dateModified`. Gut health is a "Your Money or Your Life" topic (Google's label for health and finance pages it holds to a higher standard), so it needs a named, credentialed medical reviewer on every `/learn` page.
- App Store links on the site have **no campaign token** (`pt`/`ct`), so App Store Connect can't show installs from the website.
- Every page uses the same generic OG image (`/images/preview.png`).
- Search Console isn't connected to OpenSEO, so index coverage can't be checked from here.

---

## 3. The plan

Order matters. Fix measurement first (week 1), then capture high-intent demand (ASO and Apple Search Ads), then scale Meta on cost per trial. SEO and GEO compound in the background, and TikTok feeds creative to Meta.

### Week 1: measurement (nothing else scales without it)

- [ ] **Pull Meta spend** for the last 7 days and since 17 Aug. Calculate cost per new user, cost per trial and cost per payer against the PostHog numbers above. Compare cost per trial with the ~$7–10 ceiling.
- [ ] Connect **Meta Ads as a source in PostHog Marketing Analytics**. The campaign-name mapping is already configured but no source is connected. That gives spend and conversions on one screen.
- [ ] Confirm the **Meta + TikTok App Event Fix** doc is shipped: autolog on, and `StartTrial` and `Subscribe` sent with the RevenueCat transaction ID. Optimize Meta for trial start, not installs.
- [ ] Turn on **Apple AdServices attribution in RevenueCat**, so Apple Search Ads installs and trials get a campaign and keyword.
- [ ] Add App Store **campaign links** (`?pt=…&ct=web-<page>`) to every App Store button on getregular.com, and one per TikTok and Instagram bio link.
- [ ] Make the "How did you hear about us?" question reach every user. 64% have no answer, so check where it sits in onboarding and whether people can skip it.
- [ ] Connect **Google Search Console and Bing Webmaster Tools** to OpenSEO, or share access with me, so I can track index coverage and queries.
- [ ] Build one weekly PostHog dashboard by source: new users → paywall → trial → paid. Build it once these fixes land.

### Weeks 1–2: ASO (no app release needed)

- [ ] **Subtitle test.** Current: "Food, Stool & Symptom Tracking". Candidates from the Apple Ads keyword plan:
  - "Poop, Bloating & IBS Tracker"
  - "Track Bloating, Stool & Triggers"

  Keep "AI Gut Health" in the title. Words already in the title or subtitle should not be repeated in the keyword field.
- [ ] **Keyword field (100 characters).** Fill it with the stems that aren't in the title or subtitle: `ibs,fodmap,bloating,poop,bowel,bristol,diary,log,intolerance,trigger,constipation,diarrhea,digestive`. Check the list against the live subtitle before saving.
- [ ] **Use the extra US keyword locales.** The US storefront also indexes Spanish (Mexico) and more English localizations. Add a second set of English keywords there: `tracker,app,journal,stomach,meal,food log,symptom,health,gut check`.
- [ ] **Screenshots 1–3 carry most of the conversion.** Each should lead with an outcome a user wants, phrased as tracking, not treatment:
  1. "Find the food behind your bloating"
  2. "Your gut score, every day"
  3. "Snap a photo, done"
- [ ] **Promotional text** can be updated without review. Rotate it every 2 weeks with the current angle.
- [ ] **Custom Product Pages (CPPs)**, one per Meta angle: bloating, IBS triggers, poop tracking, AI insights. Link each Meta ad set to its matching page. This is the cheapest way to raise conversion from the store page to install on paid traffic.
- [ ] **In-App Events** (Apple calls them Events) are free App Store placements that show in search. Example: a "14-day bloating trigger challenge".
- [ ] **Ratings: 13 is the biggest ASO problem.** The Rating Engine doc is ready but needs an app release. Push it into the next build: prompt at `weekly_digest_unlocked` and on the third logging day. Until that ships, email active users who haven't rated yet and link straight to `?action=write-review`.

### Weeks 1–4: Apple Search Ads

- [ ] Confirm the three campaigns from the "Apple ads" doc are live:
  - Category Exact, $17 a day
  - Competitor Exact, $5 a day
  - Discovery Broad, $4 a day

  All three US only, Search Results placement, Search Match off.
- [ ] Measure on **cost per trial** once AdServices attribution is on. The doc's "activated install" is fine for the first two weeks. App Store users start trials at 27.6%, so these should be the cheapest trials we can buy.
- [ ] Every 3–4 days, move keywords that win in Discovery into Exact and add negatives for the losers. Winners should also shape the subtitle, keywords and screenshots. That's the loop between paid search and ASO.
- [ ] Add a **Today tab** campaign later, once ratings pass 50. Skip Search tab ads for now.

### Ongoing: Meta (main channel, scale with discipline)

- [ ] **US only.** Move every other country into a separate test campaign with a hard cap, or cut them. The US converts 3–10× better.
- [ ] Optimize for **trial start**, and use cost per trial as the North Star. Scale budget about 20% every 3 days while cost per trial stays under the ceiling.
- [ ] **Creative volume:** 5–8 new concepts a week, split across four angles: bloating relief, food-trigger detective, poop humor, AI insight. Take hooks from TikTok winners (see the TikTok section).
- [ ] Send each ad set to its matching **CPP** and compare store-page conversion with the default page.
- [ ] Facebook-sourced users start trials at 33.8% vs 19.3% for Instagram. Test Facebook Feed placements separately before letting Advantage+ placements decide.
- [ ] Find out why Meta new users halved last week (63 → 32) while trials held. It could be a budget change, learning-phase reset or creative fatigue.

### Weeks 1–8: SEO (it's working, so double down)

- [ ] **Indexing now:** request indexing in Search Console for the top 20 `/learn` pages, and submit all 113 URLs through **IndexNow**. IndexNow reaches Bing, which feeds ChatGPT search and Copilot.
- [ ] Fix the sitemap so each URL has its real `lastmod`.
- [ ] Add a **named medical reviewer**: a registered dietitian or GI-trained clinician, with a bio page. On every `/learn` page add `reviewedBy`, a person `author`, and `dateModified`.
- [ ] **Internal links:** every `/learn` article should link to its matching `/app/*` page (food-symptom-tracker, poop-tracker) and to 3 related articles.
- [ ] **New content, in priority order:**
  - **Commercial pages:** "best poop tracker app", "best IBS tracker app", "best bloating app", "Get Regular vs Cara Care / mySymptoms / Bowelle".
  - **Symptom questions people search, to expand the 92-article cluster:** "why do I poop right after eating", "green stool", "floating stool", "bloated after eating every day".
  - **Interactive tools as link magnets:** a Bristol stool chart quiz, a bloating trigger checklist.
- [ ] **Backlinks** (the site has little authority today):
  - pitch gut-health journalists through Qwoted and Featured
  - partner with dietitians and give them the Doctor Report
  - get listed in "best gut health apps 2026" articles

### Weeks 1–8: GEO / AI visibility

- [ ] Publish **`/llms.txt`**: a short brand description, what the app does, links to the `/app/*`, `/science/*` and top `/learn` pages.
- [ ] **Bing Webmaster Tools and IndexNow.** ChatGPT search draws on Bing's index.
- [ ] **Answer-first formatting:** open every `/learn` page with a 40–60 word direct answer, then add a short FAQ block with FAQPage schema.
- [ ] **Be where AI models look for sources:** AI answers to "best app for X" lean on listicles, Reddit and comparison pages. Plan:
  - get into 5–10 third-party "best gut health / IBS / poop tracker apps" lists
  - answer genuinely in r/ibs, r/guthealth and r/FODMAPS (with disclosure, never spam)
  - publish our own comparison pages
- [ ] **Entity consistency:** use the same one-line description on the App Store, the site, Crunchbase, Product Hunt and LinkedIn. Add `sameAs` links in the Organization schema.
- [ ] **Track 20 prompts monthly** in ChatGPT, Perplexity, Gemini and Google AI Overviews. Examples: "best app to track bloating", "app to find food triggers", "poop tracker app", "IBS symptom tracker app". OpenSEO's AI visibility tracker can automate this but costs credits; I'll estimate the cost before running anything.

### Ongoing: TikTok organic (change the job)

- [ ] **Change the goal:** TikTok becomes the creative lab for Meta and the top of the funnel. It is not the trial engine (5.3% vs Meta's 22.6%).
- [ ] **Find out why it fell 90% since 21 Sep.** Check posting cadence, format changes and whether one viral post carried the peak. Pull views per post since September.
- [ ] **Formats to test:**
  - "I tracked my poop for 14 days and found my trigger" (a story with a payoff)
  - Bristol chart reactions and stitches
  - "Things your gut is telling you"
  - a dietitian creator reacting to logs
- [ ] **Creator program:** 5–10 micro creators in gut health and IBS, paid per post plus a bonus per trial using an App Store campaign link. Run winners as Spark Ads and copy them to Meta.
- [ ] Put a **campaign link** in the bio, not the bare App Store link, so TikTok installs show up in App Store Connect.

---

## 4. What I need from you

1. **Meta Ads Manager:** spend, impressions, installs and trial starts for the last 7 days and since 17 Aug, by campaign. Either connect the ad account to PostHog Marketing Analytics or share an export.
2. **Apple Search Ads:** are the campaigns from the doc live? Share spend and installs if so.
3. **App Store Connect:** product page views, conversion rate and installs by source (Search, Browse, Web referrer, App referrer) for the same windows.
4. **Search Console:** access, or connect it in OpenSEO.
5. **The getregular.com site repo:** it isn't in the GitHub repos this session can reach (only Akamimou213, luxe-pierre-algerie and two old repos). Grant access and I can ship llms.txt, lastmod, reviewer schema and campaign links directly.

## 5. Targets for the next 30 days

| Metric | Now | 30-day target |
|---|---|---|
| Trials per week | ~20 | 35 |
| Meta cost per trial | unknown | < $10, verify first |
| New users with a known source | 36% | > 80% |
| App Store ratings | 13 | 50+ (needs the release) |
| Google visitors per week | 47 | 150 |
| Users from App Store search per week | ~5 | 20 |
| AI-assistant referrals | 0 | first mentions in tracked prompts |
