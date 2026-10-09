# Landing page goal

"Perfect" is not a stop condition, so this file turns it into one. The page is done when **both** gates pass.

## Gate 1: the measurable checks (`npm run audit` exits 0)

| Area | Target |
|---|---|
| Lighthouse, mobile | Performance ≥ 90, Accessibility 100, Best practices 100, SEO 100 |
| Lighthouse, desktop | Performance ≥ 95, Accessibility 100, Best practices 100, SEO 100 |
| Core Web Vitals (mobile lab) | LCP ≤ 2.5 s, CLS ≤ 0.1, TBT ≤ 200 ms |
| Accessibility | Zero axe-core violations; all tap targets ≥ 44 px on mobile; content visible with reduced motion |
| Conversion mechanics | Hero CTA above the fold at 390×844 and 1440×900; a booking link on screen at every scroll depth on mobile; one booking URL everywhere; email is a `mailto:` link |
| Integrity | One `h1`; title 30–65 chars; meta description 120–160 chars; FAQ schema matches the visible FAQ word for word; every result card says how it was measured; no console errors or warnings; no horizontal scroll at 360–1440 px |

The checks and thresholds live in `scripts/audit.mjs`. Change a threshold only on purpose, never to make a run pass.

## Gate 2: the conversion review (fresh-context reviewer)

A subagent that didn't write the copy scores the screenshots in `audit/shots/` and `index.html` from 1 to 5 on each criterion below, citing evidence for each score. **Pass = every criterion scores 4 or higher.**

1. **5-second test:** at 390 px and 1440 px, the first screen shows who this is for, what they get and what to do next.
2. **Proof:** the strongest evidence is visible early and is credible.
3. **Offer clarity:** it's clear what the first step involves and costs, and what happens on the call.
4. **Objection handling:** price, fit, risk, time to results, and working with in-house teams.
5. **Friction and CTA:** CTA placement, consistent wording, mobile reachability, few distractions.
6. **Scannability:** a skimmer gets the story from the headings alone.
7. **Trust:** a real name and photo, certifications, LinkedIn, response time, time zone. Nothing invented.

Content rules from `README.md` always apply. Every number comes from real campaigns and says how it was measured. No client names, and no invented numbers, testimonials or logos.

## How to run it

**Goal-based loop** (Claude Code CLI):

```
/goal npm run audit exits 0 (GOAL MET) AND a fresh-context reviewer scores every criterion in GOAL.md Gate 2 at 4+. Use the verify-landing-page skill after every change. Commit after each improvement that raises the score without regressions. Stop after 8 attempts and report what's still failing and why.
```

**Time-based loop** to guard the result once the goal is met. Run it against the deployed site, not on a fixed timer while nothing changes:

```
/loop 1d run npm run audit; if anything regressed since the last passing run, fix it using the verify-landing-page skill and commit; otherwise report "no change" and do nothing
```

## Log

| Date | Score | What changed |
|---|---|---|
| 2026-10-09 | 17/36 | Baseline, before any fixes |
| 2026-10-09 | 36/36 | Hero copy + free-call CTA above the fold, mobile booking dock, copy paints before JS (mobile LCP 3.7 s → 2.4 s), FAQ schema synced, mailto, tap targets, contrast, dead GSAP code removed |
| 2026-10-09 | 36/36 | Motion code loads after first paint, CSS inlined (mobile LCP ~2.1 s, perf 96), case headings, "not a fit" FAQ, UTC+7 |
