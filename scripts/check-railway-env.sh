#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
ENV_FILE="${1:-railway.env}"
[[ -f "$ENV_FILE" ]] || { echo "❌ Falta $ENV_FILE"; exit 1; }
get() { grep -E "^${1}=" "$ENV_FILE" | head -1 | cut -d= -f2-; }
fail=0
check() {
  local k="$1" v
  v="$(get "$k")"
  if [[ -z "$v" || "$v" == *"localhost"* || "$v" == *"PASSWORD"* || "$v" == *"PROJECT"* ]]; then
    echo "❌ $k"
    fail=1
  else
    echo "✅ $k"
  fi
}
for k in DATABASE_URL DIRECT_URL REDIS_URL EVOLUTION_API_URL EVOLUTION_API_KEY EVOLUTION_INSTANCE EVOLUTION_WEBHOOK_SECRET JWT_SECRET OPENAI_API_KEY APP_URL; do
  check "$k"
done
[[ "$(get RUN_WHATSAPP_WORKER)" == "true" ]] && echo "✅ RUN_WHATSAPP_WORKER" || { echo "❌ RUN_WHATSAPP_WORKER (use true)"; fail=1; }
[[ $fail -eq 0 ]] && echo "" && echo "OK — rode: pnpm railway:push" || exit 1
