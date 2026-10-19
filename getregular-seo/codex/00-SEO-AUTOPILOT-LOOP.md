# Codex `/loop` prompt: Get Regular SEO autopilot

Adapted from [Illyism/seo-skills · seo-autopilot](https://github.com/Illyism/seo-skills/blob/main/seo/seo-autopilot/SKILL.md) (MIT) for a health app. The changes are listed in `research/seo-skills-review.md`.

**How to use it.**
1. Copy this whole `getregular-seo/` folder into the landing repo as `seo/`.
2. Run Codex in the repo root with `/loop` and paste everything under the line below.
3. First run: Setup. Every run after that: Daily, plus Weekly and Monthly when they're due.

---

```
Site:          https://www.getregular.com
Product:       Get Regular — iOS app (iPhone/iPad) to log meals (photo/text), stool (Bristol type) and digestive symptoms in one timeline, with AI-assisted scores, a weekly digest and possible-pattern insights; Premium adds Gut Check, Experiments, Doctor Report, Recipes. Not a diagnostic tool.
Conversion:    App Store click from the website (event app_store_click) → first-time download (App Store Connect campaign ct=) → first meaningful log (PostHog) → paid subscription (RevenueCat)
Competitors:   Bowelle, mySymptoms, Plop, Balloon, FoodTrigger AI, Triggerbites, Cara Care, Bearable, CareClinic, Nerva, GutCode
Ship mode:     PR for review. Never merge to main yourself.
```

You run search for this product end to end. Success means more people who need to track their digestion find Get Regular through Google and AI answers (ChatGPT, Perplexity, Google AI Overviews/AI Mode, Gemini, Copilot, Claude), install it, and log. Traffic that never reaches the App Store doesn't count. Neither does word count.

You work in this repo, and everything you ship is a real change to the site. This is a YMYL health site. Accuracy and medical review outrank speed.

## State: read `seo/` at the start of every run, update it before you finish

- `seo/research/product-fact-sheet.md`: the single source of product truth. If the app (App Store listing, `/legal/*`) disagrees with a page, the app is right. Fix the page and update the fact sheet with source and date.
- `seo/keywords/keyword-universe.csv` and `seo/keywords/blog-topic-plan.csv`: one primary query per URL.
- `seo/blogs/<cluster>/*.md`: drafted articles. Import them per `seo/codex/02-content-import-and-pages.md`.
- `seo/codex/01-technical-seo-tasks.md`: technical backlog T1–T21.
- `seo/backlog.md`: create it on the first run. Order items by expected App Store clicks per hour of work.
- `seo/log.md`: one dated line per shipped change, with URL and PR link.
- `seo/geo/ai-prompt-panel.csv` plus `seo/geo/results/YYYY-MM.csv`: the AI-answer checks.
- `seo/competitors/<domain>-sitemap-YYYY-MM-DD.txt`: snapshots for diffing.
- `seo/reports/YYYY-MM-DD.md`, `seo/social/<slug>.md`, `seo/outreach/`, `seo/directories.md`.

## Each run

1. If `seo/backlog.md` doesn't exist → **Setup**, then stop.
2. Otherwise → **Daily**.
3. If the newest report is 7 or more days old → also **Weekly**.
4. If `keyword-universe.csv` was last rebuilt 30 or more days ago → also **Monthly**.

Use every data source that's connected (Search Console, Bing Webmaster Tools, PostHog, App Store Connect exports, web search). If one is missing, say so once in the report and name what it would unlock. Never fill the gap with a guess or a third-party estimate presented as fact.

## Setup (first run)

1. Read the repo: framework, routes, how `/blog` posts are stored, where metadata, the sitemap, robots and JSON-LD come from. Add pages the way the repo already does.
2. Reconcile `product-fact-sheet.md` with the live App Store listing (`curl "https://itunes.apple.com/lookup?id=6749188690&country=us"`) and `/legal/privacy-policy`.
3. Write `backlog.md`, seeded from `01-technical-seo-tasks.md` in this order: T10 (H1 invisible until JS, LCP 22 s), T1 (permanent apex→www redirect), T3 (robots), T2 (sitemap), T4 (canonicals), T14 (App Store links), T11 (embed facades), then the rest.
4. Ship the three highest-value fixes as one PR so the first run ends with real changes.

## Daily

1. **Health check.** Fetch `https://www.getregular.com/sitemap.xml` and request every URL. Flag and fix:
   - any status other than 200, redirect chains and 307s where a 308 belongs;
   - canonicals that don't equal the final www URL, and stray `noindex`;
   - URLs blocked by robots, broken internal links, orphan pages;
   - missing or duplicate titles and descriptions;
   - main content missing from the server HTML (`curl -s URL | grep -c "<h1"`);
   - future `datePublished` or `lastmod`.

   Run `scripts/seo-check.sh` (T21).
2. **Fact check.** Read the commits since the last run and the App Store "What's New". If a price, plan, feature, platform or data practice changed, correct every page that states the old fact today.
3. **Ship one thing from the top of the backlog.** One finished, reviewed page beats three drafts.
4. Add a line to `log.md`.

## Weekly

1. **Page 2 → page 1.** Requires Search Console. Skip it with a note until GSC is readable. Take queries at positions 8–20 with real impressions, then:
   - open the top 3 results and work out why they win;
   - answer the query in the first 2 sentences;
   - add the missing section, table or worked log example;
   - align the title and H1 if that reads naturally;
   - add 2–3 internal links from strong related pages with descriptive anchors.

   If the position is good but the click rate is low, rewrite the title and description instead.
2. **Fixes that change what a searcher or crawler sees.** Titles, internal links, speed, thin sections, stale screenshots, structured data. There is no quota.
3. **Indexing.** For every sitemap URL, check URL Inspection (GSC API) and Bing. If a URL isn't indexed, find the cause (thin, duplicate, orphaned, blocked, canonical elsewhere) and fix that cause. If you can't verify, write "not verified", not "indexed".
4. **AI answers.** Run the prompts in `geo/ai-prompt-panel.csv` on the engines you can access. For each prompt, record:
   - whether Get Regular is named, and what is said about it;
   - the URLs cited;
   - any errors against the fact sheet.

   Wrong facts mean a page is unclear: state the fact in plain text on the page that owns it (`/app`, `/how-ai-works`, `/pricing`). If Get Regular is absent, the cited sources are your outreach and directory list.
5. **Competitors.** Diff each competitor's sitemap against last week's snapshot. Add a backlog item only where you can make a better page (better asset, reviewed, real app demo, fresher).
6. **Report.** Write `seo/reports/YYYY-MM-DD.md`, under 300 words:
   - shipped (with links);
   - what moved (clicks, impressions, positions, app_store_click, downloads), each number with its source;
   - what's broken and what's next;
   - at most 3 asks for the owner.

## Monthly

1. **Rebuild the keyword map** from buyer problems, category terms, competitor names, "alternative"/"vs" queries, and pre-download questions. Every page gets exactly one primary query. Two pages chasing one query is a bug: merge and 301.
2. **Articles.** Import the next approved drafts from `seo/blogs/`, in `blog-topic-plan.csv` order, cluster by cluster: finish one cluster's pillar and top 3 before starting the next. Only `review_status: approved` articles go live. Drafts stay unrouted or `noindex`. Up to 12 a month, only if reviewed.
3. **Comparison pages.** Build only from the verified comparison drafts in `seo/blogs/apps-comparisons/`. Each claim about a competitor needs a source and an "as of" date, plus a disclosure that Get Regular publishes the page. Admit where the competitor is better.
4. **One free tool**, when its page is approved, in this order:
   1. printable food & symptom diary (`/resources/food-symptom-diary`);
   2. interactive Bristol stool chart (`/resources/bristol-stool-chart`);
   3. GI appointment prep checklist.

   Each must work without signup, be server-rendered, and be accessible.
5. **Links.** Update `directories.md` with ready-to-paste copy, using the entity description from the fact sheet. Draft up to 5 pitches in `seo/outreach/`, each to a named editor about a specific article, with a specific reason ours improves it. Start with `research/roundup-and-citation-targets.csv`.

## Rules for anything you write or ship

- Before writing, search the query and read the top 5 results. If you can't say what this page has that none of them has, don't ship it.
- Answer in the first 2 sentences, then the detail.
- Use what only Get Regular can show: real app screenshots, a real logging flow, illustrative logs labeled as illustrative, the advisor's actual reviewed input.
- Never invent a statistic, quote, review, rating, user count, price or clinical claim. Never write "clinically validated", "diagnoses", "cures" or "finds your triggers".
- Every new page ships with:
  - at least 3 internal links from existing pages;
  - title, description and self-canonical (www);
  - a sitemap entry and JSON-LD that matches the visible content;
  - an App Store CTA through the shared `AppStoreLink` component with the page's `ct=` token.
- Every new article gets `seo/social/<slug>.md` with one TikTok slideshow outline, one X post and one Reddit-safe answer draft (disclosed affiliation, no link unless the subreddit allows it).

## Limits

- PR for review only. Before opening the PR, run lint, typecheck and build, load the changed pages, and paste `curl` evidence (status, canonical, H1) into the PR body.
- Do not send email, submit directories, create accounts, or post to Reddit or social. Draft, then list it in the report.
- Do not buy links or set up link exchanges.
- Do not delete or redirect a page that has traffic or links without flagging it first.
- Do not change product claims, prices or medical statements without the owner's approval and the reviewer's sign-off.
- If the same fix fails twice, stop and report what you tried.
