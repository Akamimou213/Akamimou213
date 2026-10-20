"""Offline tests for the scoring rubric. Run: python3 -m unittest -v test_score"""

import unittest

from score import score, mentions_brand, accuracy_errors

STORE = "https://apps.apple.com/us/app/get-regular-ai-gut-health/id6749188690"


class Mention(unittest.TestCase):
    def test_brand(self):
        self.assertTrue(mentions_brand("Try Get Regular for stool logs."))
        self.assertTrue(mentions_brand("see getregular.com"))

    def test_collision_and_prose(self):
        self.assertFalse(mentions_brand("Regulars (getregulars.com) is a loyalty tool."))
        self.assertFalse(mentions_brand("Try to get regular exercise and sleep."))


class Scoring(unittest.TestCase):
    def test_absent(self):
        r = score("Top picks: Bowelle, mySymptoms and Cara Care.", [{"url": "https://bowelle.app"}])
        self.assertEqual(r["mention"], 0)
        self.assertEqual(r["recommendation_level"], 0)
        self.assertEqual(r["competitors"], "Bowelle;mySymptoms;Cara Care")

    def test_listed_with_store_citation(self):
        ans = "Options include Bowelle, Plop and Get Regular, which logs meals and stool."
        r = score(ans, [{"url": STORE}, {"url": "https://www.getregular.com/app"}])
        self.assertEqual((r["mention"], r["rank_position"], r["recommendation_level"]), (1, 3, 1))
        self.assertEqual((r["store_citation"], r["owned_citation"]), (1, 1))
        self.assertEqual(r["cited_domains"], "apps.apple.com;getregular.com")

    def test_top_pick(self):
        r = score("Get Regular is the best pick for doctor-ready PDF reports. Bowelle is simpler.", [])
        self.assertEqual(r["recommendation_level"], 3)

    def test_third_party(self):
        cites = [{"url": "https://mygoodgut.com/apps", "title": "Best gut apps incl. Get Regular"}]
        r = score("Get Regular is good for food tracking.", cites)
        self.assertEqual(r["third_party_citation"], 1)

    def test_plop_generic_word(self):
        r = score("Things go plop. Use Bowelle.", [])
        self.assertEqual(r["competitors"], "Bowelle")


class Accuracy(unittest.TestCase):
    def test_android_error(self):
        self.assertIn("android", accuracy_errors("Get Regular is available on Android and iOS."))

    def test_android_correct(self):
        self.assertEqual(accuracy_errors("Get Regular is iOS-only; it is not available on Android."), [])

    def test_claims(self):
        e = accuracy_errors("Get Regular is clinically validated and FDA-approved.")
        self.assertIn("clinically_validated", e)
        self.assertIn("fda", e)

    def test_price(self):
        self.assertEqual(accuracy_errors("Get Regular costs $12.99 a month or $99.99 a year."), [])
        self.assertIn("price:$9.99", accuracy_errors("Get Regular costs $9.99 a month."))

    def test_only_brand_sentences(self):
        self.assertEqual(accuracy_errors("Bowelle is on Android. Get Regular logs stool."), [])


if __name__ == "__main__":
    unittest.main()
