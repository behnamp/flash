#!/bin/bash
# Deploy gate — PreToolUse hook (see .claude/settings.json).
# Pushing to main auto-deploys to production on Vercel, so any `git push`
# that targets main is blocked unless `npm run build` passes.
# Lint is reported as a warning but does not block (pre-existing debt).
# All other Bash commands (and pushes to feature branches) pass through instantly.

INPUT=$(cat)
CMD=$(printf '%s' "$INPUT" | jq -r '.tool_input.command // ""')

case "$CMD" in
  *"git push"*) ;;
  *) exit 0 ;;
esac

REPO_ROOT="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"

# Isolate the args of the push itself (drop anything chained after && ; |)
ARGS=$(printf '%s' "$CMD" | sed -E 's/.*git +push//; s/(&&|;|\|).*//')

# First non-flag arg is the remote; any later non-flag args are refspecs.
TARGETS_MAIN=0
NONFLAG=()
for w in $ARGS; do
  case "$w" in -*) ;; *) NONFLAG+=("$w") ;; esac
done
if [ "${#NONFLAG[@]}" -ge 2 ]; then
  for r in "${NONFLAG[@]:1}"; do
    case "$r" in main|*:main|refs/heads/main|HEAD:main) TARGETS_MAIN=1 ;; esac
  done
else
  # Bare `git push` (or remote only): gates on the currently checked-out branch
  [ "$(git -C "$REPO_ROOT" branch --show-current)" = "main" ] && TARGETS_MAIN=1
fi
[ "$TARGETS_MAIN" = 1 ] || exit 0

LOG=$(mktemp)
if ! (cd "$REPO_ROOT" && npm run build) >"$LOG" 2>&1; then
  REASON="DEPLOY GATE: npm run build FAILED — pushing to main deploys straight to production. Fix the build and retry. Build output (last 25 lines):
$(tail -25 "$LOG")"
  rm -f "$LOG"
  jq -n --arg r "$REASON" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}'
  exit 0
fi
rm -f "$LOG"

LINT_NOTE=""
(cd "$REPO_ROOT" && npm run lint) >/dev/null 2>&1 || LINT_NOTE=" (note: npm run lint still has errors — non-blocking)"

jq -n --arg m "Deploy gate: build passed — push to main allowed.$LINT_NOTE" '{systemMessage: $m}'
exit 0
