#!/usr/bin/env bash
# Render every format of one language in parallel, then concat + mux the mastered audio.
#   render-all.sh <project> <name> <lang> <audio.wav|-> [KEY=WxH ...]     (formats default to timeline.json "formats")
#   SEGS=2 SUB=6 VARIANT=B render-all.sh ...   SEGS = parallel segments per format; SUB=1 fast draft; VARIANT = timeline.variants key
# Output: <project>/out/<name>-<lang>[-<VARIANT>]-<KEY>.mp4  (H.264 yuv420p, AAC 192k, +faststart)
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
proj="$1" name="$2" lang="$3" audio="$4"; shift 4
SEGS="${SEGS:-2}" SUB="${SUB:-6}" VARIANT="${VARIANT:-}"
vflag=(); vtag=""; if [ -n "$VARIANT" ]; then vflag=(--variant "$VARIANT"); vtag="-$VARIANT"; fi
read -r fps dur < <(node -e 'const t=require(require("path").resolve(process.argv[1],"timeline.json"));console.log(t.fps||60,t.duration)' "$proj")
total=$(node -e "console.log(Math.round($dur*$fps))")
if [ $# -eq 0 ]; then
  mapfile -t fmts < <(node -e 'const t=require(require("path").resolve(process.argv[1],"timeline.json"));for(const[k,v]of Object.entries(t.formats||{V:"1080x1920"}))console.log(k+"="+v)' "$proj")
else fmts=("$@"); fi
mkdir -p "$proj/out/seg"
pids=()
for f in "${fmts[@]}"; do
  key="${f%%=*}" size="${f#*=}"
  for ((s = 0; s < SEGS; s++)); do
    from=$((total * s / SEGS)) to=$((total * (s + 1) / SEGS))
    node "$here/render.cjs" "$proj" video "$size" "$from" "$to" "$proj/out/seg/$lang$vtag-$key-$s.mp4" --lang "$lang" --sub "$SUB" ${vflag[@]+"${vflag[@]}"} &
    pids+=($!)
  done
done
for p in "${pids[@]}"; do wait "$p"; done          # fail loudly if any segment failed
for f in "${fmts[@]}"; do
  key="${f%%=*}" list="$proj/out/seg/$lang$vtag-$key.txt"; : > "$list"
  for ((s = 0; s < SEGS; s++)); do echo "file '$lang$vtag-$key-$s.mp4'" >> "$list"; done   # paths relative to the list file
  out="$proj/out/$name-$lang$vtag-$key.mp4"
  if [ "$audio" = "-" ]; then
    ffmpeg -y -loglevel error -f concat -safe 0 -i "$list" -c copy -movflags +faststart "$out"
  else
    ffmpeg -y -loglevel error -f concat -safe 0 -i "$list" -i "$audio" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k \
      -t "$dur" -movflags +faststart "$out"
  fi
  echo "$out"
done
