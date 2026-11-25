# Cold email deliverability setup (Appfound)

Checked 2026-11-25. Nothing bought, connected or sent. You do every step below.

## 0. What I found

| Check | Result |
|---|---|
| Mailboxes connected to Apollo (`apollo_email_accounts_index`) | **None** |
| Domains bought through Apollo (`apollo_domain_purchase_index`) | **None.** Your team can buy only **1** more domain through Apollo |
| Can Apollo check availability? | **No.** That tool only lists domains you already own. I checked availability with free RDAP lookups and the Vercel registrar price API (read-only) |
| Appfound's own main domain | **You don't have one.** The site runs on `appfound.vercel.app`, and `appfound.com`, `appfound.io` and `appfound.co` are all taken. See "THINGS TO CHECK" |

## 1. Capacity math

| Step | Math | Result |
|---|---|---|
| Daily sends (your target) | 800/month ÷ 20 sending days | **40/day** |
| Inboxes | 40 ÷ 20 per inbox | 2 |
| Domains | 2 ÷ 2 inboxes per domain | 1 |
| + 20% spare | 2 × 1.2 = 2.4 inboxes; 1 × 1.2 = 1.2 domains | **3 inboxes, 2 domains** (rounded up) |
| **Recommended build** | 2 domains × 2 inboxes | **4 inboxes = 80/day ceiling at full ramp** |

Why 4 inboxes instead of 3: your stop rules pause a whole domain. With 2 domains × 2 inboxes, a paused domain still leaves 40/day, which is your full target. With 3 inboxes split 2+1, losing the bigger domain leaves 20/day.

**Reality check: the credits limit volume more than the inboxes do.** 85 Apollo credits buy at most about 65 email addresses after the 20-credit reserve (see `credit_plan.md`). Tier 3 is LinkedIn-only. So the first 4 weeks realistically means about 50 email leads × 4 steps = **~200 sends, or 10/day**, not 800. The 4 inboxes still make sense because they cost little, they're a buffer, and you scale into them when you buy more credits.

Ramp capacity with 4 inboxes (warm-up plan below):

| Week | Dates (if inboxes are live by Sun 29 Nov) | Cold per inbox/day | Total/day |
|---|---|---|---|
| 1 | 30 Nov – 6 Dec | 0 (warm-up only) | 0 |
| 2 | 7 – 13 Dec | 5–10 | 20–40 |
| 3 | 14 – 20 Dec | 15 | 60 |
| 4+ | 21 Dec → | 20 | 80 |

The 21 Dec – 4 Jan holiday window brings weak reply rates. Get the first batch out in weeks 2–3, then pause new step-1 sends until 5 Jan. Follow-up steps can keep running.

## 2. Secondary domains: available and priced

Prices are Vercel registrar list prices (USD, 1 year), checked 2026-11-25. Any registrar works (Cloudflare and Porkbun are usually at cost). Because Apollo lets you buy only 1 more domain, buy outside Apollo or split the purchase.

| Domain | Available | 1st year | Renewal | Pick |
|---|---|---|---|---|
| **tryappfound.com** | yes | $12.03 | $12.03 | **Buy: domain A** |
| **appfoundhq.com** | yes | $12.03 | $12.03 | **Buy: domain B** |
| useappfound.com | yes | $12.03 | $12.03 | Spare, buy only if one gets retired |
| joinappfound.com | yes | $12.03 | $12.03 | Spare |
| appfoundgrowth.com | yes | $12.03 | $12.03 | Spare (long) |
| getappfound.com | **taken** | – | – | – |
| appfound.co | **not available** | – | $24.80 | – |

Optional, for a primary brand domain (website only, never cold email): `appfoundapps.com` $12.03/yr, or `appfound.agency` $5.99 first year then $27/yr. `appfound.io` is taken.

**Cost to buy (you):** 2 domains × $12.03 = **$24.06/yr**, plus Google Workspace for 4 inboxes. Business Starter has been about $7/user/month on an annual plan or $8.40 on the flexible plan, so roughly **$28–34/month**. Check the current price at checkout.

## 3. Per-domain checklist (do it for tryappfound.com, then appfoundhq.com)

Planned inboxes (a real person, no invented personas):
- `mohamed.barkat@tryappfound.com`, `mohamed@tryappfound.com`
- `mohamed.barkat@appfoundhq.com`, `mohamed@appfoundhq.com`

Each domain gets 2 inboxes for the same real person. Do not invent a second "teammate" name to fill an inbox. That is deceptive, and recipients do check.

- [ ] **1. Buy the domain.** Turn on WHOIS privacy and auto-renew.
- [ ] **2. Google Workspace.** Add the domain as a *secondary domain* if you keep a single Workspace org, or start a new Business Starter org. Create the 2 users above.
- [ ] **3. Profile.** Display name "Mohamed Barkat", a real photo (the same one as LinkedIn), the same name in Google profile and Gmail settings.
- [ ] **4. Signature: plain text, no links, no images:**
  ```
  Mohamed Barkat
  Appfound · growth for subscription apps
  ```
- [ ] **5. MX** (Google's current single record for new setups):
  `@  MX  1  smtp.google.com`
  Older orgs use the 5-record set (`aspmx.l.google.com` at 1, `alt1/alt2` at 5, `alt3/alt4` at 10). Use whatever Admin console › Domains shows you.
- [ ] **6. SPF:** one TXT record on `@`, and only one SPF record per domain:
  `v=spf1 include:_spf.google.com ~all`
  Apollo sends through your Gmail connection, so it needs no extra include.
- [ ] **7. DKIM (2048-bit). It is OFF by default:**
  Admin console › Apps › Google Workspace › Gmail › Authenticate email › pick the domain › Generate new record › **2048** bits › prefix `google`.
  Add the TXT at `google._domainkey` with the value Google gives you. After DNS has propagated (up to 48 h, usually under 1 h), go back and **click "Start authentication"**. Then confirm the status reads "Authenticating email with DKIM".
- [ ] **8. DMARC** (start at monitor only):
  `_dmarc  TXT  v=DMARC1; p=none; rua=mailto:mohamed@<domain>; adkim=r; aspf=r; pct=100`
  After 4 clean weeks, move to `p=quarantine`.
- [ ] **9. Root redirect:** `https://<domain>` → 301 → `https://appfound.vercel.app`. Use the registrar's URL forwarding, or add the domain to the Vercel project as a redirect. Also redirect `www`.
- [ ] **10. Verify DNS** with a free checker (MXToolbox, or Google Admin Toolbox "Check MX"). SPF, DKIM and DMARC should all pass. Send a test to a Gmail and an Outlook address and check "Show original" for `spf=pass dkim=pass dmarc=pass`.
- [ ] **11. Connect to Apollo:** Settings › Mailboxes › Link Gmail, once per inbox. Then in each mailbox's settings:
  - **Open tracking OFF**
  - **Click tracking OFF.** It rewrites links through a shared tracking domain. Email 3 is the only email with a link.
  - Daily limit: **0 cold in week 1**, then follow the ramp.
  - Sending window: recipient's local business hours, Mon–Thu best.
- [ ] **12. Warm-up ON** (Apollo's built-in warm-up or another tool you trust). See section 4.
- [ ] **13. Google Postmaster Tools:** add and verify each domain (free) to see spam rate and domain reputation once volume builds.
- [ ] **14. Tell me "inboxes connected".** I then run step 5 below.

Never:
- Never cold email from your main or personal domain, or from Gmail.
- Never put the main brand domain in a cold inbox's signature or SPF.
- Never buy lists, and never send to unverified addresses.
- Never paste the same email word for word to everyone (Apollo sequences + first lines handle this).

## 4. Warm-up plan

| Week | Warm-up | Cold sends per inbox/day | Notes |
|---|---|---|---|
| 1 | ON (ramping, tool default) | **0** | Also send 5–10 real emails a day by hand from each inbox (to friends or your own accounts, with replies) |
| 2 | ON | **5–10** | First cold step-1s go to Tier 1 leads only, the best-verified addresses |
| 3 | ON | **15** | |
| 4+ | ON at **~10% of volume, forever** | **20** (cap) | Never raise above 20/inbox/day. Add inboxes instead |

## 5. After you connect the inboxes

I'll run `apollo_agent_fix_email_deliverability` and report, for each domain: SPF, DKIM and DMARC status, alignment, warm-up status, current daily limit, and any recommendation. That tool is an Apollo AI agent and may *propose* changes to mailbox settings. I'll show you each proposal in plain words and apply nothing without your yes.

## 6. Stop rules (you follow these; I flag them in every update)

| Trigger | Measured over | Action |
|---|---|---|
| Bounce rate **> 2%** | per domain, rolling 7 days (or the last 100 sends) | Pause that domain's sequences. Re-verify the remaining list. Find which source the bounces came from |
| Spam complaints **> 0.1%** (1 in 1,000) | per domain, Postmaster Tools + Apollo | Pause. Review copy and targeting before resuming |
| Domain still landing in spam after **2–3 weeks of clean sending** | seed tests + Postmaster reputation | Retire the domain. Bring in a spare (useappfound.com), warmed for 1 week first |
| Positive reply rate **< 1%** after 100 sends | per variant | Not a deliverability rule: a copy and list problem. Tell me and I'll diagnose |

At about 10 sends/day, 2% means a single bounce in a 50-send week. Treat the first bounce of each week as a reason to check, not to panic. Two bounces in 100 sends = pause.
