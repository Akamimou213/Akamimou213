---
name: motion-reel
description: Make any motion-graphics video rendered entirely from code (one canvas + headless Chrome + ffmpeg) with an original or supplied soundtrack — product/SaaS launch, mobile-app ad or UA creative (with hook variants), brand film, explainer, data story, event promo, personal showreel or intro, social cutdowns in 9:16/1:1/4:5/16:9. Use when the user asks for a video, reel, motion ad, animated explainer, morph film, "make a video for <URL or app>", hook/CTA variants for creative testing, or wants a reference video's style rebuilt for their own subject.
---

# Motion reel

The one-liner gets a clip; the harness gets a studio. This skill is the harness: a director's brief, real assets,
a pure `draw(t)` engine on a beat grid, a critique loop on rendered frames, and a render/sound/QA pipeline that
exports every format, language and variant from one timeline. It works for any subject. The worked example
(`reference/example-walaw.md`) is one client; nothing in the method depends on it.

## 0. Operating mode

- **Keep momentum.** Show each gate's artifact (asset list, storyboard, contact sheet), then keep working.
  Stop and wait only when the brief or the user says so. "Where is the video?" means you waited too long: send a draft.
- **Time-box research to ~10 minutes per question.** If some data (locations, customer lists, numbers) can't be
  verified quickly, design around it, say so, and move on. Never invent it.
- **Real vs dramatized:** every delivery says which copy, data, UI and claims are real (with sources) and which lines we wrote.
- **One timeline file is the single source of truth:** times, copy per language, events, variants. Each note becomes a one-line edit.
- **Stop when told.** "That's enough" means ship what exists.

## 1. Pick the film type (decides assets, engine and structure)

| Subject | Real assets come from | Starter | Typical spine (on the beat grid) |
|---|---|---|---|
| Website / SaaS product | `scripts/capture.cjs` (screenshots, copy, tokens, fonts, logos, the site's own animations) | scenes or morph | hook → product assembles → 3 features as cursor moments → proof → logo + CTA |
| Mobile app | screen recordings: iOS Simulator `xcrun simctl io booted recordVideo out.mp4`, Android `adb shell screenrecord /sdcard/out.mp4`, or the client's own recordings; store screenshots of **their** app | scenes | hook (problem/outcome) → app in hand → 2–3 feature taps → proof (rating, metric with source) → end card |
| Paid social / UA creative | any of the above + `variants` in the timeline | scenes | hook in the first 1–2 s, readable with sound off, one idea, end card; render hook/CTA variants from one timeline |
| Brand with no product UI | logo files, brand book, fonts, palette, supplied photography | scenes (kinetic type) or morph | manifesto in kinetic type, accent element travelling between states, lockup |
| Personal showreel / intro | the person's own work and name | scenes or morph | "what I do" in ≤5 words → range of techniques → signature move → name |
| Explainer / data story | sourced datasets (official stats, the client's dashboards), public-domain maps (Natural Earth) | scenes | question → mechanism in 3 steps → the number with its source on screen → takeaway |
| Event / launch promo | the organiser's assets, date, venue, verbatim | scenes | date hook → what happens → who → where/when → CTA |

Morph (`templates/engine-morph.html`) = one shape that never cuts and changes size, radius and ink while content swaps
inside it; seamless loops. Scenes (`templates/engine-scenes.html`) = kinetic type, real captures as cards, a counted proof
number and an end card, joined by hard cuts or iris transitions. Both share the same contract, so you can mix them.

## 2. Inputs (ask only if missing and material; otherwise use the default and say so)

| Input | Default |
|---|---|
| Subject + source | URL, app, brand files, or the person's work; required |
| Goal + audience | what the viewer should do or feel; for ads, the KPI the test will be judged on |
| Duration | 15–20 s (ads: 6–15 s; showreels: 30–60 s) |
| Formats | 9:16 first, then 1:1, 4:5, 16:9, all from one timeline |
| Language(s) | the audience's language(s). Check local language law for commercial ads (e.g. Québec requires French) and confirm with the client |
| Claims | verbatim from the source, with a source note. Performance claims need substantiation under local advertising law (e.g. Canada's Competition Act, the US FTC); flag them, don't decide them |
| Reference | a video to take the *grammar* from (pacing, transitions, type), never the content. Libraries: whatships.com |
| Music | original, synthesized at 120 BPM, or the client's track unchanged and measured |
| Character / mascot | only from a supplied asset; otherwise a real brand element becomes the recurring "character" |

## 3. Pipeline with gates (don't skip gates)

| Gate | Do | Artifact |
|---|---|---|
| G0 Brief | Fill `templates/director-brief.md` (logline, refs, look, beat sheet, deliverables) | `docs/brief.md` |
| G1 Assets | Collect real assets for the film type (§1). For sites, `capture.cjs site / clip / record`. List what you found and what you won't use. | `assets/ASSETS.md` |
| G2 Reference | `scripts/refscan.sh ref.mp4 docs/ref`: cuts, 4 fps sheets, transition strips, loudness, tempo. Name the grammar. | `docs/style_guide.md` |
| G3 Music | Synthesize (`music.py`) or measure (`beats.py`). Put every cut and accent on the grid. | `timeline.json` |
| G4 Story | Shot list on the grid (`templates/shotlist.md`). If the direction is open, offer 3 storyboard variants (`prompts/storyboard-variants.md`). | `docs/shotlist.md` |
| G5 Stills | One still per scene → contact sheet → critique (`prompts/critique-pass.md`) → fix. Then one frame per beat. Repeat until every score is 8+. | contact sheets, `docs/review_log.md` |
| G6 Draft | `SUB=1` render of one format to judge pacing; send it. | draft MP4 |
| G7 Final | All formats in parallel, per language and variant; SFX cues from timeline events + music; master to −14 LUFS; mux. | `out/<name>-<lang>[-<variant>]-<fmt>.mp4` |
| G8 QA + ship | `scripts/qa.sh` (decode, LUFS, contact, phone, strips, poster, loop seam, corners, sync). Commit source; git-ignore media. | README, contact, poster |

For long films, write `templates/ANIMATION_GUIDE.md` into `docs/` first, then split chapters across subagents.

## 4. Engine rules (`lib/motion.js`, `templates/engine-*.html`)

- One canvas and one pure `draw(t)`. No `Math.random` (use the seeded `rng`/`hash`), no timers, no CSS transitions and
  no state carried between frames. `render.cjs det` proves it.
- Use closed-form springs with a hair of overshoot (`spring(t, 170, 20)` ≈ 2.3 %). When a value changes target several
  times, **sum one spring per change** (`track`). For tab indicators, put each edge on a different spring.
- Content enters after its container starts morphing and leaves before the next morph (`swapAlpha`), with a short blur.
- Never fade black into the accent colour. Move an accent element between states, or iris a new background open.
- Layout is a function of the format (`?size=WxH`). Camera zoom/crop per format (`crop`, `cropV`); portrait pushes in.
  Reframe type and UI per format; don't crop blindly. Type never goes below 22 px at 1080 wide.
- Size containers for the longest language and variant string (French or German copy usually runs longer than
  English); check every language × variant in the contact sheet.
- Loops: `loopT(t, dur)`. The last frame must equal the first (SSIM ≥ 0.99).
- Motion blur averages N subframes, raised to 10–24 on fast moves (`fast`). **Never let subframes straddle a hard cut**:
  `subframeTimes` clamps them, otherwise you get a grey ghost frame.
- To blur a transition, render it to a layer and blur the layer once. `ctx.filter` on every draw call is ~100× slower.
- Batch big dot fields into a few `Path2D`s by quantized tone. For image sequences, decode lazily and evict old frames.
  Inject fonts as base64 `FontFace`, because file:// blocks font CORS.

## 5. Real assets, honestly used

- **Real UI only.** Crop and animate captures or recordings; never redraw product screens from imagination. If a style
  needs drawn UI (morph films), every word and number in it is verbatim from the product.
- The cursor or finger only performs actions the real product supports; otherwise it points.
- Record live animations frame-accurately: `page.clock.install()`, then `clock.runFor(1000/fps)` between clip screenshots.
- Third-party logos appear only where the client publicly features them; customer logos imply endorsement. Never
  invent stats, locations, testimonials, ratings or customers.
- **Placeholders can't ship:** `render.cjs video` refuses while copy has `[brackets]`, a stat has no number or an image is
  missing. Stills and sheets still work, for drafting.
- Licences: CC0 needs no credit, CC BY needs a credit line, fonts are usually OFL, and Remotion needs a company licence
  above 3 people. Store badges and device frames: use official artwork only, under the platform's marketing guidelines.

## 6. Ads and creative testing

- One timeline, many variants. `variants.B` deep-merges over the timeline (copy, scenes, keys, palette).
  Render with `--variant B` or `VARIANT=B`. Change one thing per variant (the hook, the CTA, the proof) so the test
  can attribute the result.
- The hook carries the first 1–2 s and must read with the sound off. The end card holds long enough to act on.
- Keep key content out of the platform UI zones. The engine's safe box is a conservative default (portrait: top 12 %,
  bottom 18 %); check the platform's current spec before delivery.
- The skill makes the variants; the test picks the winner. Judge on the downstream KPI (CPA/CPI to activation,
  retention, ROAS), not on CTR or thumb-stop rate alone.

## 7. Sound

- Use original music synthesized in numpy (`music.py`: drums, FM plucks, keys, sub bass; sampled piano via SFZ when it
  fits) or the client's track unchanged. No generic synth pads. For loops, render twice and keep the second pass.
- SFX come from `cues.py` → `sfx.mjs`, driven by timeline events (clicks, typing, morphs, scene changes). Something happens on every beat.
- Master with `master.py`: look-ahead limiter, −14 LUFS, true peak ≤ −1 dBTP. Avoid ffmpeg `loudnorm` in dynamic mode
  on dynamic music (it crushed a piano score's LRA from 9.6 to 5.7 LU).
- Verify sync: onsets within one frame of every cut (`qa.py sync`; treat its flags as items to review).

## 8. Banned looks

Corner labels, HUDs, timecodes, frame borders and crop marks. Also: a centered title on a gradient, everything
fading in, blurry upscaled text, dead beats with nothing happening, sliding instead of easing, and text overlapping
during swaps.

## 9. Gotchas already paid for

- `element.screenshot()` waits for "stable" and times out on animated pages → use `page.screenshot({clip})`.
- Dismiss cookie banners first. Scroll-driven sections need per-scroll-step captures.
- Probe the DOM before capturing: the "animation" may be a `<canvas>`, and the obvious selector may hit a marquee.
- Modern CSS returns `lab()`/`oklab()` colours; `capture.cjs` converts them to hex via canvas.
- In a repo with `"type": "module"`, `.js` is ESM, so Node CommonJS scripts are named `.cjs` (`lib/` carries its own package.json).
- Derive the cursor and every "hold" from t. A stateful pointer breaks parallel rendering.
- `pkill -f "<pattern>"` from a shell whose command line contains the pattern kills that shell.
- In contact sheets, sample ~0.3 s into each beat. Late samples catch content mid-exit and look empty.
- Concat lists use paths relative to the list file.
- Generate-then-trace (a video model makes base motion, code redraws on top) needs a video-generation API key and budget.
- Containers with a preinstalled browser: set `CHROMIUM_PATH` (e.g. `/opt/pw-browsers/chromium`) and don't run `playwright install`.

## 10. Files

| Path | Use |
|---|---|
| `templates/director-brief.md` · `shotlist.md` | G0 brief, G4 shot list |
| `templates/engine-scenes.html` + `timeline.scenes.json` | cut-based starter: kinetic type, capture cards with per-format crop, counted stat with source, end card, cursor passes, variants |
| `templates/engine-morph.html` + `timeline.morph.json` | one-shape starter: morphing container, camera zoom per format, layer blur, loop |
| `templates/ANIMATION_GUIDE.md` | rules for subagents writing chapters of a long film |
| `lib/motion.js` | `spring` `track` `indicator` `swapAlpha` `loopT` `segOf` `rng` `hash` `mixHex` `subframeTimes` `stagger` `E` |
| `scripts/capture.cjs` | `site` / `clip` / `record` |
| `scripts/refscan.sh` | reference breakdown |
| `scripts/render.cjs` · `render-all.sh` | `sheet` / `stills` / `video` / `det`; all formats in parallel → concat → mux |
| `scripts/music.py` · `cues.py` · `sfx.mjs` · `master.py` · `beats.py` | score, cues, SFX, mix + limiter, beat grid |
| `scripts/qa.sh` · `qa.py` · `setup.sh` | QA pass; toolchain setup |
| `prompts/` | critique pass, storyboard variants, director notes |
| `reference/` | lessons and house rules, the worked example, related repos and licences |

## 11. Quick start

```bash
S=.claude/skills/motion-reel; P=films/<name>                      # P = the film's project folder
bash $S/scripts/setup.sh                                           # prints PLAYWRIGHT_PATH / CHROMIUM_PATH to export
node $S/scripts/capture.cjs site https://example.com $P/assets      # web subjects; other subjects: see §1
bash $S/scripts/refscan.sh refs/ref.mp4 $P/docs/ref
cp $S/templates/engine-scenes.html $P/index.html; cp $S/templates/timeline.scenes.json $P/timeline.json   # or engine-morph
node $S/scripts/render.cjs $P sheet 1080x1920 $P/out/contact-V.png --lang en   # G5, one frame per beat
node $S/scripts/render.cjs $P det 1080x1920 3.2                               # no state between frames
python3 -I $S/scripts/music.py $P/timeline.json $P/out/music.wav
python3 -I $S/scripts/cues.py $P/timeline.json $P/out/cues.json en && node $S/scripts/sfx.mjs $P/out/cues.json $P/out/sfx.wav
python3 -I $S/scripts/master.py $P/out/audio.wav $P/out/music.wav:1 $P/out/sfx.wav:.8 --duration 8
SUB=1 bash $S/scripts/render-all.sh $P draft en $P/out/audio.wav V=1080x1920   # G6
bash $S/scripts/render-all.sh $P <name> en $P/out/audio.wav                     # G7: every format
VARIANT=B bash $S/scripts/render-all.sh $P <name> en $P/out/audio.wav           # hook test B
bash $S/scripts/qa.sh $P/out/<name>-en-V.mp4 $P/timeline.json                   # G8
```
`render.cjs` prints ms/frame. Plan one segment per CPU core. To use the skill elsewhere, copy this folder into that
repo's `.claude/skills/` or into `~/.claude/skills/`.

## 12. Deliverables

`out/<name>-<lang>[-<variant>]-<fmt>.mp4` (H.264 yuv420p, AAC, faststart), `contact.png`, `poster.png`,
`loop_check.mp4` when looping, `README.md` with sources and credits, and clean source committed (media git-ignored).
For files over the share limit, make a two-pass ~3.5 Mbps share copy and keep the master. Close with what's real vs
written by us, and what you'd improve next.
