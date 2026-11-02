# Image-to-video prompts (one action per shot, matched to the reference's motion)

Route: Sume `generate_video`, model `kling-4` (≈ $0.235/s at 1080p), first frame = keyframe, 9:16, 1080p, no audio,
4 s unless noted. Optional A/B on shot 1 with `seedance-2.5` ($2.28 for 4 s). Every prompt ends with the guard below.

**Guard (append to every prompt):** Keep the flat gouache illustration style, dry-brush texture, paper grain and exact
colours of the image; the characters keep their faces and clothes; no new objects, no text, no camera shake.

| # | Keyframe | Motion (what the reference does in the same kind of shot) | s |
|---|---|---|---|
| 1 | k01-guess-v2 | She lifts her eyes from the lower left up to the viewer; the frown deepens slightly; her hand presses on her stomach; a few hair strands move; slow strokes of waves on the olive sea. Camera static. (Ref 0:00 « This is a tan »: head turn to camera.) | 4 |
| 2 | k02-pattern | Her soft smile widens; the apricot glow under her hand brightens and warms her chin; she breathes out, shoulders relax. Very slow push-in. (Ref 0:02 glow on the skin.) | 4 |
| 3 | k03-talking | The faint apricot glow in her stomach pulses twice like a quiet signal; she tilts her head down towards it, hands hovering, puzzled. Camera static. | 4 |
| 4 | k04-bloating | Point of view: her fingers tug the tight waistband out a little and let go; she exhales; a fork on the plate shifts slightly. Camera static, slight breathing motion. (Ref 1:24 hands pulling the dress.) | 4 |
| 5 | k05-bathroom | Her hand turns the brass handle; the calendar pages on the wall flip quickly one after another in a draft. Camera static. | 3 |
| 6 | k06-questions | The paper sheets fly from the doctor towards Maya like a flock of birds, flapping their page wings; Maya leans back slightly. Slow push-in over the doctor's shoulder. (Ref 0:15 papers / quick action.) | 4 |
| 7 | k07-doctor | The doctor speaks a quick question, eyebrows lifting, pen hand gesturing towards the viewer; slight head tilt. Camera static. | 3 |
| 8 | k08-blank | Maya blinks once, eyes wide and frozen; the blank paper at the top of her head grows a little; the paper birds fly away out of the top of the frame. Camera static. | 4 |
| 9 | k09-listening | Her thumb taps the phone; the stream of tiny apricot dots flows steadily from under the blanket up into the phone; the phone light flickers softly on her face. Camera static. | 4 |
| 10 | k10-triptych | Each panel moves at once: the carrot slice glows brighter, the sleeper breathes and the moon's light shimmers, the hand rubs the tense neck; each small apricot glow pulses once. Camera static. (Ref 4:16 triptych.) | 3 |
| 11 | k11-pattern | Slow aerial drift upward along the trail; the scattered apricot stones slide and gather into the single dotted trail; the tiny figure starts walking up it. (Ref 2:00 aerial / map shots.) | 4 |
| 12 | k12-answers | Maya slides the report across the desk; the doctor takes it, lowers her glasses and nods with a smile; light in the window brightens. Camera static. | 4 |
| 13 | k13-sky | The clouds part slowly, the apricot sun rises a little and the sky's bands brighten; Maya keeps walking along the path towards it; gentle slow push-in. (Ref 4:24 sunset coast / 2:32 sun burst.) | 5 |

Total ≈ 50 s of clips for a ~30 s edit (shots are trimmed to their lines). Kling 4 at 1080p: 50 s × $0.235 ≈ $11.75,
plus retakes.
