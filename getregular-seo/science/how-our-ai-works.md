---
title: "How Get Regular's AI Works: Inputs, Scores & Limits"
slug: how-our-ai-works
url: /science/how-our-ai-works
redirect_from: [/how-ai-works]   # 301 → /science/how-our-ai-works
description: "What Get Regular's AI does with your food, stool and symptom logs, what the scores summarize, where data is processed (OpenAI API), and the limits to know."
primary_keyword: how does get regular ai work
secondary_keywords: [gut health ai, ai gut health app, get regular gut health score, is get regular accurate, get regular privacy openai, can ai read a poop photo]
hub: /science
template: science-trust-page
schema_type: MedicalWebPage
review_status: draft-needs-medical-review   # plus legal/privacy review of the data-flow wording
medical_reviewer: PENDING
date_published: null
date_updated: null
sources_checked: 2026-10-20   # PubMed abstracts for [1], [4], [10]–[13] re-read on this date
---

# Trust page copy: `/science/how-our-ai-works`

> Long-form trust page: what goes into the AI, what comes out, the limits, where data is processed, what published research says about AI and photos, and who was involved clinically. Server-rendered, no animation. Every product fact is from `research/product-fact-sheet.md` (19 Oct 2026); data-flow facts are from the Get Regular privacy policy (8 June 2026). Copy is carried over from `onpage/how-ai-works.md` with updated URLs and a new research box (§5a). **This page must not overstate anything the policy or the team hasn't confirmed.** **[CONFIRM: …]** items block publishing.

## 0. Header block

| Field | Value |
|---|---|
| URL | `https://www.getregular.com/science/how-our-ai-works` |
| Redirect | `/how-ai-works` → 301 → `/science/how-our-ai-works` (update every internal link; don't rely on the redirect) |
| review_status | `draft-needs-medical-review` + legal/privacy review (data-flow wording) |
| Primary keyword | how does get regular ai work |
| Owned variants | gut health ai, ai gut health app (methodology), gut health score method, get regular gut health score, is get regular accurate, get regular privacy openai, can ai read a poop photo |
| Search intent | Informational / trust (product-aware) |
| Title tag (51 chars) | `How Get Regular's AI Works: Inputs, Scores & Limits` |
| Meta description (155 chars) | `What Get Regular's AI does with your food, stool and symptom logs, what the scores summarize, where data is processed (OpenAI API), and the limits to know.` |
| H1 | How Get Regular's AI works |
| OG title | How Get Regular's AI works — and where it can be wrong |
| OG description | Inputs, outputs, scores, data flow and limits of the AI in the Get Regular gut health app, in plain language. |
| Breadcrumb | Home › Science › How our AI works |
| JSON-LD | `MedicalWebPage` (`@id` https://www.getregular.com/science/how-our-ai-works#webpage), `isPartOf` → `/science#webpage`, `about` → `https://www.getregular.com/app#app`, `publisher` → `#org`, `dateModified`, `citation[]` → `ScholarlyArticle` for sources [1], [4], [10]–[13] (`name`, `author`, `datePublished`, `isPartOf` Periodical, `identifier` DOI, `sameAs` PubMed URL). Add `reviewedBy` (Person) + `lastReviewed` **only** if Dr. Schopis (or another clinician) actually reviews this page and consents. No `medicalSpecialty` claims beyond what review supports. |
| App Store `ct` token | `how-ai-works` (keep the existing token so campaign data stays continuous) |
| Internal links out | "facts, pricing and limits" → `/app`; "privacy policy" → `/legal/privacy-policy`; "terms of service" → `/legal/terms-of-service`; "Bristol stool chart" → `/tools/bristol-stool-chart`; "poop tracker" → `/poop-tracker`; "food & symptom tracker" → `/food-symptom-tracker`; "how the Gut Health Score works" → `/science/gut-health-score`; "what is a gut health score?" → `/learn/gut-health-score-explained`; "what AI can and can't tell you" → `/learn/ai-gut-health-apps`; "can an app analyze a poop photo?" → `/learn/poop-photo-analysis`; "is your gut health app private?" → `/learn/gut-health-app-privacy`; "correlation or coincidence?" → `/learn/food-symptom-patterns`; "AI, stool photos and meal photos: the research" → `/science/evidence/ai-stool-and-meal-photos`; "who reviews our content" → `/science/clinical-review`; "research program" → `/science/research` |
| Pages that must link in | `/science` hub; homepage AI & privacy section; `/app` (sections 5, 6, 8); all 3 product pages (privacy section); footer (all pages); `/learn` posts `gut-health-score-explained`, `ai-gut-health-apps`, `poop-photo-analysis`, `gut-health-app-privacy`; `/science/evidence/ai-stool-and-meal-photos` |
| Visible dates | `Published: [set at publish] · Last updated: [date] · Reflects app version 2.0.1 and the privacy policy dated 8 June 2026` |

---

## 1. Summary (answer-first)

**H1:** How Get Regular's AI works

> **In short:** Get Regular uses AI to read what you log — meal photos and descriptions, stool photos, symptoms, drinks, medications and supplements — and to summarize your recent history as daily scores, a Weekly Digest of possible patterns, and answers in Gut Check chat. To do that, your logged content is sent to OpenAI's API for analysis. The AI can be wrong, it doesn't diagnose anything, and a pattern it finds is a hypothesis to test, not proof. Get Regular hasn't published a study of its own AI's accuracy.

**On this page:** [What goes in](#inputs) · [What the AI does](#what-it-does) · [The scores](#scores) · [Limits](#limits) · [What research says about AI and photos](#research) · [Where your data goes](#data-flow) · [Clinical input](#clinical) · [Report a mistake](#report)

---

## 2. What goes in {#inputs}

**H2:** What information does the AI use?

| Input | How you add it | Used for |
|---|---|---|
| Meal photos and text descriptions | Camera or typing; ingredients are editable | Ingredient and nutrition estimates, Nutrition Score, pattern insights |
| Stool photos | Camera (optional; enhanced privacy mode available) | Bristol type classification |
| Manual Bristol type | Pick type 1–7, no photo | Same as above, without image analysis |
| Symptoms | Tap to log | Pattern insights, symptom frequency in the Doctor Report |
| Drinks, supplements, medications | Tap or type | Nutrition totals, context for insights |
| Toilet time, notes, no-go days | Slider, free text, one tap | Gut analysis (toilet time is averaged into it) |
| Period dates | Log dates | Cycle context; included in the Doctor Report |
| Chat messages in Gut Check | Typing | Answers about your history; "core memories" — health facts you mention (e.g., an intolerance, a diagnosis you've been given, a medication) — are remembered to personalize later answers |
| Dietary preferences | Profile | Personalizing suggestions and Recipes |
| Apple Health data | If you connect it | **[CONFIRM: what is read (e.g., sleep, steps) and whether any of it reaches the AI]** |

**What the AI does *not* use:** lab results, blood tests or "biomarkers" from tests — the app has no such inputs (as of 19 Oct 2026).

---

## 3. What the AI does {#what-it-does}

**H2:** What does the AI actually do with my logs?

1. **Reads meal photos and text.** It estimates the ingredients and nutrients in a meal — including fiber and other gut-relevant compounds — and you can edit the ingredient list when it's wrong.
2. **Classifies stool photos on the Bristol Stool Form Scale.** The Bristol scale is a 7-type chart of stool form, developed at the Bristol Royal Infirmary in the UK, that tracks with how fast stool moves through the gut [1]. If you'd rather not take photos, you choose the type yourself. See the [Bristol stool chart](/tools/bristol-stool-chart). **[CONFIRM: can users override the AI's suggested type?]**
3. **Summarizes your recent history** as daily scores (below) and a weekly Weekly Digest that describes possible patterns across your food, stool and symptom history.
4. **Answers questions in Gut Check** (Premium) — for example "what's been different on my bloated days?" or "what should I eat tomorrow?" — using your own logs and core memories.
5. **Suggests things to try** — food and supplement suggestions, meal tweaks, personalized Recipes (Premium) and Experiments (Premium), such as "try eliminating dairy for a week", with a protocol and daily check-ins.

**Language rule we follow:** the app talks about *possible patterns* and *things associated with* your symptoms — never "the cause" or "your trigger".

---

## 4. The scores {#scores}

**H2:** What do the scores mean?

| Score | What it summarizes | What it doesn't mean |
|---|---|---|
| **Gut Health Score** (daily) | Your past 7 days of entries, weighted toward the most recent data (privacy policy definition). Inputs include your stool logs **[CONFIRM: list the inputs and how Bristol type, frequency, toilet time and symptoms are weighted, in plain terms]** | It isn't a medical test result, and a low score isn't a diagnosis. It can't detect disease |
| **Nutrition Score** (daily, and per food) | The nutritional quality of what you logged, including gut-relevant compounds; you can check a food's score before eating it **[CONFIRM: one-line method]** | It isn't personalized medical nutrition therapy, and it doesn't know your allergies unless you've told the app |
| **Regular Score** | **[CONFIRM: definition. Until confirmed, render only: "A third daily score shown alongside the other two."]** | — |
| **Gut-health streak** | Consecutive days in the Bristol 3–4 range; no-go days don't break it | Missing a day in range doesn't mean something is wrong |

**Why we explain this:** people told us (and competitors' reviews say loudly) that unexplained scores aren't useful. If a score surprises you, the Backlog shows the logs behind it. Full method: [how the Gut Health Score works](/science/gut-health-score). More background: [what is a gut health score?](/learn/gut-health-score-explained)

---

## 5. Limits {#limits}

**H2:** What can't the AI do?

- **It doesn't diagnose.** It can't tell you whether you have IBS, a food intolerance, celiac disease, inflammatory bowel disease or anything else. Those need a clinician, and sometimes tests [2][3].
- **It can misread photos.** Lighting, angle, sauces, hidden ingredients and portion size all affect meal estimates; lighting, mixed stool types and toilet-bowl water affect stool classification. Studies of the Bristol scale itself show people disagree most around types 2/3 and 5/6 [4] — the borderline cases are hard for software too. Published tests of general-purpose AI on meal photos found large errors in portion and nutrient estimates (see [below](#research)) [11][12].
- **Patterns aren't causes.** A food you eat every day will often appear "before" symptoms by coincidence. Delayed reactions, stress, sleep, your cycle and illness all blur the picture. Treat a pattern as a hypothesis, then test it. See [correlation or coincidence?](/learn/food-symptom-patterns)
- **It only knows what you log.** Gaps, late entries and guesses reduce accuracy.
- **Suggestions aren't medical advice.** Food and supplement suggestions are general. Check with a doctor or pharmacist before starting supplements, especially if you take medication, are pregnant or have a medical condition. Don't cut out several foods without guidance [3].
- **It doesn't spot emergencies.** It won't alert you to red-flag symptoms. If you have blood in your stool, black or tarry stools, severe or constant abdominal pain, unexplained weight loss, persistent vomiting, or high fever, contact a clinician or emergency services [5][6].
- **It's not a FODMAP database** and doesn't know a food's FODMAP content.

**Uncertainty:** **[CONFIRM: does the app show confidence or "not sure" states (e.g., "Food not recognized")? If yes, describe here.]** Since version 2.0.1, a bug that wrongly marked meals as "Food not recognized" was fixed.

---

## 5a. What published research says about AI and photos {#research}

**H2:** Can AI read a stool photo or a meal photo accurately?

*(Render as a bordered evidence box, same component as the topic-page study tables.)*

> **In short:** Researchers have tested AI on stool photos and meal photos, with mixed results. One stool-photo app agreed well with gastroenterologists in a small study, and general-purpose chatbots identified foods well but misjudged portions and nutrients. **These studies tested other systems, not Get Regular.** Get Regular hasn't published its own accuracy study, so we don't quote an accuracy figure for our app.

| Study | What was tested | What it found | What it doesn't tell you about Get Regular |
|---|---|---|---|
| Pimentel et al., *Am J Gastroenterol* 2022 [10] | A smartphone app's trained AI classifying stool photos on the Bristol scale, in adults with diarrhea-predominant IBS | In the validation phase (14 people), the AI agreed well with two expert gastroenterologists on Bristol type (intraclass correlation 0.78–0.85). It classified daily stool form as constipation, normal or diarrhea better than people's own reports. In a second phase (25 people), AI and self-reports agreed only moderately (0.61) | A different, purpose-trained app (one author is from Dieta Health, the company behind it). Small sample, one condition. Our stool classification uses OpenAI's API, not that model |
| O'Hara et al., *Nutrients* 2025 [11] | ChatGPT-4 estimating foods, weights and 16 nutrients from 114 meal photos from a national diet survey | Identified the foods well (93% precision) and ranked meals by nutrient content adequately. Estimated portion weight well only for small meals. Off by more than 10% for 13 of 16 nutrients, mostly underestimating | Tested the ChatGPT app with researchers' prompts. Get Regular's prompts, model version and setup differ **[CONFIRM: which OpenAI models Get Regular uses]** |
| Fridolfsson et al., *Curr Dev Nutr* 2025 [12] | ChatGPT-4o, Claude 3.5 Sonnet and Gemini 1.5 Pro on 52 standardized food photos in 3 portion sizes | ChatGPT and Claude were off by about 36% on average for energy (calories); Gemini was worse. All three underestimated more as portions got larger. The authors concluded these models aren't yet suitable for precise dietary assessment | Lab photos with plates and cutlery for scale, not real-life meal logs. Not our pipeline |
| Chotwanvirat et al., *J Med Internet Res* 2024 [13] | Scoping review of 84 studies (2008–2021) on AI dietary assessment from food images | Food recognition and portion estimation have improved, mostly through deep learning. Most systems were checked for calories and macronutrients; few could estimate micronutrients. The authors recommend involving dietitians in building these tools | Covers the field up to 2021, before today's chatbots |

**What this means for you:** treat Get Regular's meal estimates as a rough guide, especially for large or mixed dishes, and edit the ingredients when they look wrong. For stool, if the suggested type doesn't match what you saw, log the type yourself. A trend over several days tells you more than any single photo.

**What we haven't done (yet):** Get Regular hasn't tested its stool or meal classification against expert ratings or weighed meals, and hasn't published accuracy results. If we run such a study, the method and results will go on our [research program page](/science/research), including results that don't flatter us. We won't publish accuracy figures for our own app until that study exists.

Full synthesis: [AI, stool photos and meal photos: what the research says](/science/evidence/ai-stool-and-meal-photos)

---

## 6. Where your data goes {#data-flow}

**H2:** Where is my data processed?

**Answer:** Your logs are stored by Get Regular's infrastructure provider and sent to OpenAI's API for AI analysis. Per the privacy policy (8 June 2026):

**Data flow (render as a simple 4-box diagram, also as a list for no-JS/screen readers):**

1. **Your iPhone** → you log a meal, stool entry, symptom or chat message.
2. **Get Regular's backend (Supabase)** → stores your account and logs; encrypted in transit and at rest; row-level security and token-based authentication.
3. **OpenAI API** → receives the content needed for analysis: food photos, stool photos, text descriptions, symptoms, medications, supplements, dietary preferences and chat messages. The policy states that only anonymized content is sent — no names, emails or account identifiers — and that OpenAI does not use API inputs to train its models.
4. **Back to you** → the analysis result (ingredients, Bristol type, insight, answer) is saved to your account. **Photos are not permanently stored** on Get Regular's servers; only the analysis results are saved.

**Diagram brief:** Four rounded boxes left-to-right (iPhone → Get Regular backend → OpenAI API → results saved), arrows labelled "your log", "content for analysis (no name/email/account ID, per policy)", "result". Footnote: "Photos: analyzed, not permanently stored." Alt: "Diagram: your log goes from your iPhone to Get Regular's backend, content for analysis goes to OpenAI's API, and only the result is saved."

**About OpenAI's API (third-party facts, checked 19 Oct 2026):** OpenAI's own documentation says that data sent to its API is not used to train its models unless the customer opts in, and that API inputs and outputs may be retained for up to 30 days for abuse monitoring unless a zero-retention arrangement applies [7][8]. **[CONFIRM: which OpenAI models Get Regular uses, whether it has zero data retention, and that it hasn't opted in to data sharing. If zero retention applies, say so here.]**

**Other facts from the policy:**
- **Other processors:** Sentry (crash reports, no health data), PostHog (product analytics, no health data content), Apple (payments). Marketing tools are listed in the policy.
- **Advertising:** Get Regular states it does not sell, rent or share your personal or health information with advertisers.
- **No photos option:** log meals by text and stool by manual Bristol type, and no images are sent.
- **Deletion:** delete your account in the app; data is permanently removed within 30 days.
- **Your rights:** CCPA/CPRA, Washington My Health My Data Act, GDPR. Data may be transferred to the US.
- **Research consent:** version 2.0.0 added an optional research-consent setting. **[CONFIRM: what it covers; until then say only "optional; off unless you choose it" if that is true.]** More on the [research program page](/science/research).

> **[CONFIRM — blocks publishing]:** The App Store privacy label lists "Precise Location" and "Health & Fitness" data used for Analytics; the privacy policy doesn't mention location and says analytics contain no health data content. Fix the label or the policy, then add one sentence here matching the corrected label. Legal should also confirm that "anonymized" is accurate for photos and free text (privacy counsel may prefer "de-identified" or "sent without your name, email or account ID").

Full detail: [Privacy policy](/legal/privacy-policy) · [Terms of service](/legal/terms-of-service)

---

## 7. Clinical input {#clinical}

**H2:** Was a doctor involved?

Get Regular's clinical advisor is **Dr. Michael Schopis, MD**, a board-certified gastroenterologist. **[CONFIRM: role wording and consent to be named here — the role is a company claim on the homepage]**
- **What he reviewed:** **[CONFIRM: e.g., "the logic that maps stool logs to the Gut Health Score and the wording of insights", with dates]**
- **When:** **[CONFIRM: month/year of review(s)]**
- **Relationship:** **[CONFIRM: paid advisor / equity / unpaid — disclose]**
- **What this is not:** Get Regular has not published a clinical validation study. Advisor input is not clinical validation, and the app is not a medical device.

**Standards the app references:** the Bristol Stool Form Scale [1]. **[CONFIRM: any other guidance used — e.g., Rome V definitions or ACG/AGA guidelines — and name it here only if it's actually implemented.]**

Full details and disclosures: [who reviews our content](/science/clinical-review).

*(Internal note — do not render:* approved wording on every page is "built with input from a board-certified gastroenterologist" **[CONFIRM wording with Dr. Schopis]**; never use validation or "doctor-approved results" claims. Rome V replaced Rome IV in 2026 (Corsetti et al., PMID 41713703); name Rome V only if the app's logic was actually checked against it.*)*

---

## 8. How to report a mistake {#report}

**H2:** What if the AI gets something wrong?

- **Fix it in the app:** edit a meal's ingredients, re-log a stool entry by choosing the type manually, or edit a note. **[CONFIRM: entries can be edited/deleted after saving — a user review requested editing; confirm v2.x supports it.]**
- **Tell us:** email hello@getregular.com with "AI error" in the subject, the date and time of the entry, and what looked wrong. Please don't attach stool photos by email; describe the issue instead. **[CONFIRM: in-app feedback route, if any; response time.]**
- **If it's a health concern, not an app error:** contact your doctor. If it's urgent, call your local emergency number.

**CTA (`ct=how-ai-works`):** `Try it on your own logs — Download on the App Store` · Microcopy: `Free to download · Manual logging available, no photos required`

**Related:** [Get Regular facts, pricing and limits](/app) · [The science behind Get Regular](/science) · [How the Gut Health Score works](/science/gut-health-score) · [What AI can and can't tell you from food and poop logs](/learn/ai-gut-health-apps) · [Can an app analyze a photo of your poop?](/learn/poop-photo-analysis) · [Is your gut health app private?](/learn/gut-health-app-privacy)

*Get Regular is a wellness tracking app. It doesn't diagnose, treat or prevent any condition.*

---

## 9. Sources
1. Lewis SJ, Heaton KW. Stool form scale as a useful guide to intestinal transit time. *Scand J Gastroenterol*. 1997;32(9):920–924. doi:10.3109/00365529709011203. https://pubmed.ncbi.nlm.nih.gov/9299672/
2. NIDDK. Diagnosis of irritable bowel syndrome. https://www.niddk.nih.gov/health-information/digestive-diseases/irritable-bowel-syndrome/diagnosis
3. NHS. Food intolerance. https://www.nhs.uk/conditions/food-intolerance/
4. Blake MR, Raker JM, Whelan K. Validity and reliability of the Bristol Stool Form Scale in healthy adults and patients with diarrhoea-predominant irritable bowel syndrome. *Aliment Pharmacol Ther*. 2016;44(7):693–703. doi:10.1111/apt.13746. https://pubmed.ncbi.nlm.nih.gov/27492648/
5. NIDDK. Symptoms & causes of constipation. https://www.niddk.nih.gov/health-information/digestive-diseases/constipation/symptoms-causes
6. NIDDK. Symptoms & causes of diarrhea. https://www.niddk.nih.gov/health-information/digestive-diseases/diarrhea/symptoms-causes
7. OpenAI. Data controls in the OpenAI platform. https://developers.openai.com/api/docs/guides/your-data (checked 19 Oct 2026)
8. OpenAI. Enterprise privacy at OpenAI. https://openai.com/enterprise-privacy/ (checked 19 Oct 2026)
9. Get Regular. Privacy policy (last updated 8 June 2026). https://www.getregular.com/legal/privacy-policy
10. Pimentel M, Mathur R, Wang J, et al. A smartphone application using artificial intelligence is superior to subject self-reporting when assessing stool form. *Am J Gastroenterol*. 2022;117(7):1118–1124. doi:10.14309/ajg.0000000000001723. https://pubmed.ncbi.nlm.nih.gov/35288511/
11. O'Hara C, Kent G, Flynn AC, Gibney ER, Timon CM. An evaluation of ChatGPT for nutrient content estimation from meal photographs. *Nutrients*. 2025;17(4):607. doi:10.3390/nu17040607. https://pubmed.ncbi.nlm.nih.gov/40004936/
12. Fridolfsson J, Sjöberg E, Thiwång M, Pettersson S. Performance evaluation of 3 large language models for nutritional content estimation from food images. *Curr Dev Nutr*. 2025;9(10):107556. doi:10.1016/j.cdnut.2025.107556. https://pubmed.ncbi.nlm.nih.gov/41081011/
13. Chotwanvirat P, Prachansuwan A, Sridonpai P, Kriengsinyos W. Advancements in using AI for dietary assessment based on food images: scoping review. *J Med Internet Res*. 2024;26:e51432. doi:10.2196/51432. https://pubmed.ncbi.nlm.nih.gov/39546777/

<!-- WRITER NOTES: §1–§8 are carried from onpage/how-ai-works.md (structure and every [CONFIRM] kept). Changes: URL → /science/how-our-ai-works (/how-ai-works 301s here); /blog/<slug> → /learn/<slug>; /resources/bristol-stool-chart → /tools/bristol-stool-chart; new §5a evidence box; one added sentence in §5 Limits pointing to §5a; [CONFIRM] on the advisor's role (company claim). Numbers in §5a re-read from PubMed abstracts on 20 Oct 2026. Pimentel 2022: the author list includes A. Kraus of Dieta Health (the app studied); Fagan 2024 (PMID 38153339) shares that author — check the full-text conflict-of-interest statements before calling the stool-AI evidence independent. Apple Guideline 1.4.1: no accuracy figures for Get Regular's own model until validated. Once this page is live, onpage/how-ai-works.md is superseded; keep one source of truth. -->
