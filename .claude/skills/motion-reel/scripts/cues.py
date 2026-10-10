"""Build cues.json for sfx.mjs from timeline.json, so every visual event has a sound on the same frame.
Usage: python3 -I cues.py timeline.json cues.json [lang] [variant]
Reads events.clicks / pops / thumps / whooshes (times), events.typing ([[t0, t1, copyKey], ...]), keys (morph films:
pop on settle, thump on ink change, whoosh before big size changes) and scenes (scene films: thump on a hard cut,
whoosh into a soft transition, pop as content lands)."""
import json
import sys

def merge(a, b):
    if not isinstance(b, dict): return b
    o = dict(a or {})
    for k, v in b.items(): o[k] = merge(o.get(k), v)
    return o


tl = json.load(open(sys.argv[1]))
lang = sys.argv[3] if len(sys.argv) > 3 else (tl.get('langs') or ['en'])[0]
if len(sys.argv) > 4: tl = merge(tl, tl['variants'][sys.argv[4]])
E, K, C = tl.get('events', {}), tl.get('keys', []), tl.get('copy', {}).get(lang, {})
cues = []
add = lambda t, k, g=1.0: cues.append({'t': round(t, 3), 'type': k, 'gain': g})
for t in E.get('clicks', []): add(t, 'click', 1.0)
for t in E.get('pops', []): add(t, 'pop', .8)
for t in E.get('thumps', []): add(t, 'thump', .9)
for t in E.get('whooshes', []): add(t - .05, 'whoosh', 1.0)          # whoosh peaks slightly after its start
for a, b, key in E.get('typing', []):                                 # keystrokes: ~24 audible ticks max per string
    n = max(1, len(C.get(key, key))); step = max(1, n // 24)
    for i in range(0, n, step): add(a + (b - a) * i / n, 'click', .35)
prev = None
for k in K:
    if prev is not None:
        big = abs(k.get('w', 0) - prev.get('w', 0)) > 300 or abs(k.get('h', 0) - prev.get('h', 0)) > 300
        if k.get('ink') != prev.get('ink'): add(k['t'], 'thump', .9)
        if big: add(k['t'] - .05, 'whoosh', 1.0)
    add(k['t'] + .1, 'pop', .6)
    prev = k
hard = set(tl.get('hardCuts', []))
for sc in tl.get('scenes', [])[1:]:
    if sc['t'] in hard: add(sc['t'], 'thump', 1.0)
    else: add(sc['t'] - .05, 'whoosh', .9)
    add(sc['t'] + .12, 'pop', .6)
cues = [c for c in cues if c['t'] >= 0]
cues.sort(key=lambda c: c['t'])
json.dump(cues, open(sys.argv[2], 'w'), indent=0)
print(len(cues), 'cues ->', sys.argv[2])
