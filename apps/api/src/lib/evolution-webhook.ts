import { z } from "zod";
import type { EvolutionMessageKey } from "./evolution-contact.js";

const messageKeySchema = z.object({
  remoteJid: z.string().optional(),
  remoteJidAlt: z.string().optional(),
  senderPn: z.string().optional(),
  participant: z.string().optional(),
  fromMe: z.boolean().optional(),
  id: z.string().optional(),
});

const messageDataSchema = z.object({
  key: messageKeySchema.optional(),
  message: z.record(z.unknown()).optional(),
  messageType: z.string().optional(),
});

export type EvolutionInboundMessage = {
  key: EvolutionMessageKey & { remoteJid: string };
  message?: Record<string, unknown>;
  messageType?: string;
};

function shouldIgnoreEvent(event: string): boolean {
  const e = event.toLowerCase();
  if (!e) return false;
  if (e.includes("connection") || e.includes("qrcode") || e.includes("qr_code")) {
    return true;
  }
  if (e.includes("messages.delete")) return true;
  if (e.includes("messages.update") && !e.includes("upsert")) return true;
  if (e.includes("send.message") && !e.includes("upsert")) return true;
  if (e.includes("presence") || e.includes("contacts.")) return true;
  return false;
}

/** Evolution 2.x: mensagem pode vir em data.message.message (wrapper Baileys). */
function unwrapMessageNode(raw: unknown): Record<string, unknown> | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  let node = raw as Record<string, unknown>;
  for (let depth = 0; depth < 4; depth++) {
    if (
      typeof node.conversation === "string" ||
      typeof node.extendedTextMessage === "object" ||
      typeof node.audioMessage === "object" ||
      typeof node.imageMessage === "object"
    ) {
      return node;
    }
    const inner = node.message;
    if (!inner || typeof inner !== "object") break;
    node = inner as Record<string, unknown>;
  }
  return node;
}

function pickInboundData(root: Record<string, unknown>): unknown {
  let rawData = root.data;
  if (Array.isArray(rawData)) {
    rawData =
      rawData.find(
        (item) =>
          item &&
          typeof item === "object" &&
          (item as { key?: { fromMe?: boolean } }).key?.fromMe !== true,
      ) ?? rawData[0];
  }
  if (
    rawData &&
    typeof rawData === "object" &&
    Array.isArray((rawData as { messages?: unknown[] }).messages)
  ) {
    const messages = (rawData as { messages: unknown[] }).messages;
    rawData =
      messages.find(
        (item) =>
          item &&
          typeof item === "object" &&
          (item as { key?: { fromMe?: boolean } }).key?.fromMe !== true,
      ) ?? messages[0];
  }
  return rawData;
}

/** Extrai texto de `message` (conversation, extendedText, wrappers Baileys). */
export function extractEvolutionMessageText(message: unknown): string {
  if (!message || typeof message !== "object") return "";
  const m = message as Record<string, unknown>;

  if (typeof m.conversation === "string") return m.conversation;
  if (typeof m.text === "string") return m.text;

  const extended = m.extendedTextMessage;
  if (extended && typeof extended === "object") {
    const text = (extended as { text?: string }).text;
    if (typeof text === "string") return text;
  }

  const image = m.imageMessage;
  if (image && typeof image === "object") {
    const caption = (image as { caption?: string }).caption;
    if (typeof caption === "string") return caption;
  }

  for (const wrapper of [
    "ephemeralMessage",
    "viewOnceMessage",
    "viewOnceMessageV2",
    "documentWithCaptionMessage",
  ]) {
    const node = m[wrapper];
    if (node && typeof node === "object") {
      const inner =
        (node as { message?: unknown }).message ??
        (node as { documentMessage?: unknown }).documentMessage;
      const nested = extractEvolutionMessageText(inner);
      if (nested) return nested;
    }
  }

  return "";
}

function hasMediaHints(
  message: Record<string, unknown> | undefined,
  messageType?: string,
): { audio: boolean; image: boolean } {
  const type = (messageType ?? "").toLowerCase();
  const audio =
    type.includes("audio") ||
    Boolean(message && typeof message.audioMessage === "object");
  const image =
    type.includes("image") ||
    Boolean(message && typeof message.imageMessage === "object");
  return { audio, image };
}

/** Normaliza payload Evolution v1/v2 (data objeto, array ou messages[]). */
export function parseEvolutionInboundMessage(
  body: unknown,
): EvolutionInboundMessage | null {
  if (!body || typeof body !== "object") return null;
  const root = body as Record<string, unknown>;
  const event = String(root.event ?? root.type ?? "");

  if (shouldIgnoreEvent(event)) return null;

  const rawData = pickInboundData(root);
  let parsed = messageDataSchema.safeParse(rawData);
  if (!parsed.success && rawData && typeof rawData === "object") {
    parsed = messageDataSchema.safeParse({
      ...(rawData as object),
      key:
        (rawData as { key?: unknown }).key ??
        (rawData as { messageKey?: unknown }).messageKey,
    });
  }
  if (!parsed.success) {
    const asMessage = messageDataSchema.safeParse(root);
    if (asMessage.success) parsed = asMessage;
  }
  if (!parsed.success && rawData && typeof rawData === "object") {
    const d = rawData as Record<string, unknown>;
    parsed = messageDataSchema.safeParse({
      key: d.key ?? d.messageKey,
      message: unwrapMessageNode(d.message) ?? d.message,
      messageType: d.messageType,
    });
  }
  if (!parsed.success) return null;

  const remoteJid =
    parsed.data.key?.remoteJid ??
    parsed.data.key?.remoteJidAlt ??
    parsed.data.key?.senderPn ??
    parsed.data.key?.participant;
  if (!remoteJid) return null;

  const key: EvolutionInboundMessage["key"] = {
    ...parsed.data.key,
    remoteJid,
  };

  const message =
    unwrapMessageNode(parsed.data.message) ?? parsed.data.message;

  return {
    key,
    message,
    messageType: parsed.data.messageType,
  };
}

export function inferEvolutionMessageType(
  message: Record<string, unknown> | undefined,
  messageType?: string,
): "text" | "audio" | "image" {
  const { audio, image } = hasMediaHints(message, messageType);
  if (audio) return "audio";
  if (image) return "image";
  return "text";
}
