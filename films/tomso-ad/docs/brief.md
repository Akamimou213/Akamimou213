# Director's brief — TOMSO « Le fil » (Meta motion ad)

Audit behind every choice: `docs/brand_audit.md`. Made with `/motion-reel` (scenes + morph engines mixed, pure `draw(t)`).

## The film in one line
**One tangled line becomes one clean line.** The first-of-the-month knot (cheques, bank portals, NSF) is pulled straight by
TOMSO into a single flow between the management software and the banks, so the team only touches the exceptions. The viewer
should feel the relief of a knot coming undone, then see TOMSO's name and « Planifier une démo ».

Why this concept: the line with ring nodes is already the brand's recurring character (all five statics and the site hero),
and static 1 already draws the story (tangle → line → spiral). We animate their own drawing language instead of inventing
UI the site doesn't show. One line, never cut: every scene grows out of the last.

## Inputs
- Subject: tomso.ca (all pages read), statics `refs/statics/1–5` (grammar: palette, caps Faculty Glyphic, line motif, lime pill).
- Goal: Meta (Facebook + Instagram) prospecting for **demo requests**. Judge on cost per qualified demo / booked demo, not CTR.
- Audience: owners, controllers and accounting managers of property-management and condo-management firms, Québec first.
- Language: **French (Québec)** master (Charter of the French language for commercial ads in Québec); English cut for Ontario
  as a variant from the same timeline, copy from the site's EN pages.
- Music: original, synthesized, 120 BPM. Not the default house-in-A-minor: calm and precise, soft mallet/pluck pulse, warm
  sub, one clean « click into place » motif when the knot resolves. SFX: a soft pencil-line hiss while the line draws, ticks
  on ring nodes, one resolved chord at the end card. No voice-over (Meta autoplays muted); the text carries the story.
- Captions: none needed (no speech). All words are on-screen type, readable muted.

## Look
- Grounds (one per scene, changed by an iris from a ring node, never a fade): mint `#B6D4C8` → paper `#F6F5F1` →
  slate `#3C5B72` → lavender `#C9D4E8` → mint `#B6D4C8`.
- Ink `#000000` on light grounds, white on slate. Lime `#E4FF7A` once per frame: the highlighted line or the CTA.
- Type: Faculty Glyphic caps for headlines (keep the Q tail), Geist for the one supporting sentence, Geist Mono for the CTA.
- Line: 2 px at 1080 wide (scaled per format), round caps, open ring nodes r ≈ 7 px. Line pictograms (building, bank) in white
  discs, as in statics 3–4. Flat, no gradients, no grain, no glow, no 3D, no photos, no invented product screens.
- Logo: TOMSO wordmark top-left on every scene like the statics (it's their layout, not a corner label), large on the end card.

## Beat sheet — 20 s, 120 BPM, 40 beats (beat = 0.5 s)
Holds checked with `max(0.7 s, 0.25 s + chars/17)`; final CTA ≥ 3 s.

| Time | Beats | Ground | Picture (the line) | Text (verbatim source) |
|---|---|---|---|---|
| 0.0–4.0 | 0–8 | mint | Frame 0 is already a picture: the knot from static 1, alive, tightening a little on each beat as tiny labels flick past inside it (« chèques », « portails bancaires », « NSF » — words from the rental page). | « LE 1ER DU MOIS APPROCHE. VOTRE ÉQUIPE EST DÉJÀ DÉBORDÉE? » (static 1) |
| 4.0–7.0 | 8–14 | mint → paper | A ring node grabs the loose end and pulls: the knot unravels into one straight line (summed springs, the drag hands off with `release`). The line lands as static 4's chain: building ○——○ TOMSO ○——○ bank; a lime pulse travels along it. | « VOS LOGICIELS. VOS BANQUES. ENFIN CONNECTÉS. » (home H2) |
| 7.0–11.0 | 14–22 | paper → slate | The bank end splits into the hub of static 3 (several bank discs on spokes), then the spokes pour into static 2's stacked ellipses: many nodes pass through, one stays and turns lime. | « NE GÉREZ PLUS CHAQUE PAIEMENT. GÉREZ UNIQUEMENT LES EXCEPTIONS. » (static 2, lime second line) |
| 11.0–14.5 | 22–29 | slate → lavender | The ellipses flatten to a baseline and the line rises as static 5's bars, ring nodes on top; three counters count up on the frame clock. | three figures from static 5 / home, **wording pending client** (see Claims) |
| 14.5–20.0 | 29–40 | lavender → mint | Every bar's line draws back into one, coils into static 1's spiral, the spiral closes into the TOMSO wordmark. Lime pill presses in; hold 3 s+. | « La fin de la complexité financière en gestion immobilière. » + CTA « Planifier une démo » |

Stillness before the payoff: 0.4 s of near-stillness before the spiral closes into the wordmark; the loudest moment is the
resolved chord on the wordmark. One dominant direction: left → right (the flow from software to bank), up for growth.

## Hook test (variants from one timeline, change only the first 4 s)
- **A — the date** (rental): « LE 1ER DU MOIS APPROCHE. VOTRE ÉQUIPE EST DÉJÀ DÉBORDÉE? » over the knot.
- **B — the outcome** (both): opens on the funnel: « NE GÉREZ PLUS CHAQUE PAIEMENT. GÉREZ UNIQUEMENT LES EXCEPTIONS. »
- **C — the growth pain** (condo): « PLUSIEURS COMPTES BANCAIRES. UN SEUL PROCESSUS. » over the hub (static 3).
A/C can also target their own audiences (rental vs condo) with the same body.

## Formats
9:16 1080×1920 (Reels/Stories, master), 4:5 1080×1350 (Feed), 1:1 1080×1080. Reframed per format, not cropped: portrait
stacks headline above the line; key content inside the Reels safe box (top 14 %, bottom 20 %, right rail). Each delivered as
FR, plus the EN variant, plus a clean poster frame that reads at 200 px.

## Claims (to confirm with TOMSO before render; the render refuses placeholders)
1. The three figures and their exact labels: « 700+ clients » or « gestionnaires »? « 200 000+ prélèvements par mois » or
   « loyers prélevés/mois »? « 2,5 G$+ de paiements traités par année » or « de transactions/an »?
2. Not using « 90 % de temps en moins » or « jusqu'à 70 % » unless TOMSO can substantiate them.
3. No partner logos, no testimonial in v1.

## Needed from the client
Logo SVG (black + white); the font used for static 5's numbers; OK on the claims above; optional: a screen recording of
the TOMSO web interface (would allow one real-UI beat), any sonic logo.

## Workflow
G4 shot list on the grid → G5 one still per beat per format → critique → G6 draft 9:16 → G7 all formats, FR + EN, hook
variants A/B/C → G8 `qa.sh` (safe box, text, sync, loudness on the AAC) → deliver `out/tomso-le-fil-<lang>-<variant>-<fmt>.mp4`.
