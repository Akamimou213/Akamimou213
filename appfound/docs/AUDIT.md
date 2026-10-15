# Appfound site audit — v1 → v2

Audit of every section as a B2C app growth buyer would read it (founder or head of growth at a subscription app, $2K–$50K/month in spend). Each issue lists what was wrong, why it costs conversions, and what changed.

## 1. Accuracy and trust (fix first: one wrong number kills a sophisticated buyer)

| # | Issue in v1 | Risk | Fix in v2 |
|---|---|---|---|
| 1 | "Same audience, **same budget**" for the $6.28 → $2.75 test | The screenshot shows $696.65 vs $843.75 spend. Anyone who zooms in catches it | Dropped "same budget". States 111 installs at $6.28 vs 307 at $2.75, same audience |
| 2 | "Old ads replaced by new tested ads" | The ad sets are named *Test Creatives* ($6.28) and *Proven Creatives* ($2.75). It may be winners vs test batch, not old vs new | Reworded everywhere to "winners vs the ads they beat", which is true under both readings |
| 3 | Hero card labelled "Week 6" while mixing a 4-week CPI, a 30-day signup lift and a daily-average CVR | Implies one coherent week of data | Removed "Week 6"; each metric now shows its own window |
| 4 | "Client app" | Not confirmed the app is a client | "App we run growth for" / "Health app" |
| 5 | "iOS · Android · Web-to-app" and "web-to-app funnels" | Web-to-app was never claimed in the brief | Removed |
| 6 | "Agencies charge $5K–$15K + % of spend", "run by a junior" stated as facts | Generalisation | Softened to "often" |
| 7 | New screenshots showed the app name, ad account name and ID, business ID, PostHog project title, browser tabs and taskbar | Breaks the "name withheld" promise; leaks account IDs | Cropped and blurred before publishing |
| 8 | Recognised revenue tile ($971.61) | Next to $2.6K V2 spend it reads as negative ROAS; too early to judge payback | Not published |

## 2. Customer journey

| # | Issue in v1 | Fix in v2 |
|---|---|---|
| 9 | Hero search only scrolled to a second search box: the visitor typed their app twice | Hero has its own App Store autocomplete; picking an app pre-fills the main form and jumps to the name field |
| 10 | No section links on desktop; buyers who want proof or price had to scroll or open a drawer | Desktop nav: How it works · Results · Services · Pricing · FAQ, with active-section highlight |
| 11 | Proof came after services, so claims arrived before evidence | Order is now problem → outcomes → how → **proof** → services → 90-day plan → comparison → operator → price → FAQ → form |
| 12 | No CTA between hero and pricing except the nav | CTA bands after Results and after the 90-day plan; sticky bar on mobile |
| 13 | "What do I actually get, week by week?" unanswered | New "Your first 90 days, step by step" section: 9 steps, each with what we do and **your time** |
| 14 | Free Growth Plan was abstract | Preview card listing its 6 sections + video next to the form |
| 15 | Form left column was taller than the form, so the CTA scrolled away | Form is sticky on desktop |
| 16 | Spend question forced a choice | Optional, with a "Not yet" option |
| 17 | Success message was a dead end | Adds a "want it sooner? book a call" next step |

## 3. Proof

| # | Issue in v1 | Fix in v2 |
|---|---|---|
| 18 | One case study, one launch | Chapter 2 (V2 relaunch) with Meta, PostHog and category benchmark data |
| 19 | Screenshots too small to read | Click-to-enlarge lightbox on every screenshot |
| 20 | Dense PostHog funnel unreadable at page size | Rebuilt as a clean bar chart from the real numbers; leaks in coral; screenshot kept as source |
| 21 | Only good numbers shown | Benchmark shows the weak metric too (trial conversion, 20th–30th percentile) and names it as the next fix. Buyers trust a report that admits weak spots |
| 22 | No tools/stack signal | "Works inside your stack" bar (Meta, TikTok, Google, Apple Ads, Snapchat, App Store Connect, Play Console, RevenueCat, Adjust, PostHog, GA4/Firebase) |

## 4. Copy

- Rewritten for the buyer's vocabulary: cost per trial, cost per paying user, payback, SKAdNetwork/ATT, MMP, custom product pages, paywall → trial.
- Every service tab now lists concrete deliverables (5 each) instead of 3 generic bullets; Tracking moved to third because it gates everything else; ASO merged with onboarding/paywall work.
- Pricing: guarantee now defines *which* numbers (1–2 targets agreed in week 1); added "not included" (ad spend, paid UGC creator fees) and "you own everything".
- FAQ grew from 8 to 12: what's in the free plan, time to results, ATT/SKAN measurement, whether an MMP is needed, account ownership.
- Founder: added a quote that states the measurement principle.

## 5. UI / technical

| # | Issue in v1 | Fix in v2 |
|---|---|---|
| 23 | Hero form handler sat after a reduced-motion early return, so it **did nothing** for reduced-motion users | Bound independently; tested with reduced motion on |
| 24 | Mock tables cut off on phones | Horizontal scroll inside the mock |
| 25 | Benchmark caption blue-on-dark | White caption bar |
| 26 | Footer service links didn't open the matching tab | They do now |
| 27 | Off-brand violet→coral gradient pill in nav | Replaced by desktop nav; scarcity line moved into hero meta |
| 28 | Unused ad-library screenshot with third-party brands' ads | Removed (copyright/trademark risk) |

## Still open (needs you)

1. **Form endpoint**: set `formEndpoint` in `src/config.ts`. Without it, leads fall back to copy + LinkedIn.
2. **Domain**: set `siteUrl`, add a canonical tag, make `og:image` absolute.
3. **Testimonials**: none exist yet, so none are shown. One named quote from a founder (even the app you run growth for) would be the single biggest trust gain left.
4. **Claims to keep defensible**: $3.8M+ managed (not on the portfolio site), $842K and 1.25M+ (super app), "taking 5 founding clients", the "in 4 weeks" timeframe of the creative test.
5. **Benchmark source**: the page says "category benchmark". If it's RevenueCat's, naming it adds credibility.
6. **Pixels**: install GTM / Meta / TikTok; events are already wired (`cta_*`, `growth_plan_submit`, `proof_zoom`).

## v3 changes (from client feedback)

- **Hero rebuilt.** "Installs don't pay. Subscribers do." with an animated strike-through, and a funnel strip (Ad → Store → Onboarding → Paywall → Paying) where users stream through, drop at each stage and turn lime as payers. Cost per install removed from the hero, which fixed the contradiction of saying "not installs" while leading with install costs.
- **Two-field lead capture in the hero.** Type the app name, pick it from live App Store results, add an email, done. Google Play users paste their link. The pick also pre-fills the long form below.
- **Weak numbers removed.** Trial conversion, trial starts, the first-open → trial funnel and the PostHog funnel screenshot are gone. The benchmark image now shows only its top rows (labelled "selected metrics"). Numbers were removed, never changed.
- **Cost per install moved down.** The giant "–56%" block is replaced by the "Top 20% of its category" band; the creative-test CPI is now a small note in Chapter 1.
- **30–40 tested ads a month** everywhere, with an FAQ answer on how that volume is produced.
- **Copy rewritten** section by section: shorter, specific, no filler phrases.
- **Preview fixes.** Images in the preview link were broken by a path bug in the single-file conversion; fixed. The preview sandbox can't reach the App Store, so the preview carries an offline index of 56 popular apps; the real site searches the full App Store live.

## v4 changes (from client feedback)

- **Leads arrive.** The form posts to Formspree, so every request is emailed with a readable subject (`Growth Report request: <app> · spend <range>`). Tested end to end from a browser: 200 OK, success message shown.
- **One plan, one lead magnet.** The free "Growth Plan" is now the free **Growth Report** (a scored PDF and a video teardown), so the only plan on the page is the paid Growth Partner plan. The report's template, builder and 48-hour workflow are in `growth-report/`.
- **Guarantee.** "Work free until we beat it" (open-ended) became "if we haven't beaten your baseline by day 90, your fourth month is free". Also added as an FAQ.
- **AI-made creatives.** The hero, service tab, 90-day plan, comparison, pricing and FAQ now say the 30–40 monthly ads are made with AI and edited by hand. Real creators are optional and billed at cost.
- **$2K/month ad spend is a requirement**, not a suggestion, in the guarantee, pricing note and FAQ. The unprovable "most clients spend $3K–$50K" line is removed.
- **Price stays $1,500** for the 5 founding clients and goes up once their case studies are published.
- **Film is smaller.** Desktop: copy on the left, video capped at 820 px wide on the right, so the section is about 500 px tall instead of a full screen. Phones: the 9:16 cut is capped at 56% of screen height.
- **Still open:** the film's own end card and captions still say "Get my free Growth Plan". Change the two lines in `films/appfound-film/timeline.json` and re-render to match.
