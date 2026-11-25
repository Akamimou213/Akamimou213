# LinkedIn: daily manual plan (Tier 1 + Tier 2)

You do every action by hand. No bots, no extensions, no auto-visits. I plan, write and track.

## Limits

| Limit | Value |
|---|---|
| Connection requests | 15–20/day, **max 100/week** |
| New leads entering the sequence | **10/day**, Mon–Fri. 50 T1+T2 leads = 5 working days of intake, ~50 requests/week |
| Acceptance alarm | Below **20%** over a rolling 7 days → stop new requests, I review the list |
| Notes on requests | Free accounts have a small monthly cap on personalised notes (LinkedIn changes it; check your account). Tier 1 needs ~15 notes, so you may need Premium for one month |

## Per-lead sequence (dates are relative to the connection request)

| Day | Action | Text rules |
|---|---|---|
| −3 | View profile. Follow the founder + the app's company page | – |
| −2 | Like, or leave a real one-line comment, on a post from the **last 30 days**. If none, skip and record "no recent post" | The comment must say something specific about the post. Never generic praise |
| 0 | Connection request | **T1:** note < 300 chars, opens with the dated signal, no pitch, no link, 1 question. **T2:** a note only if they posted in the last 30 days; otherwise no note |
| Accept + 24–48 h | DM 1 (< 400 chars) | signal → problem → one exact proof line → "Worth me sending your app's 48-hour growth plan?" |
| DM 1 + 4 | DM 2 | one new proof point OR one store/ad observation, 1 question |
| DM 1 + 10 | DM 3 | one competitor ad angle from the Ad Library, **no ask** (this is the one message with 0 questions; see THINGS TO CHECK) |
| any | **Reply on LinkedIn or email → stop both channels** | I move them to "replied" in the ledger and log it |

## Message skeletons (filled per lead from verified ledger facts only)

**T1 connection note** (target 200–280 chars):
```
Hi {first_name}, {dated_signal_short}. I work on growth for subscription apps and follow how small teams run paid acquisition. Open to connecting?
```
`dated_signal_short` example *shape* (not real data): "saw {App} started 6 new Meta ads on 12 Nov".

**DM 1** (target 300–390 chars):
```
Thanks for connecting, {first_name}. {dated_signal}. {problem_line} {proof_line_exact} Worth me sending your app's 48-hour growth plan?
```

**DM 2:**
```
One thing I noticed on {App}: {store_or_ad_observation_with_date}. {why_it_matters_one_line} Want me to include a test for it in the plan?
```

**DM 3 (no ask):**
```
Saw {competitor} has run a {hook_type} ad since {date}: {one-line description}. Could be a useful angle for {App}.
```

## Each morning you get (file: `outbound/linkedin/daily/<date>.md`, kept out of git)

| # | Person | LinkedIn URL | Today's action | Exact text to paste | Why (signal + date) |
|---|---|---|---|---|---|

Plus yesterday's totals: sent, accepted, replied, and acceptance rate (7-day rolling).

## Log format: `outbound/linkedin_log.jsonl` (one line per action, kept out of git)

```json
{"date":"2026-12-01","company":"","person":"","linkedin":"","tier":"T1","action":"view|follow|engage|connect|dm1|dm2|dm3","text_sent":null,"result":"done|skipped|accepted|replied|no_recent_post","notes":null}
```

## Apollo tasks

Only after you approve that day's list, I create matching `linkedin_step_message` tasks with `apollo_tasks_bulk_create`. Each task needs an Apollo **contact** id, so the person must already be saved as a contact, which happens at enrichment (W7). T3 people who were never matched have no contact, so they get no Apollo task.

## Status

**Not started:** there are no approved leads yet. The first daily table is produced the morning after you approve batch 1's T1/T2 list.
