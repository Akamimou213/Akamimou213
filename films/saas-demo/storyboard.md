# Storyboard: SaaSDemo (1920×1080 · 30 fps · 450 frames · 15.0 s)

Gate G4 of `/motion-reel`. Frame numbers are 0-based and inclusive, and every frame from 0 to 449 belongs to exactly one row. Times are frame ÷ 30. The same numbers live in `src/content/timeline.ts`, which the animation and the sound cues both read, so the picture and the audio cannot drift apart.

## Scene coverage

| Scene | Frames | Frames count | Seconds | Headline on screen |
|---|---|---|---|---|
| 1 · Too many tabs | 0–89 | 90 | 0.00–2.97 | "Too many tabs." |
| 2 · Select and gather | 90–209 | 120 | 3.00–6.97 | "Too many tabs." (held, leaves at 192–199) |
| 3 · One clear view | 210–359 | 150 | 7.00–11.97 | "One clear view." |
| 4 · Explore the demo | 360–449 | 90 | 12.00–14.97 | "Explore the demo." (static hold) |
| **Total** | **0–449** | **450** | **15.0** | |

These elements are on screen in every frame from 0 to 449: the paper background `#F4F2EC`, the **"Concept demo"** pill at x 80, y 52, and the muted line "Unofficial · illustrative data" next to it. None of them ever move (verified pixel-still on lossless frames, see `review.md`).

## Exact copy

| Key (`copy.ts`) | EN (SaaSDemo) | FR (SaaSDemoFR) |
|---|---|---|
| `label` | Concept demo | Démo conceptuelle |
| `labelNote` | Unofficial · illustrative data | Non officiel · données illustratives |
| `headline1` | Too many / tabs. | Trop / d’onglets. |
| `cards[0].label` | Rent roll | Loyers |
| `cards[1].label` | Bank portal | Portail bancaire |
| `cards[2].label` | Supplier bills | Factures |
| `selectedCount` | 3 selected | 3 sélectionnés |
| `combine` | Combine into one view | Regrouper en une vue |
| `overviewTitle` | All payments | Tous les paiements |
| `overviewMeta` | October · Up to date | Octobre · À jour |
| `headline2` | One clear / view. | Une vue / claire. |
| `support2` | Incoming and outgoing payments, in one place. | Tous vos paiements, / au même endroit. |
| `attention` | 1 item needs attention · Unit 118 · NSF | 1 élément à traiter · Logement 118 · NSF |
| `followUp` | Follow up | À suivre |
| `headline3` | Explore / the demo. | Explorez / la démo. |
| `brandLine` | An unofficial concept / for TOMSO | Un concept non officiel / pour TOMSO |

The "/" marks a forced line break. Card rows are illustrative data (amounts in CAD, unit numbers made up):

| Card | Rows before (scene 1–2) | Rows after (scene 3–4) |
|---|---|---|
| Rent roll | Unit 204 $1,450 DUE · Unit 311 $1,620 DUE · Unit 118 $1,380 **NSF** · Unit 207 $1,540 DUE | COLLECTED ×3, Unit 118 stays **NSF** (coral) |
| Bank portal | Deposit $1,450 UNMATCHED · Deposit $1,620 UNMATCHED · Payment −$2,300 UNMATCHED · Deposit $1,540 CLEARED | MATCHED ×4 |
| Supplier bills | Snow removal $2,300 TO APPROVE · Plumbing $640 TO APPROVE · Elevator service $1,150 **OVERDUE** · Cleaning $890 SCHEDULED | PAID ×4 |

The rows are internally consistent: the bank's −$2,300 is the snow-removal bill, and the deposits match units 204, 311 and 207. Unit 118 bounced (NSF), so there is no deposit for it. Badge counts in scene 1: Rent roll **4**, Bank portal **3**, Supplier bills **4**.

## Shot list

Card positions in scene 1–2 are given as centre (x, y) and rotation; cards are always 352×500.
A = Rent roll (870, 380, −8°) · B = Bank portal (1250, 615, +4°) · C = Supplier bills (1625, 400, +9°). Stacking order from bottom to top: A, C, B.
Overview slots (centre): A (900, 508) · B (1270, 508) · C (1640, 508), rotation 0°, inside the window x 700–1840, y 150–920.

| # | Frames | Picture and motion | Copy on screen | Assets | Transition | Sound |
|---|---|---|---|---|---|---|
| 1.1 | 0–11 | Cards rise in one by one, pre-rolled so frame 0 already shows two of them: A starts at −6, C at −4, B at 2 (spring 260/24, 40 px rise, opacity 0→1 over 4 f). Each lands at its scattered position with a soft shadow. | label, labelNote | Archivo, Instrument Serif | opens on paper; no fade from black | — |
| 1.2 | 12–23 | Headline 1 enters: opacity 0→1 and a 24 px rise, `Easing.bezier(0.16,1,0.3,1)`, 12 f. Cards still. | "Too many tabs." | Instrument Serif | in place | — |
| 1.3 | 24–89 | **Read hold.** Headline still. Coral count badges pop on each card's tab, one at a time: A "4" at frame 36, B "3" at 46, C "4" at 56 (spring scale 0→1, 10 f). Nothing else moves. | + card labels, rows | — | — | — |
| 2.1 | 90–107 | The cursor enters from off-frame bottom-right (1990, 1040) and glides to card A's body (bezier 0.33,0,0.15,1). Headline still. | — | SVG cursor | — | — |
| 2.2 | 108–111 | Cursor settles, then presses at **frame 110** (cursor scale dips to 0.86 and recovers over 3 f). Card A gets a 3 px ink selection ring and a lime check badge (spring pop). | — | — | — | **click** at 110 (gain 0.55) |
| 2.3 | 112–127 | Cursor glides to B (arrives at 124) and presses at **126**. B is selected. | — | — | — | **click** at 126 (0.55) |
| 2.4 | 128–145 | Cursor glides to C (arrives at 140) and presses at **142**. C is selected. | — | — | — | **click** at 142 (0.55) |
| 2.5 | 146–165 | A floating toolbar rises in below the cards, centred at (1270, 932), over frames 146–155. The cursor glides to the lime button (arrives at 162) and rests. | "3 selected" · "Combine into one view" | — | — | — |
| 2.6 | 166–167 | The cursor presses the button at **frame 166** (the button darkens for 4 f). | same | — | — | **click** at 166 (gain 0.8) |
| 2.7 | 168–175 | **Gather starts.** Cards spring from scattered to their overview slots: `spring({mass 1, stiffness 180, damping 22})`, staggered A 168, B 172, C 176. Translation and rotation only, no scaling. Shadows shrink to flat as each card lands. Badges shrink out (168–175) and the toolbar fades out (170–177). | — | — | position preserved (each card travels from where it was) | **movement cue** at 168 (gain 0.7) |
| 2.8 | 176–189 | The overview window forms behind the cards while the last card is still landing: a white frame with a hairline and an ink header bar, opacity 0→1 and scale 0.985→1 over 176–185. Selection rings fade (176–185). The cursor fades in place (184–195). All cards have settled by about 192. | "All payments" · "October · Up to date" | — | window forms around the cards | — |
| 2.9 | 190–209 | The footer row (NSF item, coral) rises in at 190–199. Headline 1 leaves at 192–199 (opacity 1→0, 12 px up), so it doesn't sit beside the finished overview. Frames 200–209: no headline. | "1 item needs attention · Unit 118 · NSF" · "Follow up" | — | headline out before the next one comes in | — |
| 3.1 | 210–227 | Status chips flip one card at a time (crossfade plus a 1.06 scale blip, 6 f each): Rent roll at 212 (3 → COLLECTED, Unit 118 stays NSF), Bank at 218 (→ MATCHED), Supplier at 224 (→ PAID). | rows after | — | in place | — |
| 3.2 | 228–239 | Headline 2 enters (opacity and a 24 px rise, 12 f). | "One clear view." | Instrument Serif | in the same spot as headline 1 | **completion tone** at 228 (gain 0.6) |
| 3.3 | 240–281 | **Read hold.** Headline still. The support line fades in under it (246–257). | + "Incoming and outgoing payments, in one place." | — | — | — |
| 3.4 | 282–297 | The footer's "Follow up" chip pulses once (scale 1→1.08→1). This is the only movement on screen. | — | — | — | — |
| 3.5 | 298–343 | **Read hold.** Nothing moves. | same | — | — | — |
| 3.6 | 344–351 | Headline 2 and the support line leave together: opacity →0 and 12 px up, 8 f. | — | — | out before in | — |
| 3.7 | 352–359 | Headline 3 enters (opacity, 16 px rise, 7 f), then the brand line (frames 354–359, 5 f). Both are fully settled by frame 359. | "Explore the demo." · "An unofficial concept for TOMSO" | — | in the same spot | — |
| 4.1 | 360–449 | **Final 3.0 s hold.** Every pixel is static: the headline, the brand line, the overview with its NSF row, and the label. | same | — | ends on the hold (no fade out) | silence (the tone has decayed by about 270) |

## Transitions

There are no hard cuts and no scene wipes. The film is one continuous frame in which state changes, and each scene boundary falls on a state change:
- **89 → 90:** the cursor starts entering, and the headline stays.
- **209 → 210:** the overview is built, and the chips start flipping at 212.
- **359 → 360:** the end-card text has settled, and the hold starts.

## Sound cues (all from `timeline.ts → cues`)

| Frame | Time | Cue | File | Gain | Why this frame |
|---|---|---|---|---|---|
| 110 | 3.667 s | click | `public/sfx/click.wav` | 0.55 | the cursor presses card A |
| 126 | 4.200 s | click | `public/sfx/click.wav` | 0.55 | the cursor presses card B |
| 142 | 4.733 s | click | `public/sfx/click.wav` | 0.55 | the cursor presses card C |
| 166 | 5.533 s | click | `public/sfx/click.wav` | 0.8 | the cursor presses "Combine into one view" |
| 168 | 5.600 s | movement | `public/sfx/move.wav` | 0.7 | the first card starts gathering |
| 228 | 7.600 s | completion | `public/sfx/complete.wav` | 0.6 | the last chip has flipped and "One clear view." lands |

Each WAV has its own short fade-in and fade-out baked in, so no cue starts or ends on a click. The mix target is peaks at or below −6 dBFS and true peak at or below −1 dBTP. The measured result is −10.2 dBFS sample peak and −10.2 dBTP true peak; see `review.md`. There is no music bed (the brief asks for three restrained cues). A silent export is kept for comparison.

## Assets

| Asset | Path | Source / licence |
|---|---|---|
| Instrument Serif Regular (latin) | `public/fonts/instrument-serif-latin-400-normal.woff2` | `@fontsource/instrument-serif`, SIL OFL 1.1 |
| Archivo variable (latin, wght 100–900) | `public/fonts/archivo-latin-wght-normal.woff2` | `@fontsource-variable/archivo`, SIL OFL 1.1 |
| click / move / complete | `public/sfx/*.wav` (48 kHz, 16-bit mono) | synthesized by `scripts/make-sfx.mjs`, original |
| Cursor, cards, overview, chips | drawn in `src/` (SVG + HTML/CSS) | original |

No images, logos, captures or third-party audio are used.
