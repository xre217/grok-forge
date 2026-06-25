#!/usr/bin/env bash
set -euo pipefail

BASE="${1:-http://localhost:3000}"
PASS=0
FAIL=0

check() {
  local name="$1"
  local url="$2"
  if curl -sf --max-time 5 "$url" >/dev/null; then
    echo "✓ $name"
    PASS=$((PASS + 1))
  else
    echo "✗ $name ($url)"
    FAIL=$((FAIL + 1))
  fi
}

echo "▸ Grok Forge verification — $BASE"
echo ""

check "health" "$BASE/api/health"
check "status" "$BASE/api/status"
check "config" "$BASE/api/config"
check "ledger" "$BASE/api/ledger"
check "memory" "$BASE/api/memory"
check "studio" "$BASE/studio"

echo ""
if [ "$FAIL" -eq 0 ]; then
  echo "✓ All checks passed ($PASS)"
  exit 0
fi

echo "✗ $FAIL check(s) failed, $PASS passed"
echo "  Start server: npm run dev:local"
exit 1