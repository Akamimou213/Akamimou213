"""Word timings for captions and VO-locked cues: [{"w": "Book", "t0": 1.02, "t1": 1.31}, ...] on stdout.
  python3 -I words.py vo.wav --lang en [--model small] > out/words.en.json     local faster-whisper (no API, no upload)
  python3 -I words.py captions.srt > out/words.en.json                          a supplied SRT (word times are estimated)
faster-whisper is optional (pip install faster-whisper); its first run downloads the model from Hugging Face.
An SRT only times whole cues, so words are spread by length inside each cue (about +-0.2 s): put important visual
changes on the first or last word of a cue, or transcribe the audio for word-exact timing."""
import argparse
import json
import re
import sys

ap = argparse.ArgumentParser()
ap.add_argument('src'); ap.add_argument('--lang'); ap.add_argument('--model', default='small')
args = ap.parse_args()


def srt_words(path):
    ts = lambda s: sum(float(x) * m for x, m in zip(re.split('[:,.]', s.strip())[:4], (3600, 60, 1, .001)))
    out = []
    for block in re.split(r'\n\s*\n', open(path, encoding='utf-8-sig').read().strip()):
        lines = block.strip().splitlines()
        tl = next((i for i, l in enumerate(lines) if '-->' in l), None)
        if tl is None: continue
        a, b = (ts(x) for x in lines[tl].split('-->'))
        ws = ' '.join(lines[tl + 1:]).split()
        if not ws: continue
        total = sum(len(w) + 1 for w in ws); t = a
        for w in ws:
            d = (b - a) * (len(w) + 1) / total
            out.append({'w': w, 't0': round(t, 3), 't1': round(t + d, 3)}); t += d
    return out


def whisper_words(path):
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        sys.exit('faster-whisper is not installed: pip install faster-whisper (or pass an SRT)')
    model = WhisperModel(args.model, device='auto', compute_type='int8')
    segs, _ = model.transcribe(path, language=args.lang, word_timestamps=True, vad_filter=True)
    return [{'w': w.word.strip(), 't0': round(w.start, 3), 't1': round(w.end, 3)} for s in segs for w in (s.words or []) if w.word.strip()]


words = srt_words(args.src) if args.src.lower().endswith('.srt') else whisper_words(args.src)
json.dump(words, sys.stdout, ensure_ascii=False, indent=0)
print(f'{len(words)} words', file=sys.stderr)
