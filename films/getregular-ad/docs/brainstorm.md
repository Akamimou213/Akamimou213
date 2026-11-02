# Get Regular — motion ad brainstorm (restart from the reference style)

Inputs: current draft `share_9_1.mp4` (51 s, « Meet Maya », levels 1→4), reference `Video-96789_1.mp4` (Zephyrian,
4 min 56 s, gouache editorial story), getregular.com, the draft's end card. Frames studied side by side.

## 1. Why the draft looks off

| | Draft | Reference |
|---|---|---|
| Rendering | soft, airbrushed "AI illustration"; a pale cream-yellow haze (`#FEFDE2`) over almost every frame, so nothing has contrast | flat mid-century gouache: dry-brush edges, paper grain, hard shapes, real darks |
| Colour | beige on beige, then a sudden orange/green sunburst | one saturated anchor (cobalt) + one warm "life" colour (carotenoid orange) on off-white paper |
| Sky | « LEVEL UP! » sunburst: clip-art rays, flying leaves, a sticker label on top | painted skies: horizontal brush bands, low horizon, one light source, texture (sunset coast, sun over the sea) |
| Character | the same full-body pose, small and low in the frame, standing still in almost every shot, empty space above | characters act out each line; scale changes every shot (hands, face, wide); the figure fills the frame |
| Story | a feature tour dressed as a game (LV.1 → LV.4), 51 s | one story; every line is a visual metaphor (glow drained into a barrel, coins into a purse, a dive off a cliff) |
| Edit | long holds on one set | 109 cuts in 296 s: a new picture every ~2.7 s, cut on the voice |
| Type | white sans subtitles + UI stickers | centred serif subtitles, nothing else on screen |
| Motion | slides and fades of UI tiles | one meaningful move per plate (only the glow drains; the rest holds) |

## 2. What to keep from the draft
Maya. The doctor insight (« the questions come fast… and her mind goes blank »). The payoff (« the questions have
answers »). « From guessing to knowing ». The end card (wordmark, « Understand your gut. », Download). The site's line:
« Your gut is talking. Are you listening? »

## 3. The look, adapted to Get Regular
- **Anchor colour:** Get Regular olive `#3A4B1C` plays the role cobalt plays in the reference (clothes, land, the
  big flat shapes). **Paper:** cream `#FEFFF5` with real grain. **Life colour:** a warm apricot/terracotta for the gut's
  "signal" (the glow that comes back), used sparingly, like the reference's carotenoid orange. Darks are real darks.
- **Type:** the brand serif (Amadi, as on the site and the end card) for centred subtitles; no UI stickers, no levels.
- **The sky carries the story (colour script):** while she's guessing, the sky is flat greige-olive overcast,
  low and heavy; when the pattern appears, the cloud breaks; at the payoff, a clear painted morning: cream and apricot
  bands over olive hills, one sun low on the horizon, dry-brush texture, horizon in the lower third so the sky owns
  the frame (as the reference's sunset and sea shots).
- **Character:** Maya redrawn in the gouache style from one character sheet (fixed hair, jacket, palette) so she stays
  recognisable; she acts every line; framing varies (hand on belly, face, over-shoulder at the doctor, wide under the
  sky); her head sits in the upper third, not floating low with empty space above.

## 4. Story: shorter, one idea (25–30 s, ~11 shots, VO + serif subtitles)
Working title « Your gut is talking ». Lines use the draft's and the site's words.

| # | Line (VO) | Picture (one metaphor per line) |
|---|---|---|
| 1 | Something's felt off for months. | Close-up: Maya's hand on her stomach; overcast sky in the window |
| 2 | Bloating. Weird bathroom days. | Her silhouette as a stormy sky; small apricot flickers inside |
| 3 | At the doctor, the questions come fast. | Questions (« Since when? How often? After what? ») fly at her like birds |
| 4 | And her mind goes blank. | Her head becomes an empty white page; the birds scatter |
| 5 | Your gut is talking. | The apricot glow in her belly, like a pulse |
| 6 | Get Regular helps you listen. | Phone in her hand; the glow flows into it as small marks |
| 7 | Meals. Sleep. Stress. | Marks become stones on a path across olive fields |
| 8 | A few weeks later, a pattern. | Seen from above, the stones form one clear line |
| 9 | Back at the doctor, the questions have answers. | She hands over the report; the birds land, quiet |
| 10 | From guessing to knowing. | Wide: Maya under the clearing morning sky (the hero sky) |
| 11 | Get Regular. Understand your gut. | Olive end card, wordmark, Download Get Regular, « Educational only. Not medical advice. » |

Cutdowns from the same plates: 15 s (1, 3, 4, 5, 8, 10, 11) for Reels/Stories.

## 5. How we make it
The reference's look is painted plates; that can't be faked convincingly in canvas code. Plan:
1. **Plates:** one style sheet (gouache, paper grain, palette above) and one Maya character sheet, then 11 plates
   generated with an image model, all from that sheet so the style and Maya stay consistent. Options: Figma's image
   generation (available in this session; uses your Figma credits), or your own tool (Midjourney / ChatGPT image)
   with prompts we write here.
2. **Motion, here in `/motion-reel`:** each plate separated into 2–3 layers (character, foreground, sky) with the
   `object-separation` skill; one meaningful move per plate (the glow pulsing, birds flying in, stones forming a line,
   the cloud breaking), a slow camera push, paper grain added in post, cuts on the voice, Amadi subtitles.
   Optional: 2–3 hero shots through an image-to-video model (Runway connector, needs authorizing).
3. **Sound:** ElevenLabs voice (warm, calm, female, English), music ≥ 15 LU under the voice, transitions in the pauses.

## 6. Decisions needed
1. Length: 25–30 s master + 15 s cutdown (recommended), or only 15 s?
2. Plates: generate them here with Figma image generation, or by your designer with our prompts?
3. Voice: same as the draft, or a new ElevenLabs voice?
4. « The character is lower »: does Athena mean placed too low in the frame, or lower quality? (Both are addressed
   above; confirm which matters most.)
