# SEO and AI search playbook

A repeatable way to get a client found in Google, Bing and AI answers (ChatGPT, Claude, Perplexity, Gemini, Copilot, AI Overviews). Built for service businesses and small product sites. First client worked through it: Pro Painters Canada (`clients/painterspro/`).

It's based on an audit of about 66 SEO/GEO articles and 14 open-source "SEO skill" repos. Most of that advice is classic SEO repeated, and most of its numbers come without data. What follows keeps the parts that hold up, and treats every threshold as a rule of thumb.

## Rules that apply to every client

1. **A number comes from a tool or a page we fetched, never from memory.** If it wasn't checked, write "not checked". Never invent a search volume, a ranking or a review count.
2. **Audit first, change nothing.** Every fix is drafted, shown as a diff, and approved before it goes live.
3. **Three permission tiers**
   - Allowed: read data, run the audit script, write drafts.
   - Needs the client's yes: publish, change a title, edit a listing, reply to a review.
   - Never without an explicit yes and a diff first: robots.txt, canonicals, redirects, noindex, firewall or bot settings. Never delete a page.
4. **No review stars on the business's own site, no FAQ markup, no HowTo markup.** Google doesn't show them, so they only add risk.
5. **No link exchanges, paid "tasks", fake reviews, review gating, keyword-stuffed business names, city × service template pages, or bulk AI posts.** They're spam under Google's policies, and fake reviews are illegal in the US and UK.
6. **Install no skill or repo without reading the file first.** The vetted skills are listed in `.claude/skills/VENDORED.md`.
7. **Rates, not screenshots.** An AI answer changes from run to run. Run each question at least twice per engine, logged out, and report how often the client was named.

## The order of work

| When | What | Output |
|---|---|---|
| Week 0 | Step 1 foundation audit, step 2 fixes, Bing Webmaster Tools, first run of buyer questions | `01-foundation-audit.md`, `02-fixes.md`, `05-ai-answer-log.csv` |
| Week 1 | Fact sheet confirmed by the owner; local track for local businesses | `facts.md`, `06-local-audit.md` |
| Month 1 | One decision page a week, one video per page where Google shows videos | page briefs in `pages/` |
| Month 2+ | Monthly re-run: AI answer log, AI traffic report, change monitor before each site update | `reports/YYYY-MM.md` |
| Month 3 (new domains) | Start Search Console optimisation: striking distance, title tests, pruning | - |

An established site with Search Console history (like Pro Painters) can start the month-3 work right away. A new domain should publish 1 to 4 pages a week and wait 2 to 3 months before judging a change.

## Step by step

### 1. Foundation audit (read-only)
```bash
python3 seo-playbook/scripts/foundation_audit.py https://client.com > seo-playbook/clients/<client>/01-foundation-audit.md
```
It checks, with proof for every line:
- the live robots.txt, including CDN-added blocks;
- what each search and AI bot gets (status, challenge pages, `X-Robots-Tag`);
- http/https and www/non-www redirects, repeated to catch intermittent captchas;
- the homepage's raw HTML (H1, text, canonical, noindex);
- JSON-LD (business entity, duplicate logos, stray review markup, retired types);
- every sitemap URL (status, canonical, indexable, titles dated in the future);
- real 404s and llms.txt.

It can't see what the client's host does with real bot IPs, Search Console, Core Web Vitals or the rendered page. For those, use the `technical-seo-audit` and `ai-agent-readiness` skills.

The bots that matter: **OAI-SearchBot** (ChatGPT search), **Claude-SearchBot**, **PerplexityBot**, **Bingbot** (Bing and Copilot), **Googlebot** (Search and AI Overviews), plus the user-triggered fetchers (ChatGPT-User, Claude-User, Perplexity-User). **GPTBot**, **ClaudeBot** and **Google-Extended** are for training; blocking them is a business decision and doesn't remove the site from AI search. Blocking Google-Extended does remove it from Gemini app grounding.

### 2. Fix list, smallest first
Copy `templates/fixes.md`. For each fix: the file or setting, the exact change, how to verify, and whether it needs a diff and approval. Re-run the script after each change and paste the result.

### 3. Owner-only actions
Copy `templates/owner-actions.md`: Search Console, Bing Webmaster Tools (import from GSC, submit the sitemap, IndexNow), Business Profile, directories, review requests, videos.

### 4. Fact sheet
Use the `ai-brand-facts` skill, with `templates/facts.md`. One line per fact (price, plans, areas, hours, warranty), each with its date and the public URL where it's visible. **The owner confirms it.** Until then, no AI answer can be called wrong.

### 5. Buyer questions and the AI answer log
Use the `ai-prompt-research` skill (and `local-ai-visibility` for local businesses).
- 15 to 30 questions, taken from the inbox, sales calls, reviews and Search Console queries. Any question we guessed is marked `guessed` until a real one replaces it.
- Run each one at least twice per engine, logged out: ChatGPT, Claude, Perplexity, Gemini, Google AI Mode/Overviews, Copilot.
- Log who was named and which URLs were cited in `templates/ai-answer-log.csv`. Being cited and being recommended are two different numbers.
- For local businesses, add the city to the prompt or run it from inside the service area, and record where it was run.
- Open the "searching" step in ChatGPT or Claude. The searches it runs show which pages, or which sites, the client needs to be on.
- Most citations go to third-party pages (lists, directories, review sites, YouTube). Plan for both own pages and third-party presence.

### 6. Local track (service-area and storefront businesses)
- `local-seo-audit`: Business Profile category, reviews (count, recency, reply rate against the top 3 in the map pack), name/address/phone consistency, location pages, a hand-run geo-grid.
- `local-ai-visibility`: located prompts and the source map (Google Business Profile, Yelp, Bing Places, Apple Business, trade directories, local "best of" articles).
- Location pages need local proof (real jobs, photos, neighbourhoods). A page that only swaps the town name is a doorway page.

### 6b. B2B software track (SaaS, fintech, platforms sold by demo)
The buyer is a team that compares vendors, checks integrations and asks an AI for a shortlist. There's no map pack and few reviews. What wins:
- **One page per integration**, in plain text: "TOMSO + Hopem: what syncs, how long setup takes, who it's for". The integration name goes in the title and H1. Logos alone are invisible to search engines and AI tools: give each one real alt text and a written name.
- **Get listed on partners' pages.** Each integration partner's "integrations" or "marketplace" page is a third-party citation AI engines trust. Ask for a listing with the same one-liner.
- **Comparison and alternatives pages** against the real competitors (`comparison-page-writer`), honest, with drawbacks and dated prices.
- **Proof claims with a source.** Volume processed, client count, regulatory registrations (e.g. FINTRAC) each get a dated line on an About or trust page with a link to the public register. AI engines repeat these; they must be right.
- **Category language buyers use**, in titles: "rent collection software", "pre-authorized debit for condos", not "Solution for rental".
- **Software directories that rank for the category** (G2, Capterra, Software Advice, local proptech lists) and industry associations (member directories link out).
- **Former names** (e.g. "Otonom Solution → TOMSO") stated on a live page so AI answers connect the two (`ai-brand-facts`).

**Bilingual / multi-province sites**
- Each language is its own market: its own buyer questions, its own competitors, its own decision pages. Don't just translate. Write titles in the words that province searches ("condo", not "co-ownership", in Ontario).
- hreflang on every page, pointing both ways, plus `x-default`. The audit script checks this.
- Run the AI answer log separately per language and per province ("…in Ontario", "…au Québec").

### 7. Decision pages
Pages people read right before choosing. For SaaS: X vs Y, X alternatives, best X for Y, X pricing. For local trades: cost pages ("exterior painting cost in Muskoka"), method choices ("stain vs paint for a log home"), "best [trade] in [town]" (usually won on third-party lists, not on our own site).
- Google the query first. If 6 or more of the top 10 results are the same kind of page, build that kind. If they're all blog posts and the client sells a service, skip it.
- Answer in the first 40 to 80 words and name the business. AI engines lift passages, not pages.
- Every price comes from a dated source. One real drawback per option, the client's included. Don't rank the client first in its own "best" list.
- Add one thing the top 10 don't have: the client's own number, test, photo or job data, with the method shown.
- Briefs use `templates/page-brief.md`. Writing a comparison uses `comparison-page-writer`, and every draft passes `seo-content-qa` (32/40 or more, no area under 3, no critical fail) before anyone publishes it.
- If Google shows a row of videos for the query on a phone, make the video: long-form first, chapters from 00:00, captions corrected by hand.

### 8. Links and mentions
Worth doing: 20 to 30 directories and trade listings with the same name, description and logo everywhere; unlinked mentions (search `"brand" -site:client.com`); "best of" lists that name competitors but not the client (one pitch of 120 to 180 words with evidence, one follow-up after a week, then stop); supplier and partner pages; Reddit and Quora as yourself, with the affiliation stated, at most one answer that names the company per community per week.

### 9. Measure for free
- Google Search Console, Bing Webmaster Tools (AI Performance report = Copilot citations), GA4 with an AI referrals channel (`ai-traffic-analytics`), and a "How did you hear about us?" field on the lead form.
- Under about 100 AI visits a month, report counts, not percentages.
- Before every site update: `seo-change-monitor` snapshot, then compare after. It catches the four quiet killers: a page turned noindex, a canonical pointing elsewhere, a 200 turned 404, robots.txt blocking everything.

## When to pay for tools
After the foundation is fixed and the client knows which pages it wants. Keyword volumes at scale (DataForSEO, from about $0.06 per 500 keywords at published prices) and daily AI answer tracking are the only things that are slow by hand. Get the client's OK on cost before any paid call.

## Skill map

| Step | Skill (in `.claude/skills/`) |
|---|---|
| 1 | `technical-seo-audit`, `ai-agent-readiness`, `xml-sitemap-check`, `schema-markup` |
| 4 | `ai-brand-facts` |
| 5 | `ai-prompt-research`, `local-ai-visibility` |
| 6 | `local-seo-audit`, `local-ai-visibility` |
| 7 | `comparison-page-writer`, `seo-content-qa` |
| 9 | `ai-traffic-analytics`, `seo-change-monitor` |

## Handing the work to another agent (Codex, Cursor)
Fill in `prompts/codex-seo-agent.md` and paste it in. Paste the client's findings into it, because client folders aren't in git.

## Starting a new client
```bash
cp -r seo-playbook/templates seo-playbook/clients/<client>
```
```bash
python3 seo-playbook/scripts/foundation_audit.py https://client.com > seo-playbook/clients/<client>/01-foundation-audit.md
```
Then fill in `brief.md` and work down the order above, stopping for the client's yes at each gate.

This repository is public. Keep client folders that hold anything non-public (Search Console exports, logins, call notes, customer names) out of it, in a private repo.
