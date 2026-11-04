"""Offline tests for the series gate and the paper-trade simulator.  python3 -m unittest test_series -v"""
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import series as SR  # noqa: E402

T0 = 1793577600  # 2026-11-02 00:00 UTC


def mk(prices, vol_m5=20_000, liq=50_000, start=T0, step=60):
    return [dict(ts=start + i * step, price=p, liq=liq, liq_total=liq, mcap=500_000, vol_m5=vol_m5, vol_h1=vol_m5 * 12)
            for i, p in enumerate(prices)]


class GateSeries(unittest.TestCase):
    def test_pullback_gate(self):
        s = mk([1.0] * 30 + [1.2] + [1.05] * 29)          # high 1.2, now 1.05 -> 12.5% below
        g = SR.gate_from_series(s, s[-1]["ts"])
        self.assertAlmostEqual(g["vol30"], 120_000)
        self.assertAlmostEqual(-g["off_high"], 0.125)
        self.assertTrue(SR.gate_pass(g))

    def test_needs_history(self):
        s = mk([1.0] * 20)
        g = SR.gate_from_series(s, s[-1]["ts"])
        self.assertIsNone(g["off_high"])
        self.assertFalse(SR.gate_pass(g))

    def test_gap_in_samples_falls_back_to_estimate(self):
        s = mk([1.0] * 60)
        del s[45:58]                                        # missing slots at t-5m .. t-10m
        g = SR.gate_from_series(s, s[-1]["ts"])
        self.assertTrue(g["vol_est"])
        self.assertFalse(SR.gate_pass(g))                   # estimates never trigger alerts

    def test_no_lookahead(self):
        s = mk([1.0] * 50 + [5.0] * 10)
        g = SR.gate_from_series(s, s[49]["ts"])
        self.assertEqual(g["high60"], 1.0)

    def test_thin_volume(self):
        s = mk([1.0] * 30 + [1.2] + [1.05] * 29, vol_m5=5_000)
        self.assertFalse(SR.gate_pass(SR.gate_from_series(s, s[-1]["ts"])))


class Simulate(unittest.TestCase):
    def test_take_profit_fills_at_limit(self):
        s = mk([1.0, 1.0, 1.5, 2.6])
        r = SR.simulate(s, s[0]["ts"])
        self.assertEqual(r["exit_reason"], "take profit")
        self.assertAlmostEqual(r["exit_price"], 2.0)
        self.assertAlmostEqual(r["ret"], 2 * 0.955 - 1)

    def test_stop_slips_through(self):
        s = mk([1.0, 1.0, 0.8, 0.3])
        r = SR.simulate(s, s[0]["ts"])
        self.assertEqual(r["exit_reason"], "stop")
        self.assertAlmostEqual(r["exit_price"], 0.3)       # gap fill, worse than −50 %

    def test_time_stop(self):
        s = mk([1.0] * 70)
        r = SR.simulate(s, s[0]["ts"])
        self.assertEqual(r["exit_reason"], "time stop")
        self.assertEqual(r["exit_ts"] - r["entry_ts"], 3600)

    def test_entry_is_delayed(self):
        s = mk([1.0, 1.3, 1.3])
        r = SR.simulate(s, s[0]["ts"])
        self.assertAlmostEqual(r["entry_price"], 1.3)      # you buy a minute late

    def test_liquidity_pull(self):
        s = mk([1.0, 1.0, 1.0])
        s[2]["liq"] = 200
        r = SR.simulate(s, s[0]["ts"])
        self.assertEqual(r["exit_reason"], "liquidity pulled")
        self.assertAlmostEqual(r["ret"], -1.0)

    def test_open_when_not_enough_data(self):
        s = mk([1.0, 1.0, 1.1])
        self.assertEqual(SR.simulate(s, s[0]["ts"])["status"], "open")


if __name__ == "__main__":
    unittest.main()
