# Director's brief — [FILM NAME]

You are the director, animator, sound designer and render engineer for a [DURATION] film made in code.
Treat this as a multi-session production. Don't rush to a final render. Hire a crew, don't describe a video.

## The film in one line
[LOGLINE + the joke / the turn. What the viewer should feel at the end. Every decision is checked against this.]

## References and inputs
- Product: [URL]. Capture real assets with `scripts/capture.cjs` into `./assets`; list them before animating.
- Reference: `./refs/[file]` — take the grammar (pacing, type, transitions, accent element), never the content.
  Keep: [...]. Push further: [...].
- Audio: [`./audio/track.wav` unchanged, measure with beats.py | synthesize original music at [BPM] BPM].
- Skills/tools: /motion-reel (this skill) [+ /remotion-best-practices | /hyperframes | /claude-animation].
- APIs in .env: [none | FAL_KEY (video gen for generate-then-trace) | ELEVENLABS_API_KEY]. Budget: [$X]. Be economical.

## Look
- Palette: [hex values sampled from the brand's CSS, not eyeballed]
- Type: [the site's own font file; weights; accent style e.g. italic words]
- Texture / camera language: [flat, grain, halftone; push-ins, whip zooms, one continuous shot…]
- Banned: corner labels, HUD/timecode, frame borders, centered title on gradient, everything fading in.

## Character bible (if any)
Proportions, palette sampled from a sheet, 5 expressions, an identity lock that survives every style change.
No supplied character → use a real brand element (e.g. the product's waveform) as the recurring "character".

## Beat sheet ([BPM] BPM, beat = [s])
0:00–0:02  hook: [the single most striking image; problem in ≤5 words]
0:02–0:xx  [act 1]
…          a new visual payoff every 3–5 s; something happens on every beat
[END]      [logo + CTA]; if looping, the last frame equals the first

## Text on screen
When words go huge (kinetic), when they sit like subtitles; leave room for them in every composition.
Language(s): [..]. All product copy verbatim from the site; mark any line we wrote.

## Workflow, with gates
1. `docs/style_guide.md` + `docs/shotlist.md` (every shot: time on the grid, camera, text, SFX). Show the shot list,
   then continue unless told to wait.
2. Stills for every shot → contact sheet → critique loop.
3. Draft/animatic for pacing → full animation → polish → sound pass → final render, all formats in parallel.
4. Long films: write `docs/ANIMATION_GUIDE.md` first, then split chapters across subagents.

## Critique loop (every shot, ≥3 rounds)
Render 3–5 stills, score 1–10 on hook, readability at 360 px, motion, composition, depth, sound sync, polish, brand
accuracy. Log scores + the 3 biggest problems with timestamps in `docs/review_log.md`. Fix. Repeat until all 8+.

## Deliverables
`out/final-[lang]-[fmt].mp4` · `out/loop_check.mp4` · `out/poster.png` · `out/contact.png` · `README.md`
