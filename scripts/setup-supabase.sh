#!/usr/bin/env bash
# Aplica migrations no Supabase. Uso: copie .env.example → .env, preencha DATABASE_URL e DIRECT_URL, depois:
#   bash scripts/setup-supabase.sh
set -euo pipefail
cd "$(dirname "$0")/.."
if [ -f .env ]; then
  set -a
  # shellcheck source=/dev/null
  source .env
  set +a
fi
if [ -z "${DATABASE_URL:-}" ] || [ -z "${DIRECT_URL:-}" ]; then
  echo "Defina DATABASE_URL e DIRECT_URL no arquivo .env"
  exit 1
fi
pnpm db:deploy
echo "OK — tabelas criadas no Supabase."
