# Review log: SaaSDemo

Findings use video time as **t = seconds (frame)** at 30 fps. Pass times are UTC on 2026-10-08. Each pass fixed its three most important defects, and the request allowed three passes at most, so the review stops after pass 3.

## Checks: what was run and what was not

| Check | Status | Result (final render, `out/preview.mp4`) |
|---|---|---|
| `npm run typecheck` (tsc 5.9.3) | **run, passes** | 0 errors |
| `npm run lint` (ESLint 9 + `@remotion/eslint-config-flat` 4.0.534) | **run, passes** | 0 problems |
| Low-res preview covering all four scenes | **run** | `out/preview-lowres.mp4`, 960×540, 450 frames |
| Duration, size, frame rate (ffprobe) | **run, passes** | 1920×1080, 30/1 fps, **450 frames**, video 15.000 s; container 15.019 s because of AAC padding (see open issues) |
| Audio stream present | **run, passes** | AAC, 48 kHz, stereo. The silent export has no audio stream, as intended |
| Decode errors (`ffmpeg -f null`) | **run, passes** | none |
| Clipping and peaks | **run, passes** | sample peak −10.2 dBFS (target ≤ −6), true peak −10.2 dBTP (target ≤ −1), integrated −26.6 LUFS (SFX only, no music) |
| Cue sync: each cue audible on its interaction frame | **run, passes** | clicks at 110/126/142/166 within +0.00 f; movement at 168 within +0.36 f; completion at 228 within +0.04 f (`scripts/cue-check.py`) |
| Headline holds pixel-still (lossless PNG frames) | **run, passes** | H1 frames 24–191, H2 frames 240–343, support line 258–343: 0 px changed |
| Final 3 s hold (frames 360–449, whole frame) | **run, passes** | 0 px changed |
| "Concept demo" label on all 450 frames, static | **run, passes** | 0 px changed above 2/255 |
| Determinism (frame rendered alone vs inside the sequence) | **run, passes** | frame 180 (mid-gather) on the final render; frames 172 and 300 on the pass-2 render: identical |
| Contact sheet, 1 frame per second plus the last frame | **run, inspected** | `review/contact-seconds.png` |
| Frames around every scene boundary (88–91, 208–211, 358–361) | **run, inspected** | `review/contact-boundaries.png` |
| Phone-size readability, 360 px (portrait, inline) and 844 px (landscape) | **run, inspected** | `review/phone-360.png`, `review/phone-844.png`. Results are in the readability table below |
| Cursor continuity | **run, inspected** | `review/gather-166-199.png` and the per-second sheet. The cursor travels between keys, never jumps, and fades only after it stops (184–195) |
| French version fit | **run, inspected** | `review/fr-*.png` |
| **Listening to the mix** | **not run** | I can't hear audio. Peaks and timing are measured, but whether it sounds right is not. **Please listen to `preview.mp4` and say if the clicks are too sharp or the chime too loud.** |
| Remotion Studio interactive preview | **not run** | Studio needs a browser on your side, and this was a cloud session. `npm run dev` starts it locally |
| Playback on a real phone or in a social-platform upload | **not run** | |
| Legal review of naming TOMSO | **not run** | out of scope; see `brief.md` → Licences and risks |

### Readability at phone size (final render)

| Text | 360 px wide | 844 px wide |
|---|---|---|
| Headlines (150 px Instrument Serif) | readable | readable |
| Support line, brand line (44 / 40 px) | readable, small | readable |
| Card labels "Rent roll / Bank portal / Supplier bills" (38 px) | readable, small | readable |
| "Concept demo" pill (32 px) | legible, about 6 px | readable |
| "Unofficial · illustrative data" (26 px) | **not legible** | readable |
| Row text and status chips (26 / 19 px) | texture only, by design | readable |

## Spring tuning (gather)

The baseline was `spring({ mass: 1, stiffness: 180, damping: 22 })`. I measured it with Remotion's `measureSpring` at 30 fps: it comes to rest after **16 frames**, peaks at **1.011 at frame 12 (1.1% overshoot)**, and the damping ratio is about 0.82. On the largest move (Bank portal, 207 px) the overshoot is about 2 px, which you can't see. The gather reads as a calm, decisive settle, and the 4-frame stagger keeps the three cards from moving as one block. **Kept as is.** If you want it livelier, the next step is damping 18 (about 4% overshoot).

## Pass 1: 08:01Z (low-res preview, all four scenes)

Scores (out of 10): hook 6 · readability 8 · motion 8 · variety 7 · composition 8 · brand/honesty 8 · sync 9

1. **t = 14.97 s (449), the final hold:** the end-card line wrapped as "An unofficial concept for / TOMSO", leaving TOMSO alone on a line for the whole 3-second hold. The French line had the same problem. → Fixed with forced line breaks in `copy.ts` ("An unofficial concept / for TOMSO"), and support lines now respect `\n`.
2. **t = 2.00–10.00 s, French version:** "Portail bancaire" ran into the count badge, and the French support line wrapped to 3 lines. → Fixed: per-language card-label size (EN 38 px, FR 34 px), a guaranteed 12 px gap before the badge, and a shorter French line ("Tous vos paiements, / au même endroit.").
3. **t = 0.00 s (0):** the first frame was empty paper plus the label, a weak first frame and thumbnail. → Fixed: card entrances are pre-rolled (Rent roll −6, Supplier bills −4, Bank portal +2).

## Pass 2: 08:10Z (full-res `preview.mp4`)

Scores: hook 8 · readability 7 · motion 8 · variety 7 · composition 8 · brand/honesty 9 · sync 8

1. **All frames, phone at 360 px:** the "Concept demo" label rendered at about 5 px, so the required label wasn't readable on a phone in portrait. → Raised to 32 px for the pill and 26 px for the note, and verified that it still clears the cards in both languages. The pill is now legible at 360 px. The note line still isn't (see open issues).
2. **t = 6.03–6.80 s (181–204):** the cards landed on bare paper, and the window then faded in afterwards with a muddy grey header, so the "gather into one overview" read as two separate events. → The window now forms at 176–185, while the last card is still landing, with a smaller scale change (0.985→1).
3. **t = 5.60 s (168), audio:** the movement cue's soft 0.27 s swell made it audible 1.64 frames after the cards started moving. → Shortened its attack to 120 ms and its fade-in to 10 ms. It is now audible at +0.36 frames.

## Pass 3: 08:13Z (full-res `preview.mp4`, final)

Scores: hook 8 · readability 8 · motion 8 · variety 7 · composition 8 · brand/honesty 9 · sync 9

1. **t = 6.03–6.73 s (181–202):** the newly formed window showed an empty footer band for about 0.7 s. → The footer (the NSF item) now rises in at 190–199.
2. **t = 6.20–6.67 s (186–200):** "Too many tabs." sat next to a finished, tidy overview, so the line contradicted the picture. → Headline 1 now leaves at 192–199, as the window lands.
3. **t = 0.00 s (0):** after pass 1, frame 0 showed the Supplier bills card at 25% opacity, a ghost card with text showing through. → Card fade-in shortened from 8 to 4 frames, and Supplier bills pre-rolled to −4. Frame 0 now shows two solid cards rising.

After pass 3, the final checks in the table above were re-run on the final render.

## Open issues for your review

1. **The mix hasn't been listened to.** Integrated loudness is −26.6 LUFS, deliberately quiet for three restrained cues with no music. That is well below the −14 LUFS that platforms normalise to, so on social feeds it will play quieter than the content around it. If it is going to run with sound on, add a music bed or raise the cue gains in `timeline.ts → CUES`. There is plenty of headroom (peak −10.2 dBFS).
2. **"Unofficial · illustrative data" is not legible at 360 px wide.** Making it readable there needs about 44 px, which would no longer be a small label. The pill "Concept demo" is legible. Your call.
3. **The container duration is 15.019 s, not 15.000 s.** The video track is exactly 450 frames and 15.000 s. The extra 19 ms is AAC priming and padding added by the encoder. The silent export is exactly 15.000 s.
4. **The left column is empty for about 1 s** (frames 200–227) between "Too many tabs." and "One clear view.", while the chips flip. This is intentional, to keep attention on the overview, but it is the quietest stretch of the film.
5. **The end card has no destination.** "Explore the demo." is the requested copy, but there is no URL or button, because this concept has no real demo to link to.
6. **Naming TOMSO:** the name appears in plain type with "unofficial" and never as a logo. Before using this outside a portfolio, ask TOMSO, or set `brandLine` to "".
7. **`npm audit`** reports a high-severity ReDoS in `braces`, pulled in by the lint toolchain (`@remotion/eslint-config-flat` → typescript-eslint → fast-glob). It is development-only, isn't in the render path, and has no fix upstream yet.
