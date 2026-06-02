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

/**
 * Resolve telefone (banco) e destino de resposta (Evolution sendText).
 * Prioriza JID real (@s.whatsapp.net) sobre @lid.
 */
export function resolveEvolutionContact(
  key: EvolutionMessageKey,
): { storedPhone: string; replyTo: string } | { storedPhone: null; replyTo: string } | null {
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

  return null;
}
