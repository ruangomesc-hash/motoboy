/** Webhook na Vercel deve processar inline — fila só em worker dedicado (Railway). */
export function isVercelServerless(): boolean {
  return process.env.VERCEL === "1" || Boolean(process.env.VERCEL_ENV?.trim());
}

/** Enfileira só fora da Vercel com worker explícito; evita ~1 min na fila Upstash. */
export function shouldEnqueueWhatsAppOnWebhook(): boolean {
  if (isVercelServerless()) return false;
  return (
    process.env.RUN_WHATSAPP_WORKER === "true" &&
    Boolean(process.env.REDIS_URL?.trim())
  );
}

export function whatsappProcessingMode(): "inline" | "queue" {
  return shouldEnqueueWhatsAppOnWebhook() ? "queue" : "inline";
}
