# Resource pillar copy: `/resources/bristol-stool-chart`

> Tool + reference + printable for cluster C1 (stool & Bristol). The 7-type table must render as static HTML (works with JS off); the interactive picker progressively enhances it. All type descriptions below are **original wording** — do not paste descriptions from other charts. Original illustrations only (no copied chart images). Health statements cite §15.

## 0. Header block

| Field | Value |
|---|---|
| URL | `https://www.getregular.com/resources/bristol-stool-chart` |
| review_status | `draft-needs-medical-review` |
| medical_reviewer | PENDING |
| Primary keyword | bristol stool chart |
| Owned variants | bristol stool scale, bristol stool form scale, poop chart, types of poop, stool types, stool chart, bowel movement chart, bristol stool chart pdf (via download; the C1 post covers the PDF query in depth), bristol stool chart printable |
| Not owned (link out) | "healthy poop" → `/blog/what-does-healthy-poop-look-like`; "type 6" → `/blog/bristol-stool-type-6`; "type 1 and 2" → `/blog/bristol-stool-type-1-2`; "poop color chart" → `/blog/poop-color-chart` |
| Search intent | Informational / reference + tool + download |
| Title tag (52 chars) | `Bristol Stool Chart: The 7 Poop Types + Free PDF Log` |
| Meta description (157 chars) | `The Bristol stool chart in plain words: what each of the 7 poop types can suggest, when to see a doctor, a quick type picker and a free printable 14-day log.` |
| H1 | Bristol Stool Chart: What the 7 Poop Types Mean |
| OG title | The Bristol stool chart, explained (+ free printable log) |
| OG description | All 7 poop types in plain language, what each can suggest, red flags, and a free 14-day bowel log. |
| OG image brief | Original illustrated 7-type chart in brand palette, horizontal, numbered 1–7, soft neutral shapes (not realistic). Alt: "Illustrated Bristol stool chart showing the seven stool types from hard lumps (type 1) to liquid (type 7)." |
| JSON-LD | `WebPage` + `BreadcrumbList` (Home › Resources › Bristol stool chart). Optional `DefinedTermSet` for the 7 types is **not** needed; keep it simple |
| App Store `ct` token | `bristol-chart` |
| Printable | `/resources/bristol-stool-chart.pdf` (chart page + 14-day log; Letter and A4 variants `-letter.pdf`, `-a4.pdf`) |
| Internal links out | "poop tracker app" → `/poop-tracker`; "constipation diary" → `/resources/constipation-diary`; "food diary for diarrhea" → `/resources/food-diary-for-diarrhea`; "IBS food diary" → `/resources/ibs-food-diary`; "GI appointment checklist" → `/resources/gastroenterologist-appointment-prep`; "How our AI works" → `/how-ai-works`; all C1 children (§13) + `/blog/bristol-stool-type-1-2`, `/blog/how-to-describe-poop-to-doctor`, `/blog/when-to-see-doctor-bowel-changes` |
| Pages that must link in | `/poop-tracker` (pillar), all 10 C1 posts, `/blog/bristol-stool-type-1-2`, `/blog/how-to-describe-poop-to-doctor`, `/resources/constipation-diary`, `/resources/food-diary-for-diarrhea`, `/resources/ibs-food-diary`, homepage resources grid, footer |
| Link-path note | `keywords/blog-topic-plan.csv` lists the C1 printable post at `/resources/bristol-stool-chart-pdf`; this page links it as `/blog/bristol-stool-chart-pdf` (blog drafts route to `/blog/<slug>`). **[CONFIRM: final route; Codex link validator will flag a mismatch.]** |

---

## 1. Answer box

> **Quick answer:** The Bristol stool chart (Bristol Stool Form Scale) sorts poop into 7 types by shape and consistency, from type 1 (separate hard lumps) to type 7 (entirely liquid). Types 3 and 4 are generally the easiest to pass. Types 1–2 lean toward constipation and types 5–7 toward loose stools. Stool type broadly reflects how quickly stool moves through your gut, so a lasting change is worth noting.

## 2. Intro

Doctors and nurses use the Bristol scale because "kind of loose" means different things to different people. A number doesn't. The scale was developed at the Bristol Royal Infirmary in the UK, and a 1997 study by Lewis and Heaton showed that changes in stool type tracked changes in whole-gut transit time more closely than how often people went [1].

Below: the 7 types in plain words, what each one *can* suggest, when to see a doctor, a quick picker, and a free printable log.

**In this guide:**
- [The 7 types at a glance](#chart)
- [Find your type (picker)](#picker)
- [What each type can mean](#types)
- [How to use the chart day to day](#use)
- [Free printable chart + 14-day log](#printable)

## 3. Key takeaways

- 7 types: **1–2 hard**, **3–4 easy to pass**, **5–7 soft to liquid** [1][2].
- One odd day rarely matters; a **change that lasts** is what to note [3].
- Your normal frequency can range widely; fewer than half of adults in a large UK study had a regular once-a-day habit [4].
- **Blood, black/tarry stool, pale stool for days, weight loss or nighttime diarrhea** need a doctor, whatever the type [3][5][6].
- Rating your own stool is imperfect — people often disagree on types 2 vs 3 and 5 vs 6 [7].

---

## 4. The 7 types at a glance (static table, no JS) {#chart}

**H2:** What are the 7 types on the Bristol stool chart?

| Type | What it looks like (original wording) | Where it sits | What it can suggest |
|---|---|---|---|
| **1** | Small, separate, hard pellets that can be tough to push out | Hard | Stool has moved slowly; often seen with constipation |
| **2** | One log-shaped piece made of hard lumps pressed together | Hard | Slower-than-usual transit; leaning constipated |
| **3** | A formed log with cracks across the surface | Easy to pass | Within the usual range for most people |
| **4** | A smooth, soft log or snake that passes easily | Easy to pass | Within the usual range; often called the "ideal" type |
| **5** | Soft pieces with clean, defined edges that pass easily | Soft | Leaning loose, especially if frequent or new for you |
| **6** | Mushy, fluffy pieces with torn, ragged edges | Loose | Faster transit; mild diarrhea |
| **7** | Liquid with no solid pieces | Liquid | Fast transit; diarrhea |

**Table caption:** *Bristol Stool Form Scale, after Lewis & Heaton (1997) [1]. Descriptions written by Get Regular. "Where it sits" groups follow common clinical use: types 1–2 hard (Rome IV) [2]; types 6–7 loose or watery (Rome IV/NIDDK) [2][8].*

**Image brief (chart illustration):** One original illustration per type (simple rounded vector shapes in brand brown/taupe on a light background, not photorealistic), arranged 1–7 left-to-right on desktop and as a vertical list on mobile, each with its number. Provide as inline SVG with `<title>` per type.
**Alt (whole chart):** "Illustrated Bristol stool chart: type 1 separate hard pellets, type 2 lumpy log, type 3 cracked log, type 4 smooth soft log, type 5 soft pieces with clear edges, type 6 mushy ragged pieces, type 7 liquid."

---

## 5. Interactive type picker (progressive enhancement) {#picker}

**H2:** Which Bristol type was yours?

**Behaviour:** Seven illustrated buttons (radio group, keyboard accessible, `aria-pressed`). Selecting one reveals a result card below. With JS off, the static table above is the experience; the picker block is hidden (`[hidden]` until hydrated). No data is stored or sent.

**Microcopy**
- Picker prompt: `Tap the picture that looks most like your last bowel movement.`
- Helper (small): `Somewhere in between? Pick the closer one — borderline types are hard for everyone.`
- Privacy note (small): `Nothing you tap here is saved or sent.`

**Result cards (one per type)**

| Type | Card headline | Card body (≤ 45 words) | Card link |
|---|---|---|---|
| 1 | Type 1: hard pellets | This usually means stool moved slowly through your gut. Common after low fluids, low fiber, travel or some medicines. If it's your usual pattern or comes with pain or blood, talk to a doctor. | `What helps with hard stools →` `/blog/bristol-stool-type-1-2` |
| 2 | Type 2: lumpy log | On the constipated side. One day isn't a problem; if hard stools are a regular thing, a constipation diary helps you and your doctor see why. | `Free constipation diary →` `/resources/constipation-diary` |
| 3 | Type 3: cracked log | In the usual range for most people. Nice. | `What healthy poop looks like →` `/blog/what-does-healthy-poop-look-like` |
| 4 | Type 4: smooth and soft | The type most people aim for — easy to pass, no straining. | `How often should you poop? →` `/blog/how-often-should-you-poop` |
| 5 | Type 5: soft pieces | Softer than average. Occasional type 5 is common; if most of your stools are 5 or looser for weeks, note it. | `Types 5, 6 and 7 explained →` `/blog/bristol-stool-type-6` |
| 6 | Type 6: mushy | A loose stool. Often short-lived (a meal, a bug, stress). If it lasts more than a few days or keeps coming back, track what happens before it. | `Food diary for diarrhea →` `/resources/food-diary-for-diarrhea` |
| 7 | Type 7: liquid | This is diarrhea. Drink fluids. Get medical advice if it lasts more than 2 days, you have six or more a day, a high fever, blood or black stool, or signs of dehydration. | `When diarrhea needs a doctor →` `/blog/when-to-see-doctor-bowel-changes` |

**Under every card (fixed):**
`Red flags at any type: blood, black or tarry stool, pale or clay-colored stool for more than a few days, unexplained weight loss, or diarrhea that wakes you at night — see a doctor.`
`Want to see your pattern over weeks? Log it in Get Regular →` (`AppStoreLink ct=bristol-chart`) · `or print the free 14-day log` (anchor to `#printable`)

---

## 6. What each type can mean {#types}

**H2:** What does each Bristol stool type mean?

### Type 1 — separate hard pellets
**What it looks like:** small, firm, separate pieces, sometimes hard to pass.
**What it can suggest:** stool has spent a long time in the colon, where water is absorbed [1][9]. Common contributors include low fiber, low fluids, inactivity, ignoring the urge to go, travel and some medicines and supplements (for example iron, some antacids and opioid pain medicines) [10].
**When to see a doctor:** if hard stools are your usual pattern despite diet and routine changes, if you have fewer than three bowel movements a week regularly, or right away if you have blood, constant abdominal pain, vomiting, fever, can't pass gas, or are losing weight without trying [10].

### Type 2 — lumpy log
**What it looks like:** a single sausage shape made of lumps stuck together.
**What it can suggest:** slower-than-ideal transit; still on the constipated side. Rome IV uses "lumpy or hard stools (Bristol 1–2)" in more than a quarter of bowel movements as one of the criteria for functional constipation [2].
**When to see a doctor:** same as type 1. Track straining and the feeling of incomplete emptying too — doctors ask about both [2][11].

### Type 3 — cracked log
**What it looks like:** formed and sausage-shaped, with cracks on the surface.
**What it can suggest:** within the usual range for most people.
**When to see a doctor:** not for the type itself — only if it comes with red-flag symptoms (§7).

### Type 4 — smooth, soft log
**What it looks like:** smooth, soft and snake-like; passes without effort.
**What it can suggest:** within the usual range; often described as the target. In Get Regular, days in the 3–4 range count toward your streak.
**When to see a doctor:** only with red-flag symptoms.

### Type 5 — soft pieces with clear edges
**What it looks like:** soft separate pieces with defined edges, easy to pass.
**What it can suggest:** on the soft side. Research uses vary: one validation study grouped types 3–5 as "normal" [7], while the British Society of Gastroenterology counts persistent types 5–7 with increased frequency as chronic diarrhea [12].
**When to see a doctor:** if most of your stools have been type 5 or looser, more often than usual, for more than 4 weeks [12].

### Type 6 — mushy, ragged pieces
**What it looks like:** fluffy, mushy pieces with uneven edges.
**What it can suggest:** faster transit; a loose stool. Often short-lived — a meal, alcohol, a stomach bug, stress or a new medicine.
**When to see a doctor:** if loose stools last more than 2 days, if you have six or more a day, a high fever, severe abdominal or rectal pain, signs of dehydration, or black, tarry or bloody stools [5]. If it keeps coming back over weeks, see a doctor and bring a log.

### Type 7 — entirely liquid
**What it looks like:** watery, no solid pieces.
**What it can suggest:** diarrhea — passing loose, watery stools three or more times a day, or more often than is normal for you [13].
**When to see a doctor:** same as type 6. Drink fluids; dehydration is the main short-term risk [13].

---

## 7. Red flags at any type

**H2:** When should you see a doctor about your poop?

**Answer:** Whatever the Bristol type, see a doctor promptly if you notice any of these:

- Blood in or on your stool, or bleeding from your bottom [3][5]
- Black, tarry or maroon stools — can signal bleeding higher in the gut, though iron supplements and bismuth medicines can also darken stool [5][6]
- Pale, white or clay-colored stools for more than a few days — urgently if your skin or eyes look yellow [6]
- Unexplained weight loss or ongoing tiredness [3]
- Diarrhea that wakes you from sleep [14]
- A change in your usual bowel habit that lasts — new symptoms later in life or with a family history of colon cancer deserve a check [3][15]
- Constant or severe abdominal pain, vomiting, fever, or being unable to pass gas [10]

Colorectal cancer screening is recommended for adults aged 45 to 75 in the US, whether or not you have symptoms [16]. Full list: [changes in bowel habits that need a doctor](/blog/when-to-see-doctor-bowel-changes).

---

## 8. How to use the chart {#use}

**H2:** How do you use the Bristol stool chart?

**Answer:** After each bowel movement, pick the closest type and write it down with the time. After 1–2 weeks, look at your mix of types and how often you go. Your usual pattern is your baseline; a lasting shift from it is what's worth noting.

**Steps:**
1. Glance before you flush; pick the nearest type (if between two, note both, e.g. "4/5").
2. Log the **time**, **type**, and anything notable: straining, urgency, feeling of incomplete emptying, mucus, blood, color.
3. Log no-go days too.
4. After 14 days, count: how many days had a bowel movement, how many were 3–4, how many were 1–2 or 6–7.
5. Bring the summary to appointments. Describing stool with the Bristol type is quicker and clearer: see [how to describe your poop to a doctor](/blog/how-to-describe-poop-to-doctor).

**Why types are imperfect:** in a validation study, people classified stool models correctly about 81% of the time, with the most disagreement around types 2/3 and 5/6 [7]. Consistent logging over weeks matters more than perfect calls.

### Illustrative example week

**Label (visible):** *Illustrative example, not real data.*

| Day | Time | Type | Notes |
|---|---|---|---|
| Mon | 07:40 | 4 | — |
| Tue | 08:00 | 3 | — |
| Wed | — | No-go day | Long flight, little water |
| Thu | 09:20 | 2 | Strained ~10 min |
| Fri | 08:10 | 3 | Back to usual fluids |
| Sat | 08:30 · 18:15 | 4 · 6 | Spicy takeout at lunch; urgent in evening |
| Sun | 09:00 | 4 | — |

**Reading it:** 5 of 7 days in the 3–4 range, one hard day after a no-go travel day, one loose stool after a spicy meal. Nothing here is alarming; a longer log would show whether the travel or spicy-food dips repeat. Related: [why does my poop float?](/blog/floating-poop) · [green poop](/blog/green-poop).

---

## 9. Frequency and color

**H2:** How often should you poop, and does color matter?

- **Frequency:** there's no single normal. In a study of 1,897 adults in Bristol, the most common habit was once daily, but only about a third to 40% had a regular 24-hour cycle, and a third of women went less than daily [4]. Constipation is often defined as fewer than three bowel movements a week together with hard stools or straining [10]. See [how often should you poop?](/blog/how-often-should-you-poop)
- **Color:** brown in its many shades is typical. Green or yellow can follow food and faster transit; black, red/maroon or pale stools are the ones to take seriously (§7) [6]. See the [adult poop color chart](/blog/poop-color-chart).
- **Mucus:** a little mucus can be normal; whitish mucus can occur with IBS [8]; mucus with blood or a change in habit needs a doctor. See [mucus in stool](/blog/mucus-in-stool).

---

## 10. Track it with Get Regular (product bridge)

**H2:** How to track your Bristol type over time

A paper log works. If you'd rather tap than write, the [Get Regular poop tracker](/poop-tracker) logs each bowel movement by Bristol type — pick it yourself, no photo required, or snap a photo and the AI suggests a type. It records the time, toilet time and notes, counts no-go days without breaking your streak, and counts days in the 3–4 range. With Premium, the Doctor Report PDF includes your Bristol tracking and bowel patterns. It doesn't diagnose anything.

**CTA (`ct=bristol-chart`):** `Log your type in the app — free download`

---

## 11. Printable spec {#printable}

**H2:** Free printable Bristol stool chart + 14-day log

**Download CTA:** `Download the Bristol chart + 14-day log (PDF, US Letter)` · `A4 version`
**Microcopy:** `Free, no sign-up. Page 1: the chart. Pages 2–3: 14-day bowel log. Stick page 1 inside a bathroom cabinet.`
**Preview image brief:** Two-page thumbnail. Alt: "Preview of the printable Bristol stool chart and 14-day bowel movement log."

### PDF spec
- **Format:** US Letter and A4, portrait, black-and-white safe; illustrations as vector; ≥ 10 pt text.
- **Footer (every page):** `getregular.com/resources/bristol-stool-chart · Bristol Stool Form Scale after Lewis & Heaton, 1997. For personal tracking — not medical advice.` + page number.
- **Page 1 — Chart:** 7 rows: `Type number` (large) | original illustration | one-line description (§4 wording) | group label (Hard / Easy to pass / Soft / Loose / Liquid). Below: red-flag box (§7, condensed to 6 bullets). Small line: `Not sure? Pick the closer type.`
- **Pages 2–3 — 14-day bowel log (7 days per page):** one block per day with header `Day __ · Date ____ · Water/fluids: ____ · Fiber foods today: ____ · Stress 0–10: __`; inside, a table with 4 rows and columns: `Time` | `Bristol type 1–7` | `Straining? Y/N` | `Urgent? Y/N` | `Felt incomplete? Y/N` | `Color (if not brown)` | `Blood or mucus? Y/N` | `Notes`. Tick box: `☐ No bowel movement today`.
- **Page 3 bottom — 14-day summary:** `Days with a BM: __/14` · `Most common type: __` · `No. of type 1–2: __` · `No. of type 6–7: __` · `Questions for my doctor:` (3 lines).

---

## 12. Expert sources behind this page
*(Rendered as a short "How we wrote this" note above Sources.)* Type descriptions are our own plain-language wording of the Bristol Stool Form Scale [1]. Clinical thresholds come from Rome IV [2], NIDDK [5][8][10][13], the British Society of Gastroenterology [12] and the American College of Gastroenterology [3]. Reviewed by [PENDING] on [date].

---

## 13. Everything in this cluster

**H2:** More on poop, stool types and tracking
- [How to track your bowel movements: what to log each time](/blog/how-to-track-bowel-movements)
- [Free printable Bristol stool chart + 14-day bowel movement log (PDF)](/blog/bristol-stool-chart-pdf) **[CONFIRM route — see header]**
- [How long after eating do you poop it out? Transit time](/blog/how-long-does-it-take-food-to-become-poop)
- [How often should you poop?](/blog/how-often-should-you-poop)
- [Why does my poop float?](/blog/floating-poop)
- [What does healthy poop look like? Types 3–4](/blog/what-does-healthy-poop-look-like)
- [Bristol stool types 5, 6 and 7: what loose stool means](/blog/bristol-stool-type-6)
- [Green poop: common causes](/blog/green-poop)
- [Mucus in stool: what's normal and what's not](/blog/mucus-in-stool)
- [Poop color chart for adults](/blog/poop-color-chart)
- [Bristol type 1 and 2 poop: hard lumps](/blog/bristol-stool-type-1-2)
- [How to describe your poop to a doctor](/blog/how-to-describe-poop-to-doctor)

---

## 14. FAQ

**H2:** Bristol stool chart FAQ

**What is the Bristol stool chart used for?**
To describe stool form with a number from 1 to 7 instead of vague words. Clinicians use it to talk about constipation and diarrhea and to classify IBS subtypes, and researchers use it as a rough guide to how fast stool moves through the gut [1][2][8].

**What is the healthiest poop type?**
Types 3 and 4 are generally the easiest to pass and are considered within the usual range. What matters most is your own consistent pattern and how easily you go.

**What's the difference between type 5 and type 6?**
Type 5 is soft pieces with clean edges; type 6 is mushy with ragged edges. Even trained volunteers mix them up sometimes [7]. If you're often in the 5–7 range for more than 4 weeks, mention it to a doctor [12].

**Is it normal for stool type to change from day to day?**
Yes. Food, fluids, activity, stress, travel, your cycle and medicines all shift stool form. A lasting change over weeks is what's worth noting [3].

**What causes type 1 poop?**
Usually slow transit — low fiber or fluids, inactivity, holding it in, travel or certain medicines and supplements [10]. See [type 1 and 2 poop](/blog/bristol-stool-type-1-2).

**Can I have IBS with normal poop?**
Yes — many people with IBS have normal bowel movements on some days and abnormal ones on others [8].

---

## 15. Sources

1. Lewis SJ, Heaton KW. Stool form scale as a useful guide to intestinal transit time. *Scand J Gastroenterol*. 1997;32(9):920–924. https://pubmed.ncbi.nlm.nih.gov/9299672/ (verified 19 Oct 2026)
2. Rome Foundation. Rome IV criteria — C1 IBS, C2 functional constipation, C3 functional diarrhea. https://theromefoundation.org/rome-iv/rome-iv-criteria/
3. American College of Gastroenterology. Irritable bowel syndrome (patient information): warning signs. https://gi.org/topics/irritable-bowel-syndrome/
4. Heaton KW, Radvan J, Cripps H, et al. Defecation frequency and timing, and stool form in the general population: a prospective study. *Gut*. 1992;33(6):818–824. https://pubmed.ncbi.nlm.nih.gov/1624166/
5. NIDDK. Symptoms & causes of diarrhea. https://www.niddk.nih.gov/health-information/digestive-diseases/diarrhea/symptoms-causes
6. Cleveland Clinic. Stool (poop) color: guide; Clay-colored or pale stool. https://my.clevelandclinic.org/health/articles/stool-poop-color and https://my.clevelandclinic.org/health/symptoms/clay-colored-or-pale-stool
7. Blake MR, Raker JM, Whelan K. Validity and reliability of the Bristol Stool Form Scale in healthy adults and patients with diarrhoea-predominant irritable bowel syndrome. *Aliment Pharmacol Ther*. 2016;44(7):693–703. https://pubmed.ncbi.nlm.nih.gov/27492648/
8. NIDDK. Definition & facts for IBS; Symptoms & causes of IBS. https://www.niddk.nih.gov/health-information/digestive-diseases/irritable-bowel-syndrome/definition-facts
9. NIDDK. Your digestive system & how it works. https://www.niddk.nih.gov/health-information/digestive-diseases/digestive-system-how-it-works
10. NIDDK. Definition & facts for constipation; Symptoms & causes of constipation. https://www.niddk.nih.gov/health-information/digestive-diseases/constipation/symptoms-causes
11. NHS. Constipation. https://www.nhs.uk/conditions/constipation/
12. Arasaradnam RP, Brown S, Forbes A, et al. Guidelines for the investigation of chronic diarrhoea in adults: British Society of Gastroenterology, 3rd edition. *Gut*. 2018;67(8):1380–1399. https://pubmed.ncbi.nlm.nih.gov/29653941/
13. NIDDK. Definition & facts for diarrhea. https://www.niddk.nih.gov/health-information/digestive-diseases/diarrhea/definition-facts
14. Brandler J, Chey WD. Fishing for irritable bowel syndrome: which alarm features weave the best net? *Clin Gastroenterol Hepatol*. 2022;20(2):276–278. https://pubmed.ncbi.nlm.nih.gov/33220527/
15. NHS. Symptoms of bowel cancer. https://www.nhs.uk/conditions/bowel-cancer/symptoms/
16. U.S. Preventive Services Task Force. Colorectal cancer: screening. https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening

*This page is for general education and isn't medical advice. Get Regular is a tracking app — it doesn't diagnose or treat any condition. If you have red-flag symptoms or ongoing changes in your bowel habits, talk to a doctor.*

<!-- WRITER NOTES: SERP gap — Cleveland Clinic/GoodRx/Continence Health hold the head term with reference pages; none pair the chart with a log, a picker and a reading method; Balloon (Aug 2026) and Plop have no printable. Realistic targets: "bristol stool chart pdf/printable" and "app" variants. Reviewer questions: (1) approve type-5 framing (Blake 2016 "normal 3–5" vs BSG "5–7 chronic diarrhoea"); (2) approve picker card copy; (3) image licensing — illustrations must be commissioned originals. -->
