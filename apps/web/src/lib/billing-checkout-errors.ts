/** Mensagens amigáveis para erros de checkout Pix/cartão. */
export function formatBillingCheckoutError(
  message: string,
  code?: string,
  status?: number,
): string {
  if (code === "BILLING_MIGRATIONS_REQUIRED") {
    return (
      message ||
      "Banco desatualizado para pagamentos. Rode o deploy com migrations ou configure DIRECT_URL na Vercel."
    );
  }
  if (code === "ASAAS_AUTH_ERROR") {
    return message;
  }
  if (code === "ASAAS_UNAVAILABLE" || code === "ASAAS_ERROR") {
    return message || "Gateway de pagamento indisponível. Tente novamente em instantes.";
  }
  if (code === "PIX_QR_UNAVAILABLE" || code === "PIX_QR_EMPTY") {
    return message || "Não foi possível gerar o Pix. Tente novamente em instantes.";
  }
  if (status === 503 && !message.includes("banco")) {
    return message || "Pagamento indisponível no momento. Tente mais tarde.";
  }
  return message;
}
