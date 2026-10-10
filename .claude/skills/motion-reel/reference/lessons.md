# Lessons and house rules

## House rules (this user's standing preferences, for every film)
- Use real product UI, real logo, real fonts and colours, and verbatim copy. No placeholders. Prefer captures over redraws.
- Write in the audience's language, with every word in the subject's own context (the worked example: Québec French).
- Keep momentum: deliver a watchable draft fast. "Where is the video?" means you waited too long at a checkpoint.
- Time-box research. If verification stalls, design around the missing data and say so.
- Stop when told ("enough for the renders").
- No generic synth pads. No corner labels, frames or HUDs: those read as AI-made.
- Judge ads on downstream outcomes, not on views or CTR.

## What each film proved (methods are general; subjects were specific)

| Film | Formats | What it proved | Numbers |
|---|---|---|---|
| 15 s motion showreel | — | pure `draw(t)` + subframe motion blur + parallel segment render | — |
| 60 s piano-scored showreel | 16:9 1080p | original sampled-piano score (Salamander SFZ, CC BY 3.0, credited), every cut on a note onset | loudnorm crushed LRA 9.6 → 5.7 LU; custom limiter kept dynamics at −14 LUFS |
| 10 s "who I am" intro | — | no corner text or frames; corner-emptiness check | — |
| Product promo (worked example) | 9:16 → 1:1, 16:9; EN/FR | real captures only, asset list before animating, a contact sheet per beat before rendering, 120 BPM synthesized music | — |
| Reference remake (worked example) | 16:9 60 fps; EN/FR | took a reference's grammar, not its content; the site's own animation recorded with the fake clock as the recurring "character"; italic accent words; hard cuts with clamped subframes; adaptive 8–24 subframes | — |
| One-shape morph film (worked example) | 9:16, 1:1, 4:5, 16:9 | one shape, never cut; summed springs; stretching tab indicator; dot-matrix region map from public-domain data; seamless audio + video loop | loop seam SSIM 0.997; −14.1 LUFS; map frames 70 s → ~1 s after layer blur + Path2D bins |

## Failures worth remembering (and the fix that's now in the skill)
| Failure | Fix |
|---|---|
| Grey ghost frames at hard cuts | subframe shutter straddled the cut → `subframeTimes(..., hardCuts)` |
| Element screenshots timed out on animated pages | clip screenshots |
| Captured the wrong element (a logo marquee instead of the animation) | probe the DOM first; the animation was a `<canvas>` |
| A stateful pointer "hold" broke parallel rendering | derive cursor and holds purely from t |
| Concat list paths resolved against the wrong folder | paths are relative to the list file |
| JSON nesting typo rendered stray letters | read copy in the contact sheet, not only in code |
| Translated copy longer than the source broke per-word timings | timing falls back when word counts differ; fit type per language |
| A recorded UI sequence drifted into a state the brand didn't mean to show | clamp captured sequences to the intended frames |
| Map frames took 70 s each | blur a layer once; batch dots into `Path2D` bins |
| A 54 MB master exceeded a 30 MB send limit | two-pass ~3.5 Mbps share copy |
| Research on per-item locations ran long | time-box; show only what's verified |
| Fresh template crashed the first contact sheet: listed font file not there yet | a missing font is an unfinished item like a missing image; drafts fall back |
| A seven-digit stat ran off both edges in 9:16 | fit the final value to the safe box once; group digits by locale |
| Corner QA flagged every iris transition | only corners busy for ≥ 1 s count (labels persist, transitions pass) |
| Video encoded untagged: players guessed BT.601, brand colours drifted | encode and tag BT.709 limited range; `qa.sh` checks tags |
| Caption words crowded: measured with negative tracking, drawn without | measure with the exact font state you draw with |
| Brand-blue caption highlight read at 2:1 on its black outline | lift the accent toward white in OKLab until 4.5:1; judge outlined text against its outline |
| VO carve produced NaN and broke the limiter (+1 dBTP) | clamp the smoothed square before `sqrt` |
| Downbeat landed on beat 3: kicks on 1 and 3 were equal | add chord-change (chroma) novelty; warn, don't shift, on off-beat low end |

## Ideas adopted from other skills (2026-10-10)
Vetted 16 motion-skill repos and 5 engines (`repos.md`); the numbers we adopted are in `craft.md`: reading holds, duration
bands, vector law, captions and VO rules, voice carve, hook gate, frame-0 thumbnail rule, BT.709, OKLab, text/contrast probe,
dead-stretch and flash detectors.

