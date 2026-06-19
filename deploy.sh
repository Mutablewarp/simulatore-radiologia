#!/usr/bin/env bash
# Re-deploy il simulatore su una CDN statica (es. Cloudflare Pages).
# Imposta PROJECT con il nome del tuo progetto; richiede wrangler già autenticato.
set -euo pipefail
cd "$(dirname "$0")"
PROJECT="${PROJECT:-simulatore-radiologia}"
echo "→ Sync dist/ con index.html aggiornato"
mkdir -p dist
cp index.html dist/
echo "→ Deploy su Cloudflare Pages (progetto: $PROJECT)"
npx -y wrangler@latest pages deploy dist --project-name="$PROJECT" --branch=main --commit-dirty=true
echo ""
echo "✓ Deploy completato"
