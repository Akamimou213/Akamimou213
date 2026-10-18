# Landed: submission kit, demo script, validation and economics

## 1. Timeline (all times PT)

| When | Do |
|---|---|
| **Sun Oct 18, now → 23:59** (GLM 5.3 Flash is free until then) | Phases 0–4, then 6. That's the full demo path. Save a version after each phase. |
| **Mon Oct 19** | Phases 5, 7 and 8 (8 is optional). Show the demo to 5–10 people on GLP-1s (§4). |
| **Tue Oct 20, by ~18:00** | Phase 9 QA, Publish, record the demo video, submit. Keep a buffer before the 23:59 deadline. |

After tonight, GLM 5.3 Flash is no longer free. Phases 5–9 will use your normal Bolt plan tokens, so keep those prompts small.

## 2. Submission form answers

**Project name:** Landed

**Live link:** `https://<your-subdomain>.bolt.host`. It must be public and free to open, and `/demo` must work without an account.

**One-line description:**
> The GLP-1 companion that protects your muscle while you lose and helps you keep the weight off when your dose changes or stops.

**Longer description** (fit it to the form's limit):
> About 1 in 8 US adults now take a GLP-1 (KFF, 2025). Most apps stop at logging shots. Two things really decide the outcome, and nobody owns them:
> - **Losing fat, not muscle.** That means getting enough protein when you barely feel hungry.
> - **Landing safely when the dose changes or stops.** In the STEP 1 extension, people regained about two-thirds of their lost weight within a year of stopping semaglutide.
>
> Landed is a calm co-pilot for both.
> - **Snap your plate** and see its protein against your daily target on a cockpit-style gauge.
> - **Log your weekly shot or daily pill** in one tap.
> - **Check in** on food noise, nausea and energy in 10 seconds.
> - **Watch your weight trend** as a flight path descending into your landing zone.
>
> When you and your prescriber decide to taper, switch to a pill or stop, **Landing mode** watches your trend and food noise and gives you a course-correction plan before a small drift becomes a regain. A one-page clinician report keeps your prescriber in the loop.
>
> Landed never gives dose advice, never counts calories, and never stores meal photos. Logging is free forever. Landed Plus ($9.99/mo or $49.99/yr) adds unlimited photo estimates, weekly AI flight reports, and Landing mode.

**How it uses Bolt:** built entirely in Bolt with GLM 5.3 Flash. It uses:
- **Plan mode** for the architecture.
- **Project Knowledge** as the living product spec.
- **Bolt Database** with row-level security and the security audit.
- **Bolt Auth** with guest-to-account migration.
- **Server functions** for vision meal analysis, protein suggestions, weekly reports and tokenized clinician share links, each with schema validation and safety filters.
- **Secrets** for API keys.
- **Bolt's Stripe integration** (test mode) for Landed Plus.
- **Publish** to bolt.host.
- **Version history** between build phases.

**Tools besides Bolt (required disclosure):**
- **OpenRouter API:** routes in-app AI calls to the configured text and vision models, called only from Bolt server functions.
- **Google Fonts:** Barlow Semi Condensed, Public Sans, B612 Mono.
- **Stripe:** test mode.
- **Claude** (AI assistant): idea research and writing the build spec. The rules allow this for idea development.

Edit this list to match what you actually end up using.

## 3. Demo video script (90–120 s, optional but worth it)

Screen-record the live link on your phone, with your voice over it.

| Time | Screen | Voice-over |
|---|---|---|
| 0–10s | Landing hero, flight path descending into the runway | "One in eight American adults is on a GLP-1. Losing the weight is the part everyone talks about. Keeping it is the part nobody plans for." |
| 10–20s | The STEP 1 fact, big mono numerals | "In the STEP 1 trial, people regained about two-thirds of their weight within a year of stopping. Landed is built for that moment." |
| 20–45s | Today → Snap a meal → progress steps → "≈ 32g" → Log it → needle sweeps | "Snap your plate and see the protein against your target, because on these meds you're protecting muscle with every meal." |
| 45–55s | "Close the gap" suggestions | "Short on protein and barely hungry? Three easy options that fit your appetite today." |
| 55–70s | Check-in dials → Path → "Your patterns: nausea 2.8 on days 1–2 vs 0.9" | "Ten-second check-ins turn into your own patterns. No guessing." |
| 70–95s | Landing mode → DRIFTING → course-correction plan → runway | "When you and your prescriber change the dose or stop, Landing mode watches your trend and food noise and gives you a course correction before a drift becomes a regain." |
| 95–110s | Clinician report → print preview | "And a one-page report keeps your prescriber in the loop." |
| 110–120s | Logo + "Logging is free forever" | "Landed. You lost it on the meds. Now land it. Built in Bolt." |

## 4. Validation plan (start Monday; it strengthens "Potential impact")

### Interviews (5–10 people on a GLP-1, 15 minutes each)
Don't ask "would you use this?" Ask about the last time it happened:
1. "Walk me through your last dose week. What was hardest: food, nausea, protein, or something else?"
2. "Have you hit a plateau, or changed or paused your dose? What happened to your hunger and weight?"
3. "What do you use to track today? What annoys you about it? Have you paid for an app?"
4. "Have you thought about what happens when you stop? What's the plan?"
5. Then show them the demo link: "Try logging your last meal." Watch, and don't help.

**Signals to look for:**
- At least half name regain or muscle loss as a top worry without being prompted.
- At least 3 already pay for a tracker or have paid in the past.
- Meal logging works for them on the first try.

### Where to find them (respect community rules)
Talk to people you already know who are on GLP-1s. Use your own social posts. For subreddits like r/Zepbound and r/Mounjaro, read the self-promotion rules first. Answering questions helpfully works better there than dropping links.

### Funnel targets (in `/founder`)
These are targets for this experiment, **not industry benchmarks**:

| Step | Target |
|---|---|
| Visit → onboarding completed or demo started | ≥ 30% |
| Onboarding completed → first meal logged | ≥ 50% |
| Day-7 return | ≥ 25% of activated users |

## 5. Unit economics (scenarios; every input is an assumption unless sourced)

**Benchmark:** Shotsy charges $9.99/mo or $39.99/yr, with higher tiers up to $14.99/mo and $59.99/yr ([App Store](https://apps.apple.com/us/app/-/id6499510249)). An outside estimate puts it at about 350K monthly users with roughly a third paying ([GLP-1 Digest, Aug 2026](https://www.glp1digest.com/p/how-shotsy-grew-to-350000-monthly)). That is a third-party estimate, not company-reported.

**AI cost per active user per month:**
- **Assumption:** about 2 photo meals a day, at roughly 2,000 input tokens (including the image) and 400 output tokens each.
- **Price, cheap model:** about $0.15 per million input tokens and $0.50 per million output ([Artificial Analysis](https://artificialanalysis.ai/models/glm-5-3-flash)).
- **Per meal:** 2,000 × $0.15/1M + 400 × $0.50/1M = $0.0003 + $0.0002 ≈ **$0.0005**.
- **Per month:** about 60 meals, so ≈ **$0.03**. Suggestions and weekly reports add about $0.01.
- **If the vision model costs 20× more:** still under ~$1 per user per month.

**Net revenue per payer** (Stripe's standard US card fee of 2.9% + $0.30 assumed; check your account):
- Monthly: $9.99 − ($0.29 + $0.30) ≈ **$9.40 a month**
- Yearly: $49.99 − ($1.45 + $0.30) ≈ **$48.24 a year**

**LTV at different monthly churn rates** (monthly plan; AI cost about $0.05 a month is ignored):

| Monthly churn | Expected lifetime | Net LTV |
|---|---|---|
| 10% | 10 months | ≈ $94 |
| 15% | 6.7 months | ≈ $63 |
| 20% | 5 months | ≈ $47 |

**Implication:** keep blended **CAC per paying user under about $45**.
- **Example:** sign-ups at $2.00 from paid social, with 5% converting to Plus, gives CAC per payer = $2.00 / 0.05 = **$40**.
- **Both inputs are hypotheses.** Test them with a small Spark Ads / Meta budget after one organic creative proves itself.

**Churn advantage (hypothesis):** Landing mode is a reason to *keep* paying after the medication stops, which is exactly when shot-tracker subscriptions get cancelled.

**Measurement caveat:**
- Judge channels on onboarding → meal logged → day-7 → Plus, using your own `events` table, not platform-attributed installs or CTR.
- Treat creator lift as correlational until you run a holdout.
- **Never put ad pixels on health screens.** That's the FTC v. Hims & Hers issue (July 2026).

## 6. Go-to-market after the contest

1. **Creative angles:**
   - "What I eat in a day on Zepbound, protein edition." The format already exists on TikTok, mostly from small creators, so it's cheap to seed with UGC.
   - "I came off Wegovy. Here's my landing plan." This speaks to the fear people already post about.
   - "My protein gauge vs my appetite on shot day."
2. **Formats:**
   - Faceless slideshows (plate → gauge → flight path).
   - UGC from people on GLP-1s.
   - Founder POV.
   - Run the winners as Spark Ads.
3. **Partnerships later:**
   - Dietitians and obesity-medicine clinics, using the clinician report as the hook.
   - Employers and health plans for a B2B2C maintenance program, once retention data exists.
   - "GLP-1 friendly" food brands already buying creators.
   - **Avoid** affiliate deals for compounded-drug telehealth. There were reports of repeated FDA warning-letter waves in 2026; verify before any partnership.
4. **Native iOS** once day-30 retention is proven: HealthKit, push dose reminders, widgets, and the App Store onboarding/paywall playbook from your notes.
