# Trust page copy: `/how-ai-works`

> Long-form trust page: what goes into the AI, what comes out, the limits, where data is processed and who was involved clinically. Server-rendered, no animation. Every product fact is from `research/product-fact-sheet.md` (19 Oct 2026); data-flow facts are from the Get Regular privacy policy (8 June 2026). **This page must not overstate anything the policy or the team hasn't confirmed.** **[CONFIRM: …]** items block publishing.

## 0. Header block

| Field | Value |
|---|---|
| URL | `https://www.getregular.com/how-ai-works` |
| review_status | `draft-needs-medical-review` + legal/privacy review (data-flow wording) |
| Primary keyword | how does get regular ai work |
| Owned variants | gut health ai, ai gut health app (methodology), gut health score method, get regular gut health score, is get regular accurate, get regular privacy openai |
| Search intent | Informational / trust (product-aware) |
| Title tag (51 chars) | `How Get Regular's AI Works: Inputs, Scores & Limits` |
| Meta description (157 chars) | `What Get Regular's AI does with your food, stool and symptom logs, what the scores summarize, where data is processed (OpenAI API), and the limits to know.` |
| H1 | How Get Regular's AI works |
| OG title | How Get Regular's AI works — and where it can be wrong |
| OG description | Inputs, outputs, scores, data flow and limits of the AI in the Get Regular gut health app, in plain language. |
| JSON-LD | `WebPage` (`@id` https://www.getregular.com/how-ai-works#webpage), `about` → `https://www.getregular.com/app#app`, `publisher` → `#org`, `dateModified`. Add `reviewedBy` (Person) + `lastReviewed` **only** if Dr. Schopis (or another clinician) actually reviews this page and consents. |
| App Store `ct` token | `how-ai-works` |
| Internal links out | "facts, pricing and limits" → `/app`; "privacy policy" → `/legal/privacy-policy`; "terms of service" → `/legal/terms-of-service`; "Bristol stool chart" → `/resources/bristol-stool-chart`; "poop tracker" → `/poop-tracker`; "food & symptom tracker" → `/food-symptom-tracker`; "what is a gut health score?" → `/blog/gut-health-score-explained`; "what AI can and can't tell you" → `/blog/ai-gut-health-apps`; "can an app analyze a poop photo?" → `/blog/poop-photo-analysis`; "is your gut health app private?" → `/blog/gut-health-app-privacy`; "correlation or coincidence?" → `/blog/food-symptom-patterns` |
| Pages that must link in | Homepage AI & privacy section + science section; `/app` (sections 5, 6, 8); all 3 product pages (privacy section); footer (all pages); C7 posts `gut-health-score-explained`, `ai-gut-health-apps`, `poop-photo-analysis`, `gut-health-app-privacy` |
| Visible dates | `Published: [set at publish] · Last updated: [date] · Reflects app version 2.0.1 and the privacy policy dated 8 June 2026` |

---

## 1. Summary (answer-first)

**H1:** How Get Regular's AI works

> **In short:** Get Regular uses AI to read what you log — meal photos and descriptions, stool photos, symptoms, drinks, medications and supplements — and to summarize your recent history as daily scores, a Weekly Digest of possible patterns, and answers in Gut Check chat. To do that, your logged content is sent to OpenAI's API for analysis. The AI can be wrong, it doesn't diagnose anything, and a pattern it finds is a hypothesis to test, not proof.

**On this page:** [What goes in](#inputs) · [What the AI does](#what-it-does) · [The scores](#scores) · [Limits](#limits) · [Where your data goes](#data-flow) · [Clinical input](#clinical) · [Report a mistake](#report)

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
2. **Classifies stool photos on the Bristol Stool Form Scale.** The Bristol scale is a 7-type chart of stool form, developed at the Bristol Royal Infirmary in the UK, that tracks with how fast stool moves through the gut [1]. If you'd rather not take photos, you choose the type yourself. **[CONFIRM: can users override the AI's suggested type?]**
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

**Why we explain this:** people told us (and competitors' reviews say loudly) that unexplained scores aren't useful. If a score surprises you, the Backlog shows the logs behind it. More background: [what is a gut health score?](/blog/gut-health-score-explained)

---

## 5. Limits {#limits}

**H2:** What can't the AI do?

- **It doesn't diagnose.** It can't tell you whether you have IBS, a food intolerance, celiac disease, inflammatory bowel disease or anything else. Those need a clinician, and sometimes tests [2][3].
- **It can misread photos.** Lighting, angle, sauces, hidden ingredients and portion size all affect meal estimates; lighting, mixed stool types and toilet-bowl water affect stool classification. Studies of the Bristol scale itself show people disagree most around types 2/3 and 5/6 [4] — the borderline cases are hard for software too.
- **Patterns aren't causes.** A food you eat every day will often appear "before" symptoms by coincidence. Delayed reactions, stress, sleep, your cycle and illness all blur the picture. Treat a pattern as a hypothesis, then test it. See [correlation or coincidence?](/blog/food-symptom-patterns)
- **It only knows what you log.** Gaps, late entries and guesses reduce accuracy.
- **Suggestions aren't medical advice.** Food and supplement suggestions are general. Check with a doctor or pharmacist before starting supplements, especially if you take medication, are pregnant or have a medical condition. Don't cut out several foods without guidance [3].
- **It doesn't spot emergencies.** It won't alert you to red-flag symptoms. If you have blood in your stool, black or tarry stools, severe or constant abdominal pain, unexplained weight loss, persistent vomiting, or high fever, contact a clinician or emergency services [5][6].
- **It's not a FODMAP database** and doesn't know a food's FODMAP content.

**Uncertainty:** **[CONFIRM: does the app show confidence or "not sure" states (e.g., "Food not recognized")? If yes, describe here.]** Since version 2.0.1, a bug that wrongly marked meals as "Food not recognized" was fixed.

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
- **Research consent:** version 2.0.0 added an optional research-consent setting. **[CONFIRM: what it covers; until then say only "optional; off unless you choose it" if that is true.]**

> **[CONFIRM — blocks publishing]:** The App Store privacy label lists "Precise Location" and "Health & Fitness" data used for Analytics; the privacy policy doesn't mention location and says analytics contain no health data content. Fix the label or the policy, then add one sentence here matching the corrected label. Legal should also confirm that "anonymized" is accurate for photos and free text (privacy counsel may prefer "de-identified" or "sent without your name, email or account ID").

Full detail: [Privacy policy](/legal/privacy-policy) · [Terms of service](/legal/terms-of-service)

---

## 7. Clinical input {#clinical}

**H2:** Was a doctor involved?

Get Regular's clinical advisor is **Dr. Michael Schopis, MD**, a board-certified gastroenterologist.
- **What he reviewed:** **[CONFIRM: e.g., "the logic that maps stool logs to the Gut Health Score and the wording of insights", with dates]**
- **When:** **[CONFIRM: month/year of review(s)]**
- **Relationship:** **[CONFIRM: paid advisor / equity / unpaid — disclose]**
- **What this is not:** Get Regular has not published a clinical validation study. Advisor input is not clinical validation, and the app is not a medical device.

**Standards the app references:** the Bristol Stool Form Scale [1]. **[CONFIRM: any other guidance used — e.g., Rome IV definitions or ACG/AGA guidelines — and name it here only if it's actually implemented.]**

Wording rule for every page: "built with input from a board-certified gastroenterologist" **[CONFIRM wording with Dr. Schopis]** — never "clinically validated" or "doctor-approved results".

---

## 8. How to report a mistake {#report}

**H2:** What if the AI gets something wrong?

- **Fix it in the app:** edit a meal's ingredients, re-log a stool entry by choosing the type manually, or edit a note. **[CONFIRM: entries can be edited/deleted after saving — a user review requested editing; confirm v2.x supports it.]**
- **Tell us:** email hello@getregular.com with "AI error" in the subject, the date and time of the entry, and what looked wrong. Please don't attach stool photos by email; describe the issue instead. **[CONFIRM: in-app feedback route, if any; response time.]**
- **If it's a health concern, not an app error:** contact your doctor. If it's urgent, call your local emergency number.

**CTA (`ct=how-ai-works`):** `Try it on your own logs — Download on the App Store` · Microcopy: `Free to download · Manual logging available, no photos required`

**Related:** [Get Regular facts, pricing and limits](/app) · [What AI can and can't tell you from food and poop logs](/blog/ai-gut-health-apps) · [Can an app analyze a photo of your poop?](/blog/poop-photo-analysis) · [Is your gut health app private?](/blog/gut-health-app-privacy)

*Get Regular is a wellness tracking app. It doesn't diagnose, treat or prevent any condition.*

---

## 9. Sources
1. Lewis SJ, Heaton KW. Stool form scale as a useful guide to intestinal transit time. *Scand J Gastroenterol*. 1997;32(9):920–924. https://pubmed.ncbi.nlm.nih.gov/9299672/
2. NIDDK. Diagnosis of irritable bowel syndrome. https://www.niddk.nih.gov/health-information/digestive-diseases/irritable-bowel-syndrome/diagnosis
3. NHS. Food intolerance. https://www.nhs.uk/conditions/food-intolerance/
4. Blake MR, Raker JM, Whelan K. Validity and reliability of the Bristol Stool Form Scale in healthy adults and patients with diarrhoea-predominant irritable bowel syndrome. *Aliment Pharmacol Ther*. 2016;44(7):693–703. https://pubmed.ncbi.nlm.nih.gov/27492648/
5. NIDDK. Symptoms & causes of constipation. https://www.niddk.nih.gov/health-information/digestive-diseases/constipation/symptoms-causes
6. NIDDK. Symptoms & causes of diarrhea. https://www.niddk.nih.gov/health-information/digestive-diseases/diarrhea/symptoms-causes
7. OpenAI. Data controls in the OpenAI platform. https://developers.openai.com/api/docs/guides/your-data (checked 19 Oct 2026)
8. OpenAI. Enterprise privacy at OpenAI. https://openai.com/enterprise-privacy/ (checked 19 Oct 2026)
9. Get Regular. Privacy policy (last updated 8 June 2026). https://www.getregular.com/legal/privacy-policy
