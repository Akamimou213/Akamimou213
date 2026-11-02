# Get Regular: acquisition status and ship list

Updated 2 Nov 2026. Scope: acquisition only (Meta, ASO, Apple Ads, SEO, GEO, organic social). Product and retention are out of scope.

This plan builds on what already exists in this repo. Most of the strategy is already written and many assets are built. **Almost none of it is live yet.** So the job now is shipping it, not more strategy. Each item below links to the file that already contains the work.

## 0. Work already in the repo

| Branch | Folder | What's there | Date |
|---|---|---|---|
| `claude/zealous-brahmagupta-422bbt`, `claude/laughing-keller-ycs20n` | `getregular-seo/` | SEO/AEO/GEO package for Codex to implement in `avandame/getregular-landing`. Contents: strategy, technical tasks T1–T21, 80 blog drafts, on-page copy, keyword universe (1,599 rows), `/science` and an 82-study evidence library, 2 free tools (stool chart, bloat quiz), a 47-prompt GEO panel plus tracker scripts, outreach kit (33 targets, pitches, directory copy, tracker), brand voice, product walkthrough, post-deploy `seo_check.py` | 19–21 Oct |
| `claude/sleepy-faraday-jhljne` | `getregular/` | Organic growth plan (`STRATEGY.md`), competitor sitemap dataset (2,885 URLs), 6-month content roadmap, ASO + Apple Ads plan, site drop-in (`llms.txt`, robots, schema spec), Apple Ads keyword/intent playbook (114 keywords), competitor brand demand, 366 scoped negatives with a bulk-apply script | 23–29 Oct |
| `claude/youthful-euler-k260q2` | `getregular-audit/2026-10-26/` | Post-launch audit of the new 112-URL site (N01–N15), next-steps playbook, E-E-A-T drop-ins (`people.ts`, `article-meta.ts`, `Byline.tsx`), PostHog `before_send` fix | 26 Oct |
| `claude/epic-euler-51pz47` | `films/get-regular-ad/` | "How your gut keeps time" educational 9:16 series: Wrong Suspect, No Magic Number, Same Lunch, Her Calendar, Level Up, Shrinking Plate | 26 Oct |
| `claude/bold-davinci-kmdbwi` | `films/get-regular-film/` | 30 s Maya-at-the-doctor brand film | 29 Oct |
| Google Drive | — | "Apple ads" (first campaign plan), "Meta + TikTok App Event Fix", "TikTok SDK Setup", "The Rating Engine" | Jun–Jul |

## 1. What's live today (checked 2 Nov)

| Recommendation | Where it was written | Live? |
|---|---|---|
| Site relaunch: 112 URLs, canonicals, schema, robots, performance | `getregular-seo/codex/01-technical-seo-tasks.md` | ✅ Live (most of the 19 Oct audit is fixed) |
| App Store campaign tokens on all 337 CTAs (`NEXT_PUBLIC_APP_STORE_PROVIDER_TOKEN`) | Audit N01 (**P0**) | ❌ Links are still bare |
| `/llms.txt` | `getregular/site-drop-in/llms.txt` | ❌ 404 |
| Named editor and medical reviewer, `dateModified`, `reviewedBy` | Audit N04 + `next-steps/eeat/` | ❌ Author is still the Organization |
| Replace retracted PMID 28690131 | Audit N05 | ❌ Still cited 3× on `dairy-bloating` and on `coffee-and-bloating` |
| Rewrite product pages and FAQ in the first person | Audit N03 | ❌ "check your installed version" phrasing is still on `/faq` and `/app/doctor-report` |
| Apex 307 → 308 | Audit N08 | ❌ Still 307 |
| Real sitemap `lastmod` | Audit N11 | ❌ 85 URLs share 2026-10-20; 28 have none |
| PostHog keeps UTMs; allowlist built automatically | Audit N02 + `posthog-before-send.ts` | ❓ Can't confirm from outside |
| ASO title/subtitle option A (`Get Regular: Poop & Gut Health` / `AI Stool Scan, IBS & Food Log`) | `getregular/app-store/ASO-and-Apple-Ads.md` §2 | ❌ Still `Get Regular: AI Gut Health` / `Food, Stool & Symptom Tracking` |
| AI-readable App Store description | same, §3 | ❌ Old description |
| 4 keyword-assigned Custom Product Pages | same, §4 | ❓ Check App Store Connect |
| Review prompts (`requestReview`) | Rating Engine + ASO §5 | ❌ Still **13 ratings** (needs an app build; still on v2.0.1 from 18 Aug) |
| Privacy label fix ("Data Used to Track You") | ASO §1 | ❓ Check App Store Connect |
| Apple Ads with negatives applied | `getregular/apple-ads/` | ❓ The 29 Oct work implies campaigns are live; check the negatives were applied |
| `/about/ai-info`, `/compare/*`, `/stool/*` atlas, `/press`, `/about/team/*` | `STRATEGY.md` §5 and §7, roadmap M1–M2 | ❌ All 404 |
| Outreach wave 1 (directories) | `getregular-seo/outreach/tracker.csv` | ❓ The tracker in the repo shows every row `not_started` |
| GEO prompt panel baseline | `getregular-seo/geo/tracker/` | ❓ No results committed |
| Search Console + Bing verified, sitemap submitted | Next-steps §1–2 | ⚠️ Partly. You report Search Console's last crawl on 23 Oct, and Google traffic started arriving (below) |

## 2. New data: PostHog, last 7 days vs. since v2

Definitions:
- **New user**: a person's first `onboarding_step_viewed`. PostHog has no install event.
- **Trial**: `rc_trial_started_event`.
- **Paid**: `rc_trial_converted_event`.

| Step | Since v2 (17 Aug – 1 Nov) | Last 7 days (26 Oct – 1 Nov) |
|---|---|---|
| New users | 4,067 | 174 |
| Onboarding completed | 3,011 (74%) | 141 (81%) |
| Paywall viewed | 2,536 (62%) | 107 (61%) |
| Trial started | **269 (6.6%)** | **20 (11.5%)** |
| Paid | 76 (29% of trials that have ended) | 1 (too early) |

**Weekly:** new users went 450–550 (late Aug–Sep) → 174. Trials stayed at about 20 a week.

**By self-reported source** (`referral_source`, since v2):

| Source | New users | Trials | New user → trial | Paid | New user → paid |
|---|---|---|---|---|---|
| (didn't answer) | 2,623 | 58 | 2.2% | 10 | 0.4% |
| TikTok | 661 | 35 | 5.3% | 12 | 1.8% |
| Instagram | 487 | 94 | 19.3% | 29 | 6.0% |
| Facebook | 145 | 49 | 33.8% | 15 | 10.3% |
| App Store search | 76 | 21 | 27.6% | 6 | 7.9% |

**Website:** Google visitors reached **47 last week vs 4–10 a week before**. They land on `/learn/bowel-health/*`: mucus in stool, diarrhea after eating, cheese, bananas, urgent morning BMs, Bristol type 1–2. The 112-page relaunch is starting to index. AI-assistant referrals: still 0.

### What this changes in the existing plans

1. **The volume drop is TikTok, not Meta.** TikTok users went 112/week (21 Sep) → 13. Meta held at 55–90/week, then 32 last week. Meta produces 53% of trials and 58% of payers.
2. **Correct the Apple Ads CPI ceiling.** `STRATEGY.md` §8 set blended CPI ≤ $3–4, assuming 5% install-to-paid and $99.99 × 0.85 per payer. Real data:
   - About **$24 net per payer**: $2,321 from trial conversions minus about $466 in refunds, over 76 payers. That's first charge only, mixing monthly and founding-yearly plans.
   - App Store-sourced users convert to paid at 7.9%.
   - So **each App Store install is worth about $1.90 on the first charge**, maybe $2.50–3 with renewals.
   
   **New ceiling: CPI about $2–2.50 and cost per trial about $7–10** until renewal data exists. This is the "trial-to-paid comes in low" trigger from STRATEGY §12.
3. **Meta has the same constraint.** It makes about $1.70 per new user ($24 × 7.0%), so it needs a **cost per trial under about $7–10**. Pull spend to check.
4. **US only for paid.** New user → trial is 9.4% in the US vs 2.7% UK, 3.5% AU, 0.9% DE, and 0% NL/ES/FR/NO.
5. **64% of new users have no source.** Measurement (N01, N02, and the onboarding question reaching everyone) stays the #1 blocker, as the 26 Oct audit said.

## 3. Ship list, in order

### This week: P0, mostly config (about 1 dev day plus ops)

- [ ] **N01 campaign tokens.** Set `NEXT_PUBLIC_APP_STORE_PROVIDER_TOKEN` in Vercel Production, redeploy, and add `affiliate-data` to the Smart App Banner. Steps: audit §3 N01.
- [ ] **Ship `getregular/site-drop-in/llms.txt`** to `/llms.txt`.
- [ ] **N05:** replace the retracted citation on `dairy-bloating` and `coffee-and-bloating`; fix the 4 dead links.
- [ ] **N08:** apex 307 → 308 (Vercel → Domains).
- [ ] **Indexing push:** follow next-steps §2. Request indexing for about 10 URLs a day, starting with the pages already getting Google clicks (above). Do the Bing import and IndexNow too.
- [ ] **App Store metadata, option A** (`ASO-and-Apple-Ads.md` §2) plus the AI-readable description (§3). Metadata goes out with the next binary, so ship it with the review-prompt build (below). Promo text can change today.
- [ ] **Apple Ads: lower CPI and cost-per-trial targets** to the corrected ceiling (§2.2). Confirm the 366 negatives are applied (`apply_negatives.py`). Turn on AdServices attribution in RevenueCat.
- [ ] **Meta spend pull:** cost per trial by campaign, last 7 days and since 17 Aug. Cut non-US spend.
- [ ] **Outreach wave 1:** directories (AlternativeTo, Crunchbase, LinkedIn). No gates; copy is in `outreach/directories.md`.

### Next app build (the one release that matters for acquisition)

- [ ] **Review prompts**, per the Rating Engine plus ASO §5: `requestReview` after the first weekly digest, after a score improves, and after a Doctor Report. The target is 13 → 150 ratings. This one build moves ASO conversion, Apple Ads relevance and AI-answer evidence all at once.
- [ ] **Option A metadata** and new screenshots 1–3 in the same submission.
- [ ] **Fix the privacy label** in the same submission.
- [ ] **Make the source question reach every user.** 64% of new users have no answer.
- [ ] Confirm the Meta/TikTok event fix from Drive is in the build: `StartTrial` and `Subscribe` with the RevenueCat transaction ID.

### Next 30 days

- [ ] **4 keyword-assigned CPPs** (ASO §4). Reuse them as Apple Ads variations and as Meta ad destinations, one per angle.
- [ ] **E-E-A-T layer** (next-steps §6): named editor; Dr. Schopis or a contracted reviewer; review the 16 riskiest articles first; drop in `people.ts`, `article-meta.ts` and `Byline.tsx`.
- [ ] **N03:** rewrite the 5 `/app/*` pages, `/faq` and `/about` in the first person, with price and trial terms.
- [ ] **N02 PostHog fix** (`posthog-before-send.ts`), after legal sign-off on the kept UTMs.
- [ ] **Roadmap M1–M2 pages:** `/about/ai-info`, the Bristol hub plus 7 type pages, 5 `/compare/` pages, and an honest "best poop tracker apps" page (`content-roadmap-6-months.csv`).
- [ ] **GEO baseline:** run `getregular-seo/geo/tracker/run_panel.py` on the 47 prompts once, commit the results, and repeat monthly.
- [ ] **Outreach wave 2** (editorial) once the gates in `outreach/README.md` are met: claims fixed, privacy label fixed, offer codes, assets, advisor sign-off.

### Meta (main channel): what's new vs the existing docs

The existing docs cover organic and Apple Ads; Meta had no written plan. Add:

- [ ] **Optimize for trial start**, US only, and judge on cost per trial against the ~$7–10 ceiling. Scale about 20% every 3 days while it holds.
- [ ] **Use the films as Meta creative.** Test the 6 explainer films and the 30 s Maya film as Reels/Stories ads, one angle per ad set:
  - delay / Wrong Suspect
  - normal / No Magic Number
  - doctor visit / Maya
- [ ] Facebook-sourced users start trials at 33.8% vs 19.3% for Instagram, so test Facebook placements separately.
- [ ] Find out why Meta new users halved last week (63 → 32) while trials held: budget, learning reset or fatigue.

### TikTok organic: change its job

- [ ] It's a reach and creative-testing channel, not a trial source: 5.3% new user → trial vs 22.6% for Meta. Post the same explainer films there. Move hooks that win on TikTok into Meta.
- [ ] Find out why it fell 90% since 21 Sep: posting cadence, format, or a single viral post.
- [ ] Put a campaign-tokened App Store link in the bio (needs N01's provider token).
- [ ] Follow STRATEGY §6: the YouTube channel with Dr. Schopis shorts is the stronger AI-visibility play than TikTok. Cross-post the shorts to TikTok and Reels.

## 4. What I need from you

1. **Meta Ads Manager spend** for the last 7 days and since 17 Aug, by campaign. This settles the cost-per-trial question.
2. **Apple Ads:** current spend, CPI and search terms. Were the negatives applied?
3. **App Store Connect:** product page conversion and installs by source. Do CPPs exist? What does the privacy label say now?
4. **Search Console:** indexed count and top queries, or connect it to OpenSEO.
5. **Who owns shipping on `avandame/getregular-landing`** (Codex?), and can this session get access? Then N01, llms.txt, N05 and N08 can go out as one PR.
6. Has any outreach or GEO baseline been done outside the repo? The tracker shows nothing sent.

## 5. Targets for the next 30 days

| Metric | Now | 30-day target |
|---|---|---|
| Trials per week | ~20 | 35 |
| Meta cost per trial | unknown | < $10, verify first |
| Apple Ads CPI | unknown | ≤ $2–2.50 |
| New users with a known source | 36% | > 80% |
| App Store ratings | 13 | 50+ (needs the build) |
| Google visitors per week | 47 | 150 |
| AI panel mentions (P1 prompts) | 0 (19 Oct proxy) | first real baseline run |
