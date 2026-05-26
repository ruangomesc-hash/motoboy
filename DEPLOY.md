# Deploy: Vercel + Supabase

**Guia rápido:** [PUBLICAR.md](./PUBLICAR.md)  
**Variáveis para copiar:** [vercel.env.example](./vercel.env.example)

Este projeto está configurado para **um único deploy na Vercel** (app Next.js) com **banco PostgreSQL no Supabase**. Tudo que é cadastrado no app (clientes, afiliados, entregas, perfil, pagamentos, etc.) é persistido no Supabase via Prisma.

## Arquitetura

| Camada | Onde roda | Função |
|--------|-----------|--------|
| **Web + API** | Vercel (`apps/web`) | UI + rotas `/api/backend/*` (mesmo domínio) |
| **Banco** | Supabase Postgres | Dados permanentes |
| **Redis** | Upstash (opcional) | Fila WhatsApp; **não** é obrigatório para login/cadastro |

Em produção, o navegador chama `/api/backend/...` no **mesmo domínio** da Vercel. O handler Next.js executa a API Fastify e grava no Supabase.

## 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Em **Project Settings → Database** copie:
   - **Connection string → Transaction pooler** (porta **6543**) → `DATABASE_URL`
   - **Connection string → Direct** (porta **5432**) → `DIRECT_URL`
3. Adicione `?pgbouncer=true&connection_limit=1` na URL do pooler se ainda não existir.

### Schema do banco

O deploy na Vercel executa automaticamente:

```bash
prisma migrate deploy
```

(migration inicial em `packages/db/prisma/migrations/20260526120000_init/`)

Para aplicar manualmente no Mac:

```bash
cp .env.example .env   # com URLs do Supabase
pnpm install
pnpm db:deploy
```

## 2. Vercel

1. Importe o repositório na [Vercel](https://vercel.com).
2. **Root Directory:** `apps/web`
3. **Framework Preset:** Next.js (detectado automaticamente)
4. **Build Command:** `pnpm vercel-build` (já definido em `vercel.json`)
5. **Install Command:** `cd ../.. && pnpm install`

### Variáveis de ambiente (Vercel → Settings → Environment Variables)

Obrigatórias:

| Variável | Valor |
|----------|--------|
| `DATABASE_URL` | Pooler Supabase (6543) |
| `DIRECT_URL` | Conexão direta Supabase (5432) |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://seu-dominio.vercel.app` |
| `JWT_SECRET` | string longa aleatória (≥16 chars) |
| `APP_URL` | igual a `NEXTAUTH_URL` |
| `ADMIN_EMAIL` | e-mail do painel |
| `ADMIN_PASSWORD` | senha forte |

Recomendadas:

| Variável | Valor |
|----------|--------|
| `NEXT_PUBLIC_ALLOW_ADMIN_DEV_LOGIN` | `false` |
| `NEXT_PUBLIC_ALLOW_DEMO_LOGIN` | `false` |

Opcionais (integrações):

- `REDIS_URL` + `RUN_WHATSAPP_WORKER=true` — fila WhatsApp (Upstash)
- `EVOLUTION_*` — envio de código/login por WhatsApp
- `ASAAS_*` — cobrança
- `OPENAI_API_KEY`, `GOOGLE_MAPS_API_KEY`

**Não defina** `API_URL` na Vercel (a API roda em `/api/backend` no mesmo projeto).

### Região

`vercel.json` usa `gru1` (São Paulo). Ajuste se preferir outra região.

## 3. Verificar após o deploy

1. `https://seu-dominio.vercel.app/api/backend/health` → `{ "ok": true, "database": "connected" }`
2. Cadastro em `/cadastro` → usuário aparece no Supabase (tabela `User`)
3. Painel `/admin` com `ADMIN_EMAIL` / `ADMIN_PASSWORD`

## 4. Desenvolvimento local

```bash
docker compose up -d          # Postgres + Redis locais
cp .env.example .env          # ajuste DATABASE_URL local
pnpm install
pnpm db:push
pnpm dev                      # API :3001 + Web :3002
```

Com Docker, use `DATABASE_URL` e `DIRECT_URL` iguais apontando para `localhost:5432`.

## 5. Socket em tempo real (opcional)

Socket.io **não** roda no serverless da Vercel. O app funciona sem ele (atualize a página para ver novos dados).

Para tempo real:

1. Hospede `apps/api` em um serviço com processo contínuo (Railway, Render, Fly.io).
2. Defina `NEXT_PUBLIC_API_URL=https://sua-api...` e `NEXT_PUBLIC_ENABLE_SOCKET=true`.

## 6. Webhooks (Asaas / Evolution)

Configure URLs apontando para:

`https://seu-dominio.vercel.app/api/backend/webhooks/...`

(confira rotas em `apps/api/src/routes/webhooks.ts`)

## Troubleshooting

| Problema | Solução |
|----------|---------|
| 503 banco | Confira `DATABASE_URL` / `DIRECT_URL`; rode `pnpm db:push` |
| Login sem código WhatsApp | Configure Evolution ou veja logs (modo mock em dev) |
| Build falha Prisma | `DATABASE_URL` e `DIRECT_URL` devem estar nas envs de **Build** na Vercel |
| Admin não entra | `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `JWT_SECRET` |
