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
| **Eventos** | `PAYMENT_RECEIVED`, `PAYMENT_CONFIRMED`, `PAYMENT_OVERDUE`, `PAYMENT_REFUNDED` |

O Asaas envia o header `asaas-access-token` — validado no servidor.

Quando o pagamento é confirmado:

1. `Payment` → status `PAID`
2. `User` → status `ACTIVE`, `subscribedAt` preenchido

## Fluxos no app

| Fluxo | Endpoint | Asaas |
|-------|----------|-------|
| Motoboy assina | `POST /me/subscribe` | Cria cliente + assinatura mensal + 1ª cobrança |
| Admin link Pix | `POST /admin/users/:id/payment-link` | Cria cliente + cobrança avulsa |
| Admin baixa manual | `POST /admin/users/:id/activate` | Só banco (sem Asaas) |

Clientes Asaas são vinculados em `User.asaasCustomerId` (evita duplicar cadastro).

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
    "webhook": "/api/backend/webhooks/asaas"
  }
}
```
