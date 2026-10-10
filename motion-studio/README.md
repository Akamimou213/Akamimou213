# motion-studio

Pinned toolchain for the motion skills in `.claude/skills/`, kept apart from the portfolio site's `package.json`.

| File | What |
|---|---|
| `package.json` + `package-lock.json` | Playwright 1.63.0 (matches the container's Chromium), HyperFrames CLI 0.8.79, GSAP 3.15.0 |
| `requirements.txt` | numpy, scipy, soundfile, librosa, faster-whisper (local word timings; the model downloads on first use) |
| `session-start.sh` | SessionStart hook: reinstalls all of the above in fresh cloud containers and exports the render/telemetry env |
| `install-companion-skills.sh` | installs the vetted companion skills at pinned commits, with licences and patches (`VENDORED.md` ledger) |

Install the toolchain by hand: `bash .claude/skills/motion-reel/scripts/setup.sh motion-studio`.

## Two steps that need your approval

Both change what Claude loads or runs at startup, so Claude Code's safety check asks a person to do them.

1. **Companion skills** (41 skills, ~18 MB; list and reasons in `.claude/skills/motion-reel/reference/repos.md`):

   ```bash
   bash motion-studio/install-companion-skills.sh        # writes .claude/skills/<name>/ + .claude/skills/VENDORED.md
   ```

   Then commit `.claude/skills/`. Update later by bumping a commit in the script and re-running it.

2. **Startup hook + telemetry off**: add to `.claude/settings.json`:

   ```json
   {
     "env": { "HYPERFRAMES_NO_TELEMETRY": "1", "DO_NOT_TRACK": "1", "DISABLE_TELEMETRY": "1" },
     "hooks": {
       "SessionStart": [
         { "hooks": [ { "type": "command", "command": "bash \"$CLAUDE_PROJECT_DIR/motion-studio/session-start.sh\"" } ] }
       ]
     }
   }
   ```

## Licences

Remotion-based skills are deliberately not installed: Remotion is free only for companies of up to 3 people.
HyperFrames (Apache-2.0) and GSAP (free standard licence) cover commercial ad work. See `reference/repos.md`.
