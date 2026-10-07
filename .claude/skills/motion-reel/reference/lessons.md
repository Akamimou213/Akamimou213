# Lessons from the films that built this skill

Source code for the Walaw films lives in `walaw-promo/` in this repo; media is git-ignored.

| Film | Format | What it proved | Numbers |
|---|---|---|---|
| 15 s showreel | — | pure `draw(t)` + subframe motion blur + parallel segment render | — |
| 60 s piano showreel | 16:9 1080p | original sampled-piano score (Salamander SFZ, CC BY 3.0, credited), every cut on a note onset | loudnorm crushed LRA 9.6 → 5.7 LU; custom limiter kept dynamics at −14 LUFS |
| 10 s "who I am" intro | — | no corner text or frames; corner-emptiness check | — |
| Walaw 20 s promo (`walaw-promo/`) | 9:16 → 1:1, 16:9; EN/FR | real captures only, asset list before animating, contact sheet per beat before render, 120 BPM synthesized music | 40-beat sheet |
| Walaw variant A (`walaw-promo/a/`) | 16:9 60 fps; EN/FR | reference remake (grammar, not content); the site's own waveform recorded with the fake clock as the recurring "character"; Inter Italic accent words; hard cuts at 7 s and 11 s with clamped subframes; adaptive 8–24 subframes on fast moves | — |
| Walaw morph film (`walaw-promo/morph/`) | 9:16, 1:1, 4:5, 16:9; FR (Québec) | one shape, never cut; summed springs; stretching tab indicator; Québec dot map (Natural Earth admin-1, Québec Lambert); seamless audio+video loop | loop seam SSIM 0.997; −14.1 LUFS; map frames 70 s → ~1 s after layer blur + Path2D bins |

## What the user cared about (keep doing this)
- Real product UI, real logo, real fonts and colours, verbatim copy. No placeholders. Captures over redraws.
- French for Québec audiences; every word in the brand's context.
- Momentum: deliver a watchable draft quickly. "Where is the video?" means you waited too long at a checkpoint.
- Time-boxed research: one question took too long (per-clinic locations). The fix was to drop the per-clinic dots and
  show only the province fill plus a sourced, non-numeric line.
- Stop when told: "enough for the four renders" means no more renders.
- No generic synth pads. No corner labels, frames or HUDs.

## Failures worth remembering
- Gray ghost frames at hard cuts: the subframe shutter straddled the cut → `subframeTimes(..., hardCuts)`.
- Element screenshots timed out on animated pages → clip screenshots.
- Wrong element captured (customer-logo marquee instead of the waveform) → probe the DOM first; the waveform was a `<canvas>`.
- A stateful pointer "hold" broke parallel rendering → derive the cursor purely from t.
- A concat list with paths relative to the wrong folder → paths are relative to the list file.
- JSON tagline nesting typo rendered stray letters → validate the copy structure in the contact sheet.
- FR copy longer than EN broke per-word timings → timing falls back when word counts differ.
- A card cycled into a state that the site didn't show at that moment → clamp captured sequences to the frames you mean.
- A 54 MB master exceeded a 30 MB send limit → two-pass ~3.5 Mbps share copy.
