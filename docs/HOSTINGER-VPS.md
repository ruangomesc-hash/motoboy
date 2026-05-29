# Evolution na Hostinger VPS (24h)

## 1. DNS (Registro.br)

| Tipo | Nome | Valor |
|------|------|--------|
| A | `evo` | **IPv4 da VPS** |

Aguarde 5–30 min. Teste: `ping evo.motocopiloto.com.br`

## 2. SSH no servidor

```bash
ssh root@SEU_IP
```

Senha = a que você gerou na Hostinger.

## 3. Instalar Docker

```bash
apt update && apt upgrade -y
curl -fsSL https://get.docker.com | sh
```

## 4. Subir Evolution

```bash
mkdir -p /opt/motoboy-evolution
cd /opt/motoboy-evolution
```

Copie os arquivos `deploy/evolution/docker-compose.yml` e crie `.env` (veja `.env.example`).

Ou clone o repo:

```bash
apt install -y git
git clone https://github.com/SEU_USUARIO/app-motoboy.git
cd app-motoboy/deploy/evolution
cp .env.example .env
nano .env
docker compose up -d
```

## 5. HTTPS (Caddy)

```bash
apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install -y caddy

cat > /etc/caddy/Caddyfile <<'EOF'
evo.motocopiloto.com.br {
    reverse_proxy localhost:8080
}
EOF

# Evolution precisa expor 8080 no host — adicione no compose:
# ports: - "127.0.0.1:8080:8080"
systemctl reload caddy
```

**Importante:** no `docker-compose.yml` da VPS, descomente/adicione:

```yaml
ports:
  - "127.0.0.1:8080:8080"
```

Depois: `docker compose up -d`

## 6. Manager + QR

Abra: `https://evo.motocopiloto.com.br/manager`

- Login: **API Key Global** = `EVOLUTION_API_KEY` do `.env`
- Instância `motoboy` → conectar WhatsApp (QR)

## 7. Webhook

No Manager ou API:

- URL: `https://app.motocopiloto.com.br/api/backend/webhooks/whatsapp`
- Header: `apikey: <EVOLUTION_WEBHOOK_SECRET>`
- Evento: `MESSAGES_UPSERT`

## 8. Vercel

```env
EVOLUTION_API_URL=https://evo.motocopiloto.com.br
EVOLUTION_API_KEY=mesma_do_env_vps
EVOLUTION_INSTANCE=motoboy
EVOLUTION_WEBHOOK_SECRET=...
EVOLUTION_BOT_NUMBER=55...
RUN_WHATSAPP_WORKER=false
REDIS_URL=... (Upstash — já feito)
```

## 9. Worker (Railway)

`RUN_WHATSAPP_WORKER=true` + mesmas variáveis.
