"""Offline tests for the playbook rules.  Run: python3 -m unittest test_rules -v"""
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import rules  # noqa: E402

NOW = 1793605200  # 2026-11-02 06:20 UTC (inside the 00-08 window)
CA = "Test1111111111111111111111111111111111pump"
POOL = "Pool111111111111111111111111111111111111111"


def pair(**kw):
    p = dict(chainId="solana", dexId="pumpswap", pairAddress=POOL, url="https://dexscreener.com/solana/x",
             baseToken=dict(address=CA, name="Test", symbol="TST"), priceUsd="0.0009",
             liquidity=dict(usd=60_000), marketCap=300_000, volume=dict(h1=250_000, h24=1_000_000),
             txns=dict(h1=dict(buys=900, sells=700)), priceChange=dict(m5=-2, h1=30), pairCreatedAt=(NOW - 7200) * 1000)
    p.update(kw)
    return p


def candles(high=0.001, last=0.0009, vol_per_min=5_000):
    """60 one-minute candles; high reached mid-way, closes at `last`."""
    out = []
    for i in range(60):
        t = NOW - 3600 + i * 60
        h = high if i == 30 else last * 1.01
        out.append([t, last, h, last * 0.99, last, vol_per_min])
    return out


def rugcheck(**kw):
    r = dict(mintAuthority=None, freezeAuthority=None, token=dict(supply=1_000_000_000_000_000, decimals=6),
             token_extensions={}, tokenMeta=dict(mutable=False), rugged=False, risks=[], score_normalised=1,
             creator="Dev1", creatorBalance=0, graphInsidersDetected=0, totalHolders=4000,
             knownAccounts={POOL: dict(name="Pump Fun AMM", type="AMM")},
             markets=[dict(marketType="pump_fun_amm", pubkey=POOL, lp=dict(lpLockedPct=100, quoteUSD=30_000, baseUSD=30_000))],
             topHolders=[dict(owner=POOL, address="a0", pct=20.0, insider=False)] +
                        [dict(owner=f"W{i}", address=f"a{i}", pct=p, insider=False)
                         for i, p in enumerate([3.0, 2.2, 1.6, 1.3, 1.1, 0.9, 0.8, 0.7, 0.6, 0.5], 1)],
             launchpad=dict(name="Pump.Fun"))
    r.update(kw)
    return r


def raw(**kw):
    r = dict(address=CA, chain="solana", pairs=[pair()], candles=candles(), rugcheck=rugcheck(), errors=[])
    r.update(kw)
    return r


def status(d, cid):
    return next(c["status"] for c in d["checks"] if c["id"] == cid)


class GateTests(unittest.TestCase):
    def test_clean_a_setup(self):
        d = rules.evaluate(raw(), now=NOW)
        self.assertEqual(d["verdict"], "A-SETUP", d["reason"])
        self.assertAlmostEqual(d["vol30"], 150_000)
        self.assertAlmostEqual(d["off_high"], -0.10, places=3)

    def test_at_the_high_is_skip(self):
        d = rules.evaluate(raw(candles=candles(high=0.00092)), now=NOW)
        self.assertEqual(status(d, "pullback"), "fail")
        self.assertEqual(d["verdict"], "SKIP")

    def test_deep_dump_is_skip(self):
        d = rules.evaluate(raw(candles=candles(high=0.002)), now=NOW)
        self.assertEqual(status(d, "pullback"), "fail")

    def test_thin_volume_is_skip(self):
        d = rules.evaluate(raw(candles=candles(vol_per_min=1_000)), now=NOW)
        self.assertEqual(status(d, "vol30"), "fail")

    def test_mid_volume_is_go_not_a(self):
        d = rules.evaluate(raw(candles=candles(vol_per_min=2_500)), now=NOW)  # $75k
        self.assertEqual(d["verdict"], "GO")

    def test_outside_window_halves_size(self):
        late = NOW + 10 * 3600
        r = raw(candles=[[c[0] + 10 * 3600] + c[1:] for c in candles()])
        d = rules.evaluate(r, now=late, bankroll=2000, risk_pct=1)
        self.assertEqual(d["verdict"], "GO · HALF SIZE")
        self.assertTrue(d["sizing"]["half_size"])
        self.assertAlmostEqual(d["sizing"]["position"], 20)

    def test_no_candles_is_incomplete(self):
        d = rules.evaluate(raw(candles=None), now=NOW)
        self.assertEqual(status(d, "pullback"), "unknown")
        self.assertEqual(d["verdict"], "INCOMPLETE")


class SafetyTests(unittest.TestCase):
    def test_live_mint_authority(self):
        d = rules.evaluate(raw(rugcheck=rugcheck(mintAuthority="Evil")), now=NOW)
        self.assertEqual(status(d, "mint"), "fail")
        self.assertTrue(d["reason"].startswith("Contract"))

    def test_permanent_delegate(self):
        d = rules.evaluate(raw(rugcheck=rugcheck(token_extensions=dict(permanentDelegate=dict(delegate="X")))), now=NOW)
        self.assertEqual(status(d, "ext"), "fail")

    def test_unlocked_lp(self):
        m = [dict(marketType="raydium_cpmm", pubkey=POOL, lp=dict(lpLockedPct=12, quoteUSD=30_000, baseUSD=30_000))]
        d = rules.evaluate(raw(rugcheck=rugcheck(markets=m)), now=NOW)
        self.assertEqual(status(d, "lp"), "fail")

    def test_pool_excluded_from_top10(self):
        d = rules.evaluate(raw(), now=NOW)
        self.assertEqual(status(d, "top10"), "pass")  # 12.7% without the 20% pool account

    def test_bundle_signature(self):
        holders = [dict(owner=f"B{i}", address=f"b{i}", pct=2.7 + i * 0.03, insider=False) for i in range(8)]
        d = rules.evaluate(raw(rugcheck=rugcheck(topHolders=holders)), now=NOW)
        self.assertEqual(status(d, "bundle"), "fail")

    def test_dev_holding(self):
        d = rules.evaluate(raw(rugcheck=rugcheck(creatorBalance=80_000_000_000_000)), now=NOW)  # 8%
        self.assertEqual(status(d, "dev"), "fail")

    def test_thin_liquidity_vs_mcap(self):
        d = rules.evaluate(raw(pairs=[pair(liquidity=dict(usd=20_000), marketCap=1_000_000)]), now=NOW)
        self.assertEqual(status(d, "liqmcap"), "fail")

    def test_evm_honeypot_and_tax(self):
        gp = dict(is_honeypot="1", buy_tax="0", sell_tax="0.12", is_proxy="0", is_open_source="1",
                  lp_holders=[dict(address="0x000000000000000000000000000000000000dead", percent="1", is_locked=0)],
                  holders=[], creator_percent="0", owner_percent="0")
        r = raw(chain="bsc", pairs=[pair(chainId="bsc", baseToken=dict(address=CA, symbol="T"))], rugcheck=None, goplus=gp, honeypot=None)
        d = rules.evaluate(r, now=NOW)
        self.assertEqual(status(d, "honeypot"), "fail")
        self.assertEqual(status(d, "tax"), "fail")
        self.assertEqual(status(d, "lp"), "pass")


class StaleCandles(unittest.TestCase):
    def test_stale_candles_make_gate_unknown(self):
        old = [[c[0] - 1200] + c[1:] for c in candles()]   # series ends 20 min ago
        d = rules.evaluate(raw(candles=old), now=NOW)
        self.assertEqual(status(d, "pullback"), "unknown")

    def test_price_above_candle_high_counts_as_high(self):
        d = rules.evaluate(raw(pairs=[pair(priceUsd="0.0015")]), now=NOW)  # above the 0.001 candle high
        self.assertEqual(status(d, "pullback"), "fail")
        self.assertAlmostEqual(d["off_high"], 0.0)


class DataConsistency(unittest.TestCase):
    def test_busy_pool_without_data_is_flagged(self):
        real = pair(dexId="pumpswap", liquidity=None, volume=dict(h24=0, h1=0), txns=dict(h24=dict(buys=3000, sells=2000)))
        dust = pair(dexId="meteora", pairAddress="Dust", liquidity=dict(usd=12), volume=dict(h24=5, h1=5),
                    txns=dict(h24=dict(buys=4, sells=7), h1=dict(buys=1, sells=7)))
        d = rules.evaluate(raw(pairs=[real, dust], candles=None), now=NOW)
        self.assertEqual(status(d, "data"), "unknown")

    def test_normal_token_not_flagged(self):
        d = rules.evaluate(raw(), now=NOW)
        self.assertFalse(any(c["id"] == "data" for c in d["checks"]))


class HelperTests(unittest.TestCase):
    def test_bundle_cluster(self):
        self.assertEqual(rules.bundle_cluster([5, 3, 1.2, 0.9])[0], 0)
        n, s = rules.bundle_cluster([2.88, 2.79, 2.78, 2.76, 2.74, 2.74, 2.61, 3.14, 23.4])
        self.assertGreaterEqual(n, 7)
        self.assertGreater(s, 15)

    def test_sizing_cap(self):
        d = rules.evaluate(raw(), now=NOW, bankroll=200_000, risk_pct=1)  # $4k wanted, pool $60k -> cap $1.2k
        self.assertTrue(d["sizing"]["capped_by_liquidity"])
        self.assertAlmostEqual(d["sizing"]["position"], 1200)

    def test_exits(self):
        e = rules.evaluate(raw(), now=NOW)["exits"]
        self.assertAlmostEqual(e["take_profit"], 0.0018)
        self.assertAlmostEqual(e["stop"], 0.00045)

    def test_no_pair(self):
        self.assertEqual(rules.evaluate(raw(pairs=[]), now=NOW)["verdict"], "NO DATA")


if __name__ == "__main__":
    unittest.main()
