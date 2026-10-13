"""Place real CC0 recordings on the picture's own timing. No synthesized hits, clicks or whooshes.

Every cue time comes from timeline.json (acts, services, steps), the same numbers index.html animates from.
Transients are peak-aligned one frame before the picture event (sound may lead by 2-3 frames, never trail).
Risers and reverses end on their cue. Sources: Kenney packs (CC0) and Freesound recordings (CC0), downloaded
by hand into audio/raw/ (see CREDITS.md). One sonic family: glass + plastic UI + paper/cards, with a sub hit
on the two hero moments (the iris and "SUBSCRIBERS DO.").

Usage: python3 -I sound/place.py timeline.json audio/raw out/sfx.wav out/cues.json
"""
import json
import subprocess
import sys

import numpy as np
import soundfile as sf

SR = 48000
tl_path, raw, out_wav, out_json = sys.argv[1:5]
TL = json.load(open(tl_path)); A = TL['acts']; C = TL['copy']['en']; DUR = TL['duration']
FRAME = 1 / TL.get('fps', 60)

K = lambda pack, name: f'{raw}/kenney/{pack}/{name}.ogg'
FS = lambda typ, i: f'{raw}/fs/{typ}-{i}.mp3'
_cache = {}


def load(path):
    if path not in _cache:
        pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                             capture_output=True, check=True).stdout
        x = np.frombuffer(pcm, np.float32).astype(np.float64)
        # trim leading silence (below -50 dB of the peak) so peak alignment is about the sound, not the file
        thr = np.max(np.abs(x)) * 10 ** (-50 / 20); i0 = int(np.argmax(np.abs(x) > thr))
        x = x[max(0, i0 - int(.002 * SR)):]
        _cache[path] = x / (np.max(np.abs(x)) + 1e-12)
    return _cache[path]


mix = np.zeros((int(SR * (DUR + 3)), 2)); cues = []


def place(t, path, db=-12., pan=0., mode='peak', note=''):
    """mode peak: the attack (envelope at 30 % of its peak) lands one frame before t, so the hit reads on the frame.
    end: the sound's peak lands on t (risers, reverses)."""
    x = load(path); env = np.convolve(np.abs(x), np.ones(96) / 96, 'same'); pk = int(np.argmax(env))
    if mode == 'peak':
        att = int(np.argmax(env[:pk + 1] >= .3 * env[pk])); start = t - FRAME - att / SR
    else:
        start = t - pk / SR
    if start < 0: x = x[int(-start * SR):]; start = 0
    a = (pan + 1) * np.pi / 4; g = 10 ** (db / 20) * np.sqrt(2)
    i = int(round(start * SR)); seg = x[:len(mix) - i]
    mix[i:i + len(seg), 0] += seg * np.cos(a) * g; mix[i:i + len(seg), 1] += seg * np.sin(a) * g
    cues.append(dict(t=round(t, 3), file=path.split('/raw/')[-1], db=db, pan=round(pan, 2), mode=mode, note=note))


pan_stage = lambda i: -.45 + .225 * i                                 # stage 0..4, left to right
pick = lambda opts, k: opts[k % len(opts)]                            # vary repeats

# ---- hook
place(A['hook2'], K('impact', 'impactPunch_heavy_001'), -9, 0, note='DON\'T PAY. lands')
place(A['hook2'], FS('boom', 535615), -16, 0, note='low body under the slam')
place(A['hookOut'] + .05, FS('swish', 388003), -17, .1, note='headline lifts away')
for i, t in enumerate(A['lay']):
    place(t, K('casino', pick(['chip-lay-1', 'chip-lay-2', 'chip-lay-3'], i)), -13, pan_stage(i), note=f'stage {C["stages"][i]} laid')
for j, t in enumerate(A['leaks']):
    place(t, K('interface', pick(['error_003', 'error_007', 'error_003'], j)), -15, pan_stage(j + 1), note=f'leak opens at {C["stages"][j + 1]}')
    place(t + .22, K('interface', pick(['drop_002', 'drop_003', 'drop_004'], j)), -21, pan_stage(j + 1), note='first users fall')
place(A['leakLine'], FS('whoosh', 30240), -20, 0, note='"More installs won\'t fix"')
# ---- quotes
for k, t in enumerate(A['quotes']):
    at = C['quotes'][k]['at']
    place(t, K('casino', pick(['card-place-1', 'card-place-2', 'card-place-3', 'card-place-4'], k)), -12, pan_stage(at) if at >= 0 else 0, note=f'quote {k + 1}')
place(A['quotesOut'], K('casino', 'card-shove-2'), -17, 0, note='cards clear')
# ---- the one paying user, the iris (hero 1), the logo
place(A['onePayer'], K('interface', 'glass_002'), -14, .45, note='one paying user')
place(A['iris'], FS('reverse', 503803), -15, 0, mode='end', note='suck-in into the iris')
place(A['iris'], FS('boom', 636624), -10, 0, note='HERO iris opens')
place(A['iris'], K('impact', 'impactGlass_heavy_002'), -15, 0, note='glass on the hit')
place(A['logo'] + .2, FS('shimmer', 462095), -18, 0, note='arrow draws')
place(A['logoOut'], FS('whoosh', 449992), -18, 0, note='logo returns to a dot')
# ---- the system
for i in range(5):
    place(A['rebuild'] + i * .07, K('casino', pick(['chip-lay-1', 'chip-lay-2', 'chip-lay-3'], i + 1)), -16, pan_stage(i), note='track rebuilt')
for k, t in enumerate(A['phases']):
    place(t, K('ui-audio', pick(['switch7', 'switch12', 'switch20'], k)), -14, 0, note=f'phase {k + 1}')
for k, t in enumerate(A['services']):
    place(t, K('rpg', pick(['cloth1', 'cloth2', 'cloth3', 'cloth4'], k)), -18, 0, note=f'service: {C["services"][k]["name"]}')
s = A['services']
place(s[0] + .1, K('casino', 'card-slide-2'), -18, -.4, note='tracking wire draws')
for i in range(4):
    place(s[0] + .55 + i * .16, K('interface', pick(['tick_001', 'tick_002', 'tick_004', 'click_001'], i)), -16, pan_stage(i + 1), note=f'event: {C["services"][0]["events"][i]}')
place(s[0] + 1.2, FS('whoosh', 30241), -21, 0, note='loop back to ad platforms')
for j, t in enumerate(TL['flow']['patch']):
    place(t, K('interface', pick(['glass_003', 'glass_006', 'confirmation_002'], j)), -15, pan_stage(j + 1), note=f'leak patched at {C["stages"][j + 1]}')
for i in range(4):
    place(s[2] + .1 + i * .09, K('casino', pick(['card-slide-1', 'card-slide-3', 'card-slide-5', 'card-slide-7'], i)), -16, -.3 + .2 * i, note=f'ad card {i + 1}')
place(s[2] + 1.3, K('interface', 'glass_002'), -16, -.3, note='winner')
place(s[2] + 1.45, K('interface', 'error_007'), -19, .3, note='killed at cap')
for i in range(4):
    place(s[3] + .1 + i * .08, K('casino', pick(['chips-stack-1', 'chips-stack-3', 'chips-stack-5', 'chips-stack-2'], i)), -17, -.3 + .2 * i, note=f'channel {C["services"][3]["channels"][i]}')
q = C['services'][4]['query']; n = len(q)
for j in range(0, n, 3):                                               # typing: one key every third character
    place(s[4] + .15 + .7 * j / n, FS('key', pick([194795, 194797], j)), -22, -.2, note='typing the search')
place(s[4] + 1.0, K('interface', 'select_002'), -15, -.2, note='our result first')
p = C['services'][5]['prompt']; n = len(p)
for j in range(0, n, 4):
    place(s[5] + .1 + .8 * j / n, FS('key', pick([194797, 194795], j)), -23, .25, note='typing the AI question')
place(s[5] + 1.05, FS('pop', 206152), -16, -.2, note='AI names the app')
place(A['turn'], FS('riser', 503801), -19, 0, mode='end', note='build into the turn')
place(A['turn'], K('impact', 'impactPlate_heavy_002'), -12, 0, note='Scale only what pays.')
# ---- the 90 days
place(A['wipe'], FS('transition', 444623), -14, 0, note='paper wipes up')
place(A['title'], K('impact', 'impactSoft_medium_002'), -14, 0, note='title lands')
for k, t in enumerate(A['steps']):
    last = k == len(A['steps']) - 1
    place(t, K('interface', 'glass_005') if last else K('casino', pick(['chip-lay-1', 'chip-lay-2', 'chip-lay-3'], k)), -13 if last else -15, .2, note=f'step {k}: {C["steps"][k][1]}')
place(A['guarantee'] + .1, FS('paper', 442857), -17, -.2, note='the guarantee')
# ---- operator, payoff (hero 2), end card
place(A['iris2'], FS('transition', 522693), -15, 0, note='blue iris from day 90')
place(A['operator'], K('impact', 'impactSoft_heavy_001'), -14, 0, note='portrait lands')
place(A['payoff'], K('impact', 'impactPunch_medium_001'), -14, 0, note='INSTALLS DON\'T PAY. returns')
place(A['strike'], FS('swish', 14175), -15, -.2, note='strike through INSTALLS')
place(A['payoff2'], FS('reverse', 198389), -16, 0, mode='end', note='suck-in before the payoff')
place(A['payoff2'], FS('boom', 636624), -9, 0, note='HERO SUBSCRIBERS DO.')
place(A['payoff2'], FS('hit', 578790), -15, 0, note='metal on the payoff')
place(A['payoff2'], K('impact', 'impactGlass_heavy_004'), -13, 0, note='glass on the payoff')
place(A['endCard'], FS('whoosh', 30241), -19, 0, note='end card')
place(A['cta'], FS('pop', 206152), -14, 0, note='CTA button')
place(A['click'], K('ui-audio', 'mouseclick1'), -10, .2, note='click')
place(A['click'] + .06, K('ui-audio', 'mouserelease1'), -14, .2, note='release')

mix = mix[:int(SR * DUR)]
peak = np.max(np.abs(mix)); mix *= .89 / max(peak, 1e-9) if peak > .89 else 1.
sf.write(out_wav, mix.astype(np.float32), SR, subtype='FLOAT')
json.dump(dict(note='every cue placed by sound/place.py from timeline.json', cues=cues), open(out_json, 'w'), indent=1)
print(f'{len(cues)} cues from {len(_cache)} recordings -> {out_wav} (peak {20 * np.log10(peak + 1e-12):.1f} dBFS before trim)')
