# Facts page copy: `/app`

> Plain-text facts page for people and AI assistants (spec: `geo/geo-aeo-strategy.md` §6). Server-rendered HTML, tables as real `<table>`s, no animation, no images required for any fact. Every fact carries an "as of" date. Source of truth: `research/product-fact-sheet.md` (19 Oct 2026). When a fact changes, update this page, the JSON-LD and the fact sheet together within 7 days (geo §3.3).

## 0. Header block

| Field | Value |
|---|---|
| URL | `https://www.getregular.com/app` (never change; self-canonical) |
| review_status | `draft-needs-medical-review` (contains "what it is not" health statements) + **owner claims sign-off** |
| Primary keyword | get regular app |
| Owned variants | get regular price, is get regular free, get regular android, get regular review (facts), get regular ai gut health, get regular subscription, get regular privacy |
| Search intent | Navigational / product-aware (branded fan-out queries: "official", "price", "android", "is it safe") |
| Title tag (52 chars) | `Get Regular App: Features, Pricing, Privacy & Limits` |
| Meta description (147 chars) | `Plain facts about the Get Regular iOS app: what you can log, what it costs, what's Premium, how AI and your data are handled, and what it can't do.` |
| H1 | Get Regular: the iOS app for tracking food, stool and gut symptoms |
| OG title | Get Regular app: the facts |
| OG description | Features, prices, platforms, privacy and limits of the Get Regular gut health app, in plain text. Last verified 19 Oct 2026. |
| JSON-LD | `WebPage` (`@id` https://www.getregular.com/app#webpage) + `MobileApplication` (`@id` https://www.getregular.com/app#app) + reference to `Organization` `#org`. See §15 |
| App Store `ct` token | `app-facts` |
| Internal links out | "How our AI works" → `/how-ai-works`; "privacy policy" → `/legal/privacy-policy`; "terms of service" → `/legal/terms-of-service`; "Poop tracker" → `/poop-tracker`; "Food & symptom tracker" → `/food-symptom-tracker`; "IBS tracker" → `/ibs-tracker`; "GI appointment checklist" → `/resources/gastroenterologist-appointment-prep`; "Bristol stool chart" → `/resources/bristol-stool-chart` |
| Pages that must link in | Global nav ("The app"), footer (all pages), homepage pricing strip + FAQ, `/how-ai-works`, all 3 product pages (pricing line + "full facts"), every resource page's product bridge, C7 comparison posts |
| Last verified line (visible) | `Last verified: 19 October 2026 · App version 2.0.1 · Sources: App Store listing, Get Regular privacy policy (8 June 2026) and terms of service (4 August 2026).` |

---

## 1. Summary (answer-first box)

**H1:** Get Regular: the iOS app for tracking food, stool and gut symptoms

> Get Regular is an iOS gut-health tracking app from Get Regular Health, Inc. Log meals, bowel movements (Bristol Stool Scale, photo or manual) and symptoms to see daily Gut Health and Nutrition Scores, weekly AI pattern insights and doctor-ready reports.
>
> *Last verified: 19 October 2026 · Version 2.0.1*

(This is the approved 40-word description, fact sheet §12. Do not paraphrase.)

**CTA (`ct=app-facts`):** `Download on the App Store` · Microcopy: `Free to download · iPhone & iPad`

---

## 2. At a glance

**H2:** At a glance

| Fact | Value | As of |
|---|---|---|
| App name on the App Store | Get Regular: AI Gut Health | 19 Oct 2026 |
| App Store subtitle | Food, Stool & Symptom Tracking | 19 Oct 2026 |
| Developer | Get Regular Health, Inc. | 19 Oct 2026 |
| Headquarters | New York, NY **[CONFIRM: city]** | 19 Oct 2026 |
| Platforms | iPhone and iPad (requires iOS 15.1 or later). Also runs on Apple-silicon Macs and Apple Vision Pro as an iPad app ("Designed for iPad. Not verified for macOS.") | 19 Oct 2026 |
| Android | No Android app | 19 Oct 2026 |
| Web app | None | 19 Oct 2026 |
| Language | English | 19 Oct 2026 |
| App Store category | Health & Fitness (also listed in Lifestyle) | 19 Oct 2026 |
| Age rating | 13+ on the App Store; the terms require users to be at least 13 | 19 Oct 2026 |
| App size | 92.9 MB | 19 Oct 2026 |
| First version | 1.0, 21 Aug 2025 (App Store version history) **[CONFIRM: official launch date — 21 Aug 2025 or 1 Nov 2025]** | 19 Oct 2026 |
| Current version | 2.0.1, released 18 Aug 2026 | 19 Oct 2026 |
| Price | Free to download; optional auto-renewing subscription (see Pricing) | 19 Oct 2026 |
| App Store rating (US) | 4.9 out of 5 from 13 ratings. Small sample; check the App Store for the current figure | 19 Oct 2026 |
| Contact | hello@getregular.com | 19 Oct 2026 |
| Website | https://www.getregular.com | 19 Oct 2026 |

*Not to be confused with "Regulars" (getregulars.com), an unrelated hospitality loyalty company.*

---

## 3. Pricing

**H2:** How much does Get Regular cost? {#pricing}

**Answer (40–60 words):** Get Regular is free to download. Premium is an auto-renewing subscription billed through Apple: in the US it costs $12.99 per month or $99.99 per year, and a Founding Yearly plan at $79.99 per year appears where offered. Prices differ by country. Prices below were read from the App Store on 19 October 2026.

| Plan (App Store name) | US | UK | Canada | Australia |
|---|---|---|---|---|
| Get Regular Monthly | $12.99 | £12.99 | CA$14.99 | A$12.99 |
| Get Regular Yearly | $99.99 | £99.99 | CA$129.99 | A$149.99 |
| Get Regular Founding Yearly (where offered) | $79.99 | £79.99 | CA$99.99 | A$129.99 |

*As of 19 Oct 2026. Prices can change; the App Store shows the current price for your country.*
**[CONFIRM: is the Founding Yearly plan still sold, and to whom? If not, delete the row.]**

**H3:** What's free and what's Premium?
- **Premium features named in the terms of service (as of 4 Aug 2026):** Gut Check (AI chat), Experiments, the Doctor Report and personalized Recipes.
- **Free features:** **[CONFIRM: exact list — e.g., meal/stool/symptom logging, daily scores, Weekly Digest? Any log limit?]** Until confirmed, render: "Logging and the other features not listed as Premium above. Check the app for the current split."

**H3:** Is there a free trial?
The terms say new subscribers "may be offered" a 7-day free trial. The App Store doesn't list one, so check the app for any current offer. **[CONFIRM: current trial eligibility and length; replace this paragraph with the confirmed wording.]**

**H3:** Billing and cancelling
- You pay through your Apple ID. Apple handles payments and refunds.
- Cancel anytime in iPhone Settings → [your name] → Subscriptions. You keep Premium until the end of the period you've paid for.

---

## 4. What you can log

**H2:** What can you log in Get Regular?

| What | How | As of |
|---|---|---|
| Meals and snacks | Photo or text; edit the ingredients the AI found; re-log a recent meal in one tap | 19 Oct 2026 (v2.0.1) |
| Bowel movements | Photo (AI classifies it on the Bristol Stool Scale) **or** manual Bristol type entry with no photo | 19 Oct 2026 |
| Stool photo privacy | Enhanced privacy mode for stool photos **[CONFIRM: one-line description of what the mode does]** | 19 Oct 2026 |
| No-go days | Log a day without a bowel movement; it doesn't break your streak | 19 Oct 2026 |
| Time on the toilet | Slider on each stool log; averaged into your gut analysis | 19 Oct 2026 (v2.0.0) |
| Symptoms | Tap to log symptoms and lifestyle factors **[CONFIRM: symptom list and whether severity is rated]** | 19 Oct 2026 |
| Drinks and water | 10 drink types plus custom; daily totals; personalized water goal | 19 Oct 2026 (v2.0.0) |
| Supplements and medications | Tracked; supplements count toward nutrition totals | 19 Oct 2026 |
| Period | Log period dates; cycle data appears in the Doctor Report | 19 Oct 2026 (v1.6) |
| Notes | Free-text notes on stool and food entries | 19 Oct 2026 (v2.0.0) |
| Past entries | Backdate entries up to 7 days with a custom time | 19 Oct 2026 |
| Calories | Optional; off by default | 19 Oct 2026 (v2.0.1) |
| Apple Health | Integration exists **[CONFIRM: what is read/written — e.g., sleep, steps — before listing specifics]** | 19 Oct 2026 |

---

## 5. What the app calculates

**H2:** What does the app calculate?

| Output | What it is | As of |
|---|---|---|
| Gut Health Score (daily) | A daily score based on your past 7 days of entries, weighted toward the most recent days (privacy policy definition) | 19 Oct 2026 |
| Nutrition Score (daily) | A daily nutrition score; you can also check the score of a food you're considering before you eat it **[CONFIRM: one-line method]** | 19 Oct 2026 |
| Regular Score | The third daily score shown in the app **[CONFIRM: definition before publishing more than the name]** | 19 Oct 2026 |
| Gut-health streak | Consecutive days in the Bristol 3–4 range | 19 Oct 2026 |
| Weekly Digest | A weekly summary with AI insights about possible patterns across your food, stool and symptom history | 19 Oct 2026 |
| Backlog | Historical charts with tag filters, a month heatmap of your three scores, and highlighting by symptom | 19 Oct 2026 (v2.0.0) |
| Nutrition breakdown | Macros, micronutrients and gut-relevant compounds such as fiber, polyphenols and prebiotics | 19 Oct 2026 |

How these are produced, and their limits: see [How our AI works](/how-ai-works).

---

## 6. AI features

**H2:** What do the AI features do?

| Feature | What it does | Plan | As of |
|---|---|---|---|
| Photo analysis | Estimates meal ingredients and nutrition from a photo; classifies stool photos on the Bristol scale | **[CONFIRM: free or Premium]** | 19 Oct 2026 |
| Gut Check | AI chat that answers questions using your own history, e.g., "what's been different on my bloated days?" Keeps chat history | Premium | 19 Oct 2026 |
| Core memories | Health facts you mention in chat (for example an intolerance, a diagnosis you've been given or a medication) are remembered to personalize answers | Premium (part of Gut Check) | 19 Oct 2026 |
| Experiments | Self-experiments suggested by the AI coach (for example "try eliminating dairy for a week"), with a protocol and daily tracking | Premium | 19 Oct 2026 |
| Recommendations | Food and supplement suggestions and "how to improve this meal" tips | **[CONFIRM: plan]** | 19 Oct 2026 |
| Recipes | Dishes from world cuisines, personalized to your symptoms and goals | Premium | 19 Oct 2026 |

**What the AI does not do:** it doesn't diagnose, doesn't prove that a food causes a symptom, and can misread photos. Suggestions are not medical advice. Details: [How our AI works](/how-ai-works).

---

## 7. Doctor Report

**H2:** What's in the Doctor Report?

The Doctor Report (Premium, added in version 1.6 on 11 May 2026) is a PDF you can share with your doctor. It includes:
- bowel patterns
- Bristol scale tracking
- symptom frequency
- diet quality analysis
- food–symptom correlations
- nutrient patterns
- cycle data, if you log your period

**Raw data export (CSV):** not documented as of 19 Oct 2026. **[CONFIRM: is there a CSV/raw export?]**

**Image brief:** First page of a Doctor Report exported from a test account with dummy data, labelled "Sample report — dummy data". **Alt:** "Sample Get Regular Doctor Report PDF with Bristol type trend and symptom frequency (dummy data)." Link: "Preparing for a GI visit? Use the free checklist" → `/resources/gastroenterologist-appointment-prep`.

---

## 8. Privacy and AI processing (summary)

**H2:** What happens to my data?

All points below summarize the [privacy policy](/legal/privacy-policy) dated 8 June 2026 (as of 19 Oct 2026).

- **AI processing:** food photos, stool photos, text descriptions, symptoms, medications, supplements, dietary preferences and chat messages are sent to **OpenAI's API** for analysis.
- **What's sent:** the policy states that only anonymized content is sent — no names, emails or account identifiers — and that OpenAI does not use API inputs to train its models.
- **Photos:** compressed and sent for analysis, not permanently stored on Get Regular's servers; only the analysis results are saved. You can log manually instead of uploading photos.
- **Storage:** Supabase (authentication, database, storage), encrypted in transit and at rest, with row-level security.
- **Other processors:** Sentry (crash reports, no health data), PostHog (analytics, no health data content), Apple (payments), and marketing tools listed in the policy.
- **Advertising:** Get Regular says it does not sell, rent or share your personal or health information with advertisers.
- **Deletion:** delete your account in the app; your data is permanently removed within 30 days.
- **Your rights:** the policy covers CCPA/CPRA, Washington's My Health My Data Act and GDPR. Contact hello@getregular.com.
- **App Store privacy label:** declared by the developer on the App Store. **[CONFIRM: resolve the "Precise Location" and "Health under Analytics" entries (fact sheet §7) before this page ships; then add one sentence that mirrors the corrected label.]**

More: [How our AI works](/how-ai-works).

---

## 9. Clinical input

**H2:** Who was involved clinically?

Get Regular names Dr. Michael Schopis, MD, a board-certified gastroenterologist, as its clinical advisor. **[CONFIRM: what he reviewed (scoring logic? Bristol handling? content?), when, and any compensation or equity to disclose. Publish those three facts here.]**

Get Regular has **not** published a clinical validation study. The app uses the Bristol Stool Form Scale, a 7-type stool form scale used in clinical practice and research (Lewis & Heaton, 1997).

---

## 10. What Get Regular is not

**H2:** What Get Regular is not

- Not a diagnostic tool or a medical device. It doesn't diagnose, treat, cure or prevent any condition.
- Not a substitute for a doctor, dietitian or emergency care. If you have blood in your stool, black or tarry stools, severe or constant abdominal pain, unexplained weight loss, fever, or symptoms that wake you at night, contact a clinician.
- Not a FODMAP database or a guided low-FODMAP program.
- Not for people under 13.
- Not available on Android or the web (as of 19 Oct 2026).

---

## 11. Who it's for (and who it isn't)

**H2:** Who is Get Regular for?

| Good fit | Probably not the right fit |
|---|---|
| You want one place for food, poop and symptoms, with photo logging to save time | You need an Android or web app |
| You're preparing for a GI or dietitian appointment and want a summary to share | You want everything stored only on your device, with no cloud or AI processing — a paper diary or a local-only app suits you better |
| You want to test a hunch (dairy, coffee, late meals) with a structured self-experiment | You need a FODMAP food-content database — Monash University's FODMAP app is built for that |
| You like scores and weekly summaries to stay motivated | You don't want any AI involved in reading your logs |

---

## 12. FAQ

**H2:** Frequently asked questions

**Is Get Regular free?**
It's free to download. Gut Check, Experiments, the Doctor Report and Recipes need a Premium subscription ($12.99/month or $99.99/year in the US, as of 19 Oct 2026).

**Is there a free trial?**
The terms say new subscribers may be offered a 7-day free trial; check the app for current offers. **[CONFIRM]**

**Is Get Regular on Android?**
No. As of 19 Oct 2026 it's available only for iPhone and iPad (and runs on Apple-silicon Macs as an iPad app).

**Do I have to take photos of my poop?**
No. You can choose the Bristol type manually. Photos are optional.

**Can I log days with no bowel movement?**
Yes — no-go days can be logged and don't break your streak.

**Can I share my data with my doctor?**
Yes, through the Doctor Report PDF (Premium). A raw CSV export isn't documented. **[CONFIRM]**

**Who processes my data with AI?**
OpenAI's API, per the privacy policy. The policy states that only anonymized content is sent and that OpenAI doesn't train on API inputs.

**How do I delete my data?**
Delete your account in the app. The privacy policy says data is permanently removed within 30 days.

**How do I cancel?**
In iPhone Settings → [your name] → Subscriptions. You keep access until the end of the paid period.

**Has Get Regular been tested in a clinical study?**
No validation study has been published. The app was built with input from a board-certified gastroenterologist **[CONFIRM wording]**, and it doesn't diagnose any condition.

**Does it work with Apple Health?**
There is an Apple Health integration. **[CONFIRM: what data is read or written; then answer specifically.]**

**Does it have ads?**
**[CONFIRM: no in-app ads? If confirmed, answer "No in-app ads."]**

---

## 13. Changelog (last 5 releases)

**H2:** Recent updates

| Version | Date | What changed |
|---|---|---|
| 2.0.1 | 18 Aug 2026 | Optional calorie tracking (off by default); fix for meals wrongly marked "Food not recognized" |
| 2.0.0 | 13 Aug 2026 | Backlog tab, hydration tracking, toilet time, notes, research consent option |
| 1.8.2 | 27 Jun 2026 | Onboarding updates |
| 1.8.1 | 13 Jun 2026 | Onboarding updates |
| 1.7 | 10 Jun 2026 | Bug fixes, including Apple Health integration |

Earlier: 1.6 (11 May 2026) added the Doctor Report, period tracking and Recipes. Source: App Store version history, read 19 Oct 2026.

---

## 14. Press and contact

**H2:** Press and contact
- Email: hello@getregular.com
- Company: Get Regular Health, Inc.
- Logo and screenshots: **[CONFIRM: press-kit download URL]**
- Founder: **[CONFIRM: name, title and approved bio before publishing]**
- 120-word description (approved copy, fact sheet §12; reuse verbatim): Get Regular is a gut-health tracking app for iPhone and iPad, made by Get Regular Health, Inc. in New York [confirm city]. You log meals by photo or text, bowel movements on the Bristol Stool Scale (from a photo or by manual entry, no photo required) and digestive symptoms. The app turns these logs into daily Gut Health and Nutrition Scores and a Weekly Digest of patterns. With a subscription you get Gut Check, an AI chat that answers questions using your own history, plus guided food experiments and a PDF Doctor Report to share with your clinician. Get Regular was built with input from a board-certified gastroenterologist [confirm wording]. It supports wellness tracking and does not diagnose or treat any condition.

**Final CTA (`ct=app-facts`):** `Download on the App Store`

**Sources (visible list):**
1. Get Regular on the App Store (US): https://apps.apple.com/us/app/get-regular-ai-gut-health/id6749188690 — read 19 Oct 2026
2. Get Regular privacy policy (last updated 8 June 2026): https://www.getregular.com/legal/privacy-policy
3. Get Regular terms of service (last updated 4 August 2026): https://www.getregular.com/legal/terms-of-service
4. Lewis SJ, Heaton KW. Stool form scale as a useful guide to intestinal transit time. *Scand J Gastroenterol*. 1997;32(9):920–924. https://pubmed.ncbi.nlm.nih.gov/9299672/

---

## 15. JSON-LD (must match the visible text)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {"@type": "WebPage", "@id": "https://www.getregular.com/app#webpage",
     "url": "https://www.getregular.com/app",
     "name": "Get Regular App: Features, Pricing, Privacy & Limits",
     "dateModified": "2026-10-19",
     "isPartOf": {"@id": "https://www.getregular.com/#website"},
     "about": {"@id": "https://www.getregular.com/app#app"},
     "publisher": {"@id": "https://www.getregular.com/#org"}},
    {"@type": "MobileApplication", "@id": "https://www.getregular.com/app#app",
     "name": "Get Regular: AI Gut Health",
     "operatingSystem": "iOS 15.1 or later",
     "applicationCategory": "HealthApplication",
     "softwareVersion": "2.0.1",
     "inLanguage": "en",
     "publisher": {"@id": "https://www.getregular.com/#org"},
     "downloadUrl": "https://apps.apple.com/us/app/get-regular-ai-gut-health/id6749188690",
     "description": "Get Regular is an iOS gut-health tracking app from Get Regular Health, Inc. Log meals, bowel movements (Bristol Stool Scale, photo or manual) and symptoms to see daily Gut Health and Nutrition Scores, weekly AI pattern insights and doctor-ready reports.",
     "offers": [
       {"@type": "Offer", "price": "0", "priceCurrency": "USD", "description": "Free download; subscriptions available"},
       {"@type": "Offer", "name": "Get Regular Monthly", "price": "12.99", "priceCurrency": "USD"},
       {"@type": "Offer", "name": "Get Regular Yearly", "price": "99.99", "priceCurrency": "USD"}
     ]}
  ]
}
```

No `aggregateRating`. No `founder`. No `reviewedBy` unless a documented review exists.
