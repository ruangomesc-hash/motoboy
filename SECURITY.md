# Segurança — Motocopiloto

Nenhum sistema é “100% invulnerável”. Este documento descreve o modelo de defesa do app e o que você **deve** configurar na Vercel/Supabase.

## Modelo de dados (Supabase)

- O app usa **apenas Prisma** com `DATABASE_URL` no servidor.
- **Não** usamos Supabase Auth nem chave `anon` no frontend — isso evita bypass de RLS via cliente.
- O Postgres fica **inacessível pela internet** para o app do motoboy; só a API (Vercel) conecta.
- Proteja `DATABASE_URL` como segredo tier-0; ative **SSL** e senha forte no Supabase.

## Checklist de produção (Vercel)

| Variável | Valor recomendado |
|----------|-------------------|
| `ALLOW_SKIP_AUTH_CODE` | **`false`** |
| `JWT_SECRET` | `openssl rand -base64 32` (mín. 16 caracteres) |
| `NEXTAUTH_SECRET` | outro valor aleatório forte |
| `ADMIN_SETUP_TOKEN` | token único (mín. 16 chars) — só para o **primeiro** setup do `/admin` |
| `EVOLUTION_WEBHOOK_SECRET` | igual ao configurado no Evolution (ou use `EVOLUTION_API_KEY` no header `apikey`) |
| `ASAAS_WEBHOOK_TOKEN` | obrigatório se `ASAAS_API_KEY` estiver definido |
| `NEXT_PUBLIC_ALLOW_DEMO_LOGIN` | **`false`** |
| `NEXT_PUBLIC_ALLOW_ADMIN_DEV_LOGIN` | **`false`** |
| `NEXT_PUBLIC_ALLOW_SKIP_AUTH_CODE` | **`false`** ou remova |

Após o primeiro admin criado, mantenha `ADMIN_SETUP_TOKEN` — ele protege o endpoint de setup.

## O que foi endurecido no código

### Autenticação
- OTP com `crypto.randomInt` (não `Math.random`).
- Código **`000000` removido** — não há bypass de OTP em produção.
- `ALLOW_SKIP_AUTH_CODE` desligado por padrão em produção.
- Cadastro com senha via `POST /auth/register/complete` (sem OTP falso).
- Rate limit em login, OTP, webhooks e admin.
- JWT restrito a algoritmo **HS256**.

### Webhooks
- WhatsApp (Evolution): exige `apikey` / `x-webhook-secret` igual ao segredo configurado.
- Asaas: token obrigatório em produção quando Asaas está ativo.

### API / dados
- Entregas na API **sem** campo `rawInput` (payload WhatsApp/IA).
- Rotas `/me/*` filtradas por `userId` da sessão (anti-IDOR).
- Validação Zod com limites de tamanho em textos e roteirizador.

### Admin
- Setup do painel exige `ADMIN_SETUP_TOKEN` em produção (API + proxy Next).
- Login admin por env (`ADMIN_PASSWORD`) desabilitado em produção.
- E-mail de bootstrap não exposto na API em produção.

### Web
- Headers de segurança (HSTS, `nosniff`, `DENY` frame, etc.).
- Demo e admin-dev bloqueados em produção no middleware.
- Socket.io exige JWT no handshake (não aceita `userId` solto).

## Ainda recomendado (operação)

1. **Supabase**: desative acesso público desnecessário; rotacione senha do banco se vazou.
2. **Vercel**: restrinja quem vê/envia variáveis de ambiente.
3. **Evolution / Asaas**: use IPs allowlist no painel deles, se disponível.
4. **Monitoramento**: alertas para 401/429 em massa em `/auth/*` e webhooks.
5. **Backups** e plano de rotação de `JWT_SECRET` (invalida sessões atuais).

## Relatar vulnerabilidade

Envie detalhes (passos para reproduzir, impacto) ao responsável pelo projeto. Não publique exploits antes da correção.
