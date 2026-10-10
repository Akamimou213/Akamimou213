#!/usr/bin/env bash
# Break a reference video down so its grammar can be named (never its content copied).
#   refscan.sh ref.mp4 docs/ref
# Writes: cuts.txt (scene-change times), sheet-NN.png (4 fps, 10 s per sheet), strip-<t>.png (8 frames around each cut),
#         audio.wav, beats.json, loudness. Then write docs/style_guide.md: cut count + average shot length, type pairing,
#         accent element, signature transitions, camera language, pacing vs beat, what to keep / push further.
set -uo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
v="$1" out="$2"; mkdir -p "$out"
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate -show_entries format=duration -of compact "$v"
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$v")
ffmpeg -hide_banner -i "$v" -vf "select='gt(scene,0.3)',showinfo" -f null - 2>&1 | grep -o 'pts_time:[0-9.]*' | cut -d: -f2 > "$out/cuts.txt"
n=$(wc -l < "$out/cuts.txt")
echo "hard cuts: $n in ${dur}s -> average shot $(node -e "console.log(($dur/($n+1)).toFixed(2))") s (soft morphs won't register; read the sheets)"
for ((i = 0; i < $(node -e "console.log(Math.ceil($dur/10))"); i++)); do
  ffmpeg -v error -y -ss $((i * 10)) -t 10 -copyts -i "$v" -vf "fps=4,scale=320:-2,drawtext=text='%{pts\:hms}':x=4:y=4:fontsize=14:fontcolor=white:box=1:boxcolor=black@.6,tile=8x5:padding=4:color=gray" -frames:v 1 "$out/sheet-$(printf %02d $i).png" 2>/dev/null \
  || ffmpeg -v error -y -ss $((i * 10)) -t 10 -i "$v" -vf "fps=4,scale=320:-2,tile=8x5:padding=4:color=gray" -frames:v 1 "$out/sheet-$(printf %02d $i).png"
done
while read -r t; do
  s=$(node -e "console.log(Math.max(0,$t-0.12).toFixed(3))")
  ffmpeg -v error -y -ss "$s" -i "$v" -vf "scale=320:-2,tile=8x1:padding=4:color=gray" -frames:v 1 "$out/strip-$t.png"
done < <(head -20 "$out/cuts.txt")
if ffprobe -v error -select_streams a -show_entries stream=codec_name -of csv=p=0 "$v" | grep -q .; then
  ffmpeg -v error -y -i "$v" -vn -ac 2 -ar 48000 "$out/audio.wav"
  ffmpeg -hide_banner -i "$out/audio.wav" -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary/,$p' | grep -E "I:|LRA:|Peak:"
  python3 -I "$here/beats.py" "$out/audio.wav" > "$out/beats.json" && node -e 'const b=require(require("path").resolve(process.argv[1]));console.log("tempo",b.bpm.toFixed(1),"BPM,",b.beats.length,"beats,",b.hits.length,"hits")' "$out/beats.json"
fi
ls "$out"
