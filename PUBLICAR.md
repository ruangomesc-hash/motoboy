# Publicar Motocopiloto (Vercel + Supabase)

Checklist para colocar o app no ar. Tudo que o usuário cadastra fica no **Supabase**.

## 1. Supabase (5 min)

1. [supabase.com](https://supabase.com) → **New project**
2. **Settings → Database** → copie:
   - **Transaction pooler** (porta **6543**) → `DATABASE_URL`
   - **Session / Direct** (porta **5432**) → `DIRECT_URL`
3. Confirme que `DATABASE_URL` tem `?pgbouncer=true&connection_limit=1`

Não precisa rodar SQL manual — o deploy na Vercel aplica as migrations.

## 2. Vercel (10 min)

1. [vercel.com](https://vercel.com) → **Add New → Project** → importe o GitHub
2. Configuração **importante**:

| Campo | Valor |
|-------|--------|
| **Root Directory** | `apps/web` (obrigatório) |
| **Framework** | Next.js |
| **Build Command** | `cd ../.. && node scripts/vercel-build.mjs` |
| **Install Command** | `cd ../.. && pnpm install --no-frozen-lockfile` |

Após o primeiro deploy com sucesso, no Mac: `pnpm db:deploy` (com `.env` do Supabase) para criar as tabelas.

3. **Environment Variables** — copie de `vercel.env.example` e preencha:

   Obrigatórias:
   - `DATABASE_URL`, `DIRECT_URL`
   - `NEXTAUTH_SECRET` → terminal: `openssl rand -base64 32`
   - `JWT_SECRET` → outro valor aleatório (mín. 16 caracteres)
   - `NEXTAUTH_URL` e `APP_URL` e `NEXT_PUBLIC_APP_URL` → `https://seu-projeto.vercel.app`
   - `ADMIN_EMAIL` (senha: defina na primeira visita em `/admin/login`, ou use `ADMIN_PASSWORD` no env)
   - `ALLOW_SKIP_AUTH_CODE=true` e `NEXT_PUBLIC_ALLOW_SKIP_AUTH_CODE=true` (cadastro sem WhatsApp)

   Desligar demo:
   - `NEXT_PUBLIC_ALLOW_DEMO_LOGIN` = `false`
   - `NEXT_PUBLIC_ALLOW_ADMIN_DEV_LOGIN` = `false`

4. Em cada variável do banco, marque **Environment: Production** e **Build** (para migrations no deploy).

5. **Deploy**

## 2b. Asaas (pagamentos)

1. Conta em [asaas.com](https://www.asaas.com/) (ou [sandbox](https://sandbox.asaas.com/) para testes)
2. **Integrações → API** → copie a chave → `ASAAS_API_KEY`
3. **Integrações → Webhooks** → URL:
   `https://SEU-DOMINIO.vercel.app/api/backend/webhooks/asaas`
   - Token = `ASAAS_WEBHOOK_TOKEN` (mesmo valor na Vercel)
   - Eventos: pagamento recebido / confirmado
4. `ASAAS_SANDBOX=true` em preview · `false` em produção

Detalhes: [docs/ASAAS.md](./docs/ASAAS.md)

## 3. Depois do deploy

1. Abra `https://SEU-DOMINIO.vercel.app/api/backend/health`  
   → deve retornar `"ok": true` e `"database": "connected"`

2. Cadastro: `/cadastro` → confira na Supabase → **Table Editor → User**

3. Admin: `/admin/login` → **Continuar sem senha** (primeira vez) → definir senha → painel

Checklist completo: [DEPLOY-PRONTO.md](./DEPLOY-PRONTO.md)

## 4. Domínio próprio (opcional)

Vercel → **Domains** → adicione `app.seudominio.com`  
Atualize `NEXTAUTH_URL`, `APP_URL` e `NEXT_PUBLIC_APP_URL` para o domínio novo → **Redeploy**.

## Problemas comuns

| Sintoma | Solução |
|---------|---------|
| Build falha “DATABASE_URL” | Cadastre a variável e marque **Build** |
| Health 503 | `DIRECT_URL` correta; veja logs do deploy (migrate) |
| Login admin não funciona | `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `JWT_SECRET` |
| Código WhatsApp não chega | Com `ALLOW_SKIP_AUTH_CODE=true`, use cadastro direto; Evolution só quando ativar |
| Erro Prisma no cadastro | Redeploy **sem cache**; ver [DEPLOY-PRONTO.md](./DEPLOY-PRONTO.md) |

Guia técnico completo: [DEPLOY.md](./DEPLOY.md)
