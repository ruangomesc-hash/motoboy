#!/bin/bash
# Envia variáveis de railway.env para o Railway (worker WhatsApp).
# Uso:
#   npx @railway/cli login
#   cd app-motoboy && railway link   # projeto motoboy
#   pnpm railway:push
set -euo pipefail
cd "$(dirname "$0")/.."

ENV_FILE="${1:-railway.env}"
REQUIRED=(
  DATABASE_URL
  DIRECT_URL
  REDIS_URL
  EVOLUTION_API_URL
  EVOLUTION_API_KEY
  EVOLUTION_INSTANCE
  EVOLUTION_WEBHOOK_SECRET
  JWT_SECRET
  OPENAI_API_KEY
  APP_URL
  RUN_WHATSAPP_WORKER
)

if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ Crie $ENV_FILE (copie de railway.env.example e preencha)."
  exit 1
fi

get() {
  grep -E "^${1}=" "$ENV_FILE" | head -1 | cut -d= -f2- | sed 's/^"//;s/"$//'
}

echo "🛵 Enviando variáveis para o Railway..."
echo ""

for key in "${REQUIRED[@]}"; do
  val="$(get "$key")"
  if [[ -z "$val" ]]; then
    echo "❌ Falta ${key}= em $ENV_FILE"
    exit 1
  fi
  if [[ "$val" == *"localhost"* ]] || [[ "$val" == *"PROJECT"* ]] || [[ "$val" == *"PASSWORD"* ]]; then
    echo "❌ ${key} ainda é placeholder — preencha com valor real."
    exit 1
  fi
done

if [[ "$(get RUN_WHATSAPP_WORKER)" != "true" ]]; then
  echo "❌ RUN_WHATSAPP_WORKER deve ser true no Railway."
  exit 1
fi

if ! npx @railway/cli whoami >/dev/null 2>&1; then
  echo "❌ Faça login: npx @railway/cli login"
  exit 1
fi

# Opcional: número do bot (não bloqueia worker)
OPTIONAL=(EVOLUTION_BOT_NUMBER)

set_var() {
  local key="$1"
  local val="$2"
  echo "→ $key"
  npx @railway/cli variable set "${key}=${val}" --skip-deploys 2>/dev/null \
    || npx @railway/cli variables --set "${key}=${val}" --skip-deploys 2>/dev/null \
    || npx @railway/cli variable set "${key}=${val}"
}

for key in "${REQUIRED[@]}" "${OPTIONAL[@]}"; do
  val="$(get "$key")"
  [[ -n "$val" ]] || continue
  set_var "$key" "$val"
done

echo ""
echo "✅ Variáveis enviadas. Disparando deploy..."
npx @railway/cli up --detach 2>/dev/null || npx @railway/cli redeploy 2>/dev/null || {
  echo "   Abra o Railway → Deploy manualmente (botão Deploy)."
}

echo ""
echo "Depois: logs devem mostrar API + worker; teste Zap: R$ 30 entrega teste"
