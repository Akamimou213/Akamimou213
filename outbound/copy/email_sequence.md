# Apollo email sequence: skeletons and test variants (DRAFT, not approved)

**Status:** these are skeletons. No lead is approved yet, so `{slots}` are filled per lead later from verified ledger facts only (W8 fills them, W9 audits them). Nothing here is loaded into Apollo.

Client names are still unconfirmed (see THINGS TO CHECK). Proof slots use `{GR}` = "Get Regular" or "a US health subscription app", and `{YS}` = "Yassir" or "a North African super app".

Plain text, no images, no links except email 3, sign-off "Mohamed, Appfound". Open and click tracking OFF.

---

## Email 1 (Mon): new thread

**Subject** (2–4 lowercase words): `{app} ads` · `{app} paywall` · `{app} raise` · `{app} trial`. Pick the one matching the signal used in line 1.

### 1A: control (signal-first, proof = Get Regular)
```
Hi {first_name},

{signal_line}

{problem_line}

For {GR}, our winning ads brought installs to $2.75 vs $6.28.

Want me to send a free 48-hour growth plan for {App}? No call needed.

Mohamed, Appfound
```

### 1B: round 1 variant (only the proof changes, to Yassir)
```
Hi {first_name},

{signal_line}

{problem_line}

For {YS}: 116,464 first deliveries at $1.81 each on $211K (2025).

Want me to send a free 48-hour growth plan for {App}? No call needed.

Mohamed, Appfound
```

### Line banks (pick one pair per lead; the signal must be dated and in the ledger)

| Signal | `{signal_line}` shape (fill with ledger values) | `{problem_line}` |
|---|---|---|
| S1 ads | `{App} has {N} active Meta ads, and the newest started on {date}.` | `If they optimize for installs, Meta finds people who download, not people who start a trial.` |
| S1 old ads | `{App}'s Meta ads have run since {date} with the same {N} creatives.` | `Old creatives get pricier every week, and the ad platform stops finding new payers.` |
| S2 raise | `Congrats on the {round} on {date}.` | `The hard part after a raise is spending it well: installs get cheap long before paying users do.` |
| S3 release | `{App} {version} on {date} changed the {paywall/trial/onboarding}.` | `A new paywall only pays off if the ads bring people likely to start a trial.` |
| S4 reviews | `Two 1-star reviews since {date} mention {the trial charge/onboarding}.` | `Every paid install that reaches that screen is spend lost before the fix.` |

### Word count, email 1 (body incl. greeting + sign-off; sample fill: App = "Calmly", S1 ads pair)
See the checked counts at the bottom of this file.

---

## Email 2 (Wed): same thread, reads like a reply
```
{first_name}, one quick win for {App}: {store_observation}.

{why_line}

Want me to put that test at the top of the plan?

Mohamed
```
Observation bank (must be checked on their live store page the week it's sent):
- `the first two screenshots have no caption text` → `That's usually the fastest store conversion test to run.`
- `the subtitle doesn't include {main_keyword}` → `That's the cheapest way to rank higher for it.`
- `the paywall shows the yearly plan without the monthly price beside it` → `Showing both usually makes the trial decision easier.` *(only if seen on a real paywall screenshot)*

I removed "10–20%" from your example. It's a number we can't source, and the copy rules ban invented numbers. If you have a real figure from Get Regular, give it to me and I'll put it back.

---

## Email 3 (next Mon): same thread, first link
```
{first_name}, {competitor} has run the same {hook_type} ad since {date}: {ad_description}.

I haven't seen that angle in {App}'s ads yet.

How we work: appfound.vercel.app

Worth testing that angle for {App}?

Mohamed
```
`{competitor}` + `{date}` + `{ad_description}` come from the Meta Ad Library, recorded with URL and check date. "I haven't seen that angle" is only allowed if the lead's own Ad Library page was checked the same week.

---

## Email 4 (day 14): new thread, breakup
**Subject:** `{app}, last note` (no "guarantee" in the subject)
```
Last note on {App}, {first_name}. If we don't beat your week-1 baseline by day 90, month 4 is free.

Should I close your file?

Mohamed, Appfound
```

---

## Test plan

| Round | Variable (only this changes) | A | B | Min. per version | Judge on |
|---|---|---|---|---|---|
| 1 | Proof point | Get Regular line | Yassir line | 50 leads | Positive reply rate |
| 2 | CTA | 48-hour growth plan | "Want me to record a 60-second Loom teardown of {App}'s store page? No call needed." | 50 | Positive reply rate |
| 3 | Subject | signal subject (`{app} ads`) | app-only subject (`{app}`) | 50 | Positive reply rate |
| 4 | Opener (proposed, see THINGS TO CHECK) | signal-first (1A) | "Are you willing to grow {App} faster?" opener (1C) | 50 | Positive reply rate |

**Scale check:** about 50 email leads in batch 1 means **one round per ~50+50 leads**. Round 1 alone needs 100 leads, so batch 1 (~50) can't finish it. Expect round 1 to finish around lead 100 of 200, and round 2 at 200. Rounds 3–4 need more leads or more credits.

### 1C: opener variant (proposed for round 4)
Your opener is a question, and the CTA is a question, which would make 2 questions. So in 1C the CTA becomes a statement:
```
Hi {first_name},

Are you willing to grow {App} faster?

{signal_line} {problem_line}

For {GR}, our winning ads brought installs to $2.75 vs $6.28.

I can send a free 48-hour growth plan for {App}, no call needed. Just reply "yes".

Mohamed, Appfound
```

---

## Quality gate (W9 runs this on every filled email before you see it)
- [ ] Email 1 is 50–80 words; emails 2–4 are 2–3 lines
- [ ] Exactly 1 `?`
- [ ] Every fact in the signal line exists in the ledger with a date + `evidence_url`
- [ ] Proof line matches `<proof>` character for character
- [ ] No spam words: "free money", "guarantee" in the subject, `!!!`, ALL CAPS words, "act now", "limited time"
- [ ] No links except email 3; no images
- [ ] Lines ≤ ~70 characters where possible (phone)

## Checked counts (skeletons filled with a FICTIONAL sample: app "Calmly", person "Sam", competitor "RivalApp"; not real data)

| Email | Words | Questions | Limit | Pass |
|---|---|---|---|---|
| 1A (named proof) | 59 | 1 | 50–80 | yes |
| 1A (anonymised proof) | 62 | 1 | 50–80 | yes |
| 1B (named) | 58 | 1 | 50–80 | yes |
| 1B (anonymised) | 62 | 1 | 50–80 | yes |
| 1C (opener test) | 68 | 1 | 50–80 | yes |
| 2 | 36 | 1 | 2–3 lines | yes (3 lines + sign-off) |
| 3 | 42 | 1 | – | yes |
| 4 | 26 | 1 | 2 lines | yes |

The longest signal-line shapes (S2 raise problem line = 18 words) keep email 1 under ~65 words. Recount after each real fill.
