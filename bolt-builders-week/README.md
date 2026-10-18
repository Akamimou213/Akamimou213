# Bolt Builders Week: what to build and why

**Recommendation: build _Opened_.** It's a mobile-first web app. You snap any scary letter, bill, fine, insurance or government notice, and in about 20 seconds you get a calm verdict: what it is, whether you must act, by when, what ignoring it costs, whether it's a scam, and the one next step. Then it writes the reply, fee-waiver request, appeal or phone script, adds the deadline to your calendar, and tracks the letter until it's done.

**Tagline:** *Your scary mail, opened for you.*

| File | What it is |
|---|---|
| [`01-PROJECT-KNOWLEDGE.md`](01-PROJECT-KNOWLEDGE.md) | The full product spec. Paste it into Bolt **Project settings → Knowledge**. |
| [`02-BUILD-PROMPTS.md`](02-BUILD-PROMPTS.md) | 10 phase prompts (Plan → Polish), with checks between phases and fix-it prompts. |
| [`03-SUBMISSION-KIT.md`](03-SUBMISSION-KIT.md) | Submission form answers, tool disclosure, demo video script, a validation plan and unit economics. |

---

## 1. Contest facts that shaped the decision (verified Oct 18, 2026)

| Fact | Implication |
|---|---|
| Submissions close **Tue Oct 20, 23:59 PT**. Free model weekend ends **Sun Oct 18, 23:59 PT**. | You have ~2 days. Build the demo path first. |
| The free model is **GLM 5.3 Flash** (not "GLM 3.5"), in 6-hour usage blocks. | Phase-by-phase prompts work better than one mega-prompt (Bolt's own guidance, and GLM is flagged as verbose and "experimental" in Bolt). |
| You must submit a **live link that is publicly accessible, free of charge, and functional** through judging, plus the Bolt project link. | Mobile **web** app on bolt.host, not an Expo/App Store build. **No hard paywall in front of the core flow.** |
| Judging, weighted equally: **use of Bolt, idea, implementation & design, potential impact.** Ties go to "use of Bolt". | Use Bolt Database, Auth, Server functions, Secrets, Stripe and Publish on purpose, and say so in the submission. |
| Theme: "Turn a business idea into a product." | It needs a credible business model, not just a cool demo. |
| Bolt has **no built-in keyless AI for generated apps**. AI calls go through a server function with your own key in Secrets. | You need an API key (OpenRouter recommended). Samples must still work if the AI fails. |
| Excluded countries include Brazil, China, Russia, Cuba, Iran, North Korea, Syria, Quebec and some others. Algeria is not on the list. | You're eligible, assuming you're 18+ and not otherwise excluded. |

Sources: [Builders Week](https://bolt.new/builders-week), [Official rules](https://bolt.new/builders-week/terms), [Bolt Cloud](https://support.bolt.new/bolt-cloud), [Server functions](https://support.bolt.new/bolt-cloud/database/server-functions), [Secrets](https://support.bolt.new/bolt-cloud/database/secrets), [Stripe integration](https://support.bolt.new/integrations/stripe), [Expo](https://support.bolt.new/integrations/expo), [Bolt Forge](https://support.bolt.new/account/bolt-forge), [Prompting effectively](https://support.bolt.new/prompting/prompting-effectively), [GLM 5.3 Flash on Artificial Analysis](https://artificialanalysis.ai/models/glm-5-3-flash).

**Where your notes don't apply to this contest:**
- *iOS-only, native SwiftUI, hard paywall, $7.99/week.* That playbook optimizes App Store revenue. The contest needs a free public link, and the audience here is anxious and often money-stressed, so weekly pricing would read as predatory.
- *Freemium.* Freemium with 3 free letters a month is the right call here. Native iOS is the right *next* step once demand is proven, because the camera and notifications really are core to the product.

---

## 2. How the idea was chosen

**Method:**
- 4 parallel research passes:
  - life admin
  - small service businesses
  - unfair charges, caregiving and rental deposits
  - Bolt platform capabilities
- Plus a Reddit-specific pull.

**Source limits:**
- **Reddit pages couldn't be fetched directly** from this environment. Reddit's public search RSS feeds did work, so every Reddit quote below is verbatim from a post body, with its date. Comment threads and upvote counts weren't accessible.
- Trade-forum quotes (LawnSite, ContractorTalk) came only from search snippets and are treated as weaker.

### Candidates scored (1 = weak, 5 = strong; scores are my judgment from the evidence below)

| Candidate | Pain evidence | Frequency | Proven spend | Judge can try it via a link | AI essential | Buildable in 2 days | Differentiation |
|---|---|---|---|---|---|---|---|
| **Opened**: scary-mail decoder + reply writer | 5 | 4 | 3 | 5 | 5 | 4 | 4 |
| Quote-to-close for solo trades | 4 | 5 | 5 | 3 | 4 | 5 | 2 |
| Insurance-denial appeal writer | 5 | 2 | 2 | 4 | 5 | 4 | 2 |
| Rental deposit evidence + dispute | 4 | 1 | 2 | 4 | 3 | 4 | 4 |
| Caregiver hub for aging parents | 5 | 5 | 2 | 3 | 3 | 3 | 2 |

**Why Opened wins:**
- It's the only idea strong on all three contest-critical axes: **a judge feels it in 20 seconds** (tap a sample, watch the envelope open, get the verdict), **AI is the product rather than a feature**, and the **emotional stakes are high**.
- It also **absorbs the two runners-up as letter types:** insurance denials become "Appeal it" drafts, and late fees become fee-waiver drafts. So it carries the strongest data story without being a narrow niche tool.

**Why not the runner-up (quote-to-close for trades):**
- It has the clearest willingness to pay. Jobber charges $49–$199/mo for one user, and 37% of pros call quoting a major time drain (Jobber 2026 report).
- But incumbents already ship AI quoting.
- A judge can't really feel a contractor's pain through a demo link.
- It's a weaker "idea" score.
- If you'd rather build a B2B business than win the contest, this is the one to revisit.

---

## 3. The evidence for Opened

### Problem: people avoid opening official mail, and it costs real money
**Reddit, verbatim, from post bodies fetched via search RSS:**
- "I'm scared that I'll open a letter and it'll be something I need to take action on… I walk past the mail and think about how should open it, but I PHYSICALLY CANNOT." ([r/ADHD, Dec 2021](https://www.reddit.com/r/ADHD/comments/r80svt/))
- "I once avoided ours for 6 months, which wrecked my credit)… We lose real money monthly to late fees and enforcement costs" ([r/ADHD, Jul 2026](https://www.reddit.com/r/ADHD/comments/1uoqlq5/))
- "neither of us has an overview of what's paid, pending, or missing anymore." (same post)
- "uh, yeah, I have ADHD, letters are useless, they don't have notifications." This came after a $138 bill went to collections and their psychiatrist appointment was cancelled. ([r/ADHD, Oct 2020](https://www.reddit.com/r/ADHD/comments/jk92wi/))
- "it isn't normal to have multiple tubs, bins, and boxes for your massive unopened mail collection… Then I get sent to collections agencies" ([r/ADHD, Sep 2023](https://www.reddit.com/r/ADHD/comments/16fn758/))
- "For years I have felt sick, depressed and anxious everytime I get an email or letter from HMRC." ([r/UKPersonalFinance, Nov 2025](https://www.reddit.com/r/UKPersonalFinance/comments/1p5hslw/))
- "I started to ignore the letters as it was added stress… the debt snowballed" ([r/UKPersonalFinance, May 2026](https://www.reddit.com/r/UKPersonalFinance/comments/1tqvlci/))
- "my parent has not been opening letters for 10 years, and my sibling is now going through them all." ([r/UKPersonalFinance, Jul 2023](https://www.reddit.com/r/UKPersonalFinance/comments/14v8rjy/))
- "honestly I ignore most of my paper mail because I do autopay online" (then a $400 doctor's bill went to collections) ([r/personalfinance, Sep 2021](https://www.reddit.com/r/personalfinance/comments/psgne5/))

**Other sources:**
- "My missed deadlines for student loan payments alone have cost me roughly $50,000." ([ADDitude reader quote](https://www.additudemag.com/adhd-tax-financial-wellness-money-problems/))
- "My credit has been completely ruined because the bills just go to collections since I never see them… My husband has been handling the mail since 2015." ([fearof.net](https://www.fearof.net/fear-of-letters/))

**The pattern:** the fear is the *unknown action or amount* inside the envelope, not laziness. Once mail is opened, a second problem appears: nobody knows what's paid, pending or missing.

### Size and cost (quantitative)
- **37%** of US adults paid a late fee in the past 12 months, and **61%** of parents of minors did. NerdWallet survey, Apr 2024, n=2,061 ([CNBC](https://www.cnbc.com/2024/05/30/37percent-of-americans-paid-a-late-fee-in-the-last-12-months-report-finds.html)).
- **45%** paid a bill late in the past year. Of those, **28% forgot** and 28% mixed up the due date. LendingTree, ~Nov 2024 ([source](https://www.lendingtree.com/debt-consolidation/affording-bills-survey/)).
- **79%** of people who asked for a late fee to be waived got it waived. LendingTree, late 2025 ([source](https://www.lendingtree.com/debt-consolidation/economic-squeeze-survey/)). **This is the core product mechanic: Opened does the asking.**
- **6.0%** of US adults (~15.5M) have a current ADHD diagnosis, and 55.9% were diagnosed as adults. CDC MMWR, 2024 ([PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11466376/)).
- In the UK, adults with ADHD estimate ADHD costs them about **£1,600 a year**. **49%** have forgotten to pay a bill, vs 18% of neurotypical people. Monzo/YouGov ([Monzo](https://monzo.com/help/your-needs/adhd-support)).
- Adults with ADHD have **4×+** the rate of overdrafts and arrears. Swedish registry data, *Science Advances*, 2020 ([paper](https://www.science.org/doi/10.1126/sciadv.aba1551)).
- **~19%** of in-network ACA Marketplace claims were denied in 2024, and **fewer than 1%** were appealed. KFF, Mar 2026 ([KFF](https://www.kff.org/patient-consumer-protections/claims-denials-and-appeals-in-aca-marketplace-plans-in-2024/)). In the 2023 data, 44% of appeals were overturned ([KFF](https://www.kff.org/private-insurance/claims-denials-and-appeals-in-aca-marketplace-plans-in-2023/)).

### How people solve it today, and the gap
| Workaround | Why it fails |
|---|---|
| A partner opens the mail | Dependence; useless if you live alone. The most common pattern in the evidence. |
| Autopay | Covers recurring bills only, not fines, tax letters, denials or renewals. It also trains people to ignore paper mail (see the r/personalfinance quote above). |
| Bins, folders, spreadsheets, "admin day" | Abandoned. "none of this has worked to tame the pile" ([ADDitude](https://www.additudemag.com/adhd-organization-mail-paperwork-clutter/)). |
| Pasting a letter into ChatGPT | Works once, if you can get yourself to do it. It doesn't track the deadline, nudge you, or keep a paid/pending/done overview. |
| Rocket Money and bill-negotiation apps | Proof that people pay for help with bills and subscriptions, but they don't read one-off paper letters. |
| Virtual mailbox and scan services | Digitize the mail without explaining it. |

**The gap:** nothing turns *one-off official paper* into *understanding + action + tracking* in one motion, without a spouse.

---

## 4. Why this is a business, not just a demo

- **Core desire:** relief from dread and protection of money, plus feeling like a capable adult again. It's a painkiller with a monthly trigger (the mail keeps coming).
- **Model:** freemium (3 letters/month free). **Plus at $6.99/mo or $49.99/yr**, as hypotheses to test. AI cost per letter is about **$0.001–0.003** at GLM 5.3 Flash prices, so gross margin is driven by payment fees, not AI.
- **ROI story the user can feel:** one waived $32 late fee or one avoided £35 → £70 parking escalation pays for months of Plus. The app shows user-confirmed "money protected", never invented savings.
- **Distribution that fits your skill set:** "Opening my 6-month mail pile with AI" is natively watchable short-form content (an unboxing format with real stakes). It fits TikTok/IG faceless slideshows and UGC around #ADHDtax, then Spark Ads / Meta once a creative wins. Details and unit economics are in [`03-SUBMISSION-KIT.md`](03-SUBMISSION-KIT.md).
- **Expansion:**
  - **Family mode** (an adult child handling a parent's mail, a pattern in the evidence above)
  - **Shared household pile**
  - Email-forwarding inbox
  - Native iOS app with push reminders
  - B2B2C with credit unions or neobanks: Monzo already runs ADHD support pages.

## 5. Risks, and what would change this recommendation

| Risk | Mitigation built into the spec |
|---|---|
| AI misreads a deadline or amount on a legal or medical letter | Every deadline and amount must quote the source text (enforced server-side by substring check), an "unsure about" section, confidence stamps, and a "check the original" disclaimer. |
| "It's just ChatGPT" | The barrier is avoidance, not intelligence. The product's value is the calm reveal, the one next step, the deadline capture, the tracking and the drafts. |
| Privacy (people photograph sensitive letters) | OCR runs **on device**, photos are never uploaded, numbers are auto-redacted, and the user approves the text sent. |
| Legal-advice exposure | Positioned as "explains letters", never as an "AI lawyer". The FTC's 2025 order against DoNotPay's "robot lawyer" claims is the cautionary example. Court and eviction letters route to free legal aid. |
| Frequency is lower than hoped | Measure "second letter within 30 days". If it's weak, lead with Family mode, or bundle with a bank or credit union. |
| Unproven direct-to-consumer willingness to pay in this exact niche | **This is the biggest unknown.** I found no public revenue for a direct competitor. Adjacent spend (bill-negotiation apps, virtual mailboxes, ADHD coaching) is real, but that is inference, not proof. Validate before investing past the contest. |

**I'd switch to the trades quote-to-close idea if:**
- fewer than 3 of 10 interviews (script in the submission kit) report a fee, collection or penalty from unopened mail in the last 6 months, or
- fewer than 40% of people who start the capture flow reach a verdict.
