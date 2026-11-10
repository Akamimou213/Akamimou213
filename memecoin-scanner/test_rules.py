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


def devh(**kw):
    """Clean dev history: an old wallet, one funder, no earlier launches."""
    h = dict(tx_count=120, history_complete=True, first_seen=NOW - 40 * 86400, funder="Fund1",
             launch_source="pump.fun bonding curves", launch_total=0, launches=[])
    h.update(kw.pop("history", {}))
    d = dict(creator="Dev1", chain="solana", history=h, launches_priced=[], same_creator=[], same_funder=[],
             rug_hits={}, error=None, skipped=None)
    d.update(kw)
    return d


def raw(**kw):
    r = dict(address=CA, chain="solana", pairs=[pair()], candles=candles(), rugcheck=rugcheck(), devhist=devh(), errors=[])
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

    def test_creator_in_top_holders_overrides_zero_balance(self):
        hs = rugcheck()["topHolders"] + [dict(owner="Dev1", address="dv", pct=26.75, insider=False)]
        d = rules.evaluate(raw(rugcheck=rugcheck(creatorBalance=0, topHolders=hs)), now=NOW)
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


class ChainsAndFees(unittest.TestCase):
    def evm(self, chain, gp=None, **pk):
        p = pair(chainId=chain, dexId="uniswap", **pk)
        return raw(chain=chain, pairs=[p], rugcheck=None, goplus=gp, honeypot=None)

    def test_uncovered_chain_fails(self):
        d = rules.evaluate(self.evm("elysium"), now=NOW)
        self.assertEqual(status(d, "coverage"), "fail")
        self.assertEqual(d["verdict"], "SKIP")

    def test_covered_chain_without_data_is_unknown(self):
        d = rules.evaluate(self.evm("base"), now=NOW)
        self.assertEqual(status(d, "goplus"), "unknown")

    def test_v4_pool_warns_about_hooks(self):
        d = rules.evaluate(self.evm("elysium", labels=["v4"]), now=NOW)
        self.assertEqual(status(d, "fees"), "warn")

    def test_goplus_pool_fee_and_v4_position(self):
        gp = dict(is_honeypot="0", buy_tax="0", sell_tax="0", is_proxy="0", is_open_source="1", holders=[],
                  creator_percent="0", owner_percent="0",
                  dex=[dict(liquidity_type="UniV4", pool_fee="0.0025", pair="Pool111111111111111111111111111111111111111")],
                  lp_holders=[dict(address="0xeff1", is_contract=1, is_locked=0, percent="1", NFT_list=[{"NFT_id": "1"}])])
        d = rules.evaluate(self.evm("robinhood", gp), now=NOW)
        fee = next(c for c in d["checks"] if c["id"] == "fees")
        self.assertIn("0.25%", fee["value"])
        self.assertEqual(status(d, "lp"), "unknown")       # not a false "unlocked" fail

    def test_trap_pools_do_not_set_main_fee_or_lp(self):
        gp = dict(is_honeypot="0", buy_tax="0", sell_tax="0", is_proxy="0", is_open_source="1", holders=[],
                  creator_percent="0", owner_percent="0",
                  dex=[dict(liquidity_type="UniV4", pool_fee="0.989999", pair="0xjunk1"),
                       dict(liquidity_type="UniV4", pool_fee="0.7", pair="0xjunk2")],
                  lp_holders=[dict(address="0xeoa", is_contract=0, is_locked=0, percent="1", NFT_list=[{}])])
        d = rules.evaluate(self.evm("robinhood", gp, labels=["v4"]), now=NOW)
        fee = next(c for c in d["checks"] if c["id"] == "fees")
        self.assertEqual(fee["status"], "warn")
        self.assertNotIn("98.9999% pool fee", fee["value"])
        self.assertIn("2 other pool(s)", fee["note"])
        self.assertEqual(status(d, "lp"), "unknown")

    def test_main_pool_fee_above_5_fails(self):
        gp = dict(is_honeypot="0", buy_tax="0", sell_tax="0", is_proxy="0", is_open_source="1", holders=[],
                  creator_percent="0", owner_percent="0",
                  dex=[dict(liquidity_type="UniV4", pool_fee="0.3", pair="Pool111111111111111111111111111111111111111")])
        d = rules.evaluate(self.evm("robinhood", gp), now=NOW)
        self.assertEqual(status(d, "fees"), "fail")

    def test_solana_venue_fee_info(self):
        d = rules.evaluate(raw(), now=NOW)                  # pumpswap
        fee = next(c for c in d["checks"] if c["id"] == "fees")
        self.assertEqual(fee["status"], "info")
        self.assertIn("1.25%", fee["value"])


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




class DevHistoryTests(unittest.TestCase):
    def test_clean_history_passes(self):
        d = rules.evaluate(raw(), now=NOW)
        self.assertEqual(status(d, "serial"), "pass")
        self.assertEqual(status(d, "rugwallet"), "pass")
        self.assertEqual(d["verdict"], "A-SETUP", d["reason"])

    def test_missing_dev_history_is_incomplete(self):
        d = rules.evaluate(raw(devhist=None), now=NOW)
        self.assertEqual(status(d, "serial"), "unknown")
        self.assertEqual(d["verdict"], "INCOMPLETE")

    def test_rpc_failure_is_unknown_not_pass(self):
        d2 = rules.evaluate(raw(devhist=dict(devh(error="rpc HTTP 429"), history=None)), now=NOW)
        self.assertEqual(status(d2, "serial"), "unknown")
        self.assertEqual(d2["verdict"], "INCOMPLETE")

    def test_serial_launcher_fails(self):
        dead = [dict(address=f"Old{i}", symbol=f"OLD{i}", liq=200) for i in range(3)]
        d = rules.evaluate(raw(devhist=devh(launches_priced=dead, history=dict(launch_total=3))), now=NOW)
        self.assertEqual(status(d, "serial"), "fail")
        self.assertEqual(d["verdict"], "SKIP")
        self.assertIn("3 dead", next(c["value"] for c in d["checks"] if c["id"] == "serial"))

    def test_one_earlier_coin_warns(self):
        d = rules.evaluate(raw(devhist=devh(launches_priced=[dict(address="Old1", symbol="OLD", liq=50_000)],
                                            history=dict(launch_total=1))), now=NOW)
        self.assertEqual(status(d, "serial"), "warn")
        self.assertNotEqual(d["verdict"], "SKIP")

    def test_registry_counts_with_sampled_launches(self):
        # Finance Inu case: the creator was already seen behind other coins in the local registry.
        seen = [dict(address="Peak", symbol="PEAK", ts=NOW - 3600), dict(address="X2", symbol="X2", ts=NOW - 7200)]
        d = rules.evaluate(raw(devhist=devh(same_creator=seen, launches_priced=[dict(address="Old1", symbol="O", liq=0)],
                                            history=dict(launch_total=1))), now=NOW)
        self.assertEqual(status(d, "serial"), "fail")

    def test_rug_list_hit_on_funder_fails(self):
        d = rules.evaluate(raw(devhist=devh(rug_hits={"Fund1": "seed"})), now=NOW)
        self.assertEqual(status(d, "rugwallet"), "fail")
        self.assertIn("first funder", next(c["value"] for c in d["checks"] if c["id"] == "rugwallet"))

    def test_shared_funder_farm_fails(self):
        sf = [dict(address=f"C{i}", symbol=f"C{i}", creator=f"Dev{i + 2}", ts=NOW) for i in range(3)]
        d = rules.evaluate(raw(devhist=devh(same_funder=sf)), now=NOW)
        self.assertEqual(status(d, "funder"), "fail")

    def test_fresh_wallet_warns(self):
        d = rules.evaluate(raw(devhist=devh(history=dict(first_seen=NOW - 3 * 3600))), now=NOW)
        self.assertEqual(status(d, "walletage"), "warn")

    def test_unindexed_launchpad_is_unknown(self):
        d = rules.evaluate(raw(devhist=devh(history=dict(launch_source=None, launch_total=None))), now=NOW)
        self.assertEqual(status(d, "serial"), "unknown")
        self.assertEqual(d["verdict"], "INCOMPLETE")

    def test_curves_beyond_the_priced_25_still_count(self):
        d = rules.evaluate(raw(devhist=devh(history=dict(launch_total=40))), now=NOW)
        self.assertEqual(status(d, "serial"), "fail")
        self.assertIn("40 other coins", next(c["value"] for c in d["checks"] if c["id"] == "serial"))

    def test_evm_registry_only_is_info(self):
        dh = dict(devh(chain="base"), history=None)
        checks = rules._dev(dh, "base", {"honeypot_with_same_creator": "1"})
        ids = {c["id"]: c["status"] for c in checks}
        self.assertEqual(ids["devhoneypot"], "fail")
        self.assertEqual(ids["serial"], "info")


class DevHistIOTests(unittest.TestCase):
    def setUp(self):
        import devhist
        self.dh = devhist

    def test_curve_creator_offset(self):
        # discriminator(8) + virtual token, virtual sol, real token, real sol, total supply (5 x u64) + complete(1)
        self.assertEqual(self.dh.CURVE_CREATOR_OFFSET, 49)

    def test_first_funder_from_transfer(self):
        tx = dict(transaction=dict(message=dict(accountKeys=[dict(pubkey="Payer")], instructions=[
            dict(parsed=dict(type="transfer", info=dict(source="Fund9", destination="DevZ", lamports=1)))])))
        self.assertEqual(self.dh.first_funder(tx, "DevZ"), "Fund9")

    def test_current_coin_not_counted_as_earlier(self):
        self.dh._cache[("DevQ", True)] = (__import__("time").time(), dict(
            tx_count=5, history_complete=True, first_seen=1, funder=None, launch_source="pump.fun bonding curves",
            launch_total=2, launches=["ThisCoin", "Older"]))
        h = self.dh.solana_history("DevQ", "ThisCoin")
        self.assertEqual((h["launch_total"], h["launches"]), (1, ["Older"]))

    def test_registry_finds_same_creator(self):
        import tempfile
        path = os.path.join(tempfile.mkdtemp(), "t.db")
        self.dh.registry_record("solana", "A", "AAA", "DevX", "FundX", path)
        self.dh.registry_record("solana", "B", "BBB", "DevY", "FundX", path)
        sc, sf = self.dh.registry_lookup("solana", "C", "DevX", "FundX", path)
        self.assertEqual([c["symbol"] for c in sc], ["AAA"])
        self.assertEqual([c["symbol"] for c in sf], ["BBB"])
