"""Run the GEO prompt panel against real AI engines with live web search.

Replaces the 19 Oct web-search *proxy* with actual engine answers. For each
prompt in geo/ai-prompt-panel.csv and each engine whose API key is set, it
saves the raw response, extracts answer text plus cited and retrieved URLs,
scores it with score.py (rubric: geo-aeo-strategy.md §8.4) and writes:

  runs/<date>/raw/<engine>/<n>.json   raw API responses (evidence)
  runs/<date>/results.csv             one scored row per prompt x engine
  runs/<date>/summary.md              coverage with numerators/denominators

API answers are a benchmark, not what a logged-out consumer sees in the
ChatGPT / Gemini apps or Google AI Overviews (§8.2: keep them separate).
Use them for trend and accuracy, and keep the manual surface checks.

Usage:
  python3 run_panel.py                         # every engine with a key set
  python3 run_panel.py --engines claude,openai --limit 5
  python3 run_panel.py --dry-run               # offline, fixture answers

Keys: OPENAI_API_KEY, PERPLEXITY_API_KEY, GEMINI_API_KEY, ANTHROPIC_API_KEY.
The Claude engine needs `pip install anthropic`; the others use the stdlib.
Model overrides: OPENAI_MODEL, GEMINI_MODEL, CLAUDE_MODEL, PERPLEXITY_PRESET.
API shapes were checked against each provider's docs on 2026-10-20.
"""

import argparse
import collections
import csv
import datetime as dt
import json
import os
import pathlib
import sys
import time
import urllib.error
import urllib.request

from score import score, host

HERE = pathlib.Path(__file__).resolve().parent
PANEL = HERE.parent / "ai-prompt-panel.csv"

OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-6-luna")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.8-flash")
CLAUDE_MODEL = os.environ.get("CLAUDE_MODEL", "claude-opus-5-5")
PERPLEXITY_PRESET = os.environ.get("PERPLEXITY_PRESET", "fast")


def post(url, body, headers, tries=4):
    data = json.dumps(body).encode()
    for attempt in range(tries):
        req = urllib.request.Request(url, data=data, method="POST",
                                     headers={"Content-Type": "application/json", **headers})
        try:
            with urllib.request.urlopen(req, timeout=180) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503, 504) and attempt < tries - 1:
                time.sleep(2 ** (attempt + 1))
                continue
            raise RuntimeError(f"HTTP {e.code}: {e.read()[:300]!r}") from None


# Each engine returns (raw, answer_text, cited[{url,title}], retrieved[{url,title}]).

def run_openai(prompt):
    raw = post("https://api.openai.com/v1/responses", {
        "model": OPENAI_MODEL,
        "input": prompt,
        "tools": [{"type": "web_search", "user_location": {"type": "approximate", "country": "US"}}],
        "include": ["web_search_call.action.sources"],
    }, {"Authorization": "Bearer " + os.environ["OPENAI_API_KEY"]})
    text, cited, retrieved = [], [], []
    for item in raw.get("output", []):
        if item.get("type") == "message":
            for c in item.get("content", []):
                text.append(c.get("text", ""))
                cited += [{"url": a.get("url", ""), "title": a.get("title", "")}
                          for a in c.get("annotations", []) if a.get("type") == "url_citation"]
        elif item.get("type") == "web_search_call":
            for s in (item.get("action") or {}).get("sources") or []:
                retrieved.append({"url": s.get("url", ""), "title": s.get("title", "")})
    return raw, "\n".join(text), cited, retrieved


def run_perplexity(prompt):
    # Sonar chat completions were retired 27 Sep 2026; the Agent API replaces it.
    raw = post("https://api.perplexity.ai/v1/agent", {
        "preset": PERPLEXITY_PRESET,
        "input": prompt,
        "tools": [{"type": "web_search", "user_location": {"country": "US"}}],
    }, {"Authorization": "Bearer " + os.environ["PERPLEXITY_API_KEY"]})
    text, results = [], []
    for item in raw.get("output", []):
        if item.get("type") == "message":
            text += [c.get("text", "") for c in item.get("content", []) if c.get("type") == "output_text"]
        elif item.get("type") == "search_results":
            results += [{"url": r.get("url", ""), "title": r.get("title", ""), "id": r.get("id")}
                        for r in item.get("results", [])]
    answer = "\n".join(text)
    # A result counts as cited when the answer carries its [n] marker.
    cited = [r for r in results if r.get("id") is not None and f"[{r['id']}]" in answer]
    time.sleep(1.1)  # Tier 0 allows 1 request/second
    return raw, answer, cited, results


def run_gemini(prompt):
    raw = post(f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent", {
        "contents": [{"parts": [{"text": prompt}]}],
        "tools": [{"google_search": {}}],
    }, {"x-goog-api-key": os.environ["GEMINI_API_KEY"]})
    cand = (raw.get("candidates") or [{}])[0]
    answer = "".join(p.get("text", "") for p in (cand.get("content") or {}).get("parts", []))
    meta = cand.get("groundingMetadata") or {}
    # chunk.web.uri is a vertexaisearch redirect and chunk.web.title is the
    # source domain, so the domain is all we can score. App Store listing IDs
    # are lost: store_citation is under-counted for Gemini.
    chunks = [{"url": "https://" + (c.get("web") or {}).get("title", ""),
               "title": (c.get("web") or {}).get("title", ""),
               "redirect": (c.get("web") or {}).get("uri", "")}
              for c in meta.get("groundingChunks", [])]
    used = {i for s in meta.get("groundingSupports", []) for i in s.get("groundingChunkIndices", [])}
    cited = [c for i, c in enumerate(chunks) if i in used]
    return raw, answer, cited, chunks


def run_claude(prompt):
    import anthropic  # only needed for this engine

    client = anthropic.Anthropic()
    messages = [{"role": "user", "content": prompt}]
    for _ in range(4):  # resume server-side pause_turn
        resp = client.beta.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=16000,
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",
            tools=[{"type": "web_search_20260209", "name": "web_search", "max_uses": 5,
                    "user_location": {"type": "approximate", "country": "US"}}],
            messages=messages,
        )
        if resp.stop_reason != "pause_turn":
            break
        messages = [messages[0], {"role": "assistant", "content": resp.content}]
    raw = resp.model_dump(mode="json")
    if raw.get("stop_reason") == "refusal":
        return raw, "", [], []
    text, cited, retrieved = [], [], []
    for b in raw.get("content", []):
        if b.get("type") == "text":
            text.append(b.get("text", ""))
            cited += [{"url": c.get("url", ""), "title": c.get("title", "")}
                      for c in b.get("citations") or [] if c.get("type") == "web_search_result_location"]
        elif b.get("type") == "web_search_tool_result" and isinstance(b.get("content"), list):
            retrieved += [{"url": r.get("url", ""), "title": r.get("title", "")} for r in b["content"]]
    return raw, "".join(text), cited, retrieved


ENGINES = {
    "openai": ("OPENAI_API_KEY", run_openai),
    "perplexity": ("PERPLEXITY_API_KEY", run_perplexity),
    "gemini": ("GEMINI_API_KEY", run_gemini),
    "claude": ("ANTHROPIC_API_KEY", run_claude),
}


def run_fixture(prompt):
    """Offline stand-in so the pipeline can be checked without keys."""
    answer = ("Popular options are Bowelle, mySymptoms and Get Regular, which logs stool on the "
              "Bristol scale and is available on Android.") if "poop" in prompt.lower() else \
             "Most people use mySymptoms or Cara Care."
    cites = [{"url": "https://apps.apple.com/us/app/get-regular-ai-gut-health/id6749188690", "title": "Get Regular"},
             {"url": "https://www.balloonguthealth.com/blog/best-apps", "title": "Best gut apps"}]
    return {"fixture": True}, answer, cites, cites


def unique(urls):
    return list(dict.fromkeys(u for u in urls if u))


def pct(n, d):
    return f"{n}/{d} ({100 * n / d:.0f}%)" if d else "0/0"


def summarize(rows):
    out = ["| Engine | Answered | Mentioned | Recommended (level ≥2) | Owned cited | Store cited | 3rd-party cited | Critical errors |",
           "|---|---|---|---|---|---|---|---|"]
    by = collections.defaultdict(list)
    for r in rows:
        by[r["engine"]].append(r)
    for eng, rs in sorted(by.items()):
        ok = [r for r in rs if not r["error"]]
        d = len(ok)
        out.append("| {} | {} | {} | {} | {} | {} | {} | {} |".format(
            eng, f"{d}/{len(rs)}",
            pct(sum(int(r["mention"]) for r in ok), d),
            pct(sum(int(r["recommendation_level"]) >= 2 for r in ok), d),
            pct(sum(int(r["owned_citation"]) for r in ok), d),
            pct(sum(int(r["store_citation"]) for r in ok), d),
            pct(sum(int(r["third_party_citation"]) for r in ok), d),
            sum(bool(r["accuracy_errors"]) for r in ok)))
    neutral = [r for r in rows if not r["error"] and not r["cluster"] == "brand"]
    out += ["", f"Neutral (non-brand) prompts with a mention, all engines: "
                f"{pct(sum(int(r['mention']) for r in neutral), len(neutral))}"]
    comp = collections.Counter(c for r in neutral for c in r["competitors"].split(";") if c)
    dom = collections.Counter(d for r in neutral for d in set(r["cited_domains"].split(";")) if d)
    out += ["", "Top competitors named (non-brand answers): " + ", ".join(f"{k} {v}" for k, v in comp.most_common(10)),
            "", "Top cited domains (answers citing them, non-brand): " + ", ".join(f"{k} {v}" for k, v in dom.most_common(10))]
    errs = [r for r in rows if r["accuracy_errors"]]
    if errs:
        out += ["", "## Critical-error flags (verify by reading the raw answer; the rubric is regex-based)", ""]
        out += [f"- {r['engine']} · \"{r['prompt']}\" → {r['accuracy_errors']} (raw/{r['engine']}/{r['n']}.json)" for r in errs]
    return "\n".join(out) + "\n"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--engines", default="", help="comma list; default = every engine with a key")
    ap.add_argument("--limit", type=int, default=0, help="first N prompts only")
    ap.add_argument("--cluster", default="", help="only prompts in this cluster")
    ap.add_argument("--out", default="")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    prompts = list(csv.DictReader(open(PANEL, newline="", encoding="utf-8")))
    if a.cluster:
        prompts = [p for p in prompts if p["cluster"] == a.cluster]
    if a.limit:
        prompts = prompts[: a.limit]

    if a.dry_run:
        engines = {"fixture": run_fixture}
    else:
        wanted = a.engines.split(",") if a.engines else list(ENGINES)
        engines = {e: ENGINES[e][1] for e in wanted if os.environ.get(ENGINES[e][0])}
        missing = [e for e in wanted if e not in engines]
        if missing:
            print("skipping (no key):", ", ".join(missing), file=sys.stderr)
        if not engines:
            sys.exit("No engine keys set. Export a key or use --dry-run.")

    stamp = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d")
    out = pathlib.Path(a.out) if a.out else HERE / "runs" / (stamp + ("-dry" if a.dry_run else ""))
    rows = []
    for eng, fn in engines.items():
        (out / "raw" / eng).mkdir(parents=True, exist_ok=True)
        for n, p in enumerate(prompts, 1):
            row = {"date": stamp, "engine": eng, "n": n, "prompt": p["prompt"], "cluster": p["cluster"],
                   "intent": p["intent"], "target_page": p["target_page"], "error": ""}
            try:
                raw, answer, cited, retrieved = fn(p["prompt"])
                (out / "raw" / eng / f"{n}.json").write_text(json.dumps(
                    {"prompt": p["prompt"], "answer": answer, "cited": cited, "retrieved": retrieved, "raw": raw},
                    indent=1, ensure_ascii=False))
                row.update(score(answer, cited))
                row["retrieved_domains"] = ";".join(unique(host(r["url"]) for r in retrieved))
                row["retrieved_owned_or_store"] = int(any(
                    host(r["url"]).endswith("getregular.com") or "id6749188690" in r["url"] for r in retrieved))
                row["answer_chars"] = len(answer)
                if not answer:
                    row["error"] = "empty answer (refusal or no text)"
            except Exception as e:  # keep going; one failed call shouldn't sink the run
                row["error"] = str(e)[:300]
            rows.append(row)
            print(f"{eng:10} {n:>2}/{len(prompts)} mention={row.get('mention', '-')} {row['error'][:60]}",
                  file=sys.stderr)

    fields = ["date", "engine", "n", "cluster", "intent", "prompt", "mention", "recommendation_level",
              "rank_position", "owned_citation", "owned_urls", "store_citation", "third_party_citation",
              "third_party_urls", "retrieved_owned_or_store", "competitors", "cited_domains",
              "retrieved_domains", "accuracy_errors", "answer_chars", "target_page", "error"]
    with open(out / "results.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)
    models = f"openai={OPENAI_MODEL}, gemini={GEMINI_MODEL}, claude={CLAUDE_MODEL}, perplexity preset={PERPLEXITY_PRESET}"
    (out / "summary.md").write_text(f"# GEO panel run {stamp}\n\nPrompts: {len(prompts)} · Engines: "
                                    f"{', '.join(engines)} · Models: {models}\n\n" + summarize(rows))
    print(f"wrote {out}/results.csv and summary.md", file=sys.stderr)


if __name__ == "__main__":
    main()
