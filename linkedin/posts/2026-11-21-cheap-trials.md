# Post: "Cheap trials are weird on Meta"

Replaces the earlier "free trial window" post. Most subscription apps run a 7-day trial and optimize Meta for trials,
so the useful lesson is: Meta finds the cheapest trials, not the trials that pay.
Based on Telegram export #171 (22 Sep 2026, point 4: optimizing to trials without checking revenue) and #126 (16 Jun 2026, trial vs purchase optimization).

Format: Curtis Howland style (hook, how it works, example with numbers, the cost, two fixes, "Hope this helps", two-panel chart).

---

## Post text (LinkedIn)

```
Cheap trials are weird on Meta.

The ad set with the cheapest trials can be
the one losing you money.

How it works:
- Most subscription apps optimize Meta for "trial started".
- So Meta looks for people who start trials.
  Not people who pay after the trial.
- With a 7-day trial, you only find out who paid a week later.
  By then Meta has already moved the budget.

Example: two ad sets, $3,500 each, same app, 7-day trial.

Ad set A:
→ Trials at $7 each = 500 trials
→ 10% pay after the trial = 50 payers
→ Cost per payer: $70

Ad set B:
→ Trials at $17.50 each = 200 trials
→ 35% pay after the trial = 70 payers
→ Cost per payer: $50

In Ads Manager, A looks 2.5x better.
So Meta pushes more budget to A.

In your bank account, B is the winner:
29% cheaper per paying user, and 20 more payers.

Two ways to handle it:
- Judge every ad set, creative and country on cost per payer,
  after the trial ends. Not on trial cost in Ads Manager.
- Give Meta a better trial event: only count a trial if it's
  still active after a few hours, or on day 3.
  Most people who cancel do it early.

Numbers are illustrative, but I see this split in almost
every subscription app account: the cheapest trials
come from the people least likely to pay.

Hope this helps.
```

**First comment:** "Comment PAYER and I'll send the sheet I use to compare cost per trial vs cost per payer by ad set."

### Math check
| | Ad set A | Ad set B |
|---|---|---|
| Spend | $3,500 | $3,500 |
| Cost per trial | $7.00 | $17.50 (2.5x A) |
| Trials | 500 | 200 |
| Trial → paid | 10% | 35% |
| Payers | 50 | 70 (+20) |
| Cost per payer | $70 | $50 (28.6% cheaper ≈ 29%) |

---

## ChatGPT image prompt (paste as is)

```
Create a LinkedIn infographic, 1080x1350 portrait (4:5), white background.
Style: clean financial-chart explainer, flat, no 3D, no stock photos, no emojis,
no logos. Sans-serif font (Inter or similar). All text must be spelled exactly
as written below. Nothing else on the image.

TOP TITLE (centered, bold, dark navy #1B2A3A, large):
"Meta sees trials. You get paid by payers."
Subtitle in grey: "Same app · 7-day trial · $3,500 per ad set"

LAYOUT: two side-by-side panels separated by a thin light-grey vertical line.
Light grey horizontal gridlines. Shared Y-axis on the far left labelled
0, 100, 200, 300, 400, 500 (users).

LEFT PANEL
- Panel title (bold): "Ad set A · cheap trials"
- Two vertical bars side by side:
  1) tall light-green bar (#8CCB9B) up to 500, label above: "500 trials"
  2) short dark red bar (#C8372D) up to 50, label above: "50 payers"
- Callout box (white, rounded, light border, thin grey arrow) pointing at the
  green bar: "Ads Manager winner: $7 per trial"
- Callout box pointing at the red bar: "Only 10% pay after the trial"
- Big number in red, bold, bottom right of the panel: "$70"
  with small grey text under it: "per paying user"

RIGHT PANEL
- Panel title (bold): "Ad set B · pricier trials"
- Two vertical bars side by side:
  1) medium light-blue bar (#9DBFE3) up to 200, label above: "200 trials"
  2) dark blue bar (#2F6FB5) up to 70, label above: "70 payers"
- Callout box pointing at the light-blue bar: "Looks worse: $17.50 per trial"
- Callout box pointing at the dark blue bar: "35% pay after the trial"
- Big number in blue, bold, bottom right of the panel: "$50"
  with small grey text under it: "per paying user"
- Small blue tag under it: "29% cheaper · +20 payers"

A curved grey arrow from the right panel toward the left panel, labelled:
"Meta moves budget to A"

BOTTOM STRIP (full width, light grey background #F3F4F6, rounded):
Bold: "Judge on cost per payer, after the trial ends."
Smaller: "Not on cost per trial in Ads Manager."

FOOTER (centered, bold, dark grey, small): "Mohamed Barkat"
Under it, tiny grey: "Illustrative numbers."
```

### Optional: animation (ChatGPT / Sora)
```
Animate the infographic above as a 7-second vertical video, 1080x1350, silent.
0–1s: title fades in. 1–3s: the two trial bars grow; "Ads Manager winner"
appears on A. 3–5s: the payer bars grow; the red "$70" and blue "$50" count up.
5–6s: the grey "Meta moves budget to A" arrow draws from right to left.
6–7s: bottom strip slides up and holds. No camera movement, no music,
every text readable on mute.
```

---

## Checklist before posting
- [ ] The chart matches the post: 500/50 and 200/70; $7, $17.50, $70, $50; 29%; +20.
- [ ] Zoom in and check the small labels on the ChatGPT image.
- [ ] Image only in the post; the comment CTA goes in the first comment.
- [ ] Have the PAYER sheet ready before posting.
