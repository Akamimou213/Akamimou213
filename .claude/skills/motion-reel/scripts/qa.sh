#!/usr/bin/env bash
# QA a rendered film. Writes next to the video: <base>.contact.png, .phone.png, .strip-<t>.png, .poster.png, .loop_check.mp4
#   qa.sh out/film.mp4 [timeline.json]
# Env: POSTER_T (s, default 0) · STRIPS="7.0 11.0" (default: timeline hardCuts) · BEAT (s, default from timeline bpm or 0.5)
# Then: open the PNGs and score them with prompts/critique-pass.md.
set -uo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
v="$1" tl="${2:-}"; base="${v%.*}"
jq_tl() { node -e 'const t=require(require("path").resolve(process.argv[1]));const v=eval("t."+process.argv[2]);console.log(Array.isArray(v)?v.join(" "):(v??""))' "$tl" "$1"; }
BEAT="${BEAT:-$([ -n "$tl" ] && node -e "console.log(60/($(jq_tl bpm)||120))" || echo 0.5)}"
STRIPS="${STRIPS:-$([ -n "$tl" ] && jq_tl hardCuts || true)}"
LOOP="$([ -n "$tl" ] && jq_tl loop || echo false)"

echo "== probe"
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,pix_fmt,sample_rate,channels -show_entries format=duration,size,bit_rate -of compact "$v"
echo "== decode (must be empty)"
ffmpeg -v error -i "$v" -f null - 2>&1 | head -5
echo "== loudness (target -14 LUFS integrated, true peak <= -1 dBTP)"
ffmpeg -hide_banner -i "$v" -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary/,$p' | grep -E "I:|LRA:|Peak:"

dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$v")
w=$(ffprobe -v error -select_streams v -show_entries stream=width -of csv=p=0 "$v"); h=$(ffprobe -v error -select_streams v -show_entries stream=height -of csv=p=0 "$v")
n=$(node -e "console.log(Math.ceil($dur/$BEAT))"); cols=$([ "$w" -ge "$h" ] && echo 8 || echo 10); tw=$([ "$w" -ge "$h" ] && echo 360 || echo 216)
echo "== contact: one frame per beat ($n frames, beat ${BEAT}s, sampled 0.3 s into each beat)"
ffmpeg -v error -y -ss 0.3 -i "$v" -vf "fps=1/$BEAT,scale=$tw:-2,tile=${cols}x$(( (n + cols - 1) / cols )):padding=6:color=gray" -frames:v 1 "$base.contact.png" && echo "$base.contact.png"
echo "== phone test: 360 px wide, one frame per second (can you read every word?)"
ffmpeg -v error -y -i "$v" -vf "fps=1,scale=360:-2,tile=6x$(( ($(printf '%.0f' "$dur") + 5) / 6 )):padding=8:color=black" -frames:v 1 "$base.phone.png" && echo "$base.phone.png"
for t in $STRIPS; do
  s=$(node -e "console.log(Math.max(0,$t-0.1))")
  ffmpeg -v error -y -ss "$s" -i "$v" -vf "scale=$tw:-2,tile=8x1:padding=4:color=gray" -frames:v 1 "$base.strip-$t.png" && echo "transition strip around $t s -> $base.strip-$t.png"
done
ffmpeg -v error -y -ss "${POSTER_T:-0}" -i "$v" -frames:v 1 "$base.poster.png" && echo "poster -> $base.poster.png"
if [ "$LOOP" = "true" ]; then
  echo "== loop seam: SSIM(first frame, frame after last) should be >= 0.99"
  ffmpeg -v error -y -i "$v" -vf "select=eq(n\,0)" -frames:v 1 /tmp/_first.png
  ffmpeg -v error -y -sseof -0.1 -i "$v" -update 1 /tmp/_last.png
  ffmpeg -hide_banner -i /tmp/_first.png -i /tmp/_last.png -lavfi ssim -f null - 2>&1 | grep -o "All:[0-9.]*"
  ffmpeg -v error -y -stream_loop 2 -i "$v" -c copy "$base.loop_check.mp4" && echo "watch the seam: $base.loop_check.mp4"
fi
echo "== corners (should be empty: no labels, HUDs, frames)"
python3 -I "$here/qa.py" corners "$v"
if [ -n "$tl" ]; then echo "== audio sync (onsets vs state changes, target <= 1 frame)"; python3 -I "$here/qa.py" sync "$v" "$tl"; fi
