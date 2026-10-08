# SaaSDemo: an unofficial 15 s concept demo for TOMSO

Remotion 4.0.534 · 1920×1080 · 30 fps · 450 frames · English (`SaaSDemo`) and French (`SaaSDemoFR`).
Three payment portals (Rent roll, Bank portal, Supplier bills) are gathered by a cursor into one overview.
The UI is original and the data is illustrative. A "Concept demo" label stays on screen throughout. See `brief.md` for scope, `style-guide.md`
for the look, `storyboard.md` for every frame, and `review.md` for the checks and open issues.

## Run

```sh
cd films/saas-demo
npm ci                      # exact versions from package-lock.json
npm run dev                 # Remotion Studio (interactive preview) at http://localhost:3000
npm run check               # tsc + ESLint (both must pass before a render)
```

## Render (the commands used for the delivered files)

| Output | Command | Notes |
|---|---|---|
| `out/preview-lowres.mp4` | `npm run render:lowres` → `remotion render SaaSDemo out/preview-lowres.mp4 --scale=0.5` | 960×540 draft, about 20 s to render |
| `out/preview.mp4` | `npm run render:preview` → `remotion render SaaSDemo out/preview.mp4` | final, H.264 + AAC, about 30 s |
| `out/preview-silent.mp4` | `npm run render:silent` → `remotion render SaaSDemo out/preview-silent.mp4 --muted` | same picture, no audio stream, for comparison |
| `out/preview-fr.mp4` | `npm run render:fr` → `remotion render SaaSDemoFR out/preview-fr.mp4` | French copy |
| one still | `npx remotion still SaaSDemo out/f240.png --frame=240` | |
| lossless frames | `npx remotion render SaaSDemo out/frames --sequence --image-format=png` | input for `scripts/hold-check.py` |

The first render downloads Remotion's Chrome Headless Shell into `node_modules/.remotion/` (`npx remotion browser ensure`).

## Review tooling

```sh
npm run review                                     # = bash scripts/review.sh out/preview.mp4 review
bash scripts/review.sh out/preview-fr.mp4 review fr-
python3 -I scripts/cue-check.py out/preview.mp4    # each sound cue audible on its frame (needs numpy)
python3 -I scripts/hold-check.py out/frames        # headlines, label and final hold are pixel-still (needs numpy)
```

`scripts/review.sh` writes `review/contact-seconds.png` (one frame per second plus the last frame), `contact-boundaries.png`
(frames 88–91, 208–211, 358–361), `phone-360.png`, `phone-844.png` and `waveform.png`. It also prints the ffprobe facts, decode errors,
sample and true peaks, and loudness. It needs ffmpeg with `drawtext` and the DejaVu Sans Mono font (override with `REVIEW_FONT=`).

## Where things live (edit the data, not the components)

| What | File |
|---|---|
| All on-screen words, EN and FR (`brandLine: ""` removes the company name) | `src/content/copy.ts` |
| Colours, type sizes, layout geometry | `src/content/theme.ts` |
| Every frame number, spring configs, cursor path, sound cues | `src/content/timeline.ts` |
| Asset paths | `src/content/assets.ts` |
| Font loading (`@remotion/fonts` `loadFont`) | `src/fonts.ts` |
| Composition registration | `src/Root.tsx` |
| Layers | `src/SaaSDemo.tsx`, `src/components/*` |

## Asset requirements

| Asset | Path | Source | Licence | Regenerate |
|---|---|---|---|---|
| Instrument Serif 400, latin woff2 | `public/fonts/instrument-serif-latin-400-normal.woff2` | `@fontsource/instrument-serif` 5.3.0 | SIL OFL 1.1 (`public/fonts/LICENSE-instrument-serif.txt`) | `npm run fonts` |
| Archivo variable (wght 100–900), latin woff2 | `public/fonts/archivo-latin-wght-normal.woff2` | `@fontsource-variable/archivo` 5.3.0 | SIL OFL 1.1 (`public/fonts/LICENSE-archivo.txt`) | `npm run fonts` |
| click / move / complete (48 kHz 16-bit mono WAV) | `public/sfx/*.wav` | synthesized by `scripts/make-sfx.mjs` (seeded, deterministic) | original | `npm run sfx` |

No images, logos, screen captures, stock audio or paid services are used. The latin font subsets cover the French accents used here.

## Licences and caveats

- **Remotion** is free for individuals, for-profit companies with up to 3 employees, and non-profits. Other companies need a [company licence](https://www.remotion.pro/license). This film was made as a personal project.
- **TOMSO** is named only in plain type, as "unofficial", with no logo, testimonials or performance claims. TOMSO has not seen or approved this film.
- The mix has not been listened to by a person yet (see `review.md`).
