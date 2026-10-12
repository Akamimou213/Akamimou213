#!/usr/bin/env bash
# Download the CC0 recordings the film uses (audio files only) into audio/raw/. Sources: sound/urls.txt,
# taken from opus-sound-layer's pinned manifest (scripts/library.json). No third-party code is run.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p audio/raw/kenney audio/raw/fs
while read -r f u; do [ -s "audio/raw/$f" ] || curl -sS -L --fail -o "audio/raw/$f" "$u"; done < sound/urls.txt
for z in audio/raw/kenney/*.zip; do d="${z%.zip}"; mkdir -p "$d"; unzip -q -o -j "$z" '*.ogg' '*.wav' -d "$d" 2>/dev/null || true; done
echo "recordings ready in audio/raw/"
