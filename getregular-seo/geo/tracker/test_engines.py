"""Parser tests with canned responses shaped like each provider's docs (2026-10-20).
Run: python3 -m unittest -v test_engines"""

import os
import unittest
from unittest import mock

import run_panel

STORE = "https://apps.apple.com/us/app/get-regular-ai-gut-health/id6749188690"

OPENAI = {"output": [
    {"type": "web_search_call", "action": {"sources": [{"url": STORE, "title": "App Store"},
                                                      {"url": "https://bowelle.app", "title": "Bowelle"}]}},
    {"type": "message", "content": [{"type": "output_text", "text": "Try Get Regular or Bowelle.",
                                     "annotations": [{"type": "url_citation", "url": STORE, "title": "App Store"}]}]},
]}
PERPLEXITY = {"output": [
    {"type": "search_results", "results": [{"id": 1, "url": STORE, "title": "App Store"},
                                           {"id": 2, "url": "https://plopdiary.com", "title": "Plop"}]},
    {"type": "message", "content": [{"type": "output_text", "text": "Get Regular logs stool [1]."}]},
]}
GEMINI = {"candidates": [{"content": {"parts": [{"text": "Use mySymptoms."}]},
                          "groundingMetadata": {
                              "groundingChunks": [{"web": {"uri": "https://vertexaisearch.cloud.google.com/x", "title": "healthline.com"}},
                                                  {"web": {"uri": "https://vertexaisearch.cloud.google.com/y", "title": "reddit.com"}}],
                              "groundingSupports": [{"groundingChunkIndices": [0]}]}}]}


class Parsers(unittest.TestCase):
    def run_with(self, fn, payload, key):
        with mock.patch.dict(os.environ, {key: "k"}), mock.patch.object(run_panel, "post", return_value=payload), \
                mock.patch.object(run_panel.time, "sleep"):
            return fn("q")

    def test_openai(self):
        _, text, cited, retrieved = self.run_with(run_panel.run_openai, OPENAI, "OPENAI_API_KEY")
        self.assertEqual(text, "Try Get Regular or Bowelle.")
        self.assertEqual([c["url"] for c in cited], [STORE])
        self.assertEqual(len(retrieved), 2)

    def test_perplexity_marker_maps_to_result(self):
        _, text, cited, retrieved = self.run_with(run_panel.run_perplexity, PERPLEXITY, "PERPLEXITY_API_KEY")
        self.assertEqual([c["url"] for c in cited], [STORE])
        self.assertEqual(len(retrieved), 2)

    def test_gemini_uses_domain_titles(self):
        _, text, cited, retrieved = self.run_with(run_panel.run_gemini, GEMINI, "GEMINI_API_KEY")
        self.assertEqual(text, "Use mySymptoms.")
        self.assertEqual([c["url"] for c in cited], ["https://healthline.com"])
        self.assertEqual(len(retrieved), 2)


if __name__ == "__main__":
    unittest.main()
