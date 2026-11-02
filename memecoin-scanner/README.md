# Trench Scanner

The cockpit described in section 11 of the [Trench Playbook](../memecoin-audit/playbook.html). It turns the playbook's six-rule card and 90-second dossier into automatic checks, so every coin gets the same verdict the rules would give it.

**Read-only.** It never holds a key, signs a transaction or places an order. Python 3.9+ standard library only. Nothing to install.

## Run it

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
| Flow | Buys/sells, average trade (volume-bot hint), age, paid boosts | info | — | DexScreener |

**Verdicts:** `A-SETUP` (volume ≥ $117k, pulled back, in window, all clear) · `GO` · `GO · HALF SIZE` (outside window) · `INCOMPLETE` (a gate or safety input is missing, so check it by hand) · `SKIP`.

**Size:** bankroll × risk% ÷ 50% stop, halved outside the window, capped at 2% of pool liquidity.
**Exits:** TP 2x, SL −50%, 60-minute time stop, re-anchored to your fill.

## Trending screener

This combines DexScreener top and new boosts, new token profiles, and GeckoTerminal trending pools. It drops pools under $5k liquidity and keeps the deepest 1-hour volume. It then runs the dossier on each coin.

To stay fast, it skips candles by default. In that mode the 30-minute volume is estimated (GeckoTerminal m30, or half the 1h volume) and the pullback check stays open. Click a row, or `scan` it, for the exact gate before acting.

## Limits

- Free public APIs. GeckoTerminal allows about 30 requests a minute. When it rate-limits, the gate shows `?` and the verdict becomes `INCOMPLETE`, never a false `GO`.
- The bundle signature is a heuristic. Confirm it with GMGN bundler tags or Bubblemaps (the dashboard links both).
- No dev-history, smart-money or narrative checks yet. Those need GMGN, Bubblemaps or Birdeye keys, or your own judgement.
- The rules come from one channel's in-sample backtest (148 calls, May–Oct 2026). They are hypotheses to test with small size. This is not financial advice.
