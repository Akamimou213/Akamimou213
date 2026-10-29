# Get Regular: Apple Ads keyword and intent playbook (US)

Research date: 2026-10-29. Data sources:
- **App Store autocomplete:** what Apple suggests as people type (US storefront, 114 keywords measured letter by letter).
- **Organic rank:** a proxy from the iTunes Search API.
- **Competitor brand demand:** ratings, charts, autocomplete and Google Trends for 22 brands.
- **Apple Ads documentation:** the help pages and the new Apple Ads Platform API v1 docs.

I did **not** have access to your Apple Ads account. Wherever this says "your data", the conclusion depends on the export described in §8.

Files in this folder:
- `keyword-universe.csv`: 114 keywords with intent, fit, demand tier, who ranks, and recommended placement/match/action
- `competitor-brand-demand.csv`: 22 competitor brands with demand proxies and a bid/skip tier
- `../scripts/apple_ads_research.py`: pulls Apple's own popularity scores, search terms and impression share via the API
- `../scripts/evaluate_keywords.py`: tells you, per keyword, whether "didn't convert" is real or just too little data

---

## 1. Answer first

**1. Keep "poop tracker", make it the hero, but don't stop at it.**
- It is the strongest stool-tracking query in the US App Store. It's the only one Apple suggests after just 3 letters ("poo" → #5, next to "poop map"), and it matches Get Regular's job exactly.
- One keyword caps your scale at that keyword's market, though. Expand along the **same intent first**: stool tracker, bowel movement tracker, poop log, poop diary/journal, constipation tracker, the AI-scan terms. Only after that move to the second intent (IBS and food triggers).

**2. "The other keywords didn't convert" is probably three different problems.** Your export will tell you which one applies to each keyword:
- **(a) Not enough data.** Most stool-tracking variants are low volume (Apple only suggests them after 4–8 letters). Under about 30–50 taps, zero installs proves nothing.
- **(b) Wrong intent.** Several obvious keywords are traps:
  - "bloat" / "debloat" are face de-puffing apps.
  - "ibs" is typo traffic for ibis Paint X.
  - "ibd" is Investor's Business Daily.
  - "food tracker" means calorie counting.
  - "poop counter / poop tracker with friends" and "poop map" are social novelty.
  - "poop identifier" means animal scat.
- **(c) A losing listing.** On IBS and gut terms you sit next to Cara Care (4,669 ratings), Bowelle (2,248), Nerva (15,127) and mySymptoms (4,051) with 13 ratings and a generic product page.

**3. There is no "Apple agents" system behind App Store search or ads.**
- At WWDC26, "agentic" refers only to Xcode coding tools.
- Matching works like this: your keywords and match type, plus Search Match, all gated by **relevance**. Apple judges relevance from your title, description and keywords; an app it judges irrelevant "won't be displayed — regardless of how much you may be willing to pay."
- On the organic side, App Store Tags are LLM-generated from your metadata (US only).
- So you match intent with exact-match keywords, one custom product page per intent, negatives, and metadata that uses the searchers' words. §3 maps the words.

**4. You can now get Apple's own search popularity for any phrase, competitor names included, without bidding.**
- Apple's new Ads Platform API v1 (Aug 2026) has a phrase lookup that returns popularity 0–100. A genre report ranks Health & Fitness search terms.
- `apple_ads_research.py` pulls both, plus your search terms and impression share.
- The free proxies in §5 rank the brands until then.

---

## 2. How Apple matches a search to your ad (verified mechanics)

| Mechanism | What it means for you | Source |
|---|---|---|
| **Relevance gate** | Apple judges relevance from your **title, descriptions and keywords**; irrelevant apps don't enter the auction. Metadata changes reach ads within about 2 hours. | [Search results ads](https://ads.apple.com/app-store/help/ad-placements/0082-search-results), [troubleshooting](https://ads.apple.com/app-store/help/reporting/0007-tips-for-solving-performance-issues) |
| **Auction** | Relevance plus bid, "based on second-price auction principles" (you often pay less than your max CPT). | [Glossary](https://ads.apple.com/app-store/help-glossary) |
| **Exact match** | The term plus close variants (misspellings, plurals, reordering). Best for control. | [Match types](https://ads.apple.com/app-store/help/keywords/0059-understand-keyword-match-types) |
| **Broad match** | Variants plus related terms, including category terms and similar app names. | same |
| **Search Match** | Apple picks queries from your product-page metadata, similar apps in your genre and other search data. It's your discovery net. | [Keywords best practices](https://ads.apple.com/app-store/best-practices/keywords) |
| **Slots** | Since March 2026, ads can show at the top **or further down** the results. You can't choose or bid for a position, and there's no per-slot performance reporting (only impression share for first slot vs all slots). | [Search results ads](https://ads.apple.com/app-store/help/ad-placements/0082-search-results) |
| **Search terms visibility** | You see the real queries only above about **10 impressions/day**; the rest are bucketed as "Low Volume". You can't see every query people type, only those your ads showed on. | [Charts dashboard](https://ads.apple.com/app-store/help/reporting/0025-use-the-charts-dashboard) |
| **Maximize Conversions** | Automated bidding to a target CPA, with Search Match required. Apple recommends a budget allowing **5+ conversions/day** and **2+ weeks**. It optimizes **installs, not trials**. | [Maximize Conversions](https://ads.apple.com/app-store/best-practices/maximize-conversions) |
| **Competitor keywords** | Apple's own best practice recommends a Competitor campaign. Policy restricts IP in *ad content*; your ad only shows your own listing, so the bid itself is not the issue. | [Keywords best practices](https://ads.apple.com/app-store/best-practices/keywords), [Ads policies](https://ads.apple.com/policies) |

**Why "poop tracker" works even though "poop" is not in your title or subtitle:** Apple matched it to "Stool … Tracking". Adding "Poop" to the title (`Get Regular: Poop & Gut Health`, see `../app-store/ASO-and-Apple-Ads.md`) should raise relevance and organic rank for the whole poop vocabulary, which is where your demand is. That last effect is a working assumption, not something Apple documents.

---

## 3. What people type: the intent map

**How to read the demand tier.** Apple's autocomplete only suggests a query once enough people type it, and lists suggestions roughly by popularity. The fewer letters it takes before Apple suggests a keyword, the more searched it is.
- **A** = suggested after ≤3 letters
- **B** = after 4 letters
- **C** = after 5–6
- **D** = after 7+
- **E** = never suggested (below Apple's threshold, i.e. very low volume)

This is a relative proxy, not search volume. Replace it with Apple's 0–100 score from the script. Full detail is in `keyword-universe.csv`.

### Intent 1: "I want to track my poop" (the hero intent)

| Demand | Keywords | Who ranks today |
|---|---|---|
| **A** | **poop tracker** | Happy Poop (2,749 ratings), Poop Map (64k, novelty), Balloon (1,137) |
| B | stool tracker (#1 at "stoo"), bowel movement tracker, poop log, bowel tracker, poop tracker free | Happy Poop, plop, Bowelle, Balloon |
| C | poop diary, poop journal, poop calendar, stool diary, poo diary, bristol stool chart, constipation diary | Happy Poop, PCal, Bowelle, Cara Care |
| D–E | track bowel movement, bowel diary, bowel habit diary, constipation tracker, poo tracker, bristol stool scale | small apps |

**Verdict:** same job as "poop tracker", so expect similar conversion. Run them all exact in one ad group next to the hero, each with its own bid. Low volume each, but together they extend reach.

### Intent 2: "Tell me what my poop means" (AI stool scan, your differentiator)

| Demand | Keywords | Who ranks today |
|---|---|---|
| C | poop scanner (#1 at "poop s"), poop analyzer, poop check, poop scan | Flush (356), "Poop Analyzer" (2,463: proof of demand), PoopCheck (38) |
| D–E | stool checker, stool analysis, stool analyzer, stool scan, ai poop tracker | PoopID, KB Poop Tracker, Get Regular already ranks #27–43 organically |

**Verdict:** Get Regular is the most relevant app for this intent and competitors are weak. Use a dedicated "AI poop scanner" custom product page. Add negatives for "dog" and "animal" because "poop scan" mixes in pet apps.

### Intent 3: "Help with IBS, bloating, food triggers" (second priority)

| Demand | Keywords | Who ranks today |
|---|---|---|
| **A** | **ibs tracker** (#2 at "ibs"), ibs food tracker | Cara Care (4,669), Bowelle (2,248), plop, mySymptoms |
| C | ibs app, ibs log, bloating (#1 at "bloati"), fodmap tracker | Cara Care, Nerva (15,127), GutBFF |
| D–E | food symptom tracker, food sensitivity tracker, ibs diary, ibs symptom tracker, bloat tracker | mySymptoms, Cara Care, tiny apps |

**Verdict:** real volume ("ibs tracker" is as easy to trigger as "poop tracker"), but against established apps with thousands of ratings. Test with an "IBS & bloating triggers" custom product page and a **separate, capped budget**. Judge on cost per trial, not installs.

### Intent 4: "Improve my gut health" (broad)

| Demand | Keywords | Who ranks today |
|---|---|---|
| B | digestive tracker | Cara Care, mySymptoms |
| C | gut health (#2 at "gut h"), gut health tracker (#1), gut tracker | gut app, Nerva, Balloon, Cara Care. Get Regular is already #24–27 organic |
| A | fiber tracker (#5 at "fib"; "fibermaxxing" trend) | FiberUp, Fibey. Only bid if fiber is visible in the app's screenshots |

### Off-intent traps: add as exact negatives in every campaign (especially Discovery)

The full list is `negative-keywords.csv`: 366 negatives built from about 1,400 off-topic App Store autocomplete searches around our keywords. Each one is scoped to the campaigns it belongs in. Add them with `../scripts/apply_negatives.py`, or paste the files in `negatives-paste/` into the Apple Ads UI.

Use broad negatives only for words with no link to gut health. Apple's broad negatives also block "misspellings, synonyms, and related terms", so anything close to a target keyword is exact.

The core traps:

poop map · poop counter · poop counter with friends · poop tracker with friends · poop tracker widget · poop identifier · bloat · debloat · face bloat · ibs (alone) · ibis · ibis paint · ibd · food tracker · food scanner · calorie counter · period tracker · ozempic tracker · glp-1 tracker · probiotic · celiac · dog poop · animal poop · toilet finder · bathroom near me

---

## 4. Account structure

### Campaigns and ad groups (US, search results)

Allocations are a starting split of your daily budget; move money weekly toward what produces trials.

| Campaign | Ad group | Match | Keywords | Custom product page | Start bid (CPT) | Budget |
|---|---|---|---|---|---|---|
| **Brand** | Brand | Exact | get regular, getregular, get regular app, get regular gut health | default | $0.50–1.00 | 5% |
| **Poop tracking** | **Hero** | Exact | **poop tracker** (alone) | "Poop tracker" | current bid; scale per §6 | **35%** |
| | Variants | Exact | stool tracker, bowel movement tracker, poop log, bowel tracker, poop tracker free, poop diary, poop journal, poop calendar, stool diary, poo diary, bristol stool chart, constipation tracker, constipation diary, track bowel movement, bowel diary, bowel movement tracker free | "Poop tracker" | 70–100% of the hero bid | 20% |
| | AI stool scan | Exact | poop scanner, poop analyzer, poop scan, poop check, stool checker, stool analysis, stool analyzer, stool scan, ai poop tracker | "AI poop scanner" | 70–100% of the hero bid | 10% |
| **IBS & triggers** | IBS | Exact | ibs tracker, ibs food tracker, ibs app, ibs log, ibs diary, food diary ibs, fodmap tracker | "IBS & bloating" | $1.50–3.00 | 10% |
| | Bloating & food | Exact | bloating, bloat tracker, bloating tracker, food symptom tracker, food sensitivity tracker, food intolerance tracker | "IBS & bloating" | $1.25–2.50 | |
| **Gut health** | Gut | Exact | gut health tracker, gut tracker, gut health, gut health app, digestive tracker, digestion tracker | "Gut health score" | $1.25–2.50 | 5% |
| **Competitor** | Tier 1 / Tier 2 | Exact | see §5 | context-specific | $0.75–2.00 | 5% |
| **Discovery** | Broad | Broad, Search Match off | poop tracker, stool tracker, bowel movement tracker, poop scanner, ibs tracker, gut health tracker | — | 50–70% of the exact bids | 10% |
| | Search Match | Search Match only | (no keywords) | — | $0.75–1.25 | |

**Rules:**
- Every exact keyword is also an **exact negative in Discovery**, so Discovery only finds *new* queries.
- Each week, move converting Discovery search terms into the right exact ad group, and add junk terms as negatives.
- You can have only **one active custom ad per ad group**, which is why each intent gets its own ad group.

If you don't have custom product pages yet, build the "Poop tracker" one first.

---

## 5. Competitor brand demand

These are proxies, not Apple search volume: US ratings, top-chart presence, how early Apple autocompletes the name, Google Trends, and public user claims. The true number is Apple's popularity score via the script. Full table: `competitor-brand-demand.csv`.

- No gut or poop app is in the US Health & Fitness top 100 (free or grossing).
- Monash FODMAP is #1 in Medical top paid.

| Tier | Brand terms (exact) | Why | Expect |
|---|---|---|---|
| **Bid: high demand** | poop map | 64k ratings; autocompletes at "poo"; Apple even suggests "apps for tracking bowel movements like poop map" | Cheap reach into poop intent. Many searchers want the social map, so judge on trials |
| **Bid: IBS audience** | nerva, nerva app · monash fodmap, monash | Nerva: 15k ratings, autocompletes at "ner". Monash: #1 Medical paid, autocompletes at "mona" | Different jobs (hypnotherapy, FODMAP lookup). Low CR likely; IBS custom product page |
| **Bid: medium-low, very relevant** | cara care · mysymptoms · happy poop · bowelle | 2–5k ratings each, autocomplete at 4–7 letters. Cara Care's US app hasn't been updated since 2020, so its users are switch candidates | Low volume, likely cheap |
| **Bid: direct rivals, tiny volume** | poopcheck · flarecare · balloon poop tracker · plop poop tracker | Closest audience; volume likely near the floor | Few impressions; keep bids low |
| **Qualified terms only** | zoe health, zoe app · fig app, fig food scanner | Real brands, but "zoe" and "fig" alone are generic words | — |
| **Skip** | flush, tract, aloe, dieta, ton ai, plop, balloon (bare), gutly, poopid, bellyweather, gerdbuddy, unbloated | Generic-word pollution, or no US demand | — |

**Benchmarks to judge against** (AppTweak, US, 2025, search results, medians; [source](https://www.apptweak.com/en/aso-blog/apple-ads-benchmarks)):

| Campaign type | TTR | Install rate per tap |
|---|---|---|
| Brand | 25.3% | 73.5% |
| Generic | 8.5% | 59.8% |
| Competitor | 3.8% | 50.1% |
| Discovery | 4.2% | 44.5% |
| Health & Fitness, all types | 7.5% | 50.3% |

Health & Fitness CPT is $1.68. With 13 ratings, expect to sit below these medians until reviews grow.

---

## 6. Scaling the hero keyword ("poop tracker")

1. **Measure headroom.** Pull impression share for "poop tracker", using `impression_share.csv` from the script or Apple Ads → Insights → Impression Share.
   - Apple's own sizing rule: total market impressions ≈ your impressions ÷ your impression share.
   - Example: 2,000 impressions at 25% share ≈ 8,000 impressions available.
2. **Raise the bid while it pays.** If impression share is under 91–100% and cost per trial is below target, raise the CPT bid **+15–20% every 3–4 days**. Stop when impression share reaches the top bucket or cost per trial crosses target. Past the top bucket you're buying the same users at a higher price.
3. **Protect it.**
   - Keep it alone in its ad group, with the "Poop tracker" custom product page.
   - Keep it as an exact negative in Discovery so you don't bid against yourself.
   - Check the search terms report weekly. Exact match still catches "poop trackers", "poo tracker", "poop tracking".
4. **Know the ceiling.** When the hero is at full impression share, extra spend has to come from the Variants and AI-scan ad groups, then IBS. That's why the structure builds them now.
5. **Risk check.** If one or two competitors start bidding aggressively on "poop tracker", your CPT rises. Watch CPT week over week, and keep at least 40% of spend outside the hero.

**Targets.** Set the CPA target from real trial-to-paid data, not installs. A placeholder until you have it:
- First-year value per install ≈ $99.99 × 0.85 × install-to-paid rate.
- At 5% install-to-paid, that's **about $4.25 per install**.
- So hold blended cost per install at or under $3–4, then rebuild the target per trial once RevenueCat or MMP data is joined per keyword. Both the 5% rate and the $3–4 ceiling are assumptions.

---

## 7. Four-week plan

| Week | Do |
|---|---|
| 0 (now) | Export the last 90 days (keywords + search terms) and run `evaluate_keywords.py export.csv --reference "poop tracker"`. Run `apple_ads_research.py` for Apple's popularity scores. Re-tier `keyword-universe.csv` with real numbers. |
| 1 | Rebuild the structure in §4. Add the negatives list. Ship or confirm the "Poop tracker" custom product page. Keep "poop tracker" bid and budget unchanged for the first 3 days (clean baseline). |
| 2 | Start hero scaling (§6). Promote Discovery terms with ≥1 install and TTR at or above the median. Pause off-intent terms. |
| 3–4 | Judge Variants, AI-scan and IBS ad groups once each keyword has **≥30–50 taps**, or pool same-intent low-volume keywords and judge the group. Shift budget toward the lowest cost per trial. |

Apple's v5 API stops working on **2027-01-26**. The script already uses v1.

---

## 8. What I need from you to finish this

1. **Apple Ads export, last 90 days:** the keyword report and the search terms report (CSV), with impressions, taps, installs and spend. This answers why the other keywords failed.
2. **Trials and paid subscribers per keyword**, from RevenueCat, your MMP, or Apple Ads attribution via AdServices. Installs alone can hide that "poop tracker free" brings non-payers.
3. **API credentials run:** run the script yourself, or share its output CSVs. Never share the private key.
4. **Daily budget and target CPA** (or trial-to-paid rate), so the bids and split in §4 become real numbers.
5. **Custom product pages:** whether they exist yet ("Poop tracker", "AI poop scanner", "IBS & bloating").

## Sources

- **Apple Ads help and best practices**, linked inline. Read 2026-10-29.
- **Apple Ads Platform API v1:**
  - [overview](https://developer.apple.com/documentation/apple-ads-platform-api)
  - [phrase suggestions (SEARCH route)](https://developer.apple.com/documentation/apple-ads-platform-api/query-phrase-suggestions)
  - [insights: impression share and search-term popularity](https://developer.apple.com/documentation/apple-ads-platform-api/insights-endpoints)
  - [search terms report](https://developer.apple.com/documentation/apple-ads-platform-api/get-app-search-term-reports)
  - [OAuth](https://developer.apple.com/documentation/apple-ads-platform-api/implementing-oauth-for-the-apple-ads-platform-api)
- **App Store autocomplete:** Apple's MZSearchHints service, US storefront, queried 2026-10-29.
- **Organic rank proxy:** iTunes Search API, US, 2026-10-29.
- **Benchmarks:** [AppTweak Apple Ads benchmarks (Aug 2026)](https://www.apptweak.com/en/aso-blog/apple-ads-benchmarks), [Adapty (Jul 2026)](https://adapty.io/blog/apple-ads-benchmarks-2026/).
- **Competitor demand sources:** listed in `competitor-brand-demand.csv` notes. Includes TechCrunch, Forbes, Monash Lens, mwm.ai estimates and Google Trends.
