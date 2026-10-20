# Get Regular free tools (`/tools`)

Five tools, each a lead source for search, AI answers and paid social, routing to the App Store. All are prototypes: `noindex`, `draft-needs-medical-review`, not for publication until clinical and legal review.

| Tool | URL | Main search demand (US/mo, Semrush 6 Oct; AC = autocomplete only) | What it does | Folder |
|---|---|---|---|---|
| **Bristol stool chart** | `/tools/bristol-stool-chart` | bristol stool chart 74,000 · poop chart 33,100 · bristol stool scale 5,400 · bowel movement chart 2,400 | Tap your stool type → what it suggests, common reasons, what to try, when to see a doctor; 7-day log saved in the browser | `bristol-stool-chart/` |
| **How regular are you?** | `/tools/how-regular-are-you` | AC: am i constipated quiz, do i have ibs quiz, ibs quiz free, ibs quiz no email, gut health quiz free | 10–11 question self-check → 0–100 Regularity Score, pattern (9 types), 3 things to try, doctor card on warning signs | `how-regular-are-you/` |
| **Poop color chart** | `/tools/poop-color-chart` | bowel movement color chart 1,900 · green poop, yellow diarrhea (C1/C6 drafts) | Pick a color + 3 follow-ups → usually food / watch it / call a doctor today / emergency | `poop-color-chart/` |
| **Why am I bloated?** | `/tools/why-am-i-bloated` | why am i so bloated i look pregnant 18,100 · why am i so bloated 8,100 · why am i always bloated 4,400 | 7 questions on timing, foods, bowels, cycle → up to 3 matching patterns with next steps; doctor card on alarm features | `why-am-i-bloated/` |
| **GI appointment prep** | `/tools/gi-appointment-prep` | questions to ask gastroenterologist, symptom diary for doctor (C8 drafts) | Choose visit type, symptoms, what you tried → printable one-page visit sheet (summary, mention-first, questions, what to bring) | `gi-appointment-prep/` |

Open any `<tool>/prototype.html` in a browser to try it (single file, no server).

## Build and test

```bash
node tools/build.mjs                          # writes every <tool>/prototype.html
node --test tools/tools.test.mjs              # chart, color, bloating, prep logic (15 tests)
node --test tools/how-regular-are-you/quiz.test.mjs   # quiz scoring (11 tests)
```

Structure: each tool has a pure logic module (`chart.js`, `colors.js`, `bloat.js`, `prep.js`, `quiz.js` + `copy.js`), an `index.html` (UI + server-renderable SEO content + JSON-LD), and the shared `_shared/base.css` (getregular.com palette and type) and `_shared/ui.js` (analytics, App Store links, email form, original stool drawings). Checked in Chromium at 1280px and 390px with no console errors (20 Oct 2026).

**Porting to Next.js:** one route per tool. Server-render the hero and the `<article class="content">` section, so the H1, answer and table are in the HTML. Make the interactive part a client component that imports the logic module unchanged.

## Page template (every tool)

- **Above the fold:** H1 in the query's words, a one-line promise and the tool, all in server HTML.
- **Result:** plain explanation with sources, what to try, a **warning-sign override** (a doctor card shown above any app pitch), the App Store CTA (matching App Store Custom Product Page + `ct` token), and optional email.
- **Below the tool, indexable:** a short answer, a table, "when to see a doctor", an FAQ, numbered sources, and the last-reviewed date. This is what ranks and gets cited by AI answers; the tool UI itself doesn't.
- **Results** are never indexable and never put answers in URLs.
- **Schema:** `WebApplication` (HealthApplication, free) + `MedicalWebPage` with `citation`, and `reviewedBy` only with the clinician's consent.

## Privacy and email rules (from the 20 Oct 2026 compliance research; not legal advice)

- **Results never require an email.** Email is optional, offered after the result. This follows the "ibs quiz no email" search demand and the trust a health brand needs. (ZOE gates MenoScale results behind email; we deliberately don't.)
- **Answers stay in the browser** until the user asks for an email *and* ticks the health-data consent box. Marketing consent is a separate, unticked box. `consent_text_version` is stored with each record.
- **No Meta, TikTok or Google ad pixels on any tool, Learn or Science page.** The URL alone reveals a bowel-health interest. FTC actions: GoodRx (2023, $1.5M, first Health Breach Notification Rule case) and BetterHelp (2023, $7.8M, health questionnaire answers shared with ad platforms). The amended rule (effective 29 Jul 2024) treats unauthorized sharing with advertisers as a breach. `track()` sends event names only to first-party analytics.
- **Washington My Health My Data Act:** the WA Attorney General names apps that track digestion as collecting consumer health data. The law requires:
  - consent before collecting;
  - a separate consent before any sharing;
  - a **Consumer Health Data Privacy Policy** linked from the homepage. Every tool footer links `/legal/consumer-health-data-privacy`, which **doesn't exist yet**.
- **Retention:** set a schedule (e.g. delete tool answers 12 months after the last email interaction) and a deletion path.
- **CAN-SPAM:** postal address, working unsubscribe, opt-outs honored within 10 business days.
- **App Store `ct` tokens** (e.g. `quiz-ibs-c`) reveal a pattern only to Apple's aggregate analytics. If legal prefers, switch to neutral codes.

## Licensing (decide before publishing; not legal advice)

| Instrument | Status | What the tools do |
|---|---|---|
| Bristol Stool Form Scale | Rome Foundation lists it as "available by license". The widespread chart artwork is © Norgine | All stool wording and drawings are Get Regular's own. `tools.test.mjs` fails if the official descriptor text appears. **Counsel decides** whether the 7-type structure or the name needs a license for the chart tool, the quiz, and the app's own copy ("Bristol Stool Scale"). Ask the Rome Foundation for a license quote |
| Rome IV / V questionnaires | Licensed, fees, can't be altered | The quiz paraphrases thresholds with citations; it never reproduces the questionnaire |
| IBS-SSS | © Rome Foundation, via ePROVIDE | Optional upgrade: license it to get a *validated* severity score |
| PAC-SYM, PAC-QOL, GSRS, PROMIS GI | Commercial use needs permission | Not used |

The quiz is an **original, non-validated self-check** and says so on the page. The route to a ZOE-style validated score is in `science/research.md`.

## Before any tool goes live

1. A named clinician reviews each tool's copy, warning signs and thresholds (Rome V for the quiz).
2. Legal: the licensing decision, consent text, the Consumer Health Data Privacy Policy page, the retention schedule and the no-pixel rule.
3. An email endpoint (`EMAIL_ENDPOINT` in `_shared/ui.js`, e.g. Kit with double opt-in), plus the App Store provider token and Custom Product Page IDs (`PPIDS`).
4. Remove `noindex` and the prototype footer.
