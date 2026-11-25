# Appfound outbound: plan and decisions

Owner: the Brain. Source of truth with `leads.jsonl` (kept out of git).

## State on 2026-11-25
- Step 1 (setup) is done for Apollo, treg and Context. Firecrawl credits are not checked yet. No CSV uploaded, so W1 rebuilds the list from the free Apple charts.
- No leads yet. Batch 1 (50) has not started.
- Prep docs written: `deliverability.md`, `credit_plan.md`, `linkedin_playbook.md`, `copy/email_sequence.md`.

## Balances
| Tool | Balance |
|---|---|
| Apollo | 85 lead credits (0 used), 160 direct-dial, 5,000 AI credits; waterfall email + phone enabled, no saved choice |
| Apollo mailboxes | 0 connected; 0 domains bought; 1 domain purchase left |
| treg | $0.56 |
| Context | 9,351 credits, Free plan, +1,000 on 2026-11-30 |
| Firecrawl | not checked |

## Decisions made
- Sending domains to buy (by Mohamed): tryappfound.com + appfoundhq.com, 2 inboxes each. Spare: useappfound.com.
- Open + click tracking OFF. Warm-up stays ON at ~10% forever. 20 cold/inbox/day cap.
- Apollo `people_match` = 1 credit (it includes the email), so the "free match" step is replaced by the free people **search**.
- Standard lookup, not waterfall, unless Mohamed approves a live quote.
- Tier 3 = LinkedIn only, 0 credits.
- Lead and people data are git-ignored.

## Open questions (Mohamed decides)
1. May "Get Regular" / "Yassir" appear by name in cold messages?
2. Opener test: run it as round 4 (my recommendation), or replace round 1?
3. Primary website domain: keep appfound.vercel.app, or buy appfoundapps.com / appfound.agency?
4. LinkedIn Premium for one month (personalised-note cap)?
5. DM 3 / email 2 rules: confirm the "exactly one question" rule allows DM 3 with no ask.

## Next step
Mohamed answers the open questions and OKs batch 1 → W1 (free charts) → W2…W6 → W9 → fit table.
