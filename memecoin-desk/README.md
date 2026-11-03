# Trench Desk

A Solana memecoin desk with seven seats and hard handoffs. The seats find, check, confirm and judge. **You sign.** Nothing is bought until you type `APPROVE #047`, and the desk never holds a private key.

```text
SEARCH  -> leads, each with an on-chain reason             (Scout)
RISK    -> contract and rug check. one hard fail = dead      (Filter)
WHALE   -> smart money confirm
JUDGE   -> four closed questions, the gate: buy/watch/pass   (Analyst, score 0-1)
SNIPER  -> stages the order, waits for APPROVE #id           (Executor)
EXIT    -> -6% hard stop, trail after +12%, time stop        (Risk)
HEAD    -> runs the thread, dossiers, reports, calibration   (Logger)
```

JUDGE never sees a token RISK killed, and SNIPER never sees a token JUDGE didn't pass. Each seat reads only its own inbox. SNIPER also re-reads the lead from the store and refuses anything without a stored RISK `pass` and JUDGE `buy`, so a bug upstream can't leak a dead token into an order.

Python 3.9+ standard library only. It reuses the HTTP clients and contract parsing from [`../memecoin-scanner`](../memecoin-scanner). The optional `claude` judge backend needs `pip install anthropic`.

## Run

```bash
cd memecoin-desk
python3 desk.py run                    # live terminal, paper money ($1,000 by default)
```

```bash
python3 desk.py run --headless         # same desk, thread on stdout (tmux / VPS)
```

Sign from a second terminal, from the terminal's own command line, or from Telegram:

```bash
python3 desk.py approve 47
```

Other commands: `reject 47`, `fill 47 0.000123` (correct the entry after a manual fill), `pause`, `resume`, `status`, `thread -n 80`, `report`, `calibrate`, `lead 47` (full dossier, answers and gate for one lead). In the terminal, type `APPROVE #047`, `REJECT #047`, `PAUSE`, `RESUME`, `REPORT` or `QUIT`.

Phone (optional): create a bot with @BotFather, then:

```bash
TELEGRAM_BOT_TOKEN=123:abc TELEGRAM_CHAT_ID=your_id python3 desk.py run
```

Staged orders, fills, closes and the 21:00 report go to your phone, and replying `APPROVE #047` signs. Commands from any other chat are ignored and logged.

Smart money: put wallets you trust in `data/whales.txt` (`address,label`; see `examples/whales.txt`). Known ruggers go in `data/rug_wallets.txt`. Tests: `python3 -m unittest test_desk -v`.

## The terminal

![Trench Desk terminal: balance, equity curve, seats, a staged order waiting for APPROVE, and the thread](docs-terminal.png)

The screenshot is an offline replay of the signing path, with fake quotes: BUY → STAGED → `APPROVE` → FILLED → trailing stop armed at +13% → closed at +8.8% after fees.

## What each seat does

**SEARCH (Scout).** Three real-time feeds over a standard-library websocket client:
- PumpPortal: every pump.fun and LaunchLab launch and graduation, plus the trades of your tracked wallets.
- Solana `logsSubscribe` on the Raydium CPMM and AMM v4 programs: every new pool.
- A GeckoTerminal/DexScreener poll as backup.

New tokens wait in a nursery. Each minute SEARCH re-reads them 30 at a time and promotes one to a lead once its 1-hour volume reaches $50k and its liquidity $10k. Each lead carries its on-chain reason, for example "graduated to pump-amm; 1h vol $83k over 1,204 buys / 911 sells on pumpswap; liq $41k; age 34 min".

**RISK (Filter).** One hard fail = dead. **A check that can't be run is a fail.**

| Check | Rule |
|---|---|
| Mint authority | revoked |
| Freeze authority | revoked |
| LP burned / locked | ≥ 95% (a pump.fun bonding curve counts: nobody can withdraw it) |
| Top 10 holders | ≤ 20%, excluding pools and lockers |
| 1-hour volume | ≥ $50k on the token's own pools, and the busiest pool must actually report it |
| Dev wallet | not in the rug registry, and its first funder not either |
| RugCheck | no danger flags, not flagged rugged |
| Token-2022 | no PermanentDelegate, TransferHook, TransferFee, NonTransferable, Pausable or frozen-by-default |

The rug registry fills itself. HEAD re-prices every lead 24 h later and records the creator and the creator's funder of any token that fell 90% or more or was delisted. The free APIs here don't list a dev's past tokens, so the registry starts empty and gets stronger every day the desk runs. Seed it with `data/rug_wallets.txt`.

**WHALE.** It reports which tracked wallets bought the token (from the PumpPortal trade stream) or hold it (from the top-holder list), and when. It confirms or stays quiet. It never kills or sizes, unless you set `whale.require_confirm`.

**HEAD → dossier.** HEAD builds one dossier per lead, with facts only:
- age, market cap, liquidity
- holders now vs 1 h ago, and price over the same hour
- buys vs sells in the last two 5-minute windows
- top 10 and dev share
- what RISK checked, and what WHALE saw
- your order size as a share of the pool

**A missing field is written `"missing"`, never guessed.** Holder history comes from the desk's own snapshots, so a lead the desk first saw 10 minutes ago honestly has no "1 h ago". Social mentions are always `"missing"`: no free source exists.

**JUDGE (Analyst).** It asks the same four questions every time, with the wording fixed in `judge.py`:
- **organic:** yes / no
- **late:** yes / no
- **exit_risk:** 1–5
- **action:** buy / watch / pass

Code applies the gate in `config.json`. Buy only if all of these hold:
- action = buy with p ≥ 0.70
- organic = yes with p ≥ 0.65
- late = no
- exit_risk ≤ 3
- analyst score (= p(buy)) ≥ 0.60

A lead the desk has only just seen has no holder history yet. The rules judge answers that with "watch", not "pass": not yet, not no. A watch is asked once more after 30 minutes, starting again from RISK so every fact is fresh. A second watch is a pass. No answer is a pass. Every verdict is logged with every probability and the answer that killed it.

**SNIPER (Executor).**
- **Size:** 8% of current equity, never more. Also capped at 2% of pool liquidity and by available cash. Confidence never changes size: a 0.92 buy gets the same size as a 0.71 buy.
- **Approval window:** an order waits 3 minutes for `APPROVE #id`. The approval is refused if price ran more than 5% above the staged quote, because that would be chasing.

**EXIT (Risk).**
- **Stops:** hard stop −6% from the fill. The trailing stop arms only after +12%, then follows 6% under the peak.
- **Other exits:** 60-minute time stop. If the pool loses half its liquidity, EXIT sells at once.
- **Fills:** stops fill at the price actually seen, never at the stop level.

**Limits, enforced in code:**
- **No averaging down:** never a second order on a token you hold.
- **No revenge trades:** after a losing close, no new order for 30 minutes. Never re-enter a token that stopped you out in the last 24 h.
- **Losing streak:** 3 losses in a row pause the desk until 00:00 UTC.
- **Daily stop:** −5% of the day's opening equity.
- **Caps:** at most 5 positions open and 10 trades a day.

**HEAD (Logger).** Every lead, kill, verdict, order, fill and close goes to the thread with its reason (`data/desk.db`, `desk.py thread`).
- **Evening report:** at 21:00 in `head.report_tz` (UTC by default; set yours), written to `data/reports/` and sent to Telegram.
- **Sunday calibration:** every Sunday the report adds the calibration table. Buy answers are grouped by p(buy) (0.70–0.79, 0.80–0.89, 0.90+), with trades and green closes for each group, plus how many passes were up 24 h later. If 0.90+ doesn't win more often than 0.70–0.79, it says so plainly.

## The judge: why not Jev, and what replaces it

The trader's design calls TypeSafe's Jev model. This desk doesn't use the Jev API. It keeps the TypeSafe pattern instead: **the model answers judgments, code decides.** Questions are fixed, typed and closed. Probabilities feed a written gate. "No answer" is a pass. Confidence never sizes. The TypeSafe skill is installed in Claude Code for working on this project. The `judge.backend` setting picks who answers:

- `rules` (default). Deterministic and offline, answering in under 1 ms. Each answer comes from stated checks on the dossier:
  - holders up faster than price
  - buys above sells in both 5-minute windows
  - tiny average trades (bot churn)
  - linked wallets or a bundle signature
  - distance from the 60-minute high
  - hourly and 6-hour gains
  - order share of the pool

  The reasons are logged (`desk.py lead 47` → `verdict.answers.why`). These probabilities are **not calibrated** until the Sunday table says they are.
- `claude`. The same four questions are sent to the Claude API with a JSON schema. This uses `claude-opus-5-5` at low effort, which is slower than a second. Change `judge.claude_model` if you want a faster model. It needs `pip install anthropic` and `ANTHROPIC_API_KEY`. A refusal, timeout or error is "no answer", which is a pass.

## Read this before trusting it with money

The fees change the math of your rules:

- **The stop costs more than 6%.** At the playbook's 4.5% round-trip cost (2.25% each side) plus price impact, a −6% stop costs about **−10% to −11%** of the position. Fast dumps fill below the stop: in the earlier 3-hour live test, −50% stops filled at −55% and −57%.
- **The smallest trailed win is tiny.** The trail arms at +12% and then trails 6% under the peak, so the smallest trailed exit is about +5% gross, or roughly **+0.5% net**.
- **So it needs runners.** The system only makes money if enough winners run well past +12%. The 60-minute time stop cuts the slow ones.
- **Per-trade risk is small.** A full stop-out at 8% size costs about 0.8% of equity, inside the playbook's 0.5–1% risk band.

The pattern from the previous analysis (148 Gambles calls, `../memecoin-audit`) is in-sample. It found that coins with heavy volume that had pulled back 7–30% from their 60-minute high did best (+24.6% a trade, n = 41). Buying within 7% of the high lost −16.4%. The 00–08 UTC window did best. The rules judge uses all three. On the scanner's unbiased 3-hour live sample, buying any random active coin lost −21% a trade after fees.

Run it in paper mode for 2–4 weeks and read the Sunday tables before signing anything real. Then set `"mode": "manual"`: APPROVE then prints the Jupiter link and the amount, you sign the swap in your own wallet, and `FILL #id <price>` records your real entry. This is not financial advice.

## Files

| File | What |
|---|---|
| `config.json` | every threshold. The desk reads it and never writes it; the thread logs its hash at each start |
| `desk.py` | entry point, wiring, commands |
| `search.py` · `risk.py` · `seats.py` · `judge.py` · `sniper.py` · `report.py` | the seats |
| `tui.py` | the live terminal |
| `wsclient.py` | standard-library websocket client (proxy-aware) |
| `store.py` | SQLite: leads, thread, orders, positions, equity, snapshots, rug registry, whale trades |
| `telegram.py` | optional phone push and APPROVE from the phone |
