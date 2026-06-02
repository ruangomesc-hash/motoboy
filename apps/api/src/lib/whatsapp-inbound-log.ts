import { prisma } from "@motoboy/db";

/** Auditoria: toda chamada ao webhook (antes de falhar parse/auth silencioso). */
export async function logWhatsAppWebhookHit(
  rawContent: unknown,
  processedAs: string,
  fromNumber = "unknown",
): Promise<void> {
  try {
    await prisma.whatsAppMessage.create({
      data: {
        fromNumber: fromNumber.slice(0, 32),
        messageType: "webhook",
        rawContent:
          rawContent && typeof rawContent === "object"
            ? (rawContent as object)
            : { payload: rawContent },
        processedAs,
      },
    });
  } catch {
    /* não bloqueia o webhook */
  }
}
