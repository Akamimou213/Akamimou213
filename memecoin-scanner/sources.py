"""Thin, dependency-free clients for the free data sources named in Trench Playbook section 11.

Every call goes through `get_json`, which throttles per host, retries on 429/5xx, and keeps a
short in-memory cache so the dashboard can refresh without hammering the APIs.
"""
import json
import threading
import time
import urllib.error
import urllib.parse
import urllib.request

UA = {"User-Agent": "trench-scanner/1.0", "accept": "application/json"}

# Minimum seconds between requests to the same host (public free-tier limits).
MIN_INTERVAL = {
    "api.geckoterminal.com": 2.2,   # ~30 req/min public
    "api.rugcheck.xyz": 0.6,
    "api.dexscreener.com": 0.25,    # 300 req/min on token endpoints
    "api.gopluslabs.io": 1.0,
    "api.honeypot.is": 0.5,
}
CACHE_TTL = 45  # seconds

_lock = threading.Lock()          # guards the per-host lock table only
_host_locks = {}                  # one lock per host: waiting out one API's limit never blocks the others
_last = {}
_cache = {}


def _host_lock(host):
    with _lock:
        return _host_locks.setdefault(host, threading.Lock())


class SourceError(Exception):
    pass


def get_json(url, ttl=CACHE_TTL, retries=3):
    now = time.time()
    hit = _cache.get(url)
    if hit and now - hit[0] < ttl:
        return hit[1]
    host = urllib.parse.urlparse(url).netloc
    err = None
    for attempt in range(retries):
        with _host_lock(host):
            wait = MIN_INTERVAL.get(host, 0.3) - (time.time() - _last.get(host, 0))
            if wait > 0:
                time.sleep(wait)
            _last[host] = time.time()
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=20) as r:
                data = json.load(r)
            _cache[url] = (time.time(), data)
            return data
        except urllib.error.HTTPError as e:
            err = f"{host} HTTP {e.code}"
            if e.code == 404:
                raise SourceError(err)
            if e.code == 429:
                if host == "api.geckoterminal.com" and attempt == 0:
                    time.sleep(4)
                    continue
                raise SourceError(err + " (rate limited)")
            time.sleep(1.5 * (attempt + 1))
        except Exception as e:  # network, JSON
            err = f"{host} {type(e).__name__}: {e}"
            time.sleep(1.5 * (attempt + 1))
    raise SourceError(err or f"{host} failed")


# ---------------------------------------------------------------- DexScreener
DS = "https://api.dexscreener.com"


def ds_token_pairs(address):
    """All pairs for a token across chains (used when the chain is unknown)."""
    d = get_json(f"{DS}/latest/dex/tokens/{address}")
    return d.get("pairs") or []


def ds_pair(chain, pair_address):
    """Resolve a pool (pair) address, e.g. from a DexScreener URL, to its pair record."""
    d = get_json(f"{DS}/latest/dex/pairs/{chain}/{pair_address}")
    ps = d.get("pairs") or ([d["pair"]] if d.get("pair") else [])
    return ps[0] if ps else None


def ds_tokens(chain, addresses):
    """Pairs for up to 30 token addresses on one chain."""
    out = []
    for i in range(0, len(addresses), 30):
        out += get_json(f"{DS}/tokens/v1/{chain}/{','.join(addresses[i:i + 30])}") or []
    return out


def ds_boosts_top():
    return get_json(f"{DS}/token-boosts/top/v1") or []


def ds_boosts_latest():
    return get_json(f"{DS}/token-boosts/latest/v1") or []


def ds_profiles_latest():
    return get_json(f"{DS}/token-profiles/latest/v1") or []


# ---------------------------------------------------------------- GeckoTerminal
GT = "https://api.geckoterminal.com/api/v2"
GT_NETWORK = {"solana": "solana", "ethereum": "eth", "bsc": "bsc", "base": "base",
              "arbitrum": "arbitrum", "polygon": "polygon_pos", "avalanche": "avax"}


def gt_minute_candles(chain, pool, limit=60, token="base"):
    """Last `limit` 1-minute candles [ts, o, h, l, c, vol_usd], oldest first.

    Pass the coin's own address as `token`: GeckoTerminal's "base" side of a pool is not always the
    coin DexScreener calls the base (some Raydium pools list SOL first), and then the candles are SOL's.
    """
    net = GT_NETWORK.get(chain)
    if not net:
        raise SourceError(f"GeckoTerminal does not cover {chain}")
    d = get_json(f"{GT}/networks/{net}/pools/{pool}/ohlcv/minute?aggregate=1&limit={limit}&currency=usd&token={token}",
                 ttl=30)
    rows = d.get("data", {}).get("attributes", {}).get("ohlcv_list") or []
    return sorted(rows)


def gt_trending(chain="solana", duration="1h"):
    net = GT_NETWORK.get(chain, chain)
    d = get_json(f"{GT}/networks/{net}/trending_pools?duration={duration}", ttl=60)
    return d.get("data") or []


# ---------------------------------------------------------------- Safety
def rugcheck_report(mint):
    return get_json(f"https://api.rugcheck.xyz/v1/tokens/{mint}/report", ttl=120)


GOPLUS_CHAIN = {"ethereum": "1", "bsc": "56", "base": "8453", "arbitrum": "42161",
                "polygon": "137", "avalanche": "43114"}


def goplus_token(chain, address):
    cid = GOPLUS_CHAIN.get(chain)
    if not cid:
        raise SourceError(f"GoPlus does not cover {chain}")
    d = get_json(f"https://api.gopluslabs.io/api/v1/token_security/{cid}?contract_addresses={address}", ttl=120)
    res = d.get("result") or {}
    return res.get(address.lower()) or next(iter(res.values()), None)


HONEYPOT_CHAIN = {"ethereum": 1, "bsc": 56, "base": 8453}


def honeypot_is(chain, address):
    cid = HONEYPOT_CHAIN.get(chain)
    if not cid:
        raise SourceError(f"honeypot.is does not cover {chain}")
    return get_json(f"https://api.honeypot.is/v2/IsHoneypot?address={address}&chainID={cid}", ttl=120)
