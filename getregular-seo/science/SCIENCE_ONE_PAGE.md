# Get Regular /science: one-page summary (20 Oct 2026)

**What it is:** a ZOE-style science section, rebuilt for a startup with no studies of its own yet. It's built on published guidelines and studies, every one checked against PubMed. It's honest about limits: no "clinically validated", no diagnosis, no invented norms. All pages are drafts awaiting a named clinician's review.

## The section at a glance

| | |
|---|---|
| Pages | 5 trust pages + 13 research pages + 1 evidence library |
| Studies in the library | **82**, all pulled from PubMed: 7 guidelines · 7 systematic reviews · 9 randomized trials · 6 clinical studies · 9 reviews · 43 other studies · 1 retracted (flagged) |
| Verification | Every number on every page re-read from the study abstract on 20 Oct 2026 |
| Open items | [CONFIRM] flags for product facts (score weights, research consent), the advisor's consent, and a clinician review |

## 1. Trust pages (why people should believe us)

| Page | What it says |
|---|---|
| **The science behind Get Regular** `/science` | We track 4 things doctors use (stool form, frequency, meals, symptoms), each with a citation. Links to everything below. A "what we don't claim" box: no studies of our own, nothing validated, no diagnosis. |
| **How our AI works** | What goes in, what the AI does, what the scores mean, its limits, and where data goes (OpenAI API). Includes a box on published AI-photo research, which tested *other* apps, not ours. |
| **How the Gut Health Score works** | 7-day weighted score per the privacy policy, what raises or lowers it, and what it isn't. Weights left as [CONFIRM]. |
| **Who reviews our content** | Advisor card (credentials, what he reviewed, pay disclosure). It goes live only with his consent. |
| **Our research program** | "No results yet." What the in-app research consent will cover, privacy principles, and the path to validating the quiz score (ZOE did this for MenoScale). |

## 2. Thirteen "What the research says" pages (traffic + AI citations)

| Topic | Short answer (from the page) |
|---|---|
| **Bristol Stool Scale** | Stool type tracks gut transit time better than frequency does; people pick the right type 81% of the time, less often at the borders. |
| **How often should you poop** | 95.9% of US adults with normal habits go 3–21 times a week (NHANES). Once a day is common but not the rule. |
| **Gut transit time** | No single normal: 12–120 hours whole-gut in healthy adults; women tend to be slower. |
| **Fiber and constipation** | Helps some people, not all. The guideline gives fiber a *conditional* recommendation; psyllium has the best evidence. |
| **Food diaries vs memory** | Memory agrees poorly with diaries. A diary finds patterns, but a suspected trigger still needs a test. |
| **Lactose intolerance** | Malabsorbing lactose isn't the same as being intolerant; most people tolerate about 1 cup of milk. True prevalence is unknown. |
| **Gluten without celiac** | In blinded trials gluten triggers symptoms in a minority. Sham reactions happened at 29% vs 36% for gluten. Test for celiac first. |
| **Low FODMAP and IBS diet** | The most-studied IBS diet; the ACG "recommends a limited trial". Evidence quality is mostly low. |
| **Stress and IBS** | Higher-than-usual stress came with worse symptoms the same day (357 adults, 2026). It's an association; the ACG suggests gut-directed therapy. |
| **Food poisoning and IBS** | 10.1% develop IBS within a year of a gut infection, a 4.2× higher risk. |
| **Bloating** | Bloating (the feeling) differs from distension (size). 13.9% of 88,795 Americans had it in the past week. Many causes. |
| **Gut microbiome tests** | Not useful for diagnosis yet (2025 consensus). The same sample sent to 7 companies gave results as different as different people's. |
| **AI stool and meal photos** | Promising small studies, but all stool-AI studies had authors tied to the app maker. Meal AI names foods well but underestimates portions. Get Regular hasn't published its own accuracy study. |

## 3. Evidence library `/science/evidence`

Every study we cite, grouped strongest first (guidelines → reviews → trials → studies), each linking PubMed. It's generated from data, not typed: `build_evidence_library.py` pulls records from PubMed, and `build_evidence_index.py` writes the page.

## What we caught along the way

- **A retracted study:** the "two-thirds of adults are lactose intolerant" figure (Storhaug 2017) was retracted in January 2025. It's removed from 2 existing drafts, and the library now flags retractions automatically.
- **Conflicts of interest:** the AI stool studies were run with the app makers (Dieta, Coprata); the blue-dye transit study was ZOE-funded; several microbiome-consensus authors have industry ties. Every page discloses these.
- **Rome V (2026)** replaces Rome IV; pages cite it, and the thresholds are flagged for the clinician.

## Before it can go live

1. A named gastroenterologist reviews and signs every page (consent needed for `reviewedBy`).
2. Product answers: Gut Health Score inputs and weights, Nutrition and Regular Score definitions, and what research consent covers.
3. The advisor's approval to be named, plus his pay or equity disclosure.

Files: `getregular-seo/science/` (pages), `science/evidence/` (13 topics + library), `science/README.md` (spec and status).
