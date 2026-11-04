"""Offline tests for Trench: money paths, safety gate, re-entry, live range, Telegram parsing, HTTP input.
python3 -m unittest test_trench -v"""
import json
import os
import sys
import tempfile
import threading
import time
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import trench_app as T  # noqa: E402
from core import load_config  # noqa: E402

MINT = "Mint1111111111111111111111111111111111pump"


def pair(price=0.001, liq=200_000):
    return dict(chainId="solana", dexId="pumpswap", pairAddress="P1", priceUsd=str(price), baseToken=dict(address=MINT, symbol="TEST"),
                liquidity=dict(usd=liq), marketCap=500_000, volume=dict(h1=90_000, h24=300_000, m5=5_000),
                txns=dict(h1=dict(buys=300, sells=200), m5=dict(buys=20, sells=10)), priceChange=dict(m5=1, h1=5, h6=20),
                pairCreatedAt=int((time.time() - 3600 * 5) * 1000))


class Base(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        T.HERE = self.tmp
        os.makedirs(os.path.join(self.tmp, "data"))
        self.app = T.App(load_config())
        self.price = 0.001
        T.S.ds_tokens = lambda chain, mints: [pair(self.price)]
        self.app.add(MINT, "launch")
        self.app.coins[MINT].update(price=0.001, safety="pass", checks=[{"id": "mint", "ok": True}], high24=0.002, low24=0.0003,
                                   created=time.time() - 5 * 3600, vol_h1=90_000, liq=200_000)


class Money(Base):
    def test_buy_size_by_risk_and_cash(self):
        r = self.app.buy(MINT, "fresh")
        self.assertTrue(r["ok"], r)
        self.assertAlmostEqual(r["size"], 1000 * 0.01 / 0.545, places=2)
        self.assertAlmostEqual(self.app.kv("cash"), 1000 - r["size"], places=6)

    def test_concurrent_sells_never_double_pay(self):
        pid = self.app.buy(MINT, "fresh")["id"]
        cash_after_buy = self.app.kv("cash")
        ts = [threading.Thread(target=self.app.tick, args=(pid, 0.001, 200_000), kwargs=dict(manual=1.0)) for _ in range(8)]
        for t in ts:
            t.start()
        for t in ts:
            t.join()
        closed = self.app.q("SELECT * FROM pos WHERE id=?", (pid,))[0]
        self.assertEqual(closed["status"], "closed")
        self.assertAlmostEqual(self.app.kv("cash") - cash_after_buy, closed["proceeds"], places=9)
        self.assertLess(closed["proceeds"], closed["cost"])          # fees: a flat round trip loses ~4.5%

    def test_stop_target_and_time(self):
        pid = self.app.buy(MINT, "fresh")["id"]
        e = self.app.q("SELECT entry FROM pos WHERE id=?", (pid,))[0]["entry"]
        self.app.tick(pid, e * 2.01, 200_000)
        p = self.app.q("SELECT * FROM pos WHERE id=?", (pid,))[0]
        self.assertEqual((p["status"], p["why"]), ("closed", "take profit"))
        self.assertGreater(p["ret"], 0.8)

    def test_no_price_past_time_limit_closes(self):
        pid = self.app.buy(MINT, "fresh")["id"]
        self.app.tick(pid, 0.0, 0.0, manual=1.0, why="no price after the time limit (counted as lost)")
        p = self.app.q("SELECT * FROM pos WHERE id=?", (pid,))[0]
        self.assertEqual(p["status"], "closed")
        self.assertAlmostEqual(p["ret"], -1.0, places=6)


class Gate(Base):
    def test_safety_enforced_on_server(self):
        self.app.coins[MINT]["safety"] = "dead"
        self.app.coins[MINT]["safety_why"] = "Top 10 holders: 31%"
        self.assertIn("safety", self.app.buy(MINT, "fresh")["error"])
        self.app.coins[MINT]["safety"] = None
        self.app.coins[MINT]["checks"] = None
        self.assertIn("still running", self.app.buy(MINT, "fresh")["error"])

    def test_no_averaging_down_and_no_reentry_after_loss(self):
        pid = self.app.buy(MINT, "fresh")["id"]
        self.assertIn("averaging", self.app.buy(MINT, "fresh")["error"])
        self.app.tick(pid, 0.0004, 200_000)                            # -60%: stop
        self.assertEqual(self.app.q("SELECT status FROM pos WHERE id=?", (pid,))[0]["status"], "closed")
        err = self.app.buy(MINT, "fresh")["error"]
        self.assertTrue("cooldown" in err or "re-entry" in err, err)

    def test_volume_is_not_safety(self):
        self.assertIn("vol", T.ACTIVITY_CHECKS)


class Data(Base):
    def test_live_range_uses_current_price(self):
        c = self.app.coins[MINT]
        b, a = self.app.live_range(c)
        self.assertAlmostEqual(b, 0.5)
        self.assertAlmostEqual(a, 0.001 / 0.0003 - 1)
        c["price"] = 0.003                                            # above the stored high: high moves with it
        self.assertAlmostEqual(self.app.live_range(c)[0], 0.0)

    def test_setup_tag(self):
        tags, _ = self.app.tag(self.app.coins[MINT], time.time())
        self.assertIn("setup", tags)                                   # 5 h old, 50% off high, 2.3x over low, safe
        self.app.coins[MINT]["safety"] = "dead"
        self.assertEqual(self.app.tag(self.app.coins[MINT], time.time())[0], ["dead"])

    def test_telegram_brag_points_to_original(self):
        page = ('<div class="tgme_widget_message_wrap"><div data-post="ch/2"><a class="tgme_widget_message_reply user-color" '
                'href="https://t.me/ch/1"><div class="tgme_widget_message_text">quoted (🔥SOL) X</div></a>'
                '<div class="tgme_widget_message_text js-message_text">4x (🔥SOL) CAT 220k now 150k</div>'
                '<time datetime="2026-11-04T15:08:59+00:00"></time></div>')
        posts = T.App.tg_posts(page)
        self.assertEqual(posts[0][0], "ch/2")
        self.assertEqual(posts[0][3], "ch/1")
        self.assertTrue(posts[0][2].startswith("4x"))


if __name__ == "__main__":
    unittest.main()
