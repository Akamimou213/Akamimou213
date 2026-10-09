---
name: verify-landing-page
description: Verify any change to the landing page (index.html, src/main.ts, src/styles.css, public/) end-to-end before calling it done. Use after every edit to the site, and as the check inside /goal or /loop runs that improve it.
---

# Verifying landing page changes

Never report a change to the site as done because the edit succeeded or the build passed. Verify it the way a picky reviewer would.

1. Run `npm run audit`. It builds the site, serves `dist/`, and prints one PASS/FAIL line per check plus `SCORE n/N`. It exits 0 only when every check passes (`GOAL MET`).
   - Lighthouse JSON for each form factor lands in `audit/lighthouse-{mobile,desktop}.json`. Read `audits['largest-contentful-paint-element']`, `bootup-time` and `color-contrast` there when a performance or contrast check fails.
   - Screenshots land in `audit/shots/`. Open `fold-390.png` and `fold-1440.png` after any change to the hero, nav or layout and look at them, not just the score.
2. Compare against the previous score. A change that fixes one check and breaks another is not progress: fix the regression before moving on.
3. Check the content rules in `README.md` by hand for any copy change:
   - Every number comes from the résumé or campaign screenshots and says how it was measured. Never invent a figure, testimonial, client name or logo.
   - Platform-attributed results stay labelled as platform-attributed.
4. For copy or layout changes that affect conversion, get a second opinion from a fresh-context subagent: give it the screenshots and the conversion rubric in `GOAL.md`, and ask it to score each criterion with evidence. Don't grade your own copy.
5. Lighthouse scores move by a few points between runs. If a performance check flips between PASS and FAIL with no related change, run the audit again once. If it still fails, treat it as real.

If any step fails, fix the cause and rerun from step 1. Don't hand back partially verified work, and don't lower a target in `scripts/audit.mjs` to make a check pass. Targets change only when the user agrees to it.
