# Tiers and credit routing (before any enrichment)

Checked 2026-11-25. Apollo: **85 lead credits, 0 used**. Waterfall email is enabled, with no saved choice, so Apollo would default to waterfall for email reveals. treg balance: **$0.56**. Context: **9,351 credits** (Free plan, +1,000 on 30 Nov). Nothing paid has run, and `costs.jsonl` is empty.

## Correction to the credit router (read first)

Your router assumes step 2 ("people_match without a reveal") costs no credit. Apollo's own tool terms say otherwise:

| Apollo action | Real cost (from the tool's own terms) |
|---|---|
| `apollo_mixed_people_api_search` (find a person by company + title) | **No credit.** Returns Apollo id, name, title and employer. No email, and the last name may be masked on your plan |
| `apollo_people_match` (confirm person + LinkedIn + work email) | **1 credit per matched person**, 0 if not found. The work email comes back in the same call, so "match" and "reveal" are **one** paid step, not two |
| Waterfall email (`run_waterfall_email`) | **Variable, plan-dependent.** Can be more than 1 credit. A live quote comes back in `mcp_credits` on the first call |
| `apollo_email_validation_validate` | **Up to 1 credit per address** |

So the router becomes:

1. **Free:** Google Play developer email, the website's contact or founder page (Context `web-scrape`), the founder's public X bio or personal site. The address must belong to the person (a `support@` or `hello@` inbox counts as "company inbox", not the decision-maker).
2. **Free:** Apollo people **search** by company domain + titles, to confirm who the founder or CEO is.
3. **1 credit:** Apollo `people_match` for Tier 1 and Tier 2 only. It returns email, `email_status` and LinkedIn URL together.
4. **Waterfall:** only if step 3 returns no email. Quote first.
5. **Verify:**
   - Apollo `email_status = verified` → no extra check.
   - Free-found addresses and anything not `verified` → validate. Apollo validation is up to 1 credit each. The treg verifier is about $0.56 of runway, so check its price with `catalog_get` first.
   - Tier 3 never gets "catch-all/unverified".

## Tier rules

| Tier | Rule | Treatment | Channel |
|---|---|---|---|
| **T1** (~10–15) | HIGH + **2+ dated signals** | Brain writes each message, cites one specific ad or review, records a 60-sec Loom teardown idea | Email + LinkedIn (with note) |
| **T2** (~35) | HIGH + **1 dated signal** | Skeleton + personal first line + one specific observation | Email + LinkedIn |
| **T3** (rest) | MEDIUM | Template + first line | **LinkedIn only** until a signal appears. **0 credits** |
| (LOW, DROP) | – | Monthly re-check / none | – |

Assigned automatically from the ledger: count the S1–S4 signals where `found=true` AND a date is present AND `evidence_url` is present. S5 is hook material and never counts toward tier.

## Projected credit use (85 credits, 20 held in reserve)

Assumes free sources find **0** emails, which is the worst case. Every free hit saves 1 credit.

| Tier | Leads | Contacts/lead | Match credits | Validation credits (est.) | Credits needed | Credits left after |
|---|---|---|---|---|---|---|
| Start | – | – | – | – | – | **85** |
| Reserve ("talk to my co-founder") | – | – | – | – | **20** (held) | 65 usable |
| T1 | 15 | 1, plus a 2nd only for the ~5 leads where the 1st isn't the decision-maker or misses | 15 + 5 = 20 | ~5 (free-found or not-verified) | **25** | 40 |
| T2 | 35 | 1 | 35 | ~5 | **40** | **0** |
| T3 | rest | 0 (LinkedIn only) | 0 | 0 | **0** | 0 |
| **Total** | 50 | – | 55 | ~10 | **65 + 20 reserve = 85** | **0 spare** |

**What this means:**
- There's zero headroom. If free sources find nothing, a single waterfall call or one more T1 second contact eats into the reserve.
- My recommendation: run the free steps 1–2 for all 50 first (no credits). Then show you the real count still needing a paid match. I expect it to be well under 50, but I won't assume that.
- Waterfall is off the table unless you approve a live per-contact quote. It's your account default, so every `people_match` call I make will explicitly run the **standard** lookup unless you say otherwise.
- If the first batch has fewer than 50 HIGH leads (likely, since the tier sizes come from your targets and not from data), the leftover credits stay unspent until the next batch.

## Ledger fields added (every record, null when unknown)

```json
"tier": "T1|T2|T3|null",
"signal_count": 0,
"email_source": "free|apollo|waterfall|null",
"email_source_url": null,
"email_status": null,
"credits_spent": 0
```
`email_status` holds exactly what Apollo returns (`verified`, `guessed`, `unavailable`…), or the validator's verdict (`validated` / `not_validated`), never a reworded value. `credits_spent` is per company and adds up to `costs.jsonl`.

## Before any credit is spent I will show you
"Enriching N contacts will cost up to N credits. Proceed?", with the list of names, and wait for your yes.
