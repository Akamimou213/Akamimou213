#!/usr/bin/env python3
"""Split one supplied voice-over take (e.g. an ElevenLabs export) into one file per script line, cut at real silences.
   usage: python3 -I split_take.py <piece dir> [--after s] [--tail s]
   needs: <piece>/voice/script.json (lines with ids and text), <piece>/voice/elevenlabs/take.wav (48 kHz mono) and
          <piece>/voice/elevenlabs/words.json (word times from animate/tools/voice_words.py).
   writes: <piece>/voice/<id>.wav per line; sets each line's "after" pause (the take already breathes) and the tail.
   Then run animate/tools/voice.mjs <piece> to place the lines and re-time the piece.
How: the script's words are aligned to the heard words (numbers and spellings normalised, so "4 p.m." matches "four p.m."),
each line's first and last heard word bound it, and every cut moves to the quietest 10 ms in the gap between two lines."""
import difflib, json, re, sys
from pathlib import Path
import numpy as np, soundfile as sf

NUM = {'0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine',
       '10': 'ten', '11': 'eleven', '12': 'twelve', '20': 'twenty', '48': 'fortyeight', '100': 'hundred', '300': 'hundred', '400': 'hundred'}
ALIAS = {'to': 'two', 'for': 'four', 'rise': 'ryze', 'timestamp': 'time'}

def norm(w):
    w = re.sub(r"[^a-z0-9']", '', w.lower())
    return NUM.get(w, w)

def main():
    args = sys.argv[1:]
    root = Path(args[0]); after = float(args[args.index('--after') + 1]) if '--after' in args else 0.3
    tail = float(args[args.index('--tail') + 1]) if '--tail' in args else 3.4
    S = json.loads((root / 'voice/script.json').read_text()); W = json.loads((root / 'voice/elevenlabs/words.json').read_text())
    x, sr = sf.read(root / 'voice/elevenlabs/take.wav'); x = x if x.ndim == 1 else x.mean(1)
    hop = int(sr * 0.01); rms = np.sqrt(np.convolve(x ** 2, np.ones(hop * 3) / (hop * 3), 'same'))[::hop]
    heard = [norm(w['w']) for w in W]
    script, owner = [], []
    for li, l in enumerate(S['lines']):
        for t in re.sub(r'-', ' ', l['text']).split(): script.append(norm(t)); owner.append(li)
    heard = [ALIAS.get(h, h) if ALIAS.get(h) in script else h for h in heard]
    m = difflib.SequenceMatcher(a=script, b=heard, autojunk=False); s2h = {}
    for b in m.get_matching_blocks():
        for k in range(b.size): s2h[b.a + k] = b.b + k
    bounds = []
    for li in range(len(S['lines'])):
        hit = [s2h[i] for i, o in enumerate(owner) if o == li and i in s2h]
        if not hit: sys.exit(f"line {S['lines'][li]['id']}: no words matched; check the take")
        bounds.append((W[min(hit)]['t0'], W[max(hit)]['t1']))
    cuts = [0.0]
    for k in range(len(bounds) - 1):
        a, b = bounds[k][1] - 0.25, bounds[k + 1][0] + 0.35
        i0, i1 = max(0, int(a * 100)), min(len(rms), int(b * 100))
        cuts.append((i0 + int(np.argmin(rms[i0:i1]))) / 100 if i1 > i0 else (bounds[k][1] + bounds[k + 1][0]) / 2)
    cuts.append(len(x) / sr)
    for k, l in enumerate(S['lines']):
        seg = x[int(cuts[k] * sr):int(cuts[k + 1] * sr)]
        sf.write(root / 'voice' / f"{l['id']}.wav", seg, sr)
        l['after'] = 0 if k == len(S['lines']) - 1 else min(l.get('after', after), after if l.get('after', 0) < 0.6 else 0.7)
    S['tail'] = tail
    (root / 'voice/script.json').write_text(json.dumps(S, indent=2))
    print('cuts', [round(c, 2) for c in cuts])

if __name__ == '__main__':
    main()
