#!/bin/bash
# Cole no Terminal do navegador da Hostinger (VPS → Terminal), como root.
# DNS evo.motocopiloto.com.br já deve apontar para este servidor.

set -euo pipefail

DOMAIN="evo.motocopiloto.com.br"
INSTALL_DIR="/opt/motoboy-evolution"
API_KEY="${EVOLUTION_API_KEY:-$(openssl rand -hex 16)}"
PG_PASS="${EVOLUTION_PG_PASSWORD:-$(openssl rand -hex 12)}"

echo "==> EVOLUTION_API_KEY (cole na Vercel):"
echo "$API_KEY"
echo ""

apt update && apt upgrade -y
command -v docker >/dev/null || curl -fsSL https://get.docker.com | sh

mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

cat > docker-compose.yml <<'COMPOSE'
services:
  evolution-postgres:
    image: postgres:16-alpine
    container_name: motoboy_evolution_pg
    restart: unless-stopped
    environment:
      POSTGRES_USER: evolution
      POSTGRES_PASSWORD: ${EVOLUTION_PG_PASSWORD}
      POSTGRES_DB: evolution
    volumes:
      - evolution_pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U evolution -d evolution"]
      interval: 5s
      timeout: 5s
      retries: 10

  evolution-redis:
    image: redis:7-alpine
    container_name: motoboy_evolution_redis
    restart: unless-stopped
    volumes:
      - evolution_redis_data:/data

  evolution-api:
    image: evoapicloud/evolution-api:v2.3.7
    container_name: motoboy_evolution
    restart: unless-stopped
    ports:
      - "127.0.0.1:8080:8080"
    depends_on:
      evolution-postgres:
        condition: service_healthy
      evolution-redis:
        condition: service_started
    environment:
      AUTHENTICATION_API_KEY: ${EVOLUTION_API_KEY}
      SERVER_URL: ${EVOLUTION_SERVER_URL}
      CONFIG_SESSION_PHONE_VERSION: ""
      LOG_LEVEL: ERROR
      DATABASE_ENABLED: "true"
      DATABASE_PROVIDER: postgresql
      DATABASE_CONNECTION_URI: postgresql://evolution:${EVOLUTION_PG_PASSWORD}@evolution-postgres:5432/evolution?schema=public
      DATABASE_CONNECTION_CLIENT_NAME: motoboy_evolution
      CACHE_REDIS_ENABLED: "true"
      CACHE_REDIS_URI: redis://evolution-redis:6379/2
      CACHE_REDIS_PREFIX_KEY: motoboy_evolution
    volumes:
      - evolution_instances:/evolution/instances

volumes:
  evolution_instances:
  evolution_pg_data:
  evolution_redis_data:
COMPOSE

cat > .env <<ENV
EVOLUTION_API_KEY=${API_KEY}
EVOLUTION_SERVER_URL=https://${DOMAIN}
EVOLUTION_PG_PASSWORD=${PG_PASS}
ENV

echo "==> Subindo Evolution..."
docker compose pull
docker compose up -d

if ! command -v caddy >/dev/null; then
  apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
  apt update && apt install -y caddy
fi

cat > /etc/caddy/Caddyfile <<CADDY
${DOMAIN} {
    reverse_proxy 127.0.0.1:8080
}
CADDY

systemctl enable caddy
systemctl reload caddy

echo ""
echo "============================================"
echo " Manager: https://${DOMAIN}/manager"
echo " API Key: ${API_KEY}"
echo " Crie instancia: motoboy + QR WhatsApp"
echo " Webhook: https://app.motocopiloto.com.br/api/backend/webhooks/whatsapp"
echo "============================================"
