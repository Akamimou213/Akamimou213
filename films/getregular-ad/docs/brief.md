# Get Regular — « From guessing to knowing » (restart, reference-matched)

Reference: `refs/reference.mp4` (Zephyrian). We copy its making, not its content: the same kind of illustration,
character design, animation and edit; our story, our brand, our words.

## What we match (measured on the reference)
- **Pictures:** mid-century editorial gouache, flat shapes, dry-brush edges, paper grain; one dominant anchor colour
  over off-white paper plus one warm "life" colour. Full-bleed vertical compositions, a new one every ~2.7 s
  (20 cuts in the first 60 s; shots 1.3–4.5 s).
- **Characters:** simple faces (small dark eyes, rosy cheeks, few lines), dark hair, expressive hands; drawn in close-up,
  over-the-shoulder, hands-only and wide; they act the line.
- **Animation:** every shot is a moving illustration (image-to-video): heads turn, expressions change, hands act, a
  figure dives and swims, the camera pushes or follows. One action per shot, finished inside the shot.
- **Edit and type:** hard cuts on the voice; centred white serif subtitles with a soft dark shadow, 2–4 words per card,
  timed to the voice; nothing else on screen until the product.
- **Voice:** one calm narrator, direct address (« What if I told you… »), short lines, a contrast pair to open
  (« This is a tan. / This is a carotenoid glow. »).

## Our palette and type
Anchor olive `#3A4B1C` (where the reference uses cobalt), paper cream `#FEFFF5`, warm apricot `#E58A4E` for the gut's
signal, ink `#1E1E1C`. Subtitles in a classic serif like the reference's; end card in Get Regular's own (Amadi wordmark).

## Character: Maya
Early 30s, dark brown chin-length bob, warm skin, small dark eyes, rosy cheeks; apricot cardigan over a cream top,
olive trousers. Same face and outfit in every plate (one character sheet, used as the reference image for each plate).

## Script (≈30 s, 13 shots) — our story, the reference's grammar
| # | Voice-over | Shot (one action) |
|---|---|---|
| 1 | This is a guess. | Close-up, Maya frowns at her lunch plate, hand on her stomach; olive sea behind |
| 2 | This is a pattern. | Same framing, she smiles; a warm apricot glow rises under her hand |
| 3 | What if I told you your gut has been talking for months? | Her belly glows faintly in a dark olive room; she looks down |
| 4 | Bloating after lunch. | At a café table she loosens her waistband, cheeks puffed |
| 5 | Weird bathroom days. | A bathroom door; calendar pages flutter past it |
| 6 | At the doctor, the questions come fast. | Over the doctor's shoulder; papers fly towards Maya like birds |
| 7 | Since when? How often? After what? | Three quick close-ups of the doctor asking; Maya's eyes widen |
| 8 | And your mind goes blank. | Her face fades to a blank paper silhouette; the birds scatter |
| 9 | So you start listening. | Night, bed, phone light; she logs her day, the glow flows into the phone |
| 10 | Meals. Sleep. Stress. | Three-panel split: a plate, a moon, a tense shoulder, each lighting apricot |
| 11 | A few weeks later, the pattern shows up. | From above: apricot stones across olive fields line up into one path |
| 12 | Back at the doctor, you have answers. | Maya hands over a one-page report; the doctor nods, the papers settle |
| 13 | From guessing to knowing. | Wide: Maya walks under a clearing morning sky, cream and apricot bands over olive hills |
| end | Get Regular. Understand your gut. | Olive end card: wordmark, « Download Get Regular », « Educational only. Not medical advice. » |

## Pipeline
1. Character sheet + 13 keyframes (image model, one locked style prompt, Maya sheet as reference).
2. Each keyframe → 3–5 s clip with an image-to-video model, one action prompt per shot.
3. Here: edit on the voice, subtitles, grade, grain, sound (ElevenLabs voice; music ≥ 15 LU under it), 9:16 master +
   4:5 / 1:1 reframes, QA.
