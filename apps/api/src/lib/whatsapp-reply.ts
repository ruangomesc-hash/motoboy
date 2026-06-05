import type { FastifyBaseLogger } from "fastify";
import type { EvolutionService } from "../services/evolution.js";
import {
  extractEvolutionRootSender,
  resolveEvolutionContact,
  resolveEvolutionWebhookContact,
  resolveStoredPhoneFromReplyTo,
  type EvolutionMessageKey,
  type EvolutionWebhookContactOptions,
} from "./evolution-contact.js";
import { formatWhatsAppProcessingError } from "./whatsapp-user-message.js";

/** Extrai destino de resposta mesmo quando o parse completo falhou. */
export function extractReplyTargetFromWebhookBody(
  body: unknown,
  options?: EvolutionWebhookContactOptions,
): string | null {
  if (!body || typeof body !== "object") return null;

  const keys: EvolutionMessageKey[] = [];

  const visit = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    const o = node as Record<string, unknown>;
    if (o.key && typeof o.key === "object") {
      keys.push(o.key as EvolutionMessageKey);
    }
    if (o.messageKey && typeof o.messageKey === "object") {
      keys.push(o.messageKey as EvolutionMessageKey);
    }
    if (Array.isArray(o.messages)) {
      for (const m of o.messages) visit(m);
    }
    if (o.data) visit(o.data);
    if (Array.isArray(o.data)) {
      for (const item of o.data) visit(item);
    }
  };

  visit(body);

  for (const key of keys) {
    if (key.fromMe) continue;
    const contact = resolveEvolutionWebhookContact(body, key, options);
    if (contact?.replyTo) return contact.replyTo;
  }

  const rootSender = extractEvolutionRootSender(body);
  if (rootSender) {
    const contact = resolveEvolutionWebhookContact(
      body,
      { remoteJid: rootSender, fromMe: false },
      options,
    );
    if (contact?.replyTo) return contact.replyTo;
  }

  return null;
}

/** Telefone para auditoria do webhook (logs Admin / health). */
export function extractWebhookAuditPhone(
  body: unknown,
  options?: EvolutionWebhookContactOptions,
): string {
  const replyTo = extractReplyTargetFromWebhookBody(body, options);
  if (!replyTo?.trim()) return "unknown";
  const stored = resolveStoredPhoneFromReplyTo(replyTo);
  if (stored) return stored;
  const digits = replyTo.replace(/\D/g, "");
  if (digits.length >= 10) return digits.slice(0, 20);
  return replyTo.slice(0, 32);
}

/** Nunca lança — falha de envio só vai pro log. */
export async function safeWhatsAppReply(
  evolution: EvolutionService,
  replyTo: string | null | undefined,
  text: string,
  log: FastifyBaseLogger,
): Promise<boolean> {
  if (!replyTo?.trim()) {
    log.warn({ text: text.slice(0, 80) }, "WhatsApp reply sem destino");
    return false;
  }
  try {
    await evolution.sendText(replyTo, text);
    return true;
  } catch (err) {
    log.error(
      { err, replyTo: replyTo.slice(0, 40), preview: text.slice(0, 80) },
      "Falha ao enviar mensagem no WhatsApp",
    );
    return false;
  }
}

export async function safeWhatsAppErrorReply(
  evolution: EvolutionService,
  replyTo: string | null | undefined,
  err: unknown,
  log: FastifyBaseLogger,
): Promise<boolean> {
  return safeWhatsAppReply(
    evolution,
    replyTo,
    formatWhatsAppProcessingError(err),
    log,
  );
}

export async function replyFromWebhookBody(
  evolution: EvolutionService,
  body: unknown,
  text: string,
  log: FastifyBaseLogger,
): Promise<boolean> {
  const target = extractReplyTargetFromWebhookBody(body);
  return safeWhatsAppReply(evolution, target, text, log);
}
