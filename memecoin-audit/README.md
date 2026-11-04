# Gambles channel audit

Analysis of the MadApes "Gambles" Telegram channel export (1 Jan – 25 Oct 2026) against on-chain prices.

Pipeline (run with `python3 -I`, scripts read/write next to themselves):

1. `parse.py <result.json> calls.csv`: parses calls and follow-up updates, links each update to its call through the reply chain.
2. `fetch_now.py`: current DexScreener state for every called contract address.
3. `fetch_ohlcv.py [N]`: GeckoTerminal 1-minute and hourly candles for a random sample of Solana fresh calls (public API covers the last 180 days only).
4. `sim.py`, `sim2.py`: claimed-vs-on-chain multiples and strategy backtests (3% round-trip cost, stop-first on ambiguous candles, bootstrap 90% intervals).
5. `gen.py`: builds `report.html` from `report_tpl.html` and the summary JSON files.

The raw Telegram export and fetched price data are not committed.
