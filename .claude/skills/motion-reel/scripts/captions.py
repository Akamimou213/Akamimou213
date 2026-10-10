"""Group word timings into caption cards, write them into timeline.json and export an SRT.
  python3 -I captions.py timeline.json out/words.en.json en [--srt out/<name>-en.srt] [--dry]
Cards break on a pause >= 0.5 s, at 6 words, at 2.5 s, or when two lines of ~38 characters are full. Each card stays
>= 0.7 s (stretched into the gap after it when possible) and ends 0.6 s after its last word or 0.05 s before the next card.
Reading speed above 17 characters/s is flagged. The engine burns the cards in (spoken word lights on its start frame);
the SRT goes to the platform as a separate file, and a clean master renders with CAPTIONS=0."""
import argparse
import json

ap = argparse.ArgumentParser()
ap.add_argument('timeline'); ap.add_argument('words'); ap.add_argument('lang')
ap.add_argument('--srt'); ap.add_argument('--dry', action='store_true', help="print the cards, don't write timeline.json")
ap.add_argument('--chars', type=int, default=38, help='characters per line (2 lines per card)')
args = ap.parse_args()

W = [w for w in json.load(open(args.words, encoding='utf-8')) if w['w'].strip()]
cards, cur = [], []
for i, w in enumerate(W):
    if cur:
        text = ' '.join(x['w'] for x in cur + [w])
        if (w['t0'] - cur[-1]['t1'] >= .5 or len(cur) >= 6 or w['t1'] - cur[0]['t0'] > 2.5 or len(text) > 2 * args.chars):
            cards.append(cur); cur = []
    cur.append(w)
if cur: cards.append(cur)

out = []
for i, c in enumerate(cards):
    nxt = cards[i + 1][0]['t0'] - .08 if i + 1 < len(cards) else float('inf')
    t0 = c[0]['t0']; t1 = min(nxt - .05, c[-1]['t1'] + .6)
    if t1 - t0 < .7: t1 = min(nxt - .05, t0 + .7)
    out.append({'t0': round(t0, 3), 't1': round(t1, 3), 'words': [{'w': w['w'], 't0': w['t0'], 't1': w['t1']} for w in c]})

warn = []
for c in out:
    text = ' '.join(w['w'] for w in c['words']); cps = len(text) / max(.01, c['t1'] - c['t0'])
    if cps > 17: warn.append(f"{c['t0']:.2f}s {cps:.0f} chars/s (> 17): \"{text}\"")
    if c['t1'] - c['t0'] < .7: warn.append(f"{c['t0']:.2f}s on screen {c['t1'] - c['t0']:.2f}s (< 0.7 s): \"{text}\"")

if args.srt:
    ts = lambda t: f'{int(t // 3600):02}:{int(t % 3600 // 60):02}:{int(t % 60):02},{int(round(t % 1 * 1000)) % 1000:03}'
    with open(args.srt, 'w', encoding='utf-8') as f:
        for k, c in enumerate(out, 1): f.write(f"{k}\n{ts(c['t0'])} --> {ts(c['t1'])}\n{' '.join(w['w'] for w in c['words'])}\n\n")

if args.dry:
    for c in out: print(f"{c['t0']:6.2f}-{c['t1']:6.2f}  {' '.join(w['w'] for w in c['words'])}")
else:
    tl = json.load(open(args.timeline, encoding='utf-8'))
    tl.setdefault('captions', {})[args.lang] = out
    json.dump(tl, open(args.timeline, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print(f"{len(out)} cards for {args.lang}" + ('' if args.dry else f' -> {args.timeline}') + (f', SRT -> {args.srt}' if args.srt else ''))
for x in warn: print('  ' + x)
