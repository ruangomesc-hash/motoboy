# WhatsApp via Evolution API

Guia para conectar o Motocopiloto à Evolution: receber mensagens, gravar no Supabase e responder só confirmação ok/erro.

## Arquitetura

```text
Motoboy → WhatsApp → Evolution (VPS) → webhook Vercel → Redis (Upstash)
                                              ↓
                                    Worker (Railway/VPS/local)
                                              ↓
                                    Supabase + resposta no Zap
```

- **Vercel:** recebe webhook e enfileira (`RUN_WHATSAPP_WORKER=false`).
- **Worker:** processa fila (`RUN_WHATSAPP_WORKER=true` + `REDIS_URL`).

## Checklist (ordem sugerida)

### 1. Evolution API no ar

1. Suba a Evolution em uma VPS (Docker) ou Railway — [doc oficial](https://doc.evolution-api.com/).
2. Defina `AUTHENTICATION_API_KEY` → será `EVOLUTION_API_KEY`.
3. Crie instância (ex.: `motoboy`) e conecte o WhatsApp (QR).
4. Use **número dedicado** do produto (não pessoal).

### 2. Webhook na Evolution

| Campo | Valor |
|-------|--------|
| URL | `https://app.motocopiloto.com.br/api/backend/webhooks/whatsapp` |
| Header | `apikey: <EVOLUTION_WEBHOOK_SECRET>` |
| Evento | `MESSAGES_UPSERT` (ou equivalente na sua versão) |

Gere o segredo:

```bash
openssl rand -hex 32
```

### 3. Variáveis na Vercel

```env
EVOLUTION_API_URL=https://evolution.seudominio.com
EVOLUTION_API_KEY=sua_api_key
EVOLUTION_INSTANCE=motoboy
EVOLUTION_BOT_NUMBER=5511999887766
EVOLUTION_WEBHOOK_SECRET=seu_segredo

REDIS_URL=rediss://...@....upstash.io:6379
OPENAI_API_KEY=sk-...

RUN_WHATSAPP_WORKER=false
```

Mantenha `DATABASE_URL`, `NEXTAUTH_*`, `APP_URL`, etc.

### 4. Redis (Upstash)

1. [upstash.com](https://upstash.com) → database Redis.
2. Copie `REDIS_URL` para Vercel **e** para o servidor do worker.

### 5. Worker (obrigatório)

O processamento **não** roda na Vercel. Opções:

- **Railway / Render / Fly:** deploy de `apps/api` com `pnpm start` ou comando do pacote.
- **Local:** `pnpm dev:api` com `RUN_WHATSAPP_WORKER=true`.

Env no worker (igual Vercel +):

```env
RUN_WHATSAPP_WORKER=true
PORT=3001
APP_URL=https://app.motocopiloto.com.br
```

### 6. Cadastro no app

O motoboy precisa existir com o **mesmo** `whatsappNumber` que manda no Zap. Número desconhecido recebe:

> ❌ WhatsApp não cadastrado. Entre no app e use o mesmo número em Configurações.

### 7. Testar

1. Health: `GET /api/backend/health`
2. Do celular cadastrado, envie: `R$ 30 entrega teste`
3. Confirme entrega no Supabase / app (refresh na Home)
4. Logs do worker sem erro

Teste webhook (substitua URL e segredo):

```bash
curl -X POST "https://app.motocopiloto.com.br/api/backend/webhooks/whatsapp" \
  -H "Content-Type: application/json" \
  -H "apikey: SEU_EVOLUTION_WEBHOOK_SECRET" \
  -d '{
    "data": {
      "key": {
        "remoteJid": "5511999887766@s.whatsapp.net",
        "fromMe": false,
        "id": "TEST1"
      },
      "message": { "conversation": "R$ 25 teste" }
    }
  }'
```

Esperado: `{ "ok": true, "queued": true }`

## Local (dev)

```bash
docker compose up -d
cp .env.example .env   # EVOLUTION_*, REDIS_URL, OPENAI_API_KEY
pnpm install && pnpm db:push
```

`.env`:

```env
EVOLUTION_API_URL=http://localhost:8080
RUN_WHATSAPP_WORKER=true
REDIS_URL=redis://localhost:6379
APP_URL=http://localhost:3002
API_URL=http://localhost:3001
```

```bash
pnpm dev:api   # terminal 1
pnpm dev:web   # terminal 2
```

Webhook local: ngrok → `http://localhost:3001/webhooks/whatsapp`

## Problemas comuns

| Sintoma | Solução |
|---------|---------|
| 401 webhook | Conferir `apikey` = `EVOLUTION_WEBHOOK_SECRET` |
| `queued` mas nada no app | Ligar worker + `REDIS_URL` |
| “Não cadastrado” | Mesmo número no app (Configurações) |
| Evolution cai | Reescanear QR |

## Custo

Evolution (software): gratuito. Pague VPS (~R$ 40–120/mês) + Upstash + worker + **OpenAI** (principal variável).
