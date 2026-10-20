---
title: "The Research We Use: Get Regular's Evidence Library"
slug: evidence
url: /science/evidence
description: "Every study Get Regular's articles and tools cite, from PubMed: guidelines, reviews, trials and studies on stool, IBS, bloating, food and gut apps."
primary_keyword: gut health research library
secondary_keywords: [gut health studies, ibs research studies, bristol stool scale research, constipation studies]
hub: /science
template: science-evidence-library
schema_type: CollectionPage
review_status: draft-needs-medical-review
medical_reviewer: PENDING
date_published: null
date_updated: null
sources_checked: 2026-10-20   # bibliographic data pulled from NCBI E-utilities on this date
---

# The research we use

> **In short:** This is every study our articles, tools and science pages cite. Each record was pulled from PubMed, the US National Library of Medicine's database, not typed by hand. We put clinical guidelines first, then systematic reviews, then trials, then individual studies. Get Regular hasn't run or published any studies of its own yet, so none of these are ours.

**Title tag (58 chars):** `Gut Health Research Library: Studies We Cite | Get Regular`
**Meta description (147 chars):** `Every study Get Regular's articles and tools cite, from PubMed: guidelines, reviews, trials and studies on stool, IBS, bloating, food and gut apps.`

**Last updated:** [SET AT BUILD] · **Studies:** generated count below · **Bibliographic data from:** PubMed (NCBI E-utilities)

---

## What this page is

This is the library behind everything we write about digestion. When an article says "most people go between three times a day and three times a week" or "fiber helps some people with constipation," the study behind that sentence is listed here with a link to its PubMed record, so you can read the abstract yourself.

Three things to know before you browse:

1. **None of these are Get Regular studies.** We haven't published research of our own. When we do, it will appear on [our research program page](/science/research) and be labeled as ours.
2. **A study being listed here doesn't mean it proves something about the Get Regular app.** For example, the AI studies in this library tested other apps and general-purpose chatbots, not ours. See [how our AI works](/science/how-our-ai-works).
3. **The short answers live on the topic pages.** This page is the reference list. For a plain-language summary of what a group of studies shows, start with the [topic syntheses](#topics).

## How we choose evidence {#how-we-choose}

We use the strongest kind of evidence that answers the question, in this order:

| Order | Evidence type | What it is | How we use it |
|---|---|---|---|
| 1 | **Clinical guidelines and consensus statements** | Recommendations from professional bodies such as the American College of Gastroenterology (ACG) and American Gastroenterological Association (AGA), usually built on systematic reviews | First source for "what should I do?" We quote the strength of a recommendation as the guideline states it (for example, "conditional" vs "strong") |
| 2 | **Systematic reviews and meta-analyses** | Studies that gather and pool the results of many earlier studies | Prevalence ("how common is…") and overall effect sizes |
| 3 | **Randomized trials** | People are randomly assigned to a treatment or a comparison | Whether a specific change (a fiber, a food) does something |
| 4 | **Other studies** | Clinical, observational, population and validation studies | Normal ranges, how measurement tools perform, how often things happen |
| 5 | **Narrative reviews** | Expert summaries of a field | Background and mechanisms, never as the only support for a number |

**Our rules:**

- **Every record is checked against PubMed.** Titles, authors, journals, years and DOIs come from PubMed's records through `science/build_evidence_library.py`. Nobody types them in.
- **We read the abstract before we use a number,** and we re-read it each time a page is reviewed. The date we last checked is shown on each topic page.
- **We say what a study can't show.** Small samples, healthy volunteers, short follow-up, a single clinic, or authors who work for the company whose product is tested all go in the "limits" column on topic pages.
- **Guidelines beat single studies.** If one exciting study disagrees with a current guideline, we report both and say which one we'd weigh more.
- **Evidence-type labels come from PubMed's publication types,** not from our own grading. A label tells you what kind of study it is, not how good it is.
- **We remove or update studies** when a newer guideline replaces them (for example, citing Rome V instead of Rome IV for bowel-disorder criteria from 2026 on).

Found a citation that doesn't say what we say it says? Tell us at hello@getregular.com with "Evidence error" in the subject. See [how we handle corrections](/science/clinical-review#report-an-error).

## Browse by topic or evidence type {#filters}

The live page shows two rows of filter chips above the study cards. Filters work without JavaScript as plain links (`?topic=ibs&type=guideline`), so every filtered view is crawlable.

- **Topic** (the 8 Learn hubs): Poop & stool · Food & symptoms · IBS · Bloating · Constipation · Diarrhea · Gut health apps · Doctor visits. A study appears under every hub whose articles cite it.
- **Evidence type:** Guideline · Systematic review · Randomized trial · Clinical study · Review · Study.

**Each study card shows:** title, first author, journal, year, evidence type, "used in" links to the pages that cite it, and links to PubMed and the DOI. Cards are sorted by evidence type, then newest first.

*(Build note, do not render: cards and filters are generated from `science/evidence-library.json`. The tables below are the static, no-JS fallback and the source for the `ItemList` JSON-LD.)*

## Topic syntheses {#topics}

Plain-language answers built on the studies below. Each page has a short answer, a study table with limits, what guidelines recommend and what's still uncertain.

| Topic page | What it answers |
|---|---|
| [The Bristol Stool Scale](/science/evidence/bristol-stool-scale) | How well the 7 stool types track gut transit time, and where people disagree when they classify stool |
| [How often should you poop?](/science/evidence/how-often-should-you-poop) | What population studies say about the normal range of bowel frequency, and where "3 and 3" comes from |
| [Gut transit time](/science/evidence/gut-transit-time) | How long food takes to pass through the gut, measured with capsules, markers and blue dye |
| [Fiber and constipation](/science/evidence/fiber-and-constipation) | What the 2023 AGA–ACG guideline and trials say about fiber, which type has the best evidence, and when it doesn't help |
| [Food diaries vs memory](/science/evidence/food-diaries-vs-memory) | Why symptoms logged at the time can tell a different story than symptoms recalled later |
| [Lactose intolerance](/science/evidence/lactose-intolerance) | How common lactose malabsorption is, how it differs from intolerance, and its link with IBS |
| [Gluten without celiac disease](/science/evidence/gluten-without-celiac) | What blinded challenge trials show about non-celiac gluten and wheat sensitivity |
| [IBS diet guidelines](/science/evidence/ibs-diet-guidelines) | What ACG guidance and Rome V say about diet, including low FODMAP, for IBS |
| [Stress and IBS](/science/evidence/stress-and-ibs) | What daily-diary and review studies show about stress and IBS symptoms |
| [Post-infectious IBS](/science/evidence/post-infectious-ibs) | How often IBS follows a bout of food poisoning or gastroenteritis, and who is at higher risk |
| [Bloating research](/science/evidence/bloating-research) | How common bloating is, why bloating and visible distension aren't the same, and what AGA guidance recommends |
| [Gut microbiome tests](/science/evidence/gut-microbiome-tests) | What the 2025 international consensus says about direct-to-consumer microbiome testing |
| [AI, stool photos and meal photos](/science/evidence/ai-stool-and-meal-photos) | What published studies show about AI reading stool photos and estimating nutrients from meal photos, and what they don't show about any one app |

## The full library {#library}

<!-- LIBRARY:START -->

_Generated from `science/evidence-library.csv` by `science/build_evidence_index.py`: 82 studies. Do not edit by hand._

### Guideline (7)

Clinical practice guidelines and consensus statements from professional bodies.

| Title | First author | Journal | Year | Topics | PubMed |
|---|---|---|---|---|---|
| International consensus statement on microbiome testing in clinical practice | Porcari S | *Lancet Gastroenterol Hepatol* | 2025 | gut-health-apps | [PMID 39647502](https://pubmed.ncbi.nlm.nih.gov/39647502/) |
| American Gastroenterological Association-American College of Gastroenterology Clinical Practice Guideline: Pharmacological Management of Chronic Idiopathic Constipation | Chang L | *Am J Gastroenterol* | 2023 | general | [PMID 37204227](https://pubmed.ncbi.nlm.nih.gov/37204227/) |
| AGA Clinical Practice Update on Evaluation and Management of Belching, Abdominal Bloating, and Distention: Expert Review | Moshiree B | *Gastroenterology* | 2023 | bloating | [PMID 37452811](https://pubmed.ncbi.nlm.nih.gov/37452811/) |
| ACG Clinical Guideline: Management of Irritable Bowel Syndrome | Lacy BE | *Am J Gastroenterol* | 2021 | poop, ibs, bloating, gut-health-apps | [PMID 33315591](https://pubmed.ncbi.nlm.nih.gov/33315591/) |
| ACG Clinical Guideline: Small Intestinal Bacterial Overgrowth | Pimentel M | *Am J Gastroenterol* | 2020 | bloating | [PMID 32023228](https://pubmed.ncbi.nlm.nih.gov/32023228/) |
| Rome Foundation Working Team Report on Post-Infection Irritable Bowel Syndrome | Barbara G | *Gastroenterology* | 2019 | ibs | [PMID 30009817](https://pubmed.ncbi.nlm.nih.gov/30009817/) |
| Guidelines for the investigation of chronic diarrhoea in adults: British Society of Gastroenterology, 3rd edition | Arasaradnam RP | *Gut* | 2018 | general | [PMID 29653941](https://pubmed.ncbi.nlm.nih.gov/29653941/) |

### Systematic review / meta-analysis (7)

Studies that pool the results of many earlier studies.

| Title | First author | Journal | Year | Topics | PubMed |
|---|---|---|---|---|---|
| Efficacy of dietary interventions in irritable bowel syndrome: a systematic review and network meta-analysis | Cuffe MS | *Lancet Gastroenterol Hepatol* | 2025 | ibs | [PMID 40258374](https://pubmed.ncbi.nlm.nih.gov/40258374/) |
| Global prevalence of functional constipation according to the Rome criteria: a systematic review and meta-analysis | Barberio B | *Lancet Gastroenterol Hepatol* | 2021 | general | [PMID 34090581](https://pubmed.ncbi.nlm.nih.gov/34090581/) |
| Lactose intolerance but not lactose maldigestion is more frequent in patients with irritable bowel syndrome than in healthy controls: A meta-analysis | Varjú P | *Neurogastroenterol Motil* | 2019 | ibs | [PMID 30560578](https://pubmed.ncbi.nlm.nih.gov/30560578/) |
| A Systematic Review and Meta-Analysis Evaluating the Efficacy of a Gluten-Free Diet and a Low FODMAPs Diet in Treating Symptoms of Irritable Bowel Syndrome | Dionne J | *Am J Gastroenterol* | 2018 | ibs | [PMID 30046155](https://pubmed.ncbi.nlm.nih.gov/30046155/) |
| Prevalence, Risk Factors, and Outcomes of Irritable Bowel Syndrome After Infectious Enteritis: A Systematic Review and Meta-analysis | Klem F | *Gastroenterology* | 2017 | food-and-symptoms, ibs | [PMID 28069350](https://pubmed.ncbi.nlm.nih.gov/28069350/) |
| Systematic review: effective management strategies for lactose intolerance | Shaukat A | *Ann Intern Med* | 2010 | food-and-symptoms, bloating | [PMID 20404262](https://pubmed.ncbi.nlm.nih.gov/20404262/) |
| NIH consensus development conference statement: Lactose intolerance and health | Suchy FJ | *NIH Consens State Sci Statements* | 2010 | food-and-symptoms | [PMID 20186234](https://pubmed.ncbi.nlm.nih.gov/20186234/) |

### Randomized trial (9)

Studies PubMed indexes as randomized controlled trials.

| Title | First author | Journal | Year | Topics | PubMed |
|---|---|---|---|---|---|
| Effect of gluten and wheat on symptoms and behaviours in adults with irritable bowel syndrome: a single-centre, randomised, double-blind, sham-controlled crossover trial | Seiler CL | *Lancet Gastroenterol Hepatol* | 2025 | food-and-symptoms | [PMID 40706614](https://pubmed.ncbi.nlm.nih.gov/40706614/) |
| Contrasting effects of viscous and particulate fibers on colonic fermentation in vitro and in vivo, and their impact on intestinal water studied by MRI in a randomized trial | Gunn D | *Am J Clin Nutr* | 2020 | bloating | [PMID 32619212](https://pubmed.ncbi.nlm.nih.gov/32619212/) |
| Fructan, Rather Than Gluten, Induces Symptoms in Patients With Self-Reported Non-Celiac Gluten Sensitivity | Skodje GI | *Gastroenterology* | 2018 | general | [PMID 29102613](https://pubmed.ncbi.nlm.nih.gov/29102613/) |
| No effects of gluten in patients with self-reported non-celiac gluten sensitivity after dietary reduction of fermentable, poorly absorbed, short-chain carbohydrates | Biesiekierski JR | *Gastroenterology* | 2013 | food-and-symptoms, bloating | [PMID 23648697](https://pubmed.ncbi.nlm.nih.gov/23648697/) |
| Gastrointestinal tolerance of chicory inulin products | Bonnema AL | *J Am Diet Assoc* | 2010 | bloating | [PMID 20497775](https://pubmed.ncbi.nlm.nih.gov/20497775/) |
| Gastrointestinal distress after creatine supplementation in athletes: are side effects dose dependent? | Ostojic SM | *Res Sports Med* | 2008 | bloating | [PMID 18373286](https://pubmed.ncbi.nlm.nih.gov/18373286/) |
| Influence of body posture on intestinal transit of gas | Dainese R | *Gut* | 2003 | bloating | [PMID 12801953](https://pubmed.ncbi.nlm.nih.gov/12801953/) |
| Intolerance of cow's milk and chronic constipation in children | Iacono G | *N Engl J Med* | 1998 | constipation | [PMID 9770556](https://pubmed.ncbi.nlm.nih.gov/9770556/) |
| Stool form scale as a useful guide to intestinal transit time | Lewis SJ | *Scand J Gastroenterol* | 1997 | poop, food-and-symptoms, constipation, gut-health-apps, doctor-visits | [PMID 9299672](https://pubmed.ncbi.nlm.nih.gov/9299672/) |

### Clinical study (6)

Clinical trials, validation, comparative and observational studies (by PubMed publication type).

| Title | First author | Journal | Year | Topics | PubMed |
|---|---|---|---|---|---|
| Customized multimodal Diabot-GPT-4o enhances accuracy of image-based dietary assessments in dietetic trainees in Taiwan: validation against weighed food records | Chen YJ | *Am J Clin Nutr* | 2025 | gut-health-apps | [PMID 41138916](https://pubmed.ncbi.nlm.nih.gov/41138916/) |
| Gastrointestinal recall questionnaires compare poorly with prospective patient diaries for gastrointestinal symptoms: data from population and primary health centre samples | Jones MP | *Eur J Gastroenterol Hepatol* | 2019 | doctor-visits | [PMID 30394943](https://pubmed.ncbi.nlm.nih.gov/30394943/) |
| Validity and reliability of the Bristol Stool Form Scale in healthy adults and patients with diarrhoea-predominant irritable bowel syndrome | Blake MR | *Aliment Pharmacol Ther* | 2016 | poop | [PMID 27492648](https://pubmed.ncbi.nlm.nih.gov/27492648/) |
| Regional gastrointestinal transit and pH studied in 215 healthy volunteers using the wireless motility capsule: influence of age, gender, study country and testing protocol | Wang YT | *Aliment Pharmacol Ther* | 2015 | poop | [PMID 26223837](https://pubmed.ncbi.nlm.nih.gov/26223837/) |
| Ambulatory 24-h colonic manometry in healthy humans | Rao SS | *Am J Physiol Gastrointest Liver Physiol* | 2001 | bloating | [PMID 11254489](https://pubmed.ncbi.nlm.nih.gov/11254489/) |
| Simplified assessment of segmental colonic transit | Metcalf AM | *Gastroenterology* | 1987 | poop | [PMID 3023168](https://pubmed.ncbi.nlm.nih.gov/3023168/) |

### Review (9)

Narrative and expert reviews.

| Title | First author | Journal | Year | Topics | PubMed |
|---|---|---|---|---|---|
| Bowel Disorders | Corsetti M | *Gastroenterology* | 2026 | ibs | [PMID 41713703](https://pubmed.ncbi.nlm.nih.gov/41713703/) |
| What is new in Rome V?: Redefining diagnostic criteria and clinical pathways in disorders of gut-brain interaction | Goyal MK | *Indian J Gastroenterol* | 2026 | ibs | [PMID 42753081](https://pubmed.ncbi.nlm.nih.gov/42753081/) |
| Common questions and misconceptions about creatine supplementation: what does the scientific evidence really show? | Antonio J | *J Int Soc Sports Nutr* | 2021 | bloating | [PMID 33557850](https://pubmed.ncbi.nlm.nih.gov/33557850/) |
| Management of Chronic Abdominal Distension and Bloating | Lacy BE | *Clin Gastroenterol Hepatol* | 2021 | bloating | [PMID 32246999](https://pubmed.ncbi.nlm.nih.gov/32246999/) |
| Update on lactose malabsorption and intolerance: pathogenesis, diagnosis and clinical management | Misselwitz B | *Gut* | 2019 | bloating | [PMID 31427404](https://pubmed.ncbi.nlm.nih.gov/31427404/) |
| New mobile methods for dietary assessment: review of image-assisted and image-based dietary assessment methods | Boushey CJ | *Proc Nutr Soc* | 2017 | food-and-symptoms | [PMID 27938425](https://pubmed.ncbi.nlm.nih.gov/27938425/) |
| Bloating and Abdominal Distension: Old Misconceptions and Current Knowledge | Malagelada JR | *Am J Gastroenterol* | 2017 | bloating | [PMID 28508867](https://pubmed.ncbi.nlm.nih.gov/28508867/) |
| Impact of psychological stress on irritable bowel syndrome | Qin HY | *World J Gastroenterol* | 2014 | ibs | [PMID 25339801](https://pubmed.ncbi.nlm.nih.gov/25339801/) |
| Fiber and functional gastrointestinal disorders | Eswaran S | *Am J Gastroenterol* | 2013 | bloating | [PMID 23545709](https://pubmed.ncbi.nlm.nih.gov/23545709/) |

### Study (43)

Other original research, including surveys and population studies.

| Title | First author | Journal | Year | Topics | PubMed |
|---|---|---|---|---|---|
| Evaluating the analytical performance of direct-to-consumer gut microbiome testing services | Servetas SL | *Commun Biol* | 2026 | gut-health-apps | [PMID 41748906](https://pubmed.ncbi.nlm.nih.gov/41748906/) |
| Comparison of demographic, clinical, and psychological characteristics among patients with irritable bowel syndrome meeting the Rome clinical, Rome V, and Rome IV criteria | Wu J | *Am J Gastroenterol* | 2026 | ibs | [PMID 42754968](https://pubmed.ncbi.nlm.nih.gov/42754968/) |
| Beyond Chronic Stress: Daily Stress Is Associated With Symptoms in Irritable Bowel Syndrome | Yunusova A | *Clin Gastroenterol Hepatol* | 2026 | ibs | [PMID 42150709](https://pubmed.ncbi.nlm.nih.gov/42150709/) |
| Retraction-Country, regional, and global estimates for lactose malabsorption in adults: a systematic review and meta-analysis |  | *Lancet Gastroenterol Hepatol* | 2025 | general | [PMID 39674208](https://pubmed.ncbi.nlm.nih.gov/39674208/) |
| Performance Evaluation of 3 Large Language Models for Nutritional Content Estimation from Food Images | Fridolfsson J | *Curr Dev Nutr* | 2025 | gut-health-apps | [PMID 41081011](https://pubmed.ncbi.nlm.nih.gov/41081011/) |
| An Evaluation of ChatGPT for Nutrient Content Estimation from Meal Photographs | O'Hara C | *Nutrients* | 2025 | gut-health-apps | [PMID 40004936](https://pubmed.ncbi.nlm.nih.gov/40004936/) |
| Long-term, automated stool monitoring using a novel smart toilet: A feasibility study | Zhou J | *Neurogastroenterol Motil* | 2025 | gut-health-apps | [PMID 39486001](https://pubmed.ncbi.nlm.nih.gov/39486001/) |
| Advancements in Using AI for Dietary Assessment Based on Food Images: Scoping Review | Chotwanvirat P | *J Med Internet Res* | 2024 | gut-health-apps | [PMID 39546777](https://pubmed.ncbi.nlm.nih.gov/39546777/) |
| Artificial Intelligence Evaluation of Stool Quality Guides Management of Hepatic Encephalopathy Using a Smartphone App | Fagan A | *Am J Gastroenterol* | 2024 | gut-health-apps | [PMID 38153339](https://pubmed.ncbi.nlm.nih.gov/38153339/) |
| Microbiome testing in Europe: navigating analytical, ethical and regulatory challenges | Rodriguez J | *Microbiome* | 2024 | gut-health-apps | [PMID 39695869](https://pubmed.ncbi.nlm.nih.gov/39695869/) |
| Prevalence and Burden of Illness of Rome IV Irritable Bowel Syndrome in the United States: Results From a Nationwide Cross-Sectional Study | Almario CV | *Gastroenterology* | 2023 | ibs | [PMID 37595647](https://pubmed.ncbi.nlm.nih.gov/37595647/) |
| Abdominal Bloating in the United States: Results of a Survey of 88,795 Americans Examining Prevalence and Healthcare Seeking | Oh JE | *Clin Gastroenterol Hepatol* | 2023 | bloating | [PMID 36396061](https://pubmed.ncbi.nlm.nih.gov/36396061/) |
| American College of Gastroenterology Guidelines Update: Diagnosis and Management of Celiac Disease | Rubio-Tapia A | *Am J Gastroenterol* | 2023 | bloating | [PMID 36602836](https://pubmed.ncbi.nlm.nih.gov/36602836/) |
| Fishing for Irritable Bowel Syndrome: Which Alarm Features Weave the Best Net? | Brandler J | *Clin Gastroenterol Hepatol* | 2022 | general | [PMID 33220527](https://pubmed.ncbi.nlm.nih.gov/33220527/) |
| A Smartphone Application Using Artificial Intelligence Is Superior To Subject Self-Reporting When Assessing Stool Form | Pimentel M | *Am J Gastroenterol* | 2022 | poop, gut-health-apps | [PMID 35288511](https://pubmed.ncbi.nlm.nih.gov/35288511/) |
| Blue poo: impact of gut transit time on the gut microbiome using a novel marker | Asnicar F | *Gut* | 2021 | poop | [PMID 33722860](https://pubmed.ncbi.nlm.nih.gov/33722860/) |
| Worldwide Prevalence and Burden of Functional Gastrointestinal Disorders, Results of Rome Foundation Global Study | Sperber AD | *Gastroenterology* | 2021 | general | [PMID 32294476](https://pubmed.ncbi.nlm.nih.gov/32294476/) |
| Normative values for region-specific colonic and gastrointestinal transit times in 111 healthy volunteers using the 3D-Transit electromagnet tracking system: Influence of age, gender, and body mass index | Nandhra GK | *Neurogastroenterol Motil* | 2020 | poop | [PMID 31565841](https://pubmed.ncbi.nlm.nih.gov/31565841/) |
| Chronic Constipation in the United States: Results From a Population-Based Survey Assessing Healthcare Seeking and Use of Pharmacotherapy | Oh SJ | *Am J Gastroenterol* | 2020 | constipation | [PMID 32324606](https://pubmed.ncbi.nlm.nih.gov/32324606/) |
| Prevalence of Rome IV Functional Bowel Disorders Among Adults in the United States, Canada, and the United Kingdom | Palsson OS | *Gastroenterology* | 2020 | ibs | [PMID 31917991](https://pubmed.ncbi.nlm.nih.gov/31917991/) |
| Characterizing Normal Bowel Frequency and Consistency in a Representative Sample of Adults in the United States (NHANES) | Mitsuhashi S | *Am J Gastroenterol* | 2018 | poop | [PMID 28762379](https://pubmed.ncbi.nlm.nih.gov/28762379/) |
| Suspected Nonceliac Gluten Sensitivity Confirmed in Few Patients After Gluten Challenge in Double-Blind, Placebo-Controlled Trials | Molina-Infante J | *Clin Gastroenterol Hepatol* | 2017 | general | [PMID 27523634](https://pubmed.ncbi.nlm.nih.gov/27523634/) |
| Bowel Disorders | Mearin F | *Gastroenterology* | 2016 | poop, ibs | [PMID 27144627](https://pubmed.ncbi.nlm.nih.gov/27144627/) |
| Feasibility and Usability Pilot Study of a Novel Irritable Bowel Syndrome Food and Gastrointestinal Symptom Journal Smartphone App | Zia J | *Clin Transl Gastroenterol* | 2016 | general | [PMID 26938478](https://pubmed.ncbi.nlm.nih.gov/26938478/) |
| Anal gas evacuation and colonic microbiota in patients with flatulence: effect of diet | Manichanh C | *Gut* | 2014 | bloating | [PMID 23766444](https://pubmed.ncbi.nlm.nih.gov/23766444/) |
| Self-reported food-related gastrointestinal symptoms in IBS are common and associated with more severe symptoms and reduced quality of life | Böhn L | *Am J Gastroenterol* | 2013 | food-and-symptoms | [PMID 23644955](https://pubmed.ncbi.nlm.nih.gov/23644955/) |
| Abdomino-phrenic dyssynergia in patients with abdominal bloating and distension | Villoria A | *Am J Gastroenterol* | 2011 | bloating | [PMID 21540894](https://pubmed.ncbi.nlm.nih.gov/21540894/) |
| Prospective diary evaluation of unexplained abdominal pain and bowel dysfunction: a population-based colonoscopy study | Walter SA | *Dig Dis Sci* | 2011 | poop | [PMID 21063776](https://pubmed.ncbi.nlm.nih.gov/21063776/) |
| Relationship of abdominal bloating to distention in irritable bowel syndrome and effect of bowel habit | Houghton LA | *Gastroenterology* | 2006 | bloating | [PMID 17030170](https://pubmed.ncbi.nlm.nih.gov/17030170/) |
| The perceived effect of various foods and beverages on stool consistency | Müller-Lissner SA | *Eur J Gastroenterol Hepatol* | 2005 | constipation | [PMID 15647650](https://pubmed.ncbi.nlm.nih.gov/15647650/) |
| Creatine Supplementation Increases Total Body Water Without Altering Fluid Distribution | Powers ME | *J Athl Train* | 2003 | bloating | [PMID 12937471](https://pubmed.ncbi.nlm.nih.gov/12937471/) |
| A population-based study on bowel habits in a Swedish community: prevalence of faecal incontinence and constipation | Walter S | *Scand J Gastroenterol* | 2002 | poop | [PMID 12229965](https://pubmed.ncbi.nlm.nih.gov/12229965/) |
| Food-related gastrointestinal symptoms in the irritable bowel syndrome | Simrén M | *Digestion* | 2001 | bloating | [PMID 11244249](https://pubmed.ncbi.nlm.nih.gov/11244249/) |
| The relationship between psychological distress and gastrointestinal symptoms in women with irritable bowel syndrome | Jarrett M | *Nurs Res* | 1998 | ibs | [PMID 9610649](https://pubmed.ncbi.nlm.nih.gov/9610649/) |
| The relationship between daily life stress and gastrointestinal symptoms in women with irritable bowel syndrome | Levy RL | *J Behav Med* | 1997 | ibs | [PMID 9144039](https://pubmed.ncbi.nlm.nih.gov/9144039/) |
| Clinical response to dietary fiber treatment of chronic constipation | Voderholzer WA | *Am J Gastroenterol* | 1997 | constipation | [PMID 8995945](https://pubmed.ncbi.nlm.nih.gov/8995945/) |
| Variability of gastrointestinal transit in healthy women and men | Degen LP | *Gut* | 1996 | poop | [PMID 8977347](https://pubmed.ncbi.nlm.nih.gov/8977347/) |
| How well does stool form reflect colonic transit? | Degen LP | *Gut* | 1996 | poop | [PMID 8881820](https://pubmed.ncbi.nlm.nih.gov/8881820/) |
| Effect of cheese on intestinal transit time and other indicators of bowel function in residents of a retirement home | Mykkänen HM | *Scand J Gastroenterol* | 1994 | constipation | [PMID 8128174](https://pubmed.ncbi.nlm.nih.gov/8128174/) |
| The normal range and a simple diagram for recording whole gut transit time | Evans RC | *Int J Colorectal Dis* | 1992 | poop | [PMID 1588218](https://pubmed.ncbi.nlm.nih.gov/1588218/) |
| Defecation frequency and timing, and stool form in the general population: a prospective study | Heaton KW | *Gut* | 1992 | poop | [PMID 1624166](https://pubmed.ncbi.nlm.nih.gov/1624166/) |
| Floating stools--flatus versus fat | Levitt MD | *N Engl J Med* | 1972 | poop | [PMID 5015442](https://pubmed.ncbi.nlm.nih.gov/5015442/) |
| Variation of bowel habit in two population samples | Connell AM | *Br Med J* | 1965 | poop | [PMID 5838411](https://pubmed.ncbi.nlm.nih.gov/5838411/) |

### RETRACTED (1)

Retracted papers. Listed only so readers can see we don't rely on them; never cite their findings.

| Title | First author | Journal | Year | Topics | PubMed |
|---|---|---|---|---|---|
| Country, regional, and global estimates for lactose malabsorption in adults: a systematic review and meta-analysis | Storhaug CL | *Lancet Gastroenterol Hepatol* | 2017 | general | [PMID 28690131](https://pubmed.ncbi.nlm.nih.gov/28690131/) |

<!-- LIBRARY:END -->

---

## Related

[The science behind Get Regular](/science) · [How our AI works](/science/how-our-ai-works) · [How the Gut Health Score works](/science/gut-health-score) · [Who reviews our content](/science/clinical-review) · [Our research program](/science/research)

*This library is for general education and isn't medical advice. Get Regular is a tracking app. It doesn't diagnose or treat any condition. If you have red-flag symptoms or ongoing changes in your digestion, talk to a doctor.*

<!-- JSON-LD: CollectionPage { @id: https://www.getregular.com/science/evidence#webpage, name: "The research we use", isPartOf: /science#webpage, publisher: #org, dateModified, mainEntity: ItemList { itemListOrder: "Unordered", numberOfItems: <count>, itemListElement: [ListItem { position, item: ScholarlyArticle { name, author: Person {name: first author} , datePublished: year, isPartOf: Periodical {name: journal}, identifier: [PropertyValue {propertyID: "PMID", value}, PropertyValue {propertyID: "DOI", value}], sameAs: PubMed URL } }] } }. Generate from science/evidence-library.json at build; never hand-write. No reviewedBy unless a clinician reviews this page and consents. -->
<!-- WRITER NOTES: Topic slug "how-often-should-you-poop" follows the 20 Oct brief; science/README.md §2.3 lists it as "how-often-should-you-poop-studies". Pick one before routing. Build-loop risk: build_evidence_library.py scans science/**/*.md for PubMed links, so the generated table below will add every study to cited_in as "science" on the next rebuild and keep removed studies alive. Fix: skip files containing LIBRARY:START in cited_pmids(). -->
