# WhatsApp — checklist (baseado no código)

## Fluxo

```text
Zap → Evolution (VPS) → POST webhook → Vercel enfileira (Redis)
                              ↓
                    Railway worker processa → Supabase + resposta Zap
```

**Vercel nunca roda o worker** (`apps/api/src/server.ts` — só inicia worker se `RUN_WHATSAPP_WORKER=true`).

---

## Variáveis por serviço

### Vercel (webhook + site)

| Variável | Obrigatória | Valor |
|----------|-------------|--------|
| `DATABASE_URL` | sim | Supabase pooler **6543** |
| `DIRECT_URL` | sim | Supabase session **5432** (host `pooler`, não `db.xxx`) |
| `REDIS_URL` | sim | Upstash `rediss://...` |
| `EVOLUTION_API_URL` | sim | `https://evo.motocopiloto.com.br` |
| `EVOLUTION_API_KEY` | sim | API Key VPS |
| `EVOLUTION_INSTANCE` | sim | `motoboy` |
| `EVOLUTION_WEBHOOK_SECRET` | sim | mesma API Key (header `apikey`) |
| `EVOLUTION_BOT_NUMBER` | recomendado | `55` + **11 dígitos** (ex. `5531992907578`) |
| `RUN_WHATSAPP_WORKER` | sim | **`false`** |
| `JWT_SECRET` | sim | ≥ 16 caracteres |
| `OPENAI_API_KEY` | não | webhook não usa |

### Railway (worker)

| Variável | Obrigatória | Valor |
|----------|-------------|--------|
| `RUN_WHATSAPP_WORKER` | sim | **`true`** |
| `REDIS_URL` | sim | **igual** Vercel |
| `DATABASE_URL` / `DIRECT_URL` | sim | **iguais** Vercel |
| `EVOLUTION_API_URL` | sim | **igual** Vercel |
| `EVOLUTION_API_KEY` | sim | **igual** Vercel |
| `EVOLUTION_INSTANCE` | sim | `motoboy` |
| `EVOLUTION_WEBHOOK_SECRET` | sim | **igual** Vercel |
| `OPENAI_API_KEY` | **sim p/ valor certo** | `sk-proj-...` (sem isso usa fallback R$ 25) |
| `JWT_SECRET` | sim | **igual** Vercel |
| `APP_URL` | recomendado | `https://app.motocopiloto.com.br` |

---

## Cadastro do número

- Banco guarda `55` + **11 dígitos** (`packages/types/src/phone.ts`).
- No app: ex. `31999998888` → salvo `553199998888`.
- Mensagem tem que sair **desse celular** para o bot — não do número do bot.

---

## Railway — build falhou?

1. Variável no serviço: `NIXPACKS_NODE_VERSION` = `20`
2. Build command (Settings ou `railway.toml`):
   `corepack enable && corepack prepare pnpm@9.15.0 --activate && pnpm install && pnpm prepare:deploy && pnpm --filter @motoboy/api build`
3. Start: `pnpm --filter @motoboy/api start`
4. Logs: se aparecer `[node-version] Projeto exige Node 20`, o Node do Railway está errado.

## Testes

```bash
# 1) Health
curl https://app.motocopiloto.com.br/api/backend/health

# 2) Webhook (troque apikey e um JID válido de 11 dígitos)
curl -X POST https://app.motocopiloto.com.br/api/backend/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -H "apikey: SUA_API_KEY" \
  -d '{"data":{"key":{"remoteJid":"5531999988888@s.whatsapp.net","fromMe":false,"id":"t1"},"message":{"conversation":"R$ 30 entrega teste"}}}'
```

Esperado: `{"ok":true,"queued":true}` — se `queued` ok mas Zap não responde, problema é **Railway worker**.

---

## Evolution VPS

Webhook com header `apikey` (script `pnpm whatsapp:setup --qr-only` ou API `webhook/set` com body `{ "webhook": { ... } }`).

Evento: `MESSAGES_UPSERT`.
