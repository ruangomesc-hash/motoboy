import type { BillingStatusLoadState } from "@/hooks/use-billing-status";

export function billingAsaasNotice(
  loadState: BillingStatusLoadState,
  asaasConfigured: boolean | null,
  subscriptionActive: boolean,
): string | null {
  if (subscriptionActive) return null;

  if (loadState === "error" && asaasConfigured !== true) {
    return "Não foi possível carregar o status da assinatura. O checkout Pix ainda funciona abaixo — ou atualize a página.";
  }

  if (loadState !== "ready") return null;

  if (asaasConfigured === null) {
    return "Não foi possível verificar o gateway de pagamento. Tente de novo em instantes.";
  }

  if (!asaasConfigured) {
    return (
      "Pagamento indisponível neste ambiente: defina ASAAS_API_KEY e ASAAS_WEBHOOK_TOKEN " +
      "nas variáveis do projeto Vercel (o checkout usa /api/backend neste domínio, não só a API no Railway)."
    );
  }

  return null;
}
