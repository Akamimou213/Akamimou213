# Trench best practice · v2 · 4 Nov 2026

How Solana memecoins move, what moves them, and the rules that follow. Each rule says what stands behind it:

- **data:** measured in this repo
- **source:** protocol docs or published research
- **thumb:** common practice, untested here

Sources:
- the 148-call Gambles audit (May–Oct 2026)
- the 9-day MadApes export (27 Oct–4 Nov)
- a backtest and lifecycle study of young pools (1–3 Nov)
- live PumpPortal counts
- the Trench Playbook

Read every number as direction, not as a promise.

## 1. The market in one page

- **Almost everything dies.** On pump.fun about 1 coin in 100 graduates from the bonding curve, 80% stop trading by day one, and 4.5% still trade after 90 days. *source* On 4 Nov 2026 the live feed counted about 965 launches and 56 graduations an hour. *data*
- **The default trader loses.** 90% of 829,539 Fomo-app wallets were behind after fees, and the top 1% took 94% of the winnings. Devs and their bundles took $579M, against $31.5M for sniper bots. *source*
- **Costs are the first enemy.** A round trip costs about 4.5% on a young coin (pump.fun or PumpSwap 1.25% each way, terminal about 1%, priority fees and slippage). Every strategy has to clear that before it earns anything. *source*
- **Most of the money moves in the first two hours.** Among coins that got traction, 54% of the first six hours' volume trades in the first 30 minutes and 91% within two hours. After that there is little liquidity to exit into. *data*

## 2. How a coin moves

Measured on 76 young pools that reached ≥ $50k of daily volume. This set leans toward coins that got traction, so it describes the coins you would actually trade, not every launch.

| Stage | What happens | Number |
|---|---|---|
| Launch on the curve | Price starts at about $4–5k market cap; early buyers get most of the supply cheaply | 58% of curve coins peak within 30 min; median time to peak **16.5 min** *data* |
| Graduation | ~85 SOL and ~207M tokens seed a PumpSwap pool and the LP is burned. Curve buyers take profit into new buyers | Graduated pools peak later: median **80 min** after the pool opens *data* |
| The run | Even coins that go on to run shake holders out first | Median deepest dip on the way to the peak: **−55%** below the running high *data* |
| The peak | The top comes once and fast | After the peak the median coin falls **−89%** (curve) and **−98%** (graduated) within the data window *data* |
| The day after | Very few hold up | Too few full 24 h windows to measure here (6 coins); the 148 calls: 98% ended below the channel's entry *data* |

What follows from it:
- **Be early or be out.** The tradable life of a coin is hours, not days, and the volume you exit into is gone after about two hours.
- **The peak is where you sell, not where you hold.** Holding through it costs almost everything. A time stop matters as much as a price stop.
- **Tight stops and runners don't mix.** Coins that later ran dipped about 55% first. A −6% stop gets you out of those coins on noise. Either give the trade room (stop −30% to −50%) or only use a tight stop with a momentum entry, where price is already moving your way.

## 3. What moves the market

| Driver | What to watch | Evidence |
|---|---|---|
| Launch and graduation flow | Launches per hour and the graduation rate (cockpit "Now"). A busy hour with few graduations means attention is spread thin | *data*, live |
| SOL price | Coins are priced in SOL and bought with SOL; a falling SOL drains the trenches | *thumb* |
| Narratives ("metas") | Channel calls cluster around themes: launchpads (IMAGINE, KUIP, CATPAD), stocks / "stonk", "PVE", rewards tokens. Copycat names of famous coins rate lower | *data* (channel), *thumb* |
| Attention | KOL calls, X posts, DexScreener boosts (paid: a trending rank you can buy) | *source* |
| Time of day | The 148 calls did best posted 00–08 UTC (+35%, n=28). The young-pool sample peaked highest for launches 08–16 UTC (median 4.4x, n=34). The two disagree; trade the hours your own journal shows | *data*, conflicting |

## 4. Calls and channels: what they really are

From the MadApes export (188 posts, 27 Oct–4 Nov), measured from the price when each call went out (corrected 4 Nov; an earlier version measured too late and read one pool's price wrong):
- **The posts:** 11 new calls against 149 brag updates, 7 daily recaps and casino referral ads. Most updates (133) brag about calls older than the export.
- **The calls had real money in them.** 5 of 10 measurable calls doubled from the posting price: STONKLANA 5.1x ($173k → $876k), jeff 3.3x, IMAGINE 2.6x, KUIP 2.2x, CATPAD 2.1x. Most brags match the chain; some are inflated (CATPAD claimed 4x, HYPE 2x against 1.1x).
- **The moves take hours, not minutes.** Peaks came 4–65 hours after the post.
- **The sell rule is the strategy.** Buy at the post, sell at 2x, stop −50%:

  | Hold up to | Result a call, after fees | Winners | 10% worse entry |
  |---|---|---|---|
  | 1 h | +4% | 3 of 10 | −4% |
  | 6 h | +14% | 5 of 10 | +10% |
  | 24 h | **+31%** | 6 of 10 | +21% |
  | 48 h | +32% | 6 of 10 | +26% |

  That's 10 calls in one good week. The 148-call Gambles audit of the same group found the same exit at about +4% a call over five months, so one week overstates it.
- **Then they fade.** 8 of 10 calls are below the posting price now, and brags come at a median −58% below the peak they brag about. Holding without a sell rule gives it all back.

Rules:
- **A call is a lead, not a signal.** It still goes through the safety filters.
- **Calls need their own exit.** Use a 2x target, a −50% stop and up to 24 h, not the 60-minute time stop the desk uses for fresh pairs, which sells before most call moves happen. *data*
- **Be at the post, not the brag.** Entering when the brag appears means buying about 58% below the peak, after the move. *data*
- **Measure any channel before trusting it.** `python3 channel.py <export.json>` checks every call from the posting price and simulates the follow rule.

## 5. Entry rules

1. **The safety filters are not optional.** *source* One failed check kills the coin, and a check that can't run counts as a fail:
   - mint and freeze authority revoked
   - LP burned or locked ≥ 95% (a pump.fun bonding curve counts)
   - no dangerous Token-2022 extensions
   - top 10 holders ≤ 20%, excluding pools
   - dev wallet and its funder not linked to a known rug
2. **Volume: 1-hour volume ≥ $50k on the coin's own pools.** Without volume there is no exit. *data* On its own it isn't an edge: every exit plan lost on volume-filtered entries. *data*
3. **Check the numbers are real.** If the busiest pool reports no liquidity or volume, the numbers come from a dust pool, so skip the coin or check by hand. *data*
4. **Be early.** Only coins in their first 6 hours; the volume and the peaks come early. *data*
5. **Pullback or momentum: not settled.**
   - The 148 calls favoured buying 7–30% below the 60-minute high (+24.6%) and punished buying within 7% of it (−16.4%).
   - Young pools showed the opposite: near the high, every exit plan was positive (best +8.1% a trade, capped); on the pullback, every one was negative or flat.
   - That sample leans toward coins that ran, which flatters buying the high.
   - The desk's shadow book settles it on unpicked leads: `desk.py strategy`, head to head. *data, conflicting*
6. **Don't chase.** At approval, if price ran more than 5% above the staged quote, the order is refused. *thumb*

## 6. Exit rules

1. **Match the exit to the entry.** *data*
   - **Pullback entry:** a wide exit. Sell at 2x, stop −50%, out after 60 min (strategy A). Positive on the 148 calls; about flat on young pools.
   - **Momentum entry:** a fast trailing exit. Stop −6% with a 6% trail after +12% (strategy B), or −15% with a 10% trail after +20% (B2). About +6–8% a trade, capped, on young pools near the high. The same exit lost on pullbacks (−3.5% a trade).
2. **Never let an exit cap the upside early.** Take-profit at +30% lost on 5 of 6 entry rules. *data*
3. **Time stop: 60 minutes.** Peaks come in the first hour or two, and holding past the peak costs −89% to −98%. *data*
4. **Liquidity pulled = out at once.** *source*
5. **Stops slip.** In fast dumps a −6% stop filled at about −13% after fees, and −50% stops filled at −55% to −57% in the earlier live test. The tighter the stop, the more slippage hurts. *data*
6. **Never move a stop down, never average down, never hold overnight.** *thumb*

## 7. Size and survival

- **Size by risk.** Position = account × risk% ÷ (stop + fees), so a full stop-out costs 1% of the account: about $18 a trade on $1,000 with a −50% stop. With a −6% stop the 8% cap binds, about $80. Confidence never changes size. *math*
- **Expect streaks.** At a 40% win rate, the median worst run in 100 trades is 7 losses in a row, with a 20% chance of 10. At 1% risk, ten losses cost about 10%; at 10% risk they'd cost about two-thirds of the account. *math*
- **Limits:** 5 positions open, 10 trades a day, −5% daily stop, 30 minutes off after a loss, no re-entry into a coin that stopped you out for 24 h, and a pause until 00:00 UTC after 3 losses in a row. *thumb*
- **Raise risk only after proof.** Two Sundays in a row of a positive head-to-head result first. *rule*

## 8. Process

- **The desk:** SEARCH → RISK → WHALE → HEAD (dossier) → JUDGE → SNIPER → **you sign** → EXIT. Every lead, kill, verdict, order and close is logged with its reason. *rule*
- **Paper first.** Two to four weeks, then `manual` mode with your own wallet, and record real fills with `FILL #id <price>`. *rule*
- **Check yourself on Sundays.** The calibration table shows whether the judge's 0.9 calls win more than its 0.7 calls, and the head-to-head shows which strategy actually made money. Don't argue with the table. *rule*
- **Gaps to fill next:**
  - a smart-money wallet list (WHALE is empty)
  - cheaper execution (fees are the biggest drag)
  - a channel feed into SEARCH for the best hours

## 9. Tools by job

| Job | Free source used here | Also look at |
|---|---|---|
| New launches, graduations, wallet trades | PumpPortal websocket | Axiom Pulse, GMGN trenches |
| New Raydium pools | Solana RPC `logsSubscribe` (CPMM, AMM v4) | Raydium API v3 |
| Price, liquidity, volume, buys/sells | DexScreener | Birdeye |
| 1-minute candles, trending | GeckoTerminal | — |
| Contract, LP lock, holders, insiders | RugCheck | GMGN security, Bubblemaps clusters |
| Dev funding trace | Solana RPC (keyed RPC like Helius for speed) | Solscan |
| Swap you sign yourself | Jupiter link (`jup.ag/swap/SOL-<mint>`) | Axiom, Fomo, Trojan |
| Channel check | `channel.py` on a Telegram export | — |
