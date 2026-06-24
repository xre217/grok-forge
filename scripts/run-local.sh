#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
PORT="${FORGE_PORT:-3847}"

export FORGE_MODE="${FORGE_MODE:-local}"
export FORGE_LOCAL_FIRST="${FORGE_LOCAL_FIRST:-1}"

echo "▸ Local Forge — no xAI credits, no Vercel"
echo "▸ Mode: ${FORGE_MODE}"
echo "▸ Ollama model: ${OLLAMA_MODEL:-llama3.2:3b}"

if ! curl -sf --max-time 2 http://127.0.0.1:11434/api/tags >/dev/null; then
  echo "⚠ Ollama not responding. Start it: ollama serve"
fi

echo "▸ Building…"
npm run build

echo "▸ Starting on http://localhost:${PORT}"
PORT="${PORT}" npm run start