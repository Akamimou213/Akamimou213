---
title: "AI Stool and Meal Photo Analysis: What the Research Shows"
slug: ai-stool-and-meal-photos
url: /science/evidence/ai-stool-and-meal-photos
description: "Can AI tell your Bristol stool type from a photo? How accurate are AI food trackers? What published studies of stool-photo AI, ChatGPT, Claude and Gemini meal estimates show, who ran them, and their limits."
primary_keyword: can ai tell what type my poop is from a photo
secondary_keywords: [how accurate are ai food trackers, ai poop analysis accuracy, chatgpt meal photo calories accuracy, ai bristol stool scale]
hub: /learn/gut-health-apps
template: science-evidence-topic
review_status: draft-needs-medical-review
medical_reviewer: PENDING
date_published: null
date_updated: null
sources_checked: 2026-10-20   # every abstract re-read from PubMed on this date
---

# What the research says about AI stool and meal photo analysis

> **Short answer:** In small studies, purpose-built AI rated stool photos in good agreement with gastroenterologists or expert raters [1][3], but all three stool-AI studies here had authors tied to the system's maker [1][2][3]. AI meal-photo tools are good at naming foods but less accurate on portions and nutrients, and they tend to underestimate large meals [5][6]. These studies tested other systems, not Get Regular's, and Get Regular has not published an accuracy study of its own.

**Last reviewed:** [SET AT PUBLISH] by [CONFIRM: clinician, with consent] · **Evidence checked:** 20 Oct 2026

## The evidence at a glance

| Study | Type | Who | What it found | Limits |
|---|---|---|---|---|
| Pimentel et al., *Am J Gastroenterol* 2022 [1] | Validation study (smartphone app) | People with IBS-D: 14 in validation, 25 in implementation | AI agreed well with 2 gastroenterologists on Bristol type (ICC 0.782–0.852) and beat self-reports at sorting days as constipation, normal or diarrhea | Very small. One author is from Dieta Health, which appears to make the app [CONFIRM from full text] |
| Fagan et al., *Am J Gastroenterol* 2024 [2] | Feasibility study (Dieta app) | 13 controls, 33 people with cirrhosis | App was acceptable; agreement between self-reported and AI Bristol type rose with use | No accuracy figures in the abstract. Three authors are affiliated with Dieta Inc.; listed funders include Bausch Health |
| Zhou et al., *Neurogastroenterol Motil* 2025 [3] | Feasibility study (smart toilet camera) | 6 healthy volunteers, 474 bowel movements over ~10 months | Flagged abnormal stool form with 94% accuracy, 81% sensitivity, 95% specificity vs 3 expert raters | Six people. One author co-founded the maker (Coprata); another advises it |
| Blake, Raker & Whelan, *Aliment Pharmacol Ther* 2016 [4] | Validation study of the Bristol scale | 86 volunteers rating 26 stool models | People picked the right type 81% of the time, but under 80% for types 2, 3, 5 and 6 | Models, not real stool |
| O'Hara et al., *Nutrients* 2025 [5] | Accuracy study (ChatGPT-4) | 114 meal photos with known contents | Named foods with 93.0% precision; weight OK for small meals, poor for medium and large; off by more than 10% for 13 of 16 nutrients, mostly low | Not real-life use |
| Fridolfsson et al., *Curr Dev Nutr* 2025 [6] | Accuracy study (ChatGPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro) | 52 standardized food photos | ChatGPT and Claude: average error 36.3% and 37.3% for weight, 35.8% for energy. Gemini: 64.2%–109.9%. All underestimated more as portions grew | Lab photos; authors say "not yet suitable for precise dietary assessment" |
| Chen et al., *Am J Clin Nutr* 2025 [7] | Validation vs weighed food records | 714 food images from 57 dietetic trainees | A customized GPT-4o chatbot recognized 74% of foods vs 59% for standard GPT-4o. Errors came from portions, hidden food, poor prompts and made-up items | Trained young adults |
| Chotwanvirat et al., *J Med Internet Res* 2024 [8] | Scoping review | 84 articles, 2008–2021 | Most systems were validated for energy and macronutrients, few for micronutrients | Predates current chatbots |
| Boushey et al., *Proc Nutr Soc* 2017 [9] | Review | Image-based diet methods, 2013–2016 | In every study reviewed, images reduced underreporting compared with traditional methods | Larger studies needed |

## What this means

- **Stool-photo AI is promising but not proven at scale.** Each study had 6 to 46 people, and all three had company-affiliated authors [1][2][3]. That doesn't make them wrong, but they aren't independent.
- **People aren't perfect at this either.** Volunteers misjudged types 2, 3, 5 and 6 most often [4]. That's the baseline any AI should be compared with.
- **Meal AI is better at "what" than "how much."** Portion and nutrient estimates often run low, especially for big meals [5][6][7].
- **Photos help with completeness.** Adding images reduced underreporting in the studies reviewed [9].

## What this means for Get Regular

Get Regular uses OpenAI's API to suggest a Bristol type from a stool photo and to estimate meal ingredients and nutrients [CONFIRM: model in use]. The studies above tested **other systems**, and their results don't transfer to our app. **Get Regular has not published an accuracy study of its own**, so we make no accuracy claims. Any future claim will come with its published method [CONFIRM: product/legal]. See [How our AI works](/science/how-our-ai-works) for inputs, limits and data flow.

## What's still uncertain

- How stool-photo AI performs in large, independent studies across different lighting and toilets [1][3].
- Whether general-purpose models will close the portion-size gap [6][7].

## Track it

Treat AI estimates as a starting point. Check a suggested stool type against the [Bristol stool chart](/tools/bristol-stool-chart), edit wrong meal ingredients, or log stool type manually with no photo. [The Bristol scale research](/science/evidence/bristol-stool-scale) · [Gut health apps hub](/learn/gut-health-apps)

**See a doctor promptly** for blood in the stool, black or tarry stools, severe pain or unexplained weight loss. AI photo analysis isn't designed to catch these [CONFIRM reviewer: alarm list per site standard].

## Sources

1. Pimentel M, et al. A Smartphone Application Using Artificial Intelligence Is Superior To Subject Self-Reporting When Assessing Stool Form. *Am J Gastroenterol*. 2022;117(7):1118-1124. doi:10.14309/ajg.0000000000001723. https://pubmed.ncbi.nlm.nih.gov/35288511/
2. Fagan A, et al. Artificial Intelligence Evaluation of Stool Quality Guides Management of Hepatic Encephalopathy Using a Smartphone App. *Am J Gastroenterol*. 2024;119(5):977-981. doi:10.14309/ajg.0000000000002646. https://pubmed.ncbi.nlm.nih.gov/38153339/
3. Zhou J, et al. Long-term, automated stool monitoring using a novel smart toilet: A feasibility study. *Neurogastroenterol Motil*. 2025;37(1):e14954. doi:10.1111/nmo.14954. https://pubmed.ncbi.nlm.nih.gov/39486001/
4. Blake MR, Raker JM, Whelan K. Validity and reliability of the Bristol Stool Form Scale in healthy adults and patients with diarrhoea-predominant irritable bowel syndrome. *Aliment Pharmacol Ther*. 2016;44(7):693-703. doi:10.1111/apt.13746. https://pubmed.ncbi.nlm.nih.gov/27492648/
5. O'Hara C, et al. An Evaluation of ChatGPT for Nutrient Content Estimation from Meal Photographs. *Nutrients*. 2025;17(4):607. doi:10.3390/nu17040607. https://pubmed.ncbi.nlm.nih.gov/40004936/
6. Fridolfsson J, et al. Performance Evaluation of 3 Large Language Models for Nutritional Content Estimation from Food Images. *Curr Dev Nutr*. 2025;9(10):107556. doi:10.1016/j.cdnut.2025.107556. https://pubmed.ncbi.nlm.nih.gov/41081011/
7. Chen YJ, et al. Customized multimodal Diabot-GPT-4o enhances accuracy of image-based dietary assessments in dietetic trainees in Taiwan: validation against weighed food records. *Am J Clin Nutr*. 2025;122(6):1836-1849. doi:10.1016/j.ajcnut.2025.10.013. https://pubmed.ncbi.nlm.nih.gov/41138916/
8. Chotwanvirat P, et al. Advancements in Using AI for Dietary Assessment Based on Food Images: Scoping Review. *J Med Internet Res*. 2024;26:e51432. doi:10.2196/51432. https://pubmed.ncbi.nlm.nih.gov/39546777/
9. Boushey CJ, et al. New mobile methods for dietary assessment: review of image-assisted and image-based dietary assessment methods. *Proc Nutr Soc*. 2017;76(3):283-294. doi:10.1017/S0029665116002913. https://pubmed.ncbi.nlm.nih.gov/27938425/

<!-- JSON-LD: MedicalWebPage { about: [MedicalTest "Bristol Stool Form Scale", Thing "Image-based dietary assessment"], citation: [9 × ScholarlyArticle {name, author, datePublished, isPartOf Periodical, sameAs PubMed, identifier DOI}], reviewedBy: Person @id (consent only), lastReviewed, isPartOf: /science#webpage, publisher: #org } -->
<!-- COMPLIANCE NOTE: Apple App Review Guideline 1.4.1 — no accuracy figures for Get Regular's own analysis until a validation study with disclosed methodology exists. Cite these studies as context only. Dieta conflicts: PubMed records for [1] and [2] carry no conflict-of-interest statement; affiliations show Asaf Kraus (Dieta Health / Dieta Inc.) on both, plus J. Anstey and D. Tiede (Dieta Inc.) on [2]. [CONFIRM reviewer: check the full-text disclosure sections of both papers.] -->
