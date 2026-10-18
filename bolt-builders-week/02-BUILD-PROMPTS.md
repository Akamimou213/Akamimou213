# Landed: build sequence for Bolt (GLM 5.3 Flash)

**Why phases:** Bolt's own guidance is to describe the architecture first, then add one feature per prompt and test each one. GLM 5.3 Flash is fast and cheap, but it's a "Forge" model, which Bolt calls experimental and less reliable than Standard/Max, and benchmarks flag it as verbose. Small, checkable steps give you a working app. One giant prompt gives you a half-working one.

## Before you start (5 minutes)

1. **Start a new project** on bolt.new and pick **GLM 5.3 Flash**. It's free until **Sun Oct 18, 11:59pm PT**, in 6-hour usage blocks, and unused blocks don't carry over.
2. **Load the spec.** Paste `01-PROJECT-KNOWLEDGE.md` into **Project settings → Knowledge**.
3. **Get AI keys for the in-app features.** Bolt has no built-in keyless LLM for generated apps.
   - Get one **OpenRouter** key.
   - When Bolt asks, add these secrets in the **Secrets** tab, never in chat: `AI_API_KEY`, `AI_BASE_URL=https://openrouter.ai/api/v1`, `AI_MODEL` and `AI_VISION_MODEL`.
   - For `AI_VISION_MODEL`, pick a model whose OpenRouter page lists **image input**. GLM 5.3 Flash is reported as natively multimodal, but its OpenRouter page didn't confirm image input when I checked. Test it, and switch the vision model if photos fail.
4. **Save a version after every phase that works.** Use **Version History** (or duplicate the project). If a phase breaks things, roll back instead of asking the model to fix it five times.
5. **If time runs short, build the demo-critical phases:** **1 → 2 → 3 → 4 → 6 → 9**.
   - Phase 5 (accounts), 7 (analytics) and 8 (Stripe) are what make it a business, and they score on "Use of Bolt" and "Potential impact".
   - Landing mode is in Phase 4 because it's the differentiator. Don't cut it.

Each phase has a prompt to paste, then **"Check before moving on"**. The check is for you, not for Bolt.

---

## Phase 0: Plan (use **Plan mode**; no code)

```
Read the project Knowledge carefully. It is the full spec for "Landed".

Do not write code yet. In Plan mode, give me:
1. The folder/file structure (src/components, src/screens, src/lib, src/data, server functions).
2. The reusable components, including the signature ones: ProteinGauge, FlightStrip, FlightPathChart, PhaseIndicator, CheckInDial.
3. The build order matching the phases I'll send: (1) design system + shell + demo pilot + Today, (2) quick logs + meal capture UI, (3) analyze-meal + suggest-protein server functions, (4) flight path + patterns + Landing mode + clinician report, (5) database + auth + guest migration, (6) onboarding + landing page + SEO + PWA, (7) analytics + founder dashboard + weekly flight report, (8) Plus paywall with Stripe test mode, (9) polish + QA.
4. Up to 5 risks or spec conflicts, especially around date math (days since dose, 7-day moving average, local time zone) and medical-safety wording.

Keep it under 400 words.
```

**Check before moving on:** The plan should name the signature components and add no extra features. If it suggests a different stack, reply: "Keep the stack in the Knowledge."

---

## Phase 1: Design system, app shell, demo pilot, Today

```
Implement Phase 1 only.

1. Design tokens from Knowledge §3 as CSS variables (light "clear day" + dark "night cockpit"), wired into Tailwind theme colors. Load Barlow Semi Condensed, Public Sans and B612 Mono from Google Fonts with fallbacks. Base 17px. Every number in the app uses B612 Mono.
2. Signature components as custom SVG/React: ProteinGauge (dial, ticks every 10g, amber target arc, sweeping needle with overshoot, mono readout "86 / 120 g", "34g to go"), FlightStrip (air-traffic flight strip with colored left band and mono fields separated by thin rules), FlightPathChart (7-day moving average line, raw dots, dose-change ticks, runway landing-zone band with amber runway-light dots; supports "hide weight numbers"), PhaseIndicator (Takeoff → Cruise → Holding → Descent → Landed approach chart), CheckInDial (three 0–4 segmented instrument switches). Build a hidden /styleguide route showing every component in every state, light and dark.
3. App shell: bottom tab bar (Today, the raised center "+" Log button opening an action sheet: Snap a meal · Log dose · Check in · Weigh-in · Workout, and Path), safe-area insets, centered app column max-width 480px, header with the "Landed" wordmark in Barlow Semi Condensed.
4. src/lib/store: a local store (React context + localStorage; IndexedDB for meal thumbnails) for profile, doses, meals, checkins, weights, workouts, landing plan. src/lib/calc.ts with tested-by-example pure functions: daysSinceLastDose, nextDoseDate, movingAverage7d, proteinToday, weeklyStats, landingStatus (ON COURSE / DRIFTING / COURSE CORRECTION per Knowledge §5.8). Put input/output examples as comments and make sure they're right.
5. src/data/demo.ts: the fictional 10-week "Jordan" demo pilot from Knowledge §5.10, all dates relative to today at runtime, including 4 demo meals with pre-computed MealAnalysis and inline-SVG illustrations. /demo loads it and routes to /today with the dismissible "You're flying the demo" banner and "Exit demo".
6. Today screen exactly as Knowledge §5.3 (dose card, ProteinGauge, check-in, today's strips, nausea-4 safety line). "Close the gap" can show a static placeholder list for now; it gets wired in Phase 3.

Do not build onboarding, the landing page, AI calls or auth yet. No emoji in the UI. No purple, no gradients, no glass effects, no neon green.
```

**Check before moving on:**
- On a phone-sized preview, does it look like a calm cockpit or like a fitness template? If it looks like a template, send: "This looks like a generic fitness dashboard. Push the cockpit concept: real instrument dials with tick marks, flight strips instead of cards, the runway landing zone, B612 Mono numbers. Fewer rounded boxes with icons. Show me /styleguide."
- Does "Day N since your dose" match the demo calendar? Is the moving-average line smooth?

---

## Phase 2: Quick logs and meal capture UI

```
Implement Phase 2 only.

1. Bottom sheets for Log dose, Check in, Weigh-in, Workout exactly as Knowledge §5.5. Dose sheet: medication and dose text prefilled from the last entry; injection site picker showing "Last: L thigh" (never recommend a site); pill users see no site picker. Each save writes a FlightStrip with a soft "cleared" animation, updates Today immediately, and supports undo for 5 seconds.
2. /log: the full flight log as FlightStrips grouped by day, filter chips (All · Doses · Meals · Check-ins · Weights · Workouts), edit and delete.
3. /log/meal capture UI: "Take a photo" (input accept="image/*" capture="environment"), "Upload", "Describe it" (textarea). Compress images client-side to max 1024px / JPEG 0.7. Show the progress steps from Knowledge §3. For now, use a mock analyzer that returns a demo MealAnalysis after 2 seconds.
4. The result sheet from Knowledge §5.4: title, item rows with grams in mono, range "≈ 28g (22–34g)", ProteinGauge preview of where the day will land, "Boost it" chips, a grams stepper, Log it / Retake. A non-food result shows the friendly retry message.
5. After Log it: close the sheet, sweep the Today needle to the new value.

Don't change the design tokens or signature components except to fix bugs.
```

**Check before moving on:** Log a dose, a check-in and a weight, then reload. Is everything still there? Run a mock meal and check that the needle sweeps.

---

## Phase 3: AI server functions (meal analysis and protein suggestions)

```
Implement Phase 3 only.

1. Bolt Cloud server function "analyze-meal" per Knowledge §5.4: OpenAI-compatible Chat Completions with secrets AI_BASE_URL (default https://openrouter.ai/api/v1), AI_API_KEY, AI_VISION_MODEL for images and AI_MODEL for text. Ask me to add these in the Secrets tab; never expose them to the client. Send the image as a data URL in an image_url content part. Use the system prompt from §5.4 verbatim as a constant, response_format json_object, temperature 0.2, 40s timeout. Validate with the shared zod MealAnalysis schema; if invalid, retry once with the zod errors appended; on second failure return { error }. Reject images over 2 MB and descriptions over 1,000 characters with friendly errors. Never log the image or description; log only duration and error type.
2. Post-validation guards in the function: clamp proteinG per item to 0–150, ensure proteinLowG ≤ proteinEstimateG ≤ proteinHighG, ensure the item sum is within the range (adjust the estimate to the item sum if not), and strip any sentence mentioning calories, dose, or medication from note and boost.
3. Replace the mock analyzer with this function. Demo meals: try live AI on the description first; if it fails or takes more than 20s, use the pre-computed result with a small "Demo estimate" tag.
4. Server function "suggest-protein" per Knowledge §5.6 (exactly 3 options, gentle foods when nausea ≥ 3, respects dietary preferences, no calorie or medical talk), cached for 1 hour per user/anon_id. Wire it to Today's "Close the gap" card (only shown when protein is short after 2pm local; in demo mode always show it).
5. Rate limit both functions per anon_id/user (e.g. 30 calls/hour) with a friendly message.

Test with: a real food photo, a non-food photo, the description "2 eggs, toast, coffee with milk", and the 4 demo meals. Tell me the estimates you get.
```

**Check before moving on:**
- Expected ballpark: Greek yogurt bowl ~20–28g, Caesar wrap ~25–38g, two eggs on toast ~13–18g, lentil soup ~10–18g. If you're way off, the vision model may not be seeing the image, so check `AI_VISION_MODEL`.
- Remove the keys temporarily. Do the demo meals still work as "Demo estimate"?
- Make sure it never mentions calories or doses.

---

## Phase 4: Flight path, patterns, Landing mode, clinician report

```
Implement Phase 4 only.

1. /path per Knowledge §5.7: FlightPathChart with 4 weeks / 3 months / All, dose-change ticks, landing-zone runway when a landing plan exists; phase card; "This week" instrument row (protein days hit X/7, strength sessions, avg food noise with arrow vs last week, avg nausea); "Your patterns" computed client-side only when data is sufficient (nausea by day-since-dose needs ≥3 dose cycles; food noise trend in the 14 days after a dose change; protein on dose day vs other days). Each pattern states its numbers and time window and never claims causation. "Hide weight numbers" shows shapes only.
2. /landing-mode per Knowledge §5.8: setup (what's changing + date entered by the user, landing weight defaulting to the current 7-day average, zone ±2/3/5% with ±3% default, habit targets), status screen with the big status instrument (ON COURSE / DRIFTING / COURSE CORRECTION using landingStatus from calc.ts), the 8-week runway view, food-noise trend since change date, habit scoreboard, the 3-step course-correction plan when drifting, the "Talk to your prescriber" prompt linking to /report, and "Add weigh-in reminders to my calendar" (.ics with 3 weekly recurring events). When entering the zone, pulse the runway lights once.
3. /report per Knowledge §5.9: one print-friendly page (@media print) with dose history table, weight chart, start/current/lowest, weekly side-effect averages, protein hit rate, strength per week, landing status, and the footer disclaimer. "Download PDF" uses window.print(). The share link can show "Available with an account" until Phase 5.
4. /safety page per Knowledge §5.13, and the low-intake gentle note on Today when the rule triggers.

Never suggest a dose, taper schedule or stop date anywhere.
```

**Check before moving on:**
- In demo mode, Landing mode should show **DRIFTING** with the course-correction plan.
- Change the demo landing weight so the status flips to ON COURSE, then to COURSE CORRECTION.
- Print the report to PDF on your phone. Does it read like something you'd hand a doctor?

---

## Phase 5: Bolt Database, auth and guest migration

```
Implement Phase 5 only.

1. Create the Bolt Database tables from Knowledge §6 with RLS: every health table is owner-only. Run Bolt's security audit and fix anything it flags.
2. Auth: email + password sign-up/sign-in at /login, password reset, Google sign-in if available, styled in the cockpit design.
3. Guest mode stays. Show the soft "Save your flight log so it's safe across devices" sheet after the first meal log or third app open (max once per session). On sign-up/sign-in, migrate all local data (not demo data) to the database, de-duplicate, then clear local copies.
4. Switch the store to the database when signed in (optimistic updates; brand-voice error toast on failure).
5. Clinician share links: server function that creates a random token (expires in 14 days) and a public /r/:token route that renders the read-only report via a server function that validates the token. Revoke button in Settings.
6. Settings per Knowledge §5.12: profile, medication and schedule, phase, units, protein target, dietary prefs, theme, hide weight numbers, export JSON/CSV, delete all data (type DELETE), delete account, sign out.

Do not change the visual design.
```

**Check before moving on:**
- Log as a guest, sign up, and confirm the data moved.
- Open a share link in a private window, then revoke it and confirm it stops working.
- Try fetching another user's rows (it should fail).

---

## Phase 6: Onboarding, landing page, SEO, PWA

```
Implement Phase 6 only.

1. /start onboarding exactly as Knowledge §5.2: 12 screens, one question each, progress bar, Back and Skip on every screen, max 4 options visible at once (scroll for the medication list), the 18+ gate, the reflection screen using ONLY the §2 facts with sources, the protein target screen (1.2 g × goal kg, rounded to 5, adjustable 60–200, default 100 if no weights) with the "ask your clinician" line, and the "Your flight plan" summary card. Answers in localStorage, copied to profiles after sign-up. Finish → "Snap my first meal" or "Explore with demo data".
2. Landing page at / exactly as Knowledge §5.1, mobile first and beautiful on desktop: hero with the animated FlightPathChart descending into a runway and a sweeping ProteinGauge, the STEP 1 fact in big mono numerals with its source, how it works, shots + pills, Landing mode explainer, the "free features stay free" promise, privacy, pricing preview, FAQ, footer.
3. SEO: title, meta description, canonical, Open Graph/Twitter image (generate an SVG/PNG of a flight path into a runway), JSON-LD SoftwareApplication, robots.txt, sitemap.xml, one h1, semantic sections.
4. Plain-language /privacy and /terms (no ad trackers, photos never stored, health data never sold or used for ads, AI provider named, data export and deletion).
5. PWA: manifest (name "Landed", theme color from tokens, standalone), icons (a small runway with a descending path), and the iOS Add to Home Screen hint after the third app open, dismissible forever.
```

**Check before moving on:**
- From the landing page, reach the demo in 1 tap and reach onboarding in 1 tap.
- Skip onboarding at screen 5 and confirm nothing breaks.

---

## Phase 7: Analytics, founder dashboard, weekly flight report

```
Implement Phase 7 only.

1. A track(name, props) helper sending to a server function "track" (insert into events, rate-limited per anon_id). Add every event from Knowledge §7. Never put health values in props.
2. /founder, visible only when the signed-in email is in the FOUNDER_EMAILS secret (checked server-side): funnel for 7 and 30 days (landing_view → onboarding_completed or demo_started → meal_logged → day2_return → day7_return → signup_completed → checkout_completed) with step-to-step conversion, phase mix, med-form mix, median meal-analysis time and failure rate, Landing mode starts, and a daily table. Simple SVG bars in the cockpit palette.
3. Server function "flight-report" per Knowledge §5.7: input = this week's aggregated numbers only; output { headline, wins, focus { title, why, howThisWeek[3] }, patternNotes }; validate that every number in the output appears in the input (otherwise retry once, then drop that sentence). Show it on /path behind a "Generate this week's flight report" button; save to reports.
```

**Check before moving on:** Do the demo path once in a private window, then check `/founder`. Generate a flight report and confirm every number in it matches the instruments.

---

## Phase 8 (optional): Landed Plus with Stripe test mode

> Set this up from the **gear icon → Stripe** integration with a **test** secret key (`sk_test_…`). First create "Landed Plus Monthly" ($9.99) and "Landed Plus Yearly" ($49.99) in Stripe test mode. Bolt's Stripe integration needs the database and auth from Phase 5.

```
Implement Phase 8 only, using Bolt's built-in Stripe integration in TEST mode.

1. /plus paywall in the section order from Knowledge §5.11: honest social proof (no fake reviews or ratings), outcome headline "Land it, and keep it.", 4 features as outcomes, monthly $9.99 / yearly $49.99 with the yearly saving computed correctly, renewal terms in plain words, the "Free features stay free" promise, CTA "Start Landed Plus", "Cancel anytime", Manage subscription.
2. Visible note: "Demo checkout: use test card 4242 4242 4242 4242".
3. Gating: free users get 3 AI meal estimates/day and 1 clinician report/month; Plus features (photo meals beyond 3/day, Close the gap, flight reports, Landing mode, share links) open the paywall as a sheet with "Not now" always available. Demo mode unlocks everything. Set profiles.plan from the Stripe webhook.
4. Track paywall_viewed {trigger}, checkout_started, checkout_completed.
```

---

## Phase 9: Polish and QA, then Publish

```
Phase 9: polish and QA. Don't add features.

Go through this checklist, fix every failure, and report pass/fail per line:
1. 375px and 360px: no horizontal scroll, no clipped text, tap targets ≥44px, bottom bar respects safe areas.
2. Every async action has loading, success, empty and error states in the brand voice.
3. prefers-reduced-motion disables the needle sweep, runway lights and hero animations.
4. Dark "night cockpit" mode: every screen readable at AA contrast.
5. Date math: days since dose across week boundaries, daily pills, 7-day moving average with missing days, landing status thresholds — verify with the demo data and two edge cases.
6. Safety wording: search the codebase and AI prompts for any dose/titration/taper advice, calorie talk, diagnosis, or statistics outside Knowledge §2. Remove them.
7. No console errors or warnings on the demo path; no logs containing health data, meal text or images.
8. Lighthouse mobile: Performance ≥ 85, Accessibility ≥ 95.
9. The demo path works with AI keys removed (demo meals fall back to "Demo estimate").
10. Visual critique: list the 3 places that still look like a generic fitness/AI template and fix them with the cockpit concept.
```

Then click **Publish**. Pick a clean subdomain (e.g. `landed.bolt.host` if it's free), make sure the site is **public**, and open it on your phone in a private tab. Run the demo path once on 4G.

---

## Fix-it prompts (when GLM goes off the rails)

| Symptom | Paste this |
|---|---|
| It edited files you didn't mention | "Revert changes to files not mentioned in my last prompt. Only touch: {files}." Or roll back in Version History. |
| It looks generic | "Run a design critique against Knowledge §3. List 5 things that look like a generic fitness/AI template, then fix them with instrument dials, flight strips, the runway landing zone and B612 Mono. No new colors." |
| Medical-advice drift ("try increasing your dose…") | "Remove all dose, titration, taper or stopping advice from UI copy and AI prompts. Add a post-validation filter in each server function that drops sentences mentioning dose, mg, titrate, taper or stop, and replace with 'Talk to your prescriber.'" |
| Photo estimates are nonsense | "Log whether the request to AI_VISION_MODEL included the image part and what the model returned (first 300 chars, no image data). Confirm the model supports image input." |
| JSON errors from the model | "Log the raw model output (first 500 chars) on parse failure. Strip markdown fences before parsing. Keep the single retry with the zod errors appended." |
| Wrong day-since-dose / time-zone bugs | "Write 6 example cases for daysSinceLastDose and movingAverage7d (including week boundaries, a missed dose, and a daily pill) as comments, then fix the functions until all pass. Use local dates, not UTC." |
| Endless "Attempt fix" loop | Stop and roll back. Then: "Add detailed console.error logging around {feature} and tell me what the logs say before changing code." |
| Server function 401/500 | "List which secrets the function reads, check each exists, and return a clear error naming any missing secret." |
