# C5 Constipation & regularity: cluster summary

**Cluster id:** `constipation` · **Pillar:** `/resources/constipation-diary` · **Product page:** `/poop-tracker` · **Written:** 2026-10-19 · **Status:** all 10 are `draft-needs-medical-review`. None may be indexed until a named clinician approves them. `havent-pooped-in-days` is YMYL **High** (strategy §8).

Word counts exclude frontmatter and writer notes. Every article links to `/blog/when-to-see-doctor-bowel-changes`, the pillar and the product page, has a red-flag section, at least one illustrative log or decision table, a FAQ, numbered sources and the disclaimer.

## Articles

| Order (plan) | Slug | Title | Primary keyword | Words | Pillar | feature_dependencies | Top reviewer questions |
|---|---|---|---|---|---|---|---|
| 1 | cheese-and-constipation | Does Cheese Cause Constipation? What the Evidence Says | does cheese cause constipation | 2,141 | /resources/constipation-diary | [] | Is the framing of Iacono 1998 (children; debated) cautious enough? Is it OK to name calcium antacids and iron as confounders? The SERP's "2021 study" could not be traced, so it was left out. |
| 2 | regular-poop-schedule | How to Get on a Regular Poop Schedule: Habits That Help | how to get on a regular poop schedule | 2,318 | /resources/constipation-diary | [] | The "about 5 minutes" toilet-session cue has no source. AAFP gives 25/38 g fiber and +5 g/week, while NIDDK gives 22–34 g. Is the smartphone and hemorrhoid study (observational) framed cautiously enough? |
| 3 | can-constipation-cause-nausea | Can Constipation Cause Nausea (or Headaches)? | can constipation cause nausea | 1,957 | /resources/constipation-diary | [] | Confirm the citation details for the CGH gastroparesis/constipation paper [2] and the headache study [6]. Verify the STEP 1–3 semaglutide percentages (PMC page was captcha-blocked). Check the triage table. |
| 4 | can-constipation-cause-back-pain | Can Constipation Cause Back Pain? How to Tell From Your Log | can constipation cause back pain | 1,764 | /resources/constipation-diary | [] | Is the cauda equina list adequate? The "lower left belly" and kidney lines have no citation. Replace the UK (CRUK) impaction source with a US one? |
| 5 | fiber-constipation | Can Fiber Make Constipation Worse? Which Kind Helps | can fiber cause constipation | 2,232 | /resources/constipation-diary | [] | Ho 2012 is non-randomized (caveat stated). Is the soluble/insoluble framing accurate? Is naming PEG acceptable? The nutrition "fiber" breakdown claim comes from fact sheet §6.2. |
| 6 | bananas-and-constipation | Do Bananas Cause Constipation? Ripe vs Green Explained | do bananas cause constipation | 1,735 | /resources/constipation-diary | [] | The "tannins" claim was left out (no primary source). Confirm the journal for the banana-starch review [2]. The allergy line has no citation. |
| 7 | havent-pooped-in-days | Haven't Pooped in 3, 4 or 5 Days? When to Get Help | haven't pooped for three days | 2,013 | /resources/constipation-diary | [] | **YMYL High.** The day-count thresholds (call at about 6–7 days even if passing gas) are an editorial synthesis. Confirm the "passing gas is a better sign" wording, and the laxative naming (PEG, bisacodyl). |
| 8 | can-stress-cause-constipation | Can Stress Cause Constipation? The Gut-Brain Link | can stress cause constipation | 1,829 | /resources/constipation-diary | [] | Confirm the 2026 Transl Psychiatry meta-analysis [2] and the 2023 IJCD meta-analysis [3] (abstracts not opened in full). Is the 988 crisis line appropriate? CRF/cortisol mechanisms were left out on purpose. |
| 9 | bristol-stool-type-1-2 | Bristol Type 1 and 2 Poop: What Hard Lumps Mean | bristol stool chart type 1 | 1,965 | /resources/bristol-stool-chart (→ constipation-diary) | [] | **Rome V (released 2026)** may have changed the constipation/IBS-C wording or thresholds. These drafts use Rome IV as the brief instructed. Confirm the NICE chart wording and the mapping of the Heaton 1992 "normal type" figures. |
| 10 | constipated-after-travel | Travel Constipation: Why It Happens and How to Stay Regular | constipated after traveling | 1,935 | /resources/constipation-diary | [] | Tuteja 2008 was characterized from its abstract only. Is it OK to advise carrying an OTC laxative after asking a pharmacist? |

**Product claims used** (all from `research/product-fact-sheet.md` §6, none of them unverified):
- Bristol logging by photo with AI classification, or by manual entry
- Stool photo privacy mode
- Time on the toilet slider (v2.0.0)
- Meal logging by photo or text
- Symptom taps
- Free-text notes (v2.0.0)
- Hydration logging (v2.0.0)
- Backdating up to 7 days
- Gut-health streak (Bristol 3–4)
- Weekly Digest
- Nutrition breakdown, including fiber
- Doctor Report, always described as part of the subscription

**Not claimed:**
- A "no bowel movement today" or no-go-day log, per the cluster instruction. Every article describes no-go days as a paper/diary method. **Discrepancy to resolve:** the fact sheet §6.1 lists "No-go days … 'No-go days don't break your streaks'" (S5, v1.2+), but a 2026-10-13 App Store review asks for exactly this feature. Product should confirm whether it is live and findable before any copy claims it.
- Structured stress/sleep context fields. `can-stress-cause-constipation` uses only the verified free-text notes, so the gate-8 dependency is avoided.

## Internal-link map

| From → to | Pillar | /poop-tracker | when-to-see-doctor | Sibling / cross-cluster links |
|---|---|---|---|---|
| cheese-and-constipation | constipation-diary | ✓ | ✓ | fiber-constipation, bananas-and-constipation, dairy-bloating (C4), diarrhea-after-dairy (C6) |
| regular-poop-schedule | constipation-diary | ✓ | ✓ | how-often-should-you-poop (C1), fiber-constipation, constipated-after-travel, coffee-poop (C6) |
| can-constipation-cause-nausea | constipation-diary | ✓ | ✓ | havent-pooped-in-days, can-constipation-cause-back-pain, glp1-diarrhea-tracking (C6) |
| can-constipation-cause-back-pain | constipation-diary | ✓ | ✓ | can-constipation-cause-nausea, havent-pooped-in-days, how-to-describe-abdominal-pain (C8) |
| fiber-constipation | constipation-diary | ✓ | ✓ | fiber-bloating (C4), regular-poop-schedule, bristol-stool-type-1-2, ibs-c-vs-ibs-d (C3) |
| bananas-and-constipation | constipation-diary | ✓ | ✓ | cheese-and-constipation, fiber-constipation, ibs-trigger-foods (C3) |
| havent-pooped-in-days | constipation-diary | ✓ | ✓ | how-often-should-you-poop (C1), can-constipation-cause-nausea, constipated-after-travel, regular-poop-schedule |
| can-stress-cause-constipation | constipation-diary | ✓ | ✓ | ibs-and-stress (C3), stress-diarrhea (C6), regular-poop-schedule, constipated-after-travel (the three stress pages cross-link, per strategy §6 rule 6) |
| bristol-stool-type-1-2 | bristol-stool-chart + constipation-diary | ✓ | ✓ | fiber-constipation, what-does-healthy-poop-look-like (C1), ibs-c-vs-ibs-d (C3), how-to-describe-poop-to-doctor (C8) |
| constipated-after-travel | constipation-diary | ✓ | ✓ | regular-poop-schedule, havent-pooped-in-days, fiber-constipation, can-stress-cause-constipation |

**Inbound links within C5:**

| Article | Linked from |
|---|---|
| fiber-constipation | 5 posts |
| regular-poop-schedule | 4 posts |
| havent-pooped-in-days | 3 posts |
| constipated-after-travel | 3 posts |
| can-constipation-cause-nausea | 2 posts |
| bananas-and-constipation | 1 post |
| cheese-and-constipation | 1 post |
| can-constipation-cause-back-pain | 1 post |
| bristol-stool-type-1-2 | 1 post |
| can-stress-cause-constipation | 1 post |

The `/resources/constipation-diary` pillar should link down to all 10.

**All link targets are in `keywords/blog-topic-plan.csv` or strategy §4.** Target pages that don't exist yet will 404 until they are published:
- `/resources/constipation-diary`
- `/resources/bristol-stool-chart`
- `/poop-tracker`
- every non-C5 sibling

## Recommended publish order

1. **regular-poop-schedule.** Brand-aligned ("regular"), YMYL low, and a hub for many siblings.
2. **cheese-and-constipation.** Quick win #6 in the strategy (5,400 / KD 33), YMYL low.
3. **fiber-constipation.** The most-linked sibling, and it answers the cluster's core fiber confusion.
4. **can-constipation-cause-back-pain.** 12,100 / KD 17, the best volume-to-KD ratio. Needs red-flag review.
5. **bananas-and-constipation.** 12,100 / KD 29, YMYL low.
6. **can-constipation-cause-nausea.** 8,100 / KD 20. Needs the citation checks above.
7. **bristol-stool-type-1-2.** Publish after `/resources/bristol-stool-chart` exists and Rome V wording is confirmed.
8. **constipated-after-travel.**
9. **can-stress-cause-constipation.** Publish together with ibs-and-stress (C3) and stress-diarrhea (C6) so the cross-links resolve.
10. **havent-pooped-in-days.** YMYL High: only after a named clinician signs off. This page has the highest liability if its thresholds are wrong.

## Cross-cluster notes for the editor

- **Rome V was released in 2026.** Five C5 posts cite Rome IV criteria: regular-poop-schedule, havent-pooped-in-days, bristol-stool-type-1-2, fiber-constipation (indirectly) and the 25% rules. A reviewer should check whether Rome V changes the "functional constipation" naming or thresholds before publishing.
- **The 2025 British Dietetic Association constipation guideline** (Neurogastroenterol Motil, PMC12623288) and the 2023 APT foods meta-analysis are recent primary sources the competitor pages don't cite. They are useful for the pillar page as well.
