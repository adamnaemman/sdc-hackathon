#!/usr/bin/env bash
#
# Bring the Replit workspace back in line with GitHub.
#
# Why this exists: the Repl ends up with local commits of its own (Replit's agent,
# or a commit made in the shell), so `git pull` refuses to run with "divergent
# branches". The Repl is meant to be a mirror of origin — never the source of
# truth — so we discard whatever is local and adopt origin/adam exactly.
#
# Usage, from the workspace root:
#     bash scripts/repl-sync.sh
#
set -euo pipefail

BRANCH="${1:-adam}"

cd "$(dirname "$0")/.."

echo "→ stopping any running API build"
pkill -9 -f "dist/index.mjs" 2>/dev/null || true

echo "→ fetching origin"
git fetch origin

echo "→ resetting to origin/${BRANCH} (local Repl commits are discarded)"
git reset --hard "origin/${BRANCH}"

echo "→ synced. Now restart the API:"
echo "   PORT=8080 pnpm --filter @workspace/api-server run dev"
