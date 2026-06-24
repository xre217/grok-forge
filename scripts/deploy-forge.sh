#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DOMAIN="${FORGE_DOMAIN:-forge.trefong.com}"

echo "▸ Building Grok Forge…"
npm run build

echo "▸ Deploying to Vercel production…"
vercel --prod --yes

echo "▸ Adding custom domain: ${DOMAIN}"
vercel domains add "$DOMAIN" --yes 2>/dev/null || vercel alias set "$(vercel ls grok-forge --yes 2>/dev/null | head -1)" "$DOMAIN" 2>/dev/null || true

echo "▸ DNS (at your registrar for trefong.com):"
echo "  CNAME  forge  →  cname.vercel-dns.com"
echo ""
echo "▸ Set production env:"
echo "  vercel env add XAI_API_KEY production"
echo ""
echo "✓ Forge deploy script complete."