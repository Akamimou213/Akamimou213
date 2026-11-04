# Trench (Vercel)

The Trench trading screen as a Vercel site: radar, live chart, safety checks, top holders, trade tape, a ticket with four exit plans, paper positions and a journal.

## Deploy

1. On vercel.com: **Add New → Project → Import** the `Akamimou213/Akamimou213` repository.
2. Set **Root Directory** to `trench-web` and **Framework Preset** to **Other**. Leave the build settings empty.
3. Click **Deploy**.

No environment variables or keys are needed. Every push to the repository redeploys the site.

## How it works on Vercel

- **`api/*.py`:** stateless Python functions, one per endpoint. Each one fetches live data and lets Vercel's CDN cache the answer for a few seconds, so many visits share one fetch and the free APIs don't rate-limit.

  | Endpoint | Source | Cached |
  |---|---|---|
  | `/api/radar` | DexScreener profiles, boosts and prices; GeckoTerminal new, trending and PumpSwap pools; SOL price | 20 s |
  | `/api/calls` | Telegram public channel pages (`config.json` → `app.channels`); brags resolve to the original call | 60 s |
  | `/api/check?mint=` | RugCheck + DexScreener: the desk's safety rules, top holders, and the 24 h range from 15-minute candles | 5 min |
  | `/api/coin?mint=&tf=` | DexScreener pair + GeckoTerminal candles and trades | 10 s |
  | `/api/prices?mints=` | DexScreener prices for the open positions | 3 s |
  | `/api/history?mint=&since=` | 1-minute candles to replay positions after the page was closed | 30 s |

- **The paper book lives in your browser** (localStorage): cash, positions and journal, per browser. Exits run every 5 s while the page is open. When you come back, each open position is replayed on the 1-minute candles it missed, so a stop or target hit while you were away still counts. The exit engine in `index.html` matches `memecoin-desk/exits.py` (tested on 300 random price paths).
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
