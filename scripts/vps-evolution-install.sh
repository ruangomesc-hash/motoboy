#!/bin/bash
# Rode na VPS como root: bash vps-evolution-install.sh
# Antes: DNS evo.motocopiloto.com.br → IP desta VPS

set -euo pipefail

DOMAIN="${EVOLUTION_DOMAIN:-evo.motocopiloto.com.br}"
INSTALL_DIR="/opt/motoboy-evolution"

echo "==> Atualizando sistema..."
apt update && apt upgrade -y

if ! command -v docker >/dev/null 2>&1; then
  echo "==> Instalando Docker..."
  curl -fsSL https://get.docker.com | sh
fi

if ! command -v caddy >/dev/null 2>&1; then
  echo "==> Instalando Caddy..."
  apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
  apt update && apt install -y caddy
fi

mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

if [ ! -f docker-compose.yml ]; then
  echo "ERRO: Coloque docker-compose.yml e .env em $INSTALL_DIR"
  echo "Copie de deploy/evolution/ do projeto motoboy."
  exit 1
fi

if [ ! -f .env ]; then
  echo "ERRO: Crie .env a partir de .env.example"
  exit 1
fi

echo "==> Subindo Evolution..."
docker compose pull
docker compose up -d

cat > /etc/caddy/Caddyfile <<EOF
${DOMAIN} {
    reverse_proxy 127.0.0.1:8080
}
EOF

systemctl enable caddy
systemctl reload caddy

echo ""
echo "Pronto. Abra: https://${DOMAIN}/manager"
echo "API Key = EVOLUTION_API_KEY do arquivo $INSTALL_DIR/.env"
