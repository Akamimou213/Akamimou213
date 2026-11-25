# Drumee case: evidence behind the "VERIFIED" claims

Checked 25 Nov 2026 with a headless Chromium (Playwright). Each check loaded the live pages and logged the network requests and the redirect chain.

## 1. Meta pixel fires CompleteRegistration on a CTA click
- Page: `https://drumee.com/team-1usd?utm_source=x`, normal desktop Chrome UA, pixel `1607417283818649`.
- On load: `gtag.config` ×2 and `PageView` ×2, with different event IDs (…`.12` and …`.18`), so there is no deduplication.
- On clicking "Start your team for $1": `CompleteRegistration` with `eid=ob3_plugin-set_…` and `cd[cs_est]=true`. That is a codeless or "estimated" event from the Event Setup Tool, so a button click is reported as a registration. A `cta_click` custom event fires as well.

## 2. UTMs lost at the handoff from landing page to app; the app has no analytics
- In the HTML, the CTA href includes the UTMs: `app.drumee.com/settings?tab=plan&plan=team&cycle=month&step=checkout&promo=TEAM-1USD&utm_source=…`
- The new tab after the click opens: `app.drumee.com/settings?…&promo=TEAM-1USD&_gl=…`. **The utm_* parameters are gone**, and the tab then redirects to `/login?return_to=…`.
- app.drumee.com requests only these hosts: `app.drumee.com` and `static.cloudflareinsights.com`. There is no GTM, GA4, Meta pixel or Google Ads tag.
- The product link `app.drumee.com/-/#/welcome/signup?ref=WR5HX8` redirects to `/login?return_to=%2F-`. **Both the ref code and the UTMs are lost.**

## 3. Two Google Ads tags on the landing page
- `AW-18350168481` (configured through gtag, plus a `ccm/collect` page_view) and `AW-18444252085`. Both fire remarketing and `viewthroughconversion` hits.
- GA4 property `G-JWRXMF6HDP` (`cta_click` is sent as a conversion) and GTM container `GTM-W3QPF63L`.

## 4. CTA lands on a returning-user login page
- A logged-out visitor sees "Welcome back · Sign in to your Drumee account", with "Create one" as a small link at the bottom. SSO options are Apple and Google (no Microsoft).

## Keyword data (Semrush, monthly volume · CPC)
- PH, navigational terms seen in the search terms report: google workspace 40,500 · $0.19 | zoom 301,000 · $0.02 | miro 9,900 · $0.32 | gather town 1,300 · $0.49
- PH, solution intent: team collaboration tool 480 · task management app 480 · client portal 1,000 · $0.74 · slack alternative 20
- DE: kollaborationstool 720 · $4.68 | digitaler arbeitsplatz 720 · $5.38 | dsgvo konforme cloud 260 · $4.39 | europäische cloud 210 · $2.33 | dateien sicher teilen 110 · $3.00 | schweizer cloud 50 · $1.97
- NL: klantportaal 1,300 · $3.24 | europese cloud 260 · $2.11 | veilige cloudopslag 140 · $1.69 | bestanden veilig delen 70 · $1.32

## Sample sizes (two-proportion test, α 0.05, power 80%)
- E1: 8% → 11.2% needs 1,329 per arm. 6% → 8.4% needs 1,820 per arm.
- E2: 30% → 60% needs 42 per arm. 20% → 50% needs 38 per arm.

## Files
- `out/Drumee_Growth_UA_Case_Study_Mohamed_Barkat.pdf`: the 7-slide submission
- `out/ad_a.png` (main concept), `out/ad_b.png`, `out/ad_c.png`: 1080×1080 statics
- `deck.html`, `ads.html`: sources (edit, then re-export)

## Second audit (25 Nov 2026)
- **Consent:** a German visitor (de-DE locale, Berlin timezone) sees no cookie banner and no CMP script. No `consent` default is in the dataLayer, and GA4 sends `gcd=13l3l3l3l1l1` (signals not set). The Meta pixel PageView and the Google Ads tags fire before any consent.
- **Sign-up page** (`/signup`): first name, last name, email, password (upper, lower, number and symbol), confirm password, and a terms checkbox. SSO is **Apple + Google only, with no Microsoft**, while the brief says Google or Microsoft.
- **Mobile speed (iPhone 13 emulation):** TTFB 174 ms, LCP ≈ 1.0 s, 2.3 MB. Speed is not the problem. The product image starts at y = 636 on a 664 px viewport, so it is effectively below the fold.
- **Motion** (ClickUp, active ads, oldest first): the longest runners are "One app to replace them all" / "Overwhelmed by scattered tools?" us-vs-them and headline statics, at 238–242 days active. The consolidation angle is saturated.
- **Google supply check:** exact and phrase volume in DE + NL for sovereign cloud, client sharing and "… alternative" totals ≈ 4,710 searches/mo, or ≈ 1,090/week. At 50% impression share and 6% CTR that's ≈ 33 clicks/week ≈ $98, so the Google budget was cut from $180 to $120.
- **The brief's goals disagree:** 80 paying / 500 sign-ups = 16%, against the 25% funnel target.
- **E3 sample:** a pay-rate difference of 15% → 30% needs 120 sign-ups per arm. E2: 10% → 40% needs 32 per arm, and 30% → 60% needs 42.
