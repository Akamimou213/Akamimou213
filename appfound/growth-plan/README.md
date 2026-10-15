# Growth Plan: the lead magnet

A scored, 8-page PDF plus a 5-minute video teardown, sent within 48 hours of a request on the site. It is built from public data only (store page, Meta Ad Library, reviews, the app itself, search and AI answers), so it needs nothing from the lead but the app's name.

The Growth Plan sells the retainer by showing the work, so every claim in it must be something the lead can check.

## 1. How requests arrive

```
Site form (hero or #plan)  →  POST JSON to Formspree (formspree.io/f/xgaorogn)  →  email to you + Formspree dashboard
```

- Set in `src/config.ts` (`formEndpoint`). Both forms send the same fields: `app_name`, `store` (ios/android), `app_id`, `store_url`, `name`, `email`, `monthly_spend`, `source` (hero/form), `page`, `submitted_at`, and first-touch `utm_*`, `gclid`, `fbclid`, `ttclid`.
- The email subject reads `Growth Plan request: <app> · spend <range>`. Hitting reply answers the lead (Formspree uses the `email` field as reply-to).
- If Formspree is down or rejects the request, the visitor gets the request copied with a link to LinkedIn, so no lead is lost.
- **Plan limits (formspree.io/plans, checked 2026-10-15):** Free allows 50 submissions a month with no autoresponder. Personal ($15/mo) allows 200 and adds Google Sheets. Professional ($30/mo) adds the "we got your request" autoresponse and webhooks. Upgrade when you pass ~40 a month, or when you want the autoresponse.
- Turn on the Slack integration (included on Free) if you want leads to reach you faster than email.

## 2. Qualify (5 minutes)

| Request | What to send |
|---|---|
| Spend $2K+ or blank, real app | Full plan + video |
| Spend "Not yet" or "Under $2K" | Full plan, video optional. Close by saying the retainer starts at $2K/month in ad spend |
| No app found, broken link, competitor or agency | Short reply asking for the store link, or skip |

## 3. Make the plan (about 2 hours)

Copy `example.json` to `reports/<app-slug>.json` (git-ignored, because it holds lead data) and fill it in section by section.

| Section | Where the data comes from | Time |
|---|---|---|
| Store page | The store listing on a phone. Rank checks are done by searching the App Store on a phone, logged out | 20 min |
| Paid ads | Meta Ad Library: the app's page, then its top 3 competitors. Active ads only, all countries. "Longest running" is the oldest start date still active | 20 min |
| Reviews | The latest 100–200 reviews. Paste them into Claude and ask for the top 3 complaints and loves with verbatim quotes, then check every quote against the source | 20 min |
| Onboarding & paywall | Install the app and screen-record from first open to the paywall. One row in `funnel` per screen group; mark leaks | 25 min |
| Search & AI visibility | 3 questions a real user would ask, run once each in ChatGPT, Perplexity and Gemini, logged out. Then search Google for "best <category> app" | 15 min |
| Score, fixes, first 30 days | Score each check (see below). Pick the 3 fixes with the biggest effect on cost per paying user | 20 min |

**Scoring.** Each area has 4–5 checks and is worth 20 points. Full points mean "as good as the top 3 apps in the category". Zero means "missing". The Growth Score is points earned out of points possible, so it can be traced line by line. Keep the same checks from plan to plan so scores stay comparable; change the notes, not the checks.

**Rules:**
- Only facts you saw, with the date checked. No guesses about their revenue, conversion rates or spend.
- Quotes must be verbatim from their reviews.
- No tracking verdict: we can't see their accounts. That happens in week 1.
- Name real competitors only from public facts, such as active ad counts and visible hooks.

### Build it

```sh
cd appfound
npm run plan -- growth-plan/reports/<app-slug>.json
```

This writes `growth-plan/reports/out/<app-slug>.html`, and a PDF too if Playwright is installed (`npm i -D playwright`, then `npx playwright install chromium` once). Without Playwright, open the HTML in Chrome, then Print → Save as PDF, A4, background graphics on.

To try it: `npm run plan -- growth-plan/example.json` builds the sample. `sample-growth-plan.pdf` is that sample, already rendered.

### Video (10 minutes)

Record a 5–7 minute Loom walking through the PDF: cover score → biggest leak → the 3 fixes → one ad angle. Paste the link into `video_url` and rebuild so the cover links to it.

## 4. Send and follow up

**Day 0 (within 48 hours of the request):**

> Subject: Your Growth Plan for {App}: {score}/100
>
> Hi {name},
>
> Here's the Growth Plan for {App} (PDF attached) and a 6-minute walk-through: {loom}.
>
> The short version: {one-line verdict}. The biggest leak is {stage}, and fix #1 on page 2 is where I'd start.
>
> If you want us to run it, here's a 30-min slot: {calendly}. Either way, the plan is yours.
>
> Mohamed

**Day 3:** one line with one extra idea that isn't in the plan (a hook, a competitor ad that just launched), plus the Calendly link.

**Day 7:** "Did fix #1 make sense for your team? Happy to walk your developer through it." Then stop.

Log every plan in one sheet: app, date sent, score, spend range, source/UTM, call booked (y/n), signed (y/n). That sheet tells you which channel brings clients, not just leads.
