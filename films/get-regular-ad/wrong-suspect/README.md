# The Wrong Suspect — Get Regular, "How your gut keeps time" #1

A ~51 s, 9:16 educational explainer for top-of-funnel social (Stories, Reels, TikTok). Cut paper in the Get Regular
palette, narrated, with word-lit captions. Built with the vendored `animate` skill under `motion-reel`'s house rules.

## Build

```bash
A=.claude/skills/animate; P=films/get-regular-ad/wrong-suspect
node $A/tools/voice.mjs $P            # voice/<id>.wav takes -> voice/voice.wav + voice.json (word times, local faster-whisper)
node $A/tools/build.mjs $P            # -> index.html (open it; ?t=12.5 freezes a frame, ?captions=0 hides captions)
node $A/tools/export.mjs $P --share   # -> renders/final.mp4, renders/share.mp4, audio stems
node $A/tools/review.mjs $P           # contact sheets, text, sound, story-arc and dead-beat checks
```

Draft voice takes are regenerated locally with Kokoro (`npx --prefix motion-studio hyperframes tts "<line>" -v af_heart
-s 0.85 -o voice/<id>.wav`; short lines at 0.68–0.74). They are git-ignored. For the final, drop the real takes in
`voice/<id>.wav` (one file per line, ids in `voice/script.json`) and rerun the four steps: scenes are cued from the words.

## What's real and what we wrote

| On screen / in the voice | Status | Source |
|---|---|---|
| "Food takes about twenty-nine hours, on average, to travel all the way through"; counter "29 hours" | real (median 28.7 h, n=863 healthy UK adults) | Asnicar F et al., *Gut* 2021;70:1665–1674 (shown on screen) |
| "Eating something new can push along what you ate before"; the wrong food gets blamed | real | Monash FODMAP blog, "Timing of symptoms" |
| "The real reason may be lunch. Or yesterday." | hedged inference ("may") from the two facts above; fermentation symptoms usually start ≥ 4 h after a meal (Monash) | `research/science-fact-bank.md` §4e |
| "Cut the wrong food, and often nothing changes. Except your plate gets smaller." | hedged; restriction risk is documented | ACG 2021 IBS guideline; Mikhael-Moussa 2026 (ARFID in a tertiary IBS clinic); Staudacher 2012 |
| The three-week calendar and its pattern | **illustration**, not data: a made-up example of a delayed pattern (and one symptom day with no trigger, so it isn't too neat) | — |
| "Get Regular lines up your meals, symptoms and bathroom trips, day by day" | real app features (daily logs, Backlog calendar) | product walkthrough §3–5 |
| Logo | real (captured from getregular.com) | `../assets/capture/brand/` |
| "Understand your gut." | our line (the series promise) | — |
| "Educational only. Not medical advice." | our disclaimer | — |
| The diner, the train, the cloud | original illustration (not a mascot, patient or real person) | — |

Fonts: DM Sans (the site's UI face) and Instrument Serif italic, both SIL OFL 1.1 (`assets/fonts/OFL-*.txt`). The site's
display serif (ableLead) is a commercial font and isn't used.

## Policy checks
- Never asserts the viewer has a condition (Meta personal-health policy): "most of us", "your gut" = the body in general.
- No cure/fix/heal/debloat language; no stool imagery (a toilet-paper roll stands for bathroom trips).
- The brand appears in the last ~14 s (~27 %); the craft rule aims for ≤ 20 %: trim the app line if the test needs it.
