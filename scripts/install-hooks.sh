#!/usr/bin/env bash
# Installs the repo's git hooks (auto-bump plugin version).
# Run once after cloning. Safe to re-run.

set -e

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

chmod +x .githooks/pre-commit
git config core.hooksPath .githooks

echo "[install-hooks] core.hooksPath set to .githooks"
echo "[install-hooks] pre-commit hook active — plugin version auto-bumps on relevant changes"
echo ""
echo "To bypass temporarily:  EL_CORO_NO_BUMP=1 git commit ..."
echo "To bump minor/major:    node scripts/bump-version.mjs minor"
