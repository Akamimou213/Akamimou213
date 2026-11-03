# Trench Desk audit · 3 Nov 2026

The question: does the desk make money, not only avoid losing it?

This audit covers everything we have:
- the 148-call audit
- the Trench Playbook
- the scanner's live sample
- the trader's 7-seat prompt
- a fresh backtest run today on 97 young Solana pools nobody hand-picked

## Bottom line

1. **No proven edge yet.** On today's data, no exit plan makes money on its own. With only the desk's volume filter as the entry, every plan is negative once outliers are capped. The entry decides whether the desk makes money; the exit only decides how much.
2. **The trader's rules fit a momentum entry; our judge uses a pullback entry.**
   - **Momentum entry:** buying young coins near their 60-minute high on heavy volume, the trader's −6% stop / +12% trail made **+6.4% a trade** (capped, 94 trades). It was positive in both halves of the period, and the 90% range starts above zero.
   - **Pullback entry:** the entry the Playbook and JUDGE prefer, the same exit lost **−3.5% a trade** (206 trades), with the whole range below zero.
   - **Mismatch:** the desk as first built paired the trader's exit with the pullback entry, the losing combination.
3. **The two datasets disagree on the entry.**
   - The 148 calls said buy the pullback (+24.6%) and never buy near the high (−16.4%).
   - Today's young-pool sample says the reverse: near the high, every exit plan is positive (+0.1% to +8.1% capped). On the pullback, every one is negative or flat (−0.2% to −8.5%).
   - Today's sample leans toward coins that ended up big (see Limits), which flatters buying the high. So neither result can be trusted alone.
4. **The money is in rare runners.** Average, capped average and median sit far apart for every plan. A few coins run 3–50x and most drift down. Exits that cap the upside early (take +30%) lose on 5 of 6 entry rules.
5. **Size by risk, not a fixed 8%.** At 8% of the account with a −50% stop, one stop-out costs 4.4% of the account, and ten in a row cost about 36%. The desk now sizes each trade so a full stop-out costs 1% of the account, with 8% as a hard cap.

**What changed in the desk:**
- **Shadow book.** Every lead RISK passes now gets a paper entry under all 9 exit plans, whatever JUDGE says, tagged with where it sat against its 60-minute high.
- **Head to head.** `desk.py strategy` shows strategy A (pullback + 2x / −50%) against strategy B (near the high + trailing exit) on the desk's own leads. That sample isn't biased toward winners, so it settles the disagreement.
- **Live paper plan:** A, for now. It's the only combination backed by the independent 148-call data, and it matches JUDGE.

## What we have

| Piece | What it is | Evidence grade |
|---|---|---|
| `memecoin-audit/` | 148 calls from one Telegram channel (May–Oct 2026), replayed on-chain with 1-minute candles | in-sample: the rules were found on the same calls they were tested on |
| Trench Playbook | Volume + pullback entry, 00–08 UTC window, safety dossier, 2x / −50% / 60-min exit, 1% risk | rules from that audit plus protocol docs |
| `memecoin-scanner/` | Coin checker, 24/7 collector and validator | one 3-hour live sample: random entries lost −21% a trade |
| Trader's prompt | 7 seats, a four-question judge, −6% stop, trail after +12%, 8% size, five kill filters | content-creator rules, untested |
| `memecoin-desk/` | The seats, built from that prompt | software tests, plus three live runs |
| `backtest.py` (new) | Entry rules × exit plans on young pools, with the desk's own exit engine | today: 97 pools from launch, 66,088 pool-minutes, 1–3 Nov |

## The trader's rules, one by one

| Rule | Verdict | Why |
|---|---|---|
| Seats with hard handoffs, the user signs | **Keep** | Process, not a bet. Every decision is logged and checkable |
| JUDGE: four fixed closed questions, gate in code, no answer = pass | **Keep** | Verdicts can be compared across days and checked on Sundays |
| JUDGE's "late" question (penalises buying near the high) | **Keep, under test** | Right on the 148 calls, wrong on today's young pools. The head-to-head decides |
| Confidence never sizes | **Keep** | Confidence isn't calibrated yet |
| Mint and freeze revoked, LP locked, dev not linked to a rug | **Keep** | Each blocks a known way to lose 100% |
| 1-hour volume ≥ $50k | **Keep** | Without volume there's no exit. On its own it isn't an edge (column "volume filter only" below) |
| Top 10 holders ≤ 20% | **Keep, measure** | Stricter than the playbook's 30%; untested. It killed 2 of 6 leads in one live run. The 24h follow-ups show whether killed coins went up |
| Stop −6% with a trail after +12% | **Moved to shadow (strategy B)** | Positive only with a momentum entry. Its median trade is −10.2% on four of the six entry rules |
| 8% of balance per trade | **Replaced by risk sizing** | Only sensible with a tight stop; with a wide stop it risks 4%+ per trade |
| No averaging down, no revenge trades, daily stop | **Keep** | Behaviour limits that cost nothing |

## Fresh backtest

Setup:
- **Pools:** PumpSwap, pump.fun, Raydium and Meteora pools with candles from launch.
- **Signals:** taken only in each pool's first 6 hours (the desk's watch window).
- **Entry:** at the next minute's open.
- **Costs:** 4.5% round trip.
- **Exits:** run by the same engine the live desk uses. Targets and trails trigger on candle bodies, not wicks; stops see downside wicks.

Each cell shows **capped average / median (trades)**. "Capped" counts each trade at most +200%, so one freak coin can't decide the answer. The plain average is much higher for the trailing plans because of a few huge runners.

| Exit plan | Volume filter only | Random minute | Pullback 7–30% | A-setup (vol ≥ $117k + pullback) | Near the high (< 7%) |
|---|---|---|---|---|---|
| trader: stop −6%, trail 6% after +12% | −0.6% / −10.2% (761) | +0.3% / −5.1% (248) | **−3.5% / −10.2% (206)** | −2.5% / −10.2% (116) | **+6.4% / −3.7% (94)** |
| playbook: TP 2x, stop −50% | −4.5% / −4.7% (210) | −2.7% / −2.9% (188) | −0.2% / −8.0% (43) | +4.8% / −12.0% (25) | +2.8% / +1.6% (60) |
| TP 2x, stop −40% | −4.4% / −8.4% (230) | −2.6% / −3.9% (200) | −3.9% / −11.5% (49) | −2.4% / −26.0% (30) | +0.9% / −0.4% (62) |
| TP 1.5x, stop −30% | −5.0% / −7.8% (282) | −5.9% / −5.0% (210) | −5.2% / −18.3% (64) | −3.6% / −23.1% (38) | +1.5% / +2.4% (67) |
| stop −15%, trail 10% after +20% | −0.5% / −18.8% (460) | −0.6% / −4.2% (209) | −5.7% / −18.8% (109) | −3.5% / −18.8% (62) | **+7.8% / −0.4% (73)** |
| stop −20%, trail 15% after +30% | −0.2% / −11.8% (338) | −5.2% / −4.3% (208) | −6.1% / −23.6% (84) | −3.9% / −23.6% (48) | +7.1% / −0.6% (67) |
| stop −30%, trail 20% after +50% | −0.8% / −6.9% (255) | +1.0% / −4.2% (190) | −6.6% / −25.0% (61) | −5.9% / −33.1% (35) | +6.8% / +1.5% (63) |
| stop −40%, half at 2x, trail 25% on rest | −3.5% / −14.4% (189) | +0.9% / −4.2% (153) | −1.8% / −33.0% (43) | −0.8% / −42.7% (26) | +8.1% / +5.9% (45) |
| stop −10%, TP +30%, 30 min | −3.6% / −14.1% (595) | −3.4% / −4.4% (244) | −6.3% / −14.1% (137) | −5.2% / −14.1% (78) | +0.3% / −2.3% (107) |
| hold 60 min, no stop | −6.6% / −4.5% (164) | −6.1% / −3.3% (166) | −8.5% / −11.5% (42) | +1.9% / −19.8% (23) | +0.1% / +1.5% (59) |

How sure each result is (90% range by pool bootstrap, and both halves of the period):
- **Near the high + trader −6% / +12%:** 28 pools, range **+0.4% to +160%**, positive in both halves (+104% and +4.8% uncapped). One of only two combinations whose range clears zero.
- **Near the high + stop −15% / trail after +20%:** positive in both halves, range just above zero (+0.4%).
- **Pullback + trader −6% / +12%:** 21 pools, range **−5.1% to −1.7%**: reliably negative.
- **Pullback + 2x / −50%:** range −8.7% to +8.2%: a coin flip. On the 148 calls the same pairing made +24.6%.

**$1,000 account, desk limits (10 trades a day, 5 open), pullback entry, 1.7 days:**

| Exit plan | Fixed 8% | Risk 1% | Risk 2% |
|---|---|---|---|
| trader −6% / +12% | $884 (drawdown −12%) | $884 (−12%) | $781 (−22%) |
| TP 2x, stop −50% | $1,153 (−6%) | $1,035 (−1%) | $1,070 (−3%) |
| stop −40%, half at 2x, trail 25% | $1,305 (−7%) | $1,081 (−2%) | $1,166 (−4%) |

These are 16–28 trades each, so read them as a picture of the risk, not a forecast.

## Why the trader's exit loses on a pullback and wins on momentum

- **The exit is a momentum tool.** It works only if price is already moving up, so the −6% stop rarely gets hit before the +12% trail arms. Near the high in a young coin with heavy volume, that's often true: 43% of trades win, and the runners pay for the losers.
- **On a pullback it bleeds.** Buying a coin that has just fallen 7–30% means the next 6% move is as likely to be down as up. Each stop costs −10.2% after fees, which is the median trade there.
- **The fix is to keep it paired.** The trader's exit stays, but only with the entry it was made for. That pairing is strategy B in the head-to-head.

## How the desk is set now

| Part | Setting | Where |
|---|---|---|
| Filter | Your five kills plus RugCheck flags; unknown = dead | `risk` |
| Entry | JUDGE's four questions and gate, unchanged | `judge` |
| Live paper exit | **Strategy A: sell 100% at 2x, stop −50%, out after 60 minutes** | `exit.plan` |
| Size | **Full stop-out = 1% of the account** (about $18 on $1,000), never above 8% | `sniper.risk_per_trade_pct` |
| Shadow book | Every lead RISK passes gets a paper entry under all 9 exit plans, tagged with JUDGE's verdict and position (near high / pullback / dump) | `exit.shadow_book` |
| 60-minute high for new leads | From the pool's 1-minute candles (bodies, not wicks) when the desk's own history is too short | HEAD dossier |
| Head to head | A (pullback + 2x / −50%) vs B (near high + −6% / +12%) vs B2 (near high + −15% / +20%) | `head.compare`, `desk.py strategy` |

**Decision rule, written down now:**
- **To switch the live strategy,** one side needs 100+ shadow trades, a positive capped average, and a positive median in both halves of the period.
- **If B wins,** change JUDGE's gate so "late" stops vetoing buys near the high (`judge.gate.late_must_be`), and set `exit.plan` to B's plan.
- **To raise risk from 1% to 2%,** the live strategy must have met that bar for two Sundays in a row.

**What it could earn if an edge holds.** At +7% capped per trade on a 1%-risk position, a trade earns:
- **Strategy B** (stop −6%, so about a $80 position): about **$5.60**.
- **Strategy A** (stop −50%, about $18): about **$1.30**.

Ten trades a day on $1,000 would be roughly +5% a day for B and +1.3% for A, before compounding and before your real fills. That gap is exactly why the head-to-head matters, and why neither number should be trusted until the desk's own data confirms it.

## What would earn more

1. **A smart-money list.** `data/whales.txt` is empty, so WHALE contributes nothing. Wallets that bought early in past runners are the strongest signal we don't have.
2. **Lower costs.** 4.5% round trip is the single biggest drag. Deeper pools (bonded, higher market cap) and a cheaper route cut it, and every 1% saved goes straight onto every trade.
3. **More leads in the best hours.** The 148 calls posted 00–08 UTC made +35% (28 calls). A call channel can feed SEARCH as a lead source.
4. **Measure your real fills.** Paper fills use the quote at approval, and yours will be later and worse. Record them with `FILL #id <price>` in manual mode.

## Limits

- **Small sample.** 97 young pools, 1.7 days, one market regime. Read the numbers as direction, not as a win rate to bank on.
- **Lookahead bias.** Pools were chosen by their 24-hour activity measured afterwards. That favours coins that ran, which flatters buying near the high and trailing exits. It's the main reason strategy B isn't live yet. The shadow book has no such bias: it takes every lead as SEARCH finds it.
- **No safety filters in the backtest.** Holder history isn't available after the fact. RISK only removes coins, so the desk's real pool of trades is smaller and should be safer.
- **Fills.** Candles can't show sandwiching or a failed transaction. In the live run, one fast dump filled the −6% stop at −12.9% after fees. Tight stops pay most for this.
- **None of this is financial advice.** It's a test plan. Paper first.

Reproduce: `python3 backtest.py fetch --pools 240` then `python3 backtest.py run`. Downloads are cached in `data/candles/` (git-ignored), and a second `fetch` picks up pools that were rate-limited.
