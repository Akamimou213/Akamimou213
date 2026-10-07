"""Build cues.json for sfx.mjs from timeline.json: every click, keystroke, morph and expansion of the one shape."""
import json, sys
tl = json.load(open(sys.argv[1])); E, K, C = tl['events'], tl['keys'], tl['copy']
cues = []
add = lambda t, k, g=1.0: cues.append({'t': round(t, 3), 'type': k, 'gain': g})
for c in E['clicks']: add(c, 'click', 1.0)
add(E['dragDown'], 'click', .8); add(E['dragUp'], 'pop', 1.0); add(E['count'], 'pop', .7)
for (a, b), text in ((E['typing1'], C['question']), (E['typing2'], C['query'])):
    n = len(text); step = max(1, n // 24)
    for i in range(0, n, step): add(a + (b - a) * i / n, 'click', .35)
prev = None
for k in K:
    big = prev and (abs(k['w'] - prev['w']) > 300 or abs(k['h'] - prev['h']) > 300)
    if k['ink'] != (prev or k)['ink'] or k['t'] in (0.0,): add(k['t'], 'thump', .9)
    if big: add(k['t'] - .05, 'whoosh', 1.0)
    add(k['t'] + .1, 'pop', .6)
    prev = k
add(E['check'], 'pop', 1.0)
for p in E['pinPulse']: add(p, 'pop', .8)
for i in range(6): add(E['clinicPops'][0] + i * .15, 'pop', .25)
for t in E['tab'][1:]: add(t + .05, 'pop', .6)
add(E['url'][0], 'pop', .6)
cues.sort(key=lambda c: c['t'])
json.dump(cues, open(sys.argv[2], 'w'), indent=0)
print(len(cues), 'cues')
