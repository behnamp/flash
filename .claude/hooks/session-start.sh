#!/bin/bash
set -euo pipefail

# Install dependencies on Claude Code on the web so builds, lint,
# and the deploy gate work immediately. No-op on local machines.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"
npm install --no-audit --no-fund
