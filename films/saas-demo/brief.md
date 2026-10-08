# Brief: SaaSDemo, an unofficial concept for TOMSO

**Gate G0 of `/motion-reel`.** This is a self-initiated concept demo. TOMSO did not commission it and is not a client. It shows how a 15-second product demo could tell TOMSO's core idea: payments and information spread across separate portals, brought together into one view.

## The film in one line

Three separate payment portals become one clear view. The viewer should end the film thinking "that's the mess my team deals with every month, and it can be one screen."

## Format

| | |
|---|---|
| Composition | `SaaSDemo` (Remotion), English. `SaaSDemoFR` reuses the same timeline with French copy |
| Size / rate / length | 1920×1080, 30 fps, 450 frames (15.0 s) |
| Audio | three synthesized UI sounds (click, soft movement, completion tone). No music, no voice-over |
| Deliverables | `out/preview.mp4` with audio, `out/preview-silent.mp4`, contact sheets, `review.md` |

## Subject and source

- **Subject:** TOMSO (tomso.ca), a Québec payments platform for property managers. According to its site, it "moves payments and information between your property management software and your banks". It covers rent collection by pre-authorized debit, supplier payments, and "a complete, centralized view of all your incoming and outgoing payments, in one place" ([tomso.ca/en](https://tomso.ca/en/), read 2026-10-08).
- **The problem we dramatize** is the one the site describes: "Your team moves information between software and banks. Logs into one portal after another. Checks transactions, one by one."
- **What we did not use:** TOMSO's logo, its photography and illustrations, its testimonials (Brittany Bosman, Michael Wilk), and its performance figures ("90% less time", "$2.5B+", "200,000+ pre-authorized debits", "700+ clients"). Each would either imply endorsement or need substantiation before it appears in anything that looks like an ad.

## Audience and goal

- **Audience:** property-management accountants and operators in Canada (Québec and Ontario). TOMSO's site runs in French and English.
- **Goal:** show the before/after in under 15 s, readable with the sound off, and end on an invitation to explore the demo.
- **Use:** this is a portfolio and pitch piece, not media. If it is ever run as paid media in Québec, French copy is required under the Charter of the French language, and TOMSO must approve it. `SaaSDemoFR` exists for that reason.

## Rules for this film (from the request)

1. Original interface graphics only. The UI is drawn in HTML/CSS for this film. It is not a capture or a copy of TOMSO's product.
2. A small, readable **"Concept demo"** label stays on screen for all 450 frames.
3. No third-party logos, testimonials or performance claims. Amounts in the UI are illustrative, and the label says so.
4. The cursor's "Combine into one view" action is dramatized. We have not seen TOMSO's real product UI, so the film does not claim the button exists.
5. TOMSO's name appears only as plain type on the end card ("An unofficial concept for TOMSO"), never as its logo. It is a single editable field (`brandLine` in `src/content/copy.ts`), and setting it to an empty string removes the name.

## How the two sets of instructions were reconciled

The request combined a generic storyboard (cards labelled Ads, Social and Website) with "build an example of tomso.ca". TOMSO is not a marketing-reporting tool, so:

- **Kept from the request:** structure and frame ranges, the three headlines verbatim, the "Concept demo" label, original UI, Remotion `spring()` (mass 1, stiffness 180, damping 22), three sounds, review passes.
- **Adapted:** the card labels became the three places a property manager checks: **Rent roll**, **Bank portal** and **Supplier bills**.
- **Kept from `/motion-reel`:** pure frame-driven motion, a single source of truth for copy and timing, a contact sheet before each fix, and saying what is real and what we wrote.
- **Dropped from `/motion-reel` for this brief:** "real UI only" and "real logo". Both conflict with an unofficial concept made without the client.

## Real vs written by us

| Item | Status |
|---|---|
| Problem statement, "incoming and outgoing payments, in one place", NSF, pre-authorized debits | paraphrased from tomso.ca (EN/FR) |
| Headlines "Too many tabs." / "One clear view." / "Explore the demo." | written for this film (given in the request) |
| UI, rows, amounts, unit numbers, "Combine into one view" | written and drawn for this film; illustrative |
| Fonts | Instrument Serif and Archivo, both SIL OFL 1.1 |
| Sounds | synthesized locally by `scripts/make-sfx.mjs` |

## Licences and risks

- **Remotion** is free for individuals, for-profit companies with up to 3 employees, and non-profits. Any other company needs a company licence (`node_modules/remotion/LICENSE.md`, v4.0.534). This film is a personal project, so it qualifies. If you make it for an employer or client with more than 3 employees, that organisation needs a Remotion company licence.
- **Trademark:** the end card names TOMSO in plain type, next to an "unofficial" disclaimer. Before publishing it beyond a portfolio, ask TOMSO or remove the name.
