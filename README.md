# MotoCheck

Copiloto financeiro e logístico para motoboys brasileiros. Registro via WhatsApp; dashboard em PWA.

## Stack

- **Monorepo** pnpm workspaces
- **API**: Node 20, Fastify, Prisma, PostgreSQL, BullMQ, Socket.io
- **Web**: Next.js 14, Tailwind, shadcn-style UI, PWA
- **IA**: OpenAI Whisper + gpt-4o-mini + gpt-4o vision

## Deploy em produção (Vercel + Supabase)

**Publicar agora:** **[PUBLICAR.md](./PUBLICAR.md)** (checklist)  
Variáveis: **[vercel.env.example](./vercel.env.example)**  
Detalhes: **[DEPLOY.md](./DEPLOY.md)**

- **Vercel:** app + API no mesmo domínio (`/api/backend/*` → Supabase)
- **Supabase:** PostgreSQL (todos os cadastros e dados do app)
- **Redis (Upstash):** opcional — só para fila WhatsApp

## Pré-requisitos

- Node.js 20+
- pnpm 9+
- Docker (Postgres 16 + Redis) — ou Supabase na nuvem

## Setup

```bash
cp .env.example .env
# Edite .env com suas chaves (Evolution, OpenAI, etc.)

docker compose up -d

pnpm install
pnpm db:push

pnpm dev
# ou só a PWA: pnpm dev:web  →  http://localhost:3002
```

- **PWA (MotoCheck):** http://localhost:3002
- **API:** http://localhost:3001

> Use a porta **3002** de propósito — a **3000** costuma ser de outros projetos no mesmo Mac (ex.: ARKENOS). São apps independentes.

No desktop, o app aparece dentro de um frame de celular com tema verde. No mobile, ocupa a tela inteira.

## Fluxo WhatsApp

1. Configure webhook da Evolution API → `POST http://seu-servidor:3001/webhooks/whatsapp`
2. Motoboy manda áudio/texto/foto
3. Worker processa (Whisper/GPT), salva entrega, responde no WhatsApp
4. PWA atualiza em tempo real via Socket.io

### Abastecimento e hodômetro (WhatsApp)

| Envio | O que registra |
|-------|----------------|
| Foto do **cupom do posto** | Valor pago + litros → custo real do dia |
| Texto/áudio: *"abasteci 40 reais 6 litros"* | Mesmo registro |
| Foto do **painel da moto** | KM do hodômetro → km rodado e logística |
| Texto: *"painel 45820 km"* | Leitura do hodômetro |

O lucro do dia usa **soma dos abastecimentos reais** quando existirem; senão estima por km. Mostra **último preço/L** e **média** na home e em Config.

## Auth

Login com número WhatsApp + código de 6 dígitos enviado pelo bot.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | API + Web em paralelo |
| `pnpm dev:api` | Só API |
| `pnpm dev:web` | Só PWA |
| `pnpm db:migrate` | Migrations Prisma |
| `pnpm test` | Testes Vitest (pipeline IA) |

## TODO (V2)

- Captura automática Android (acessibilidade)
- Multi-idioma
- Heatmap de regiões lucrativas
