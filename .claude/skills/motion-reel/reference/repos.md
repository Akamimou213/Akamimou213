# Related repos, engines and tools (vetted 2026-10-10)

Every repo below was shallow-cloned and read; **none was installed or executed**. Licence = the repo's licence file; "last
commit" = the clone's HEAD date. Stars weren't available. Re-check before installing anything: third-party skills are
instructions your agent will follow with your permissions.

Verdicts: **borrow** = ideas taken into this skill (see `craft.md`); **companion** = worth installing next to this skill for
the case named; **skip** = nothing we lack, or conflicts with the house rules.

## Motion skills

| Repo | What it is | Licence · last commit | Verdict |
|---|---|---|---|
| [whaleyxbt/claude-motion](https://github.com/whaleyxbt/claude-motion) | Remotion motion design + review loop + stdlib SFX engine + canvas/three.js sim capture | MIT · 2026-10-09 | **borrow** (reading holds, frame-0 rule, SFX mapping, sustain-not-gain mastering). Companion only for 3D/simulation pieces; its sims ship a HUD and a watermark default |
| [howseen-ai/claude-motion-design](https://github.com/howseen-ai/claude-motion-design) | One large skill, same architecture as ours (HTML seek(t) → Playwright → ffmpeg) | MIT · 2026-10-02 | **borrow** heavily (flash/pop detector, loop velocity, capture hygiene, caption/VO specs, BT.709). Don't install: personal paths, scripts that fetch from the network (21st.dev, Mixkit scraping), rebuilds UI, stock music |
| [charlie947/motion-graphics-skills](https://github.com/charlie947/motion-graphics-skills) | 13 prose skills for launch videos, rendering via HyperFrames | MIT · 2026-09-30 | **borrow** (silent AAC track, encode gate, loop rotation, `willReadFrequently`, "stranger knows it by second 4"). Skip install |
| [haidrrrry/claude-remotion-skill](https://github.com/haidrrrry/claude-remotion-skill) | Remotion motion-graphics editor with SFX/music generators | MIT · 2026-08-12 | **skip** (generic; mandates fade+translate+scale on every entrance and pads; claims determinism but uses `Math.random`). Took: SFX 2–3 frames early |
| [t3knobox/klik-anim-skill-creation](https://github.com/t3knobox/klik-anim-skill-creation) | Remotion element craft, camera dial, method + motion measuring scripts | **no licence** (all rights reserved) · 2026-08-07 | **borrow ideas only**, nothing copied (duration bands, reading-hold arithmetic, moving-text cap, device ledger, rest-ratio measurement). Not a companion: unlicensed, Remotion, token-heavy |
| [Sunwood-ai-labs/hyperframes-motion-reel-skill](https://github.com/Sunwood-ai-labs/hyperframes-motion-reel-skill) | One Japanese showreel prompt for HyperFrames | MIT · 2026-09-30 | **skip** (thin; tells the agent to invent the copy) |
| [AbubakrChan/product-launch-motion](https://github.com/AbubakrChan/product-launch-motion) | VO-led SaaS launch films on HyperFrames/GSAP: 10 laws, 34 traps, scripts, evals | MIT · 2026-08-27 | **borrow** (VO-first word-locked cues, captions + SRT + clean master, right-rail safe area, SFX envelope levelling) + **companion** for narrated 20–90 s launch films in HTML/GSAP. Allows "faithful" UI rebuilds: we don't |
| [cth9191/animate](https://github.com/cth9191/animate) | Illustrated procedural canvas animation (cut paper, riso, pixel…) with 17 tools | MIT · 2026-10-05 | **borrow** (text-bounds probe → `render.cjs text`; payoff loudness/silence arc; VO pacing) + **companion** for illustrated explainers with no product UI. Ships pads/drones; installs Playwright globally |
| [iart-ai/motion-design-skills](https://github.com/iart-ai/motion-design-skills) | 9 prose skills: principles, colour, composition, beat-sync, logos, Remotion, AE | MIT · 2026-06-22 | **borrow** (OKLab mixing, BT.709 tagging, phrase cutting + pacing arc, J/L-cuts, right rail, logo settle on the sound-logo peak) |
| [nateherkai/hyperframes-student-kit](https://github.com/nateherkai/hyperframes-student-kit) | Talking-head → reels/ads kit on HyperFrames: 15 skills, ~25 scripts, 406 card templates | MIT · 2026-09-28 | **borrow** (caption styling, hook gate, stamp/payoff timing, open-loop ledger, dead-gap validator) + **companion** only for editing real talking-head/UGC footage. Skip its HUD/showreel skills; optional scripts upload to third parties (ElevenLabs, a kie proxy domain) |
| [LottieFiles/motion-design-skill](https://github.com/LottieFiles/motion-design-skill) | UI micro-interaction motion principles (markdown only) | MIT · 2026-05-18 | **skip** (UI-focused; useful tables already covered). Took: distance → duration scaling |
| [frankxai/awesome-motion-design-agent-skills](https://github.com/frankxai/awesome-motion-design-agent-skills) | Link list + 5 short skills routing to generative video models | CC0 · 2026-10-02 | **skip** (thin; routes to generated video) |
| [Barty-Bart/motion-graphics](https://github.com/Barty-Bart/motion-graphics) | One-shape morph B-roll timed to a talking head's SRT; SAM 2.1 segmentation | MIT · 2026-10-05 | **borrow** (cutaway rules, ProRes 4444 alpha overlays, before/after compare page, SRT timing caveat). `object-separation` is a companion when you need a subject matte |
| [199-biotechnologies/motion-dev-animations-skill](https://github.com/199-biotechnologies/motion-dev-animations-skill) | Motion.dev guidance for React/Svelte UI | MIT · 2026-03-30 | **skip** (web UI, not video; spring maths errors; fade-in defaults) |
| [remotion-dev/skills](https://github.com/remotion-dev/skills) | Official Remotion agent skills (12) | no licence file; generated from the Remotion monorepo (Remotion licence applies) · 2026-10-07 | **borrow** (type ladder, log-space scale, fixed map plate, VO sets scene length). Companion if the team is on Remotion and licensed. Its SFX docs stream meme sounds from URLs: don't |
| [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) skills | 21 published + internal doctrine skills for HyperFrames | Apache-2.0 · 2026-10-10 | **borrow** heavily (caption grouping/rail, voice carve, vector law, stillness before climax, persistence-based QA severity, static determinism lint). Companion for captioning/recutting existing footage — install pinned with `HYPERFRAMES_NO_TELEMETRY=1` and tell the agent not to send its post-render feedback reports |

## Engines

| Engine | Licence and commercial terms | Latest (checked) | Fit for this skill |
|---|---|---|---|
| **Plain canvas + Playwright + ffmpeg** (this skill) | Our code; Playwright Apache-2.0; ffmpeg LGPL/GPL builds | — | Default: one `draw(t)`, every format/language/variant, no licence questions, provably deterministic |
| [HyperFrames](https://github.com/heygen-com/hyperframes) (HTML/CSS/GSAP → MP4) | Apache-2.0: commercial use permitted; keep LICENSE/NOTICE | v0.8.144, 2026-10-10 (pre-1.0, ships daily: pin per project) | When the piece is HTML/GSAP, Lottie or Three.js, or edits real footage. `npx hyperframes init`; telemetry off with `HYPERFRAMES_NO_TELEMETRY=1` |
| [Remotion](https://github.com/remotion-dev/remotion) (React → MP4) | Source-available. Free for individuals and companies of **≤ 3 people**; above that a Company Licence (creators ~$25/seat/month; render automation $0.01/render, $100/month minimum) per [remotion.pro/license](https://www.remotion.pro/license). Agencies: a client-owned project adds both headcounts ([FAQ](https://www.remotion.dev/docs/license/faq)); a draft for 5.0 would count contractors too (unmerged) | v4.0.534, 2026-10-07 | React teams, timeline UI, many editors. Check headcount before client work |
| [GSAP](https://github.com/greensock/GSAP) | Free "Standard No Charge" licence (Webflow, since 2025-04-30), commercial use incl. SplitText/MorphSVG; banned only for visual no-code animation builders that compete with Webflow ([licence](https://gsap.com/standard-license)) | 3.15.0, 2026-04-13 | Inside HyperFrames or a DOM engine. Skills: `npx skills add https://github.com/greensock/gsap-skills` (MIT, 8 skills) |
| [Motion](https://github.com/motiondivision/motion) (ex-Framer Motion) | MIT; Motion+ is a paid add-on | 14.1.0, 2026-10-09 | Websites and landing pages, not video: no frame-seek export. Skill: `npx motion-ai` |
| [lottie-web](https://github.com/airbnb/lottie-web) | MIT | 5.13.0 (npm 2025-05-21); effectively dormant since late 2024 | Playing After Effects JSON inside a renderer (`goToAndStop(frame, true)` per frame). For new Lottie work consider LottieFiles' dotLottie (MIT, active) |

`npx skills` is Vercel's `skills` CLI (MIT): it installs into the project's `.claude/skills/` by default (`-g` for
`~/.claude/skills/`), symlinks unless `--copy`, and sends anonymous telemetry unless `DISABLE_TELEMETRY=1`/`DO_NOT_TRACK=1`.
The skills.sh audit badges disagree with each other; read the SKILL.md files yourself.

## Before installing any of them

- Install per project, pinned to a version or commit; never `@latest` in a client project.
- Read every SKILL.md and script it ships. Red flags seen in this batch: scripts that upload media to third parties, telemetry
  and "send feedback" instructions, network scraping, `--break-system-packages`, global npm installs, unpinned model downloads.
- Turn telemetry off (`HYPERFRAMES_NO_TELEMETRY=1`, `DO_NOT_TRACK=1`, `DISABLE_TELEMETRY=1`).
- A companion skill's house rules lose to ours where they clash: real UI only, verbatim copy, no invented data, original or
  supplied music, no HUDs or corner labels.

## Licences we've already relied on
| Asset | Licence | Obligation |
|---|---|---|
| Salamander Grand Piano (SFZ) | CC BY 3.0 | credit line in the description/README |
| Kawai upright samples used | CC0 | none |
| Natural Earth 10 m admin-1 | public domain | none (credit appreciated) |
| Inter font | SIL OFL 1.1 | none for video use |
| Client logos / UI | client's | only with the client's approval; customer logos imply endorsement |

## Credits

Ideas adapted (rewritten, not copied) from: howseen-ai/claude-motion-design, cth9191/animate (text-bounds probe and sound-arc
checks), heygen-com/hyperframes (caption grouping, voice carve, motion doctrine; Apache-2.0), AbubakrChan/product-launch-motion,
nateherkai/hyperframes-student-kit, iart-ai/motion-design-skills, whaleyxbt/claude-motion, charlie947/motion-graphics-skills,
Barty-Bart/motion-graphics, remotion-dev/skills, and, as uncopyrighted ideas only, t3knobox/klik-anim-skill-creation.
