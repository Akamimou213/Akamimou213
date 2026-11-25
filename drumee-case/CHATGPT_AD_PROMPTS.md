# Drumee: creative strategy brief and ChatGPT image prompts

> **Final plan uses one concept only: Concept A** (product-hero version, CTA "Start your team for $1"). The other prompts are kept for later rounds.

## 1. Strategy (why these ads)
| | |
|---|---|
| **Persona** | Agency lead in Manila or Cebu, running an 8–15-person creative, marketing or VA team for US/AU clients. Paid in USD. Client work is spread across Google Drive, Messenger/Viber and email. |
| **Insight** | Overseas clients judge an agency by how organised the handoff looks. Losing "the approved version" costs trust, not just time. |
| **Awareness** | Problem-aware: they feel the chaos, but aren't shopping for a tool. So lead with the pain, then show the product. |
| **Angle A (hero)** | **One Space per client.** Files, chat and tasks for each client in one place, with links you control. |
| **Angle C (challenger, E3)** | **$1 for your team's first month.** Price-led, to test whether a cheaper click brings worse teams. |
| **Avoid** | "One app to replace them all" (ClickUp's longest-running angle on Meta, 238–242 days live), competitor names, and unmeasured claims ("10 minutes", "replace 4 tools"). |
| **Format** | Before/after static, the longest-running static format in the Meta Ad Library sample. Real Drumee UI, never a fake interface. |

## 2. Before you prompt
Attach 2 images to the ChatGPT chat:
1. `drumee-case/assets/stage.png`: the real Drumee UI. The "after" side must look like this.
2. The Drumee logo (export `assets/logo.svg` to PNG).

Generate 3–4 versions of each concept. **Check every word**: image models still make typos. If the logo comes out distorted, leave the area empty and drop in the real logo in Canva or Figma.

---

## 3. Prompt: Concept A, hero (1:1)
```
You are designing a high-converting static Meta ad for Drumee, a team workspace where each client gets one "Space" holding its files, chat and tasks.

AUDIENCE: owners and team leads of 8–15-person creative, marketing and virtual-assistant agencies in the Philippines who serve US and Australian clients.
STRATEGY: before/after. Show the messy client handoff they live with today, then the calm, organised Drumee Space. Lead with their pain in their own words.

FORMAT: square 1:1, 1080x1080 px. Clean, modern SaaS look. White to very light lavender background (#F6F5FF). Generous whitespace. Sans-serif type similar to Plus Jakarta Sans. All text must be spelled exactly as written below. Do not add any other text.

LAYOUT (top to bottom):
1. A white chat bubble with a thin grey border, top-left, in a casual chat-message style, containing exactly:
   "Wait… which version did the client approve?"
2. Headline, bold, left-aligned, 2 lines:
   Line 1, dark navy #0B0A21: "One Space per client."
   Line 2, purple #4A3FD6: "Files, chat, tasks together."
3. Two side-by-side panels taking about 50% of the height:
   LEFT panel, label "BEFORE" in small grey caps, light grey background. Four white cards scattered and slightly tilted, feeling messy:
     - a PDF file card: "Brief_FINAL_v3_real.pdf"
     - a chat message card: "see attached 👆"
     - an email card: "Re: Re: Fwd: feedback"
     - a link card: "Shared link, still open"
   RIGHT panel, label "AFTER · ONE DRUMEE SPACE" in small purple caps, soft lavender background (#EFEDFF). Show the attached Drumee app screenshot as a clean desktop window: pink folders, file tiles, a team chat on the right, and a floating white card titled "Share Budget_Q4.xlsx" with rows "Link expires · Fri, 6 pm", "Password · On", "Download · View only", "Access · Revoke anytime". Keep it faithful to the reference UI.
4. Bottom-left: the Drumee logo from the attached image. Under it: "$1 first month · then $29/month"
5. Bottom-right: a rounded pill button, purple #4A3FD6, white text: "Start your team →"

MOOD: relief and control. Left feels cluttered and grey, right feels calm and organised.
DO NOT include: people, stock photos, other brands or logos, extra slogans, statistics, or fake UI elements that are not in the reference.
```

## 4. Prompt: Concept A, 9:16 (Stories and Reels)
```
Recreate the previous ad in vertical 9:16, 1080x1920 px. Same text and style. Stack the elements vertically: chat bubble → headline → BEFORE panel → AFTER panel (make the Drumee UI larger) → logo + "$1 first month · then $29/month" → "Start your team →" button. Keep the top 250 px and bottom 340 px free of text (Instagram/Facebook interface safe zones).
```

## 5. Prompt: Concept C, the "$1" offer card (E3 challenger)
```
Design a square 1:1 (1080x1080) static Meta ad for Drumee, a team workspace for small agencies and remote teams.

STRATEGY: price-led offer card. The "$1" must be the first thing the eye sees, with the real product visible underneath as proof.

STYLE: deep purple gradient background (#4A3FD6 → #2B228F), white type, sans-serif similar to Plus Jakarta Sans, high contrast. Text spelled exactly as written. No other text.

LAYOUT:
- Top-left: the Drumee logo (attached) in white. Top-right: an outlined white pill reading "TEAM PLAN".
- Left half: a huge white "$1", about 40% of the canvas width.
- Right of the "$1": bold white text "Your team's first month in one Space." and below it, smaller and 80% opacity: "Files, chat and tasks together. $29/month after. Cancel in one click."
- Lower 40%: a white rounded card showing the attached Drumee app screenshot (files on the left, team chat on the right), cropped by the bottom edge, as if rising into view.
- Bottom strip, white, full width: dark text "Built in Europe · Reminder email 3 days before renewal" on the left, and a purple pill button "Start for $1 →" on the right.
DO NOT include: people, other brands, statistics, discount badges, or countdown timers.
```

## 6. Prompt: Concept A2, native chat post (optional extra hook)
```
Design a square 1:1 (1080x1080) Meta ad that looks like a native phone screenshot, not an ad.

Top 70%: a realistic but generic messaging-app conversation on a light background (no real app branding). Messages:
  - Grey bubble (client, name "Client – Sarah"): "Can you send me the final version?"
  - Purple bubble (agency): "Sure! Is it v3 or v3_final? 😅"
  - Grey bubble (client): "The one I approved last week…"
Bottom 30%: a clean white panel with the Drumee logo (attached) and the bold line "One Space per client. The approved version is always the latest." plus a small purple pill button "Start your team →".
Text spelled exactly. No other brands, no people's photos.
```

---

## 7. Copy for the platforms
**Meta primary text (A):**
> Client files in one app, feedback in another, approvals buried in email. Drumee gives every client one Space: files, chat and tasks together, with share links that expire. Team plan: $1 for your first month.

**Meta primary text (C):**
> Run your whole team in one Space for $1 this month. Files, chat and tasks together, and $29/month after. Cancel in one click.

**Meta headlines:** One Space per client · Files, chat, tasks: one Space · Your team's first month for $1

**ChatGPT Ads:**
- Headline (≤ 50): `One Space per client. Files, chat, tasks.` (41)
- Description (≤ 100): `Stop chasing the approved version across apps. Expiring client links. Team plan: $1 first month.` (96)

**Hooks for the next round:** "Your client asked for the final file. Which one?" · "Stop sending clients links that never expire." · "New VA? Give them one Space, not five logins."

---

## 8. After generating
Send the chosen images here (or save Concept A as `drumee-case/out/ad_main.png` and Concept C as `drumee-case/out/ad_c.png`) and I'll put them into slide 7 and re-export the PDF.
