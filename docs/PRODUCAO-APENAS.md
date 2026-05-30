# Usar só produção (sem Mac / Docker local)

Evolution e WhatsApp **não** devem rodar no Mac e na VPS ao mesmo tempo (uma sessão por número).

## 1. Parar o Mac

```bash
cd app-motoboy
bash scripts/stop-local-stack.sh
# opcional — desliga a VM Docker:
colima stop
```

Confirme que nada escuta na porta 8080:

```bash
docker ps   # não deve listar motoboy_evolution
```

## 2. `.env` local (se ainda desenvolver no Mac)

Aponte tudo para **online** — não use `localhost` para Evolution/Redis:

```env
EVOLUTION_API_URL=https://evo.motocopiloto.com.br
EVOLUTION_API_KEY=<mesma da VPS>
EVOLUTION_INSTANCE=motoboy
EVOLUTION_WEBHOOK_SECRET=<mesma API Key>
EVOLUTION_BOT_NUMBER=553192907578

REDIS_URL=<Upstash rediss://...>
DATABASE_URL=<Supabase pooler 6543>
DIRECT_URL=<Supabase session pooler 5432>

RUN_WHATSAPP_WORKER=false
API_URL=https://app.motocopiloto.com.br/api/backend
```

**Não** rode `pnpm whatsapp:setup` sem `--qr-only` (isso sobe Docker de novo).

## 3. Onde cada coisa roda (24h)

| Serviço | Onde |
|---------|------|
| WhatsApp + Evolution | VPS `evo.motocopiloto.com.br` |
| Site + webhook | Vercel `app.motocopiloto.com.br` |
| Worker fila | Railway |
| Banco | Supabase |
| Redis | Upstash |

## 4. Evitar conflito de novo

- Não abrir Docker/Colima para Evolution no dia a dia
- No Manager, instância conectada só na **VPS**
- Teste: mensagem `R$ 30 entrega teste` → deve ir pelo webhook Vercel + worker Railway
