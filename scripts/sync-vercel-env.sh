#!/bin/bash
# Atualiza na Vercel: DATABASE_URL, DIRECT_URL, REDIS_URL, JWT_SECRET (production + preview).
# Uso: bash scripts/sync-vercel-env.sh railway.env
set -euo pipefail
cd "$(dirname "$0")/.."

ENV_FILE="${1:-railway.env}"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ Arquivo não encontrado: $ENV_FILE"
  exit 1
fi

get() { grep -E "^${1}=" "$ENV_FILE" | head -1 | cut -d= -f2-; }

DB_URL="$(get DATABASE_URL)"
DIR_URL="$(get DIRECT_URL)"
REDIS="$(get REDIS_URL)"
JWT="$(get JWT_SECRET)"

for name in DB_URL DIR_URL REDIS JWT; do
  if [[ -z "${!name}" ]]; then
    echo "❌ Falta $name em $ENV_FILE"
    exit 1
  fi
done

update() {
  echo "→ $1 ($2)"
  npx vercel env update "$1" "$2" --value "$3" --sensitive --yes
}

for env in production preview; do
  update DATABASE_URL "$env" "$DB_URL"
  update DIRECT_URL "$env" "$DIR_URL"
  update REDIS_URL "$env" "$REDIS"
  update JWT_SECRET "$env" "$JWT"
done

echo "✅ OK. Redeploy: npx vercel --prod"
