# Get Regular: Voice of Customer and Pain-Point Research

Research date: 2026-10-19. Prepared for blog and GEO content planning.

Companion files:
- `question-bank.csv`: 271 deduplicated real questions, grouped by cluster, with sources
- `app-review-insights.csv`: 72 verbatim App Store review quotes, with themes and implications

---

## 0. Method, sources and limitations (read first)

| Source | What was collected | Volume |
|---|---|---|
| Google autocomplete (US, `client=firefox`) | 30 seeds x 15 modifiers ("why do i", "is it normal", "how to", "can", "what does", "how often", "best app", "vs", "why is my", "what causes", "should i", "when to", "how do i know", "does") | 450 queries, **2,914 unique suggestions**, 2,321 of them question-form |
| patient.info community (Discourse JSON API) | 43 gut-topic searches, then full threads for 62 topics | 1,933 unique thread titles, 2,123 post excerpts |
| HealthUnlocked (IBS Support / The IBS Network) | Community listings and 11 full threads | about 60 recent titles |
| Apple App Store RSS reviews (US) | 22 apps, deduplicated | **1,417 reviews** (Get Regular 7, mySymptoms 150, Cara Care 143, Nerva 149, Bowelle 100, Balloon 80, plop 74, Monash 50, Bearable 50, PCal 50, Happy Poop 50, ZOE 200, plus others) |
| WebSearch | Background on GI-visit prep and AI stool-photo app privacy and accuracy | n/a |

**Limitations:**
- **Reddit could not be reached.** reddit.com and old.reddit.com return 403 to curl and WebFetch, WebSearch rejects the reddit.com domain, and the archive APIs (PullPush, Arctic Shift) were rate-limited or refused agent access. This report contains **no Reddit quotes**. Autocomplete does show how much people want Reddit's answers: "best poop tracker app reddit", "best ibs app reddit", "how much mucus in stool is normal reddit", "best food diary app reddit" and "why do i have ibs reddit" all appear, 20 suggestions in total. If someone can browse Reddit manually, r/IBS, r/Constipation and r/SIBO are still worth a pass.
- **People Also Ask could not be collected.** The SERP is not exposed to our tools. Autocomplete and forum titles were used in its place, so the CSV has no `paa` rows.
- **Mayo Clinic Connect and Quora** return 403 to both curl and WebFetch. Only the topic titles from search results are referenced, and no quotes were taken from them.
- **Quotes are verbatim** from the retrieved text. A few trims are marked with "…". No usernames are included. App Store quotes were checked by script against the saved review JSON (`scratchpad/voc/reviews/merged.json`). One patient.info quote (marked †) comes through WebFetch's extractor rather than raw JSON.
- **The forum data skews toward the UK and is older.** patient.info and HealthUnlocked are UK-heavy and their threads date from 2014 to 2026, with most from 2016 to 2020. App reviews run from 2021 to 2026 and are US only.

Raw data lives in `/tmp/claude-0/-home-user-Akamimou213/101b497e-e50c-5731-a26a-126e636d354d/scratchpad/voc/`: `ac/raw.tsv`, `ac/parsed.json`, `forum/pi_search.json`, `forum/topics/*.txt`, `forum/hu/*.txt`, `reviews/merged.json`.

### Frequency signals used below
- **AC n:** the number of the 2,914 autocomplete suggestions that match the topic.
- **Forum n:** the number of the 2,123 patient.info post excerpts that mention it.
- **Review n:** the number of the 1,417 App Store reviews tagged with that theme, split into 1-3★ and 4-5★.

Headline counts:
- **Autocomplete:** bloat 256, "normal"/frequency 233, poop/stool color 201, "after eating" 199, constipation 175, flare 121, diarrhea 121, mucus 119, food intolerance 138, trigger 99, food diary/log 91, Bristol 60, doctor/GI 46.
- **Forums:** "food diary" is recommended in 98 excerpts and "symptom diary" in 38. Anxiety comes up in 154 and cancer in 59.

---

## 1. Pain-point taxonomy by cluster

### 1.1 Stool, Bristol and bowel tracking ("Is my poop normal?")

**Frequency:** Very high. In autocomplete, "normal"/frequency has 233 suggestions, color 201, mucus 119 and Bristol 60. On patient.info, "stool" appears 934 times. Color and floating stools each have their own large thread clusters.

**Top pain points**
1. **No clear sense of "normal".** People want to know how often is normal, what color is normal and whether a type 5 or 6 counts as normal. The Bristol chart is known but hard to read.
2. **Variability is frightening.** A stool can change within a day or even within one movement, and floating stools and mucus cause worry.
3. **Every change gets read as cancer.** Thin stools, dark stools and stools that keep floating lead people to search for symptoms, which raises their anxiety further.
4. **Incomplete evacuation and the "type 4" goal.** Users treat type 4, the "smooth sausage", as the target and feel they have failed when they miss it.

**Verbatim quotes**
- "i never get a 4 - well no I do but very occasionally like once a month" (https://community.patient.info/t/where-on-the-bristol-stool-chart-does-your-ibs-sit/401265)
- "sometimes, I get all the bristol stool chart in one poop!" (https://community.patient.info/t/pain-and-loose-stools-every-morning-sound-familiar/404361)
- "it's driving me insane with worry because I have it in my mind that a normal healthy one should be like a smooth sausage" (https://community.patient.info/t/how-do-you-bulk-out-your-poop/636584)
- "Is it normal to have a stool that starts as a type 4 (bigger sausages) but ends as a type 5" (https://community.patient.info/t/poops-starting-big-then-getting-smaller/684750)
- "This anxiety cycle is draining." The poster's stools had been floating "for months". (https://community.patient.info/t/constant-floating-stools-with-ibs-anyone-shed-any-light/804550)
- † "I'm worried tests will just turn up with nothing again." (https://community.patient.info/t/ibs-symptoms-have-suddenly-changed-and-i-m-worried-there-s-something-s/583856)
- Get Regular review: "it really showed me that my symptoms aren’t normal and i can actually see a doctor about this without thinking im crazy." (App Store, 5★, 2026-10-13)

**Emotional driver:** Anxiety, embarrassment ("TMI", "Sorry if tmi") and a wish for reassurance or permission to see a doctor.

**Content that resolves it**
- A Bristol hub page with one sub-page per type. Each type page should cover what it means, common causes, what to do and when to worry.
- "How often should you poop?" with ranges and red-flag thresholds.
- A color guide built as a table, covering green, yellow, black, pale, red and orange.
- "Floating stool: when it matters."
- "Mucus in stool: how much is normal?"
- "Why your stool changes day to day (and why 2 weeks of tracking tells you more than one bad day)."
- Close each piece with a tracking CTA, for example "log 14 days of Bristol type and you'll see your real baseline."

---

### 1.2 Food-symptom diary and triggers ("What is causing this?")

**Frequency:** Very high. Autocomplete has 138 suggestions for intolerance, 99 for trigger and 91 for food diary/log. On forums, "keep a food diary" is the most common advice of all, with 98 excerpts.

**Top pain points**
1. **Delayed reactions make it hard to tell which food was responsible.** People cannot tell which meal caused a symptom because reactions can come hours or even days later.
2. **The same food does not always cause the same reaction.** Whether a food causes symptoms depends on the dose, the day and the mix of other foods, which breaks simple "this food is bad" logic.
3. **Diaries are tedious and people give up.** Logging every ingredient is too much work, so they stop within days.
4. **Keeping a diary does not reveal any pattern.** Even people who keep a diary often can't see a correlation.
5. **Advice conflicts.** Low-FODMAP, gluten-free and dairy-free guidance all say different things, intolerance tests are seen as untrustworthy, and people fear that restricting foods will create new intolerances.

**Verbatim quotes**
- "too difficult to work out which foods caused me problems due to not knowing how long after eating them the symptoms might appear!" (https://healthunlocked.com/ibs-support/posts/134628513/best-way-to-find-out-whats-causing-your-ibs)
- "just because you can eat something one day, doesn't mean you can the next." (same thread)
- "If you ate a food that was a problem, how soon after do you think you would feel the effects?" (https://community.patient.info/t/how-to-identify-potential-trigger-foods/529540)
- "I started a new discussion regarding food diary and how it hasn't helped me much." (https://community.patient.info/t/uncomfortable-feeling-in-lower-abdomen/678651)
- "Incredibly tedious but when you glance back it becomes BLATANTLY obvious which foods are the killers for pain." (https://community.patient.info/t/acid-reflux-and-oesophagitus/22633)
- "This is one of those pieces of advice that is always mentioned but often overlooked." (https://community.patient.info/t/ibs-and-possible-hemorrhoids/625020)
- "Constantly obsessing about what I should or shouldn't eat, do I fast on a bad day, do I force myself to eat?" (https://healthunlocked.com/ibs-support/posts/140782068/a-question-about-food-intolerances)
- "The low fodmap diet says what veg you shouldn't eat. Then the glutton free says something different" (https://healthunlocked.com/ibs-support/posts/141530854/what-can-i-eat-confused)
- From a developer with IBS describing other diary apps: "they would usually just point me back to the last meal, even if I'd had the same previously without issues." (https://healthunlocked.com/ibs-support/posts/153250078/food-symptom-tracking-and-correlation)
- From the same post: "many too difficult to use as they required logging exact quantities of every ingredient." (same URL)
- mySymptoms review: "it’s so difficult due to the delayed reaction and volume of food and chemicals I have contact with!" (App Store, 5★, 2025-09-18)

**Emotional driver:** Confusion, fear of eating, and the exhaustion of "trial and error". People also feel hopeful when a pattern finally shows up.

**Content that resolves it**
- "How long after eating do food intolerance symptoms start? (timing windows by symptom)". This answers the autocomplete queries "how long for food intolerance symptoms to start" and "how long does food intolerance take to kick in".
- "Why your food diary isn't finding your trigger, and 5 fixes." Cover the last-meal bias, dose, stacking, stress and sleep, and logging symptoms separately from meals.
- "Food intolerance tests: what IgG tests can and can't tell you."
- "Food intolerance vs allergy vs IBS."
- A one-page "lazy food diary" method that uses photos instead of ingredient lists.
- Product messaging: photo logging removes ingredient-entry fatigue, and AI "possible patterns" look across several days rather than only at the last meal.

---

### 1.3 IBS (diagnosis limbo, flares, life impact)

**Frequency:** Very high. Autocomplete has 310 IBS suggestions and 121 for flare. On forums, IBS-D is mentioned 111 times, IBS-C 76 times and anxiety 154 times.

**Top pain points**
1. **Flares seem random.** "why does my ibs flare up randomly" and "is it normal to have ibs symptoms everyday" are typical searches.
2. **People doubt the diagnosis and fear being dismissed.** They wonder whether it is really IBS or something worse, and feel "sent away with a leaflet".
3. **Anxiety and IBS feed each other.** People avoid going out because they worry about where the nearest toilet is.
4. **They don't know what to eat during a flare.** They wonder whether to fast and find low-FODMAP hard to do without a dietitian.
5. **Subtype language is confusing.** "What counts as diarrhea?" is a common question, and some people's IBS changes from IBS-C to IBS-D.

**Verbatim quotes**
- "My GP diagnosed IBS and sent me away with a flea in my ear and a leaflet." (https://community.patient.info/t/probably-ibs-but-my-anxiety-thinks-otherwise-any-thoughts/629776)
- "DO NOT GET FOBBED OFF WITH THE IBS LABEL." (https://healthunlocked.com/ibs-support/posts/153208525/do-not-settle-for-box-labelled-ibs)
- "I look with envy at everyone I see thinking 'I bet they don't have the problems like I do'" (https://community.patient.info/t/how-often-are-your-flare-ups/568473)
- "I'm seriously fed up of this, I'm sure my IBS triggers my anxiety not the other way round!" (same thread)
- "I also get a lot of pains when shopping or out the house." (https://community.patient.info/t/why-cant-i-leave-the-house-because-of-ibs-and-anxiety/627459)
- "every article I read about it says you should only follow the diet under the supervision of a qualified nutritionist." (https://community.patient.info/t/following-the-fodmap-diet-on-your-own/592598)
- "It seems pretty hard to find a good answer to this question cause I hardly see it mentioned online." This was asked about what counts as diarrhea. (https://community.patient.info/t/ibs-and-diarrhea-what-counts-as-diarrhea/616237)

**Emotional driver:** Feeling dismissed, being alone ("good to not feel so alone"), social anxiety, and wanting control back.

**Content that resolves it**
- "Why does my IBS flare up randomly? It's usually not random", which shows how tracking reveals the build-up to a flare.
- "IBS vs IBD vs SIBO vs colon cancer: symptoms and red flags", written clearly and calmly.
- "What to eat during an IBS flare."
- "IBS-C, IBS-D, IBS-M explained with Bristol types", which ties back to the Bristol hub.
- "How to do low-FODMAP when you can't see a dietitian (and when you really should)."
- "IBS and anxiety: the gut-brain loop."

---

### 1.4 Bloating and gas

**Frequency:** Highest by autocomplete, with 256 bloat suggestions and 126 for gas. "Trapped wind" appears 66 times in UK forums. "after eating" alone has 199 suggestions.

**Top pain points**
1. **Bloating after every meal, every day,** often without an obvious cause.
2. **Body image.** People look pregnant, worry whether it is bloating or fat, and feel self-conscious.
3. **Pain and embarrassment from gas,** including gas that "moves around", noisy stomachs in quiet rooms and back pain.
4. **They don't know when bloating needs a doctor.** "should i see doctor for bloating" is a common query.
5. **"Healthy" foods and fiber make it worse,** which is counterintuitive.

**Verbatim quotes**
- "It’s like the gas is moving all over my stomach & it’s very painful." (https://community.patient.info/t/i-have-been-suffering-from-gas-for-the-past-2-weeks-what-should-i-do/620750)
- "For about a year now I’ve had extreme bloating everyday." (https://community.patient.info/t/i-m-constantly-bloated-what-do-i-do/735312)
- "made me extremely self conscious and depressed with my body image" (same thread)
- "a bloated hard distended abdomen, making me look 6 months pregnant." (https://community.patient.info/t/going-to-gp-tomo-armed-with-food-and-symptom-diary-ibs/21006)
- "I feel I get even more anxious when my stomach starts making noises and everyone can hear it." (https://community.patient.info/t/can-anxiety-trigger-ibs-symptoms/658171)
- "Keeping a food chart and that's the only thing jumping out." (https://community.patient.info/t/wind-gas-problems-is-this-a-big-part-of-ibs/585334)
- Bowelle review: "I’ve struggled with various gut issues, mainly bloating, for literal years. Years and years!" (App Store, 5★, 2025-03-22)
- mySymptoms review, on why correlation fails: "if you want to log discrete symptoms that occur frequently during the day, such as stomach gas, then the algorithm does not work." (App Store, 2★, 2022-01-16)

**Emotional driver:** Self-consciousness and body image, embarrassment, and frustration that "healthy" eating backfires.

**Content that resolves it**
- "Why am I bloated after every meal? 9 causes and how to find yours." This is the head-term page.
- "Bloating vs belly fat: how to tell."
- "Why fiber can make you more bloated (and how to add it without pain)."
- "Is bloating after eating IBS?"
- "When bloating needs a doctor (red flags)."
- A bloat-severity tracking template that rates morning and evening bloating, which supports the "worse in the morning" search pattern.

---

### 1.5 Constipation and regularity

**Frequency:** High. Autocomplete has 175 constipation suggestions. Forums show many "laxatives only" and "never feel empty" threads. GLP-1 queries are an emerging angle: "how often poop on wegovy / zepbound / glp 1".

**Top pain points**
1. **Doctors' answer is "just take laxatives",** and people want to know why it is happening and what will fix it.
2. **Laxative dependence and fear of it.** "Can only go with laxatives" is a recurring complaint.
3. **Incomplete evacuation and straining,** with a constant feeling of needing to go back.
4. **Uncertainty about how long is too long** and when constipation is serious.
5. **Fiber confusion.** People ask whether fiber helps or hurts, and fiber supplements scare some of them.

**Verbatim quotes**
- "they have just stated that I will need to just take laxatives to make sure i go each day." (https://community.patient.info/t/i-suffer-with-constipation-regularly-any-advice/510689)
- "I can only seem to go toilet with laxative for the last week and half… I do have IBS? But what does this mean?" (https://community.patient.info/t/can-only-go-toilet-with-laxatives/699567)
- "very rarely feel i am 'emptying' properly - feeling i need to go back to the toilet but nothing happens." (https://community.patient.info/t/ibs-frustrated/257574)
- "This ALWAYS leaves me with the feeling that I could not fully empty my bowel" (https://community.patient.info/t/tips-for-bulking-up-stool/600208)
- "if you look at the bristol chart, I could make a doctor proud." This shows that users already describe progress in Bristol terms. (https://community.patient.info/t/perfect-bm-s-and-then-unexplained-constipation/673401)
- "I've always wanted to try them to see if they 'regulate' things, but i've been too scared." This was said about fiber supplements. (https://community.patient.info/t/fibre-supplements/646144)
- Balloon review: "The doctors tell me just to take laxatives, but I've wanted a real solution to my problems." (App Store, 4★, 2025-04-22)
- Get Regular review asking for a way to record "no BM" days: "i wish the was a setting or option for it to log that i didn’t go" (App Store, 5★, 2026-10-13)

**Emotional driver:** Feeling dismissed, physical discomfort and a desire to feel "regular" and in control. "Regular" is the user's own word, used 62 times in forums and 27 times in reviews, which matches the brand name.

**Content that resolves it**
- "How long without pooping is too long?" with red-flag thresholds.
- "Can you poop every day and still be constipated?"
- "Laxative vs stool softener vs fiber: which one, when."
- "Incomplete evacuation: why you feel like you still need to go."
- "GLP-1 (Wegovy/Zepbound) constipation: what's normal and how to track it."
- "How to get regular bowel movements: a 14-day tracking plan."
- Product: count days with no movement. Both Get Regular and Bowelle users ask for this.

---

### 1.6 Diarrhea, urgency and pooping right after eating

**Frequency:** High. Autocomplete has 121 diarrhea suggestions, and "why do i poop right after i eat" / "after every meal" are high-volume patterns. "Urgency" appears 85 times in forums.

**Top pain points**
1. **Needing to go immediately after meals,** which prompts "is it normal?" questions about the gastrocolic reflex.
2. **Morning urgency and pain** that disrupt work and leaving the house.
3. **Nothing seems safe to eat** when even plain food "goes through me".
4. **Confusion about definitions.** People ask what counts as diarrhea and whether loose stools are the same thing.
5. **Lingering diarrhea after gallbladder removal or an infection,** and a feeling that nobody warned them.

**Verbatim quotes**
- "normal diet goes through me, plain foods also go through me." (https://community.patient.info/t/what-do-you-eat-in-an-ibs-flare/734359)
- "I ALWAYS wake up with gas, pain - like period cramps (for the woman) and then an urgency that I need to go" (https://community.patient.info/t/pain-and-loose-stools-every-morning-sound-familiar/404361)
- "Basically I can't sleep or do anything if I have the urge to poop." (https://community.patient.info/t/urgency-to-poop/571289)
- "I dread getting up in the mornings to start another horrendous day." (https://healthunlocked.com/ibs-support/posts/141530854/what-can-i-eat-confused)
- "I truly cannot believe people are not being informed about post GB op living." (https://community.patient.info/t/why-havent-i-had-a-normal-stool-in-16-years/667725)
- Happy Poop review: "I have tried many different apps to track my diarrhea and this has been wonderful." (App Store, 5★, 2026-08-08)

**Emotional driver:** Dread, loss of normal life, planning everything around toilets, and feeling uninformed.

**Content that resolves it**
- "Why do I poop right after I eat? (gastrocolic reflex vs IBS-D vs intolerance)."
- "Diarrhea every day after eating: causes and what to track."
- "What actually counts as diarrhea? (Bristol 6-7, frequency, urgency)."
- "Bile acid diarrhea after gallbladder removal."
- "Morning urgency: why IBS is often worse in the morning."
- Each piece should explain how the time between eating and needing to go helps tell these causes apart, which is a natural use case for logging.

---

### 1.7 Doctor and GI appointment prep ("being taken seriously")

**Frequency:** Medium in search, with 46 autocomplete doctor/GI suggestions, but the **strongest motivation in reviews**. The doctor/export theme appears in 163 positive and 33 negative reviews, more often than any other theme except ease of use.

**Top pain points**
1. **Being dismissed until they have evidence.** A diary is seen as what gets people taken seriously.
2. **Forgetting details in the appointment.** Doctors ask "when did this start?" and patients can't answer.
3. **Export fails at the worst moment.** Emails break, data is lost the day before the appointment, or PDFs come out jumbled.
4. **Anxiety about procedures** such as colonoscopy prep and what a normal result means.
5. **Interpreting results,** for example "nothing on colonoscopy, now what?" or what a calprotectin number means.

**Verbatim quotes**
- "the doctor’s will not do much if you don’t try to make some sort of symptom diary first. they will fob you off." (https://community.patient.info/t/stomach-cramps-what-can-it-be/805611)
- "Take the food diary, the symptom diary and photos with you … and see the difference in how you are treated." (https://community.patient.info/t/food-affected-bowel-habits-bloody-bowel-movements/554940)
- "Otherwise you'll forget to mention certain things." (https://community.patient.info/t/ibs-and-possible-hemorrhoids/625020)
- "What does this mean for me going forward? Just that I'm cleared of certain things?" (https://community.patient.info/t/nothing-on-colonoscopy-what-does-this-mean-for-me/591831)
- "The whole procedure from beginning to end causes me extreme anxiety and fear." (https://community.patient.info/t/help-first-colonoscopy-scheduled-suffer-from-white-jacket-syndrome/712364)
- mySymptoms review: "This app played a crucial role in being heard by my doctor. It’s hard to ignore symptoms when they are detailed in a report." (App Store, 5★, 2025-11-20)
- mySymptoms review: "When I went to the doctor, I printed my records and felt prepared for the first time." (App Store, 5★, 2025-09-06)
- Cara Care review: "If my doctor asks, “when did this start?” I can’t easily answer that question" (App Store, 3★, 2018-04-05)
- Cara Care review: "My appointment is tomorrow and I have lost all my data for a year." (App Store, 1★, 2022-06-12)
- Bowelle review: "I absolutely love having the 7-day average for telling my GI at appointments." (App Store, 5★, 2026-05-31)
- Happy Poop review: "It gets all the questions that they ask, how much, texture, what color and the things." (App Store, 5★, 2026-08-06)

**Emotional driver:** Wanting to be believed, wanting to feel prepared, and wanting to stop feeling "crazy". **This is the single strongest outcome to lead marketing with.**

**Content that resolves it**
- "How to prepare for a gastroenterologist appointment: what to track for 2 weeks before." Include a checklist covering Bristol type, frequency, urgency, blood, mucus, pain timing relative to meals, meds and red flags.
- "What your GI doctor will ask (and how to answer with data)."
- "What a calprotectin test result means."
- "Colonoscopy came back normal: what now?"
- A printable "GI visit summary" template that leads into Get Regular's export.

---

### 1.8 App selection and tracking friction

**Frequency:** Autocomplete has 133 app suggestions, including "best poop tracker app (reddit/free/with friends)", "is there an app to track bowel movements" and "app to track food and bowel movements". In reviews, paywalls and price appear in 151 of the 1-3★ reviews, which makes them the biggest complaint. Logging friction appears in 38 negative reviews and weak insights in 41.

**Top pain points (ranked by how often they appear in reviews)**
1. **Surprise paywalls.** The subscription is revealed only after signup, a "free" app has a 7- or 14-day trial, history is locked, and Nerva costs about $200 a year.
2. **Analysis that doesn't deliver,** such as "my number one trigger is water", every food being flagged, or nothing new after months of use.
3. **Logging friction,** including entering every ingredient, one item per entry, barcode-only databases and having to log symptoms attached to a meal.
4. **Data loss and bugs,** including lost history, broken exports and apps that are shutting down. Cara Care support reportedly said "this app is going away soon".
5. **Missing stool detail,** such as blood, mucus, orange or dark-brown colors and days with no bowel movement.
6. **Ads after every entry** (plop).
7. **Charts users can't interpret,** described as "too pretty to be useful".

**What users love**
- Low friction: "low fiction enough to use every day".
- Customization.
- Reports for the doctor.
- Discovering patterns.
- No ads and no account.
- Photos kept out of the camera roll.

**Verbatim quotes**
- "An app would be useful if the results could be emailed." (https://community.patient.info/t/what-do-you-do-to-track-symptoms-causes-do-you-use-a-diary/618897)
- "the ones i found really were for little kids, as in, pick the picture for how you feel right now." (https://community.patient.info/t/looking-for-some-advice-please/690053)
- See `app-review-insights.csv` for 72 more review quotes, for example:
  - "Finally something low fiction enough to use every day" (Bowelle 5★)
  - "Once they have all your info they tell you it is a two week trial." (mySymptoms 1★)
  - "I expected a bit more ‘intelligence’ from the app." (Bowelle 3★)

**Emotional driver:** Feeling tricked by paywalls, tracking fatigue, and "I've tried them all".

**Content that resolves it**
- "Best poop tracker apps (2026): honest comparison", including pricing transparency and what each app actually analyzes.
- "Cara Care alternatives", aimed at churning Cara Care users.
- "mySymptoms vs Bowelle vs Get Regular."
- "Is there an app to track bowel movements and food together?"
- "Free vs paid IBS trackers: what you actually get."

---

### 1.9 Privacy and AI trust

**Frequency:** Low in search. The literal autocomplete "can your poop be traced back to you" is one example. In reviews it is moderate: privacy and accounts appear in 43 negative reviews, and complaints about photo/AI accuracy are concentrated in ZOE's 25 negative reviews.

**Top pain points**
1. **Forced accounts read as data harvesting,** and App Store privacy labels sometimes don't match the policy.
2. **Opaque scores** that nobody explains, such as Cara Care's "Symptom Score".
3. **AI misreads food photos and can't be corrected.**
4. **Fatigue with "AI-enhanced" marketing** that delivers nothing concrete.
5. **Worry about where stool photos are stored.**

**Verbatim quotes (all App Store)**
- "A diary app should not require a login just so that the app provider can harvest data" (Cara Care 1★, 2025-05-05)
- "the privacy policy for the account you have to create is wildly different from the privacy policy presented on the App Store page." (Balloon 1★, 2024-09-28)
- "there is not even a FAQ to explain how the symptom score is calculated." (Cara Care 3★, 2025-12-01)
- "First meal photo was analyzed WRONG and no way to correct it!" (ZOE 1★, 2025-07-14)
- "literally no one is asking for ai enhanced anything" (Nerva 2★, 2025-10-07)
- "I appreciate the ability to add photos and not have them be on my photo album on my phone." (Happy Poop 5★, 2026-08-13)
- Counter-signal: users are already pasting their data into AI themselves.
  - "I sent 6 weeks of data to ChatGBT to look for patterns" (Bowelle 4★, 2026-03-10)
  - "I will load into AI to create a summary and try to understand the data better." (mySymptoms 5★, 2026-03-29)

**Emotional driver:** Wariness, and the intimacy of stool data. Users want AI help but want to stay in control of it.

**Content that resolves it**
- "How Get Regular's gut score works", a transparent explainer that AI assistants can cite.
- "Are AI stool-photo apps accurate? What research says." The Cedars-Sinai/Dieta study found AI matched gastroenterologists on Bristol classification (https://www.cedars-sinai.org/newsroom/study-app-more-accurate-than-patient-evaluation-of-stool-samples/). The post should also cover the limits.
- "Where your stool photos go: our privacy promise." It should state that photos are not saved to the camera roll and are never sold, but only if those claims are true.
- Copy rule: say "possible patterns" and "suggestions you can edit" rather than "AI diagnoses".

---

## 2. Question bank summary
See `question-bank.csv`, which has **271 rows**:
- **By source:** autocomplete 193, forum 74 (patient.info 64, HealthUnlocked 10), and 4 needs taken from reviews.
- **By cluster:** stool/Bristol 54, food diary/triggers 41, IBS 39, bloating/gas 30, constipation 30, diarrhea 22, doctor prep 21, app selection 20, gut health general 9, privacy/AI 5.
- **By intent:** informational dominates. 27 rows are commercial, mostly "best … app" queries.

Highest-leverage question families for GEO, where AI assistants get asked directly:
- "how many times should you poop a day / is it normal…"
- "what does bristol stool type X mean"
- "why do i poop right after i eat"
- "why am i bloated after every meal"
- "how long for food intolerance symptoms to start"
- "how to prepare for gi appointment"
- "is there an app to track bowel movements and food"

---

## 3. App-review insights

### Competitor love and hate (1,417 reviews)
| Theme | 1-3★ | 4-5★ | Notes |
|---|---|---|---|
| Paywall, price, trial surprise | **151** | 79 | mySymptoms "not free" pattern; Balloon $59.99/yr; Nerva $200/yr; plop locks history |
| Ease, simplicity | 45 | **307** | The number-one reason for 5★ |
| Doctor, GI, export | 33 | **163** | Main job-to-be-done; failures are severe because they happen right before appointments |
| Insight quality (analysis, correlation, trends) | 41 | 106 | Loved when it works (Bearable, mySymptoms); mocked when it is naive ("water" as a trigger) |
| Data loss, bugs | 52 | 23 | Cara Care, PCal, Monash diary erased |
| Privacy, forced account | 43 | 21 | Cara Care, Balloon, Bearable, CareClinic |
| Logging friction | 38 | 51 | Ingredient-level entry, one item per entry |
| Ads | 26 | 19 | plop's interstitials after every log |
| Stool detail (color, blood, mucus, Bristol) | 25 | 41 | Missing orange and dark brown, blood/mucus, no-BM days |

### Feature gaps Get Regular can message
1. **Photo logging for meals and stool.** mySymptoms users ask for "voice or photos", and Get Regular's own reviewers praise "snap pictures of my food and stool". Contrast this with ingredient-by-ingredient diaries.
2. **Pattern insights that look beyond the last meal.** Account for delayed windows and don't flag foods you eat every day.
3. **Transparent, explainable scoring with editable AI results.** This is the opposite of Cara Care's black-box score and ZOE's uncorrectable photo reads.
4. **Doctor-ready summary or export** with a timeline, 7-day averages and first occurrence of each symptom.
5. **Stool detail:** Bristol type plus blood, mucus, urgency, wider colors and a quick "didn't go today" entry.
6. **Plain pricing and privacy:** say up front what's free and what's paid, keep no ads, and keep stool photos out of the camera roll.

### Get Regular's own reviews (7, all 4-5★, 2026-02 to 2026-10)
- **Themes:**
  - Simple and not overwhelming, mentioned 3 times.
  - The photo feature.
  - Validation: "symptoms aren’t normal … see a doctor … without thinking im crazy".
  - Feeling more in control.
  - Improved quality of life.
- **Requests:**
  - A "log that I didn't go" option.
  - The ability to edit entries.
- **Implication:** The brand promise "tracking that doesn't overwhelm" plus "the confidence to talk to your doctor" is already landing with users. Build features and copy around both.

---

## 4. Language map (copy guidance)

| Concept | Users say | Notes and frequency | Copy guidance |
|---|---|---|---|
| Feces | **poop** (AC 365 / forum 177), **stool** (AC 364 / forum 934), **bowel movement** (AC 153 / forum 119 / reviews 51), **BM / BMs** (forum 51 / reviews 60), poo (UK, 26 in forums), "motion", "go to the loo/toilet" (UK) | Search splits evenly between "poop" and "stool". Forums and reviews use "stool" and "BM". | Use "poop" in H1s and conversational answers. Use "stool" or "bowel movement" in the body for clinical credibility. Use "BM" in UI microcopy. Never use "feces" or "defecation". |
| Stool form | "type 4", "smooth sausage", "pellets", "mushy", "raggy pieces", "shards", "flat", "pencil thin", "floating" | Users already speak in Bristol numbers | Say "Bristol type 4 (the 'smooth sausage')". Use their descriptors as alt names. |
| Episodes | **flare / flare-up** (AC 121, forum 188, reviews 20), "attack", "bad day", "it goes through me" | | Use "flare" freely, and "bad gut day" for a softer tone. |
| Cause | **trigger / trigger foods** (AC 101, forum 214, reviews 47), "culprit" (16), "what's setting me off", "doesn't agree with me" | "safe foods" is rare | Use "trigger foods" and "foods that don't agree with you". Avoid "allergen" unless it is clinical. |
| Bloating | **bloated / bloating** (AC 256), "look pregnant", "trapped wind" (UK, 66), "gassy", "wind" (UK, 101) | "distension" almost never used (2) | Use "bloated", "look 6 months pregnant" and "gas". Avoid "distension" in headlines. |
| Constipation | "constipated", "can't go", "haven't pooped in X days", "never feel empty", "not emptying properly", "straining", "**regular**" (forum 62, reviews 27) | "Regular" is the user's own goal word | Lean on "get regular" and "feel empty and done". |
| Diarrhea | "loose", "watery", "urgency" (85), "runs", "dash to the loo", "immediately after eating" | | Pair "urgency" with "can't make plans". |
| Condition labels | IBS, **IBS-D (111) / IBS-C (76)**, IBS-M (rare), SIBO, "gut issues / GI issues / stomach issues" (forum 26, reviews 34), "tummy" (UK) | Undiagnosed users say "gut issues" or "GI issues" | Write for the undiagnosed with "gut issues" and use the subtypes for diagnosed readers. |
| Doctor | GP (UK), "my GI", "gastro", "doctor", "fobbed off", "dismissed", "sent away with a leaflet", "taken seriously", "being heard" | | Use "be heard by your doctor" and "walk in with data". |
| Feelings | "anxiety" (154), "worried", "scared", "embarrassing / TMI", "crazy" ("without thinking im crazy"), "fed up", "at my wits end" | | Normalize it: "you're not crazy, and you're not alone". Never shame. |
| Brain fog | Appears in forums (23 mentions), not in gut autocomplete or tracker reviews | Secondary symptom | Mention it as an "also tracked" symptom. Don't headline it. |
| Tracking | "food diary" (most common), "food and symptom diary", "journal", "log", "keep track", "notes app", "spreadsheet" | Both "diary" and "log" are used | Use "food & poop diary" or "gut log". Copy should mention "no ingredient lists". |

**Tone rules from the data**
1. Lead with reassurance before facts. Many searches are worried "is it normal" questions.
2. Always include a red-flag box covering blood, black stools, weight loss, nocturnal symptoms, new changes after 50 and family history. Users fear cancer: the word appears in 59 forum excerpts and in autocomplete "vs colon cancer" queries.
3. Answer the timing question explicitly. "How long after eating" is the most important gap that users can't close on their own.
4. Never promise a diagnosis. Say "possible patterns to discuss with your doctor".
