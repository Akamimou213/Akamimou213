#!/usr/bin/env bash
# Pair a reference video with our render at the same timestamps, to check a remake against what it remakes.
#   refcompare.sh ref.mp4 out/film.mp4 docs/compare [cuts.txt]
# Samples 0.3 s, an even grid of 12, and 0.3 s after each cut in cuts.txt (from refscan.sh) when given.
# Writes pair-NN-<t>.png (reference left, ours right, both scaled to 540 px tall), sheet.png, and ssim.txt
# (per-pair SSIM, worst first). SSIM only says where to look first: it can't see a wrong word or a beat out of
# order, and it punishes changes we made on purpose (our subject, our copy). Judge the pairs by eye in this order:
# beat timing, composition, palette, type, then the state of the motion. Stills can't show motion: for a scene
# that moves differently, compare a strip of consecutive frames by hand.
set -uo pipefail
ref="$1" ours="$2" out="$3" cuts="${4:-}"; mkdir -p "$out"; rm -f "$out"/pair-*.png "$out/ssim.txt"
len() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }
d=$(node -e "console.log(Math.min($(len "$ref"), $(len "$ours")))")
ts=$(node -e '
  const d = +process.argv[1], fs = require("fs"), f = process.argv[2];
  const t = [0.3, ...Array.from({ length: 12 }, (_, i) => (i + .5) * d / 12)];
  if (f && fs.existsSync(f)) t.push(...fs.readFileSync(f, "utf8").split(/\s+/).filter(Boolean).map(x => +x + .3));
  console.log([...new Set(t.filter(x => x < d - .05).map(x => x.toFixed(2)))].sort((a, b) => a - b).join(" "));
' "$d" "$cuts")
n=0
for t in $ts; do
  n=$((n + 1)); p="$out/pair-$(printf %02d $n)-$t.png"
  ffmpeg -v error -y -ss "$t" -i "$ref" -ss "$t" -i "$ours" -filter_complex \
    "[0:v]scale=-2:540,setsar=1,drawtext=text='ref $t':x=8:y=8:fontsize=18:fontcolor=white:box=1:boxcolor=black@.6[a];[1:v]scale=-2:540,setsar=1,drawtext=text='ours':x=8:y=8:fontsize=18:fontcolor=white:box=1:boxcolor=black@.6[b];[a][b]hstack" \
    -frames:v 1 "$p" 2>/dev/null \
  || ffmpeg -v error -y -ss "$t" -i "$ref" -ss "$t" -i "$ours" -filter_complex "[0:v]scale=-2:540,setsar=1[a];[1:v]scale=-2:540,setsar=1[b];[a][b]hstack" -frames:v 1 "$p"
  # SSIM on matching 480x270 greyscale frames (aspect differences squash, which is fine for a ranking)
  s=$(ffmpeg -v error -ss "$t" -i "$ref" -ss "$t" -i "$ours" -filter_complex \
    "[0:v]scale=480:270,format=gray[a];[1:v]scale=480:270,format=gray[b];[a][b]ssim=stats_file=-" -frames:v 1 -f null - 2>/dev/null \
    | grep -o 'All:[0-9.]*' | head -1 | cut -d: -f2)
  echo "${s:-nan} $t $(basename "$p")" >> "$out/ssim.txt"
done
sort -n -o "$out/ssim.txt" "$out/ssim.txt"
ffmpeg -v error -y -pattern_type glob -i "$out/pair-*.png" -vf "scale=640:-2,tile=3x$(( (n + 2) / 3 )):padding=6:color=gray" -frames:v 1 "$out/sheet.png"
echo "$n pairs -> $out (worst SSIM first in ssim.txt):"; head -5 "$out/ssim.txt"
