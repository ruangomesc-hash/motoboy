# Integração CartPanda (pagamentos)

Checkout: **https://assinatura.motocopiloto.com.br**  
App: **https://app.motocopiloto.com.br**

## Variáveis de ambiente (Vercel)

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `CARTPANDA_CHECKOUT_URL` | Sim (produção) | URL base do checkout, ex. `https://assinatura.motocopiloto.com.br` |
| `CARTPANDA_WEBHOOK_SECRET` | Recomendado | Token que você define; enviado no header do webhook |
| `APP_URL` | Sim | `https://app.motocopiloto.com.br` |

## Webhook (ativa assinatura automaticamente)

No painel CartPanda → **Admin → Notificações → Webhooks → Criar webhook**:

| Campo | Valor |
|-------|--------|
| **Nome** | Motocopiloto |
| **Evento** | **Pedido pago** (e opcional **Pedido reembolsado**) |
| **Endpoint** | `https://app.motocopiloto.com.br/api/backend/webhooks/cartpanda` |
| **Produtos** | Produto da assinatura Motocopiloto Pro |

Se usar `CARTPANDA_WEBHOOK_SECRET`, configure o mesmo valor no header (ex. `x-webhook-secret`) ou query `?token=...` — conforme o painel CartPanda permitir.

Quando o pagamento é confirmado:

1. O webhook traz **e-mail** e **telefone** do checkout.
2. O sistema busca o usuário com o **mesmo WhatsApp** e/ou **mesmo e-mail** do cadastro.
3. `User` → status `ACTIVE`, `subscribedAt` preenchido.

**Importante:** o motoboy deve usar no checkout o **mesmo e-mail e WhatsApp** cadastrados no app.

## Fluxo no app

| Passo | O que acontece |
|-------|----------------|
| Motoboy em `/assinar` | Clica em **Ir para pagamento** |
| API | `POST /me/subscribe` → URL do checkout com `email`, `phone` e `utm_content={userId}` |
| Checkout CartPanda | Pix ou cartão em assinatura.motocopiloto.com.br |
| Webhook | Conta ativa em segundos |

## Testar webhook

1. Use [webhook.site](https://webhook.site) temporariamente ou o endpoint de produção.
2. Faça uma compra de teste com o **mesmo e-mail e telefone** de um usuário trial no app.
3. Confira em Admin → clientes se o status virou **ACTIVE**.

## Health check

`GET /api/backend/health` inclui:

```json
{
  "cartpanda": {
    "configured": true,
    "checkoutUrl": "https://assinatura.motocopiloto.com.br",
    "webhookPath": "/api/backend/webhooks/cartpanda"
  }
}
```

## Asaas (legado)

Rotas Asaas (`/webhooks/asaas`, admin) permanecem no código para cobranças antigas, mas **novas assinaturas** usam CartPanda.
