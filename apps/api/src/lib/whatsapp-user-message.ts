/** Mensagens curtas enviadas ao motoboy no WhatsApp (não são traduções admin). */
export function formatWhatsAppProcessingError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();

  if (lower.includes("openai") || lower.includes("quota")) {
    return "⚠️ IA temporariamente indisponível. Tente de novo em 1 minuto ou registre no app.";
  }
  if (lower.includes("prisma") || lower.includes("database") || lower.includes("connect")) {
    return "⚠️ Erro ao salvar no servidor. Tente de novo ou registre no app Motocopiloto.";
  }
  if (lower.includes("maps") || lower.includes("geocod")) {
    return "⚠️ Não consegui calcular a rota agora. Confira os endereços e tente de novo.";
  }

  return "⚠️ Não consegui processar sua mensagem agora. Tente de novo em instantes ou use o app.";
}

export const WHATSAPP_QUEUE_DOWN_MESSAGE =
  "⚠️ Sistema de mensagens temporariamente indisponível. Tente em 1 minuto ou registre a entrega no app.";

export const WHATSAPP_INVALID_PAYLOAD_MESSAGE =
  "⚠️ Não consegui ler sua mensagem. Envie texto simples, ex.: entrega farmácia 25 reais";
