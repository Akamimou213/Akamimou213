# Trench (Vercel)

Two pages on one Vercel site:

- **`/` Trench Terminal (read-only).** Scroll the live feed of new coins, pick one, and the verification desk checks it on its own: three seats run in parallel (chart & flow, safety, dev history), then the scanner's verdict. **Ask Claude** opens the Trench Review page on claude.ai, where three Claude reviewers and a judge write the read. Nothing is bought here; Axiom and Jupiter links are there if you trade elsewhere.
- **`/trade`** the paper trading screen: radar, live chart, safety checks, top holders, trade tape, a ticket with four exit plans, paper positions and a journal.

## The verification desk

| Seat | What it checks | Source |
|---|---|---|
| Chart & flow | 30-min volume, distance below the 60-min high, trading window, buys/sells, average trade, age | DexScreener + GeckoTerminal 1-min candles |
| Safety | mint / freeze authority, Token-2022 extensions, RugCheck flags, LP lock, liquidity / mcap, pool fee, top 10, dev share, bundles, insiders | RugCheck |
| Dev history | the creator's other pump.fun coins and how many died, first funder, wallet age, rug list | Solana RPC + DexScreener |

Each seat is one `/api/verify?mint=&seat=chart|safety|dev` call running `memecoin-scanner/rules.py`, so the verdict here is the scanner's: the first fail is `SKIP`, a check that couldn't run is `INCOMPLETE`, never a pass. The chart draws the 60-min high and the −7% / −30% entry zone. Seats take about 1 s (safety), 1–8 s (chart) and 2–20 s (dev: public Solana RPC).

## Claude, without an API key

**Ask Claude** opens [Trench Review](https://claude.ai/artifact/1H697Ngff1iiVzQkRbaDEA), a page on claude.ai (you can also paste a contract address there: it fetches `/api/verify` from this site through your Apify connector, since claude.ai blocks the page's own requests) that asks Claude on your own Claude account (the page's `sample` capability), so this site needs no Anthropic key. The terminal packs the seats' results and the last hour of candles into the link (`#z` + hex of deflate-compressed JSON, about 3 KB). **Copy for Claude** copies the same packet if a link is too long for your browser; paste it on the Review page.

On the Review page three reviewers run in parallel: a Safety auditor, a Dev detective and a Chart reader. A judge then writes the final read. The judge may lower the scanner's verdict to WATCH or SKIP but never raise it, and the page enforces that in code. The first time, claude.ai asks you to allow Claude on the page. The page's source is `claude/trench-review.html`; republish it from Claude Code after changing it.

## Deploy

1. On vercel.com: **Add New → Project → Import** the `Akamimou213/Akamimou213` repository.
2. Set **Root Directory** to `trench-web` and **Framework Preset** to **Other**. Leave the build settings empty.
3. Click **Deploy**.

No environment variables or keys are needed. Every push to the repository redeploys the site.

## How it works

Speed comes from the browser talking to the data sources directly; the server is only used where a browser can't go.

| What | Where it comes from | How fast |
|---|---|---|
| New pump.fun launches and graduations | PumpPortal websocket, opened by the browser | under a second |
| Price, market cap, 5-min volume and buys/sells | DexScreener, called by the browser every 3 s | a launch is listed about 45–60 s after creation |
| Fresh pools (under 6 h, liquidity ≥ $5k, 1 h volume ≥ $10k) | GeckoTerminal new pools + DexScreener profiles and boosts, every 30 s | |
| Chart and trade tape | GeckoTerminal from the browser; if it refuses (about 30 calls a minute per address), `/api/coin` on the server | |
| Safety and top holders | `/api/check` on the server: RugCheck + the desk's kill rules | about 1 s |
| Telegram calls | `/api/calls` on the server (Telegram has no browser API) | cached 60 s |

Pool size for a coin still on the pump.fun curve comes from the curve itself (virtual reserves start at 30 SOL × 1.073B tokens, so market cap in SOL = vSol² / 32.19), because DexScreener reports no liquidity there.

PumpPortal's per-coin trade stream now needs an API key from a funded wallet, so it isn't used: no key or wallet is ever stored here. The code for it is still in `index.html`, switched off.

Keys: <kbd>↑</kbd>/<kbd>↓</kbd> move, <kbd>B</kbd> paper buy, <kbd>S</kbd> sell the selected position, <kbd>C</kbd> copy the address, <kbd>/</kbd> search.

## The paper screen (`/trade`)

Server endpoints (`api/*.py`, cached on Vercel's CDN):

| Endpoint | Used for | Cached |
|---|---|---|
| `/api/check?mint=` | safety rules, top holders, 24 h range | 5 min |
| `/api/calls` | Telegram calls (`config.json` → `app.channels`) | 60 s |
| `/api/coin?mint=&tf=` | chart and trades when GeckoTerminal refuses the browser | 10 s |
| `/api/history?mint=&since=` | 1-minute candles to replay positions after the page was closed | 30 s |
| `/api/verify?mint=&seat=` | the terminal's verification seats (scanner rules) | 60 s |
| `/api/radar`, `/api/prices` | the previous version's feeds (kept, not used by the page) | 20 s / 3 s |

- **The paper book lives in your browser** (localStorage): cash, positions and journal, per browser. Exits run on every price update (every 3 s) while the page is open. When you come back, each open position is replayed on the 1-minute candles it missed, so a stop or target hit while you were away still counts. The exit engine in `index.html` matches `memecoin-desk/exits.py` (tested on 300 random price paths).
- **Same rules as the desk:**
  - safety must pass before a buy
  - size is set so a stop-out costs 1% of the account, capped at 8% of it and at 2% of the pool
  - no averaging down
  - 5 open positions at most
  - 30 min cooldown after a loss
  - no re-entry for 24 h on a coin that lost
  - −5% daily stop
- **One difference:** with no database there's no lasting rug-wallet registry (the terminal's dev seat keeps one in `/tmp`, per function instance; seed known ruggers in `api/_lib/data/rug_wallets.txt`), and the `/trade` dev check uses RugCheck's "creator history of rugged tokens" flag. The trace of the dev's funding wallet runs only in the desk version (`memecoin-desk/trench_app.py`).

## Local

```bash
python3 dev.py        # http://127.0.0.1:3000 (terminal) and /trade, same files and endpoints as Vercel
```

`api/_lib/` holds copies of the shared modules. After changing them in `memecoin-scanner/` or `memecoin-desk/`, run `./sync_lib.sh` and commit.
