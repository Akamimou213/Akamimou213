#!/usr/bin/env bash
# Review sheets and technical checks for an exported film.
#   bash scripts/review.sh out/preview.mp4 review [prefix]
# Writes to <dir>/:
#   <prefix>contact-seconds.png    one frame per second (0, 30 … 420) + the last frame (449), labelled with frame numbers
#   <prefix>contact-boundaries.png frames 88–91, 208–211, 358–361 (every scene boundary)
#   <prefix>phone-360.png          the per-second frames at 360 px wide (phone, portrait inline)
#   <prefix>phone-844.png          key frames at 844 px wide (phone, landscape full-screen)
#   <prefix>waveform.png           audio waveform with a 1-second grid (if the file has audio)
# and prints ffprobe facts, decode errors, audio peaks and loudness.
set -euo pipefail
v="$1"; dir="${2:-review}"; pre="${3:-}"
mkdir -p "$dir"
FONT="${REVIEW_FONT:-/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf}"
label="drawtext=fontfile=$FONT:text='f%{n}':x=10:y=10:fontsize=26:fontcolor=white:box=1:boxcolor=black@0.65:boxborderw=6"

sel() { local s=""; for f in "$@"; do s+="eq(n\\,$f)+"; done; echo "${s%+}"; }
sheet() { # out cols width frames...
  local out="$1" cols="$2" w="$3"; shift 3
  local n=$#; local rows=$(( (n + cols - 1) / cols ))
  ffmpeg -v error -y -i "$v" -vf "$label,select='$(sel "$@")',scale=$w:-2,tile=${cols}x${rows}:padding=6:color=0x888888" \
    -fps_mode passthrough -frames:v 1 "$out"
  echo "$out"
}

SECONDS_F=(0 30 60 90 120 150 180 210 240 270 300 330 360 390 420 449)
sheet "$dir/${pre}contact-seconds.png" 4 480 "${SECONDS_F[@]}"
sheet "$dir/${pre}contact-boundaries.png" 4 480 88 89 90 91 208 209 210 211 358 359 360 361
sheet "$dir/${pre}phone-360.png" 4 360 "${SECONDS_F[@]}"
sheet "$dir/${pre}phone-844.png" 2 844 24 142 240 449

echo "== ffprobe"
ffprobe -v error -show_entries stream=index,codec_type,codec_name,width,height,r_frame_rate,avg_frame_rate,nb_frames,pix_fmt,sample_rate,channels,duration \
  -show_entries format=duration,size,bit_rate -of compact "$v"
echo "== decode errors (empty = clean)"
ffmpeg -v error -i "$v" -f null - 2>&1 | head -5
if ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$v" | grep -q .; then
  echo "== audio peaks (sample peak dBFS; target <= -6)"
  ffmpeg -hide_banner -i "$v" -af astats=measure_overall=Peak_level+RMS_level:measure_perchannel=none -f null - 2>&1 | grep -E "Peak level|RMS level" | tail -2
  echo "== loudness / true peak (target true peak <= -1 dBTP)"
  ffmpeg -hide_banner -i "$v" -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary/,$p' | grep -E "I:|Peak:" || true
  ffmpeg -v error -y -i "$v" -filter_complex "color=c=white:s=1800x240,format=rgba[bg];[0:a]showwavespic=s=1800x240:colors=0x23211F[w];[bg][w]overlay=format=auto,drawgrid=w=120:h=240:color=0xE5674B@0.5" \
    -frames:v 1 "$dir/${pre}waveform.png" && echo "$dir/${pre}waveform.png (15 s wide, grid = 1 s)"
else
  echo "== no audio stream"
fi
