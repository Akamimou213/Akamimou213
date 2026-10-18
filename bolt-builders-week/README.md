# Bolt Builders Week: what to build and why

**Recommendation: build _Landed_.** It's a mobile-first GLP-1 companion for the two things that decide whether the weight loss lasts:

1. **Protecting muscle while you lose.** Snap your plate and see protein against your target, even when you're barely hungry.
2. **Landing safely when your dose changes or stops.** Landing mode watches your weight trend and food noise and gives you a course correction before a drift becomes a regain.

It supports weekly shots and the new daily pills. It never gives dose advice and never counts calories.

**Tagline:** *You lost it on the meds. Now land it.*

| File | What it is |
|---|---|
| [`01-PROJECT-KNOWLEDGE.md`](01-PROJECT-KNOWLEDGE.md) | Full product spec. Paste it into Bolt **Project settings → Knowledge**. |
| [`02-BUILD-PROMPTS.md`](02-BUILD-PROMPTS.md) | 10 phase prompts (Plan → Polish), with checks between phases and fix-it prompts. |
| [`03-SUBMISSION-KIT.md`](03-SUBMISSION-KIT.md) | Form answers and tool disclosure, a demo video script, a validation plan, unit economics and go-to-market. |

> **Change log:** v1 recommended "Opened" (an AI that explains scary mail). It was dropped because Meta's **Muse** agent (launched Sept 8, 2026) already reads email, photos and documents, fills in forms and negotiates bills ([TechCrunch](https://techcrunch.com/2026/09/08/meta-debuts-its-muse-ai-agent-will-consumers-trust-it/)). The lesson shaped this pick: **if the core is "AI reads or writes text for you," a general agent will absorb it.**

---

## 1. Contest facts that shaped the decision (verified Oct 18, 2026)

| Fact | Implication |
|---|---|
| Submissions close **Tue Oct 20, 23:59 PT**. The free-model weekend ends **Sun Oct 18, 23:59 PT**. | About 2 days. Build the demo path first. |
| The free model is **GLM 5.3 Flash** (not "GLM 3.5"), in 6-hour usage blocks. | Use phase-by-phase prompts. Bolt's own guidance favors them, and GLM is flagged as verbose and "experimental" in Bolt. |
| The live link must be **publicly accessible, free of charge, and functional** throughout judging. | Build a mobile **web** app on bolt.host with a `/demo` that needs no account. **No hard paywall.** |
| Judges score four things equally: **use of Bolt, idea, implementation & design, potential impact.** Ties go to "use of Bolt". | Use Bolt Database, Auth, Server functions, Secrets, Stripe and Publish on purpose, and say so. |
| Bolt has **no built-in keyless AI for generated apps**. | You need an OpenRouter key in Secrets, and a vision-capable model for meal photos. The demo falls back to pre-computed results. |
| Excluded countries include Brazil, China, Russia, Cuba, Iran, North Korea, Syria and Quebec, among others. Algeria isn't on the list. | You're eligible (18+). |

Sources: [Builders Week](https://bolt.new/builders-week), [Official rules](https://bolt.new/builders-week/terms), [Bolt Cloud](https://support.bolt.new/bolt-cloud), [Server functions](https://support.bolt.new/bolt-cloud/database/server-functions), [Secrets](https://support.bolt.new/bolt-cloud/database/secrets), [Stripe integration](https://support.bolt.new/integrations/stripe), [Bolt Forge](https://support.bolt.new/account/bolt-forge), [Prompting effectively](https://support.bolt.new/prompting/prompting-effectively).

---

## 2. How the idea was chosen

### The filter (what survives Muse, ChatGPT and Claude)
A B2C app survives general agents when its value comes from things they don't own:
- a **daily ritual** anchored to the phone (camera, one-tap logs)
- a **history built up over time** that only the app holds and that gets more useful each week
- an **emotional, identity-level outcome** (looks, health, addiction)
- a niche where **competitors already make money** and **creators already make content** (your validation rule)

### Candidates (2nd research round; Reddit quotes are verbatim from post bodies via Reddit's search RSS)
| | GLP-1 companion (**Landed**) | Quit vaping / Zyn | Hair-loss progress tracker |
|---|---|---|---|
| Pain intensity | High: fear of regain, nausea, muscle loss | High: relapse loops | High: obsessive checking, quitting treatment early |
| Market size | **12% of US adults currently take a GLP-1** (KFF, Nov 2025) | 14.8% of 18–24s vape (NHIS 2024) | r/tressless ~500K members |
| Proof competitors make money | **Strong:** Shotsy, ~350K MAU, est. ~£3.5M ARR (third-party estimate) | **Strong:** Puff Count $41K/month, Quittr $250K MRR | **Weak:** the only verified tracker makes $705 MRR and is for sale |
| Open gap | **Daily pills unsupported, weak protein help, no maintenance mode, bait-and-switch paywalls** | Vape- and Zyn-specific positioning only | Standardized photo capture |
| Survives general agents? | Partly: dose-anchored ritual + history + Landing mode | Mostly: the craving moment | Partly: capture ritual |
| Saturation | High, but nobody owns the "landing" | Very high (r/QuitVaping is full of indie app launches) | Low, because the money is weak |
| Risk | Medical-adjacent (manageable with strict guardrails) | Minors are a large share of users | Body-dysmorphia patterns |

**Why Landed wins:**
- It's the only candidate with **proven spend + a huge, growing market + a specific gap the incumbents' own reviews point to**. That gap is the moment the dose changes or stops, which is exactly when users are most scared and current trackers lose them.
- It also fits a judge's 20-second test well: tap "Try the demo", snap a meal, watch the protein needle sweep, see Landing mode flag a drift.

**Why not the others:**
- **Quit vaping/Zyn** has real money but is drowning in indie clones, and its moat is purely paid distribution.
- **Hair loss** has real pain but no evidence of spend on tracking.

---

## 3. The evidence for Landed

### Pain (Reddit, verbatim)
- **Fear of regain:** "whenever I delay my injection even 4–5 days, my appetite explodes and I feel like I'll gain everything back immediately." ([r/Ozempic, Mar 2026](https://www.reddit.com/r/Ozempic/comments/1rpo3i8/glp1_plateau_and_fear_of_stopping_has_anyone/))
- **Asking for an app:** "Did anyone do something specific in the transition phase? Supplements, coaching, slow taper? App?" ([r/Ozempic, May 2026](https://www.reddit.com/r/Ozempic/comments/1t7jb0l/am_i_the_only_one_terrified_about_weight/))
- **Hunger after stopping:** "My hunger seems twice as it was before… It is pretty much uncontrollable in my opinion." ([r/Ozempic, May 2026](https://www.reddit.com/r/Ozempic/comments/1t2rm8r/stopping_ozempic_and_regaining_weight/))
- **Protein is hard:** "My dietician has me at 1,500 calories and 100 grams of protein as a minimum. Most days it's still hard to hit that" ([r/Zepbound, Aug 2026](https://www.reddit.com/r/Zepbound/comments/1vrx6m7/officially_100pounds_down/))
- **Under-eating stalls progress:** "I stopped tracking and stalled. Turned out I wasn't eating enough, maybe 1,000 calories a day." (same post)
- **Plateau:** "I've been on 15mg since 12/2024 and gained and lost the same 7lbs for the last 19 months." ([r/Zepbound, Aug 2026](https://www.reddit.com/r/Zepbound/comments/1w3m9ti/never_surrender_it_took_me_507_days_to_lose_5lbs/))
- **Muscle matters to users:** "Really proud of the fact I only lost 6lbs of lean muscle mass in the 68 pounds I've lost… prioritize muscle preservation" ([r/WegovyWeightLoss, Jul 2026](https://www.reddit.com/r/WegovyWeightLoss/comments/1utip9n/365_days_and_62lbs_of_fat_later/))
- **Nausea:** "0.75 made me vomit every time I ate… the first 6 months were hell for me." ([r/Mounjaro, Jan 2026](https://www.reddit.com/r/Mounjaro/comments/1q2amtn/my_weight_loss_journey/))
- **Design warning:** "Tracking. App'ing, step counting, workout tracking, constantly checking this sub, taking the photos, should I weigh myself today?" ([r/Zepbound, Aug 2026](https://www.reddit.com/r/Zepbound/comments/1vr8mab/food_noise_just_replaced_with_zep_noise/)). Landed must feel *lighter* than tracking.

### Size and science
- **12%** of US adults currently take a GLP-1 and **18%** have ever taken one. **14%** of ever-users stopped because of cost and **13%** because of side effects ([KFF, Nov 2025](https://www.kff.org/public-opinion/poll-1-in-8-adults-say-they-are-currently-taking-a-glp-1-drug-for-weight-loss-diabetes-or-another-condition-even-as-half-say-the-drugs-are-difficult-to-afford/)).
  - *My inference from the same poll:* roughly 6% of US adults are former users, which is the Landing-mode segment.
- **11%** of US adults take a GLP-1 for weight loss, up from 3% in 2024 ([Gallup, 2026](https://news.gallup.com/poll/712157/glp-usage-reaches-new-high.aspx)).
- **Daily pills are new:**
  - Wegovy pill: FDA-approved Dec 22, 2025 ([PR Newswire](https://www.prnewswire.com/news-releases/fda-approves-novo-nordisks-wegovy-pill-the-first-and-only-oral-glp-1-for-weight-loss-in-adults-302648344.html)).
  - Lilly's Foundayo: approved Apr 1, 2026 ([CNBC](https://www.cnbc.com/2026/04/01/eli-lilly-glp-1-pill-foundayo-approved-for-obesity.html)).
  - A Glapp review (Jun 2026) complains "there are no options to enter for the pill".
- **Regain is the norm without a plan.** In the STEP 1 extension, participants regained about **two-thirds** of their weight loss within a year of stopping semaglutide ([Wilding et al., 2022](https://pmc.ncbi.nlm.nih.gov/articles/PMC9542252/)).
- **Protein:** the RDA is 0.8 g/kg, and 1.2–1.6 g/kg has been proposed for people losing weight on these drugs ([AJCN joint advisory, 2025](https://ajcn.nutrition.org/article/S0002-9165(25)00240-0/fulltext)).

### Competitors and the gap
- **Ratings** (iTunes API, Oct 18, 2026): Shotsy 4.83 (33.7K ratings), MeAgain 4.79 (37.9K), Glowise 4.78 (6.7K), Pep AI 4.73 (3.9K), Glapp 4.75 (1K).
- **Shotsy pricing:** $9.99/mo or $39.99/yr, up to $14.99/mo or $59.99/yr ([App Store](https://apps.apple.com/us/app/-/id6499510249)).
- **Free competition:** Noom's GLP-1 Companion went free on Jun 24, 2026 ([GlobeNewswire](https://www.globenewswire.com/news-release/2026/06/24/3316992/0/en/noom-launches-free-version-of-its-powerful-glp-1-companion-empowering-providers-with-a-research-backed-tool-to-support-weight-loss-that-lasts.html)).
- **ChatGPT Health** reached all US adults on Jul 23, 2026 ([MacRumors](https://www.macrumors.com/2026/07/23/chatgpt-apple-health-integration/)).

**What competitors' reviews complain about (App Store reviews, Sep–Oct 2026)** → **what Landed does instead:**
- Free features moved behind a paywall ("Bait and Switch") → **"Logging is free forever"**.
- Billing traps → **plain renewal terms**.
- No protein calculation ("does not help you calculate… protein needs") → **protein target + photo estimates + "Close the gap"**.
- No portion amounts → **ranges with honest confidence**.
- No way to share with a doctor → **clinician report + share link**.
- No maintenance mode → **Landing mode**.
- No pill option → **pills are supported from day one**.

**Independent signal:** someone has already put a "Glidepath" GLP-1 *weaning-readiness* intake prototype online ([proof of concept](https://glidepath-intake-poc.vercel.app/)). Others see the off-ramp gap too, which is why I avoided that name.

### Why Muse, ChatGPT Health or Noom won't simply absorb it
They can answer "what should I eat with nausea?" They don't own:
- the **dose-anchored daily ritual** (shot day, days since dose, pill time)
- the **longitudinal record** linking dose × food noise × protein × weight
- a **Landing program** with a defined zone, drift detection and course corrections
- the **cockpit metaphor** that makes all of this feel lighter than tracking

Be honest about the moat: it's **execution + positioning + distribution**, the same as Shotsy's. The positioning ("built for landing, not just losing") is the part incumbents can't easily copy without repositioning their whole product.

---

## 4. Business model

- **Core desires:**
  - Looks and identity ("not going back")
  - Protecting a big investment of money and effort
  - Control instead of fear
- **Free forever:** all logging, 3 AI meal estimates per day, flight path, 1 clinician report per month.
- **Plus at $9.99/mo or $49.99/yr** (a hypothesis to test):
  - Unlimited photo estimates
  - "Close the gap" suggestions
  - Weekly AI flight reports
  - Landing mode
  - Share links
- **Retention thesis:** shot trackers get cancelled when the shots stop. Landing mode is a reason to keep paying at exactly that moment.
- **Margins:** AI costs are pennies per user per month (see the kit). Payment fees dominate.
- **Expansion:** native iOS with HealthKit and push reminders, a dietitian and clinic channel built on the clinician report, and employer or health-plan maintenance programs once retention data exists.

## 5. Risks, and what would change this recommendation

| Risk | Built-in mitigation |
|---|---|
| **Medical-advice exposure** | Wellness positioning. No dose, taper or stop advice anywhere: filtered in prompts, server functions and QA. A safety page with red-flag symptoms. Decisions are always "with your prescriber". |
| **Disordered eating** | Protein-first, never calories. No "bad food" language, no resetting streaks, a "hide weight numbers" mode, and a gentle low-intake prompt. |
| **Health-data privacy** | Meal photos are never stored. No ad pixels (the FTC sued Hims & Hers over exactly this in Jul 2026). Owner-only row-level security, export and delete. |
| **Crowded category, Noom now free** | Lead with Landing mode and honest pricing, not with "another shot tracker". |
| **Bad photo estimates** | Honest ranges and confidence, a user-adjustable grams stepper, and "describe it" as a fallback. |

**I'd change the recommendation if** interviews (script in the kit) show:
- fewer than half of GLP-1 users name regain or muscle loss as a top worry, **or**
- almost nobody has paid for a tracker.

In that case the next pick is the **quit vaping/Zyn** craving-moment app. It has proven money and the least overlap with general agents, but it needs a paid-UGC budget to compete.
