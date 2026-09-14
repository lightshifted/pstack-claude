#!/usr/bin/env bash
# Re-injects poteto-mode's stickiness once per turn.
# Cursor expressed this as `mode: true` + a `reminder:` line in frontmatter.
# Claude Code has no mode frontmatter, so the same behavior is a UserPromptSubmit hook.
# Registered by skills/poteto-mode/SKILL.md and it persists for the rest of the session.
# Exiting non-zero here is non-blocking by design: a broken reminder must never eat a turn.
set -uo pipefail
printf '%s' '{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"poteto-mode is active for this session. New task? If a playbook matches or the work needs rigor, apply /poteto-mode. Casual turn, or the user opted out? Stay out of the way."}}'
