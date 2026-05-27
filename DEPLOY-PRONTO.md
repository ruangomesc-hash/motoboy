# Motocopiloto — colocar 100% no ar (uma vez)

Use este arquivo como checklist único. Depois do deploy com o commit que corrige o Prisma, **não precisa ficar mandando patch por patch**.

## 1. Supabase

1. Crie o projeto em [supabase.com](https://supabase.com).
2. **Settings → Database**:
   - **Transaction pooler (6543)** → `DATABASE_URL` (com `?pgbouncer=true&connection_limit=1`)
   - **Direct (5432)** → `DIRECT_URL`
3. No Mac, na raiz do repo (com `.env` preenchido):

```bash
bash scripts/setup-supabase.sh
# ou: pnpm db:deploy
```

Isso cria todas as tabelas, inclusive `AdminAccount`.

## 2. Vercel — configuração do projeto

| Campo | Valor |
|-------|--------|
| **Root Directory** | `apps/web` |
| **Install Command** | `cd ../.. && pnpm install --no-frozen-lockfile` |
| **Build Command** | `cd ../.. && node scripts/vercel-build.mjs` |
| **Node** | 20.x |

## 3. Variáveis de ambiente (Production)

Copie de `vercel.env.example`. **Todas as URLs com `https://`** (sem isso o login quebra).

| Variável | Obrigatório | Notas |
|----------|-------------|--------|
| `DATABASE_URL` | Sim | Pooler 6543 + `pgbouncer=true` |
| `DIRECT_URL` | Sim | Porta 5432 |
| `NEXTAUTH_SECRET` | Sim | `openssl rand -base64 32` |
| `JWT_SECRET` | Sim | Mín. 16 caracteres |
| `NEXTAUTH_URL` | Sim | `https://seu-app.vercel.app` |
| `APP_URL` | Sim | Mesmo domínio |
| `NEXT_PUBLIC_APP_URL` | Sim | Mesmo domínio |
| `ADMIN_EMAIL` | Sim | E-mail do primeiro admin |
| `ALLOW_SKIP_AUTH_CODE` | Recomendado | `true` — cadastro/login sem WhatsApp |
| `NEXT_PUBLIC_ALLOW_SKIP_AUTH_CODE` | Recomendado | `true` |
| `NEXT_PUBLIC_ALLOW_DEMO_LOGIN` | Recomendado | `false` em produção |
| `NEXT_PUBLIC_ALLOW_ADMIN_DEV_LOGIN` | Recomendado | `false` em produção |

**Não defina** `API_URL` em produção (a API roda em `/api/backend` no mesmo domínio).

**Não defina** `EVOLUTION_*` até querer WhatsApp de verdade.

`ADMIN_PASSWORD` no env é opcional: na primeira vez use **Continuar sem senha** em `/admin/login` e defina a senha no painel (fica no banco).

**Obrigatório:** marque **Build** em `DATABASE_URL` e `DIRECT_URL` (o deploy cria as tabelas, inclusive `AdminAccount`).

Para entrar no admin **antes** das migrations: defina também `ADMIN_EMAIL` e `ADMIN_PASSWORD` na Vercel e use **Entrar** com essa senha.

## 4. Deploy

1. Push do repositório (branch `main`).
2. Vercel → **Deployments** → último deploy → **Redeploy** → marque **Clear build cache**.
3. Aguarde status **Ready**.

## 5. Testes (2 minutos)

Substitua `SEU-DOMINIO` pelo domínio real.

| Teste | URL / ação | Esperado |
|-------|------------|----------|
| Health | `GET /api/backend/health` | `"ok": true`, `"database": "connected"` |
| Cadastro | `/cadastro` → criar conta | Entra no app, sem código WhatsApp |
| Login | `/login` | Entra com WhatsApp + código `000000` (modo skip) |
| Admin | `/admin/login` | Continuar sem senha → definir senha → painel |

Se `/api/backend/health` retornar erro de Prisma: confira que o deploy é do commit com fix (`@prisma/client` **não** external + plugin monorepo) e refaça redeploy **sem cache**.

## 6. Uso diário

- **Cadastro/login**: sem Evolution API, fluxo direto com código interno `000000`.
- **Admin**: senha salva em `AdminAccount` após primeiro acesso.
- **Sync entre telas**: polling ~15s + eventos locais (sem Redis obrigatório).
- **Pagamentos Asaas**: ver `docs/ASAAS.md` quando for ativar cobrança.

## Problemas comuns

| Sintoma | Causa | Ação |
|---------|--------|------|
| Mensagem vermelha Prisma no cadastro | Engine não no bundle serverless | Redeploy sem cache; commit com fix de tracing |
| `Failed to parse URL` | URL sem `https://` | Corrigir `NEXTAUTH_URL`, `APP_URL`, `NEXT_PUBLIC_APP_URL` |
| Admin pede migrations | Banco vazio | Rodar `setup-supabase.sh` |
| Localhost sem CSS | Node errado / cache | `nvm use 20`, apagar `.next`, `pnpm --filter @motoboy/web dev` |
| Porta em uso | Dev já rodando | Matar processo na 3002 ou usar outra porta |

## Local (desenvolvimento)

```bash
nvm use 20   # recomendado
pnpm install
cp .env.example .env   # preencher Supabase
pnpm db:deploy
pnpm --filter @motoboy/web dev   # http://localhost:3002
```

API local separada (opcional): `pnpm --filter @motoboy/api dev` na 3001 + `API_URL=http://localhost:3001` no `.env` do web.
