# WhatsApp — checklist (baseado no código)

## Fluxo

```text
Zap → Evolution (VPS) → POST webhook → Vercel enfileira (Redis)
                              ↓
                    Railway worker processa → Supabase + resposta Zap
```

**Vercel nunca roda o worker BullMQ** — processa **inline** no webhook (`RUN_WHATSAPP_WORKER=false`).

**Railway** com `RUN_WHATSAPP_WORKER=true` só processa fila se o webhook enfileirar (deploy alternativo); em produção padrão o processamento é na Vercel.

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

## Railway — build ou healthcheck

1. Variável no serviço: `NIXPACKS_NODE_VERSION` = `20`
2. Build/start: `railway.toml` usa `pnpm --filter @motoboy/api... build` (compila **types**, **db**, **ai** e **api** — Node não roda `.ts` dos pacotes workspace).
3. Healthcheck: `GET /health/live` (só liveness). Depois do deploy, confira `GET /health` no domínio público do worker (se exposto) ou nos logs.
4. **Travou em “Performing healthchecks…”**: abra **View logs** (runtime). Causas comuns:
   - boot falhou (`JWT_SECRET`, `DATABASE_URL`, `EVOLUTION_WEBHOOK_SECRET` ausentes);
   - worker não sobe — log `Worker WhatsApp NÃO iniciado` + lista `missing`;
   - `/health` com DB errado (deploy pode passar com `/health/live`, mas Zap não funciona até corrigir `DATABASE_URL`).
5. Logs: se aparecer `[node-version] Projeto exige Node 20`, o Node do Railway está errado.

## Diagnóstico (causa raiz)

Depois do deploy com `/health/whatsapp`:

```bash
curl -s https://app.motocopiloto.com.br/api/backend/health/whatsapp | jq
```

Ou no painel: **Admin → Status → Pipeline WhatsApp** (lê Evolution + banco com as vars da Vercel).

Local (com `.env` igual à Vercel):

```bash
APP_URL=https://app.motocopiloto.com.br EVOLUTION_INSTANCE=motoboy pnpm whatsapp:diagnose
```

Se `messagesLast24h: 0` e `WEBHOOK_URL_MISMATCH` → a Evolution **não está chamando** a Vercel (mensagem nunca chega; o app não tem o que atualizar).

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
