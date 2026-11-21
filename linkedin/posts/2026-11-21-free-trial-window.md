# Post: "Free trials are weird on Meta"

Format copied from the Curtis Howland post ("Meta's budgets are weird"):
1. A hook that names something that works backwards
2. "How it works": 3 lines on the mechanism
3. A day-by-day example with running totals
4. The cost, as one number
5. Two ways to handle it
6. "Hope this helps."
7. A two-panel chart: option A vs option B, notes pointing at the lines, a big total in each panel

Topic picked from the research: Telegram export #108 (26 Mar 2026) and #171 (22 Sep 2026) on 7-day trials, attribution windows and paywalls. It fits app founders, it's counterintuitive, and the math is easy to check.

---

## Post text (LinkedIn)

```
Free trials are weird on Meta.

A longer free trial can slow down your app ads:

How it works:
- If your campaign optimizes for purchases, Meta learns from
  payments it can tie back to an ad click.
- By default it counts a payment only if it happens within
  7 days of the click.
- A 7-day free trial charges around day 7. So in the first week
  there's nothing to learn from, and the first payments land
  right on the edge of that window. Some count, some don't.

Example (same ads, $500/day, 50 trials a day,
and to keep it simple, 40% of trials pay in both cases):

3-day trial:
→ Day 1–3: 50 trials a day. Purchases Meta sees: 0
→ Day 4: Day 1 trials pay. +20. Running total 20
→ Day 5: +20. Running total 40
→ Day 6: +20. Running total 60
→ Day 7: +20. Running total 80

7-day trial:
→ Day 1 to Day 7: running total 0
→ Day 7–8: the first payments arrive, on the edge of the window

After one week, both spent $3,500.
One shows 80 purchases at ~$44 each.
The other shows none yet.

That first week is exactly when you're judging creatives.
With the 7-day trial you're judging them blind, and Meta is too:
the campaign stays stuck in learning.

On iOS it's slower again: most purchases reach Meta through
Apple's delayed postbacks, and a payment after day 7 falls
into the last, slowest one.

Two ways to handle it:
- Run a 3-day trial while you test creatives, then A/B test
  the 7-day trial once you have winners.
- Or keep 7 days and give Meta an earlier signal:
  "trial still active after 1 hour" or "still active on day 3",
  checked every week against real payments.

The numbers are illustrative. Real conversion differs between
3- and 7-day trials, so test it on your own app.

Hope this helps.
```

**First comment:** "Comment TRIAL and I'll send the checklist I use to check what Meta actually receives from an app."

---

## ChatGPT image prompt (paste as is)

```
Create a LinkedIn infographic, 1080x1350 portrait (4:5), white background.
Style: clean financial-chart look like a Bloomberg/FT explainer. Flat, no 3D,
no stock photos, no emojis, no logos. Sans-serif font (Inter or similar).
All text must be spelled exactly as written below. Nothing else on the image.

LAYOUT: two side-by-side chart panels separated by a thin light-grey vertical
line. Shared horizontal gridlines in very light grey.

TOP TITLE (centered, bold, dark navy #1B2A3A, large):
"Same ads. Same users. What Meta sees."
Subtitle below in grey: "Purchases in the first 7 days · $500/day · 50 trials a day"

LEFT PANEL
- Panel title (bold, dark): "3-Day Trial"
- Y-axis on the far left, labels: 0, 20, 40, 60, 80, 100 (purchases)
- X-axis labels: Day 1, Day 2, Day 3, Day 4, Day 5, Day 6, Day 7
- Vertical bars in blue (#2F6FB5, gradient to light blue at the bottom),
  showing a running total: Day 1 = 0, Day 2 = 0, Day 3 = 0,
  Day 4 = 20, Day 5 = 40, Day 6 = 60, Day 7 = 80.
  For Days 1–3 draw only a thin flat stub at 0.
- Callout box (white, rounded, light border, thin grey arrow) pointing at Day 1–3:
  "Trials start. Nothing to see yet"
- Callout box pointing at the Day 4 bar:
  "Trial ends → payment → Meta learns"
- Big number in blue, bold, placed upper right of the panel: "80"
  with small grey text under it: "purchases in week 1"
- Small grey text under that: "≈ $44 per purchase"

RIGHT PANEL
- Panel title (bold, dark): "7-Day Trial"
- Same X-axis: Day 1 to Day 7, then a lighter grey extra label "Day 8"
- A flat red line (#C8372D) sitting on 0 from Day 1 to Day 7.
- A dashed vertical amber line (#C9962B) between Day 7 and Day 8, labelled
  at the top: "7-day click window ends"
- At Day 8, just past the dashed line, a single faded red bar (low opacity)
  with the label: "First payments: some counted, some lost"
- Callout box pointing at the flat red line:
  "No payments yet. Nothing to learn from"
- Second callout box pointing at the same line further right:
  "Creatives judged blind"
- Big number in red, bold, upper right of the panel: "0"
  with small grey text under it: "purchases in week 1"
- Small red text under that: "Stuck in learning"

BOTTOM STRIP (full width, light grey background #F3F4F6, rounded):
Left side bold: "Same $3,500 spent."
Right side: "Fix: 3-day trial while testing · or send an early signal (trial still active on day 3)"

FOOTER (centered, bold, dark grey, small): "Mohamed Barkat"
Under it, tiny grey: "Illustrative: 40% of trials pay in both cases. Real conversion differs, test on your app."
```

### Optional: animation version (ChatGPT / Sora)
```
Animate the infographic above as a 7-second vertical video, 1080x1350, silent.
0–1s: titles fade in. 1–4s: left bars grow day by day while the right red line
draws flat along 0. 4–5s: the amber dashed "window ends" line drops in, the faded
Day 8 bar appears after it. 5–6s: "80" counts up from 0 on the left; "0" pops
in on the right. 6–7s: bottom strip slides up and holds. No camera movement,
no music, every text readable on mute.
```

---

## Checklist before posting
- [ ] The chart numbers match the post (0/0/0/20/40/60/80; $3,500; ≈$44).
- [ ] Keep the "illustrative" line in the post and on the chart. If you have a real before/after from an app, use those numbers instead.
- [ ] Zoom in on the ChatGPT image and check every label is spelled right (it often misspells small text; ask it to fix just that label).
- [ ] Attach the image only. Put the comment CTA as the first comment.
- [ ] Post at 14:00 or 20:30 Ho Chi Minh City time.
