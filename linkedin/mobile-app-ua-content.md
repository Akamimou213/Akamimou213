# LinkedIn content plan: mobile app user acquisition

Two posts a day about getting users for mobile apps: Meta, Apple Ads, TikTok, ASO, MMPs, paywalls and Web2App.
Each post gets one image or a short animation made in ChatGPT.
Research date: 19 Nov 2026.

**Sources used**
- The Telegram UA export (116 posts, Sep 2025 → 30 Sep 2026). I used the newest posts first (Mar–Sep 2026).
- treg (LinkedIn post search): 300 LinkedIn posts from the last month on app UA, ASO, MMP, paywalls and Web2App, ranked by engagement.
- Context (news) and Firecrawl (web and X): Apple, Google Play, Meta, AppsFlyer and Adjust updates from Jun–Nov 2026.

---

## 1. Who we're writing for

| Reader | What they want | What makes them DM |
|---|---|---|
| **Founder of a subscription or consumer app** (seed to Series A, $5K–$100K/month ad spend) | Cheaper paying users, not cheaper installs | "This person knows why my CPI looks fine but nobody pays." |
| **Agency or studio that needs a senior app UA person** (white-label or overflow) | Someone who can set up the MMP, events and Meta app campaigns without hand-holding | "He's done Adjust + SKAN + Meta at real budgets." |

**Positioning line (use it the same way every time):**
> I help app founders buy paying users, not installs: MMP and events set up right, creative tested at volume, budget moved by predicted ROAS.

**Proof you already have (from your site, ready to reuse):**
- Super app, North Africa: 116,464 first deliveries in 2025 at $1.81 each, $211K spend, Adjust + SDK events + server-side + Meta CAPI.
- TikTok app growth: 74,345 installs at $0.11 (8.67% CTR); iOS read through SKAN separately (35,008 SKAN installs at $0.15).
- Adjust funnel: purchases +15.8% in 30 days.
- Health app funnel screenshot (`public/proof/app-health-funnel.webp`) and TikTok installs screenshot (`public/proof/app-tiktok-installs.webp`).

---

## 2. What works on LinkedIn right now (treg data: 300 posts, last 30 days)

**Format mix:** image 47%, text-only 43%, video 6%, PDF carousel 3%.
Image posts get the most comments. Text-only does well for founder stories.

**The 5 formats that got the most engagement, in order:**

1. **"Comment X and I'll send it": a free resource for a comment.** For example, a Web2App growth manager's "Claude skills pack for subscription apps" posts got 80–170 comments each. That's the highest in the niche by far.
   → Your version: a free resource every week (Meta app event-mapping sheet, predicted-ROAS template, MMP setup checklist).
2. **Teardown of a known app.** Examples: "MyFitnessPal's web funnel, 17 screens", "Glam AI ($50M ARR) disappeared from the App Store", "Prayer Lock hit $150K MRR, then Apple removed it", "Journable makes $100K MRR mostly from Android".
   → Your version: one teardown a week (onboarding, paywall, ads in Meta Ad Library, App Store page).
3. **Math hook.** For example, "A $5 install costs you $250 per subscriber when only 2% pay."
   → Your version: CPI → payer CAC → predicted ROAS calculations.
4. **Founder story with numbers.** For example, "16,000 downloads, $2,137 revenue, here's what helped."
5. **Agent/AI result with a guardrail.** For example, "CPI went from $20 to $8.75; nothing went live until the client approved."

**Lead source we found:** founders openly post "looking for an agency for our mobile app" (Southeast Asia apps, a fintech app wanting ₹1–2 CPI, a mobile game hiring UA). Run this treg search every morning and reply or DM within the hour (about $0.004 per search):
```
treg call harvestapi.linkedin.post.search --query "search=looking for agency mobile app marketing" --query postedLimit=24h --query sortBy=date
```

**What to avoid:** "Looking for traffic partners / CPA offers" posts (affiliate spam) and generic "ASO tips" lists.

---

## 3. The latest news to post about (newest first)

| Date | What happened | Post angle |
|---|---|---|
| 20 Nov 2026 | Meta's new ad terms start: the advertiser is responsible for anything Meta's AI enhancements add | Turn off AI enhancements on app ads until tested |
| 12 Nov 2026 | **AppsFlyer** expands its Agent Hub and new **MCP tools**: AI agents can investigate and act on attribution data | "Your MMP now talks to Claude. What I'd let it do and what I wouldn't" |
| 12 Nov 2026 | Ads Uploader launches an MCP "Agent Inbox": AI agents analyze, edit and launch Meta ads with an approval step | Human approval as the rule for AI in ad accounts |
| 11 Nov 2026 | Kochava launches turnkey MMM + incrementality | "Attribution vs incrementality, explained for founders" |
| 28 Oct 2026 | Google Play will **rate how apps work on foldables** next year and give well-adapted apps more visibility | ASO now includes product quality |
| 28 Oct 2026 | Meta Andromeda update: +15.7% conversions on Facebook in Q2 from ranking changes | Creative diversity for app ads |
| 25 Oct 2026 | Meta best-practice guide: let campaigns gather data before you edit | "Stop touching your app campaign every morning" |
| 13 Oct 2026 | **Google Play: Ask Play** now writes AI comparisons between apps; **Play in Gemini** puts Play apps inside Gemini chats | Your listing is now read by AI, so write it for that |
| 7 Oct 2026 | Apple opens the App Store to **iPhone Duo** (foldable) apps; Duo screenshots required from **April 2027**; 200,000+ apps optimized by 16 Nov | ASO to-do: Duo screenshots before the deadline |
| Sep 2026 | **AppsFlyer Advanced Matching Data Sharing** (2 Sep): sends hashed email, phone and name to Meta to improve matching (needs an SDK update + a partner toggle) | "One toggle isn't enough: 4 steps" |
| Jun 2026 (WWDC) | **Apple Creative Assets** (images/video in the product page header and in search results), **Asset Library**, **Personalized Collections** with "App Notes"; no AdAttributionKit/SKAN changes | CPP + Creative Assets = one message from ad to store |
| Jun 2026 | AppsFlyer raises $1B+ from Google, Meta, Unity and Moloco | "Who measures the measurers?" opinion |
| May 2026 | Meta stops creating legacy Advantage+ App Campaigns; one unified app campaign setup becomes Advantage+ when budget, audience and placements are automatic | What changed for app advertisers |
| Mar 2026 | **Apple Ads adds more ad slots further down search results** (65% of downloads happen right after a search) | Apple Ads for founders: where to start |
| iOS 26.2+ | Apple Ads postbacks now come through **AdAttributionKit** instead of SKAN | MMP check |
| Jan 2026 | RevenueCat: about **14,700 new iOS subscription apps a month** (vs about 2,000 in Jan 2022) | "Organic is dying for new apps. Here's the math" |

---

## 4. Lessons from the Telegram export, newest first (rewrite these in your voice; don't copy)

These are the channel author's own claims, with a small sample and no raw data. Use them as frameworks and hypotheses, never as benchmarks, and add your own experience to each.

| # / date | Lesson | How to use it in a post |
|---|---|---|
| 176 · 30 Sep | Once campaign setup is standard, the bottleneck becomes how many creatives you can make (dozens → hundreds) | "The bottleneck moved from media buying to creative production" |
| 173 · 24 Sep | **Stopping rule:** after spending 3× target CPA with 0 purchases, the chance that a break-even campaign shows zero is about 5% (e^-3). After 1× target CPA, it's 37%. | Math post + an "when to kill an ad" chart |
| 171 · 22 Sep | 4 paywall setups that hurt Meta UA: 7-day trial copied from a competitor; hard paywall + trial; high launch price; trial optimization without checking revenue by country | Carousel: "Your paywall is breaking your Meta campaigns" |
| 169 · 17 Sep | AppsFlyer Advanced Matching: SDK update → collect allowed identifiers → SDK hashes them → turn on in Meta partner settings. The toggle alone does nothing. Check consent first (health apps) | Checklist post |
| 167 · 11 Sep | Ad → Custom Product Page → onboarding → paywall should all make the same promise. Ask the user's goal on screen 1. Test: one angle had $33 CPI and no trials; another had $8 CPI with trials (tiny sample) | "Same promise, 4 screens" diagram |
| 166 · 10 Sep | Deferred deep links: the money ad shows money content, the sleep ad shows sleep content. Attribution arrives late, so never block screen 1 waiting for it | Founder explainer |
| 161 · 1 Sep | Pick positioning by user need, not feature ("better sleep", not "habit tracker"). Rank needs by keyword volume × CPC; one CPP per need. A second angle cut purchase cost 10× in one app | Framework post |
| 159 · 27 Aug | Meta testing went from 5 to 20–50 creatives per test; AI cut production from ~$100 a video to ~$20 for five; weekly "top creatives / top countries" campaigns | "What changed in Meta app testing in 2026" |
| 156–157 · 26 Aug | MMP review: one newer Web2App tool claimed 90–95% matching but showed ~70% in practice; AppsFlyer still rated well for Meta launches | "MMP match rates: what vendors say vs. what I see" (use your Adjust experience) |
| 155 · 25 Aug | Funnel metrics can improve while revenue doesn't: a game raised level-1 completion from 50% to 90%, and purchases didn't move. Misleading ads got 5–8% CTR and worse payers | Contrarian post |
| 153–154 · 21 Aug | Daily spend has a profitable ceiling per niche and creative supply: one app was profitable at $150–300/day, and raising to $1,000/day made trial CPA 25–30% worse | "Your app can't spend $5K/day yet. Here's why" |
| 138 · 30 Jul | AI images often beat videos for some app niches (mental health), and never worked for photo/cleaner apps | "Static vs video for apps" poll |
| 137 · 28 Jul | A/B test = estimating a causal difference. Meta's creative allocation = finding delivery winners. Different questions | Educational |
| 134 · 21 Jul | CPI is a diagnostic, not the KPI. $30 CPI × 10% paid = $300 per payer | Math post |
| 133 · 15 Jul | Weekly predicted ROAS = future LTV × conversions ÷ spend. D3 ARPAS $5 → D180 $8 = 1.6× multiplier for new cohorts. Sent to the client every Monday by a bot | Template lead magnet |
| 128 · 23 Jun | A UA operator runs 5 client accounts through Claude Code + Telegram: reports, forecasts, campaign creation, creative uploads. Meta via an MCP, Adjust/Adapty/RevenueCat via MCP/API | "My AI UA setup" (show yours) |
| 126 · 16 Jun | Event mapping: install → Lead; trial → StartTrial; direct subscription → Purchase; trial converted → Purchase. Purchase optimization = real-money signal but sparse; trial = more signal but lower quality | Diagram post (high save rate) |
| 125 · 10 Jun | LTV prediction models overestimated by about 30% before an update; LTV growth slows (10% → 8% → 4% → expect 2%, 1%) | "Your LTV forecast is probably too high" |
| 124 · 3 Jun | Launch 5 duplicate campaigns and one will "win" by luck about 86% of the time at small budgets | Contrarian + math |
| 123 · 29 May | Claude Code + Meta: MCP to read data, Graph API to upload videos. A task that took days now takes about 20 minutes | AI workflow |
| 119–120 · May | Creative audit chart: X = cumulative spend, Y = CPA, one dot per creative, 4 quadrants. One winner lasted ~$13K, most ~$4K | Chart post (animate it) |
| 116 · 29 Apr | Pausing "bad" creatives can make the ad set worse: each creative reaches its own audience | Contrarian |
| 114 · 21 Apr | TikTok after Meta works: proven Meta creatives, ~30 different creatives, $100–150/day, no changes for 2 days, US → Tier 1 → worldwide | "Launching TikTok for an app" checklist |
| 111 · 10 Apr | RevenueCat 2026: 14,700 new iOS subscription apps a month; 69% of revenue goes to apps launched before 2020 | Market post |
| 110 · 7 Apr | Apple Ads: one campaign per keyword, start bids low and raise until you get impressions, use Search Results + Product Pages, try local markets (Poland, Hungary, Switzerland) | Apple Ads starter |
| 108 · 26 Mar | 7-day trials can push the first payment outside Meta's 7-day window. Start with a 3-day trial for creative testing; use "trial still active after 1 hour / day 3" as a quality signal | Paywall + attribution post |

---

## 5. Content pillars and daily rhythm

| Pillar | Share | Example |
|---|---|---|
| **Unit economics** (CPI → payer CAC → predicted ROAS) | 20% | "$5 CPI looks cheap until 2% pay" |
| **Meta / TikTok / Apple Ads app campaigns** | 25% | Event mapping, stopping rule, creative volume |
| **MMP & tracking** (Adjust, AppsFlyer, SKAN/AdAttributionKit, Web2App) | 20% | "One toggle isn't enough" |
| **ASO & store** (CPP, Creative Assets, Ask Play, foldables) | 15% | "Your listing is read by AI now" |
| **Teardowns + AI workflow + proof** | 20% | App teardown, your super app numbers, your Claude setup |

**Times (Ho Chi Minh City, UTC+7):**
- **Post A, 14:00** (Europe morning): the deeper post. Carousel, diagram or teardown.
- **Post B, 20:30** (US East morning): the lighter post. News, math hook, opinion, or "comment X" resource.

**Weekly fixed slots:**
- Monday B: a free resource ("comment PLAYBOOK").
- Wednesday A: app teardown.
- Friday A: your own proof (super app, TikTok app, Adjust funnel).

---

## 6. Daily research routine (20 minutes, with the MCPs)

1. **News (Context):** `get-news-search` for "Meta app ads", "App Store developers", "Google Play developers", "AppsFlyer OR Adjust", last 7 days.
2. **LinkedIn winners (treg):** `harvestapi.linkedin.post.search` for "mobile app user acquisition", "subscription app", "web2app", postedLimit=week. Note the top 3 hooks and formats.
3. **X ideas (Firecrawl):** search `site:x.com` app UA / paywall / Meta app ads from the last week; scrape the 1–2 best.
4. **Telegram export:** take the next unused row from section 4.
5. **Leads (treg):** the "looking for agency mobile app" search above; reply the same day.
6. Pick 2 posts → write them using the skeleton below → make the visual from the prompt.

**Post skeleton:**
```
Hook: a number or a claim, under 12 words
Line 2: why it matters to a founder

Context (2–3 lines)
The steps / the math / the 4 screens (3–5 short lines)
What I'd do Monday

One-line takeaway
Soft CTA ("Comment EVENTS and I'll send the mapping sheet")
```
Put any links in the first comment, never in the post itself.

---

## 7. Visuals with ChatGPT (one per post)

**House style (paste this before every image prompt):**
```
Style: clean editorial infographic, 1080x1350 portrait (4:5) for LinkedIn.
Off-white background #F5F6F0, dark green ink #182820, one accent #216A4D,
one warning color #D9480F only for "bad" values. Sans-serif (Inter-like),
big bold numbers, lots of white space, no stock photos, no 3D, no emojis,
no logos of real companies. Small footer text: "Mohamed Barkat · App UA".
All text must be spelled exactly as given.
```

**Animation (for 1 post in 3):** in ChatGPT, ask for a 6–8 second looping vertical video (Sora) or an animated GIF in the same style: *"Animate this infographic: elements appear one by one, numbers count up, the final line holds for 2 seconds. Keep it calm, no camera shake, no music required."* LinkedIn autoplays video muted, so all text must be readable without sound.

Each post below includes its own visual prompt.

---

## 8. Week 1 — 14 posts, written out (Thu 20 Nov → Wed 26 Nov)

### Day 1 · Post A · Meta news → app ads
**Hook source:** Meta's ad terms, effective 20 Nov.
```
Meta's new ad terms start today.

If you run app install ads, read this part:

If Meta's AI changes your ad (rewrites text, adds music,
turns your screenshots into a carousel, translates it),
you're legally responsible for what it says. Not Meta.

For apps that's a real risk. Health, finance, kids, dating:
one AI-added claim can get the ad rejected, or the app reported.

What I'm doing in every app account this week:

1. Turn off every Advantage+ creative enhancement
   you haven't tested on purpose.
2. Check live ads too. New enhancements get added
   to ads that are already running.
3. Test enhancements one at a time against a control,
   judged on payers, not installs.

AI enhancements can work. But "it's on by default"
isn't a test.

Comment TERMS and I'll send the list of toggles to check.
```
**Visual:** `[house style] A checklist card titled "Meta ad terms · 20 Nov 2026". Three rows with checkboxes: "1. Turn off untested AI enhancements", "2. Check ads already running", "3. Test one enhancement vs control". Bottom line in accent color: "Judge on payers, not installs."`

### Day 1 · Post B · Opinion / intro
```
Starting today I'm posting twice a day about one thing:
how mobile apps buy paying users.

Not installs. Paying users.

Here's what you'll see:
→ the math (CPI → cost per payer → predicted ROAS)
→ Meta, TikTok and Apple Ads app campaigns
→ MMP setup (Adjust, AppsFlyer, SKAN) that counts the right thing
→ paywalls and onboarding that don't break your campaigns
→ app teardowns
→ how I use AI agents in real ad accounts, and where I don't

Some context: last year I bought 116,464 first orders for a
super app across 4 countries, at $1.81 each, on $211K spend.

If you build or market an app, follow along.
And tell me: what's your biggest UA problem right now?
```
**Visual:** `[house style] Big number "116,464" with label "first orders · 2025". Below: "$1.81 each · $211K spend · 4 countries". Bottom: "Paying users > installs". Simple map dots for Algeria, Morocco, Tunisia, Senegal.`

### Day 2 · Post A · Unit economics (math hook)
```
A $5 install costs you $250 per subscriber
when only 2% pay.

Most app founders I talk to know their CPI.
Few know their cost per payer.

The math is 3 lines:

CPI ÷ install-to-paid rate = cost per payer
$5 ÷ 2% = $250
$5 ÷ 5% = $100

Then compare it to what a payer is worth over 6–12 months,
after store fees and refunds.

If a payer is worth $80, a $5 CPI is a loss
even though Ads Manager looks "cheap".
If a payer is worth $300, a $30 CPI can be fine.

That's why I optimize Meta to purchases or trials, not installs.
CPI is a warning light, not the goal.

What's your install-to-paid rate?
```
**Visual (animate this one):** `[house style] Three stacked rows, each like an equation: "$5 CPI ÷ 2% paid = $250 per payer" (the $250 in warning color), "$5 CPI ÷ 5% paid = $100 per payer", "$30 CPI ÷ 15% paid = $200 per payer". Title: "CPI is not your cost". Animation: each row types in, the result counts up.`

### Day 2 · Post B · MMP news
```
AppsFlyer just gave AI agents access to your attribution data.

Last week they expanded their Agent Hub and launched MCP tools,
so tools like Claude can read and act on your MMP data.

Useful. Here's how I'd split it:

Let the agent:
→ pull yesterday's installs, trials and payers by campaign
→ flag campaigns that spent 3× target CPA with 0 payers
→ write the Monday report

Don't let the agent (yet):
→ change postback or conversion value settings
→ edit event mapping to Meta
→ turn integrations on or off

One wrong mapping change and Meta learns from the wrong event
for weeks.

Read: yes. Write: with a human approving.
```
**Visual:** `[house style] Two columns. Left header in accent: "Agent can". Items: "Pull installs, trials, payers", "Flag 3× CPA with 0 payers", "Write Monday report". Right header in warning color: "Human approves". Items: "Postback settings", "Event mapping", "Integrations on/off".`

### Day 3 · Post A · Meta app campaigns (diagram, high save rate)
```
Your app is sending Meta the wrong event.

This is the setup I check first in every subscription app account:

What happens in the app → what Meta should receive

Install → Lead
Trial started → StartTrial
Direct subscription → Purchase
Trial converts to paid → Purchase

Why it matters:
Meta optimizes toward whatever you call "Purchase".
If a free trial is labelled Purchase, Meta finds people
who start trials and then cancel.

The trade-off:
→ Purchase optimization = real money, but fewer events,
  so you need more budget to learn.
→ Trial optimization = more signal, cheaper learning,
  but check trial-to-paid by country every week.

Start on real purchases if your budget allows.
Move to trials only if mature cohorts show they pay.

Comment EVENTS and I'll send the mapping sheet.
```
**Visual:** `[house style] A two-column flow diagram, titled "App event → Meta event". Arrows: "Install → Lead", "Trial started → StartTrial", "Direct subscription → Purchase", "Trial converts → Purchase". Footer note: "Meta finds more of whatever you call Purchase."`

### Day 3 · Post B · Opinion
```
Your app can't spend $5,000 a day yet.

Founders ask me to scale to $1–5K/day while the current
$500/day doesn't pay back.

Spend has a ceiling, and it depends on:
→ how many people actually have the problem your app solves
→ how many different creatives you can feed the algorithm
→ competition in that niche

One case I read: an app profitable at $150–300/day.
At $1,000/day its trial CPA rose 25–30%. The math broke.

Raising budget doesn't scale a campaign.
More angles and more creative do.

Find the next audience first. Then raise the budget.
```
**Visual:** `[house style] A simple line chart: x-axis "Daily spend", y-axis "Cost per trial". Line flat until "$300/day", then rising sharply, labelled "+25–30%". Title: "Spend has a ceiling".`

### Day 4 · Post A · Meta testing (stopping rule, math)
```
When should you kill an ad that hasn't made a sale?

My rule: after it spends 3× your target cost per purchase.

Here's the math behind it.

Say your target is $30 per purchase.
If the ad were truly break-even, how likely is zero sales?

After $30 spent: 37%. (Totally normal. Keep it running.)
After $60 spent: 14%.
After $90 spent: 5%. (Now it's probably not you being unlucky.)

That's a Poisson calculation: e^(−spend ÷ target CPA).

What this protects you from:
→ killing good ads after $20 because "no sales yet"
→ letting bad ads burn $300 because "Meta is still learning"

Two caveats:
→ trials and subscriptions show up late, so wait for them
→ this isn't proof an ad is bad, it's a signal to move budget

Set the rule. Automate the alert. Keep the final call human.
```
**Visual (animate):** `[house style] Bar chart titled "Chance of 0 sales on a break-even ad". Three bars: "$30 spent · 37%", "$60 · 14%", "$90 · 5%". The 5% bar in accent with label "Kill line: 3× target CPA". Animation: bars grow left to right, the kill line appears last.`

### Day 4 · Post B · ASO news
```
Your App Store listing is now read by AI before people see it.

What changed in the last few months:

→ Google Play's "Ask Play" now writes AI comparisons
  between apps, including what users say in reviews.
→ "Play in Gemini" puts Play apps inside Gemini chats.
→ Apple's Personalized Collections recommend apps with an
  "App Note" explaining why.

So a keyword-stuffed description won't help you much now.

What I'd update this week:
1. Description: say plainly what problem you solve and for whom.
2. Reviews: reply to the ones that mention your main use case.
   AI summaries pull from them.
3. First 3 screenshots: one promise, readable in 2 seconds.

Write for a human. The AI is reading on their behalf.
```
**Visual:** `[house style] A phone outline showing a chat bubble "Which sleep app is best for shift workers?" and an answer card listing an app with "Why: ...". Title: "Your listing has a new reader". Three numbered tips below.`

### Day 5 · Post A · Teardown (Wednesday-style teardown, run early)
```
An app hit $150K MRR in 14 months.
Then Apple removed it from the App Store.

(Prayer Lock, shared publicly by a funnel designer this month.)

The growth part is a textbook:
→ started as a web service, $0 revenue
→ rebuilt as an app, UGC creatives started working
→ Meta ads scaled it to ~$20K MRR in about 7 months, then $150K

The lesson for founders isn't "don't grow fast".
It's this:

Every growth lever lives on someone else's platform.
App Store review. Meta ad policy. Payment providers.

Before you scale paid UA, check 3 things:
1. Does onboarding promise only what the app does?
2. Would the paywall pass a strict reviewer on a bad day?
3. Do your ads, store page and onboarding say the same thing?

Scaling a funnel that breaks the rules just makes
the removal more expensive.
```
**Visual:** `[house style] A growth line from "$0" to "$150K MRR" across "14 months", then a sharp vertical drop to zero labelled "Removed from App Store". Title: "Growth lives on someone else's platform".`
(Check the original post before publishing so the details are right, and credit the author.)

### Day 5 · Post B · AI workflow + proof
```
My Monday app report takes 5 minutes. Here's the formula.

Predicted ROAS = (expected LTV × new paying users) ÷ spend

How I get expected LTV for young cohorts:
→ take a mature cohort: e.g. D3 revenue per subscriber $5,
  D180 $8 → multiplier 1.6
→ apply 1.6 to this week's D3 number

Example: spend $10,000, 400 new subscribers,
D3 revenue per subscriber $5 → $5 × 1.6 = $8 LTV
Predicted ROAS = $8 × 400 ÷ $10,000 = 32%... not great.

Claude pulls spend from Meta and cohorts from the MMP,
does the math, and writes the summary.
I read it and decide the budget.

Comment ROAS and I'll send the sheet.
```
**Visual:** `[house style] A formula card: "Predicted ROAS = LTV × payers ÷ spend". Below, a worked example in 3 lines with "32%" in warning color. Small note: "Multiplier from mature cohort: D180 ÷ D3 = 1.6".`

### Day 6 · Post A · Paywall → campaigns (carousel)
**Format:** 6-slide PDF carousel.
```
Your paywall can break your Meta campaigns.

4 setups I see that make app UA expensive:

1. A 7-day trial copied from a competitor
   The first payment lands after Meta's 7-day window,
   so Meta never learns who paid.
2. A hard paywall with a forced trial
   Everyone "starts a trial", so the trial event says nothing
   about who will pay.
3. A launch price copied from a 10-year-old competitor
   Too few purchases for Meta to find your buyers.
4. Optimizing to trials without checking revenue by country
   Cheap trials pile up in countries that never convert.

Fix order: 3-day trial while testing creatives → measure
trial-to-paid by country → then test 7 days.

Which one is your app doing?
```
**Visual (carousel prompt, one slide per call):** `[house style] Slide 1 cover: "Your paywall is breaking your Meta campaigns". Slides 2–5: one mistake each, big number "1"–"4", title and one-line why. Slide 6: "Fix order: 3-day trial → check trial-to-paid by country → test 7-day".`

### Day 6 · Post B · Contrarian
```
Duplicate a campaign 5 times and one will "win".
Even if none of them work.

Quick math:
A campaign that truly makes 80% ROAS, run 5 times at $50 each.
The chance at least one looks profitable by pure luck: ~86%.

That's how "this campaign just works, the others don't"
stories are born.

What I do instead:
→ judge the pooled result of all copies
→ wait for the winner to repeat over the next week
→ only then move real budget

Luck looks like skill when the budget is small.
```
**Visual:** `[house style] Five small identical campaign cards, four grey with "ROAS 60–90%" and one highlighted "ROAS 140%" with a dice icon. Title: "One will win by luck · 86%".`

### Day 7 · Post A · Your proof (TikTok app case)
```
74,345 installs at $0.11.
And I still didn't trust that number on its own.

Mobile app, TikTok Ads, 2025.

Here's what I did differently from most install campaigns:

1. Separate campaigns for installs and for in-app events.
   Each with its own cost target. Never blended.
2. iOS read through SKAN on its own.
   35,008 SKAN installs at $0.15, judged separately from Android.
3. Budget stayed on the 2 campaigns at 8–12% CTR.
   The smaller tests were switched off.

A $0.11 install only matters if those users do something
in the app. So installs were never the only KPI.

Cheap installs are easy. Cheap users who stay are the job.
```
**Visual:** use the real screenshot `public/proof/app-tiktok-installs.webp`, or `[house style] Big "74,345 installs" "$0.11 CPI" "8.67% CTR". Side panel: "iOS via SKAN · 35,008 at $0.15". Footer: "Installs and in-app events judged separately".`

### Day 7 · Post B · Apple Ads starter
```
65% of App Store downloads happen right after a search.

And since March, Apple shows more ads in search results,
not just the top slot.

If you've never run Apple Ads, here's a simple start:

→ One campaign per important keyword
  (so you can see exactly what each one costs)
→ Start with a low bid and raise it gradually until you get impressions
→ Search results + product page placements first.
  Today tab is more brand than performance.
→ Use Apple's own keyword suggestions, not Google's.
→ Check impression share: if you already win most of it,
  a higher bid won't buy much more.

Smaller markets in your language (Poland, Hungary, Switzerland)
are often cheaper.

Your MMP: make sure it reads Apple Ads postbacks
from AdAttributionKit (iOS 26.2+), not just SKAN.
```
**Visual:** `[house style] A phone App Store search screen showing results with two "Ad" badges (top and lower in the list). Title: "65% of downloads start with a search". 4 bullets to the right.`

---

## 9. Week 2 — 14 post ideas (Thu 27 Nov → Wed 3 Dec)

| Day | Post A (14:00) | Post B (20:30) |
|---|---|---|
| 8 | **AppsFlyer Advanced Matching:** 4 steps, and why the toggle alone does nothing (Telegram #169) | Black Friday for apps: discount the annual plan, not the trial |
| 9 | **Same promise, 4 screens:** ad → CPP → onboarding → paywall (#167) — diagram | Math: $30 CPI × 10% paid = $300 per payer (#134) |
| 10 | **Teardown:** a top health app's App Store page + Meta Ad Library ads | Opinion: "CTR went up, revenue didn't" (#155) |
| 11 | **Positioning by user need:** "better sleep", not "habit tracker"; rank by keyword volume × CPC (#161) | Poll: static images or video for your app ads? (#138) |
| 12 | **Creative audit chart:** spend vs CPA, 4 quadrants (#119) — animate | Why pausing "bad" creatives can hurt the ad set (#116) |
| 13 | **Your proof:** super app, 116,464 first orders, Adjust + CAPI setup | AI: Claude + Meta via MCP for reading data, Graph API for uploading videos (#123) |
| 14 | **Apple Creative Assets + Asset Library:** one message from ad to store header | Free resource: "comment MMP" → MMP setup checklist |
| 15 | **Event-mapping trade-off:** Purchase vs trial optimization, deep dive (#126) | iPhone Duo screenshots required from April 2027 — ASO to-do |
| 16 | **Launching TikTok after Meta works:** the checklist (#114) | "Organic is getting harder for new apps": 14,700 new iOS subscription apps a month (#111) |
| 17 | **Deferred deep links:** the money ad shows money content (#166) | Google Play will rate foldable quality next year |
| 18 | **Meta testing in 2026:** 20–50 creatives per test, AI production costs (#159) | LTV forecasts that run 30% too high (#125) |
| 19 | **MMP match rates:** vendor claims (90%+) vs. what I see (~70%) (#156) | Opinion: who measures the measurers? Google, Meta and Unity invested in AppsFlyer |
| 20 | **Teardown:** a top Web2App quiz funnel, screen by screen | AI: my Claude + Telegram UA setup (#128), your version |
| 21 | **3-day vs 7-day trial and the attribution window** (#108) | Recap + CTA: "3 free app UA audits this month, reply AUDIT" |

---

## 10. Rules

- **Telegram material:** rewrite it, add your own experience, never paste it. When an idea clearly comes from a named person (an interview guest, a public LinkedIn post), credit them.
- **Numbers:** your own numbers say how they were measured (Adjust, SKAN, platform). Other people's numbers say "reported" and are never presented as benchmarks.
- **Health and finance apps:** never imply you used client data you weren't allowed to share.
- **Every comment-for-resource post:** actually send the resource within 24 hours. That's what turns comments into DMs.

## 11. Weekly check (Sunday)

| Metric | Week 1 | Month 1 |
|---|---|---|
| Comments from app founders / agency people | 10 | 60 |
| "Comment X" requests | 15 | 100 |
| Inbound DMs about work | 2 | 10 |
| Calls booked | 1 | 4–6 |

Keep the formats that bring DMs from founders. Drop the ones that only bring likes from other marketers.
