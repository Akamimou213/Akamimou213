---
name: motion-reel
description: Make a product, brand or showreel motion video rendered entirely from code (one canvas + headless Chrome + ffmpeg) with an original or supplied soundtrack. Use when the user asks for a launch video, showreel, product reel, motion ad, animated explainer, morph film, "make a video for <URL>", or wants a reference video's style rebuilt for their brand.
---

# Motion reel

The one-liner gets a clip; the harness gets a studio. This skill is the harness: a director's brief,
real assets, a pure `draw(t)` engine on a beat grid, a critique loop on rendered frames, and a
render/sound/QA pipeline that exports every format from one timeline.

Everything here was proven on the Walaw films (15 s, 20 s, 60 s and a 20 s morph film; 16:9, 9:16, 1:1, 4:5; EN/FR).

## 0. Operating mode

- **Keep momentum.** Show each gate's artifact (asset list, storyboard, contact sheet), then keep working.
  Stop and wait only when the brief or user says so. A user who asks "where is the video?" wanted a draft.
- **Time-box research to ~10 minutes per question.** If per-item data (e.g. every customer address) can't be
  verified quickly, design around it, say so, and move on. Never invent it.
- **Say what is real vs dramatized** in every delivery (copy, data, UI, claims).
- One timeline file is the single source of truth: times, copy per language, events. Notes become one-line edits.

## 1. Inputs (ask only if missing and material; otherwise use the default and say so)

| Input | Default |
|---|---|
| Product + URL | required |
| Duration | 15–20 s |
| Formats | 9:16 first, then 1:1, 16:9, 4:5, all from one timeline |
| Language(s) | site language; **Québec audience → French** (Charter of the French language s.58; confirm with client) |
| Reference | a video/frames to take the *grammar* from (never the content). Library: whatships.com |
| Music | synthesize at 120 BPM, or use the user's track unchanged |
| Metric + CTA | take from the site verbatim; flag that claims need substantiation (Competition Act) |
| Character / mascot | only from a supplied asset; otherwise use a real brand element as the "character" |

## 2. Pipeline with gates (don't skip gates)

| Gate | Do | Artifact |
|---|---|---|
| G0 Brief | Fill `templates/director-brief.md` (logline, refs, look, beat sheet, deliverables) | `docs/brief.md` |
| G1 Assets | `scripts/capture.cjs <url> ./assets` — screenshots, DOM text, CSS tokens, fonts, logos, element clips, the site's own animations recorded at 30/60 fps with Playwright's fake clock. List what you found. | `assets/ASSETS.md` |
| G2 Reference | `scripts/refscan.sh ref.mp4 docs/ref` — cuts, 4 fps sheets, transition strips, audio loudness/onsets. Name the grammar (cut count, type pairing, accent element, signature transitions, pacing). | `docs/style_guide.md` |
| G3 Music | Synthesize or measure. `scripts/beats.py track.wav > beats.json`. Put every cut and accent on the grid. | `timeline.json` |
| G4 Story | Shot list on the beat grid (`templates/shotlist.md`). If the direction is open, offer **3 storyboard variants** and let the user pick. | `docs/shotlist.md` |
| G5 Stills | One still per scene → contact sheet → critique (`prompts/critique-pass.md`) → fix. Then one frame per beat. ≥3 rounds, every score 8+. | `out/contact-*.png`, `docs/review_log.md` |
| G6 Draft | Quick render (all frames, fewer subframes) to judge pacing; send it. | draft MP4 |
| G7 Final | Render every format in parallel (2 segments per format), sound pass (`scripts/sfx.mjs` cues from timeline events + music), `scripts/master.py` to −14 LUFS, mux. | `out/<name>-<lang>-<fmt>.mp4` |
| G8 QA + ship | `scripts/qa.sh out/final.mp4` (decode, LUFS, contact, strip, phone, loop seam SSIM). Commit source, git-ignore media. | README, contact, poster |

For long films: write `templates/ANIMATION_GUIDE.md` into `docs/` first, then split chapters across subagents.

## 3. Engine rules (`lib/motion.js`, `templates/engine.html`)

- One canvas. One pure `draw(t)`; expose `window.seek = draw`. No `Math.random` (use the seeded `rng`), no timers,
  no CSS transitions, no state carried between frames. Frame 812 renders without simulating 0–811.
- Closed-form springs with a hair of overshoot (`spring(t, 170, 20)` ≈ 2 %). When a value changes target several
  times, **sum one spring per change** (`track`). Tab indicators stretch: lead and trail edges on different springs.
- Content enters after its container starts morphing and leaves before the next morph (`swapAlpha`), with a short blur.
- Never fade black into the accent colour; move an accent element between states instead.
- Layout is a function of the format (`?size=WxH`), never fixed pixels. Camera zooms so every state fills the frame;
  portrait formats push in further. Reframe type and UI per format, don't crop.
- Loop: `loopT(t, dur)`; last frame must equal the first (check SSIM ≥ 0.99).
- Motion blur = average N subframes. Raise N (10–24) on fast moves. **Never let subframes straddle a hard cut**
  (clamp sample times to `cut − ε`), or you get a grey ghost frame.
- Blur transitions by drawing the state to a layer and blurring the layer once. `ctx.filter` on every draw call is
  ~100× slower (a 12k-dot map took 70 s/frame).
- Big dot fields: batch into a few `Path2D`s by quantized tone.
- Image sequences: decode lazily per frame, evict LRU; fonts: inject the site's woff2 as base64 `FontFace` (file:// blocks font CORS).

## 4. Real assets, honestly used

- **Real product UI only.** Crop and animate captures; never redraw screens from imagination. For a morph film the UI
  is drawn, so every word and number in it must be verbatim from the product/site.
- The cursor only performs actions the real UI supports (a Play button, a CTA, scrolling). Otherwise it points.
- Record the site's own animations: `page.clock.install()` then `clock.runFor(1000/fps)` between clip screenshots.
- Third-party logos only when the brand publicly features them as case studies. Never invent stats, locations,
  testimonials or customers. Our own copy is labelled as ours in the delivery note.
- Licences: CC0 samples need no credit; CC BY (e.g. Salamander piano) needs a credit line; fonts OFL;
  Remotion needs a company licence above 3 employees.

## 5. Sound

- Original music synthesized in numpy (kick/clap/hat, FM plucks, saw stabs, sub bass, sampled piano via SFZ) or the
  user's track unchanged. For loops: render the music twice and keep the second pass so tails wrap.
- SFX: `scripts/sfx.mjs` voices (click, pop, thump, whoosh) driven by cues generated from timeline events
  (every click, keystroke batch, morph, expansion). Something happens on every beat.
- Master with `scripts/master.py` (look-ahead limiter, −14 LUFS, true peak ≤ −1 dBTP; ours measured −1.3 to −1.4). Don't use ffmpeg `loudnorm`
  in dynamic mode on music with dynamics: it crushed a piano score's LRA from 9.6 to 5.7 LU.
- Verify sync: onsets within one frame (≤ 33 ms at 30 fps) of every cut.

## 6. Banned looks

Corner labels, HUDs, timecodes, frame borders, crop marks, centered title on a gradient, everything fading in,
blurry upscaled text, dead beats with nothing happening, sliding instead of easing, text overlapping during swaps.

## 7. Gotchas we already paid for

- `element.screenshot()` waits for "stable" and times out on animated pages → use `page.screenshot({clip})`.
- Dismiss cookie banners before capturing; scroll-driven sections need per-scroll-step captures.
- A repo with `"type": "module"` treats `.js` as ESM → name Node CommonJS scripts `.cjs`.
- `pkill -f "<pattern>"` inside a shell whose command line contains the pattern kills that shell.
- Contact sheets: sample ~0.3 s into each beat; sampling late catches content mid-exit and looks empty.
- `generate-then-trace` (video model renders base motion, code redraws on top) needs a video-generation API key
  (e.g. fal / Seedance); without one, all motion is hand-coded springs.
- Playwright in this container: `CHROMIUM_PATH=/opt/pw-browsers/chromium`; never run `playwright install`.

## 8. Files in this skill

| Path | Use |
|---|---|
| `templates/director-brief.md` | G0 brief to fill (logline, refs, look, beat sheet, gates, deliverables) |
| `templates/shotlist.md` | G4 shot list on the beat grid |
| `templates/timeline.example.json` | single source of truth: bpm, duration, loop, formats, fonts, palette, keys, events, copy per language, sources |
| `templates/engine.html` | starter `draw(t)` engine: one morphing shape, camera zoom per format, layer blur, subframe composer |
| `templates/ANIMATION_GUIDE.md` | rules for subagents writing chapters of a long film |
| `lib/motion.js` | `spring`, `track`, `indicator`, `swapAlpha`, `loopT`, `segOf`, `rng`, `hash`, `mixHex`, `subframeTimes`, `stagger`, easings |
| `scripts/capture.cjs` | `site` / `clip` / `record` real assets |
| `scripts/refscan.sh` | reference breakdown: cuts, 4 fps sheets, strips, loudness, beats |
| `scripts/render.cjs` | `sheet` / `stills` / `video` / `det` (determinism) |
| `scripts/render-all.sh` | all formats in parallel segments → concat → mux |
| `scripts/music.py` · `cues.py` · `sfx.mjs` · `master.py` · `beats.py` | score, cue list from timeline, SFX voices, mix + limiter to −14 LUFS, beat grid |
| `scripts/qa.sh` · `qa.py` | probe, decode, LUFS, contact, phone, strips, poster, loop seam SSIM, corners, onset sync |
| `prompts/critique-pass.md` · `storyboard-variants.md` · `director-notes.md` | G5 scoring loop, G4 three variants, how to give and take notes |
| `reference/lessons.md` · `repos.md` | what each Walaw film proved, failures already paid for, related repos, licences |

## 9. Quick start

```bash
S=.claude/skills/motion-reel; P=films/<name>            # P = the film's project folder
export CHROMIUM_PATH=/opt/pw-browsers/chromium            # + PLAYWRIGHT_PATH if playwright isn't in node_modules (bash $S/scripts/setup.sh)
node $S/scripts/capture.cjs site https://example.com $P/assets [--lang FR]
bash $S/scripts/refscan.sh refs/ref.mp4 $P/docs/ref
cp $S/templates/engine.html $P/index.html; cp $S/templates/timeline.example.json $P/timeline.json   # then edit both
node $S/scripts/render.cjs $P sheet 1080x1920 $P/out/contact-V.png --lang fr      # G5: one frame per beat
node $S/scripts/render.cjs $P det 1080x1920 3.2                                    # no state between frames
python3 -I $S/scripts/music.py $P/timeline.json $P/out/music.wav
python3 -I $S/scripts/cues.py $P/timeline.json $P/out/cues.json fr && node $S/scripts/sfx.mjs $P/out/cues.json $P/out/sfx.wav
python3 -I $S/scripts/master.py $P/out/audio.wav $P/out/music.wav:1 $P/out/sfx.wav:.8 --duration 20 --loop
SUB=1 bash $S/scripts/render-all.sh $P draft fr $P/out/audio.wav V=1080x1920      # G6 draft
bash $S/scripts/render-all.sh $P <name> fr $P/out/audio.wav                         # G7 all formats
bash $S/scripts/qa.sh $P/out/<name>-fr-V.mp4 $P/timeline.json                       # G8
```
render.cjs prints ms/frame per segment; the morph film ran ~1 s/frame per worker on its heaviest (map) frames. Plan segments per CPU core.
To use this skill in another repo, copy this folder to that repo's `.claude/skills/`, or to `~/.claude/skills/`.

## 10. Deliverables

`out/<name>-<lang>-<fmt>.mp4` (H.264 yuv420p, AAC, faststart), `out/contact.png`, `out/poster.png`,
`out/loop_check.mp4` when looping, `README.md`, clean source committed (media git-ignored). Files over 30 MB:
make a two-pass ~3.5 Mbps share copy and keep the master. Close with what you'd improve next.
