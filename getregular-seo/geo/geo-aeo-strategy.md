# Get Regular: GEO / AEO strategy

How to get Get Regular recommended and cited, accurately, by ChatGPT, Perplexity, Google AI Overviews and AI Mode, Gemini, Copilot and Claude.

**Prepared:** 19 October 2026. **Market:** US English.
**Companion files:**
- `research/product-fact-sheet.md`: the facts every answer should repeat.
- `geo/ai-prompt-panel.csv`: the prompt panel, with proxy citation sources.

**How to read the evidence labels**
- **[Official]**: platform documentation, read on 2026-10-19.
- **[Study]**: third-party data. Most of these are vendor or agency studies, so treat them as directional rather than peer-reviewed.
- **[Proxy]**: our own web-search simulation. It shows which pages are likely to be retrieved. **It is not actual AI output.**
- **[Recommendation]**: our judgement.

---

## 0. Executive summary

**Where we stand [Proxy, 37 non-branded prompts, 2026-10-19]**
- **Get Regular appeared in 0 of 37 non-branded prompts.** It only appears when someone searches for it by name, and then only via getregular.com and the App Store. No independent review, listicle, Reddit thread, YouTube video or directory listing mentioning it was found.
- The brands that recur in AI answers are mySymptoms (14 prompts), Cara Care (12), Bowelle (11), Plop (10), Balloon (10), CareClinic (9) and Gutly (7).
- The most-retrieved domain is **apps.apple.com (24/37 prompts)**, followed by play.google.com (13), balloonguthealth.com (10), plopdiary.com (9), triggerbites.com (6) and careclinic.io (5).
- Competitors appear mostly through **their own blogs** ("best X apps", "X alternatives") and their **App Store pages**.
- The informational Bristol and bowel questions are answered from Cleveland Clinic, GoodRx, Healthline, Wikipedia, CDHF and clinic blogs.

**Top 10 actions, in order**
1. **Fix the facts at the source.** Publish a retrieval-ready **`/app` facts page** that states prices, platforms, features, data handling and limits in plain text, plus `/how-ai-works` and `/clinical-review` pages. Remove or substantiate "Clinically Validated", "biomarkers", "$3,000+" and "3 years" (see fact sheet §10). Unsupported claims are the biggest accuracy and reputational risk once assistants start repeating our copy.
2. **Technical hygiene, done once:**
   - Add a robots.txt (it currently returns 404).
   - Fix the sitemap host (www) and the future-dated `lastmod` and `datePublished` (2026-10-20).
   - Add canonical tags and Organization, WebSite and MobileApplication JSON-LD.
   - Change the apex redirect from 307 to 308/301.
   - Replace the Canadian-storefront App Store link.
3. **Verify Google Search Console**, which is currently unverified per the prior audit. Confirm **Settings → "Search generative AI" = Include**; Google's guide makes inclusion a requirement for AI Overviews and AI Mode. Turn on the Generative AI performance report. **Verify Bing Webmaster Tools** and use its AI Performance report.
4. **Strengthen the App Store listing, the #1 retrieved source.** State manual Bristol entry, the Doctor Report PDF, period tracking, Gut Check AI chat and pricing in the description. Grow ratings ethically: 13 US ratings against Bowelle's ~2.2K, Plop's ~1.5K and Balloon's ~1.1K.
5. **Earn inclusion in third-party roundups** that already rank: independent app lists, IBS community sites and journalists. Supply a fact sheet and review access. Never pay for undisclosed placement.
6. **Publish content only Get Regular can publish.** That means clinician-reviewed Bristol, bowel-frequency and food-diary resources with named authors and reviewers, primary-source citations, dated updates and, with consent, aggregate de-identified usage data.
7. **Use YouTube**, a clear whitespace. No independent gut or poop app review videos were found, and YouTube is the #1 cited domain in AI Overviews (5.6% of all citations in Ahrefs' March 2026 dataset). Post explainers and app walkthroughs, and offer disclosed creator reviews.
8. **Build entity consistency** using one 40-word and one 120-word description, one logo, one URL and one App Store URL across LinkedIn, TikTok, Instagram, YouTube, Crunchbase, Product Hunt and AlternativeTo. **Hold off on Wikidata** until independent coverage exists.
9. **Reddit and communities:** disclosed founder participation only, where subreddit rules allow. Expect less ChatGPT impact than in 2025, because ChatGPT's Reddit citations fell about 88% between March and September 2026 (Ahrefs).
10. **Measure monthly** with the prompt panel across 7 surfaces and score mention, recommendation, citation and **accuracy** against the fact sheet. Pair it with first-party data: GSC Generative AI impressions, Bing AI citations, AI-bot log hits and AI referrals.

---

## 1. How each engine retrieves and cites (evidence-based)

### 1.1 Engine-by-engine

| Engine | How it finds pages | Controls | What it means for us | Evidence |
| --- | --- | --- | --- | --- |
| **Google AI Overviews / AI Mode** | Grounded in the Google Search index using retrieval-augmented generation and **query fan-out** (multiple related sub-searches). A page must be "indexed and eligible to be shown in Google Search with a snippet". Google says there are "no additional technical requirements" and no special markup, llms.txt or chunking is needed. The 2026 AI optimization guide adds that a site "must be included in Search generative AI features in Search Console". | robots.txt (Googlebot); `nosnippet` / `data-nosnippet` / `max-snippet` / `noindex`; the **Search Console "Search generative AI" include/exclude setting** (third-party reports say the default is Include); Google-Extended does *not* affect Search inclusion | Classic SEO (indexable, snippet-eligible, internal links, text not images) is the entry ticket. Fan-out means ranking for *sub-questions* (manual logging, PDF report, privacy, price) matters, not just the head term. Only ~38% of AIO citations come from the top 10 for the original query (Ahrefs, Mar 2026). | [Official] developers.google.com/search/docs/appearance/ai-features (updated 2025-12-10); [Official] developers.google.com/search/docs/fundamentals/ai-optimization-guide (updated 2026-07-10); [Study] ahrefs.com/blog/ai-overview-citations-top-10 (2 Mar 2026) |
| **Gemini app** | Grounding uses "content from the Google Search index… at prompt time" | **Google-Extended** controls training *and* Gemini-app and Vertex grounding. Blocking it would remove us from Gemini grounding | **Do not block Google-Extended.** | [Official] developers.google.com/search/docs/crawling-indexing/google-common-crawlers |
| **ChatGPT (search)** | **OAI-SearchBot** crawls for ChatGPT search. **ChatGPT-User** fetches pages for user-initiated actions (robots.txt "may not apply"). **GPTBot** crawls for training. The settings are independent, and robots changes take ~24 h for search. Ahrefs (66.6M logged-out GPT-5.6 Luna answers, Aug–Sep 2026): **14.4% of answers searched**, with ~1.6 fan-out queries each; **6.8% of fan-outs used `site:`**, and 75.9% of the most common `site:` searches targeted a *brand site*; "official", "price" and "review(s)" fan-outs rose month on month. | robots.txt per agent; IP lists at openai.com/searchbot.json etc. | ChatGPT checks **brand sites directly** for "official" facts, prices and specs, so the `/app` page must state them in crawlable text. In US health answers ChatGPT has shifted from explainers (WebMD and Healthline fell) toward **primary sources (PubMed #4, FDA #8)**, so cite primary literature and publish what only we can. | [Official] developers.openai.com/api/docs/bots; [Study] ahrefs.com/blog/query-fan-out-chatgpt (12 Oct 2026) |
| **Perplexity** | **PerplexityBot** indexes for Perplexity search ("not used to crawl content for AI foundation models"). **Perplexity-User** fetches pages for user questions and "generally ignores robots.txt". Changes take up to 24 h. | robots.txt; WAF rules using UA plus IP lists | Perplexity overlaps most with Google: ~28.6% of its citations rank in Google's top 10, against ~8% for other assistants. Classic rankings help most here. | [Official] docs.perplexity.ai/guides/bots; [Study] ahrefs.com/blog/ai-search-overlap (11 Aug 2025) |
| **Copilot / Bing** | Uses the Bing index (bingbot). Bing Webmaster Tools **AI Performance** (public preview launched 10 Feb 2026) reports citations, cited pages and "grounding queries" across Copilot, Bing AI summaries and some partners. It has no clicks and is sampled. | robots.txt (bingbot); IndexNow for fast recrawl [Recommendation] | Verify BWT, submit the sitemap and use IndexNow on each release so price and version changes propagate. Use the grounding queries as free fan-out research. | [Study/press] searchengineland.com/bing-webmaster-tools-ai-performance-report-468751; searchenginejournal.com (Feb 2026) |
| **Claude** | **Claude-SearchBot** indexes "to enhance the relevance and accuracy of search responses". **Claude-User** fetches pages for user questions. **ClaudeBot** collects training data. Anthropic says its bots honour robots.txt. | robots.txt per agent; IPs at claude.com/crawling/bots.json | Allow Claude-SearchBot and Claude-User. **Observation:** the web-search tool used for this research could not retrieve reddit.com ("domains not accessible"), so Reddit seeding is unlikely to reach Claude answers. This is a single-session observation, not documentation. | [Official] support.claude.com article 8896518 (updated 7 Apr 2026) |
| **Apple (Siri / Spotlight / Apple Intelligence)** | Applebot; Applebot-Extended controls training use | robots.txt | Allow Applebot. This is an iOS-only brand. | Apple's Applebot documentation (not re-fetched this session; verify before quoting) |

### 1.2 What gets cited: content-format evidence

| Finding | Source and date | Confidence / caveat |
| --- | --- | --- |
| AI Overviews increasingly cite pages outside the top 10: 37.9% top 10, 31.2% positions 11–100, 31.0% beyond 100 (863K SERPs, 4M URLs). This compares with ~76% in July 2025. YouTube makes up 5.6% of all AIO citations. | Ahrefs, 2 Mar 2026 (primary read) | Large dataset; vendor study. The metric changed between studies |
| Only ~12% of ChatGPT, Gemini and Copilot citations rank in Google's top 10 for the same prompt; Perplexity is at 28.6% | Ahrefs, 11 Aug 2025 (primary read) | Data collected July 2025 |
| ChatGPT citations shifted to **original sources**: PubMed rose from 64th to 4th and FDA entered at 8th, while WebMD, Healthline and Verywell fell. Reddit dropped from ~1 in 5 US answers to 1 in 43; Wikipedia from 1 in 7 to 1 in 35. Recommendation: "the pages worth investing in are the ones only you can publish". | Ahrefs, 12 Oct 2026 (primary read) | One model snapshot; OpenAI changes retrieval often |
| AI-cited URLs are 25.7% "fresher" than Google top-10 organic results (17M citations). ChatGPT has the strongest freshness bias; AIO slightly favours older pages | Ahrefs, July 2025 (via secondary summaries; primary not opened) | Correlation, not causation. The average cited page was still nearly 3 years old |
| Listicles are the most-cited page type overall (21.9%) and ~40% on commercial prompts; standalone comparison pages earn <3% | Wix Studio AI Search Lab, Mar 2026, 1.06M citations (via secondary summary) | Vendor study. Varies by vertical |
| By vertical: in **healthcare**, listicles earned ~0% and articles ~54% of citations | Delta V Digital, 25K+ citations (via secondary summary) | Small and vendor. It matches our proxy, where informational health prompts were answered by articles from health systems |
| Platform source mix (Aug 2024–Jun 2025): ChatGPT leaned on Wikipedia; AIO on Reddit and YouTube; Perplexity on Reddit | Profound, tryprofound.com/blog/ai-platform-citation-patterns | **Superseded for ChatGPT** by the 2026 Reddit and Wikipedia declines. Still indicative for AIO and Perplexity |
| Google: unique, non-commodity content; "Seeking inauthentic 'mentions'… isn't as helpful as it might seem"; support text with images and video | Google AI optimization guide (updated 2026-07-10) | Official |

**What this means for Get Regular [Recommendation]**
- For "best app" prompts, the retrieval set is App Store pages plus roundups. We need (a) a strong App Store listing and (b) presence in roundups.
- For health-information prompts, the retrieval set is authoritative articles. We need clinician-reviewed resources with primary citations and something original, not another Bristol explainer.
- For branded and fact prompts ("does it have a free trial", "is it on Android"), ChatGPT searches **official** sources. We need a crawlable `/app` facts page.

---

## 2. Proxy landscape: who shows up today

> **[Proxy] Method:** On 19 Oct 2026 we ran 39 realistic prompts through a web-search tool and recorded the returned URLs and the brands named in the retrieved pages. This approximates the candidate set an assistant's retrieval step might see. **It is not a capture of ChatGPT, Perplexity, Google, Gemini, Copilot or Claude answers.** The full data is in `ai-prompt-panel.csv`.

**Results**
- **Non-branded prompts:** Get Regular present in **0/37**.
- **Branded ("Get Regular app review", "getregular.com"):** only owned pages and the App Store appear. Snippets still show **stale listing data** ("by Athina Vandame", 11 ratings, 9+, 75.8 MB). The "getregular.com" query also surfaces **Regulars (getregulars.com)**, an unrelated Danish hospitality SaaS company, so there is an entity-collision risk.
- **Brands seen most often:** mySymptoms (14), Cara Care (12), Bowelle (11), Plop (10), Balloon (10), CareClinic (9), Gutly (7), Triggerbites (6), Monash FODMAP (5).
- **Most-retrieved domains:** apps.apple.com (24), play.google.com (13), balloonguthealth.com (10), plopdiary.com (9), triggerbites.com (6), careclinic.io (5), mysymptoms.net (4).
- **Competitor-owned roundups dominate the "best" and "alternatives" queries:** Balloon ("Best iOS poop trackers"), Triggerbites (7 "alternatives" and "vs" pages), Dookie Deluxe, GutTrace, Welling, Mouth To Gut, Flarely, SimplePoo and Vyla. Each ranks itself first. Assistants often repeat these lists while noting the bias.
- **No independent YouTube review** of gut or poop tracking apps was found. Reddit could not be retrieved by our tool.
- **Our differentiators are missing from answers even where they fit:**
  - "built with a gastroenterologist" lists Flush, Gut Feelings, Dr. B, CDHF and Ayble, not us.
  - "bloating + menstrual cycle" lists Cara, CareClinic and Plop; we have period tracking.
  - "ask AI about my logs" lists Gutly, GutHub and GutFeel; we have Gut Check.
  - "doctor PDF report" lists mySymptoms, Gutly and GastroLog; we have the Doctor Report.
  - "manual Bristol without photos" lists Toilet Log, Doody and Plop; we support manual entry.

  None of these features are stated on getregular.com in crawlable text.

---

## 3. Entity and brand consistency plan

**Goal:** every source an engine might read describes the same entity with the same facts.

### 3.1 Canonical entity record
Source of truth: `research/product-fact-sheet.md` §1 and §12.

| Field | Value |
| --- | --- |
| Name | Get Regular |
| Legal entity | Get Regular Health, Inc. |
| Product | Get Regular: AI Gut Health (iOS) |
| Canonical URL | `https://www.getregular.com/` |
| App Store URL to use everywhere | `https://apps.apple.com/us/app/get-regular-ai-gut-health/id6749188690`. For non-US audiences, use the region-neutral `https://apps.apple.com/app/id6749188690`. |
| Descriptions | The 40-word and 120-word versions approved in the fact sheet. Do not paraphrase them per channel. |
| Disambiguator, wherever space allows | "gut health app" (in contrast to "Regulars", the hospitality loyalty platform at getregulars.com) |

### 3.2 Channel checklist

| Channel | Status (2026-10-19) | Action |
| --- | --- | --- |
| Website | No Organization or MobileApplication schema; no About page; no canonical tags | Add `/app`, `/about`, `/how-ai-works`, `/clinical-review`. Organization JSON-LD with `sameAs` for the App Store, LinkedIn, TikTok, Instagram and YouTube. `founder` only once the team confirms it |
| App Store | Seller URL is `https://getregular.com` (apex) | Change it to `https://www.getregular.com/`. Align the promotional text with the 40-word description. Add "manual entry", "Doctor Report (PDF)", "period tracking" and "Gut Check AI chat" to the description, plus "wellness, not a diagnosis" wording. Keep "What's New" factual |
| LinkedIn company page | 227 followers; good tagline | Paste the 120-word description, website and App Store link. Ask the founder and advisor (with consent) to list the affiliation consistently |
| TikTok / Instagram | Exist | Bio: one-line descriptor plus www link. Pin a "What Get Regular does" video |
| YouTube | **None** | Create @getregular with the same name, logo and description. See §4.4 |
| Crunchbase | Not found | Create an organization profile (founded 2025, NYC, descriptor, links). It appears in "alternatives" SERPs (for example Bowelle) |
| Product Hunt | Not found | One launch for v2.x with an accurate description. Product Hunt pages are frequently indexed |
| AlternativeTo | Not found | List the app and add it as an alternative to Bowelle, mySymptoms, Cara Care, Plop and Balloon. AlternativeTo ranks for "Cara Care alternatives" |
| App directories (appshive.co, freeappsforme.com) | Not listed | Submit via their editorial or contact routes where available; they rank for "best poop tracker app 2026" |
| Clinician profiles | Dr. Schopis appears on Doximity, Healthgrades, WebMD, Qwoted and his practice site | With his consent, add "Clinical advisor, Get Regular" to profiles he controls (practice bio, Qwoted, LinkedIn). That gives assistants a third-party corroboration of the advisor claim |
| **Wikidata** | No item | **Do not create yet.** Wikidata items need "serious and publicly available references"; an App Store listing and our own site are thin and invite deletion. Revisit after at least 2 independent, reliable press or clinical sources. **Wikipedia:** not notable; do not attempt |

### 3.3 Consistency rules
- **Same facts everywhere.** Platform: iOS (iPhone and iPad). Price: from the App Store, with date. Features: named as in fact sheet §6. Update everything within 7 days of a price or feature change.
- **No contradictory claims.** If the homepage keeps "Clinically Validated", assistants will repeat it, so substantiate or remove it everywhere at the same time.
- **Re-check the stale-data symptom quarterly** (old developer name, rating counts) by running the branded prompts.

---

## 4. Citation-target list

These are the pages that the proxy retrieved for our prompts, and how to get included. Priority: **A** = act now, **B** = next quarter, **C** = opportunistic.

### 4.1 App marketplaces (largest share of retrieval)

| Target | Why | Action | Priority |
| --- | --- | --- | --- |
| apps.apple.com listing | Retrieved in 24/37 prompts. Assistants quote subtitles, descriptions and rating counts | Optimize the description for the fan-out sub-questions (manual entry, PDF report, AI chat, period, privacy). Add an in-app rating prompt after positive moments (for example a 7-day streak), within Apple's rules. Reply to reviews | A |
| Google Play | Retrieved in 13/37 | Not applicable (no Android app). Say "iOS only" clearly on `/app` so assistants don't invent an Android version | A (copy only) |

### 4.2 Roundups and listicles

| Target URL (seen in proxy) | Type | Approach | Priority |
| --- | --- | --- | --- |
| freeappsforme.com/poop-tracker-apps/ | Independent app list ("7 Best Poop Tracker Apps in 2026") | Pitch with the fact sheet and review access | A |
| appshive.co/apps/health-fitness/poop-tracker | Aggregator list | Submit the listing | A |
| mygoodgut.com/ibs/daily-life/tracking-apps/ | Independent IBS site ("5 IBS Tracking Apps Compared") | Pitch a fair evaluation; offer premium access | A |
| gutivate.com/blog/apps | Symptom and food app list for IBS | Pitch | A |
| livescience.com/45150-apps-for-tracking-your-poop.html | Old (2014) but still retrieved | Pitch an update or new piece to Live Science health editors | B |
| fortune.com/article/best-nutrition-apps/ | Nutrition roundup | Pitch the gut angle (Nutrition Score plus stool data) | C |
| dookiedeluxe.com/learn/best-poop-tracker-apps | Competitor list that includes others ("Including Ours") | Polite correction or inclusion request with facts | B |
| balloonguthealth.com/blog/best-ios-poop-trackers-for-2025 | Competitor-owned; it is a 2025 piece, so a 2026 refresh is likely | Inclusion request; low odds | C |
| triggerbites.com/blog/best-*-alternatives (7 pages) | Competitor comparison network | Ask them to add Get Regular with accurate facts. Mainly, publish our **own honest comparison** (see below) | C |
| guttrace.com, welling.ai, mouthtogut.com, flarelyapp.com, simplepoo.com, vylaapp.com, lin.health | Competitor-owned "best of" pages | Low odds. Monitor | C |

**Our own comparison page [Recommendation]:** "Food & symptom tracker apps compared" at `/compare/food-symptom-tracker-apps`.
- Use an honest table and include our weaknesses (iOS only, few ratings, cloud AI processing via OpenAI).
- Give each app a "best for" line and date it.
- The Wix data suggests standalone comparison pages are cited less than listicles, so make it a genuinely useful guide rather than a "vs" page farm. Build one page, not many.

### 4.3 Health-reference pages (informational prompts)

| Target | Seen for | Approach | Priority |
| --- | --- | --- | --- |
| my.clevelandclinic.org, goodrx.com, healthline.com, en.wikipedia.org (Bristol stool scale), cdhf.ca, bladderandbowel.org | Bristol type, frequency and constipation questions | We will not displace them. Compete on **original, clinician-reviewed** angles (see §5) and cite the same primary literature | B |
| manhattangastroenterology.com (Dr. Schopis's practice) | "What to track before a GI appointment" | Ask whether the practice will publish a short "tracking before your visit" resource that references Get Regular, with disclosure of his advisory role | A (relationship) |
| healio.com (GI trade press Q&A on AI digestive apps) | "App built with gastroenterologist" | Pitch a founder plus advisor Q&A once claims are substantiated | B |
| advances.massgeneral.org (review of digital health for FGIDs) | "Bowelle alternatives" | Long-term: clinical evidence (pilot data) is what gets apps into clinical reviews | C |
| buzzfeed.com (poop-tracking feature), washingtonpost.com (poop frequency) | "Should I track my poop", frequency | Journalist pitch: founder story (to be confirmed), "TMI friends" social angle, aggregate data story | B |

### 4.4 Video and community

| Target | Evidence | Approach | Priority |
| --- | --- | --- | --- |
| YouTube | AIO's top cited domain (5.6% of citations, Ahrefs Mar 2026). No independent gut or poop app reviews found in the proxy | Own channel: "Bristol types explained (clinician-reviewed)", "How I log a meal and stool in 10 seconds", "What the Doctor Report contains". Use transcripts or captions, chapters, and links to `/app`. Seed 3–5 **disclosed** creator reviews | A |
| Reddit (r/IBS, r/ibs, r/Constipation, r/guthealth) | Historically heavily cited by Perplexity and AIO (Profound 2024–25). ChatGPT Reddit citations down 88% Mar→Sep 2026 (Ahrefs). Our tool could not retrieve Reddit | Founder or team accounts that disclose affiliation, answer tracking questions helpfully and link only when asked and allowed by subreddit rules. **No astroturfing**: Google calls inauthentic mentions unhelpful, and the FTC endorsement rules apply | B |
| TikTok | Brand account exists; one small creator found | Continue. Add the entity line to the bio. Lower direct citation value | C |
| HealthUnlocked, IBSPatient.org forums | Retrieved for IBS timing and constipation questions | Same disclosed-participation rule | C |

---

## 5. On-page answer-formatting rules (all blog and resource pages)

These rules follow Google's guidance (no AI-specific tricks needed; unique, helpful content), the Ahrefs findings (fan-out, primary sources, plain-text facts) and health-content (YMYL) best practice.

1. **Answer first.** Open with a 40–60 word direct answer to the page's main question, in plain language, before any story. Write it so it stands alone if quoted.
2. **One question per H2**, phrased the way people ask it ("What does Bristol type 6 mean?", "How many days without pooping is too long?"). Google says chunking is not required, so do this for readers, not as a hack.
3. **Define terms on first use** with a one-sentence definition (Bristol Stool Form Scale, FODMAP, transit time).
4. **Use tables for anything comparable:** the 7 Bristol types (form, meaning, when to talk to a doctor), what to log, and app feature comparisons. Keep the data in HTML text, not images.
5. **Add original data or first-hand material on every page**, so it is something "only we can publish". Options:
   - Screenshots of the actual logging flow.
   - A downloadable diary template.
   - Aggregate, **de-identified, consented** Get Regular statistics, for example "share of logged days in Bristol 3–4 by weekday". Only publish these after confirming what "Research consent" covers, with legal review against the Washington MHMDA and GDPR, and with a stated methodology (n, dates, definitions).
6. **Cite primary sources** inline (PubMed papers, Rome Foundation, NIDDK, ACG/AGA guidelines), with a references list. Prefer them to Healthline-style explainers; ChatGPT's 2026 shift toward PubMed and FDA rewards this.
7. **Named author plus clinical reviewer** on every health page:
   - Use `Person` schema with credentials.
   - Show "Medically reviewed by Dr. Michael Schopis, MD, board-certified gastroenterologist, on [date]" only with his documented review and consent.
   - Replace the "Get Regular Team" byline.
8. **Dates that are true.** Show "Published" and "Last reviewed/updated" with real dates. Never future-date (the current post shows 20 Oct 2026). Add a short changelog line for substantive updates. Review health pages every 6–12 months.
9. **State limits and red flags.** Every page carries "when to see a doctor" red flags and "this is not a diagnosis". This is accurate, and it protects description quality.
10. **Product bridge, not a pitch.** Add one short section: "How Get Regular helps you track this". Only use facts from the fact sheet. Link to `/app` and the App Store URL.
11. **Use plain-text facts**, not images or JS-only widgets, for prices, platforms and features. Note that the homepage currently animates its H1 from `opacity:0`; the text is in the HTML, which is fine, but keep key copy server-rendered.
12. **Video:** embed the matching YouTube video with a transcript summary.
13. **Schema:** `BlogPosting` or `Article` with `author` (Person), `reviewedBy`, `datePublished` and `dateModified`, plus `BreadcrumbList`. Structured data is not required for AI features but must match visible text (Google).
14. **Internal links:** each resource links to `/app`, `/how-ai-works` and one sibling resource. Each feature page links to the matching resource.
15. **Banned phrasing:** "clinically validated", "diagnose", "detect [disease]", "cure", "causes your symptoms" (use "associated with"). No unsourced statistics.

---

## 6. Product facts page spec: `/app`

**Purpose:** a single crawlable page that answers "what is Get Regular, what does it do, what does it cost, where does it run, what happens to my data, and what are its limits". It targets the "official", "price", "review" and `site:` fan-outs ChatGPT now runs, and the branded prompts in the panel.

- **URL:** `https://www.getregular.com/app`. Alternative: `/about-get-regular`. Choose one and never change it.
- **Linking:** link from the global nav ("The app") and the footer.
- **Title:** "Get Regular app: features, pricing, privacy and limits"
- **H1:** "Get Regular: the iOS app for tracking food, stool and gut symptoms"

### 6.1 Page sections (in order)

1. **Summary box (answer-first):** the approved 40-word description, then "Last verified: [date] · Version [x.y.z]".
2. **At a glance (HTML table):**
   - Developer (Get Regular Health, Inc.) and HQ (NYC, once confirmed)
   - Platforms: iPhone and iPad, iOS 15.1+; also runs on Apple-silicon Mac and Vision Pro as an iPad app; **no Android or web app**
   - Language: English
   - Category
   - First released
   - Current version and date
   - App Store rating with count and date
   - Price
3. **Pricing:**
   - The table of Monthly, Yearly and (if still sold) Founding Yearly by storefront, from fact sheet §5, with the date.
   - Trial wording exactly as confirmed by the team.
   - What is free and what is premium (the Terms name Gut Check, Experiments, Doctor Report and Recipes).
   - Billing through Apple and how to cancel.
4. **What you can log:**
   - Food by photo or text, with ingredient editing
   - Stool by photo **or manual Bristol entry**, with stool-photo privacy mode
   - Symptoms
   - Drinks and water goal
   - Supplements and medications
   - Period dates
   - Notes and toilet time
   - No-go days
   - Backdating up to 7 days
   - Optional calories
5. **What the app calculates:**
   - Gut Health Score (7-day weighted)
   - Nutrition Score, including scoring food before you eat it
   - Regular Score (define it once confirmed)
   - Streaks
   - Weekly Digest
   - Backlog heatmap
6. **AI features:** Gut Check chat, core memories, Experiments, recommendations and Recipes. Explain what the AI does and does not do.
7. **Doctor Report:** list of PDF contents, from the 1.6 release notes. Include a sample image with dummy data.
8. **Privacy and AI processing (summary):**
   - Data goes to the OpenAI API, sent as anonymized content per the policy.
   - Photos are not stored permanently; only results are kept.
   - Manual entry is an alternative to photos.
   - Supabase handles storage; there is no ad sharing of health data.
   - Deletion completes within 30 days.
   - Link to `/how-ai-works` and the privacy policy.
   - Mirror the App Store privacy label honestly. Resolve the location and analytics discrepancies first.
9. **Clinical input:** who, what was reviewed and when; link to `/clinical-review`. **No "validated" wording** unless a study exists.
10. **What Get Regular is not:** not a diagnostic tool or medical device; not a substitute for care; not for emergencies (from the Terms); not for under-13s.
11. **Who it's for / not for:** honest fit, for example "if you want offline-only, on-device storage, choose a local-only diary".
12. **FAQ:** 8–12 questions that mirror the branded panel prompts (Android? free trial? manual logging? doctor report? data and AI? cancel?). Each answer is 1–3 sentences.
13. **Changelog:** the last 5 releases with dates, from the App Store.
14. **Press and contact:** hello@getregular.com, logo download and the founder bio (once confirmed).

### 6.2 Implementation
- Server-render all content.
- Add it to the sitemap with a real `lastmod`.
- Add the canonical tag.
- Add OG tags.
- Make it fast on mobile.

### 6.3 Structured data (match the visible text exactly)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {"@type": "Organization", "@id": "https://www.getregular.com/#org",
     "name": "Get Regular", "legalName": "Get Regular Health, Inc.",
     "url": "https://www.getregular.com/", "logo": "https://www.getregular.com/[logo].png",
     "email": "hello@getregular.com",
     "sameAs": ["https://apps.apple.com/us/app/get-regular-ai-gut-health/id6749188690",
                "https://www.linkedin.com/company/get-regular/",
                "https://www.tiktok.com/@getregular",
                "https://www.instagram.com/get.regular"]},
    {"@type": "MobileApplication", "@id": "https://www.getregular.com/app#app",
     "name": "Get Regular: AI Gut Health", "operatingSystem": "iOS 15.1 or later",
     "applicationCategory": "HealthApplication",
     "publisher": {"@id": "https://www.getregular.com/#org"},
     "softwareVersion": "2.0.1", "inLanguage": "en",
     "downloadUrl": "https://apps.apple.com/us/app/get-regular-ai-gut-health/id6749188690",
     "offers": [{"@type": "Offer", "price": "0", "priceCurrency": "USD", "description": "Free download; subscriptions available"},
                {"@type": "Offer", "name": "Get Regular Monthly", "price": "12.99", "priceCurrency": "USD"},
                {"@type": "Offer", "name": "Get Regular Yearly", "price": "99.99", "priceCurrency": "USD"}],
     "description": "[approved 40-word description]"}
  ]
}
```

- Omit `aggregateRating` unless the rating is shown on the page and complies with Google's review-snippet policies. Never add self-collected testimonials as ratings.
- Add `founder` and `Person` entries only after the team confirms them.
- **Automation [Recommendation]:** a small job that calls `itunes.apple.com/lookup?id=6749188690&country=us` on each release and opens a PR when the version, prices or rating change. It updates `/app`, the JSON-LD and the fact sheet together.

### 6.4 Companion pages
- **`/how-ai-works`:**
  - Which inputs go to the AI.
  - What the scores summarize and how they are calculated (in plain terms).
  - What the AI cannot infer.
  - How uncertainty is shown.
  - The privacy specifics.
- **`/clinical-review`:**
  - The advisor's role, credentials, what he reviewed, when, and conflict-of-interest disclosure.
  - The guidance the app references (Bristol Stool Form Scale, Rome IV, ACG/AGA).

---

## 7. Robots and crawler policy

**Current state (2026-10-19):**
- `/robots.txt` returns **404**, so crawlers treat the site as fully allowed.
- `/sitemap.xml` returns 200, but every URL uses the **apex host**, which 307-redirects to www, and the blog post has a future `lastmod` (2026-10-20).
- The homepage returned 200 to spoofed UAs for OAI-SearchBot, GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, Claude-SearchBot, bingbot and Googlebot. This only indicates that no UA-based blocking is in place; it cannot test IP-verified bot rules in Vercel's firewall.

**Recommendation:** be fully open to search and answer bots. Training bots are a business decision; our default recommendation is to allow them.

```
# https://www.getregular.com/robots.txt
User-agent: *
Allow: /

# Explicitly welcome search/answer crawlers (documentation: see section 1)
User-agent: Googlebot
User-agent: Bingbot
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: PerplexityBot
User-agent: Perplexity-User
User-agent: Claude-SearchBot
User-agent: Claude-User
User-agent: Applebot
Allow: /

# Training / model-improvement tokens: allowed by default (see rationale)
User-agent: GPTBot
User-agent: ClaudeBot
User-agent: Google-Extended
User-agent: Applebot-Extended
Allow: /

Sitemap: https://www.getregular.com/sitemap.xml
```

**Rationale**
- The site holds only marketing and public content; user health data lives in the app and backend, never on these URLs.
- For a small, new brand, appearing in model training data may improve baseline brand familiarity. This is plausible but unproven, which is why it is a business decision. The cost is low because there is no paywalled or proprietary content.
- **Never block Google-Extended**: it also governs Gemini-app grounding.
- If the team prefers to opt out of training, disallow only GPTBot, ClaudeBot and Applebot-Extended, and keep every search and user agent allowed.

**Also do**
1. Keep the Search Console "Search generative AI" setting at **Include**.
2. Do not add `nosnippet` or `max-snippet:0` to marketing pages.
3. Check that the Vercel Firewall or Bot Protection "AI bots" managed rules allow verified search and answer bots. Review logs monthly for 403s or 429s to those UAs.
4. Sitemap: use `https://www.` URLs, real `lastmod` values, and include `/app`, `/how-ai-works`, `/clinical-review` and every resource. Submit it in GSC and BWT and ping IndexNow on updates.
5. Make the apex→www redirect permanent (308/301). Add `<link rel="canonical">` on every page.
6. **llms.txt is optional and low priority.** Google ignores it ("neither help nor hurt"); other engines' use is undocumented. If added, make it a short pointer to `/app` and the resources, generated from the same source as the sitemap.

---

## 8. Measurement protocol (supersedes the earlier `ai/measurement-protocol.md` where they conflict)

This protocol keeps the earlier protocol's denominators and caveats, which were sound. It adds proxy sources, a target page and an **accuracy rubric tied to the fact sheet**.

### 8.1 Panel
- **Source:** `geo/ai-prompt-panel.csv`.
- **Size:** 47 prompts in total: 39 neutral discovery prompts (37 proxy-collected plus the YouTube and Reddit variants) and 8 branded prompts.
- **Core monthly panel (33 prompts):** 25 neutral prompts plus all 8 branded prompts.
  - 17 commercial "choose" and "feature" prompts
  - 4 comparison prompts
  - 4 informational prompts
  - 8 branded prompts
- **Run the full 47 prompts quarterly.**

**Changes from the earlier 50-prompt bank**
- Added natural-language "best…", "app that…", "vs" and "alternatives" prompts. Those are the ones that retrieve listicles and App Store pages.
- Merged or retired abstract meta prompts that real users rarely ask (P03, P09, P10, P39, P40).
- Added branded fact checks for price, trial, Android, manual logging, AI data and clinical review.
- Every prompt now carries a `target_page`, so a miss maps to an owned asset.

### 8.2 Engines and surfaces (record the exact surface and mode)

| Engine | Surface to record |
| --- | --- |
| ChatGPT | Logged-out web, plus logged-in with search on |
| Perplexity | Default model |
| Google | AI Overviews (US, logged out, incognito) and AI Mode |
| Gemini | App |
| Copilot | Web |
| Claude | claude.ai with web search on |

- Keep API benchmarks separate.
- Country: US. Language: English. Fresh session, no memory or personalization.

### 8.3 Cadence
- **Baseline:** 3 collections over 2 weeks (different days) before major site changes ship.
- **Then:** monthly core panel and quarterly full panel.
- **After a major page launch:** re-run the affected cluster about 3–6 weeks later to allow recrawl. Google says preview changes can take "several days to several months"; OpenAI and Perplexity say robots changes take about 24 h.

### 8.4 Scoring
Use the existing `results-template.csv` columns plus `rank_position`, `recommendation_level`, `fact_ids_checked` and `accuracy_errors`.

| Measure | Definition |
| --- | --- |
| Mention | Get Regular named (0/1) |
| Recommendation level | 0 = absent · 1 = listed · 2 = recommended for a use case · 3 = top pick |
| Rank position | Order among the apps listed (blank if absent) |
| Owned citation | Links to getregular.com (0/1). Record which URL |
| Store citation | Links to the official App Store listing (0/1) |
| Third-party citation | A cited non-owned page that mentions Get Regular (0/1). Record the URL; these are our earned-media wins |
| **Accuracy** | For each fact the answer states, check it against the fact sheet: platform (iOS only), price, trial, manual logging, Doctor Report, AI provider/privacy, clinical claims, developer name. Score = correct facts / stated facts. Automatic "critical error" flag for: Android availability, "FDA"/"clinically validated"/diagnosis claims, wrong price, or wrong developer |
| Sentiment / caveats | Positive / neutral / negative, plus the caveat text quoted |
| Competitors | Ordered list of brands named |
| Fan-out queries | Record them when the UI exposes them (ChatGPT sources panel, Perplexity steps). Treat them as observed evidence, never as inferred |

**Report** (with numerators and denominators, by engine and cluster before any blend):
- Mention coverage
- Recommendation coverage
- Owned and store citation coverage
- Citation share (deduplicated per answer)
- Correct-description rate
- Critical-error count

### 8.5 First-party signals (track monthly)
- **Google Search Console:** Generative AI performance report. It shows impressions, pages, countries and devices (no clicks or queries), with data from 18 May 2026 onward, and requires a verified property. Dates are in Pacific Time; normalize them.
- **Bing Webmaster Tools:** AI Performance (citations, cited pages, grounding queries; sampled, 90-day window).
- **Server/Vercel logs:** hits and status codes for OAI-SearchBot, ChatGPT-User, PerplexityBot, Perplexity-User, Claude-SearchBot, Claude-User, Googlebot, bingbot and Applebot. A spike in user-fetch agents means we are being retrieved live.
- **Analytics (PostHog):** referrals from chatgpt.com (ChatGPT appends `utm_source=chatgpt.com`), perplexity.ai, gemini.google.com, copilot.microsoft.com and claude.ai. Follow these through App Store click-outs.
- **App Store Connect:** App Analytics web-referrer sources and downloads.
- **Business KPIs:** downloads from referred sessions, first log, trial or subscription start. Citations are leading indicators only.

### 8.6 Experiment log
- Record each publication or change with its date and URL, the hypothesis and the prompts expected to move.
- **Example:** "`/app` with plain-text pricing and an 'iOS only' line will raise the correct-description rate on the branded price and platform prompts from the baseline within 6 weeks." Primary KPI: accuracy. Guardrail: no clinical over-claim.

---

## 9. 90-day roadmap

| Weeks | Work |
| --- | --- |
| 0–2 | Team answers the fact-sheet §11 questions. Remove or substantiate homepage claims. Ship robots.txt, the sitemap fix, canonical tags, Organization/WebSite JSON-LD and the 308 redirect. Fix the blog date and byline. Verify GSC and BWT; confirm "Search generative AI = Include". Run the baseline panel 3×. Update the App Store description and seller URL |
| 2–6 | Ship `/app`, `/how-ai-works`, `/clinical-review`, the feature pages (`/bowel-movement-tracker`, `/food-symptom-tracker`, Doctor Report) and the clinician-reviewed Bristol resource. Create the YouTube channel and post 3 videos. Create Crunchbase, AlternativeTo and Product Hunt listings. Start roundup outreach (freeappsforme, appshive, mygoodgut, gutivate). Approach Dr. Schopis's practice |
| 6–12 | Publish the food-diary and bowel-frequency resources, the honest comparison page and the first consented aggregate-data piece. Start creator reviews (disclosed). Journalist pitches. Re-run the panel and compare against the baseline. Iterate on the prompts where competitors still win |

---

## 10. Do-not list
- Do not pay for, or trade for, undisclosed listicle placements or reviews. Do not post sockpuppet Reddit content. Do not incentivize App Store ratings (this breaches Apple's rules and FTC endorsement guidance).
- Do not publish health statistics without a source, or outcome claims ("feel better", "find your triggers") as guarantees.
- Do not create Wikidata or Wikipedia entries now.
- Do not expect llms.txt or special markup to move Google AI features. Google states they don't.
- Do not treat proxy search results, or one engine's answer, as a measurement of all AI engines.

---

## Sources (accessed 2026-10-19 unless noted)

**Official**
- Google, "AI features and your website": https://developers.google.com/search/docs/appearance/ai-features (updated 2025-12-10)
- Google, "Optimizing your website for generative AI features on Google Search": https://developers.google.com/search/docs/fundamentals/ai-optimization-guide (updated 2026-07-10)
- Google common crawlers, Google-Extended: https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers
- OpenAI crawlers: https://developers.openai.com/api/docs/bots
- Perplexity crawlers: https://docs.perplexity.ai/guides/bots
- Anthropic crawlers: https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler (updated 2026-04-07)

**Studies**
- Ahrefs, "How ChatGPT Does Query Fan-Out (15 Million Queries Studied)": https://ahrefs.com/blog/query-fan-out-chatgpt/ (12 Oct 2026)
- Ahrefs, AI Overview citations vs top 10: https://ahrefs.com/blog/ai-overview-citations-top-10 (2 Mar 2026)
- Ahrefs, AI search overlap: https://ahrefs.com/blog/ai-search-overlap/ (11 Aug 2025)
- Ahrefs, freshness study: https://ahrefs.com/blog/do-ai-assistants-prefer-to-cite-fresh-content (2025; via secondary summaries)
- Profound, AI platform citation patterns: https://www.tryprofound.com/blog/ai-platform-citation-patterns (data Aug 2024–Jun 2025)

**Press and secondary summaries**
- Bing AI Performance report: https://searchengineland.com/bing-webmaster-tools-ai-performance-report-468751 and https://www.searchenginejournal.com/bing-webmaster-tools-adds-ai-citation-performance-data/566874/
- GSC Generative AI report and opt-out control: https://searchengineland.com/google-search-console-ai-performance-reports-and-controls-to-block-your-content-in-ai-responses-479298 and https://ppc.land/google-gives-site-owners-a-toggle-to-exit-ai-overviews-and-ai-mode/ (the default-Include claim comes from third-party reports; confirm in your GSC property)
- Listicle and format studies (Wix Studio AI Search Lab, Delta V Digital), via https://authoritytech.io/blog/page-types-earn-ai-citations-research-data-2026 and https://www.deltavdigital.com/resources/reports/ai-citation-study/. These are vendor studies; primaries not opened.

**Proxy SERP data:** see `ai-prompt-panel.csv`, `proxy_top_sources` column (web search, 2026-10-19).
