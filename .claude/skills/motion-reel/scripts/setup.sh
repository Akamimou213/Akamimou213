#!/usr/bin/env bash
# Motion studio toolchain: Node 22+, ffmpeg, Python audio stack, Playwright + Chromium (+ HyperFrames CLI, GSAP).
#   bash setup.sh [studioDir]        (default ./motion-studio, whose package-lock.json / requirements.txt pin every version)
# Container with a preinstalled Chromium (PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1, e.g. /opt/pw-browsers/chromium):
# no browser download; scripts launch it via CHROMIUM_PATH.
set -euo pipefail
dir="${1:-motion-studio}"
if [[ "$(uname)" == "Darwin" ]]; then
  command -v ffmpeg >/dev/null || brew install ffmpeg
  command -v node >/dev/null || brew install node
else
  command -v ffmpeg >/dev/null || { sudo apt-get update && sudo apt-get install -y ffmpeg python3-venv python3-pip; }
fi
node -v | grep -Eq '^v(2[2-9]|[3-9][0-9])\.' || { echo "Node 22+ required (found $(node -v))"; exit 1; }
mkdir -p "$dir" && cd "$dir"
export HYPERFRAMES_NO_TELEMETRY=1 DO_NOT_TRACK=1
if [ -f package-lock.json ]; then npm ci --no-fund --no-audit >/dev/null      # pinned: playwright, hyperframes, gsap
else [ -f package.json ] || npm init -y >/dev/null; npm i -D playwright@1.63.0 >/dev/null; fi   # pinned so the browser build matches
if [ -z "${PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD:-}" ]; then npx playwright install chromium; fi
req=requirements.txt; [ -f "$req" ] || { req=$(mktemp); printf 'numpy\nscipy\nsoundfile\nlibrosa\n' > "$req"; }
python3 -c 'import numpy, scipy, soundfile, librosa' 2>/dev/null && [ "$req" != requirements.txt ] || {
  if python3 -m pip install -q -r "$req" 2>/dev/null; then :; else
    python3 -m venv .venv && . .venv/bin/activate && pip install -q -r "$req"
    echo "activate the venv in each new shell: . $dir/.venv/bin/activate"; fi; }
echo "export PLAYWRIGHT_PATH=$(pwd)/node_modules/playwright"
if [ -x /opt/pw-browsers/chromium ]; then echo "export CHROMIUM_PATH=/opt/pw-browsers/chromium"; fi
# Optional third-party skills (review the repos before installing):
#   npx skills add remotion-dev/skills          # Remotion (company licence needed above 3 people)
#   npx skills add heygen-com/hyperframes        # HTML -> video with GSAP
