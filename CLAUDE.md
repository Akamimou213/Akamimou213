# Project rules

No CLAUDE.md existed before 2026-10-08. The site's own rules live in `README.md` ("Content rules") and still apply.

## Portfolio site (repo root)

- Static Vite site. The copy lives in `index.html`, the tokens in `src/styles.css` and the motion in `src/main.ts`.
- Don't add dependencies for films or tools to the root `package.json`. Films are self-contained under `films/`.

## Films (`films/<name>/`)

Use the `/motion-reel` skill (`.claude/skills/motion-reel/`) for the method: brief → style guide → storyboard → stills → draft → sound → QA. For Remotion APIs, follow Remotion's official agent skills (github.com/remotion-dev/skills), matched to the installed Remotion version.

1. Each film is its own package (`films/<name>/package.json`), with `brief.md`, `style-guide.md`, `storyboard.md`, `review.md` and `README.md` next to the code.
2. **Show the storyboard before building.** Every frame must belong to exactly one storyboard row.
3. **Concept demos:** original interface graphics only. A small, readable "Concept demo" label stays on screen for every frame. No third-party logos, testimonials or performance claims. Label UI amounts as illustrative. If a real company is named, name it in plain type, with "unofficial", never with its logo.
4. Keep editable copy, colours and asset paths in `src/content/` (`copy.ts`, `theme.ts`, `assets.ts`). Keep frame numbers and sound-cue frames in `src/content/timeline.ts`. Animation components import these files and never hard-code strings or times.
5. Drive motion only from `useCurrentFrame()` and `useVideoConfig()`. No CSS transitions or animations, no timers, no `Date`, no unseeded randomness.
6. Load fonts explicitly with `@remotion/fonts` `loadFont()` from `public/fonts/`. Use only OFL or otherwise licensed fonts, and keep the licence file next to the font.
7. Hold headlines still while they need to be read. Stagger motion, and don't animate every element at once. Gathers and moves preserve each element's position: elements travel from where they were and never re-appear somewhere else.
8. Sound: local WAVs only (synthesized or supplied and approved), cues placed on the actual interaction frames, short fades, peaks ≤ −6 dBFS and true peak ≤ −1 dBTP. Keep a silent export for comparison. If nobody has listened, say so and ask the user to review the mix.
9. Before calling a render done: run `npm run typecheck` and `npm run lint`, render a contact sheet (one frame per second, plus the frames around every scene boundary), check readability at 360 px and 844 px wide, and run `ffprobe` (duration, size, fps, audio stream). Log timestamped findings in `review.md`. Never mark a check as passed if it wasn't run.
10. Commit the source, fonts, SFX and contact sheets. Media in `out/` (MP4, WAV, frames) is git-ignored; send it to the user directly.
11. Remotion licence: it is free for individuals and companies with up to 3 employees. Anyone else needs a company licence. Say this whenever a film is made for an employer or a client.
