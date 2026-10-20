# GEO tracker: real AI answers for the prompt panel

Runs `geo/ai-prompt-panel.csv` against ChatGPT (OpenAI Responses API), Perplexity (Agent API), Gemini (Google Search grounding) and Claude (web search tool), with live web search and US location. Each answer is scored with the rubric in `geo/geo-aeo-strategy.md` §8.4.

```bash
cd getregular-seo/geo/tracker
python3 -m unittest test_score test_engines      # offline, no keys
python3 run_panel.py --dry-run                   # whole pipeline on fixture answers
export OPENAI_API_KEY=... PERPLEXITY_API_KEY=... GEMINI_API_KEY=... ANTHROPIC_API_KEY=...
pip install anthropic                            # only for the Claude engine
python3 run_panel.py                             # every engine with a key; 47 prompts
python3 run_panel.py --engines openai --cluster brand   # branded fact checks only
```

Output goes to `runs/<date>/`: `results.csv` (one row per prompt × engine), `summary.md` (coverage with numerators and denominators, top competitors, top cited domains, critical-error flags) and `raw/<engine>/<n>.json` (answer, cited and retrieved URLs, full API response).

| Column | Meaning |
|---|---|
| `mention` | Get Regular named (the getregulars.com collision and "get regular exercise" prose are excluded) |
| `recommendation_level` | 0 absent · 1 listed · 2 recommended for a use case · 3 top pick (heuristic) |
| `rank_position` | Order among the apps named |
| `owned_citation` / `store_citation` | Cites getregular.com / the App Store listing (id6749188690) |
| `third_party_citation` | A cited non-owned page whose title or snippet names us: an earned mention |
| `retrieved_owned_or_store` | Our pages were retrieved but not necessarily cited |
| `accuracy_errors` | Android, FDA, "clinically validated", diagnosis or wrong-price claims about Get Regular |

**Caveats:**
- API answers are a benchmark, not consumer-app output.
- Gemini gives only source domains.
- Error flags are regex-based, so read the raw answer before acting.
- Run the baseline 3 times on different days.
- Model IDs and API shapes were checked against provider docs on 2026-10-20. Override models with `OPENAI_MODEL`, `GEMINI_MODEL`, `CLAUDE_MODEL` and `PERPLEXITY_PRESET`.
