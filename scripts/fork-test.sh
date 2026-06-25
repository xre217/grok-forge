#!/usr/bin/env bash
# Simulates a stranger clone: install, typecheck, build — no Ollama required.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "▸ Grok Forge fork test (no Ollama)"
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "✗ Node.js 20+ required"
  exit 1
fi

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "✗ Node 20+ required (found $(node -v))"
  exit 1
fi

echo "▸ npm ci"
npm ci

if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "▸ Created .env.local from .env.example"
fi

echo "▸ TypeScript"
npx tsc --noEmit

echo "▸ Production build"
FORGE_MODE=local FORGE_LOCAL_FIRST=1 npm run build

echo ""
echo "✓ Fork test passed — stranger can npm ci && npm run build"
echo "  Next: bash scripts/setup.sh && npm run dev:local && npm run verify"