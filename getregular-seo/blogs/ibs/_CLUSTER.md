# Cluster C3: IBS tracking & IBS food diary (`cluster: "ibs"`)

Pillar: `/resources/ibs-food-diary` (guide + printable + worked example; it owns "irritable bowel syndrome food diary" at 2,400/mo, so no blog targets that keyword). Product page: `/ibs-tracker`.
All 10 drafts: `review_status: draft-needs-medical-review`, `medical_reviewer: "PENDING"`, dates null. Written 19 Oct 2026.

## Articles

Word counts include tables, FAQ and the sources list, but not the writer-notes comment.

| Order | Slug | Title | Primary kw | Words | Pillar | feature_dependencies | Top reviewer questions |
|---|---|---|---|---|---|---|---|
| 1 | ibs-flare-up-tracking | IBS Flare-Up: How Long It Lasts and How to Track One | ibs flare up | ~2,370 | /resources/ibs-food-diary | [] | Is "no guideline defines flare length" OK? Red-flag list completeness; peppermint oil cautions; ER thresholds in the FAQ |
| 2 | ibs-c-vs-ibs-d | IBS-C vs IBS-D vs IBS-M: What a 2-Week Stool Log Shows | ibs-c vs ibs-d | ~1,950 | /resources/ibs-food-diary | [] | Confirm the ">25% of BMs on abnormal days" arithmetic in the worked example; does Rome V change subtyping? |
| 3 | low-fodmap-reintroduction-tracking | Low-FODMAP Reintroduction Tracker: How to Log Each Challenge | low fodmap reintroduction tracker | ~2,070 | /resources/ibs-food-diary | [] | The "how to read results" table: discussion prompts or too prescriptive? Honey as an example test food (no amounts given) |
| 4 | ibs-trigger-foods | IBS Foods to Avoid: The Usual Suspects and How to Test Yours | ibs symptoms foods to avoid | ~2,000 | /resources/ibs-food-diary | [] | Fructans vs gluten framing; coffee illustrative test; allergy signs in the red flags |
| 5 | ibs-vs-food-intolerance | IBS vs Food Intolerance: How to Tell Them Apart | ibs vs food intolerance | ~2,060 | /resources/ibs-food-diary | [] | Keep the ~22% fructose malabsorption figure (narrative review)? Add a Rome V note? Giardia FAQ |
| 6 | ibs-and-period | Does IBS Flare Up During Your Period? What to Track | does ibs flare up during period | ~1,860 | /resources/ibs-food-diary | [] (Period Tracking is VERIFIED, v1.6) | Pati 2021 is a small study; gynecologic red flags; contraception FAQ; Rome V "not solely related to menses" clause (not verified, omitted) |
| 7 | ibs-flare-what-to-eat | What to Eat During an IBS Flare-Up (and What to Skip) | ibs flare up what to eat | ~1,810 | /resources/ibs-food-diary | [] | Banana FAQ wording; peppermint tea vs oil; dehydration guidance |
| 8 | ibs-and-stress | Does IBS Flare Up With Stress? How to Tell From Your Log | does ibs flare up with stress | ~1,900 | /resources/ibs-food-diary | [] (uses free-text notes, not a stress field) | 988 crisis line; Gut Check described as "not a therapist"; hypnotherapy vs low-FODMAP wording |
| 9 | can-ibs-start-suddenly | Can IBS Start Suddenly? Post-Infection IBS and Late Onset | can ibs appear suddenly | ~2,000 | /resources/ibs-food-diary | [] | **YMYL High.** Colon screening age (45); detail level of the differential table; Rome V note |
| 10 | how-is-ibs-diagnosed | How Is IBS Diagnosed? Rome Criteria, Tests and What to Bring | how is ibs diagnosed | ~2,300 | /resources/ibs-food-diary (+ /resources/gastroenterologist-appointment-prep) | [] | **YMYL High.** Rome V details come from a review abstract and Medscape, so verify them against Corsetti et al., Gastroenterology 2026; CBC phrasing; age-50 wording |

### Product claims used (all VERIFIED in the fact sheet)
- Meal logging by photo or text, with editable ingredients and one-tap re-log
- Stool by Bristol type (photo or manual entry) and no-go days
- Symptoms by tap, free-text notes, and backdating up to 7 days
- Medications and supplements, and period tracking
- Weekly Digest ("possible patterns")
- Premium: Doctor Report PDF (includes cycle data) and Gut Check

### Product claims deliberately avoided
- Any FODMAP database or FODMAP content
- App-computed IBS subtype or Rome IV percentages (suggested in the topic plan, but not in the fact sheet)
- Stress or sleep context fields
- Apple Health sleep data
- CSV export
- Experiments for FODMAP protocols (Experiments are AI-suggested, not user-defined)

## Internal-link map

Each post links up to the pillar early and to `/ibs-tracker` in its tracking section.

| From | To (blogs) |
|---|---|
| ibs-flare-up-tracking | ibs-flare-what-to-eat, ibs-and-stress, ibs-and-period, when-to-see-doctor-bowel-changes (C8) |
| ibs-c-vs-ibs-d | how-is-ibs-diagnosed, constipation-then-diarrhea (C6) |
| low-fodmap-reintroduction-tracking | ibs-trigger-foods, ibs-vs-food-intolerance, dietitian-appointment-prep (C8) |
| ibs-trigger-foods | low-fodmap-reintroduction-tracking, ibs-vs-food-intolerance, ibs-flare-what-to-eat, how-to-identify-food-triggers (C2) |
| ibs-vs-food-intolerance | ibs-trigger-foods, how-is-ibs-diagnosed, low-fodmap-reintroduction-tracking, food-intolerance-test-vs-food-diary (C2) |
| ibs-and-period | ibs-flare-up-tracking, ibs-and-stress, ibs-flare-what-to-eat, why-am-i-so-bloated (C4) |
| ibs-flare-what-to-eat | ibs-flare-up-tracking, ibs-trigger-foods, low-fodmap-reintroduction-tracking |
| ibs-and-stress | ibs-flare-up-tracking, ibs-and-period, stress-diarrhea (C6), can-stress-cause-constipation (C5). Strategy §6 requires the three stress pages to cross-link |
| can-ibs-start-suddenly | how-is-ibs-diagnosed, ibs-vs-food-intolerance, when-to-see-doctor-bowel-changes (C8) |
| how-is-ibs-diagnosed | ibs-c-vs-ibs-d, can-ibs-start-suddenly, ibs-vs-food-intolerance, questions-to-ask-gastroenterologist (C8); also the /resources/gastroenterologist-appointment-prep pillar |

Cross-cluster targets that must exist before these links go live:
- when-to-see-doctor-bowel-changes
- constipation-then-diarrhea
- dietitian-appointment-prep
- how-to-identify-food-triggers
- food-intolerance-test-vs-food-diary
- why-am-i-so-bloated
- stress-diarrhea
- can-stress-cause-constipation
- questions-to-ask-gastroenterologist
- /resources/gastroenterologist-appointment-prep

C3 posts that are not yet linked from another C3 post: none. Every C3 post has at least one inbound link from a sibling.

## Recommended publish order

0. Publish the `/resources/ibs-food-diary` pillar first. Every post links up to it, and `/ibs-tracker` should exist before the CTAs go live.
1. ibs-flare-up-tracking: highest opportunity score (89) and the hub for the flare posts.
2. ibs-c-vs-ibs-d
3. low-fodmap-reintroduction-tracking
4. ibs-trigger-foods: largest measured volume (2,900/mo).
5. ibs-flare-what-to-eat
6. ibs-vs-food-intolerance
7. ibs-and-period
8. ibs-and-stress: publish alongside or after the C5 and C6 stress pages, so the required cross-links resolve.
9. how-is-ibs-diagnosed: YMYL High, so it needs a named clinician reviewer.
10. can-ibs-start-suddenly: YMYL High, so it needs a named clinician reviewer.

## Cluster-wide notes for the editor and medical reviewer
- **Rome V (2026).** The Rome Foundation published Rome V (Corsetti et al., *Gastroenterology*, May 2026). It reintroduces "discomfort", requires symptoms to be intermittent, and reportedly lowers the pain-frequency threshold to about 3 days a month. Following the brief, the posts use Rome IV and ACG 2021 as the primary framework and add Rome V notes in ibs-c-vs-ibs-d and how-is-ibs-diagnosed. The reviewer should check the Rome V specifics against the primary paper.
- **Monash reintroduction length.** Monash's 2020 blog says Step 2 takes about 6–8 weeks; its 2026 info sheet says 8–12 weeks. Both are cited.
- **Sourcing.** No Reddit quotes; forum themes are paraphrased only. All numbers are cited to sources that were opened, or read as PubMed records through NCBI E-utilities.
- **Illustrative data.** All worked examples are invented and labeled "illustrative".
