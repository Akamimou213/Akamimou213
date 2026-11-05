# Trench (Vercel)

The Trench trading screen as a Vercel site: radar, live chart, safety checks, top holders, trade tape, a ticket with four exit plans, paper positions and a journal.

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

Server endpoints (`api/*.py`, cached on Vercel's CDN):

| Endpoint | Used for | Cached |
|---|---|---|
| `/api/check?mint=` | safety rules, top holders, 24 h range | 5 min |
| `/api/calls` | Telegram calls (`config.json` → `app.channels`) | 60 s |
| `/api/coin?mint=&tf=` | chart and trades when GeckoTerminal refuses the browser | 10 s |
| `/api/history?mint=&since=` | 1-minute candles to replay positions after the page was closed | 30 s |
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
- **One difference:** with no database there's no rug-wallet registry, so the dev check uses RugCheck's "creator history of rugged tokens" flag. The trace of the dev's funding wallet runs only in the desk version (`memecoin-desk/trench_app.py`).

## Local

```bash
python3 dev.py        # http://127.0.0.1:3000, same files and endpoints as Vercel
```

`api/_lib/` holds copies of the shared modules. After changing them in `memecoin-scanner/` or `memecoin-desk/`, run `./sync_lib.sh` and commit.
