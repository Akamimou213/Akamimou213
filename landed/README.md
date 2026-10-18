# Landed — app code

**Landed** is a mobile-first web app for people on a GLP-1, whether a weekly shot or a daily pill. It has:

- protein from a photo or a description
- 10-second check-ins
- the weight trend drawn as a flight path
- **Landing mode** for when the dose changes or stops

Stack: Vite + React 18 + TypeScript + plain CSS, with a single dependency, `react-router-dom`.

It works **fully offline with no keys**:

- demo mode
- every log
- typed meal estimates (built-in food table)
- patterns, Landing mode and the clinician report

Photo estimates turn on once you deploy the server function and set its URL.

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build to dist/
```

## Getting it into Bolt

### ⚠️ Read this first: the contest rules
The Builders Week rules say *"The initial structure and main development must begin in Bolt.new"*. The submission form also makes you attest *"I built this project primarily in Bolt."* If you import this whole codebase and submit it, that attestation is hard to defend, and "Use of Bolt" is 25% of the score and the tiebreaker. You have two options:

**Option A, safest for the contest (recommended):** let Bolt build it, using this code as the reference.
1. Start a **new project in Bolt** and paste `../bolt-builders-week/01-PROJECT-KNOWLEDGE.md` into Project Knowledge.
2. For each phase in `../bolt-builders-week/02-BUILD-PROMPTS.md`, **attach the matching files from this folder** (Bolt supports attaching files as context). Add this line to the prompt: *"Use the attached files as the reference implementation. Match their behavior and design exactly."*

   | Phase | Attach |
   |---|---|
   | 1 | `src/styles.css`, `src/components/instruments.tsx`, `src/components/ui.tsx`, `src/lib/types.ts`, `src/lib/calc.ts`, `src/lib/store.tsx`, `src/lib/demo.ts`, `src/screens/Today.tsx`, `src/App.tsx` |
   | 2 | `src/screens/LogSheets.tsx`, `src/screens/LogScreen.tsx`, `src/lib/protein.ts` |
   | 3 | `src/lib/ai.ts`, `supabase/functions/analyze-meal/index.ts` |
   | 4 | `src/screens/Path.tsx`, `src/screens/LandingMode.tsx`, `src/screens/Report.tsx`, `src/screens/Info.tsx`, `src/lib/ics.ts` |
   | 6 | `src/screens/Onboarding.tsx`, `src/screens/Landing.tsx`, `index.html`, `public/*` |
   | 8 | `src/screens/Plus.tsx` |

3. Bolt writes the code, and you guide and review it. This is "built primarily in Bolt", and the result will be close to this version.
4. In the submission's tool disclosure, say: *"Claude Code was used to write a reference implementation and spec that Bolt built from."*

**Option B, fastest (higher rule risk):** import the code.
1. Put this folder at the **root** of its own GitHub repo. Bolt's import may not support subfolders.
2. On bolt.new, click **GitHub** under the chat box, then "Import from URL", paste the repo URL, and click "Choose this repository".
3. Do the backend, Stripe, publishing and every further change inside Bolt, and disclose that the initial code came from Claude Code.

Whichever you pick, **do the backend work inside Bolt.** Phase 5 covers database, auth and guest migration. Phase 7 covers analytics. Phase 8 is Stripe in test mode. That is real, visible use of Bolt.

## Turning on photo estimates (Bolt server function)
1. Ask Bolt: *"Create a server function `analyze-meal` with exactly the code in `supabase/functions/analyze-meal/index.ts`."*
2. Add these **Secrets** in Bolt:
   - `AI_API_KEY` (your OpenRouter key)
   - `AI_BASE_URL` = `https://openrouter.ai/api/v1`
   - `AI_MODEL` (text model)
   - `AI_VISION_MODEL` (a model whose OpenRouter page lists **image input**)
3. Set these environment variables for the frontend:
   - `VITE_ANALYZE_MEAL_URL`: the function's URL
   - `VITE_SUPABASE_ANON_KEY`: the project's anon key, if Bolt's functions require it
4. Without them, the camera button tells the user to describe the meal instead, and demo meals use their pre-computed estimates. Nothing breaks.

## Optional settings
| Variable | What it does |
|---|---|
| `VITE_CHECKOUT_URL_MONTHLY` / `VITE_CHECKOUT_URL_YEARLY` | Stripe Checkout or Payment Link URLs (test mode) for the Plus button. Or replace them with Bolt's built-in Stripe integration in Phase 8. |

## Where things live
| What | File |
|---|---|
| Design tokens (light "clear day", dark "night cockpit") and every style | `src/styles.css` |
| Protein gauge, flight-path chart, phase indicator, check-in dials, flight strips, annunciator | `src/components/instruments.tsx` |
| Date math, 7-day trend, Landing-mode status, weekly stats, patterns | `src/lib/calc.ts` |
| Offline protein estimator and "Close the gap" suggestions | `src/lib/protein.ts` |
| Demo pilot (10 weeks of fictional data, built relative to today) | `src/lib/demo.ts` |
| Local store (localStorage) and privacy-safe event log | `src/lib/store.tsx` |
| Meal AI client (compression, timeout, sanitizing, offline fallback) | `src/lib/ai.ts` |
| AI server function (Deno / Supabase edge) | `supabase/functions/analyze-meal/index.ts` |
| Screens | `src/screens/*` |

## What's deliberately left for Bolt
- Accounts, the database and guest-to-account migration (Phase 5). Data lives in `localStorage` for now.
- The `/founder` analytics dashboard (Phase 7). Events are already recorded locally by `track()`.
- Real Stripe checkout and the Plus entitlement from the webhook (Phase 8).
- Clinician share links (Phase 5). The printable report already works.

## Safety rules the code enforces
- No dose, titration or taper advice. The AI output is filtered server-side and client-side.
- No calorie talk, no streaks that reset, and an option to hide weight numbers.
- A safety line appears when nausea is logged at 4/4.
- A gentle low-intake note appears after 5 low days.
- Meal photos are compressed on the device, sent once, and never stored.
- No third-party trackers.
- Every statistic shown is sourced. See `../bolt-builders-week/README.md`.
