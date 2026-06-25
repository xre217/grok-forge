#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "▸ Grok Forge setup"

if ! command -v node >/dev/null 2>&1; then
  echo "✗ Node.js 20+ is required. Install from https://nodejs.org"
  exit 1
fi

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "✗ Node 20+ required (found $(node -v))"
  exit 1
fi

echo "▸ Installing dependencies…"
npm install

if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "▸ Created .env.local from .env.example"
else
  echo "▸ .env.local already exists — skipped"
fi

if command -v ollama >/dev/null 2>&1; then
  MODEL="${OLLAMA_MODEL:-llama3.2:3b}"
  echo "▸ Pulling Ollama model: ${MODEL}"
  ollama pull "$MODEL" || echo "⚠ Ollama pull failed — run 'ollama serve' and try again"
else
  echo "⚠ Ollama not found — install from https://ollama.com for local chat"
fi

echo ""
echo "✓ Setup complete"
echo ""
echo "  npm run dev:local    → dev server (http://localhost:3000)"
echo "  npm run forge:local  → production-like on port 3847"
echo "  Open studio:         http://localhost:3000/studio"
echo ""