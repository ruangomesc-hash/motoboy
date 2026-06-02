import { normalizePhone } from "./phone.js";

/** Campos comuns no `key` do webhook Evolution v2.3+. */
export type EvolutionMessageKey = {
  remoteJid?: string;
  remoteJidAlt?: string;
  senderPn?: string;
  participant?: string;
  fromMe?: boolean;
  id?: string;
};

export type EvolutionResolvedContact =
  | { storedPhone: string; replyTo: string }
  | { storedPhone: null; replyTo: string };

function ensureJid(value: string): string {
  const trimmed = value.trim();
  if (trimmed.includes("@")) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  return `${digits}@s.whatsapp.net`;
}

function storedPhoneFromJid(jid: string): string | null {
  if (jid.endsWith("@g.us") || jid.endsWith("@lid")) return null;
  const userPart = jid.split("@")[0] ?? "";
  try {
    return normalizePhone(userPart);
  } catch {
    return null;
  }
}

/** Evolution envia o JID real no topo do payload (ex.: leads de anúncio com key só @lid). */
export function extractEvolutionRootSender(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const sender = (body as { sender?: unknown }).sender;
  if (typeof sender === "string" && sender.trim()) return sender.trim();
  return null;
}

function firstReplyJidFromKey(key: EvolutionMessageKey): string | null {
  for (const raw of [
    key.remoteJidAlt,
    key.senderPn,
    key.participant,
    key.remoteJid,
  ]) {
    if (!raw?.trim()) continue;
    return ensureJid(raw);
  }
  return null;
}

/**
 * Resolve telefone (banco) e destino de resposta (Evolution sendText).
 * Prioriza JID real (@s.whatsapp.net) sobre @lid.
 */
export function resolveEvolutionContact(
  key: EvolutionMessageKey,
): EvolutionResolvedContact | null {
  const rawCandidates = [
    key.remoteJidAlt,
    key.senderPn,
    key.participant,
    key.remoteJid,
  ].filter((v): v is string => Boolean(v?.trim()));

  for (const raw of rawCandidates) {
    const jid = ensureJid(raw);
    const stored = storedPhoneFromJid(jid);
    if (stored) {
      return { storedPhone: stored, replyTo: stored };
    }
  }

  const lidJid = rawCandidates
    .map(ensureJid)
    .find((j) => j.endsWith("@lid"));
  if (lidJid) {
    return { storedPhone: null, replyTo: lidJid };
  }

  const fallbackJid = firstReplyJidFromKey(key);
  if (fallbackJid && !fallbackJid.endsWith("@g.us")) {
    return { storedPhone: null, replyTo: fallbackJid };
  }

  return null;
}

/**
 * Combina `data.key` com `sender` no root do webhook (comum em mensagens de anúncio Meta).
 */
export function resolveEvolutionWebhookContact(
  body: unknown,
  key: EvolutionMessageKey,
): EvolutionResolvedContact | null {
  const rootSender = extractEvolutionRootSender(body);
  const fromKey = resolveEvolutionContact(key);

  if (rootSender) {
    const rootJid = ensureJid(rootSender);
    const storedFromRoot = storedPhoneFromJid(rootJid);
    if (storedFromRoot) {
      return { storedPhone: storedFromRoot, replyTo: storedFromRoot };
    }
  }

  if (fromKey) {
    if (!fromKey.storedPhone && rootSender) {
      const storedFromRoot = storedPhoneFromJid(ensureJid(rootSender));
      if (storedFromRoot) {
        return { storedPhone: storedFromRoot, replyTo: fromKey.replyTo };
      }
    }
    return fromKey;
  }

  if (rootSender) {
    const rootJid = ensureJid(rootSender);
    const stored = storedPhoneFromJid(rootJid);
    if (stored) return { storedPhone: stored, replyTo: stored };
    return { storedPhone: null, replyTo: rootJid };
  }

  return null;
}
