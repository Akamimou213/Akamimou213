#!/usr/bin/env bash
# Motion studio toolchain: Node 22+, ffmpeg, Python audio stack, Playwright + Chromium.
#   bash setup.sh [studioDir]        (default ./motion-studio)
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
[ -f package.json ] || npm init -y >/dev/null
npm i -D playwright@1.63.0 >/dev/null      # pinned so the browser build matches
if [ -z "${PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD:-}" ]; then npx playwright install chromium; fi
python3 -c 'import numpy, scipy, soundfile, librosa' 2>/dev/null || {
  python3 -m venv .venv && . .venv/bin/activate && pip install -q numpy scipy soundfile librosa
  echo "activate the venv in each new shell: . $dir/.venv/bin/activate"; }
echo "export PLAYWRIGHT_PATH=$(pwd)/node_modules/playwright"
[ -x /opt/pw-browsers/chromium ] && echo "export CHROMIUM_PATH=/opt/pw-browsers/chromium"
# Optional third-party skills (review the repos before installing):
#   npx skills add remotion-dev/skills          # Remotion (company licence needed above 3 people)
#   npx skills add heygen-com/hyperframes        # HTML -> video with GSAP
