#!/usr/bin/env bash
# Install the vetted companion motion skills (see .claude/skills/motion-reel/reference/repos.md) at pinned commits.
#   bash motion-studio/install-companion-skills.sh [target]     default target: .claude/skills (needs your approval to run)
# What it does, per skill: shallow-clone the repo at the pinned commit, copy only the chosen skill folders, keep the
# licence (LICENSE.vendored), apply the small patches below, and list everything in <target>/VENDORED.md.
# Patches (all licences here permit modification; Apache-2.0 asks that changes are stated, which VENDORED.md does):
#   - HyperFrames skills: a project-policy header (pinned copy, no `skills update`, no feedback/telemetry reports,
#     motion-reel's house rules win) and the post-render feedback section removed from hyperframes-cli
#   - student-kit editing skills: the paid ElevenLabs transcriber replaced by local words.py; script paths made local
# Re-run to update after bumping a commit below; it refuses to overwrite skills it didn't install.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
target="${1:-$root/.claude/skills}"; mkdir -p "$target"
work="$(mktemp -d)"; trap 'rm -rf "$work"' EXIT

# repo | commit | licence path | skill source dirs (relative) -> installed name = basename
SOURCES=(
  "heygen-com/hyperframes|0ae223773ac27c8966d8ef2de70f54b2501e55a2|LICENSE|skills/embedded-captions skills/general-video skills/hyperframes skills/hyperframes-animation skills/hyperframes-audio skills/hyperframes-cli skills/hyperframes-core skills/hyperframes-creative skills/hyperframes-keyframes skills/hyperframes-registry skills/hyperframes-studio skills/media-use skills/motion-graphics skills/product-launch-video skills/talking-head-recut .claude/skills/cut-the-curve .claude/skills/motion-doctrine .claude/skills/seam-craft"
  "AbubakrChan/product-launch-motion|951d6149d274|LICENSE|."
  "cth9191/animate|7e5eb56feb2d|LICENSE|plugins/animate/skills/animate"
  "Barty-Bart/motion-graphics|83355bb58f78|LICENSE|skills/motion-broll skills/object-separation"
  "nateherkai/hyperframes-student-kit|0d30152a82b9|LICENSE|.claude/skills/short-form-edit .claude/skills/video-storytelling .claude/skills/cut-silences .claude/skills/cut-mistakes"
  "greensock/gsap-skills|aed9cfd32777|LICENSE|skills/gsap-core skills/gsap-timeline skills/gsap-plugins skills/gsap-utils skills/gsap-performance skills/gsap-scrolltrigger skills/gsap-react skills/gsap-frameworks"
  "iart-ai/motion-design-skills|3c129f769d90|LICENSE|skills/animation-principles skills/beat-sync-editing skills/color-motion skills/shot-composition skills/logo-animation skills/motion-art-direction"
)

ledger="$target/VENDORED.md"
[ -f "$ledger" ] || printf '# Vendored companion skills\n\nInstalled by `motion-studio/install-companion-skills.sh`. Vetting notes: `motion-reel/reference/repos.md`.\nTelemetry stays off (`HYPERFRAMES_NO_TELEMETRY=1`, `DO_NOT_TRACK=1`).\n\n| Skill | Source | Commit | Licence | Patched |\n|---|---|---|---|---|\n' > "$ledger"

for entry in "${SOURCES[@]}"; do
  IFS='|' read -r repo commit lic dirs <<<"$entry"
  src="$work/${repo//\//_}"
  git init -q "$src" && git -C "$src" fetch -q --depth 1 "https://github.com/$repo.git" "$commit" 2>/dev/null \
    || { rm -rf "$src"; git clone -q "https://github.com/$repo.git" "$src"; }
  git -C "$src" checkout -q "${commit}" 2>/dev/null || git -C "$src" checkout -q FETCH_HEAD
  for d in $dirs; do
    name=$([ "$d" = "." ] && basename "$repo" || basename "$d")
    dest="$target/$name"
    if [ -e "$dest" ] && ! grep -q "| $name |" "$ledger"; then echo "skip $name: a skill with that name exists and wasn't installed by this script"; continue; fi
    rm -rf "$dest"; mkdir -p "$dest"
    (cd "$src/$d" && tar cf - --exclude=.git --exclude=.github --exclude=.agents .) | (cd "$dest" && tar xf -)
    cp "$src/$lic" "$dest/LICENSE.vendored"
    patched=no
    case "$repo" in
      heygen-com/hyperframes) patched=policy ;;
      nateherkai/hyperframes-student-kit)
        [ "$name" = cut-mistakes ] && cp "$src/scripts/build-edl-review.mjs" "$dest/scripts/"
        [ "$name" = cut-silences ] && cp "$src/scripts/validate-beat-sync.mjs" "$dest/scripts/"
        patched=local-transcriber ;;
    esac
    REPO="$repo" COMMIT="$commit" PATCH="$patched" python3 - "$dest/SKILL.md" <<'PY'
import os, re, sys
p = sys.argv[1]; s = open(p, encoding='utf-8').read(); patch = os.environ['PATCH']
if patch == 'policy':
    m = re.match(r'(---\n.*?\n---\n)', s, re.S); head, body = (m.group(1), s[m.end():]) if m else ('', s)
    note = (f"\n> **Project policy (vendored copy, {os.environ['REPO']} @ {os.environ['COMMIT'][:12]}):** don't run "
            "`npx hyperframes skills update` (update by re-running motion-studio/install-companion-skills.sh); don't send "
            "`npx hyperframes feedback` reports or any telemetry; use the pinned CLI in motion-studio (`npx --prefix motion-studio "
            "hyperframes`). Where this skill conflicts with motion-reel's house rules (real UI only, verbatim copy, no invented "
            "data, original or supplied music, no HUDs or corner labels), the house rules win.\n")
    body = re.sub(r'\n(After verifying a successful render, send one feedback report.*?)(?=\n## |\Z)', '\n', body, flags=re.S)
    body = re.sub(r'\n[^\n]*npx hyperframes feedback[^\n]*', '', body)
    s = head + note + body
elif patch == 'local-transcriber':
    s = re.sub(r'node scripts/transcribe-elevenlabs\.mjs (\S+?)(\.\w+)?(\s+#[^\n]*)?\n',
               r'python3 -I .claude/skills/motion-reel/scripts/words.py \1\2 --shape scribe > \1.json   # local, no upload\n', s)
    s = re.sub(r'(?<![\w/.-])scripts/build-edl-review\.mjs', '.claude/skills/cut-mistakes/scripts/build-edl-review.mjs', s)
    s = re.sub(r'(?<![\w/.-])scripts/validate-beat-sync\.mjs', '.claude/skills/cut-silences/scripts/validate-beat-sync.mjs', s)
    s = s.replace('transcribe-elevenlabs.mjs', 'motion-reel/scripts/words.py --shape scribe')
open(p, 'w', encoding='utf-8').write(s)
PY
    grep -v "| $name |" "$ledger" > "$ledger.tmp" && mv "$ledger.tmp" "$ledger"
    echo "| $name | [$repo](https://github.com/$repo) | \`${commit:0:12}\` | $(head -1 "$dest/LICENSE.vendored" | sed 's/^ *//' | cut -c1-40) | $patched |" >> "$ledger"
    echo "installed $name"
  done
done
echo "done -> $target (ledger: $ledger)"
