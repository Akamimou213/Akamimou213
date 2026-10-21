# Roundup and directory outreach (GEO off-page)

**Goal:** get Get Regular named in the app roundups, directories and comparison pages that AI answers and Google already cite for "best gut health app", "poop tracker app", "IBS tracker app" and "food symptom diary app".
**Today (21 Oct 2026):** Get Regular appears in **0 of 33** of these pages (`research/roundup-and-citation-targets.csv`).

| File | What it is |
|---|---|
| `product-kit.md` | The facts every editor gets: descriptions, features, pricing, privacy, people, assets to prepare. Host it as a page (e.g. `/press`) or a shared doc |
| `pitches.md` | One ready-to-send email per target, plus follow-ups |
| `directories.md` | Field-by-field listing copy for AlternativeTo, Product Hunt, Crunchbase and app directories |
| `tracker.csv` | One row per target: route, status, dates, outcome. Update it as you send |

## Before sending anything (gates)

Editors, and especially MD reviewers (MyGoodGut, Healthline), open the homepage and the App Store page before they reply. Fix these first or the pitch can backfire:

1. **Homepage claims** (`research/product-fact-sheet.md` §10): remove "Clinically Validated" (C1) or link a study; source or remove "$3,000+" (C4) and "3 years" (C5); cite the 40% figure correctly (C3).
2. **Privacy label vs policy:** the App Store label declares Precise Location; the policy never mentions it. Reviewers who score privacy will notice.
3. **Reviewer access:** create App Store Connect subscription **offer codes** (free premium for 3 months) so editors can test Gut Check, Experiments and the Doctor Report.
4. **Assets:** 6 current screenshots, one sample Doctor Report PDF made from a demo account (no real user data), a 45–60 s screen recording, logo files. List in `product-kit.md` §8.
5. **Advisor sign-off:** written OK from Dr. Michael Schopis to use his name, role and quote in pitches.
6. **The SEO deploy is live** (robots, sitemap, canonicals), so the links in pitches resolve to the right URLs.

Wave 1 (directories) doesn't need gates 1–5. Waves 2–3 do.

## Who sends

The founder, from a personal company address (e.g. athina@getregular.com), gets more replies than hello@. One person owns replies and the tracker.

## Waves

| Wave | When | Targets | Effort |
|---|---|---|---|
| 1. Directories | This week | AlternativeTo (as an alternative to mySymptoms, Cara Care, Bowelle, Balloon, Plop), Crunchbase, AppsHive, LinkedIn page completeness | ~2 h, no gates |
| 2. Editorial (P1–P2) | After gates | Healthline (2 pages), MyGoodGut, Gutivate, Healthify, Verywell Health, Live Science, Healio | 1 email each + follow-ups |
| 3. Comparison pages owned by other apps (P3) | After wave 2 | Lin Health, Welling, GutTrace, Mouth To Gut, Dookie Deluxe, Nerva compare, Flarely, freeappsforme | Low odds, cheap; honest inclusion ask |
| Later | When `/tools/bristol-stool-chart` is live and reviewed | Resource links: CDHF, IBS charities, dietitian blogs (offer the free printable stool chart) | Separate, asset-led |
| Don't pitch | — | Triggerbites (8 pages), Balloon (2), SimplePoo: competitors' own lists. Beat them with our own dated comparison pages instead | — |

Product Hunt: prepare now (copy in `directories.md`), launch only when there is something new to show (for example the free tools going live), because a launch is one-shot.

## Rules

- **Never pay for placement**, link exchanges or "sponsored" list spots. Affiliate programs (MyGoodGut is affiliate-disclosed) are a team decision; default no.
- **Free access is fine; conditions are not.** Offer codes go to editors with no request for positive coverage. If they publish, they disclose the free access under their own policy (FTC Endorsement Guides).
- **Only verified facts.** Use `product-kit.md`. No "clinically validated", "diagnose", "best", user counts or star ratings without a date and count.
- **Be honest about limits:** iOS only, English only, key features need a subscription. Editors trust pitches that say this up front, and AI answers repeat what the roundups say.
- **One follow-up after 7 days**, a second after 14. Then mark "no reply" and move on. No more than that.

## Measuring it

- Tracker: pitches sent, replies, listings won (with the live URL and date).
- Monthly: is Get Regular named in the roundups we pitched? Does it show up in the AI-visibility panel (`geo/ai-prompt-panel.csv`) for the matching prompts?
- App Store Connect: downloads by campaign token, if the page links with our `ct` (we can't control their links, so ask nicely and accept a plain link).
