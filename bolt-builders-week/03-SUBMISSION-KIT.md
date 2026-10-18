# Opened: submission kit, demo script, validation and economics

## 1. Timeline (all times PT)

| When | Do |
|---|---|
| **Sun Oct 18, now → 23:59** (free GLM 5.3 Flash) | Phases 0–4, then 6. This is the full demo path. Save a version after each one. |
| **Mon Oct 19** | Phases 5, 7, 8 (optional). Send the landing link to 10 people and run 5 interviews (§4). |
| **Tue Oct 20, by ~18:00** | Phase 9 QA, Publish, record the demo video, submit. Leave buffer before the 23:59 deadline. |
| **Tue Oct 20, 10–11am** | Optional: the live "Ask Eric & Albert anything" session. |

After the free weekend, GLM 5.3 Flash isn't free anymore. Phases 5–9 will use your normal Bolt plan tokens, so keep those prompts small.

## 2. Submission form answers

**Project name:** Opened

**Live link:** `https://<your-subdomain>.bolt.host`. It must be public and free to open, with the core flow usable without paying.

**One-line description:**
> Snap any scary letter, bill or notice. In 20 seconds Opened tells you what it is, whether you need to act, by when, and writes the reply for you.

**Longer description** (adapt it to the form's length limit):
> Millions of people let official mail pile up unopened, not because they're lazy, but because they're afraid of what's inside. 37% of US adults paid a late fee last year (NerdWallet, 2024). Yet 79% of people who asked for a fee to be waived got it (LendingTree, 2025). Fewer than 1% of denied health-insurance claims are ever appealed (KFF, 2026).
>
> Opened turns that dread into a 20-second, calm verdict. You photograph the letter, and the text is read on your phone (photos never leave the device), with account numbers auto-hidden. Opened then shows you, in plain words: what it is, whether you must act, the deadline (with the exact quote it came from), what happens if you ignore it, and whether it looks like a scam. One tap writes the fee-waiver request, appeal, cancellation or phone script. The deadline goes into your calendar, and the letter stays in "The Pile" until it's done. Wins shows the money you protected.
>
> Business model: 3 free letters a month; Opened Plus ($6.99/mo or $49.99/yr) for unlimited letters, drafts and phone scripts.

**How it uses Bolt:** built entirely in Bolt with GLM 5.3 Flash, using:
- **Plan mode** for the architecture
- **Project Knowledge** as the living product spec
- **Bolt Database** with row-level security and the security audit
- **Bolt Auth** with guest-to-account migration
- **Server functions** for the AI analysis and draft writing, with schema validation and anti-hallucination checks
- **Secrets** for the API keys
- **Bolt's Stripe integration** (test mode) for Opened Plus
- **Publish** to bolt.host
- **Version history** between build phases

**Tools besides Bolt (required disclosure):**
- **OpenRouter API** (routing to the GLM 5.3 Flash model) for in-app letter analysis and drafts, called from Bolt server functions
- **tesseract.js** and **pdf.js** (open-source, Apache-2.0) for on-device text extraction
- **Google Fonts** (Fraunces, Public Sans, IBM Plex Mono)
- **Stripe** in test mode
- **Claude** (AI assistant) for idea research and for writing the build spec, as the rules allow for idea development.

Adjust this list to what you actually end up using.

## 3. Demo video script (90–120 s; optional but worth it)

Record on your phone, screen-recording the live link, with your voice over it. Plain is fine; real is what matters.

| Time | Screen | Voice-over |
|---|---|---|
| 0–10s | A real (blurred) pile of envelopes on a table | "This is what a lot of people's mail looks like. Not because they're lazy. Because opening it is scary." |
| 10–20s | Landing hero, envelope opens to a postmark | "Opened reads your scary mail so you don't have to." |
| 20–45s | Take a photo of the parking-notice sample (printed) or tap the sample → the review screen shows numbers hidden → Open it → progress steps | "Snap it. The text is read on your phone, the photo never leaves it, and account numbers are hidden before anything is sent." |
| 45–65s | Verdict: `ACT BY…` postmark, plain words, days left, "If you ignore it: rises from £35 to £70", "Where we got this" quotes | "In 20 seconds: what it is, by when, what happens if you ignore it, and where every date and number came from in the letter." |
| 65–80s | Harbor Bank sample → "Ask them to waive the fee" → draft → Copy | "79% of people who ask for a late fee to be waived get it. Most people never ask. Opened writes the ask for you." |
| 80–90s | Scam sample → red `LOOKS LIKE A SCAM` stamp | "And it tells you when a letter isn't real." |
| 90–105s | Add to calendar → Mark done → green DONE stamp → The Pile → Wins | "Then the deadline's in your calendar and the letter's tracked until it's done." |
| 105–120s | Landing CTA | "Opened. Your scary mail, opened for you. Built in Bolt." |

## 4. Validation plan (do some of it before submitting; it strengthens "Potential impact")

### Interview script (10 people, 15 minutes each)
Don't ask "Would you use this?" Ask about the last time it happened:
1. "Tell me about the last official letter or bill you put off opening. What was it?"
2. "How long did it sit there? What finally made you open it?"
3. "What did it cost you, in money, time or stress? Any late fee, penalty, collection or credit hit?"
4. "What did you try? Partner, autopay, ChatGPT, a folder?" Then: "What was annoying about that?"
5. "Who else in your life deals with this?"
6. At the end, show the live link and say "Open one letter you have right now." Watch. Don't help.

**Signal to look for:** at least 3 of 10 people name a concrete cost in the last 6 months, and at least 5 of 10 open a real letter in the app without help.

### Concierge test (from today)
- Post in your own channels: "Send me a photo of a letter you're avoiding, numbers blacked out, and I'll tell you what it is and what to do."
- Deliver the answer with the app.
- Count how many people send a second letter. That is your frequency signal.

### Landing metrics (from `/founder`)
These are targets to judge the experiment against. They are **not** industry benchmarks.

| Step | Target |
|---|---|
| Visit → start capture or open a sample | ≥ 25% |
| Start capture → verdict | ≥ 60% |
| Verdict → next step clicked | ≥ 40% |
| Second letter within 30 days | ≥ 30% of activated users |

## 5. Unit economics (scenarios; every input is an assumption unless sourced)

**AI cost per letter.** Assume ~4,000 input + ~1,500 output tokens for the analysis, plus a similar call for a draft. At about $0.15 / $0.50 per million tokens ([Artificial Analysis listing for GLM 5.3 Flash](https://artificialanalysis.ai/models/glm-5-3-flash); OpenRouter's EU route lists $0.10 / $0.69):
- Analysis: 4,000 × $0.15/1M + 1,500 × $0.50/1M = $0.0006 + $0.00075 ≈ **$0.0014**
- With a draft: ≈ **$0.003 per letter**. Even 30 letters a month is about $0.09.

**Net revenue per payer**, assuming Stripe's standard US card fee of 2.9% + $0.30 (check your country and Stripe account):
- Monthly: $6.99 − ($0.20 + $0.30) ≈ **$6.49 per month**
- Yearly: $49.99 − ($1.45 + $0.30) ≈ **$48.24 per year**

**LTV by assumed monthly churn** (monthly plan only, AI cost ignored as negligible):

| Monthly churn | Expected lifetime | LTV (net) |
|---|---|---|
| 8% | 12.5 months | ≈ $81 |
| 12% | 8.3 months | ≈ $54 |
| 15% | 6.7 months | ≈ $43 |

**Implication:** keep blended **CAC per paying user under about $40**, so payback stays inside one lifetime even at 15% churn.

Worked example: if paid social brings sign-ups at $1.50 each and 4% of sign-ups convert to Plus, CAC per payer = $1.50 / 0.04 = **$37.50**. That's just inside the limit, which means the free-to-paid rate is the metric to obsess over. Both inputs are hypotheses to test with a small Spark Ads / Meta budget once one organic creative works.

**Measurement caveat:** judge paid channels on sign-up → verdict → Plus in your own `events` table, not on platform-attributed installs or CTR. Treat any lift from creators as correlational until you've run a holdout or geo split.

## 6. Go-to-market (after the contest)

1. **Creative angle:** "Opening my 6-month mail pile with AI." It's an unboxing format with real stakes and a reveal on every envelope. Variants:
   - "Things my scary mail actually said"
   - "This letter looked terrifying. It was a $0 notice."
   - "I asked for my late fee back (79% of people who ask get it)"
2. **Formats:**
   - Faceless slideshows (letter → verdict stamp)
   - UGC creators from ADHD and personal-finance niches
   - Founder POV.
   - Spark Ads on the winners.
3. **Communities:** be useful, not spammy. Many subreddits ban self-promotion, so read the rules and answer questions instead of posting links. ADHD coaches and creators can share it with their audiences.
4. **Partnerships later:** credit unions, neobanks with ADHD or financial-wellbeing programs, employers' wellbeing benefits, caregiver organizations (Family mode).
5. **Native iOS** once 30-day repeat use is proven: push reminders, camera document scanning, and the App Store paywall playbook from your notes. That's where the onboarding-and-paywall advice applies in full.
