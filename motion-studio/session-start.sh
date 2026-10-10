#!/usr/bin/env bash
# SessionStart hook: fresh cloud containers start empty, so reinstall the pinned motion toolchain
# (motion-studio/package-lock.json + requirements.txt) and export the render/telemetry env for the session.
# Register it in .claude/settings.json (see motion-studio/README.md). Local machines keep their installs, so it
# only runs in Claude Code cloud sessions.
set -euo pipefail
[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0
cd "${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
bash .claude/skills/motion-reel/scripts/setup.sh motion-studio >/dev/null 2>&1 || echo "motion-studio setup failed: run bash .claude/skills/motion-reel/scripts/setup.sh motion-studio" >&2
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  {
    echo "export HYPERFRAMES_NO_TELEMETRY=1 DO_NOT_TRACK=1 DISABLE_TELEMETRY=1"
    echo "export PLAYWRIGHT_PATH=$PWD/motion-studio/node_modules/playwright"
    [ -x /opt/pw-browsers/chromium ] && echo "export CHROMIUM_PATH=/opt/pw-browsers/chromium"
  } >> "$CLAUDE_ENV_FILE"
fi
