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
  return coerceBrazilStoredPhone(userPart);
}

/** Aceita JID ou só dígitos; tenta com/sem o 9 do celular (comum no WhatsApp). */
export function coerceBrazilStoredPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return null;

  const tries: string[] = [digits];
  if (digits.startsWith("55") && digits.length === 12) {
    tries.push(`${digits.slice(0, 4)}9${digits.slice(4)}`);
  }
  if (digits.startsWith("55") && digits.length === 13 && digits[4] === "9") {
    tries.push(`${digits.slice(0, 4)}${digits.slice(5)}`);
  }

  for (const candidate of tries) {
    try {
      return normalizePhone(candidate);
    } catch {
      /* próxima variante */
    }
  }
  return null;
}

/** Extrai telefone para busca no banco a partir do destino de resposta (JID ou dígitos). */
export function resolveStoredPhoneFromReplyTo(replyTo: string): string | null {
  const trimmed = replyTo.trim();
  if (!trimmed) return null;
  if (trimmed.includes("@")) return storedPhoneFromJid(ensureJid(trimmed));
  return coerceBrazilStoredPhone(trimmed);
}

/** Campo `sender` no topo do webhook — em inbound costuma ser o número da instância (bot), não o cliente. */
export function extractEvolutionRootSender(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const sender = (body as { sender?: unknown }).sender;
  if (typeof sender === "string" && sender.trim()) return sender.trim();
  return null;
}

function phoneVariantKeys(canonical: string): string[] {
  const keys = new Set<string>([canonical]);
  if (canonical.length === 13 && canonical.startsWith("55") && canonical[4] === "9") {
    keys.add(`${canonical.slice(0, 4)}${canonical.slice(5)}`);
  }
  if (canonical.length === 12 && canonical.startsWith("55")) {
    keys.add(`${canonical.slice(0, 4)}9${canonical.slice(4)}`);
  }
  return [...keys];
}

/** Números da linha Motocopiloto (EVOLUTION_BOT_NUMBER) — nunca são o motoboy cadastrado. */
export function resolveEvolutionBotPhoneKeys(
  botNumber: string | undefined,
): Set<string> {
  const keys = new Set<string>();
  if (!botNumber?.trim()) return keys;
  const canonical = coerceBrazilStoredPhone(botNumber);
  if (!canonical) return keys;
  for (const k of phoneVariantKeys(canonical)) keys.add(k);
  return keys;
}

function isEvolutionBotPhone(
  raw: string,
  botPhoneKeys: Set<string>,
): boolean {
  if (botPhoneKeys.size === 0) return false;
  const stored = storedPhoneFromJid(ensureJid(raw));
  if (stored && botPhoneKeys.has(stored)) return true;
  if (stored) {
    return phoneVariantKeys(stored).some((k) => botPhoneKeys.has(k));
  }
  return false;
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

export type EvolutionWebhookContactOptions = {
  /** `EVOLUTION_BOT_NUMBER` — linha que recebe; não confundir com o motoboy. */
  botPhoneKeys?: Set<string>;
};

/**
 * Identifica o cliente (`data.key`) para busca no banco e resposta no Zap.
 * O `sender` do root só entra se não for o número da instância (ex.: alguns leads @lid).
 */
export function resolveEvolutionWebhookContact(
  body: unknown,
  key: EvolutionMessageKey,
  options?: EvolutionWebhookContactOptions,
): EvolutionResolvedContact | null {
  const botPhoneKeys = options?.botPhoneKeys ?? new Set<string>();
  const rootSender = extractEvolutionRootSender(body);
  const rootIsBot =
    rootSender != null && isEvolutionBotPhone(rootSender, botPhoneKeys);
  const fromKey = resolveEvolutionContact(key);

  if (fromKey) {
    if (
      !fromKey.storedPhone &&
      rootSender &&
      !rootIsBot
    ) {
      const storedFromRoot = storedPhoneFromJid(ensureJid(rootSender));
      if (storedFromRoot) {
        return { storedPhone: storedFromRoot, replyTo: fromKey.replyTo };
      }
    }
    return fromKey;
  }

  if (rootSender && !rootIsBot) {
    const rootJid = ensureJid(rootSender);
    const stored = storedPhoneFromJid(rootJid);
    if (stored) return { storedPhone: stored, replyTo: stored };
    return { storedPhone: null, replyTo: rootJid };
  }

  return null;
}
