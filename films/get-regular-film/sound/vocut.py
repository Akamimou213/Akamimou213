"""Cut the 26 s VO from the first film's soundtrack (orig48.wav = its audio, 48 kHz stereo).
Usage: python3 -I vocut.py orig48.wav vocut.wav ; then ffmpeg -i vocut.wav -af atempo=1.06 -c:a pcm_s24le audio/vo-en.wav
SEG = the kept lines in the original timeline (s); 40 ms equal-power crossfades; 0.25 s lead-in."""
import sys, numpy as np, soundfile as sf
src, out = sys.argv[1], sys.argv[2]
x, sr = sf.read(src)
SEG = [(3.88,5.95),(6.24,7.10),(7.55,8.95),(10.70,17.20),(18.93,21.35),(24.08,26.55),(28.98,31.85),(36.08,41.15),(43.92,48.05)]
xf = int(.04*sr); lead = np.zeros((int(.25*sr),2))
y = lead
for a,b in SEG:
    s = x[int(a*sr):int(b*sr)].copy()
    ramp = np.sin(np.linspace(0,np.pi/2,xf))[:,None]
    s[:xf] *= ramp; s[-xf:] *= ramp[::-1]
    if len(y) > len(lead): y[-xf:] += s[:xf]; y = np.concatenate([y, s[xf:]])
    else: y = np.concatenate([y, s])
y = np.concatenate([y, np.zeros((int(.1*sr),2))])
sf.write(out, y, sr, subtype='PCM_24'); print(len(y)/sr)
