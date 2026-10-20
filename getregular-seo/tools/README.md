# Get Regular free tools (`/tools`)

Two tools. Each one answers a high-intent search on the spot, then hands the visitor to the App Store with a reason to continue there. They're a pre-experience of the app, not stand-alone products. Both are prototypes: `noindex`, `draft-needs-medical-review`, not for publication until clinical and legal review.

| Tool | URL | Main search demand (US/mo, Semrush 6 Oct) | Intent it serves | Bridge to the app | Folder |
|---|---|---|---|---|---|
| **Bristol stool chart** | `/tools/bristol-stool-chart` | bristol stool chart 74,000 · poop chart 33,100 · bristol stool scale 5,400 · bowel movement chart 2,400 | "Show me the chart and tell me what my type means" | Log your type daily: one poop is a clue, a week is the story | `bristol-stool-chart/` |
| **Why am I bloated?** | `/tools/why-am-i-bloated` | why am i so bloated i look pregnant 18,100 · why am i so bloated 8,100 · why am i always bloated 4,400 | "Find out why, and what to do about it" | Run the 7-day plan in the app (or track before a doctor visit) | `why-am-i-bloated/` |

Removed on 20 Oct 2026: the poop color chart, "How regular are you?" and GI appointment prep. The GI visit checklist content moves to `/resources` (see `science/`).

Open any `<tool>/prototype.html` in a browser to try it (single file, no server).

## Bristol stool chart: what's on the page

The searcher wants *the chart*, so the chart is the page, right under the H1:

1. **The chart:** all 7 types as rows, slower to faster, with the ideal band (3–4) and shaded original drawings. Tap a row to open what it suggests, common reasons, what to try, sources and a "log your type daily" app link; type 7 adds an urgent box. Rows are plain HTML `<details>` rendered at build time (`render.js`), so the chart is in the page source for search and AI crawlers and works without JavaScript. Each row has an anchor (`#type-6`) for long-tail queries like "bristol stool chart type 6".
2. **Printable chart:** "Print the chart" (or Ctrl+P) prints a clean one-page white handout: the 7 types, a doctor box, sources and a QR code to the app.
3. App section, Learn content (short answer, what's normal, accuracy, color, when to see a doctor, FAQ, sources), the other tool, sign-off.

JavaScript only adds one-row-open-at-a-time, deep links, the phone sticky bar and the print button.

## Why am I bloated?: the quiz funnel

1. **Intro card** in the hero: what you'll get (9 questions, a bloat profile and a 7-day plan, warning signs first, no email).
2. **9 one-tap questions:** goal, how often, timing, foods, bowels, cycle, early fullness, how long, warning signs. Single-choice answers show the selection, then advance after 0.65 s; extra taps during the pause are ignored, so a double tap can't skip a question. Back goes to the previous question. Without JavaScript the card says so and links to the causes table.
3. **2 "did you know" screens** with sourced stats (1 in 7 Americans bloated in the past week, Oh 2023; up to 12 cm of distension over a day in women with IBS, Houghton 2006).
4. **"Matching your answers…"** (2.2 s; 0.4 s with reduced motion). It honestly describes what happens: comparison with the AGA 2023 patterns and a warning-sign check.
5. **Your bloat profile:**
   - the doctor alert first, if any warning sign;
   - the top pattern and explanation, plus "Also in your answers";
   - **your 7-day plan** (3 steps from the matching experiment, framed by the goal);
   - **Start this plan in Get Regular** (a direct App Store button everywhere, plus the sticky bar on phones).
   Any warning sign, or a persistent or early-fullness pattern, switches the plan to a doctor-visit plan ("Book a visit · Log it for 2 weeks · Bring a Doctor Report") and the handoff to "Track it before your visit".
6. **Full profile:** all matched patterns with next steps and the optional, consented email. Then the indexable Learn content.

The profile is kept in `localStorage` (this device only), so returning visitors see it again.

## Build and test

```bash
node tools/build.mjs              # writes every <tool>/prototype.html
node --test tools/tools.test.mjs  # chart data, server-rendered rows, licensing guard, bloat matching, plan, quiz flow (9 tests)
```

## Design system (v2, 20 Oct 2026)

Built from Get Regular's brand creatives (Gut Check, Try This and meal-logging posts, story slides), not from generic UI:

- **Photography first:** cinematic dark nature and organic shots (wet leaf, moss, lichen, dark water, candlelit food, dark wood) with a dark left-to-right falloff behind text. Stand-in Unsplash photos are in `_shared/img/` (credits in `_shared/img/CREDITS.md`); swap in brand photography before launch.
- **Type:** a serif headline line (Newsreader 500) over a light Inter line, italic serif accent words ("are *you*?", "what *happens*"), Inter 300 body.
- **Components:** dark glass cards with hairline borders, outlined pills with line icons (the Meals / Stool / Check-ins connector), an underlined "→" CTA, `01.` hairline step labels, slide-dot progress, the 7-circle day row and "Active" status pill, and the "Get Regular · gut-health app" sign-off with the logo.
- **Page structure** (every tool):
  1. Photo hero with the tool itself in a glass card (finder or quiz), and jump-link pills
  2. The tool's main section (the chart; the full bloat profile)
  3. "How it works" steps
  4. App section with phone + "Try This" card
  5. Learn content on warm paper (answer box, table, FAQ, sources)
  6. A photo card for the other tool
  7. Closing sign-off + footer
- **Shared pieces** (`_shared/partials/*.html`, filled by `build.mjs`): head, nav, app section, final, and the related-tool card (`<!-- @related slug -->`). The ableLead logo, the app screenshot and the fonts load from getregular.com / Google Fonts; in production, use the site's own assets.

Structure: each tool has a pure logic module (`chart.js`, `bloat.js`), an `index.html` (UI + server-renderable SEO content + JSON-LD), and the shared `_shared/base.css` (palette, type, components, print sheet) and `_shared/ui.js` (analytics, App Store links + handoff + sticky bar, stepper with fact screens, email form, original stool drawings). Checked in Chromium at 1440px and 390px with no console errors: the chart with JavaScript on and off, the print sheet, both quiz paths, and the quiz inside a sandboxed iframe with storage blocked (20 Oct 2026). Not yet checked in Safari/WebKit.

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
- **App Store `ct` tokens** (e.g. `tool-bloat-quiz-carbs`) reveal a pattern only to Apple's aggregate analytics. If legal prefers, switch to neutral codes.

## Licensing (decide before publishing; not legal advice)

| Instrument | Status | What the tools do |
|---|---|---|
| Bristol Stool Form Scale | Rome Foundation lists it as "available by license". The widespread chart artwork is © Norgine | All stool wording and drawings are Get Regular's own. `tools.test.mjs` fails if the official descriptor text appears in the data or the page. **Counsel decides** whether the 7-type structure or the name ("Bristol stool chart" in the H1 and title) needs a license for the chart tool and the app's own copy. Ask the Rome Foundation for a license quote |
| Rome IV / V questionnaires | Licensed, fees, can't be altered | Not used. The bloat quiz follows the AGA 2023 practice update's patterns and alarm features in its own words |
| IBS-SSS | © Rome Foundation, via ePROVIDE | Optional upgrade: license it to get a *validated* severity score |
| PAC-SYM, PAC-QOL, GSRS, PROMIS GI | Commercial use needs permission | Not used |

The bloat quiz is an **original, non-validated self-check** and says so on the page. What validating it would take is in `science/research.md` (#tool-validation).

## Before any tool goes live

1. A named clinician reviews each tool's copy, patterns and warning signs (AGA 2023 for the quiz).
2. Legal: the licensing decision, consent text, the Consumer Health Data Privacy Policy page, the retention schedule and the no-pixel rule.
3. An email endpoint (`EMAIL_ENDPOINT` in `_shared/ui.js`, e.g. Kit with double opt-in), plus the App Store provider token and Custom Product Page IDs (`PPIDS`).
4. Remove `noindex` and the prototype footer.
