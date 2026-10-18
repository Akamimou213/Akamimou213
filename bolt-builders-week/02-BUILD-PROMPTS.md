# Opened: build sequence for Bolt (GLM 5.3 Flash)

**Why it's split into phases:** Bolt's own guidance is to state the architecture first and then add one feature per prompt, testing each step. GLM 5.3 Flash is a fast, cheap "Forge" model. Bolt itself calls Forge models experimental and less reliable than Standard/Max, and benchmarks flag GLM as verbose. Small, checkable steps get you a working app. One giant prompt gets you a half-working one.

## Before you start (5 minutes)

1. **New project** on bolt.new. Pick **GLM 5.3 Flash** in the model picker. It's free until **Sun Oct 18, 11:59pm PT**, in 6-hour usage blocks, and unused blocks don't carry over.
2. Paste `01-PROJECT-KNOWLEDGE.md` into **Project settings → Knowledge**.
3. Get an AI key for the in-app analysis. Bolt has no built-in keyless LLM for generated apps, so you need your own. The default is an **OpenRouter** key (one key, and you can swap models via the `AI_MODEL` secret). Add the key when Bolt asks for it in the **Secrets** tab, never in chat.
4. **Use Version History** (or duplicate the project) after every phase that works. If a phase breaks things, roll back instead of asking the model to "fix" it five times.
5. **If you only have time for part of it,** the demo-critical phases are **1 → 2 → 3 → 4 → 6 → 9**. Phases 5, 7 and 8 are what make it a business, and they score on "Use of Bolt" and "Potential impact".

Each phase below has: the prompt to paste, then **"Check before moving on"** for you, not for Bolt.

---

## Phase 0: Plan (use **Plan mode**, no code)

```
Read the project Knowledge carefully. It is the full spec for "Opened".

Do not write code yet. In Plan mode, give me:
1. The folder/file structure you will create (src/components, src/screens, src/lib, src/data, server functions).
2. The list of reusable components, including the signature ones (EnvelopeCard, Postmark, StampBadge, PaperSheet, the opening animation).
3. The order you'll build in, matching the phases I'll send: (1) design system + shell + Pile with sample data, (2) capture + on-device OCR + review, (3) analyze-letter server function + verdict screen, (4) drafts + calendar + done + wins, (5) database + auth + guest migration, (6) onboarding + landing page + SEO + PWA, (7) analytics + founder dashboard, (8) Plus paywall with Stripe test mode, (9) polish + QA.
4. Any spec conflict or risk you see, in at most 5 bullets.

Keep it under 400 words.
```

**Check before moving on:** the plan names the signature components and doesn't invent extra features. If it suggests a different stack, reply: "Keep the stack in the Knowledge."

---

## Phase 1: Design system, app shell, The Pile with sample data

```
Implement Phase 1 only.

Build:
1. Design tokens from Knowledge §3 as CSS variables (light + dark "night desk"), wired into Tailwind theme colors. Load Fraunces, Public Sans, IBM Plex Mono from Google Fonts with fallbacks. Base font 17px.
2. Signature components: EnvelopeCard, Postmark (rotated ring stamp with status word + date, SVG ink texture), StampBadge (perforated edges via CSS mask), PaperSheet (paper grain via inline SVG noise at ~3% opacity, folded top-right corner). Build a hidden /styleguide route that shows every component in every state, light and dark.
3. App shell: bottom tab bar (Pile, the raised center "Open a letter" envelope button, Wins), safe-area insets, centered app column max-width 480px, header with the Opened wordmark in Fraunces.
4. src/data/samples.ts: the five fictional sample letters from Knowledge §5.10 as full realistic letter text (150–300 words each, with a letter date, reference numbers, and the deadline wording given in the spec) plus a complete pre-computed LetterAnalysis for each. Compute every date relative to today at runtime (e.g. the gym renewal is today + 26 days, the parking notice is dated today − 3 days). Add the LetterAnalysis type and a zod schema in src/lib/schema.ts.
5. A local store (React context + localStorage) holding letters. Seed nothing by default. Add a "Try a sample letter" sheet listing the 5 samples as envelopes; choosing one adds it to the store as is_sample=true and routes to /letter/:id.
6. The Pile screen (Knowledge §5.7) with sections Overdue / This week / Later / No action needed / Done, the plain-words header summary, the empty state with an inline SVG mail tray illustration, and swipe actions plus accessible buttons for Snooze/Done.
7. A placeholder /letter/:id that shows the title and the Postmark for now.

Do not build capture, AI, auth or the landing page yet. No emoji in the UI. No purple, no gradients, no glass effects.
```

**Check before moving on:**
- On a phone-sized preview, does it look like a calm post office or like a template? If generic, send: "This looks like a generic template. Push the post-office concept harder: envelope shapes, postmarks, stamp perforations, paper grain. Fewer boxes with icons. Show me the /styleguide."
- Do the sample dates move with today's date? Does "Overdue / This week" sorting work?

---

## Phase 2: Capture, on-device OCR, review and redaction

```
Implement Phase 2 only: the /open flow from Knowledge §5.3.

1. Three entry options as large, stamp-styled buttons: "Take a photo" (input accept="image/*" capture="environment" multiple), "Upload photo or PDF", "Paste text or email".
2. Page thumbnails (max 6) with reorder and delete.
3. On-device text extraction: tesseract.js (English) for images, with a per-page progress bar; pdfjs-dist for PDFs, falling back to rendering the page to a canvas and running OCR when there's no text layer. Downscale images to max 2000px on the long side before OCR. Run OCR in a worker so the UI never freezes.
4. Review screen: "Here's what we read. Fix anything that looks wrong." Editable textarea. Implement src/lib/redact.ts that masks runs of 8+ digits (keep last 4 → ••••1234), SSN-like ###-##-####, UK National Insurance numbers, IBAN-like strings and 13–19 digit card numbers. Show the redacted version by default; a "Show hidden numbers" toggle reveals the originals locally only. Write unit-style examples at the top of redact.ts as comments and make sure they pass.
5. If the extracted text is under 80 characters, show the "We couldn't read much…" message from the spec and offer "Paste text instead". Do not continue.
6. The primary button "Open it" goes to an Analyzing screen with the 4 progress steps from Knowledge §3 (for now, simulate 3 seconds and then show a "Analysis is coming in the next step" note). Keep the redacted text in state.

Photos must never be uploaded anywhere. Don't touch the Pile or the design tokens.
```

**Check before moving on:** photograph a real letter on your phone through the Bolt preview (or upload a photo). Is the text mostly right? Are account numbers masked? Does the paste path work?

---

## Phase 3: AI analysis server function and the Verdict screen

```
Implement Phase 3 only.

1. Create a Bolt Cloud server function "analyze-letter" exactly as described in Knowledge §5.4:
   - Calls an OpenAI-compatible Chat Completions endpoint using secrets AI_BASE_URL (default https://openrouter.ai/api/v1), AI_API_KEY, AI_MODEL (default z-ai/glm-5.3-flash). Ask me to add these in the Secrets tab. Never expose them to the client.
   - Uses the system prompt from §5.4 verbatim as a constant, response_format json_object, temperature 0.2, 45s timeout.
   - Validates with the shared zod schema; on failure retries once, appending the validation errors; on second failure returns { error }.
   - Rejects input over 20,000 characters with a friendly error. Logs duration and errors (never the letter text) for debugging.
2. Wire the Analyzing screen to call it with { text, region, today, readingLevel }. Show the 4 progress steps while waiting. On success, save the letter to the local store and route to /letter/:id.
3. Samples: run live AI first; if it fails or takes more than 20s, use the pre-computed analysis and show a small "Demo result" tag.
4. Build the full Verdict screen from Knowledge §5.5, in that exact order: the opening animation (envelope flap lifts, letter slides up, postmark stamps down; max 1.2s; plays once; disabled under prefers-reduced-motion), Postmark verdict + title + StampBadge, "In plain words" with "Explain it simpler", the mono fact strip with days-left math done on the client with date-fns, "Your one next step" card, "If you ignore it" with the basis label, "Is it legit?", Options, a tick-able Checklist (saved), Key facts, "Where we got this" (evidence quotes), "Things we're not sure about" (1–3 filled stamps for confidence), footer actions (calendar/snooze/done placeholders are fine for now), and the disclaimer.
5. Missing deadline or amount always shows "Not stated in the letter". Never show a number the analysis didn't return.

Test with the 5 samples and tell me the verdict each one gets.
```

**Check before moving on:**
- Expected verdicts: health denial → `act_soon`; parking → `act_now` or `act_soon` depending on days left; bank fee → `act_soon` with a `fee_waiver` suggestion; gym → `act_soon` with `cancel`; vehicle warranty → `possible_scam`.
- Open a real letter. Does every deadline and amount have a quote in "Where we got this"? If the model invents anything, send: "The analysis returned {X}, which is not in the text. Tighten validation: if deadline.date or amount.value is set, deadline.quote or amount.quote must be a substring of the input text (case-insensitive, whitespace-normalized); otherwise set them to null and add an uncertainty. Enforce this in the server function after parsing."
- Remove the AI key temporarily. Do the samples still work (as "Demo result")?

---

## Phase 4: Drafts, calendar, done and Wins

```
Implement Phase 4 only.

1. Server function "draft-reply" per Knowledge §5.6 (same AI secrets, same validation + retry pattern). Output { subject, body, phoneScript: { opener, keyPoints[], ifTheySayNo }, attachChecklist[], sendTo|null }. sendTo must be a substring of the letter text, otherwise null. Use [Your name] when the user's name isn't known.
2. Draft editor at /letter/:id/draft/:type: type chips for the letter's suggestedDrafts, channel switch (email / letter / phone), tone switch (polite / firm), editable body with highlighted [placeholders], Copy, "Open in email app" (mailto with subject and body, URL-encoded), Download .txt, Regenerate. A phone script renders as a calm "What to say" card: opener, key points as checkboxes, "If they say no".
3. After copy/send, ask "Did you send it?" Yes → save a letter_action (local for now) and offer "Mark this letter done".
4. Calendar: generate a valid .ics (VEVENT with the title "Opened: {nextStep.label}", all-day on the deadline, VALARM at 3 days before and 9:00 on the day) and a Google Calendar template link. If there's no deadline, offer "Remind me in 3 days".
5. Snooze 3 days; Mark done → the green DONE postmark stamp animation + navigator.vibrate(15) where supported; if the letter had a fee_waiver, dispute_appeal or cancel draft, ask "Did this save you money? How much?" (optional number). Store money_saved only from the user's answer.
6. Wins screen per §5.8: Letters opened, Done this month, Money protected (user-confirmed only), a timeline of DONE postmarks. No streaks.

Don't change the analysis function or the Verdict layout except to wire these buttons.
```

**Check before moving on:** make the fee-waiver draft for the Harbor Bank sample. Is it something you'd actually send? Import the .ics into your phone's calendar.

---

## Phase 5: Bolt Database, auth and guest migration

```
Implement Phase 5 only.

1. Create the Bolt Database tables from Knowledge §6 (profiles, letters, letter_actions, events) with RLS enabled: owners can only read/write their own rows. Run the security audit and fix anything it flags.
2. Auth: email + password sign-up and sign-in at /login, password reset, and Google sign-in if available. Brand-styled, not a default form.
3. Guest mode stays: logged-out users keep up to 3 non-sample letters in localStorage with an anon_id. After the first successful verdict, show a soft bottom sheet: "Save your pile so it's here next time" (Sign up / Not now). Show it at most once per session.
4. On sign-up/sign-in, migrate local letters, checklist state and actions into the database, then clear them locally. Handle duplicates.
5. Switch the store to the database when signed in (optimistic updates, with an error toast in the brand voice if a write fails).
6. Settings: display name (used in drafts), region, default reading level, theme, export my data (JSON), "Delete all my letters" (type DELETE to confirm), "Delete my account", sign out.
7. Server functions must verify the user's session when a user id is involved.

Do not change the visual design.
```

**Check before moving on:** open two samples as a guest, sign up, and confirm they moved. Sign in on another browser and confirm they're there. Try to read another user's letter by id (it should fail).

---

## Phase 6: Onboarding, landing page, SEO, PWA

```
Implement Phase 6 only.

1. Onboarding at /start exactly as Knowledge §5.2: 8 screens, one question each, progress bar, Skip on every screen, max 4 options visible per question, illustrations as inline SVG in the post-office style, answers in localStorage (copied to profiles.onboarding after sign-up). The reflection screen uses the user's answers and ONLY the sourced stats in Knowledge §2, with the source in small text. The last screen goes to /open or to the sample sheet.
2. First visit to /open with no letters and no onboarding answers → offer onboarding ("2 quick questions?") without forcing it.
3. Landing page at / exactly as §5.1, mobile first and beautiful on desktop. The hero envelope animation opens to a postmark "ACT BY 03 NOV — $65" (compute the date as today + 16 days). The live sample strip opens real sample verdicts. Plain-language /privacy and /terms pages based on §5.12. The FAQ includes "Is this legal advice?" (no, it explains letters), "Is my data safe?", "What if it gets something wrong?" (we show our sources and what we're unsure about; check the original), "Does it work outside the US?".
4. SEO: title, meta description, canonical, Open Graph + Twitter card image (generate an SVG/PNG of an envelope with a postmark), JSON-LD SoftwareApplication, robots.txt, sitemap.xml, a single h1, semantic sections.
5. PWA: manifest (name "Opened", theme color #F6F1E7, standalone), icons (an envelope with a small postmark), and an iOS "Add to Home Screen" hint after the second letter, dismissible forever.
```

**Check before moving on:** go from the landing page to a sample verdict in 2 taps. Skip onboarding at screen 3 and confirm nothing breaks.

---

## Phase 7: Analytics and founder dashboard

```
Implement Phase 7 only.

1. A tiny client helper track(name, props) that sends to a server function "track" (insert into events, rate-limited per anon_id, never sending letter text). Add every event listed in Knowledge §7 at the right places.
2. /founder route, visible only when the signed-in user's email is in the FOUNDER_EMAILS secret (comma-separated, checked server-side). Show: the funnel with counts and step-to-step conversion for 7 and 30 days (landing_view → capture_started or sample_opened → analysis_succeeded → next_step_clicked → letter_done → signup_completed), the verdict and category mix, median analysis time, analysis failure rate, and a daily table. Use simple, accessible bar charts in the post-office palette (ink bars, mono numbers). No chart library heavier than needed.
```

**Check before moving on:** click through the demo path once in a private window, then check that `/founder` shows each step.

---

## Phase 8 (optional): Opened Plus with Stripe test mode

> Do this from the **gear icon → Stripe** integration with a **test** secret key (`sk_test_…`). Create the two products in Stripe test mode first: "Opened Plus Monthly" $6.99 and "Opened Plus Yearly" $49.99. Bolt's Stripe integration needs the database and auth from Phase 5.

```
Implement Phase 8 only, using Bolt's built-in Stripe integration in TEST mode.

1. /plus paywall in the section order from Knowledge §5.9: honest social proof ("Join the first 100 members", no fake reviews or ratings), outcome headline "Never get blindsided by a letter again", 4 features, monthly $6.99 / yearly $49.99 with the yearly saving computed correctly, renewal terms in plain words, the CTA "Get Opened Plus", "Cancel anytime", Manage subscription for subscribers.
2. Show a visible note: "Demo checkout: use test card 4242 4242 4242 4242".
3. Limits: signed-in free users get 3 non-sample letters per calendar month; the 4th shows the paywall as a sheet with "Not now" always available. Samples and guests are never blocked. Plus users are unlimited. Set profiles.plan from the Stripe webhook.
4. Track paywall_viewed, checkout_started, checkout_completed.
```

---

## Phase 9: Polish and QA, then Publish

```
Phase 9: polish and QA. Don't add features.

Go through this checklist, fix every failure, and report pass/fail per line:
1. 375px and 360px widths: no horizontal scroll, no clipped text, tap targets ≥44px, the bottom bar respects safe areas.
2. Every async action has loading, success, empty and error states written in the brand voice from Knowledge §3.
3. prefers-reduced-motion disables the opening, done-stamp and hero animations.
4. Dark mode: every screen is readable at AA contrast.
5. Dates: overdue, due today, 1 day left and 30+ days left render correctly in the local time zone.
6. No console errors or warnings on the demo path. Remove debug logs that print user content.
7. No invented numbers: grep the UI for hard-coded stats and keep only the four sourced ones from Knowledge §2, each with its source.
8. Lighthouse mobile: Performance ≥ 85 (lazy-load tesseract.js and pdfjs only on /open), Accessibility ≥ 95.
9. The demo path works with the AI key removed (samples fall back to "Demo result").
10. Visual critique: list the 3 places that still look like a generic AI template and fix them using the post-office concept.
```

Then click **Publish**. Pick a clean subdomain (e.g. `opened.bolt.host` if it's free). Make sure the site is **public**, and open it on your phone in a private tab. Run the demo path once on 4G.

---

## Fix-it prompts (use when GLM goes off the rails)

| Symptom | Paste this |
|---|---|
| It rewrote files you didn't ask about | "Revert changes to files not mentioned in my last prompt. Only touch: {files}." (Or roll back in Version History.) |
| It looks generic | "Run a design critique against Knowledge §3. List 5 things that look like a generic AI template, then fix them using envelopes, postmarks, stamp perforations and paper. No new colors." |
| It invents a deadline or amount | Use the substring-validation prompt from the Phase 3 check. |
| JSON errors from the model | "Log the raw model output (first 500 chars) on parse failure. Strip markdown fences before parsing. Keep the single retry with the zod errors appended." |
| Endless "Attempt fix" loop | Stop. Roll back. "Add detailed console.error logging around {feature} and tell me what the logs say before changing code." |
| Server function 401/500 | "Show me which secrets the function reads and check each one exists in Secrets. Return a clear error message naming the missing secret." |
| OCR freezes the phone | "Move tesseract.js into a Web Worker, downscale images to 2000px max, and process pages sequentially." |
