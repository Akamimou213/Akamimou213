# Get Regular: competitor and content-gap analysis

**Prepared:** 19 October 2026. **Market:** US, English. **Scope:** organic search and AI-answer visibility for an iOS gut-health tracker (meal photo/text, Bristol stool type, symptoms, AI scores and patterns).

**Companion files**
- `competitor-pages.csv`: 47 inspected or ranking pages, with page type, Semrush sample positions, word count, reviewer, freshness, assets and weaknesses.
- `roundup-and-citation-targets.csv`: 33 roundup, directory and citation pages, with apps listed, whether Get Regular appears and the next action.
- Raw sitemap lists and page HTML are in `/tmp/claude-0/-home-user-Akamimou213/101b497e-e50c-5731-a26a-126e636d354d/scratchpad/comp/`. That folder holds one `*.tsv` per domain, `sitemap_inventory_by_section.csv`, `pages/` and `roundups*.jsonl`.

## How to read the numbers

- **Semrush figures come only from the 6 October workbook.** They are Semrush US estimates: keyword counts, positions, volumes, KD and estimated traffic. They are not audited visits. The keyword export is a **sample of 26–50 rows per domain**, not a full ranking list. A blank cell means "not in the sample", not "does not rank". ZOE and Nerva have domain baselines only.
- **SERP landscape** combines two sources. The first is the four Semrush SERP snapshots in `serps.csv` (labelled "Semrush SERP"). The second is one live web-search pass per query on 19 October 2026 (labelled "web search"). That tool returns about nine results, not a personalised Google page, so its result order is approximate and SERP features are not visible.
- **Word counts** are rendered page text including navigation and footer. They are approximate, likely 10–25% high.
- **Reviewer, date and schema fields** were extracted automatically from the HTML on 19 October 2026. "Not detected" is not proof of absence.
- Anything marked **UNVERIFIED** could not be fetched or checked.

## 1. Executive summary: the biggest exploitable gaps

1. **Nobody owns "diary/printable + real app demo" for tracking intent.** The top results for *IBS food diary* (Semrush 1,000; 2,400 for "irritable bowel syndrome food diary"), *food and symptom diary* and *food diary for diarrhea* (9,900, validate first) fall into two groups:
   - Bare institutional PDFs: Stanford, Kaiser, NHS, WGO.
   - App homepages: Bowelle at #5 with a 599-word page, and mySymptoms at #5 and #12.

   No page combines a well-designed printable, a worked example, clinical review and an app path. FoodTrigger AI is already testing this format with thin (~700-word), unsourced pages that each include a PDF.
2. **App-comparison and "alternative" queries are owned by self-serving vendor pages.** Pages that rank for *poop tracker app*, *best gut health apps 2026* and *mysymptoms / bowelle / cara care alternative* are almost all written by competitors that rank themselves first:
   - Balloon: "Poop Tracker Apps Doctors Recommend" names no doctor.
   - Triggerbites: about 25 vs/alternatives pages.
   - Also Lin Health, Welling, GutTrace, Dookie Deluxe and Mouth To Gut.

   The neutral references are stale: Healthline is from 2020 and Live Science from 2014. A transparent, hands-on, dated comparison is missing from these results.
3. **Get Regular is absent from every roundup checked (0 of 30 verified pages; 3 more could not be fetched).** The highest-value fixes are Healthline (stale; has a nomination route), MyGoodGut (MD-reviewed, updated 25 Sep 2026), Gutivate, the Healthify app directory (MyGoodGut reuses its ratings) and AlternativeTo. These are the pages AI answers summarised in this research.
4. **Low-volume "tracker" queries are open.** *Bowel movement tracker* (140), *stool tracker app*, *bristol stool chart app*, *constipation tracker*, *ibs tracker app* and *bloating tracker* are ranked by store listings and small app sites (flarecare.io, poop-tracker.com, vylaapp, bodysitrep). A focused feature page from Get Regular can compete here.
5. **Bristol and "how often should you poop" are long-term head terms.** Cleveland Clinic, GoodRx, Continence Health Australia and Healthline hold them. Balloon (Authority Score 26, MD-reviewed) is at #21 for "how often should you poop". Use these as owned resources (chart, printable, checker) and for internal links, not as launch traffic bets.

## 2. Competitor profiles

### Sitemap inventory (pulled 19 Oct 2026)

| Domain | URLs in sitemap | Main sections (count) | Semrush US baseline (est.) |
|---|---|---|---|
| balloonguthealth.com | 93 | blog 68, knowledge-base 6, changelog 6, tools 2, authors 3 | 4,782 kw / 5,186 visits / AS 26 / 438 RD |
| plopdiary.com | 108 | 17 pages × 6 languages (en/es/fr/ja/ko/zh) | 136 kw / 235 visits / AS 23 / 317 RD |
| bowelle.com | 5 | home, faq, press, privacy, terms | 31 kw / 133 visits / AS 19 / 411 RD |
| mysymptoms.net | 529 | Q&A 468 (question/ + dwqa-answer/), ~25 posts, user guides, clinic page | 187 kw / 317 visits / AS 26 / 686 RD |
| foodtriggerai.com | 19 | 12 flat SEO landing pages, blog 1 | not obtained |
| careclinic.io | 730 | ~663 flat pages: "X tracker" landing pages, condition articles, printables, calculators | 13,720 kw / 3,510 visits |
| bearable.app | 296 | top-level 108, support 100, user stories 26, worksheets 9, "best X apps" posts | 2,104 kw / 10,790 visits |
| cara.care | 295 | blog 236 (mostly German), /en/ 47 | not obtained |
| nervahealth.com | 1,147 | au/ 395, eu/ 310, post/ 172, clinician-directory 118, article/ 92, compare/ 2, reports/ 3 | 10,783 kw / 30,349 visits |
| mygoodgut.com (editorial) | 310 | ibs/ 105, probiotics/ 72, gut-health/ 66, GI disorders 53 | not obtained |
| triggerbites.com (discovered) | 1,236 | ingredients/ 958, blog 142, tools/ 124 | not obtained |
| getregular.com | 5 | home, blog index, 1 post, 2 legal | 3 kw / 7 visits / AS 7 / 349 RD |

AS = Semrush Authority Score; RD = referring domains (workbook `backlinks.csv`).

### Balloon (balloonguthealth.com): the direct content competitor

- **What works:** a remedy and symptom-question blog. Sampled traffic comes from a few long, sourced articles, each ranking for many variants:
  - "haven't pooped in 3 days": about 10 variants at #2–4, an estimated 625 visits/mo from the sample.
  - Yogurt and constipation: an estimated 453 visits/mo.
  - Turmeric/ginger: #1 for "does turmeric make you poop".

  Template: Key Takeaways, H2s phrased as questions, FAQ, about 10–14 PMC links, and a "Start tracking your poops" CTA with App Store and Play links. Its MD reviewer (Darragh O'Carroll, MD) appears on newer posts (Aug–Sep 2026). Two interactive tools went live in October 2026 (poop-frequency checker, gut-test finder; `dateModified` 2026-10-06), so Balloon is moving toward tools.
- **Page types that win:** topic articles (symptom and food questions) far ahead of everything else. The homepage ranks only for the brand. Its comparison post is Semrush SERP #6 for "poop tracker app".
- **Weaknesses:**
  - Most traffic pages have no reviewer.
  - Both app listicles are self-ranked, have no testing method and do not disclose the relationship. One is titled "2025".
  - The Bristol page (Aug 2026) has no printable or log sheet.
  - The tracking how-tos have no template.
  - Much of the traffic is supplement and remedy intent, which the workbook marks Hold/Validate for us.
- **Do not copy:** the remedy and supplement library (probiotics, magnesium, prunes).

### Plop (plopdiary.com): realistic ranking benchmark for the app keyword

- **What works:** one very long homepage (about 4,900 words, 51 H2s, rich schema: SoftwareApplication, FAQPage, HowTo, MedicalCondition, Speakable) ranks #5 for poop tracker app (590), poop app (480), poop tracker (390) and poo keeper (720). The Spanish stool-colour page ranks #3–5 for Spanish colour queries.
- **Page types:** app landing page plus about 16 short guides per language.
- **Weaknesses:**
  - No author, reviewer or date.
  - Guides are around 800 words with no visible sources; the Bristol overview has no H2s.
  - The /en/poop-tracker/ feature page duplicates the homepage.
  - Fixed product claims (privacy, ML) need checking before we reference them.
- **Lesson:** with a 136-keyword footprint and AS 23, a strong, well-structured app page reaches #5 for the main app term. That is the bar.

### Bowelle (bowelle.com): diary intent captured by an app page

- **What works:** a 5-URL site where the homepage ranks #5 for "irritable bowel syndrome food diary" (2,400, KD 25) and #7 for "ibs food diary" (880). It probably benefits from 411 referring domains and the 2020 Healthline listing.
- **Weaknesses:** a 599-word app page answers informational and template intent; there is no template, guide or example. This is the clearest **displacement target** for a real IBS food-diary guide with a printable.

### mySymptoms (mysymptoms.net): oldest link profile and a weak content layer

- **What works:** 686 referring domains, the most in the set. The App Store page claims a feature in Healthline's "Best Gut Health Apps". The homepage ranks #12 for "food diary for diarrhea" (9,900) and #5/#13 in the "food and symptom diary" Semrush SERP. There is a clinician product page (/clinic-info/).
- **Page types:** homepage, thin support Q&A (468 URLs), and about 10 posts refreshed in 2025–26.
- **Weaknesses:**
  - The IBS food diary guide (Aug 2026, 2,800 words) sits at #21. It has no reviewer and no printable.
  - The homepage carries no schema beyond ImageObject.
  - Several posts date from 2015–2020.
  - Search summaries describe the app's depth as manual, with a learning curve.

### FoodTrigger AI (foodtriggerai.com): the format to beat, with thin execution

- **What works (format):** 12 flat SEO landing pages that match our target queries one-to-one:
  - food-diary-for-diarrhea, ibs-food-diary, food-diary-for-food-intolerance
  - poop-tracker, bloating-after-eating, symptom-diary, elimination-diet-log

  Each page carries a **free printable PDF** (7-day food and symptom diary, bloating sheet), FAQPage schema and a founder bio.
- **Weaknesses:** about 700–830 words, one external link, no sources, no reviewer, no dates. No Semrush baseline was obtained, so rankings are unknown.
- **Lesson:** the page-per-query map is right. Win on depth, review, sources and a better printable.

### CareClinic (careclinic.io): programmatic "X tracker" pages

- **What works:** about 660 flat pages. Many are "{condition} tracker", "{x} diary" or "printable {x}" pages: stool-tracker, poop-tracker, gi-symptom-tracker, ibs-symptom-tracker, food-symptom-diary, crohns-food-diary, how-to-track-food-intolerances. The stool tracker is Semrush SERP #15 for "poop tracker app" and appears in web search for "stool tracker app" and "bristol stool chart app".
- **Weaknesses:** generic all-conditions app. Pages are long but poorly structured (2 H2s in 2,600 words on food-symptom-diary). Several are 2025 or older. Reviewers are shown by first name only. The site's top traffic is outside our scope (drug interactions, BAC calculator).
- **Lesson:** feature pages per tracking job work even for a generalist. Do not copy the off-topic sprawl.

### Bearable (bearable.app): resources plus "best X apps of YEAR"

- **What works:** brand demand (14,800 for "bearable") plus resources:
  - The symptom tracker worksheet ranks #2 for "symptom tracker template".
  - The mental-health check-in worksheet ranks #1.
  - "The best period tracker apps of 2026" ranks #9 for "best period tracker app" (6,600), about 194 estimated visits/mo.

  It also runs use-case pages (prepare for a medical appointment) and user stories.
- **Weaknesses:** not gut-specific; key pages date from 2023–24. The worksheet has no GI fields: stool form, meal timing, bloating.
- **Lesson:** a yearly-updated roundup and a free worksheet are proven formats for a tracker brand.

### Cara Care (cara.care): clinical substitute; English content is secondary

- Robots.txt returned 404; the sitemap was found at /sitemap.xml. Most of the 236 blog URLs carry German slugs. The English stool-colour article has a table and sources, but no schema and no visible date or author. Cara is now a prescription and insurance-oriented IBS program (Bayer ownership per search summaries; unverified). **Check US availability before any "Cara Care alternative" page.**

### Nerva (nervahealth.com): comparison hub and research reports

- **What works:**
  - /compare/ibs-apps: a table plus RCT data, "reviewed by Monash-trained dietitians", including a "discontinued apps" section.
  - "Nerva vs" articles.
  - /reports/ (IBS report 2025) and a clinician directory (118 URLs).
  - Long medically reviewed explainers, e.g. "Why am I always bloated?" (Apr 2026, about 4,000 words).

  Semrush SERP: homepage #6 for "gut health app".
- **Weaknesses:** "Coffee and IBS" dates from 2020. The comparison is self-serving and puts trackers alongside therapeutics.
- **Lesson:** an original report is a link asset; a compare hub becomes an AI-citation source.

### MyGoodGut (mygoodgut.com): editorial roundup to get into

- A 310-URL affiliate-disclosed health site, MD- and RDN-reviewed, refreshed in September 2026. Its "5 IBS Tracking Apps Compared" lists Cara Care, Bowelle, mySymptoms, Monash and Nerva, and reuses Healthify directory ratings. It discloses no hands-on testing.

### Triggerbites (triggerbites.com): discovered; the most aggressive AI-answer competitor

- 1,236 URLs:
  - 958 programmatic ingredient pages.
  - 124 "checker" tools (FODMAP, histamine, lactose and others).
  - 142 posts, including about 25 "Triggerbites vs X" and "best X alternatives" posts covering mySymptoms, Bowelle, Cara Care, Bearable, CareClinic, Monash and Nerva.
  - "Best IBS apps / food diary apps / symptom tracker apps of 2026".
- It came up in web search for all three "alternative" queries and for "best gut health apps 2026". Pages are self-ranked and show no reviewer.
- **Implication:** vendor comparison pages currently feed AI answers in this category. We need our own honest comparisons and listings on neutral pages.

### Other challengers seen in results (no Semrush data)

- **GutCode (gutcode.app):** German AI tracker. Gut Score 0–100, photo scan, Apple Health; 21 URLs. Closest product overlap with Get Regular's AI score.
- **Dookie Deluxe:** "Best poop tracker apps 2026 (including ours)", with a gut regularity score.
- **GutTrace:** "Best gut health apps 2026".
- **Mouth To Gut:** 117 news posts and 76 condition pages.
- **poop-tracker.com:** Toilet Log. Listed in Healthline 2020; ranks for app queries.
- **Bloating and AI-photo apps:** flarecare.io, Debloaty, Bloatless, Vyla, BodySitRep, PoopCheck, Poopaya.
- **Others:** SimplePoo, Flarely.

The AI-photo, gut-score positioning is crowded. Get Regular's differentiators must be shown, not claimed: the stool and meal timeline, the gastroenterologist involvement (verify name and role) and the report.

### ZOE (overlap topics only)

- No ZOE keyword or page data was retrieved (domain baseline only). The relevant overlap is the **#bluepoopchallenge** transit-time campaign. Per web search it earned coverage from PR Newswire, Newsweek and Medical News Today, plus a *Gut* journal paper (PMC8349893).
- **Lesson:** a participatory self-tracking experiment with published aggregate results earns national links. A Get Regular equivalent would be an aggregate, consented, de-identified stats report (see playbook). Verify consent and privacy rules first.

## 3. Which page types win (from the workbook + inspection)

| Page type | Evidence (Semrush US est., sample) | Who does it | Fit for Get Regular |
|---|---|---|---|
| Symptom/food question article | Balloon "3 days" #2 (1,600); yogurt #5–6 (2,900); turmeric #1 (720) | Balloon, Nerva, Cara | Medium. Choose questions that lead to logging (coffee/bloating, bloating after eating), not remedies. |
| App landing page with long-form content | Plop #5 poop tracker app (590); Bowelle #5 IBS diary (2,400) | Plop, Bowelle, mySymptoms | High: feature pages per job. |
| Printable template / worksheet | Bearable #2 symptom tracker template; PDFs hold #1–4 for IBS food diary and food & symptom diary (Semrush SERP) | Bearable, FoodTrigger AI, institutions | High: first acquisition asset. |
| Interactive tool | Balloon checker/finder (new, unranked in sample); Triggerbites 124 checkers | Balloon, Triggerbites, CareClinic calculators | Medium: Bristol type picker, frequency checker. |
| Comparison / alternatives / "best X of YEAR" | Balloon listicle Semrush SERP #6; Bearable period list #9 (6,600); Triggerbites alternatives in web search | Balloon, Bearable, Triggerbites, Nerva | High for AI answers once apps are tested. |
| Support/Q&A pages | mySymptoms "adding symptoms" #13 (1,300; ambiguous) | mySymptoms | Low. |

## 4. SERP landscape for 25 priority queries

Volume/KD are from the workbook (`master_keywords.csv`); "–" means not in the workbook. Feasibility is a judgment from result types and competitor strength, not a ranking forecast.

| # | Query | US vol / KD | Who ranks (domain types) | Dominant intent / format | Exploitable weakness | Feasibility |
|---|---|---|---|---|---|---|
| 1 | poop tracker app | 590 / 33 | Semrush SERP: App Store/Play #1–3, Reddit #4, Plop #5, Balloon listicle #6, Live Science (2014) #9, CareClinic #15. Web search: same plus poop-tracker.com. | Download / app selection | Editorial results are self-ranked (Balloon) or 12 years old | **Med.** Stores own the top; Plop (AS 23) shows #5 is reachable. Needs ASO too. |
| 2 | bowel movement tracker | 140 / 31 | Stores, Live Science, flarecare.io feature page, poop-tracker.com, Plop | App / feature | Small app sites with feature pages | **Med–High** |
| 3 | stool tracker app | 30 / – | Live Science, CareClinic, PCal, poop-tracker.com, Plop, Balloon listicle, poopcheck.app | App | Thin, generic pages | **High** (low volume) |
| 4 | bristol stool chart | 74,000 / 68 | Continence Health Australia, Cleveland Clinic, GoodRx, Wikipedia, Stanford, clinics | Reference + image + printable | No leader pairs the chart with a log or tracking method | **Low** near term; build as a resource and long-term target |
| 5 | bristol stool chart app | 20 / – | Bristol Stool Chart app (Play, open source), GitHub, CareClinic, bristolstoolchart.net, Plop, Digbi | App | Basic single-purpose apps | **High** |
| 6 | food and symptom diary | 70 / 14 | Semrush SERP: Stanford PDF #1, Bupa, NHS PDF, Amazon, mySymptoms #5. Web search adds foodchain PDF, Love Your Gut, Healthline, Balloon. | Printable template + how-to | PDFs give no guidance; app pages give no template | **Med–High** |
| 7 | food symptom tracker app | 70 / 28 | App Store listings, Healthify directory, Gutivate roundup, Bowelle | App selection | Directory and roundups exclude us | **Med–High** |
| 8 | ibs food diary | 1,000 / 27 (IBS food diary variant 2,400 / 25) | Semrush SERP: essentialsofibs PDF, Kaiser PDF, PMC, IFFGD, Bowelle #5, aboutibs, small blogs, Amazon. Web search: gourmend, templacity (Oct 2026), mouthtogut, irritablebowelsyndrome.net PDF. | Template + guide | Bowelle's 599-word app page; mySymptoms guide #21 with no printable | **Med** (small blogs rank) |
| 9 | ibs tracker app | 20 / – | Stores, Gutivate, CareClinic, CDHF myIBS, Bowelle | App | Weak app pages | **High** (low volume) |
| 10 | best ibs app | 20 / – | lin.health (vendor), FoodLog, bowelandhernia.co.uk, Bowelle, App Store, AlternativeTo | Comparison | Therapeutics-led, vendor-written | **Med**: we are one tracker among therapies |
| 11 | bloating tracker | 0 measured / – | vylaapp, bodysitrep, debloaty, unbloat, bloatless, Plop, CareClinic Play listing, Balloon | App | All small app sites, thin | **High**, but negligible measured demand: a feature page, not a priority |
| 12 | why do i bloat after eating | 1,300 / 30 | GI clinic blogs (gastroconsa, Summit Health, NYGA), Healthline ×2, brands | Explainer | Clinic posts give no self-tracking method | **Med**: needs named clinical reviewer |
| 13 | food diary for diarrhea | 9,900 / 37 (validate) | IFFGD, Walgreens, foodchain PDF, WGO PDF, NHS Scotland, Stanford PDF, Amazon, Bowelle App Store, Healthify (mySymptoms), calm & happy gut. Semrush sample: mySymptoms #12. | Mixed: chronic-diarrhea diet + printable diary | No result combines a diary, timing guidance and red flags | **Med**; validate volume first (workbook flag) |
| 14 | food diary for food intolerance | 720 / 36 | Amazon ×3, Everlywell, Intolerance Friendly Kitchen, dietsleuth, smartblood, FoodLog | Template + how-to | Commercial and paid-template results | **Med–High** |
| 15 | how to find food triggers | – | Mixed: overeating triggers (Bassett, WeightWise), dietitian blogs, Greatist, Triggerbites, Healthline | Method | Split intent; no worked example from real logs | **Med** |
| 16 | how often should you poop | 18,100 / 43 | Metamucil, UnityPoint, GoodRx, HealthCentral, Healthline ×2, clinics. Balloon #21 (Semrush sample). | Normal-range answer | Few results let a reader check their own pattern | **Low–Med** |
| 17 | constipation tracker | 20 / – | Play Store, Poopaya, poop-tracker.com, Plop ×2, Balloon listicle | App | Thin store pages | **High** (low volume) |
| 18 | poop color chart | – | Baby-poop charts dominate (Similac, Thomson, Aeroflow, Northwestern); Cleveland Clinic, MedicineNet for adults | Image chart, mostly infant | Adult intent is a minority | **Low**; target "stool color chart" for adults inside the Bristol/stool hub |
| 19 | gut health app | 70 / 39 | Semrush SERP: stores #1–2, thegutstuff #3, Healthline 2020 #4, CDHF #5, Nerva #6, Healio #10, Healthify #14, Plop #12, Balloon #15 | App selection | Healthline list is 6 years old | **Med**: homepage + roundup inclusion |
| 20 | best gut health apps 2026 | 20 / – ("best gut health apps") | Lin Health, Fortune (nutrition), InnerBuddies, Welling, GutTrace, Triggerbites, Mouth To Gut | Comparison | All vendor-written, self-ranked | **Med** for our page; **High** value for inclusion and AI answers |
| 21 | mysymptoms alternative | – | craft.co, Triggerbites ×4, Flarely, AlternativeTo | Alternatives | Self-serving vendor pages only | **High** |
| 22 | bowelle alternative | – | Crunchbase, Triggerbites ×3, SimplePoo, Mass General review | Alternatives | Same | **High** |
| 23 | cara care alternative | – | AlternativeTo, CB Insights, Craft, Shortlister, SaaSHub, Tracxn, Triggerbites | Alternatives (B2B directories dominate) | Low relevance of directories | **High**, after confirming Cara's US status |
| 24 | how to prepare for gastroenterologist appointment | – | Hospital/clinic pages (Dayton Children's, Acibadem, Unio, Austin Gastro, SIU, Liv), MyCrohnsAndColitisTeam | Checklist | Every page says "track your symptoms" but none provides the log or report | **Med–High**; needs reviewer |
| 25 | can coffee cause bloating | 2,400 / 17 | Happy Pear, Medical News Today (only reviewed source), GoodRx, coffee brands (Nueco, Grateful Earth, Pangea) | Short answer + mechanisms | Mostly coffee sellers; no self-test protocol | **High–Med** (lowest KD of the set) |

## 5. Gap → Get Regular play

| Gap | Evidence | Our page / asset | Feasibility | Priority |
|---|---|---|---|---|
| Diary intent answered by bare PDFs or app pages | IBS food diary: PDFs at #1–4 and Bowelle app page at #5 (Semrush SERP); FoodTrigger AI pages have about 700 words and no sources | `/guides/ibs-food-diary` + printable 7-day diary (stool type, meal time, symptom onset, stress) + worked example week + "what the app adds" section | Med | **P1** |
| Food & symptom diary template | Stanford/NHS PDFs #1–3; mySymptoms #5; KD 14 | `/guides/food-symptom-diary` + `/resources/food-symptom-diary-pdf` (one printable, several entry pages) | Med–High | **P1** |
| Food diary for diarrhea (9,900, unvalidated) | Mixed SERP (IFFGD, NHS, PDFs); mySymptoms #12 with homepage only | `/guides/food-diary-for-diarrhea` with timing, Bristol types 5–7, red flags. Validate volume first. | Med | **P1 (validate)** |
| Feature pages for tracking jobs | Plop #5 with app page; flarecare, poop-tracker.com rank for tracker terms | `/features/poop-tracker`, `/features/food-symptom-tracker`, plus sections or child pages for bloating, constipation and IBS tracking (avoid thin duplicates) | Med–High | **P1** |
| No neutral, tested app comparison | Balloon self-ranked (#6), Healthline 2020, Live Science 2014; Triggerbites in all "alternative" results | `/compare/gut-health-tracking-apps` with published test method, dated screenshots, disclosure that we make Get Regular, criteria table, update log. Then `/compare/mysymptoms-alternative`, `/compare/bowelle-alternative`, `/compare/balloon-vs-get-regular` | Med (High for alternatives) | **P2** (after apps are tested) |
| Absent from all roundups and directories | 0 of 30 verified targets list Get Regular (3 unverifiable) | Product kit + outreach to Healthline, MyGoodGut, Gutivate, Healthify, AlternativeTo, app listicles | High (directories), Med (editorial) | **P1** |
| Bristol chart has no "use it" layer | Leaders are reference pages; Balloon (Aug 2026) and Plop have no printable or log | `/tools/bristol-stool-chart`: interactive type picker, printable chart + 2-week log, "how to record it" section, app demo | Low for head term; High for "pdf" (1,300 / 40) and "app" variants | **P2** |
| Doctor-visit prep without a log | Clinic checklists say "track symptoms"; Bearable's page is generic (2023) | `/guides/prepare-for-gi-appointment`: checklist + sample 2-week report export + printable symptom summary | Med–High | **P2** |
| Food-specific bloating questions | Coffee/bloating: KD 17, coffee sellers rank; Nerva coffee post is from 2020 | `/learn/coffee-and-bloating`, `/learn/bloating-after-eating`, each with a 7-day self-test protocol and log | High–Med | **P2** |
| Frequency normal range | GoodRx/Healthline own it; Balloon #21 | Add a frequency + stool-form checker to the Bristol hub; do not chase the head term yet | Low–Med | **P3** |
| Original data | Nerva reports, ZOE blue-poo study earn links | Annual "Get Regular Gut Log Report" (aggregate, de-identified, consented, with clinical review) | Med | **P3** (needs data governance) |

## 6. "Steal their traffic" playbook: specific pages to beat

Before publishing any page:
- Name the author and a qualified clinical reviewer, using credentials verified by the team.
- Show "Published / Updated" dates and keep a change log.
- Cite primary sources (Rome IV, Heaton & Lewis 1997, NIDDK, ACG/AGA).
- Use real app screenshots or a short screen recording from a test account.
- Make the free resource usable without installing anything.

1. **Bowelle homepage for "irritable bowel syndrome food diary" (#5, 2,400).** Publish an IBS food-diary guide (about 2,000 words) that answers what to log, how long, how to read patterns and when to see a doctor.
   - Include a printable PDF and an image preview, plus a filled-in example week showing how a pattern emerges.
   - Add a "paper vs app" section with a 20-second app demo.
   - Add HowTo/Article schema. Do not add MedicalWebPage claims unless the page is reviewed.
   - Bowelle has no content to answer this with.
2. **mySymptoms /ibs-food-diary/ (#21) and homepage (#12 for food diary for diarrhea).** The same printable family, with a diarrhea-specific timing guide: onset windows, Bristol types 5–7, hydration, red flags. Its guide has no reviewer and no printable.
3. **FoodTrigger AI landing pages.** Match their one-page-per-query map, but at 3–4× the depth, with sources, review and a better-designed PDF (fillable plus printable).
4. **Balloon "Poop Tracker Apps Doctors Recommend" (Semrush SERP #6) and "Best iOS poop trackers for 2025".** Publish a dated 2026 comparison with:
   - A testing method (devices, dates, tasks timed: first log, Bristol entry, meal photo, export).
   - A criteria table: Bristol logging, meal logging, symptom timing, export/report, privacy facts (verified from each policy), price.
   - Disclosure that we make Get Regular, and a named clinical reviewer for the "what doctors look for" criteria.

   Balloon's pages name no doctor, test nothing and list 3 apps.
5. **Healthline 2020 roundup (Semrush SERP #4 for gut health app).** Outrank it with a fresher comparison and also nominate Get Regular for inclusion (section 7).
6. **Plop /en/ for poop tracker app (#5).** The `/features/poop-tracker` page should beat it on clarity rather than length: a demo of the logging flow, a Bristol picker, a sample report, an FAQ, and author/reviewer and date. Plop has none of these.
7. **Triggerbites "best X alternatives" pages.** Build honest alternatives pages with verified feature tables. Where a competitor fits a user better (e.g. a therapy program, Monash for a FODMAP database), say so; that is what makes the page citable.
8. **Clinic "prepare for your GI appointment" pages.** Ours includes the actual log template and an example exported report, which no clinic page provides.
9. **Coffee/bloating sellers.** A reviewed answer page with a 7-day "coffee on/off" logging protocol and a printable.
10. **Bristol hub.** Do not expect page 1 for the 74,000 head term soon. Target "bristol stool chart pdf" (1,300 / 40) and "app" variants. Include an adult stool-colour section to catch "stool color chart" without competing with baby-poop results.

## 7. Backlink angle: what earns competitors their links

Data available: workbook domain totals and a 5-row link-gap sample. Link-level context was not retrieved because Semrush API units ran out, so the reasons below are inferred from public pages and labelled as such.

| Link driver (observed) | Who | Evidence | Replicate? |
|---|---|---|---|
| Editorial app roundups | mySymptoms, Bowelle, Cara Care, Poop Tracker Toilet Log | Healthline 2020 lists all four; mySymptoms' App Store page cites the Healthline feature (per web search); MyGoodGut, Gutivate and Mass General review list Bowelle/mySymptoms/Cara | **Yes**: top priority |
| App directories with clinical ratings | mySymptoms, Cara, Bowelle, Monash | Healthify NZ review pages; MyGoodGut reuses their scores | **Yes** |
| Alternatives directories | mySymptoms, Cara Care | AlternativeTo, Craft, CB Insights, SaaSHub | **Yes** (low effort, low authority, helps AI entity coverage) |
| Press page / launch coverage | Bowelle (/press/), Balloon (changelog) | Bowelle reaches 411 RD with a 5-page site | **Yes**: press kit page |
| Clinician products/resources | mySymptoms /clinic-info/, Nerva clinician pages and directory | Practitioner sites link to tools they recommend | **Yes**: a "for clinicians" page with the sample report |
| Original research / reports | Nerva /reports/ (IBS report 2025), ZOE blue-poo study (PR Newswire, Newsweek, MNT) | National coverage | **Later**: needs data governance |
| Free printables | Bearable worksheets; institutional PDFs dominate diary SERPs | Resource pages and patient-education pages link to printables | **Yes** |
| Interactive tools | Balloon (Oct 2026), Triggerbites 124 checkers, CareClinic calculators | Tools attract links over time; too new to show results | **Yes**: Bristol picker / frequency checker |
| Link-gap sample | Healthline, NIH, Google, Yahoo, HP link to ≥1 competitor and not to us | Context unverified (workbook) | Verify before outreach |

**Named outreach and AI-citation targets.** None list Get Regular. Full list in `roundup-and-citation-targets.csv`.
- **P1**
  - Healthline "Best Gut Health Apps of 2020" (updated 12 Aug 2020; Cara Care, Bowelle, Fast FODMAP, Kitchen Stories, mySymptoms, Poop Tracker Toilet Log, Low FODMAP A–Z). The page gives nominations@healthline.com; verify it is current before use.
  - MyGoodGut "5 IBS Tracking Apps Compared" (25 Sep 2026; Cara Care, Bowelle, mySymptoms, Monash, Nerva).
  - Gutivate "Symptom and Food Tracking Apps for IBS" (27 Oct 2025; Cara, mySymptoms, Bowelle, Dieta).
  - Healthify app directory (submission route UNVERIFIED).
  - AlternativeTo listings (pages UNVERIFIED: 403 to the crawler).
- **P2**
  - Verywell Health IBS apps article (Semrush SERP #15 for IBS food diary; content UNVERIFIED, fetch blocked).
  - Live Science 2014 poop-apps article (refresh pitch).
  - Freeappsforme and AppsHive poop-tracker lists.
  - Healio GI news (Q&A with the gastroenterologist).
  - Healthline food-allergy-journal article.
- **P3 (competitor-owned, low odds)**
  - Lin Health, Welling, GutTrace, Mouth To Gut, Dookie Deluxe, Nerva compare, Flarely.

**Product kit needed before outreach:** current screenshots and a 30-second demo, tested capability list, pricing, privacy facts as they actually apply, named clinical/editorial roles with verified credentials, press contact, and a TestFlight or promo route for reviewers. Make no "first/only/most accurate" claims without evidence.

## 8. Observations on getregular.com (19 Oct 2026, for the technical workstream)

- `/robots.txt` returns the Next.js 404 HTML page, not a robots file. Search engines treat a 404 robots.txt as "allow all", but no sitemap is declared there.
- `/sitemap.xml` lists 5 URLs, including `/blog/what-your-poop-is-trying-to-tell-you`, whose `lastmod` is 2026-10-20 (tomorrow, relative to this check).
- The homepage has no JSON-LD (competitors use MobileApplication/SoftwareApplication + Organization). Its meta description says "built with a board-certified gastroenterologist". That is an E-E-A-T asset if the person is named and verifiable on site; no named person was detected.

## 9. Limits and open items

- No native Semrush Keyword Gap, Top Pages or backlink-context exports (API balance zero on 6 Oct). Competitor "top pages" are inferred from 26–50-row samples.
- Web-search SERPs are one snapshot from a search tool, not a Google US page. Re-check priority queries in Semrush Position Tracking or a live incognito US check before final briefs.
- UNVERIFIED: Verywell article content, AlternativeTo pages, Healthify submission route, Cara Care US availability, competitor feature and privacy claims, and every app ranking or rating cited from search summaries.
- No outreach was sent.
