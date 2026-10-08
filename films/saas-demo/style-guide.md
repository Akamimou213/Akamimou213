# Style guide: SaaSDemo

Gate G2 of `/motion-reel`. All values here also live in code, in `src/content/theme.ts`. That file is the one to edit, and this page explains the choices.

## 1. Reference analysis: tomso.ca (principles only)

I captured tomso.ca at 1440×900 on 2026-10-08 (scroll screenshots plus computed styles) and used it only to read principles. No pixels, illustrations, logos or font files from the site are used in the film.

| What the site does | Measured | Principle we take | What we do instead of copying |
|---|---|---|---|
| Warm near-black ink on warm off-white, not pure black on white | ink `#262423`, paper `#F6F5F2`, white cards | Warm neutrals carry 90% of the frame | Our own warm pair: ink `#23211F`, paper `#F4F2EC` |
| One acid-lime highlight, used sparingly (CTA, section tint) | `#E4FF7A`, tint `#EAF6C3` | One bright accent means "go / done" | Lime `#D9F26A` for selected and resolved states and nothing else |
| Editorial serif headlines in sentence case, regular weight, tight leading | Faculty Glyphic 400, 42–64 px, line-height 1.1 | Calm, editorial voice; no bold shouting | Instrument Serif 400 (OFL, already in this repo) |
| Grotesk UI text; mono, uppercase micro-labels with tracking on buttons and stat chips | Geist 400–500, Geist Mono 500 13–15 px | UI reads as product, headlines read as voice | Archivo (OFL variable font, already in this repo) for all UI; uppercase tracked chips |
| Thin single-weight line drawings (sine wave, overlapping circles connecting systems) | ~1.5 px strokes | Diagrammatic, no gradients, no 3D | Flat cards, hairline borders, no gradients |
| Rounded but tight radii, hairline card borders, almost no shadow | 4–8 px radii, 1 px borders | Quiet surfaces | 18 px radius on 352 px cards (proportional at video scale), 1.5 px hairlines, a shadow only while cards are "loose" |

## 2. Direction: restrained typographic, two accents

- **Voice:** one serif headline at a time, in the left column, always in the same place. The UI does the moving and the words hold still.
- **Accent 1, lime `#D9F26A`:** selection, resolved status, the "Combine" button. It means "handled".
- **Accent 2, coral `#E5674B`:** attention badges and the single NSF row. It means "needs a person". It is never used for decoration.
- An accent appears on one kind of element at a time: coral leads in scene 1 and lime takes over from frame 168 on.

## 3. Palette (`theme.ts → colors`)

| Token | Hex | Use |
|---|---|---|
| `paper` | `#F4F2EC` | background, all frames |
| `card` | `#FFFFFF` | cards, overview window |
| `ink` | `#23211F` | headlines, UI text, overview header bar, cursor |
| `muted` | `#6B675F` | secondary UI text, support lines |
| `line` | `#D8D4CA` | hairlines, row dividers |
| `lime` | `#D9F26A` | accent 1 |
| `limeTint` | `#EEF8C8` | resolved chip background |
| `limeInk` | `#3E4A0E` | text on lime tint (WCAG contrast 8.6:1) |
| `coral` | `#E5674B` | accent 2 |
| `coralTint` | `#FBE4DD` | attention chip background |
| `coralInk` | `#9E3B25` | text on coral tint (WCAG contrast 5.6:1) |

## 4. Type (`theme.ts → type`)

| Role | Font | Size @1920 | At 360 px wide (phone, portrait inline) | Notes |
|---|---|---|---|---|
| Headline | Instrument Serif 400 | 150 px, line-height 0.98, tracking −0.01 em | 28 px | two lines max, set with explicit line breaks |
| Support line | Archivo 400 | 44 px | 8 px | one line under the headline (scene 3 only) |
| End-card brand line | Archivo 500 | 40 px | 7.5 px | |
| Card label (tab) | Archivo 600 | 38 px (FR 34 px) | 7 px | the three words the story depends on |
| UI row text | Archivo 500, tabular numbers | 26 px | 5 px | texture: it shows there is data, it does not need reading |
| Status chip | Archivo 600, uppercase, +0.06 em | 19 px | 3.5 px | read by colour, not by word |
| Concept label | Archivo 600 / 500 | 32 px / 26 px | 6 px / 5 px | see §6 |

Readability rule: headlines (and the brand line) must read at 360 px wide. Card labels must read at a landscape phone width (about 844 px wide, so 17 px). Rows and chips are texture. The contact-sheet review checks this at 360 px and 844 px.

Fonts load through `@remotion/fonts` `loadFont()` from `public/fonts/` (woff2 copied from `@fontsource/instrument-serif` 5.x and `@fontsource-variable/archivo` 5.x, both SIL OFL 1.1, licences in `public/fonts/`).

## 5. Layout grid (1920×1080)

- **Safe area:** 80 px sides, 100 px top and bottom for key content. The concept label sits in the top margin by design.
- **Headline column:** x 120–640, vertically centred on y 540.
- **Product area:** x 700–1840, y 150–920. The overview window fills it exactly: three 352×500 panel slots at x 724 / 1094 / 1464, y 258, under an 84 px ink header bar, with a 120 px footer row for the NSF item.
- **Cards** are 352×500 in every scene. Gathering only moves and straightens them (translate, rotate, shadow), it never rescales them, so text stays sharp and each card keeps its identity.

## 6. The "Concept demo" label

A white pill with a 1.5 px hairline, "Concept demo" in Archivo 600 32 px ink, followed outside the pill by "Unofficial · illustrative data" in Archivo 500 26 px muted. (Review pass 2 raised these from 28/24 px.) It sits at x 80, y 52 for all 450 frames, never animates, and never overlaps the product area. The `/motion-reel` "no corner labels" rule is overridden here on purpose, because the request requires the label.

## 7. Motion language

- Everything is a pure function of `useCurrentFrame()`, with no CSS transitions, timers or `Math.random`.
- **Gather:** Remotion `spring({ mass: 1, stiffness: 180, damping: 22 })`, with the three cards staggered 4 frames apart. Damping ratio ζ = 22 / (2·√180) ≈ 0.82, which gives about 1% overshoot and settles in about 12 frames. This is a baseline to tune by eye.
- **Entrances:** short springs or `Easing.bezier(0.16, 1, 0.3, 1)` over 8–12 frames, with a 16–24 px rise. Nothing slides linearly.
- **Holds:** a headline does not move between its entrance and its exit. Only one thing moves at a time where possible, and the cursor never moves while a headline enters.
- **Swaps:** the outgoing headline leaves completely before the incoming one starts. Text never overlaps text.
- **Cursor:** drawn as an original SVG arrow (ink fill, white 2 px outline). Its position comes from keyframes, it never jumps, and it fades out only after it stops.

## 8. Banned

Gradients behind titles, everything fading in at once, sliding text, timecodes, frame borders, HUD chrome, stock icons, third-party logos, invented testimonials or metrics.
