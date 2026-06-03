# Integração Asaas (gateway de pagamento)

Documentação: [docs.asaas.com](https://docs.asaas.com/)

## Variáveis de ambiente

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `ASAAS_API_KEY` | Sim (produção) | Chave em **Integrações → API** no painel Asaas |
| `ASAAS_WEBHOOK_TOKEN` | Sim (produção) | Token definido ao cadastrar o webhook no Asaas |
| `ASAAS_SANDBOX` | Sim | `true` = sandbox.asaas.com · `false` = api.asaas.com (produção) |

Sem `ASAAS_API_KEY`, o app usa **modo mock** (útil só em dev).

## URLs da API (já configuradas no código)

| Ambiente | Base URL |
|----------|----------|
| Sandbox | `https://sandbox.asaas.com/api/v3` |
| Produção | `https://api.asaas.com/v3` |

Autenticação: header `access_token: SUA_API_KEY`

## Webhook (ativa assinatura automaticamente)

No painel Asaas → **Integrações → Webhooks → Adicionar**:

| Campo | Valor |
|-------|--------|
| **URL** | `https://SEU-DOMINIO.vercel.app/api/backend/webhooks/asaas` |
| **Token de autenticação** | mesmo valor de `ASAAS_WEBHOOK_TOKEN` na Vercel |
| **Eventos** | `PAYMENT_CREATED`, `PAYMENT_RECEIVED`, `PAYMENT_CONFIRMED`, `PAYMENT_OVERDUE`, `PAYMENT_REFUNDED`, `SUBSCRIPTION_DELETED`, `SUBSCRIPTION_INACTIVATED`, `PIX_AUTOMATIC_RECURRING_AUTHORIZATION_ACTIVATED`, `PIX_AUTOMATIC_RECURRING_AUTHORIZATION_CANCELLED` |

O Asaas envia o header `asaas-access-token` — validado no servidor.

Quando o pagamento é confirmado:

1. `Payment` → status `PAID`
2. `User` → status `ACTIVE`, `subscribedAt` preenchido

## Fluxos no app

| Fluxo | Endpoint | Asaas |
|-------|----------|-------|
| Motoboy assina (checkout transparente) | `POST /me/subscribe` | Cria cliente + assinatura mensal + 1ª cobrança; retorna Pix/boleto no JSON |
| Admin link Pix | `POST /admin/users/:id/payment-link` | Cobrança **avulsa** (regularização suporte); após pagamento, `ensureRecurringSubscription` liga a recorrência mensal |
| Admin baixa manual | `POST /admin/users/:id/activate` | Ativa no banco + garante assinatura recorrente no Asaas quando possível |

Clientes e assinaturas Asaas ficam em `User.asaasCustomerId` e `User.asaasSubscriptionId`. Idempotência de webhooks em `AsaasWebhookEvent`.

Cancelamento pelo app: `POST /me/subscription/cancel` → `DELETE /v3/subscriptions/{id}` no Asaas.

### Checkout transparente (`/assinar`)

1. Motoboy escolhe Pix, cartão ou boleto e clica **Gerar pagamento**.
2. A API cria a assinatura no Asaas e devolve `pixCopyPaste`, `invoiceUrl` (boleto), `chargeId`.
3. O app exibe o Pix (copia e cola) ou link do boleto **sem redirecionar** para site externo.
4. O webhook Asaas ativa a conta; a tela faz polling em `GET /me/subscription` até `ACTIVE`.

O formulário de **cartão** na mesma tela será integrado com a API de checkout transparente do Asaas (tokenização no front).

## Testar em sandbox

1. Crie conta em [sandbox.asaas.com](https://sandbox.asaas.com/)
2. Gere API Key de sandbox
3. Na Vercel (preview): `ASAAS_SANDBOX=true` + `ASAAS_API_KEY` de sandbox
4. Use cartões/Pix de teste do Asaas

## Health check

`GET /api/backend/health` retorna:

```json
{
  "asaas": {
    "configured": true,
    "sandbox": true,
    "webhookPath": "/api/backend/webhooks/asaas"
  }
}
```
