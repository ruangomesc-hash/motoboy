import { prisma } from "@motoboy/db";
import type { FastifyBaseLogger } from "fastify";
import type { EvolutionService } from "./evolution.js";
import { normalizePhone } from "../lib/phone.js";
import { safeWhatsAppReply } from "../lib/whatsapp-reply.js";

/** Máximo de respostas automáticas por número desconhecido (evita loop com spam/bot). */
const MAX_AUTO_REPLIES = 1;

const UNKNOWN_REPLY =
  "Este WhatsApp não está cadastrado no Motocopiloto. Se você é motoboy, cadastre-se no app com o mesmo número deste celular. Caso contrário, pode ignorar esta mensagem.";

export function canonicalUnknownSenderPhone(raw: string): string | null {
  const trimmed = raw.replace(/@s\.whatsapp\.net$/i, "").trim();
  if (!trimmed || trimmed === "unknown") return null;
  try {
    return normalizePhone(trimmed);
  } catch {
    return null;
  }
}

export async function recordUnknownSenderMessage(phone: string): Promise<{
  blocked: boolean;
  replyCount: number;
}> {
  const canonical = canonicalUnknownSenderPhone(phone);
  if (!canonical) {
    return { blocked: false, replyCount: 0 };
  }

  const row = await prisma.whatsAppUnknownSender.upsert({
    where: { phone: canonical },
    create: {
      phone: canonical,
      messageCount: 1,
      lastMessageAt: new Date(),
    },
    update: {
      messageCount: { increment: 1 },
      lastMessageAt: new Date(),
    },
  });

  return { blocked: row.blocked, replyCount: row.replyCount };
}

export async function shouldReplyToUnknownSender(phone: string): Promise<boolean> {
  const canonical = canonicalUnknownSenderPhone(phone);
  if (!canonical) return false;

  const row = await prisma.whatsAppUnknownSender.findUnique({
    where: { phone: canonical },
  });
  if (!row || row.blocked) return false;
  return row.replyCount < MAX_AUTO_REPLIES;
}

export async function markUnknownSenderReplied(phone: string): Promise<void> {
  const canonical = canonicalUnknownSenderPhone(phone);
  if (!canonical) return;

  await prisma.whatsAppUnknownSender.update({
    where: { phone: canonical },
    data: {
      replyCount: { increment: 1 },
      lastReplyAt: new Date(),
    },
  });
}

export type UnknownSenderHandleResult = {
  processedAs: string;
  replied: boolean;
};

/** Responde no máximo 1x; depois ignora em silêncio (ou se bloqueado). */
export async function handleUnknownSenderInbound(params: {
  phone: string;
  replyTo: string;
  evolution: EvolutionService;
  log: FastifyBaseLogger;
}): Promise<UnknownSenderHandleResult> {
  const { phone, replyTo, evolution, log } = params;
  const { blocked, replyCount } = await recordUnknownSenderMessage(phone);

  if (blocked) {
    log?.info({ phone }, "Zap de número bloqueado — sem resposta");
    return { processedAs: "unknown_blocked", replied: false };
  }

  if (replyCount >= MAX_AUTO_REPLIES) {
    log?.info({ phone, replyCount }, "Zap de número não cadastrado — sem nova resposta");
    return { processedAs: "unknown_ignored", replied: false };
  }

  const ok = await safeWhatsAppReply(evolution, replyTo, UNKNOWN_REPLY, log);
  if (ok) {
    await markUnknownSenderReplied(phone);
    return { processedAs: "unknown_replied_once", replied: true };
  }

  return { processedAs: "unknown_reply_failed", replied: false };
}

export async function blockUnknownSenderPhone(
  phone: string,
  reason = "admin_block",
): Promise<{ phone: string; blocked: boolean }> {
  const canonical = canonicalUnknownSenderPhone(phone);
  if (!canonical) {
    throw Object.assign(new Error("Número inválido"), { statusCode: 400 });
  }

  await prisma.whatsAppUnknownSender.upsert({
    where: { phone: canonical },
    create: {
      phone: canonical,
      blocked: true,
      blockedAt: new Date(),
      blockedReason: reason,
      messageCount: 0,
    },
    update: {
      blocked: true,
      blockedAt: new Date(),
      blockedReason: reason,
    },
  });

  return { phone: canonical, blocked: true };
}

export async function unblockUnknownSenderPhone(
  phone: string,
): Promise<{ phone: string; blocked: boolean }> {
  const canonical = canonicalUnknownSenderPhone(phone);
  if (!canonical) {
    throw Object.assign(new Error("Número inválido"), { statusCode: 400 });
  }

  await prisma.whatsAppUnknownSender.updateMany({
    where: { phone: canonical },
    data: {
      blocked: false,
      blockedAt: null,
      blockedReason: null,
    },
  });

  return { phone: canonical, blocked: false };
}

export async function listUnknownSenders(limit = 30) {
  const rows = await prisma.whatsAppUnknownSender.findMany({
    orderBy: { lastMessageAt: "desc" },
    take: Math.min(Math.max(limit, 1), 100),
  });

  return rows.map((r) => ({
    phone: r.phone,
    messageCount: r.messageCount,
    replyCount: r.replyCount,
    blocked: r.blocked,
    firstSeenAt: r.firstSeenAt.toISOString(),
    lastMessageAt: r.lastMessageAt.toISOString(),
    lastReplyAt: r.lastReplyAt?.toISOString() ?? null,
    blockedAt: r.blockedAt?.toISOString() ?? null,
    blockedReason: r.blockedReason,
  }));
}
