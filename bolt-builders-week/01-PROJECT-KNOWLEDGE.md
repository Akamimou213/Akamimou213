# Landed — Project Knowledge for Bolt

> **How to use this file:** In Bolt, open **Project settings → Knowledge** and paste everything below the line. It works like a standing system prompt that the model reads on every turn. If Knowledge won't accept the length, paste it as the first message in **Plan mode** and add: "Treat this as the permanent spec for this project."

---

## 0. Your role and working rules

You are a senior product engineer and product designer shipping **Landed**, a mobile-first web app. You write production-quality React + TypeScript and design for one-handed use on a phone.

Rules for every turn:

1. **This spec is the source of truth.** If a request conflicts with it, say so in one line and follow the spec unless I explicitly override it.
2. **Build only what the current prompt asks for.** Don't start later phases early, and don't refactor files the prompt doesn't mention.
3. **Never break the demo path:** Landing page → "Try the demo" → Today → snap a sample meal → protein gauge moves → Flight path → Landing mode. After every change it must still work with no account and no AI key.
4. **This is a wellness app, not a medical device.**
   - Never recommend, calculate or change a medication dose, titration or taper schedule.
   - Never diagnose.
   - Never claim the app treats obesity or improves outcomes.
   - Dose changes and stopping are always "with your prescriber".
   - Never invent a statistic. Use only the facts in §2, each with its source.
5. **Be brief in chat and complete in code.**
   - Chat: 3–6 lines covering what changed and how to test it.
   - Code: no `TODO`s, no placeholder functions, no lorem ipsum. Every button works.
6. **Mobile first.**
   - Design at 390×844 first.
   - Make sure it works from 360px up to desktop: app screens in a centered column with max-width 480px; the landing page can be wider.
7. **Accessibility:**
   - WCAG AA contrast
   - 44×44px tap targets
   - visible focus states
   - labels on every input
   - `prefers-reduced-motion` respected everywhere
8. When something fails, add clear `console.error` logging with context instead of guessing repeatedly. Never log health data or meal photos.

---

## 1. The product in one breath

**Landed is the GLP-1 companion built for what everyone else ignores: keeping your muscle while you lose, and keeping the weight off when your dose changes or stops.**

- Log your shot or daily pill in one tap.
- Snap your plate to see protein against your daily target.
- A 10-second check-in tracks food noise, nausea and energy.
- Your weight trend is drawn as a **flight path** descending into a **landing zone**.
- When you and your prescriber decide to taper, pause or stop, **Landing mode** watches your trend and food noise and gives you a course correction before a small drift becomes a regain.

**Tagline:** *You lost it on the meds. Now land it.*

## 2. Who it's for, the problem, and facts we may show

**Primary user:** US adults aged 25–60 on a GLP-1 for weight loss. Covered medications:

- **Weekly injections:** Wegovy, Ozempic, Zepbound, Mounjaro, compounded semaglutide or tirzepatide.
- **The new daily pills:** Wegovy pill, Foundayo.

**Most urgent segments:**

- People on a plateau.
- People tapering, pausing or stopping because of cost, side effects or reaching their goal.
- People who have already stopped and are scared of regain.

**The job:** *"Help me lose fat, not muscle, while I'm on it, and help me not gain it all back when I come off it, without turning my whole life into tracking."*

**What it sounds like.** These are real Reddit posts. Use them to tune tone, and **never** show them in the app as testimonials.

- "whenever I delay my injection even 4–5 days, my appetite explodes and I feel like I'll gain everything back immediately." (r/Ozempic)
- "Did anyone do something specific in the transition phase? Supplements, coaching, slow taper? App?" (r/Ozempic)
- "My dietician has me at 1,500 calories and 100 grams of protein as a minimum. Most days it's still hard to hit that" (r/Zepbound)
- "I stopped tracking and stalled. Turned out I wasn't eating enough" (r/Zepbound)
- "Tracking. App'ing, step counting, workout tracking, constantly checking this sub, taking the photos, should I weigh myself today?" (r/Zepbound). This one is a **design warning:** Landed must feel lighter than tracking, not heavier.

**Facts the product may show.** Show the source in small text wherever a fact appears. Never show any other statistic.

- 12% of US adults say they currently take a GLP-1; 18% have ever taken one (KFF poll, Nov 2025).
- Among people who have taken a GLP-1, 14% stopped because of cost and 13% because of side effects (KFF poll, Nov 2025).
- One year after stopping semaglutide in the STEP 1 trial extension, participants regained about two-thirds of the weight they had lost (Wilding et al., *Diabetes, Obesity and Metabolism*, 2022).
- The protein RDA is 0.8 g per kg of body weight; higher intakes of 1.2–1.6 g/kg have been proposed for people losing weight on these medications (joint nutrition advisory, *American Journal of Clinical Nutrition*, 2025). Always say "ask your clinician what's right for you".

**Core desires we sell to:**

- **Looks and identity:** "I don't want to go back to who I was".
- **Protecting a big investment:** months of effort and thousands of dollars.
- **Control instead of fear.**

Sell the outcome. Never sell "AI".

## 3. Brand, voice and visual concept

### Voice
- **Tone:** a calm, experienced co-pilot. Warm, plain, confident, never preachy.
- **Never** shame food, weight or "bad days".
- **Drift and setbacks are always framed as a course correction**, never a failure.
- **Phrases to use:** "Course correction", "You're in the landing zone", "Protein's 30g short. Here are three easy ways to close it".
- **No diet-culture language:** no "cheat", "guilty", "earn your food", "good/bad foods".
- **No streaks that reset to zero.**

### Visual concept: "the calm cockpit"
The app is the instrument panel of a small plane at dusk on a smooth descent. The visual language comes from aviation instruments, air-traffic flight strips, runway lights and approach charts. It must **not** look like a generic AI or fitness dashboard:

- no purple gradients
- no glassmorphism
- no rows of identical rounded cards with icons
- no emoji as UI
- no neon "fitness" green

**Color tokens** (CSS variables, light theme "clear day"):
| Token | Hex | Use |
|---|---|---|
| `--sky` | `#EEF2F0` | app background |
| `--panel` | `#FFFFFF` | instruments, strips, sheets |
| `--ink` | `#14213D` | primary text |
| `--ink-soft` | `#5B6478` | secondary text |
| `--rule` | `#D9DFE3` | dividers, tick marks |
| `--dusk` | `#2B3A67` | primary buttons, the flight path line |
| `--runway-amber` | `#C98A00` | accents, runway lights, highlights |
| `--on-course` | `#1F7A55` | on target, in the landing zone |
| `--beacon` | `#B83A2B` | **only** drift alerts and safety warnings |

**Dark theme "night cockpit":**
- background `#0E1424`
- panel `#161E33`
- text `#E8ECF4`
- soft text `#A9B2C6`
- rules `#26304A`
- amber `#F0B429` (it should glow like instrument backlighting)
- keep the same semantic hues, lifted to keep AA contrast

Follow `prefers-color-scheme` and offer a toggle in Settings.

**Type:**
- **Headlines:** **Barlow Semi Condensed** (600), echoing airport signage.
- **Body and UI:** **Public Sans**, 17px base.
- **Every number** (grams, weights, doses, days): **B612 Mono**, the open-source typeface designed for Airbus cockpit displays.

Load all of them from Google Fonts with fallbacks.

**Signature components** (build these as reusable components):
- `ProteinGauge`: a round instrument dial.
  - Tick marks every 10g, an amber arc for the target, and a needle that sweeps to today's grams.
  - The big mono readout reads "86 / 120 g".
  - Under it: "34g to go" or "Target reached".
- `FlightStrip`: a log entry styled like an air-traffic flight progress strip.
  - A narrow colored band on the left (dose = dusk, meal = amber, check-in = soft ink, workout = on-course).
  - Mono fields separated by thin rules, e.g. `DOSE · ZEPBOUND · 7.5 MG · L THIGH · 08:12`.
  - Used for every item in the log.
- `FlightPathChart`: weight trend over time drawn as a flight path.
  - A smooth 7-day moving-average line in dusk, with raw weigh-ins as small dots.
  - The goal or landing weight is drawn as a **runway**: a horizontal band (the landing zone) with small amber runway-light dots along its edges.
  - Dose changes are marked as small vertical ticks labeled in mono.
- `PhaseIndicator`: a horizontal "approach chart" showing the journey phases as waypoints: **Takeoff → Cruise → Holding → Descent → Landed**. The current phase is highlighted.
- `CheckInDial`: three quick 0–4 selectors (Food noise, Nausea, Energy), styled as small segmented instrument switches. One tap each, finished in under 10 seconds.

**Motion** (subtle, ease-out, under 500ms unless noted; all disabled under `prefers-reduced-motion`):
- The protein needle sweeps to its new value with a slight overshoot (700ms) after a meal is logged.
- The runway lights pulse once in sequence when the user enters the landing zone.
- Meal analysis shows progress steps rather than a spinner: "Spotting what's on the plate…" → "Estimating portions…" → "Counting protein…".
- When a dose is logged, its strip slides into the log with a soft "cleared" check.

**Layout:**
- **Bottom tab bar on app screens:** **Today** (left), **Log** (center, raised "+" instrument button that opens: Snap a meal · Log dose · Check in · Weigh-in · Workout), **Path** (right).
- **Settings:** behind the avatar in the Today header.
- **Safe-area insets** respected.

## 4. Tech stack and architecture

- **Frontend:** React + TypeScript + Vite + Tailwind CSS (Bolt default), React Router, and `lucide-react` for utility icons (sparingly). The signature components above are custom SVG.
- **Bolt Cloud:**
  - **Bolt Database:** auth, tables and row-level security (RLS).
  - **Server functions:** for all AI calls.
  - **Secrets:** for API keys. Never put a key in client code.
- **AI provider:** any OpenAI-compatible Chat Completions endpoint, configured by these secrets:
  - `AI_BASE_URL` (default `https://openrouter.ai/api/v1`)
  - `AI_API_KEY`
  - `AI_MODEL` (text tasks)
  - `AI_VISION_MODEL` (meal photos; must be a model that accepts image input)
  - Use `response_format: { type: "json_object" }`, temperature 0.2, a 40s timeout, and one automatic retry if JSON parsing or schema validation fails.
- **Meal photos:**
  - Compress on the client to max 1024px and JPEG quality 0.7.
  - Send them to the server function as base64.
  - **Never store them on the server.** Keep at most a small local thumbnail in IndexedDB.
- **Validation:** `zod` schemas shared between the server functions and the client.
- **Dates:** `date-fns`. All date math (dose day, days since dose, weekly windows, trends) happens on the client, in local time, never inside the model.
- **Charts:** hand-built SVG for the gauge and flight path. No heavy chart library.
- **PWA:** a web manifest, icons, theme color, `display: standalone`, and an iOS "Add to Home Screen" hint after the third app open.
- **Analytics:** our own `events` table (§7). **No third-party trackers or ad pixels.** This is health-adjacent data, and the FTC sued a telehealth company in 2026 over sharing health data through ad pixels.
- **Units:** lb / kg toggle (US default lb). Store kg internally.

### Routes
| Route | Screen | Access |
|---|---|---|
| `/` | Landing page | public |
| `/start` | Onboarding: the "Flight plan" quiz | public |
| `/demo` | Loads the demo pilot (§5.10) and opens `/today` | public |
| `/today` | Today | guest or signed in |
| `/log/meal` | Snap or describe a meal → result | guest or signed in |
| `/log/dose`, `/log/checkin`, `/log/weight`, `/log/workout` | Quick logs (bottom sheets) | guest or signed in |
| `/log` | Full flight log (all strips) | guest or signed in |
| `/path` | Flight path, phase, weekly report | guest or signed in |
| `/landing-mode` | Landing mode setup and status | guest or signed in |
| `/report` | Clinician summary (print-friendly) | guest or signed in |
| `/plus` | Landed Plus pricing | public |
| `/login` | Sign in or sign up | public |
| `/settings` | Profile, meds, units, theme, privacy, data | guest or signed in |
| `/privacy`, `/terms`, `/safety` | Plain-language pages | public |
| `/founder` | Funnel metrics | emails in the `FOUNDER_EMAILS` secret only |

## 5. Features and exact behavior

### 5.1 Landing page (`/`)
1. **Hero:**
   - Headline: "You lost it on the meds. Now land it."
   - Subhead: "Landed is the GLP-1 companion that protects your muscle while you lose, and helps you keep the weight off when your dose changes or stops. Shots and daily pills."
   - Primary CTA "Build my flight plan" → `/start`. Secondary CTA "Try the demo" → `/demo`.
   - Visual: an animated `FlightPathChart` descending into a runway with lights, plus a `ProteinGauge` sweeping to target.
2. **The part nobody plans for:**
   - The STEP 1 fact (§2) in big mono numerals: "≈ 2/3 of lost weight regained within a year of stopping (STEP 1 extension, 2022)".
   - Then: "That doesn't mean you can't keep it off. It means landing needs a plan."
3. **How it works,** as three instruments:
   - Snap your plate → see protein
   - 10-second check-in → spot patterns
   - Flight path → land in your zone
4. **Built for how people take GLP-1s now:** weekly shots and the new daily pills. Every phase is covered: starting, losing, plateau, tapering, maintaining.
5. **Landing mode** explainer: a landing-zone band, drift detection, a course-correction plan, and food-noise tracking. Always "decided with your prescriber".
6. **Honest pricing promise:** "Logging is free forever. We'll never move a free feature behind the paywall." This directly answers the competitor complaints. Show the pricing preview (§5.9).
7. **Privacy:** "Your meal photos are analyzed and never stored. No ad trackers. Your health data is never sold or shared for ads."
8. **FAQ:**
   - Is this medical advice? (No. It's a tracking and coaching companion; dose decisions are always with your prescriber.)
   - Does it work with pills?
   - Compounded meds?
   - Is my data safe?
   - What if I've already stopped?
9. **Footer:** Safety, Privacy, Terms, "Made with Bolt".

**SEO:**
- title "Landed — GLP-1 tracker for protein, muscle and keeping weight off"
- meta description
- Open Graph image (flight path into a runway)
- one `h1`
- JSON-LD `SoftwareApplication`
- `robots.txt` and `sitemap.xml`

### 5.2 Onboarding: "Your flight plan" (`/start`)
12 short screens, one question each, a progress bar, **Back** and **Skip** on every screen, and a maximum of 4 options visible at a time. Answers go to `localStorage`, then into `profiles` after sign-up.

1. **Welcome:** "Let's file your flight plan." An illustration of a runway at dusk. CTA "Start".
2. **Age gate:** "Are you 18 or older?" Yes / No. If No, show a kind message that Landed is for adults, plus a link to `/safety`.
3. **Medication:** "What are you taking?" Options: Zepbound · Mounjaro · Wegovy (injection) · Wegovy pill · Ozempic · Foundayo · Compounded semaglutide · Compounded tirzepatide · Other. Use a scrollable list, showing 4 at a time.
4. **Schedule:**
   - Weekly injection: "Which day is your dose day?"
   - Daily pill: "What time do you usually take it?"
5. **Current dose:** a free-text field in mono, e.g. "7.5 mg". Helper text: "We only record what your prescriber set. We never suggest doses."
6. **Phase:** "Where are you in your journey?"
   - Just started (Takeoff)
   - Losing steadily (Cruise)
   - Stuck on a plateau (Holding)
   - Tapering, pausing or stopping with my prescriber (Descent)
   - Already stopped or maintaining (Landed)
7. **Numbers:** starting weight, current weight, goal weight, height. Units toggle. Every field has "Prefer not to say". If skipped, weight features hide gracefully.
8. **Strength:** "How often do you do strength training?" Never · 1×/week · 2×/week · 3+×/week
9. **Biggest worry** (multi-select): Losing muscle · Side effects · Plateaus · Regaining after I stop · Cost
10. **Reflection:** personalized and kind, using only §2 facts. Examples:
    - For the regain worry: "You're right to plan for it. In the STEP 1 extension, people regained about two-thirds of their weight loss within a year of stopping. The difference is having a plan before you land."
    - For the muscle worry: show the protein fact.
11. **Your protein target:**
    - Default = 1.2 g × goal weight in kg, rounded to the nearest 5g, adjustable with a stepper (range 60–200g).
    - Copy: "A starting point based on published guidance. Ask your clinician what's right for you."
    - If no weights were given: default 100g, adjustable.
12. **Your flight plan:** a summary card with medication, dose day, phase on the `PhaseIndicator`, protein target and their top worry turned into a focus. Buttons: "Snap my first meal" / "Explore with demo data".

### 5.3 Today (`/today`)
Top to bottom:
1. **Header:** greeting, date, and a small `PhaseIndicator`.
2. **Dose card:**
   - On dose day: "Dose day. Log it when you're done" with a one-tap log.
   - Otherwise: "Day 3 since your dose" (computed on the client).
   - For daily pills: "Taken today?" with a one-tap log.
3. **`ProteinGauge`** for today, with "Snap a meal" and "Describe it instead" buttons.
4. **"Close the gap"** (only when protein is short after 2pm local): three small-appetite suggestions from the `suggest-protein` function (§5.6). They fit the remaining grams and today's nausea and appetite level.
5. **Check-in** (`CheckInDial`): Food noise, Nausea, Energy. Shows "Done ✓" once logged today.
6. **Today's strips:** a mini log of today's `FlightStrip`s.
7. **Safety line,** shown only when the check-in has nausea at 4: "If you can't keep fluids down or have severe stomach pain that won't go away, contact your prescriber or seek urgent care." Links to `/safety`.

### 5.4 Meal capture and analysis (`/log/meal`, server function `analyze-meal`)
**Inputs:**
- **Take a photo:** `<input type="file" accept="image/*" capture="environment">`.
- **Upload.**
- **Describe it:** free text, e.g. "2 eggs, greek yogurt with berries, coffee with milk".

**Flow:** compress → progress steps → result sheet.

**Server function `analyze-meal`:**
- Input: `{ imageBase64? , description?, proteinLeftG, region: "US" }`.
- Uses `AI_VISION_MODEL` for images and `AI_MODEL` for text.
- Validates output against:

```ts
type MealAnalysis = {
  title: string;                                   // "Greek yogurt bowl with berries"
  items: { name: string; portion: string; proteinG: number; confidence: "low" | "medium" | "high" }[];
  proteinLowG: number; proteinHighG: number;       // honest range
  proteinEstimateG: number;                        // midpoint, rounded
  isLikelyFood: boolean;                           // false if the photo isn't food
  boost: { idea: string; extraProteinG: number }[];// 1–3 easy ways to add protein to THIS meal
  note: string | null;                             // one short, kind sentence; no medical advice
};
```

**System prompt for `analyze-meal`** (store it as a constant in the function):
> You estimate the protein in a meal from a photo or a description, for an adult on a GLP-1 medication who is trying to reach a daily protein target. Return ONLY JSON matching the schema.
> 1. Identify visible foods and plausible portions. Be honest about uncertainty: give a low–high protein range and per-item confidence. Do not invent hidden ingredients.
> 2. If the image is not food, set isLikelyFood=false and return empty items.
> 3. Suggest 1–3 small, easy ways to add protein to this meal that suit a small appetite (e.g., Greek yogurt, cottage cheese, eggs, protein milk, tofu, beans, tuna, a protein shake).
> 4. Never comment on calories, weight, or whether the meal is "good" or "bad". No medical advice. No dosing advice.
> 5. JSON only, no markdown.

**Result sheet:**
- The meal title, item rows with grams in mono, and the range "≈ 28g (22–34g)".
- The `ProteinGauge` preview showing where the day will land.
- "Boost it" chips.
- Buttons: **Log it** (the user can adjust the grams with a stepper first) and **Retake**.
- A non-food image shows: "That doesn't look like a meal. Try again or describe it."
- If the AI fails or takes more than 20s: "Couldn't read this one. Describe it instead?" For demo meals, fall back to the pre-computed result with a small "Demo estimate" tag.

### 5.5 Quick logs (bottom sheets)
- **Dose:**
  - Medication (prefilled) and dose text (prefilled from the last entry; free text only).
  - For injections, the site: Abdomen L/R, Thigh L/R, Arm L/R. Show the last site used with "Last: L thigh", but **never** recommend a site.
  - Time and an optional note.
  - Writes a `FlightStrip`.
- **Check-in:** Food noise 0–4 ("quiet" → "loud"), Nausea 0–4, Energy 0–4, plus an optional note.
- **Weigh-in:** weight (with the "hide weight numbers" option respected) and the date.
- **Workout:** Strength / Cardio / Walk, minutes.

### 5.6 Protein suggestions (server function `suggest-protein`)
- **Input:** `{ proteinLeftG, nausea0to4, appetite: "small" | "normal", dietaryPrefs: string[], timeOfDay }`.
- **Output:** `{ options: { name: string; proteinG: number; why: string }[] }`, with exactly 3 options.
- **Rules:**
  - Simple, gentle foods when nausea ≥ 3.
  - Respect the dietary preferences from Settings: vegetarian, vegan, dairy-free, halal, kosher, no pork.
  - No calorie talk and no medical claims.
- **Cache:** one call per hour per user.

### 5.7 Flight path and weekly report (`/path`)
1. **`FlightPathChart`:**
   - Range: 4 weeks / 3 months / All.
   - Shows the 7-day moving average, raw dots, dose-change ticks, and the landing zone band when one is set.
   - If weight is hidden, show the shape only, with no axis numbers.
2. **Phase card:** current phase (user-chosen; can be changed any time in Settings) with a short description.
3. **This week (instrument row):**
   - Protein target hit on X/7 days
   - Strength sessions X
   - Average food noise X.X (with an arrow versus last week)
   - Average nausea X.X
4. **Your patterns,** computed on the client from the user's own data and shown only with enough data:
   - Average nausea by day since dose (needs at least 3 dose cycles).
   - Food noise trend in the 14 days after any dose change.
   - Protein on dose day versus other days.
   - Every pattern states its numbers, e.g. "Nausea averaged 2.8 on days 1–2 after your dose vs 0.9 on other days (last 4 weeks)".
   - **Never** make a causal claim.
5. **Weekly flight report** (server function `flight-report`, Plus feature):
   - **Input:** the aggregated weekly numbers above, never raw notes.
   - **Output:** `{ headline, wins: string[2-3], focus: { title, why, howThisWeek: string[3] }, patternNotes: string[] }`. Every number it uses must come from the input.
   - **Tone:** co-pilot.
   - **Generation:** on demand with a button.

### 5.8 Landing mode (`/landing-mode`)
The signature feature. **Start:** "You and your prescriber have decided to taper, pause, switch to a pill, or stop. Let's land it."
- **Setup:**
  1. **What's changing:** taper, pause, switch to pill, or stop. The user enters the date. Landed never suggests a schedule.
  2. **Landing weight:** defaults to the current 7-day average, editable.
  3. **Landing zone width:** ±2% / ±3% / ±5% of the landing weight. Default ±3%.
  4. **Your keep-it-off habits:** protein days per week (default 5), strength sessions per week (default 2), weigh-ins per week (default 3).
- **Status screen:**
  - The flight path zoomed to the last 8 weeks, with the runway band.
  - A big status instrument: **ON COURSE** (green), **DRIFTING** (amber; the 7-day average is in the outer 25% of the zone, or rising more than 0.5% a week for 2 weeks), **COURSE CORRECTION** (beacon red; the 7-day average is above the zone).
  - Food-noise trend since the change date.
  - This week's habit scoreboard.
- **Course correction:** when status is DRIFTING or worse, show a 3-step plan:
  - Protein first at every meal this week.
  - Add one strength session.
  - Plan for the loudest food-noise time of day (from their check-ins).
  - The prompt "Talk to your prescriber about what you're seeing," with a one-tap link to the clinician report.
  - Language is always calm and non-judgmental.
- **Notifications:** for the MVP, "Add weigh-in reminders to my calendar" (.ics, 3× a week).

### 5.9 Clinician report (`/report`)
One print-friendly page (CSS `@media print`) with a "Download PDF" button (the browser's print-to-PDF) and "Share link" (Plus, signed-in only; a read-only tokenized URL that expires in 14 days). It contains:
- Medication and dose history (table).
- Weight trend chart and the start, current and lowest weights.
- Side-effect check-in averages by week.
- Protein target hit rate, strength sessions per week.
- Landing mode status, if active.
- Footer: "Generated by the patient using Landed. Not a medical record."

### 5.10 Demo pilot (demo safety net)
`/demo` loads a realistic, **fictional** 10-week dataset into local state (not the database). Dates are computed relative to today at runtime:
- **Medication:** "Jordan", Zepbound, weekly on Sundays, dose steps 2.5 → 5 → 7.5 mg.
- **Weight:** 214 → 196 lb with realistic noise and a 2-week plateau.
- **Side effects:** check-ins with nausea higher on days 1–2 after the dose.
- **Habits:** protein hit on most days, with strength twice a week in most weeks.
- **Landing mode:** active, started 3 weeks ago ("switched to pill"), currently **DRIFTING** so the course-correction flow is visible.
- **Demo meals:** 4 meals with pre-computed `MealAnalysis` results:
  - Greek yogurt bowl ≈ 24g
  - Chicken Caesar wrap ≈ 32g
  - Two eggs on toast ≈ 15g
  - Lentil soup ≈ 13g

  Each comes with a local illustration (inline SVG or CSS art; no external photos). Tapping a demo meal runs the live AI on its description first and falls back to the pre-computed result.
- **Banner:** "You're flying the demo. Build your own flight plan →" stays visible and dismissible. "Exit demo" clears it.

### 5.11 Landed Plus (`/plus`) and limits
- **Free forever:** dose, check-in, weigh-in and workout logs; the protein gauge with manual or described meals (3 AI meal estimates per day); the flight path; phase; 1 clinician report per month.
- **Plus:** unlimited photo meal estimates, "Close the gap" suggestions, weekly flight reports, Landing mode with drift detection and course corrections, unlimited clinician reports and share links. **$9.99/month or $49.99/year.** These prices are a hypothesis to test. Competitors charge $9.99–14.99/mo.
- **Paywall,** sections in order:
  1. Honest social proof: no fake reviews or ratings; use "Built with people on GLP-1s" until real testimonials exist.
  2. Outcome headline: "Land it, and keep it."
  3. 4 features with their outcomes.
  4. Clear pricing, the yearly saving computed correctly, and renewal terms in plain words.
  5. The **"Free features stay free" promise.**
  6. CTA "Start Landed Plus", "Cancel anytime", and Manage subscription.
- **For the Builders Week demo:**
  - Demo mode unlocks every Plus feature.
  - Checkout runs in **Stripe test mode**, with a visible "Demo checkout: use card 4242 4242 4242 4242".
  - Judges are never blocked.

### 5.12 Accounts, guest mode and data
- **Guest mode:**
  - All logs are stored in `localStorage`/IndexedDB with an `anon_id`.
  - After the first meal log or the third app open, show a soft sheet: "Save your flight log so it's safe across devices" (Sign up / Not now).
  - On sign-up, migrate everything to the database.
- **Settings:**
  - Name, medication and schedule, phase, units, protein target, dietary preferences, theme.
  - **"Hide weight numbers"**: a shape-only charts mode.
  - Export my data (JSON and CSV).
  - Delete all data (typed confirmation), Delete account.

### 5.13 Safety page (`/safety`) and guardrails
- **Plain language:** "Landed is a tracking and coaching companion, not medical care. It doesn't diagnose, and it never tells you what dose to take or when to stop. Always talk to your prescriber about your medication."
- **Contact your prescriber or seek urgent care for:**
  - severe stomach pain that doesn't go away
  - vomiting so you can't keep fluids down
  - signs of dehydration
  - yellowing skin or eyes
  - signs of an allergic reaction
  - thoughts of harming yourself

  If you're in the US and thinking about suicide, call or text **988**.
- **Eating safeguards:** no calorie tracking anywhere, no red for "too much food", and no streaks that reset.
- **Low-intake prompt:** if a user logs under 40% of their protein target on 5 of 7 days, show a gentle note: "It looks like eating enough has been hard this week. That's common on GLP-1s, and worth mentioning to your prescriber or a dietitian."

## 6. Data model (Bolt Database; RLS on every table)

```
profiles     id (uuid = auth user id, pk), display_name text, birth_confirmed_adult boolean,
             medication text, med_form text ('injection'|'pill'), dose_weekday int null, dose_time text null,
             current_dose text, phase text ('takeoff'|'cruise'|'holding'|'descent'|'landed'),
             start_weight_kg numeric null, goal_weight_kg numeric null, height_cm numeric null,
             units text default 'lb', protein_target_g int, dietary_prefs text[], strength_baseline text,
             worries text[], hide_weight boolean default false, theme text, plan text default 'free',
             created_at timestamptz default now()

doses        id uuid pk, user_id uuid, taken_at timestamptz, medication text, dose_text text,
             site text null, note text null, created_at timestamptz default now()

meals        id uuid pk, user_id uuid, eaten_at timestamptz, title text, protein_g int,
             protein_low_g int null, protein_high_g int null, source text ('photo'|'text'|'manual'|'demo'),
             analysis jsonb null, created_at timestamptz default now()      -- never store photos

checkins     id uuid pk, user_id uuid, day date, food_noise int, nausea int, energy int, note text null,
             unique (user_id, day)

weights      id uuid pk, user_id uuid, day date, weight_kg numeric, unique (user_id, day)

workouts     id uuid pk, user_id uuid, day date, kind text, minutes int

landing_plans id uuid pk, user_id uuid, change_kind text, change_date date, landing_weight_kg numeric,
             zone_pct numeric, habit_protein_days int, habit_strength int, habit_weighins int,
             active boolean default true, created_at timestamptz default now()

reports      id uuid pk, user_id uuid, week_start date, content jsonb, created_at timestamptz default now()

share_links  id uuid pk, user_id uuid, token text unique, expires_at timestamptz

events       id bigserial pk, anon_id text, user_id uuid null, name text, props jsonb, path text,
             created_at timestamptz default now()
```

**Access rules:**
- **Owner-only tables:** every health table is readable and writable only by its owner (`user_id = auth.uid()`).
- **Shared clinician report:** `share_links` are resolved only through a server function that returns the report data for a valid, unexpired token.
- **`events`:** insert-only through a rate-limited `track` server function, and never containing health values.

## 7. Analytics events
**Event list:**
- `landing_view`, `cta_flightplan_clicked`, `demo_started`
- `onboarding_step` {step}, `onboarding_skipped` {step}, `onboarding_completed` {phase, med_form}
- `meal_capture_started` {method}, `meal_analyzed` {ms, source}, `meal_analysis_failed` {reason}, `meal_logged`
- `dose_logged`, `checkin_logged`, `weight_logged`, `workout_logged`
- `gap_suggestions_viewed`, `path_viewed`, `report_generated`
- `landing_mode_started` {change_kind}, `course_correction_viewed`
- `clinician_report_opened`
- `signup_prompt_shown`, `signup_completed`
- `paywall_viewed` {trigger}, `checkout_started`, `checkout_completed`
- `day2_return`, `day7_return` (computed on app open from the first-open date)

**Never put health values in event props.**

**`/founder` shows:**
- The funnel for the last 7 and 30 days: landing_view → onboarding_completed or demo_started → meal_logged → day2_return → day7_return → signup_completed → checkout_completed.
- The phase mix and medication-form mix.
- Median meal-analysis time and failure rate.
- Landing mode starts.

## 8. Quality bar
- The demo path works on a 375px iPhone viewport with and without AI keys.
- No console errors. Lighthouse mobile: Performance ≥ 85, Accessibility ≥ 95.
- Every async action has loading, success, empty and error states written in the brand voice.
- Day-since-dose, weekly windows and moving averages are correct in the local time zone, including across week boundaries.
- No dose advice, no diagnosis, no calorie talk, and no statistic outside §2 anywhere in the UI or AI output.
