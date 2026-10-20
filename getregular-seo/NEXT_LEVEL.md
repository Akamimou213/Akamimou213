# Get Regular SEO / AEO / GEO: the next level (20 Oct 2026)

**Bottom line:** the plan in `STRATEGY.md` is sound and deep enough. What holds results back is that **none of it has shipped**, and AI visibility is still **measured by a proxy**. More strategy or more drafts won't move anything. Next level means three things: ship the blockers, turn the App Store listing into the main GEO asset, and measure real AI answers every month.

## 1. Where we are today (re-checked live, 20 Oct 2026)

| Check | 19 Oct audit | Today |
|---|---|---|
| `robots.txt` | 404 | **404** |
| `/app`, `/poop-tracker`, `/resources/*` | missing | **404** |
| Canonical tag / JSON-LD on home | none | **none / 0 blocks** |
| Sitemap host | apex, redirects | **apex** (`https://getregular.com/...`) |
| Homepage claims ("Clinically Validated", "$3,000+", "biomarkers" ×3, "Thousands of people") | present | **present** |
| App Store link on home | Canadian storefront | **Canadian storefront** |
| AI bots (OAI-SearchBot, GPTBot, PerplexityBot, ClaudeBot, Claude-SearchBot, Google-Extended) | — | **all get HTTP 200** (not blocked) |
| App Store US ratings | 13 | **13** (4.92) |

The constraint is implementation access. Codex works in `avandame/getregular-landing`, and this session can't reach that repo. Grant the Claude GitHub App access to it (or run `codex/00-SEO-AUTOPILOT-LOOP.md` in Codex) and the T1–T15 fixes are a few days of work.

## 2. Priorities, re-ranked by leverage

| # | Move | Why it's higher than it looks | Effort | Owner | Files |
|---|---|---|---|---|---|
| 1 | **App Store listing rewrite + ratings plan** | The listing appears in 24/37 AI prompts, drives App Store search, and converts every paid click. It ships with the next build (promo text ships today). It is the only lever that helps SEO, AEO, GEO and paid UA at once | 1 day of copy, then the next release | Growth + iOS dev (review prompt) | `aso/ASO.md`, `aso/metadata.json` |
| 2 | **Remove the unsupported claims** on the homepage and in the App Store | A YMYL accuracy risk. AI engines quote them, and Apple Guideline 1.4.1 scrutinizes health accuracy claims | Hours | Founder + advisor | fact sheet §10 |
| 3 | **Technical blockers** T10, T1, T3+T2, T4, T14 | Without them no new page can rank or be cited | 2–4 dev days | Codex | `codex/01-technical-seo-tasks.md` |
| 4 | **`/app` facts page + `/how-ai-works`** | ChatGPT fan-out searches brand sites for "official", "price" and "review" (Ahrefs, Oct 2026). Today it finds a homepage full of claims | 1–2 days | Codex | `onpage/app-facts.md`, `onpage/how-ai-works.md` |
| 5 | **Real AI-visibility baseline** before anything ships | Without a baseline, no change can be credited. The proxy said 0/37; we need the real number per engine | 1 hour + roughly $3–10 of API spend per full run | Growth | `geo/tracker/` |
| 6 | **Custom Product Pages tied to paid** | The same 4 intent pages (IBS, bloating, constipation, Doctor Report) serve App Store keyword search *and* Meta/TikTok/Apple Ads landings. That gives conversion by intent, which the site can't give you yet | 2 days design + review | Growth | `aso/ASO.md` §CPP |
| 7 | **Cluster C1 release** (pillar + 3 posts) after medical review | Content stays gated on a named reviewer. That is the right call for a new health domain | Reviewer hours | Advisor | `blogs/stool-bristol/` |
| 8 | Roundup outreach, YouTube, directories | Unchanged from `STRATEGY.md` §7–8 | Ongoing | Growth | `research/roundup-and-citation-targets.csv` |

## 3. What I'd challenge in the current plan

- **80 drafts on a domain with 1 post is a risk if published fast.** Google's scaled-content-abuse policy and YMYL standards both target this pattern. The medical-review gate already limits the pace; keep it, and hold to "one cluster at a time." Judge each cluster on store clicks and activation (STRATEGY §9), not traffic.
- **Comparison pages (C7) need hands-on testing first.** "We read the App Store listing" won't hold up next to competitors' self-rankings, and listicles earn ~0% of citations in healthcare (Delta V study, vendor data). Keep C7 last.
- **Listing quality matters as much as site work for AI answers.** For "best X app" prompts, the retrieval set is App Store pages plus roundups (§0 of the GEO strategy). That's why the ASO work moved to #1.
- **The site is not yet where AI answers are decided.** With ~7 organic visits/month, the next 90 days of AI visibility will come from the listing, third-party roundups and YouTube far more than from getregular.com.

## 4. Measurement upgrade: from proxy to real engines

`geo/tracker/run_panel.py` runs the 47-prompt panel through the official APIs **with live web search on**:

| Engine | API (checked 20 Oct 2026) | Default model (override via env) |
|---|---|---|
| ChatGPT | OpenAI Responses API, `web_search` tool, US location | `gpt-6-luna` |
| Perplexity | Agent API, `web_search` tool (Sonar chat completions retired 27 Sep 2026) | preset `fast` |
| Gemini | `generateContent` with `google_search` grounding | `gemini-3.8-flash` |
| Claude | Messages API, `web_search_20260209`, server-side refusal fallback on | `claude-opus-5-5` |

It scores each answer with the §8.4 rubric: mention, recommendation level, rank, owned/store/third-party citation, competitors and cited domains. It also flags **critical accuracy errors** (says Android, "FDA", "clinically validated", diagnoses, wrong price), saves raw responses as evidence, and writes `results.csv` + `summary.md`.

**Limits (state these whenever you report the numbers):**
- API answers aren't what a logged-out user sees in the ChatGPT app, the Gemini app or Google AI Overviews. Treat them as a **trend and accuracy benchmark**. Keep 5–10 manual checks per month on the consumer surfaces (STRATEGY §7.7).
- Gemini returns only source domains, so App Store listing citations are under-counted there.
- Critical-error flags are regex-based. Read the raw answer before acting on one.
- Answers vary run to run. For the baseline, run 3 times on different days (as §8.3 says) and compare averages, not single runs.

Cost per full run (47 prompts × 4 engines): search fees run about $10 per 1k calls (OpenAI, Anthropic), $14 per 1k (Gemini 3+, after 5k free per month) and $1–2.50 per 1k (Perplexity Agent API), plus tokens. Estimate: 188 calls, about $3–10 per full run, most of it Claude Opus input tokens from search results (assumes ~20k input tokens per Claude answer, unmeasured). Set `CLAUDE_MODEL` to a cheaper model to cut that, but then the answers no longer reflect the flagship model. Check the first run's actual bill before scheduling it.

## 5. On the ChatSEO MCP (`claude mcp add --transport http chatseo https://api.chatseo.app/mcp`)

**Verdict: don't make it the core of this work.** Fine as an optional advice layer on top of Search Console.

- It **doesn't track AI visibility**. The founder writes that it "does not track prompts and sells no visibility score, on purpose" (chatseo.app/blog/free-peec-ai-alternative, 11 Oct 2026). So it can't measure the AEO/GEO goal.
- Its MCP is mostly a remote control for ChatSEO's own chat agent (`send_message`), plus site, project and Shopify management. It exposes no direct keyword, SERP or GSC query tools (chatseo.app/mcp.md). Data comes from GSC (read-only scope), GA4, DataForSEO, Firecrawl and Perplexity Sonar (chatseo.app/sub-processors.md).
- MCP access requires Pro (from €49/mo, 200 messages). It's operated by GROW IT SASU (France), founded 2025, and has few independent reviews. Without auth it returns 401 (handshake tested 20 Oct; no data sent).
- **Health-data caution:** conversations are stored, embedded via Voyage AI (US) and processed in the US via Vercel and Anthropic. The terms license data use "to provide and improve the Service". Never paste user or health data into it. Don't let an agent call its `delete_*`, `shopify_publish_article` or `share_conversation` tools unattended.
- **Better fit for an agent workflow:** a read-only GSC MCP plus the official DataForSEO MCP (raw keyword/SERP data, pay-as-you-go), plus `geo/tracker/` for AI answers. Use Peec AI or Otterly only if you want a hosted dashboard instead.

## 6. Decisions needed (in addition to STRATEGY §11)

1. Approve the App Store name change (`Get Regular: Poop Tracker`), or pick the alternate. Check App Store search popularity in Apple Ads first.
2. Give the iOS dev the review-prompt spec (ASO.md §Ratings) for the next release.
3. Grant repo access to `avandame/getregular-landing`, or confirm Codex runs the autopilot loop.
4. Provide API keys for the tracker baseline (OpenAI, Perplexity, Gemini, Anthropic). Store them as repo secrets if you want a monthly scheduled run.
