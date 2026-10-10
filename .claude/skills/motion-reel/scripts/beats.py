# python3 -I beats.py song.wav > beats.json   beats -> state changes, downbeats -> big moments, hits -> SFX
# Two checks over plain beat tracking:
#  - half-beat warning: if the low band (< 150 Hz) hits harder between the tracked beats than on them, the tracker may
#    have locked onto hi-hats (beats half a beat late). Not auto-corrected: off-beat sub bass looks the same. Listen.
#  - downbeats: the one-in-four phase where harmony changes (chroma novelty) and kicks land, not "the first beat found".
#    Kicks alone can't tell beat 1 from beat 3 in most grooves; chord changes usually can. Check it by ear.
import sys, json, numpy as np, librosa
from scipy.signal import butter, sosfiltfilt

HOP = 512
y, sr = librosa.load(sys.argv[1], sr=None, mono=True)
full = librosa.onset.onset_strength(y=y, sr=sr, hop_length=HOP)
low = librosa.feature.rms(y=sosfiltfilt(butter(4, 150, 'lowpass', fs=sr, output='sos'), y), hop_length=HOP)[0]
kick = np.maximum(0, np.diff(low, prepend=low[0]))                 # low-band energy rise = kick onsets
tempo, fr = librosa.beat.beat_track(onset_envelope=full, sr=sr, hop_length=HOP, units='frames')
near = lambda f: kick[max(0, f - 2):f + 3].max()
offbeat = False
if len(fr) > 4:
    half = int(np.median(np.diff(fr)) // 2)
    on, off = np.mean([near(f) for f in fr]), np.mean([near(f + half) for f in fr if f + half < len(kick)])
    offbeat = bool(off > 1.5 * on)
    if offbeat: print('warning: the low band hits harder between beats than on them; check by ear whether beats sit half a beat late', file=sys.stderr)
beats = librosa.frames_to_time(fr, sr=sr, hop_length=HOP).round(3).tolist()

phase = 0
if len(fr) >= 8:
    cs = librosa.util.sync(librosa.feature.chroma_stft(y=y, sr=sr, hop_length=HOP), fr, aggregate=np.median)
    nov = np.linalg.norm(np.diff(cs, axis=1), axis=0)[:len(fr)]     # nov[i]: harmony change at beat i
    ks = np.array([near(f) for f in fr])
    z = lambda v: (v - v.mean()) / (v.std() + 1e-9)
    score = z(np.array([nov[k::4].mean() for k in range(4)])) + .5 * z(np.array([ks[k::4].mean() for k in range(4)]))
    phase = int(np.argmax(score))

peaks = librosa.util.peak_pick(full, pre_max=3, post_max=3, pre_avg=3, post_avg=5, delta=0.5, wait=10)
json.dump({
    "bpm": float(np.atleast_1d(tempo)[0]),
    "offbeat_low_end": offbeat,                       # true -> listen: beats may be half a beat late
    "beats": beats,                                   # state changes go here
    "downbeats": beats[phase::4],                     # big moments go here (verify by ear)
    "hits": librosa.frames_to_time(peaks, sr=sr, hop_length=HOP).round(3).tolist(),  # SFX go here
}, sys.stdout, indent=1)
