#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ROOT}/.env.local"

echo "▸ Grok Forge — VILO pack preset"

touch "$ENV_FILE"

set_env() {
  local key="$1"
  local value="$2"
  if grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
    sed -i.bak "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
  else
    echo "${key}=${value}" >> "$ENV_FILE"
  fi
}

set_env "FORGE_PACK" "vilo"
set_env "NEXT_PUBLIC_FORGE_PACK" "vilo"
set_env "FORGE_MODE" "local"
set_env "FORGE_LOCAL_FIRST" "1"
set_env "FORGE_LEDGER_ENABLED" "1"
set_env "JARVIS_HOME" "~/.jarvis"
set_env "FORGE_USER_NAME" "${FORGE_USER_NAME:-Tre}"

if [ -n "${THRML_REPO_PATH:-}" ]; then
  set_env "THRML_REPO_PATH" "$THRML_REPO_PATH"
fi

rm -f "${ENV_FILE}.bak"

echo "✓ VILO pack enabled in .env.local"
echo ""
echo "  FORGE_PACK=vilo"
echo "  NEXT_PUBLIC_FORGE_PACK=vilo"
echo "  JARVIS_HOME=~/.jarvis"
echo ""
echo "  npm run dev:local  →  http://localhost:3000/studio"
echo ""