# Trench Scanner

The cockpit described in section 11 of the [Trench Playbook](../memecoin-audit/playbook.html). It turns the playbook's six-rule card and 90-second dossier into automatic checks, so every coin gets the same verdict the rules would give it.

**Read-only.** It never holds a key, signs a transaction or places an order. Python 3.9+ standard library only. Nothing to install.

## Run it

Three tools on the same rules, from quickest to most useful:

| Tool | Command | Use it to |
|---|---|---|
| Scanner | `python3 scanner.py scan <CA>` | check one coin before you enter |
| Collector | `python3 collector.py` | watch the market 24/7, alert on setups, paper-trade them, record everything |
| Validator | `python3 validate.py` | prove or kill each rule on the collector's data |

The dashboard (`python3 server.py`) shows all of it: Scan, Trending, **Live alerts** (alerts + paper journal) and **Proof** (validation).

```bash
cd memecoin-scanner
python3 server.py                 # dashboard on http://127.0.0.1:8787
```

```bash
python3 scanner.py scan <CONTRACT_ADDRESS> --bankroll 2000 --risk 1
python3 scanner.py trending --chain solana --limit 15        # add --candles for the exact gate
python3 scanner.py scan <CA> --json                         # machine-readable
python3 -m unittest test_rules -v                           # offline rule tests
```

## What it checks (in the playbook's order; the first fail = SKIP)

| Stage | Check | Threshold | Evidence | Source |
|---|---|---|---|---|
| Gate | 30-min volume | ≥ $50k, ≥ $117k = A-setup | data | GeckoTerminal 1-min candles |
| Gate | Below 60-min high | 7–30% below (at the high −16.4%, deep dumps kept falling) | data | GeckoTerminal |
| Gate | Window | 00–08 UTC, else half size | data | clock |
| Contract (SOL) | Mint / freeze authority, Token-2022 extensions, RugCheck danger flags | revoked / none | source | RugCheck |
| Contract (EVM) | Sell simulation, tax ≤ 5%, owner powers, proxy, verified source | — | source | GoPlus, honeypot.is |
| Liquidity | LP burned / locked | ≥ 95% | source | RugCheck markets, GoPlus LP holders |
| Liquidity | Liquidity / mcap; your size vs pool | ≥ 10%; ≤ 2% of pool | thumb | DexScreener |
| Holders | Top 10 excl. pools, dev %, insider network | ≤ 30%, ≤ 5% | thumb | RugCheck / GoPlus |
| Holders | Bundle signature: 5+ top wallets at near-identical size | ≤ 10–15% | thumb (heuristic) | top-holder sizes |
| Dev history | Earlier coins by the same creator (pump.fun) and how many are dead | < 3 other coins (1–2 = warn) | thumb | Solana RPC: pump.fun bonding curves naming the creator, priced on DexScreener |
| Dev history | Creator or first funder on a rug list; funder shared with other creators | not listed; funds no other creator | thumb | Solana RPC funder trace, local registry, `data/rug_wallets.txt` |
| Dev history | Creator wallet age | ≥ 24 h, else warn | thumb | Solana RPC |
| Flow | Buys/sells, average trade (volume-bot hint), age, paid boosts | info | — | DexScreener |

**Verdicts:** `A-SETUP` (volume ≥ $117k, pulled back, in window, all clear) · `GO` · `GO · HALF SIZE` (outside window) · `INCOMPLETE` (a gate or safety input is missing, so check it by hand) · `SKIP`.

**Size:** bankroll × risk% ÷ 50% stop, halved outside the window, capped at 2% of pool liquidity.
**Exits:** TP 2x, SL −50%, 60-minute time stop, re-anchored to your fill.

## Trending screener

This combines DexScreener top and new boosts, new token profiles, and GeckoTerminal trending pools. It drops pools under $5k liquidity and keeps the deepest 1-hour volume. It then runs the dossier on each coin.

To stay fast, it skips candles by default. In that mode the 30-minute volume is estimated (GeckoTerminal m30, or half the 1h volume) and the pullback check stays open. Click a row, or `scan` it, for the exact gate before acting.

## Collector: live alerts + paper journal

```bash
python3 collector.py --bankroll 1000 --risk 1          # leave it running (laptop, mini PC or a $5 VPS)
python3 server.py                                      # dashboard → Live alerts / Proof tabs
```

Telegram alerts are optional: create a bot with @BotFather, send it a message, then:

```bash
TELEGRAM_BOT_TOKEN=123:abc TELEGRAM_CHAT_ID=your_id python3 collector.py
```

What the collector does each minute:

1. **Discovery** (every 3 min): DexScreener new profiles and boosts, plus GeckoTerminal new and trending pools. It watches coins with ≥ $10k liquidity and ≥ $10k 1h volume, and drops them after 90 quiet minutes or once liquidity falls under $5k.
2. **Snapshot** of every watched coin, batched 30 per DexScreener call. New coins are back-filled with up to 60 min of GeckoTerminal 1-min candles, so they can be judged at once.
3. **Gate** from its own series: 30-min volume = six non-overlapping 5-min windows. The 60-min high needs 45 min of history, and estimates never trigger an alert.
4. **Dossier** (RugCheck / GoPlus / honeypot.is) only for coins that pass the gate. GO and A-SETUP alerts go to the dashboard and Telegram.
5. **Paper trade** on every alert:
   - Entry is the price 1 minute after the signal, because you are never instant.
   - Take profit fills at 2x. The stop fills at the price actually seen, so crashes cost more than −50%.
   - A pulled pool counts as −100%. Every trade closes after 60 minutes. Fees are 4.5%.
6. **Playbook limits**: 5 open positions, 10 trades per UTC day, and a −5% daily stop. Alerts beyond these are still shown, marked as skipped.

Everything is stored in `data/trench.db` (git-ignored).

## Validator: proving the rules

Tigran's 148 calls were picked by hand and tested on the same data the rules came from. The collector records **every** coin it watches, minute by minute, alert or not. `validate.py` replays rule variants on that unbiased sample with the exact paper-trade mechanics, including:

- the playbook gate
- the A-setup
- the 00–08 UTC window
- volume-only and pullback-only gates
- the two "avoid" rules (near the high, deep dump)
- volume and pullback thresholds

Each one is compared against a **baseline** of random entries on any active coin.

A rule **holds** only when all three of these are true:
- at least 50 trades
- its bootstrap 90% range is above zero
- it is positive in **both halves** of the period

Expect "too few events" for the first days. Results start to mean something after about 2–4 weeks of 24/7 collection.

## Limits

- Free public APIs. GeckoTerminal allows about 30 requests a minute. When it rate-limits, the gate shows `?` and the verdict becomes `INCOMPLETE`, never a false `GO`.
- The bundle signature is a heuristic. Confirm it with GMGN bundler tags or Bubblemaps (the dashboard links both).
- Input can be a token address, a DexScreener link, or a 32-byte pool id (Uniswap v4 pools have an id, not an address).
- **Chain coverage:** on a chain no safety source covers (e.g. Elysium at launch), the contract check *fails*. A check that can't run counts as failed. Robinhood Chain is covered by GoPlus (chain 4663); honeypot.is covers only Ethereum, BSC and Base.
- **Pool type & fees:** shows the main pool's fee: GoPlus's tier for EVM, or the venue's published fee for Solana. It fails above 5% and warns on Uniswap v4, whose hooks can add fees nothing here can see. Fee and LP data from *other* pools (often trap pools at 70–99% fees) never stand in for the main pool's.
- Liquidity / mcap now sums every pool of the token. Side pools are flagged, because their owners can withdraw them.
- **Dev history** (Solana). RugCheck's free API leaves the creator's past tokens empty, so the scanner asks the pump.fun program directly: one `getProgramAccounts` call finds every bonding curve naming the same creator. The creator is an *argument* of pump.fun's `create`, not a signer, so the creator's own transactions don't show its launches. Earlier coins are priced on DexScreener; under $1k liquidity counts as dead.
  - Every scan records creator and first funder in `data/trench.db`, so a creator or funder behind coins you've already scanned is caught (playbook trap 5). Seed known ruggers in `data/rug_wallets.txt` (`address,label`); the desk's list is read too.
  - Other launchpads (LaunchLab, Meteora, Raydium) aren't indexed: their "Earlier launches" check stays unknown, so the verdict is `INCOMPLETE`. EVM coins get GoPlus's past-honeypot flag and the local registry only.
  - The public RPC is rate-limited and blocks `getProgramAccounts` on some endpoints. Set `SOLANA_RPC_URL` (a free Helius key is enough) for reliable results. When the history can't be read, the check is unknown, never a pass.
  - The trending screener skips the RPC part (a few calls a coin), so its rows are `INCOMPLETE` until you scan them.
- No smart-money or narrative checks yet. Those need GMGN, Bubblemaps or Birdeye keys, or your own judgement.
- The rules come from one channel's in-sample backtest (148 calls, May–Oct 2026). They are hypotheses to test with small size. This is not financial advice.
