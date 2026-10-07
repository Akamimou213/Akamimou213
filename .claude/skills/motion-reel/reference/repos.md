# Related repos and tools

These were listed in the source article ("Ship" section). They were **not** reviewed in this session, so read them
before installing anything. Third-party code runs with your permissions.

| Repo / link | Notes |
|---|---|
| github.com/JohnHeibel/PDoomVideo | listed in the article; not reviewed |
| ClaudeAnimationBase | listed in the article; not reviewed (no URL given) |
| github.com/buildwithhanif/claude-animation-skill | Claude Code plugin; per the setup script: hand-drawn look, Node canvas rigs, pens, synthesized sound. Small personal repo, so read it first |
| github.com/heygen-com/hyperframes | HTML → video + GSAP skills (`npx skills add heygen-com/hyperframes`) |
| remotion.dev/docs/ai/skills | Remotion's agent skills (`npx skills add remotion-dev/skills`) |
| github.com/WinterArc21/Battle-of-Austerlitz-Film | listed in the article; not reviewed |
| github.com/guanmo-ai/awesome-ai-motion | listed in the article; not reviewed |
| github.com/athemeroy/awesome-opus-5-5-videos | listed in the article; not reviewed |
| whatships.com | reference library of product launch videos (from the workflow notes) |

## When to use a framework instead of this skill's plain canvas engine
- **Plain canvas (this skill):** tight control, any number of formats from one `draw(t)`, no licence questions, and it's the fastest to iterate.
- **Remotion:** React components, timeline UI, and big teams. It needs a company licence for organisations above 3 people (check the current terms at remotion.dev).
- **HyperFrames:** HTML/CSS/GSAP authoring and existing web components.
- **Video models (generate-then-trace):** organic motion that's hard to hand-key, such as characters or liquids. It needs an API key and budget, the output is not deterministic, and you should check the model's licence terms for commercial use.

## Licences we've already relied on
| Asset | Licence | Obligation |
|---|---|---|
| Salamander Grand Piano (SFZ) | CC BY 3.0 | credit line in the description/README |
| Kawai upright samples used | CC0 | none |
| Natural Earth 10 m admin-1 | public domain | none (credit appreciated) |
| Inter font | SIL OFL 1.1 | none for video use |
| Client logos / UI | client's | only with the client's approval; customer logos imply endorsement |
