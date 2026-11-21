# Post: "Meta knows who paid. It still buys trials."

How the setup works (most subscription apps):
- Campaign goal in Meta = StartTrial.
- RevenueCat (directly, or through AppsFlyer/Adjust) sends events back to Meta:
  trial started → StartTrial, trial converted → Purchase / Subscribe with revenue.
- So the purchases DO reach Meta and can be shown in Ads Manager (Purchases, cost per purchase, purchase ROAS columns).
- But delivery and budget follow the optimization event only. With a StartTrial goal, Meta finds the cheapest trials,
  even when the purchase column shows those trials pay less.
- Extra caveat: with a 7-day trial the Purchase arrives ~7 days after the click, so the 7-day click attribution window
  can miss some of them. Check the RevenueCat/MMP cohort by campaign, not only Ads Manager.

Based on Telegram export #126 (16 Jun 2026: trial vs purchase optimization, event mapping) and #171 (22 Sep 2026: trial optimization without revenue analysis).
Format: Curtis Howland style.

---

## Post text (LinkedIn)

```
Meta knows which trials paid.
It still buys you the cheap ones.

How it works:
- Most subscription apps optimize Meta for "trial started".
- RevenueCat (or your MMP) sends Meta the purchase
  when the trial converts.
- So the purchases show up in Ads Manager.
- But Meta's budget follows the goal you picked.
  The goal is trials, so Meta hunts for the cheapest trials.
  Not the trials that pay.

Example: two ad sets, $3,500 each, 7-day trial,
goal = trial started.

Ad set A:
→ $7 per trial = 500 trials
→ 10% convert = 50 purchases
→ $70 per purchase

Ad set B:
→ $17.50 per trial = 200 trials
→ 35% convert = 70 purchases
→ $50 per purchase

Ads Manager shows both numbers.
Meta still moves budget to A, because A wins on its goal:
trials 2.5x cheaper.

You end up paying 40% more per subscriber
($70 vs $50), with the data sitting right there.

Two ways to handle it:
- Read cost per purchase by ad set, creative and country,
  8+ days after the trial starts. Cut or cap what doesn't pay,
  even if its trials are cheap.
- Change what Meta optimizes for:
  → Purchase, if you get enough conversions a week
  → or a "qualified trial": a trial that hasn't been
    cancelled after a few hours or on day 3, sent through
    RevenueCat or your MMP. Many people cancel on day one.

One more check: with a 7-day trial, the purchase lands
about 7 days after the click, right where Meta's 7-day
attribution window ends. So Ads Manager can undercount it.
Compare with the RevenueCat cohort by campaign.

Numbers are illustrative.

Hope this helps.
```

**First comment:** "Comment PAYER and I'll send the sheet I use to compare cost per trial vs cost per purchase by ad set."

### Math check
| | Ad set A | Ad set B |
|---|---|---|
| Spend | $3,500 | $3,500 |
| Cost per trial | $7.00 | $17.50 (A is 2.5x cheaper) |
| Trials | 500 | 200 |
| Trial → paid | 10% | 35% |
| Purchases | 50 | 70 |
| Cost per purchase | $70 | $50 ($70 is 40% more than $50) |

---

## ChatGPT image prompt (paste as is)

```
Create a LinkedIn infographic, 1080x1350 portrait (4:5), white background.
Style: clean financial-chart explainer, flat, no 3D, no stock photos, no emojis,
no logos. Sans-serif font (Inter or similar). All text must be spelled exactly
as written below. Nothing else on the image.

TOP TITLE (centered, bold, dark navy #1B2A3A, large):
"Meta knows who paid. It still buys trials."
Subtitle in grey: "Goal = trial started · 7-day trial · $3,500 per ad set"

SMALL FLOW ROW under the subtitle (one line, grey icons as simple rounded boxes
joined by arrows): "Ad" → "Trial started" → "Trial converts" → "RevenueCat / MMP"
→ "Meta". Under the arrow into "Meta", tiny grey text: "purchase reported"

LAYOUT: two side-by-side panels separated by a thin light-grey vertical line.
Light grey horizontal gridlines. Shared Y-axis on the far left labelled
0, 100, 200, 300, 400, 500.

LEFT PANEL
- Panel title (bold): "Ad set A"
- Two vertical bars side by side:
  1) tall light-green bar (#8CCB9B) up to 500, label above: "500 trials"
  2) short dark red bar (#C8372D) up to 50, label above: "50 purchases"
- Callout box (white, rounded, light border, thin grey arrow) pointing at the
  green bar: "Wins Meta's goal: $7 per trial"
- Callout box pointing at the red bar: "10% convert"
- Big number in red, bold, bottom right of the panel: "$70"
  with small grey text under it: "per purchase"

RIGHT PANEL
- Panel title (bold): "Ad set B"
- Two vertical bars side by side:
  1) medium light-blue bar (#9DBFE3) up to 200, label above: "200 trials"
  2) dark blue bar (#2F6FB5) up to 70, label above: "70 purchases"
- Callout box pointing at the light-blue bar: "$17.50 per trial"
- Callout box pointing at the dark blue bar: "35% convert"
- Big number in blue, bold, bottom right of the panel: "$50"
  with small grey text under it: "per purchase"

A curved grey arrow from the right panel toward the left panel, labelled:
"Budget follows the goal → moves to A"

BOTTOM STRIP (full width, light grey background #F3F4F6, rounded):
Bold: "Pick the goal you actually want Meta to hunt."
Smaller: "Purchase, or a qualified trial (not cancelled by day 3)."

FOOTER (centered, bold, dark grey, small): "Mohamed Barkat"
Under it, tiny grey: "Illustrative numbers."
```

### Optional: animation (ChatGPT / Sora)
```
Animate the infographic above as an 8-second vertical video, 1080x1350, silent.
0–1s: title fades in. 1–2s: the flow row draws left to right, ending at "Meta".
2–4s: trial bars grow; "Wins Meta's goal" appears on A. 4–6s: purchase bars grow;
"$70" and "$50" count up. 6–7s: the grey "Budget follows the goal" arrow draws
from right to left. 7–8s: bottom strip slides up and holds. No camera movement,
no music, every text readable on mute.
```

---

## Checklist before posting
- [ ] Chart matches the post: 500/50, 200/70; $7, $17.50, $70, $50.
- [ ] Your own setup matches the wording: RevenueCat → Meta directly, or RevenueCat → MMP → Meta.
- [ ] Zoom in and check small labels on the ChatGPT image.
- [ ] Image in the post; comment CTA in the first comment; PAYER sheet ready.
