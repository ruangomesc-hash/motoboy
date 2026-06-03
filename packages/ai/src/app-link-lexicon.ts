/** Normaliza para matching (minúsculas, sem acento). */
export function normalizeAppLinkText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s$]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const APP_LINK_PHRASE_PATTERNS: RegExp[] = [
  /(?:manda|mande|envia|envie|passa|passo|quero|preciso|me\s+(?:da|dá|manda|envia))\s+(?:o\s+|a\s+)?(?:link|site|url|app|aplicativo)/,
  /(?:qual|quais|cadê|cade|onde)\s+(?:é\s+|e\s+)?(?:o\s+|a\s+)?(?:link|site|url|app|acesso)/,
  /como\s+(?:acesso|acessar|entro|entrar|abro|abrir|uso|usar|entro\s+no)/,
  /link\s+(?:do|da|de)\s+(?:app|aplicativo|site|motocopiloto|sistema|plataforma)/,
  /(?:acesso|entrar|abrir)\s+(?:ao|a|no|na|em)\s+(?:app|aplicativo|site|motocopiloto|plataforma|sistema)/,
  /(?:abrir|entrar)\s+(?:o|no|na)\s+(?:app|aplicativo|site|motocopiloto)/,
  /site\s+(?:do|da|de)\s+(?:app|aplicativo|motocopiloto|sistema)/,
  /(?:url|endereco)\s+(?:do|da|de)\s+(?:app|aplicativo|site|motocopiloto)/,
  /(?:cadastro|login|logar|entrar)\s+(?:no|na|em)\s+(?:app|aplicativo|site|motocopiloto|sistema)/,
  /(?:baixar|instalar|adicionar)\s+(?:o\s+)?(?:app|aplicativo)/,
  /motocopiloto\s+(?:app|aplicativo|site|link)/,
  /(?:app|aplicativo|site)\s+motocopiloto/,
];

/** Mensagem curta só pedindo link/acesso. */
const APP_LINK_STANDALONE =
  /^(?:link|site|url|app|aplicativo|acesso|login|entrar|cadastro|painel|plataforma|motocopiloto)(?:\s+(?:por\s+favor|pfv|pf|please))?$/;

const APP_LINK_WORD =
  /\b(?:link|site|url|acesso|aplicativo|plataforma|painel|motocopiloto|webapp|pwa)\b/;

const APP_LINK_SHORT_APP = /\bapp\b/;

/** Evita confundir com registro de entrega (ex.: "R$ 30 ifood"). */
function hasStrongDeliverySignal(normalized: string): boolean {
  const hasMoney =
    /r\s*\$/.test(normalized) ||
    /\b\d{1,5}(?:[.,]\d{1,2})?\s*(?:reais|real|rs)\b/.test(normalized) ||
    /\b(?:reais|real)\b/.test(normalized);
  const hasDelivery =
    /\b(?:entreg|ifood|rappi|particular|corrida|pedido)\b/.test(normalized) ||
    /\b99\b/.test(normalized);
  return hasMoney && hasDelivery;
}

/**
 * Cliente pediu link / acesso / app / site (texto ou áudio transcrito).
 * Não dispara em mensagens claras de entrega com valor.
 */
export function isAppLinkRequest(text: string): boolean {
  const normalized = normalizeAppLinkText(text);
  if (!normalized) return false;
  if (hasStrongDeliverySignal(normalized)) return false;

  if (APP_LINK_STANDALONE.test(normalized)) return true;

  for (const pattern of APP_LINK_PHRASE_PATTERNS) {
    if (pattern.test(normalized)) return true;
  }

  if (/\bmotocopiloto\b/.test(normalized) && !hasStrongDeliverySignal(normalized)) {
    if (
      APP_LINK_WORD.test(normalized) ||
      /\b(?:link|site|app|acesso|entrar|login|cadastro)\b/.test(normalized)
    ) {
      return true;
    }
  }

  if (APP_LINK_SHORT_APP.test(normalized) && !/\bwhatsapp\b/.test(normalized)) {
    if (
      /\b(?:link|site|url|acesso|entrar|login|abrir|cadastro|motocopiloto)\b/.test(
        normalized,
      )
    ) {
      return true;
    }
    if (normalized.length <= 40) return true;
  }

  if (APP_LINK_WORD.test(normalized) && normalized.length <= 60) {
    return true;
  }

  return false;
}

export function formatAppLinkWhatsAppReply(appUrl: string): string {
  const base = appUrl.replace(/\/$/, "");
  return (
    `📱 *Motocopiloto* — acesse pelo celular:\n\n` +
    `${base}\n\n` +
    `Salve nos favoritos ou use *Adicionar à tela inicial* para abrir como app.`
  );
}
