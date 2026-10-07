# ANIMATION_GUIDE — read before writing any scene (for every subagent)

1. Each chapter exports `draw<Chapter>(g, t, L)` — pure function of time `t` (seconds, global) and layout `L`
   (`L.W, L.H, L.fmt, L.fit(...)`). No globals mutated, no `Math.random`, no timers, no DOM.
2. Motion: import from `lib/motion.js` only: `spring`, `track`, `indicator`, `swapAlpha`, `E` easings, `rng(seed)`.
   Targets that change several times → one `track` with keys, never restarted tweens.
3. Times come from `timeline.json` (beats, events, copy). Never hard-code a time or a string in a chapter.
4. Type: the brand font via the shared `font(size, weight, italic)` helper; letter-spacing −0.02 to −0.03 em on display
   sizes; minimum on-screen size 22 px at 1080 width (phone readability).
5. Colour: only the palette tokens in `docs/style_guide.md`. Accent colour appears on one element at a time.
6. Content inside a morphing container: `withContent(t, tIn, tOut, fn)` — enters after the morph starts, leaves
   before the next one, short blur rendered on a layer.
7. Real UI: draw captured images with `drawCard` (rounded clip at the site's radius). Never redraw screens.
8. Composition: leave the top 12 % and bottom 18 % of 9:16 free of key content (platform UI). No corner labels.
9. Performance budget: ≤ 150 ms per subframe at 1080p. Batch thousands of dots into Path2D; blur layers, not calls.
10. Before handing back: render 5 stills of your chapter, score them with `prompts/critique-pass.md`, fix the 3 worst.
