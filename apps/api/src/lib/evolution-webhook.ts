import { z } from "zod";

const messageKeySchema = z.object({
  remoteJid: z.string().optional(),
  fromMe: z.boolean().optional(),
  id: z.string().optional(),
});

const messageBodySchema = z.object({
  conversation: z.string().optional(),
  extendedTextMessage: z
    .object({ text: z.string().optional() })
    .optional(),
  audioMessage: z
    .object({
      mimetype: z.string().optional(),
      seconds: z.number().optional(),
    })
    .optional(),
  imageMessage: z
    .object({
      mimetype: z.string().optional(),
      caption: z.string().optional(),
    })
    .optional(),
  locationMessage: z
    .object({
      degreesLatitude: z.number().optional(),
      degreesLongitude: z.number().optional(),
    })
    .optional(),
});

const messageDataSchema = z.object({
  key: messageKeySchema.optional(),
  message: messageBodySchema.optional(),
  messageType: z.string().optional(),
});

export type EvolutionInboundMessage = z.infer<typeof messageDataSchema>;

function shouldIgnoreEvent(event: string): boolean {
  const e = event.toLowerCase();
  if (!e) return false;
  if (e.includes("connection") || e.includes("qrcode") || e.includes("qr_code")) {
    return true;
  }
  if (e.includes("messages.delete") || e.includes("messages.update")) {
    return true;
  }
  if (e.includes("send.message") && !e.includes("upsert")) return true;
  return false;
}

/** Normaliza payload Evolution v1/v2 (data objeto ou array). */
export function parseEvolutionInboundMessage(
  body: unknown,
): EvolutionInboundMessage | null {
  if (!body || typeof body !== "object") return null;
  const root = body as Record<string, unknown>;
  const event = String(root.event ?? "");

  if (shouldIgnoreEvent(event)) return null;

  let rawData = root.data;
  if (Array.isArray(rawData)) {
    rawData = rawData.find(
      (item) =>
        item &&
        typeof item === "object" &&
        (item as { key?: { fromMe?: boolean } }).key?.fromMe !== true,
    );
  }

  const parsed = messageDataSchema.safeParse(rawData);
  if (!parsed.success) return null;
  if (!parsed.data.key?.remoteJid) return null;
  return parsed.data;
}
