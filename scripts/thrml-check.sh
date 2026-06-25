#!/usr/bin/env bash
set -euo pipefail

BASE="${1:-http://localhost:3000}"

echo "▸ THRML engine check — $BASE"
echo ""

STATUS=$(curl -sf --max-time 5 "$BASE/api/status" 2>/dev/null) || {
  echo "✗ Could not reach $BASE/api/status"
  echo "  Start server: npm run dev:local"
  exit 1
}

echo "Runtime config:"
echo "$STATUS" | python3 -c "
import json, sys
d = json.load(sys.stdin)
t = d.get('thrml', {})
print(f\"  repo configured: {t.get('repoConfigured', False)}\")
print(f\"  repo exists:     {t.get('repoExists', False)}\")
print(f\"  setup ready:     {t.get('setupReady', False)}\")
print(f\"  expected:        {t.get('expectedEngine', 'n/a')}\")
print(f\"  python:          {t.get('python', 'n/a')}\")
"

echo ""
echo "Live signal:"
RESPONSE=$(curl -sf --max-time 12 -X POST "$BASE/api/thrml" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Forge THRML check"}' 2>/dev/null) || {
  echo "✗ POST /api/thrml failed"
  exit 1
}

echo "$RESPONSE" | python3 -c "
import json, sys
d = json.load(sys.stdin)
engine = d.get('engine', 'unknown')
using = d.get('using_thrml', False)
mode = d.get('mode', 'n/a')
print(f\"  engine:       {engine}\")
print(f\"  using_thrml:  {using}\")
print(f\"  mode:         {mode}\")
if d.get('reason'):
    print(f\"  reason:       {d['reason']}\")
if using and engine == 'thrml-ising':
    print('')
    print('✓ THRML Ising active')
    sys.exit(0)
print('')
print('○ Hash fallback (see THRML.md to enable Ising)')
"