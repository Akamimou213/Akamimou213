# Shot list — [FILM] · [BPM] BPM · beat = [s] · [DURATION]

Every row sits on the beat grid. "Real" = which captured asset or verbatim copy it uses.

| # | Time (s) | Beats | State / picture | Camera | Text (lang) | Hold needed (s) | VO line | Real source | Cursor / action | SFX cue | Transition out |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 0.0–2.0 | 0–3 | Hook: [...] | static → push | "[≤5 words]" | 1.6 | — | site H1 / ours | — | ring, ticks | period → iris |
| 2 | 2.0–4.5 | 4–8 | [...] | | | | | | click Play 6.0 | click, pop | push panel |
| … | | | | | | | | | | | |
| N | [end] | | Logo + CTA | settle | "[CTA verbatim]" | ≥ 3 (ads) | | site button | click CTA | click, chord | loop to frame 0 |

Hold needed = `max(0.7, 0.25 + characters / 17)`; hero lines read cold `0.3 × words + 1.5`. Sum the holds: if they exceed the
duration, cut words. VO films: the VO line's words set the times (`words.py`), not the other way round.

Hard cuts (list, on beats): [...]. Everything else transitions inside the frame.
Accent element path: [state → state].
Device ledger (each reveal/transition once, varied if reused): [...]. Open loops (planted → closed, all before the CTA): [...].
Ads: hook variants B, C (first 2 s only): [...].
Formats: 9:16 · 1:1 · 16:9 · 4:5 — note any per-format reframing per shot.
