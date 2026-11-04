"""Offline tests for the rules that protect capital. python3 -m unittest test_desk -v"""
import copy
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import judge as J  # noqa: E402
import risk as RK  # noqa: E402
import seats as SE  # noqa: E402
import sniper as SN  # noqa: E402
import tui  # noqa: E402
from core import Desk, load_config  # noqa: E402
from store import Store  # noqa: E402

MINT = "Mint1111111111111111111111111111111111pump"
CREATOR = "Dev11111111111111111111111111111111111111"


class Clock:
    def __init__(self, t=1_800_000_000):
        self.t = t

    def __call__(self):
        return self.t


TRADER = dict(name="trader: stop -6%, trail 6% after +12%", sl=0.06, tp=None, partial=None, arm=0.12, trail=0.06, tmax=60)


def make_desk(plan=None):
    cfg = load_config()
    if plan:
        cfg["exit"]["plan"] = plan
    st = Store(":memory:")
    st.set_cash(cfg["start_balance_usd"])
    d = Desk(cfg, st, clock=Clock())
    d.sniper = SN.Sniper(d)
    d.exit = SN.Exit(d, d.sniper.limits)
    return d


def pair(vol_h1=80_000, liq=60_000, price=0.001, dex="pumpswap", mcap=400_000, buys=300, sells=200):
    return dict(chainId="solana", dexId=dex, pairAddress="P1", priceUsd=str(price), baseToken=dict(address=MINT, symbol="TEST"),
                liquidity=dict(usd=liq), marketCap=mcap, volume=dict(h1=vol_h1, h24=vol_h1 * 5),
                txns=dict(h1=dict(buys=buys, sells=sells), h24=dict(buys=buys * 5, sells=sells * 5), m5=dict(buys=30, sells=20)),
                priceChange=dict(h1=20, h6=60), pairCreatedAt=(1_800_000_000 - 7200) * 1000)


def rugcheck(top=(2.0, 1.8, 1.5, 1.4, 1.2, 1.1, 1.0, 0.9, 0.8, 0.7), mint_auth=None, lp_locked=100, market="pump_fun_amm"):
    return dict(mintAuthority=mint_auth, freezeAuthority=None, creator=CREATOR, creatorBalance=0, totalHolders=1500,
                token=dict(supply=1e15), risks=[], token_extensions={}, graphInsidersDetected=0,
                markets=[dict(marketType=market, pubkey="POOL", lp=dict(lpLockedPct=lp_locked, quoteUSD=30000, baseUSD=30000))],
                topHolders=[dict(owner=f"H{i}", address=f"A{i}", pct=p) for i, p in enumerate(top)], knownAccounts={})


class FakeDev:
    def __init__(self, ok=True):
        self.ok = ok

    def check(self, creator):
        return (self.ok, "test")


class RiskTests(unittest.TestCase):
    def setUp(self):
        self.cfg = load_config()

    def ev(self, pairs=None, rc="default", dev=None):
        rc = rugcheck() if rc == "default" else rc
        return RK.evaluate(MINT, pairs if pairs is not None else [pair()], rc, dev or FakeDev(), self.cfg)

    def test_clean_token_passes(self):
        status, checks, facts = self.ev()
        self.assertEqual(status, "pass", [c for c in checks if not c["ok"]])
        self.assertAlmostEqual(facts["top10_pct"], 12.4, places=1)

    def test_each_hard_fail_kills(self):
        cases = {
            "mint": dict(rc=rugcheck(mint_auth="SomeAuthority")),
            "lp": dict(rc=rugcheck(lp_locked=50)),
            "top10": dict(rc=rugcheck(top=(5, 4, 3, 3, 2, 2, 1, 1, 1, 1))),
            "vol": dict(pairs=[pair(vol_h1=40_000)]),
            "dev": dict(dev=FakeDev(ok=False)),
        }
        for cid, kw in cases.items():
            status, checks, _ = self.ev(**kw)
            self.assertEqual(status, "dead", cid)
            self.assertFalse(next(c for c in checks if c["id"] == cid)["ok"], cid)

    def test_cannot_check_means_dead(self):
        self.assertEqual(self.ev(rc=None)[0], "dead")                 # no RugCheck report
        self.assertEqual(self.ev(dev=FakeDev(ok=None))[0], "dead")    # dev history could not run
        self.assertEqual(self.ev(pairs=[])[0], "dead")                # no volume data

    def test_bonding_curve_counts_as_locked(self):
        status, checks, _ = self.ev(pairs=[pair(dex="pumpfun")], rc=rugcheck(lp_locked=0, market="pump_fun"))
        self.assertTrue(next(c for c in checks if c["id"] == "lp")["ok"])

    def test_registry_link_via_funder(self):
        d = make_desk()
        dev = RK.DevHistory(d)
        dev.cache[CREATOR] = ("Funder1", "first funding transfer")
        self.assertTrue(dev.check(CREATOR)[0])
        d.store.x("INSERT INTO rug_registry VALUES (?,?,?,?,?)", ("Funder1", "creator", "OLD", 0, "old rug"))
        ok, val = dev.check(CREATOR)
        self.assertFalse(ok)
        self.assertIn("rug registry", val)


def answers(buy=0.8, watch=0.1, org=0.8, late=0.2, exit_lvl=2):
    ex = {str(k): (0.9 if k == exit_lvl else 0.025) for k in range(1, 6)}
    return dict(organic=dict(yes=org), late=dict(yes=late), exit_risk=ex,
                action=dict(buy=buy, watch=watch, **{"pass": round(1 - buy - watch, 3)}))


class GateTests(unittest.TestCase):
    def setUp(self):
        self.cfg = load_config()

    def g(self, **kw):
        return J.apply_gate(answers(**kw), self.cfg)

    def test_clean_buy(self):
        self.assertEqual(self.g()["final"], "buy")

    def test_each_leg(self):
        self.assertEqual(self.g(buy=0.69, watch=0.1)["final"], "pass")     # buy p < 0.70
        self.assertEqual(self.g(org=0.64)["final"], "pass")                # organic p < 0.65
        self.assertEqual(self.g(late=0.6)["final"], "pass")                # late = yes
        self.assertEqual(self.g(exit_lvl=4)["final"], "pass")              # exit risk > 3

    def test_watch_then_pass(self):
        a = answers(buy=0.2, watch=0.6)
        self.assertEqual(J.apply_gate(a, self.cfg, watch_count=0)["final"], "watch")
        self.assertEqual(J.apply_gate(a, self.cfg, watch_count=1)["final"], "pass")

    def test_no_answer_is_pass(self):
        self.assertEqual(J.apply_gate(None, self.cfg)["final"], "pass")
        bad = copy.deepcopy(self.cfg)
        bad["judge"]["backend"] = "nope"
        a, err, _ = J.ask({}, bad)
        self.assertIsNone(a)
        self.assertEqual(J.apply_gate(a, bad)["final"], "pass")

    def test_rules_judge_buys_clean_and_passes_top(self):
        dos = dict(holders=dict(growth_1h_pct=40, top10_pct=11, insider_wallets=0, bundle_pct=0),
                   price=dict(change_same_hour_pct=15, below_60m_high_pct=14, change_1h_pct=15, change_6h_pct=40),
                   flow_5m=dict(now=dict(buys=40, sells=25), prev=dict(buys=35, sells=20)),
                   flow_1h=dict(avg_trade_usd=120), order=dict(share_of_pool_pct=0.3),
                   market=dict(liquidity_to_mcap_pct=18), whale=dict(result="confirm"), utc_hour=3)
        a, err, ms = J.ask(dos, self.cfg)
        self.assertIsNone(err)
        self.assertLess(ms, 50)
        self.assertEqual(J.apply_gate(a, self.cfg)["final"], "buy", a)
        top = copy.deepcopy(dos)
        top["price"].update(below_60m_high_pct=2, change_1h_pct=220)
        self.assertEqual(J.apply_gate(J.ask(top, self.cfg)[0], self.cfg)["final"], "pass")
        fresh = copy.deepcopy(dos)
        fresh["holders"]["growth_1h_pct"] = "missing"
        fresh["price"]["change_same_hour_pct"] = "missing"
        self.assertEqual(J.apply_gate(J.ask(fresh, self.cfg)[0], self.cfg)["final"], "watch")   # not yet, not no


def seed_lead(d, risk="pass", final="buy", p_buy=0.8):
    lid = d.store.x("INSERT INTO leads (mint, symbol, created_ts, stage, status) VALUES (?,?,?,?,?)",
                    (MINT, "TEST", int(d.clock()), "JUDGE", "judged"))
    d.store.set_lead(lid, risk=dict(status=risk, checks=[], facts={}),
                     verdict=dict(answers=answers(buy=p_buy), gate=dict(final=final)))
    return lid


class SniperTests(unittest.TestCase):
    def setUp(self):
        self.d = make_desk()
        if self._testMethodName in ("test_hard_stop_at_minus_6", "test_trail_only_after_12", "test_no_revenge_and_loss_streak_pause",
                                    "test_shadow_plans_record_alternatives", "test_approve_fills_and_no_averaging_down"):
            self.d = make_desk(TRADER)
        self.price = 0.001
        SN.ds_pairs_by_mint = lambda mints: {MINT: [pair(price=self.price, liq=200_000)]}

    def test_hard_handoff_refuses(self):
        for risk, final in (("dead", "buy"), ("pass", "pass"), ("pass", "watch")):
            lid = seed_lead(self.d, risk, final)
            self.d.sniper.stage(lid)
            self.assertIsNone(self.d.store.one("SELECT id FROM orders WHERE lead_id=?", (lid,)), (risk, final))

    def test_size_by_risk_regardless_of_confidence(self):
        sizes = []
        for p in (0.71, 0.92):
            d = make_desk()
            d.sniper.stage(seed_lead(d, p_buy=p))
            sizes.append(d.store.one("SELECT size_usd FROM orders")["size_usd"])
        self.assertEqual(sizes[0], sizes[1])                       # confidence never sizes
        self.assertAlmostEqual(sizes[0], 1000 * 0.01 / 0.545, places=2)  # a full -50% stop + fees costs 1% of $1,000

    def test_size_never_above_8pct(self):
        cfg = load_config()
        cfg["exit"]["plan"] = dict(cfg["exit"]["plan"], sl=0.06)
        self.assertAlmostEqual(SN.position_fraction(cfg), 0.08)    # 1% / 10.5% would be 9.5%: capped
        cfg["sniper"]["risk_per_trade_pct"] = None
        self.assertAlmostEqual(SN.position_fraction(cfg), 0.08)

    def test_size_capped_by_pool(self):
        SN.ds_pairs_by_mint = lambda mints: {MINT: [pair(price=self.price, liq=500)]}
        self.d.sniper.stage(seed_lead(self.d))
        self.assertAlmostEqual(self.d.store.one("SELECT size_usd FROM orders")["size_usd"], 10.0)

    def test_approve_fills_and_no_averaging_down(self):
        lid = seed_lead(self.d)
        self.d.sniper.stage(lid)
        self.d.sniper.approve(lid)
        self.assertEqual(len(self.d.store.open_positions()), 1)
        self.assertAlmostEqual(self.d.store.cash(), 920.0)   # trader plan: 1% / 10.5% → capped at 8%
        lid2 = seed_lead(self.d)
        self.d.sniper.stage(lid2)
        self.assertIsNone(self.d.store.one("SELECT id FROM orders WHERE lead_id=?", (lid2,)))

    def test_refuses_chase_and_late_approval(self):
        lid = seed_lead(self.d)
        self.d.sniper.stage(lid)
        self.price = 0.00106
        self.d.sniper.approve(lid)
        self.assertEqual(self.d.store.one("SELECT status FROM orders WHERE lead_id=?", (lid,))["status"], "refused")
        lid2 = seed_lead(self.d)
        self.price = 0.001
        SN.ds_pairs_by_mint = lambda mints: {MINT: [pair(price=self.price, liq=200_000)]}
        self.d.sniper.stage(lid2)
        self.d.clock.t += 181
        self.d.sniper.approve(lid2)
        self.assertEqual(len(self.d.store.open_positions()), 0)

    def open_position(self):
        lid = seed_lead(self.d)
        self.d.sniper.stage(lid)
        self.d.sniper.approve(lid)
        return self.d.store.open_positions()[0]

    def test_hard_stop_at_minus_6(self):
        p = self.open_position()
        e = p["entry_price"]
        self.assertIsNone(self.d.exit.tick(p, e * 0.95, 200_000))
        why = self.d.exit.tick(self.d.store.open_positions()[0], e * 0.939, 200_000)
        self.assertIn("stop -6%", why)
        closed = self.d.store.one("SELECT * FROM positions")
        self.assertLess(closed["ret"], -0.06)  # fees + impact make the real loss worse than -6%

    def test_trail_only_after_12(self):
        p = self.open_position()
        e = p["entry_price"]
        self.d.exit.tick(p, e * 1.11, 200_000)
        p = self.d.store.open_positions()[0]
        self.assertEqual(p["trail_active"], 0)
        self.assertIsNone(self.d.exit.tick(p, e * 1.04, 200_000))   # no trail yet, so +4% stays open
        p = self.d.store.open_positions()[0]
        self.d.exit.tick(p, e * 1.20, 200_000)
        p = self.d.store.open_positions()[0]
        self.assertEqual(p["trail_active"], 1)
        self.assertAlmostEqual(p["stop_price"], e * 1.20 * 0.94)
        why = self.d.exit.tick(p, e * 1.12, 200_000)
        self.assertIn("trailing", why)
        self.assertGreater(self.d.store.one("SELECT pnl_usd FROM positions")["pnl_usd"], 0)

    def test_shadow_plans_record_alternatives(self):
        p = self.open_position()
        e = p["entry_price"]
        self.d.exit.tick(p, e * 0.93, 200_000)                     # live plan stops out at -6%
        rows = {r["plan"]: r for r in self.d.store.q("SELECT * FROM shadow_results")}
        self.assertIn("trader: stop -6%, trail 6% after +12%", rows)
        self.assertNotIn("playbook: TP 2x, stop -50%", rows)         # still running in the shadow
        pos = self.d.store.one("SELECT * FROM positions")
        self.assertEqual(pos["status"], "closed")
        self.assertEqual(len(self.d.exit.shadow_only()), 1)
        self.d.clock.t += 61 * 60                                     # shadows finish on their own clock
        self.d.exit.tick_shadows(pos, e * 1.1, int(self.d.clock()))
        rows = {r["plan"]: r for r in self.d.store.q("SELECT * FROM shadow_results")}
        self.assertAlmostEqual(rows["playbook: TP 2x, stop -50%"]["ret"], 1.1 * 0.955 - 1, places=3)
        self.assertEqual(len(self.d.exit.shadow_only()), 1)              # the 120-min plan is still running
        self.d.clock.t += 60 * 60
        self.d.exit.tick_shadows(self.d.store.one("SELECT * FROM positions"), e * 1.1, int(self.d.clock()))
        self.assertEqual(self.d.exit.shadow_only(), [])

    def test_time_stop_and_liquidity_pull(self):
        p = self.open_position()
        self.d.clock.t += 3601
        self.assertIn("time stop", self.d.exit.tick(p, p["entry_price"], 200_000))
        self.d.clock.t += 24 * 3600 + 60
        p = self.open_position()
        self.assertIn("liquidity pulled", self.d.exit.tick(p, p["entry_price"], 50))

    def test_no_revenge_and_loss_streak_pause(self):
        p = self.open_position()
        self.d.exit.tick(p, p["entry_price"] * 0.9, 200_000)
        why = self.d.sniper.limits.check("OtherMint")
        self.assertIn("cooldown", why)
        self.d.clock.t += 31 * 60
        self.assertIsNone(self.d.sniper.limits.check("OtherMint"))
        self.assertIn("stopped you out", self.d.sniper.limits.check(MINT))
        self.d.store.set_meta("loss_streak", 2)
        self.d.sniper.limits.after_close(-1)
        self.assertIn("paused", self.d.sniper.limits.check("OtherMint"))


class ShadowBookTests(unittest.TestCase):
    def test_every_judged_lead_gets_a_shadow_entry(self):
        d = make_desk()
        SN.ds_pairs_by_mint = lambda mints: {MINT: [pair(price=0.001, liq=200_000)]}
        lid = seed_lead(d, final="pass")
        d.store.set_lead(lid, dossier=dict(price=dict(usd=0.001, below_60m_high_pct=3), utc_hour=2))
        SE.JudgeSeat(d).run(lid)
        sh = d.store.one("SELECT * FROM positions WHERE status='shadow'")
        self.assertIsNotNone(sh)
        self.assertEqual(d.store.cash(), 1000)                      # no money moves
        import json as _j
        self.assertEqual(_j.loads(sh["tags"])["position"], "near high (<7%)")
        # first tick sets the entry, later ticks run every plan
        d.exit.loop_once = None
        p = d.exit.shadow_only()[0]
        d.store.x("UPDATE positions SET entry_price=?, entry_ts=? WHERE id=?", (0.001, int(d.clock()), p["id"]))
        d.clock.t += 120
        d.exit.tick_shadows(d.store.one("SELECT * FROM positions WHERE id=?", (p["id"],)), 0.0021, int(d.clock()))
        rows = {r["plan"]: r["ret"] for r in d.store.q("SELECT * FROM shadow_results")}
        self.assertAlmostEqual(rows["playbook: TP 2x, stop -50%"], 2 * 0.955 - 1, places=3)
        import report as RP
        self.assertIn("verdict = watch", RP.strategy(d))   # no holder history yet: "not yet"


class DossierTests(unittest.TestCase):
    def test_gaps_are_written_missing(self):
        d = make_desk()
        lead = dict(id=7, mint=MINT, symbol="TEST", reason="r", risk=dict(status="pass", checks=[], facts=dict(holders=900)),
                    whale=None)
        dos = SE.build_dossier(lead, [pair()], d.store, d.cfg, 1000, int(d.clock()))
        self.assertEqual(dos["holders"]["one_hour_ago"], "missing")
        self.assertEqual(dos["holders"]["growth_1h_pct"], "missing")
        self.assertEqual(dos["social"]["mentions_per_hour_now"], "missing")
        self.assertEqual(dos["lead_id"], "#007")
        d.store.snap(MINT, d.clock() - 3500, price=0.0008, holders=600)
        dos = SE.build_dossier(lead, [pair()], d.store, d.cfg, 1000, int(d.clock()))
        self.assertEqual(dos["holders"]["growth_1h_pct"], 50.0)
        self.assertEqual(dos["price"]["change_same_hour_pct"], 25.0)

    def test_candles_fill_the_60m_high_for_new_leads(self):
        d = make_desk()
        lead = dict(id=8, mint=MINT, symbol="TEST", reason="r", risk=dict(status="pass", checks=[], facts={}), whale=None)
        now = int(d.clock())
        candles = [[now - 3600 + 60 * i, 0.001, 0.0013, 0.0009, 0.00125 if i == 20 else 0.001, 2000] for i in range(60)]
        dos = SE.build_dossier(lead, [pair(price=0.001)], d.store, d.cfg, 1000, now, candles)
        self.assertEqual(dos["price"]["below_60m_high_pct"], 20.0)   # body high 0.00125, not the 0.0013 wick
        self.assertEqual(dos["price"]["vol_30m_usd"], 60000)
        dos = SE.build_dossier(lead, [pair(price=0.001)], d.store, d.cfg, 1000, now, None)
        self.assertEqual(dos["price"]["below_60m_high_pct"], "missing")

    def test_judge_seat_never_sees_dead(self):
        d = make_desk()
        lid = seed_lead(d, risk="dead")
        SE.JudgeSeat(d).run(lid)
        self.assertIsNone(d.store.lead(lid).get("verdict_ts"))  # no verdict written for a RISK-dead lead

    def test_terminal_renders(self):
        d = make_desk()
        d.store.record_equity()
        lines = tui.render(d, 120, 40)
        self.assertEqual(len(lines), 40)
        self.assertIn("TRENCH DESK", lines[0][0])


if __name__ == "__main__":
    unittest.main()
