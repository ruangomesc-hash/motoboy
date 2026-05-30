#!/bin/bash
# Para Evolution + Redis/Postgres locais (Docker). Produção fica só na VPS + Vercel + Railway.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "Parando containers locais (docker compose)..."
docker compose down 2>/dev/null || docker-compose down 2>/dev/null || true

if command -v colima >/dev/null; then
  echo "Colima detectado — para desligar a VM: colima stop"
fi

echo ""
echo "OK. Stack local parado."
echo "WhatsApp 24h: https://evo.motocopiloto.com.br (VPS)"
echo "App: https://app.motocopiloto.com.br (Vercel)"
echo "Worker: Railway (RUN_WHATSAPP_WORKER=true)"
