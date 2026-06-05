import { prisma } from "@motoboy/db";
import type { Env } from "@motoboy/types";
import {
  normalizeAppOrigin,
  resolvePublicAppUrl,
  webhookUrlsMatch,
  whatsappWebhookUrl,
} from "../lib/app-url.js";
import { evolutionWebhookSecrets } from "../lib/webhook-auth.js";
import { isRedisEnabled } from "../lib/redis.js";
import { getEvolutionBotPhoneKeys } from "../lib/evolution-bot.js";
import { diagnosePhoneUserLink } from "./user.js";
import { listUnknownSenders } from "./whatsapp-unknown-sender.js";

export type WhatsAppPipelineIssue = {
  severity: "critical" | "warning" | "info";
  code: string;
  message: string;
  action?: string;
};

export type WhatsAppPipelineDiagnostics = {
  checkedAt: string;
  expectedWebhookUrl: string;
  processing: "inline" | "queue";
  runWhatsAppWorker: boolean;
  redisEnabled: boolean;
  openAiConfigured: boolean;
  evolution: {
    configured: boolean;
    apiUrl: string | null;
    instance: string | null;
    connectionState: string | null;
    apiReachable: boolean;
  };
  webhook: {
    enabled: boolean | null;
    configuredUrl: string | null;
    webhookByEvents: boolean;
    urlMatches: boolean;
    hasApikeyHeader: boolean;
    events: string[];
  };
  database: {
    messagesLast48h: number;
    messagesLast24h: number;
    webhookHitsLast24h: number;
    deliveriesLast48h: number;
    recentMessages: Array<{
      receivedAt: string;
      fromNumber: string;
      messageType: string;
      userId: string | null;
      processedAs: string | null;
      phoneLink: {
        linkStatus: string;
        lookupKeys: string[];
        registeredAs: string | null;
        userName: string | null;
      } | null;
    }>;
    unmatchedPhones: Array<{
      fromNumber: string;
      linkStatus: string;
      lookupKeys: string[];
      registeredAs: string | null;
    }>;
    unknownSenders: Array<{
      phone: string;
      messageCount: number;
      replyCount: number;
      blocked: boolean;
      firstSeenAt: string;
      lastMessageAt: string;
      lastReplyAt: string | null;
      blockedAt: string | null;
    }>;
    legacyUnknownMessageCount24h: number;
    recentWhatsAppErrors: Array<{
      createdAt: string;
      errorCode: string;
      rawMessage: string;
      userId: string | null;
    }>;
  };
  issues: WhatsAppPipelineIssue[];
};

async function evolutionGet(
  env: Env,
  route: string,
): Promise<{ ok: boolean; status: number; json: Record<string, unknown> }> {
  const base = env.EVOLUTION_API_URL?.replace(/\/$/, "") ?? "";
  const key = env.EVOLUTION_API_KEY?.trim() ?? "";
  if (!base || !key) {
    return { ok: false, status: 0, json: {} };
  }
  const res = await fetch(`${base}${route}`, {
    headers: { apikey: key, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(12_000),
  });
  let json: Record<string, unknown> = {};
  try {
    json = (await res.json()) as Record<string, unknown>;
  } catch {
    json = {};
  }
  return { ok: res.ok, status: res.status, json };
}

function parseWebhookConfig(json: Record<string, unknown>): {
  enabled: boolean | null;
  url: string | null;
  webhookByEvents: boolean;
  events: string[];
  hasApikeyHeader: boolean;
} {
  const root = json.webhook && typeof json.webhook === "object"
    ? (json.webhook as Record<string, unknown>)
    : json;
  const url =
    (typeof root.url === "string" && root.url) ||
    (typeof json.url === "string" && json.url) ||
    null;
  const enabled =
    typeof root.enabled === "boolean"
      ? root.enabled
      : typeof json.enabled === "boolean"
        ? json.enabled
        : null;
  const webhookByEvents = Boolean(
    root.webhookByEvents ??
      root.webhook_by_events ??
      json.webhookByEvents ??
      json.webhook_by_events,
  );
  const eventsRaw = root.events ?? json.events;
  const events = Array.isArray(eventsRaw)
    ? eventsRaw.map(String)
    : [];
  const headers =
    (root.headers && typeof root.headers === "object"
      ? root.headers
      : json.headers) ?? {};
  const h = headers as Record<string, unknown>;
  const hasApikeyHeader = Boolean(
    h.apikey ?? h.Apikey ?? h.APIKEY ?? h["x-api-key"],
  );
  return { enabled, url, webhookByEvents, events, hasApikeyHeader };
}

export async function getWhatsAppPipelineDiagnostics(
  env: Env,
): Promise<WhatsAppPipelineDiagnostics> {
  const issues: WhatsAppPipelineIssue[] = [];
  const publicOrigin = resolvePublicAppUrl(env);
  const expected = whatsappWebhookUrl(publicOrigin);
  const envOnlyWebhook = whatsappWebhookUrl(env.APP_URL);
  const appUrlMisconfigured = !webhookUrlsMatch(
    normalizeAppOrigin(env.APP_URL),
    publicOrigin,
  );
  const { whatsappProcessingMode, isVercelServerless } = await import(
    "../lib/whatsapp-processing-mode.js"
  );
  const runWhatsAppWorker = process.env.RUN_WHATSAPP_WORKER === "true";
  const processing = whatsappProcessingMode();
  const evolutionConfigured = Boolean(
    env.EVOLUTION_API_URL?.trim() &&
      env.EVOLUTION_API_KEY?.trim() &&
      env.EVOLUTION_INSTANCE?.trim(),
  );

  let connectionState: string | null = null;
  let apiReachable = false;
  let webhook = {
    enabled: null as boolean | null,
    configuredUrl: null as string | null,
    webhookByEvents: false,
    urlMatches: false,
    hasApikeyHeader: false,
    events: [] as string[],
  };

  const botPhoneKeys = getEvolutionBotPhoneKeys(env);
  if (evolutionConfigured && !env.EVOLUTION_BOT_NUMBER?.trim()) {
    issues.push({
      severity: "info",
      code: "EVOLUTION_BOT_NUMBER_FALLBACK",
      message:
        "EVOLUTION_BOT_NUMBER não está na Vercel — usando fallback 5531992907578 (instância motoboy).",
      action:
        "Recomendado: EVOLUTION_BOT_NUMBER=5531992907578 na Vercel (linha que recebe). Cadastro do motoboy = celular pessoal.",
    });
  }

  if (!evolutionConfigured) {
    issues.push({
      severity: "critical",
      code: "EVOLUTION_NOT_CONFIGURED",
      message: "EVOLUTION_API_URL, EVOLUTION_API_KEY ou EVOLUTION_INSTANCE ausentes na Vercel.",
      action: "Configure as variáveis e redeploy.",
    });
  } else {
    const conn = await evolutionGet(
      env,
      `/instance/connectionState/${env.EVOLUTION_INSTANCE}`,
    );
    apiReachable = conn.ok || conn.status === 401;
    connectionState = String(
      (conn.json.instance as { state?: string } | undefined)?.state ??
        conn.json.state ??
        (conn.ok ? "unknown" : `HTTP ${conn.status}`),
    );

    const normalized = connectionState.toLowerCase();
    if (!conn.ok) {
      issues.push({
        severity: "critical",
        code: "EVOLUTION_UNREACHABLE",
        message: `Evolution API não respondeu (${connectionState}).`,
        action: "Confira VPS evo.motocopiloto.com.br e EVOLUTION_API_URL na Vercel.",
      });
    } else if (!normalized.includes("open")) {
      issues.push({
        severity: "critical",
        code: "WHATSAPP_DISCONNECTED",
        message: `Instância WhatsApp não conectada: ${connectionState}.`,
        action: "Abra o manager da Evolution e escaneie o QR.",
      });
    }

    const wh = await evolutionGet(env, `/webhook/find/${env.EVOLUTION_INSTANCE}`);
    const parsed = parseWebhookConfig(wh.json);
    const configured = parsed.url;
    const urlMatches = Boolean(
      configured &&
        (webhookUrlsMatch(configured, expected) ||
          webhookUrlsMatch(configured, envOnlyWebhook)),
    );
    webhook = {
      enabled: parsed.enabled,
      configuredUrl: configured,
      webhookByEvents: parsed.webhookByEvents,
      urlMatches,
      hasApikeyHeader: parsed.hasApikeyHeader,
      events: parsed.events,
    };

    if (parsed.webhookByEvents) {
      issues.push({
        severity: "critical",
        code: "WEBHOOK_BY_EVENTS_ENABLED",
        message:
          "Evolution está com webhook por evento (/messages-upsert). A API só tinha rota /webhooks/whatsapp → 404 nas mensagens.",
        action:
          "Admin → Reparar webhook (força webhookByEvents: false) ou desative no manager Evolution.",
      });
    }

    if (appUrlMisconfigured && configured && webhookUrlsMatch(configured, expected)) {
      issues.push({
        severity: "critical",
        code: "APP_URL_MISCONFIGURED",
        message: `APP_URL na Vercel está como "${env.APP_URL}", mas o app público é ${publicOrigin}. O webhook na Evolution já está correto.`,
        action:
          "Vercel → Settings → Environment Variables: APP_URL, NEXTAUTH_URL e NEXT_PUBLIC_APP_URL = https://app.motocopiloto.com.br → redeploy.",
      });
    }

    if (!wh.ok) {
      issues.push({
        severity: "warning",
        code: "WEBHOOK_CONFIG_UNKNOWN",
        message: "Não foi possível ler o webhook na Evolution.",
        action: "Use Reparar webhook no admin ou pnpm whatsapp:setup --qr-only.",
      });
    } else {
      if (!webhook.configuredUrl) {
        issues.push({
          severity: "critical",
          code: "WEBHOOK_URL_MISSING",
          message: "Nenhuma URL de webhook configurada na Evolution.",
          action: "Reparar webhook (botão abaixo) ou script whatsapp:setup.",
        });
      } else if (!webhook.urlMatches) {
        issues.push({
          severity: "critical",
          code: "WEBHOOK_URL_MISMATCH",
          message: `Webhook na Evolution: ${webhook.configuredUrl}. Esperado: ${expected}.`,
          action:
            "Admin → Reparar webhook, ou confira o manager Evolution (URL + apikey).",
        });
      }
      if (!webhook.hasApikeyHeader) {
        issues.push({
          severity: "critical",
          code: "WEBHOOK_NO_APIKEY_HEADER",
          message: "Webhook da Evolution sem header apikey — a API responde 401.",
          action: "Reparar webhook com o secret da Vercel.",
        });
      }
      if (webhook.enabled === false) {
        issues.push({
          severity: "critical",
          code: "WEBHOOK_DISABLED",
          message: "Webhook desabilitado na Evolution.",
          action: "Habilite no manager ou repare via admin.",
        });
      }
      const eventsUpper = webhook.events.map((e) => e.toUpperCase());
      if (
        eventsUpper.length > 0 &&
        !eventsUpper.some((e) => e.includes("MESSAGES_UPSERT"))
      ) {
        issues.push({
          severity: "warning",
          code: "WEBHOOK_EVENTS",
          message: `Eventos do webhook: ${webhook.events.join(", ")} — falta MESSAGES_UPSERT.`,
          action: "Reparar webhook.",
        });
      }
    }
  }

  if (runWhatsAppWorker && !isRedisEnabled(env)) {
    issues.push({
      severity: "critical",
      code: "WORKER_WITHOUT_REDIS",
      message: "RUN_WHATSAPP_WORKER=true mas REDIS_URL inválido.",
      action: "Na Vercel use RUN_WHATSAPP_WORKER=false (processamento inline).",
    });
  }

  if (isVercelServerless() && runWhatsAppWorker) {
    issues.push({
      severity: "warning",
      code: "VERCEL_WORKER_FLAG_IGNORED",
      message:
        "RUN_WHATSAPP_WORKER=true na Vercel não enfileira (evita atraso ~1 min). Remova essa variável na Vercel.",
      action: "Vercel: apague RUN_WHATSAPP_WORKER ou defina false.",
    });
  } else if (runWhatsAppWorker && processing === "queue") {
    issues.push({
      severity: "warning",
      code: "QUEUE_MODE",
      message:
        "Modo fila: o webhook só enfileira; o worker Railway precisa estar no ar.",
      action:
        "Confira logs do Railway ou use processamento inline no host do webhook.",
    });
  }

  const since48 = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const since24 = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [
    messagesLast48h,
    messagesLast24h,
    webhookHitsLast24h,
    recentMessages,
    recentWhatsAppErrors,
  ] = await Promise.all([
      prisma.whatsAppMessage.count({
        where: { receivedAt: { gte: since48 } },
      }),
      prisma.whatsAppMessage.count({
        where: { receivedAt: { gte: since24 } },
      }),
      prisma.whatsAppMessage.count({
        where: {
          receivedAt: { gte: since24 },
          messageType: "webhook",
        },
      }),
      prisma.whatsAppMessage.findMany({
        where: { receivedAt: { gte: since48 } },
        orderBy: { receivedAt: "desc" },
        take: 15,
        select: {
          receivedAt: true,
          fromNumber: true,
          messageType: true,
          userId: true,
          processedAs: true,
        },
      }),
      prisma.clientErrorLog.findMany({
        where: {
          createdAt: { gte: since48 },
          OR: [
            { errorCode: { startsWith: "WHATSAPP" } },
            { source: "whatsapp" },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          createdAt: true,
          errorCode: true,
          rawMessage: true,
          userId: true,
        },
      }),
    ]);

  const deliveriesLast48h = await prisma.delivery.count({
    where: { occurredAt: { gte: since48 } },
  });

  const authRejected24h = recentMessages.filter(
    (m) => m.messageType === "webhook" && m.processedAs === "auth_rejected",
  ).length;
  if (authRejected24h > 0) {
    issues.push({
      severity: "critical",
      code: "WEBHOOK_AUTH_REJECTED",
      message: `${authRejected24h} chamada(s) com apikey rejeitado — Evolution e Vercel com secrets diferentes.`,
      action:
        "Na Vercel, EVOLUTION_WEBHOOK_SECRET deve ser o mesmo valor do header apikey no webhook da Evolution.",
    });
  }

  const isBotFromNumber = (fromNumber: string) =>
    botPhoneKeys.has(fromNumber.replace(/@s\.whatsapp\.net$/i, ""));

  const unknownProcessed = new Set([
    "unknown_replied_once",
    "unknown_ignored",
    "unknown_blocked",
    "unknown_reply_failed",
    "user_not_found",
  ]);

  if (
    webhookHitsLast24h === 0 &&
    evolutionConfigured &&
    apiReachable &&
    connectionState?.toLowerCase().includes("open")
  ) {
    issues.push({
      severity: "critical",
      code: "WEBHOOK_NEVER_HIT",
      message:
        "A Evolution não chamou a API nas últimas 24h (zero hits no webhook). Mensagens não chegam na Vercel.",
      action:
        "Confira URL do webhook, webhookByEvents desligado, e se a instância motoboy está open.",
    });
  } else if (
    messagesLast24h === 0 &&
    webhookHitsLast24h > 0 &&
    connectionState?.toLowerCase().includes("open")
  ) {
    const last = recentMessages[0];
    issues.push({
      severity: "critical",
      code: "WEBHOOK_HITS_BUT_NO_PROCESS",
      message: `Webhook recebeu ${webhookHitsLast24h} chamada(s), último status: ${last?.processedAs ?? "?"}.`,
      action:
        "Veja Admin → últimas mensagens: auth_rejected = secret errado; parse_failed = payload; user_not_found = número no app.",
    });
  }

  const unmatchedInbound = recentMessages.filter(
    (m) =>
      m.messageType !== "webhook" &&
      !m.userId &&
      m.processedAs != null &&
      (m.processedAs.startsWith("unknown_") ||
        m.processedAs === "invalid_phone" ||
        m.processedAs === "user_not_found"),
  );
  const unmatched = unmatchedInbound.length;
  if (unmatched >= 2) {
    issues.push({
      severity: "warning",
      code: "PHONE_NOT_MATCHED",
      message: `${unmatched} mensagem(ns) inbound sem usuário — número do Zap ≠ cadastro no app.`,
      action:
        "Configurações → WhatsApp deve ser o mesmo celular (55 + DDD + 9 dígitos).",
    });
  }

  const phoneNumbersToDiagnose = [
    ...new Set(
      recentMessages
        .filter(
          (m) =>
            m.messageType !== "webhook" &&
            m.fromNumber &&
            m.fromNumber !== "unknown" &&
            !m.fromNumber.includes("@lid"),
        )
        .map((m) => m.fromNumber.replace(/@s\.whatsapp\.net$/i, "")),
    ),
  ];

  const linkByPhone = new Map<
    string,
    Awaited<ReturnType<typeof diagnosePhoneUserLink>>
  >();
  await Promise.all(
    phoneNumbersToDiagnose.map(async (phone) => {
      linkByPhone.set(phone, await diagnosePhoneUserLink(phone));
    }),
  );

  const unmatchedPhones = [...linkByPhone.values()]
    .filter((d) => d.linkStatus === "not_in_database")
    .map((d) => ({
      fromNumber: d.incoming,
      linkStatus: d.linkStatus,
      lookupKeys: d.lookupKeys,
      registeredAs: d.matchedUser?.whatsappNumber ?? null,
    }));

  const inboundOnly = recentMessages.filter(
    (m) =>
      m.messageType !== "webhook" &&
      m.fromNumber !== "unknown" &&
      !m.fromNumber.includes("@lid"),
  );
  const latestInbound = inboundOnly[0];
  const latestUsesBotAsCustomer =
    latestInbound &&
    botPhoneKeys.size > 0 &&
    isBotFromNumber(latestInbound.fromNumber) &&
    latestInbound.processedAs === "user_not_found";

  if (latestUsesBotAsCustomer) {
    issues.push({
      severity: "critical",
      code: "BOT_NUMBER_USED_AS_CUSTOMER",
      message:
        "A última mensagem ainda usa o número da linha (5531992907578) como cliente. Redeploy com fix ativo ou confira EVOLUTION_BOT_NUMBER.",
      action: `EVOLUTION_BOT_NUMBER=5531992907578 na Vercel. Motoboy cadastra o celular pessoal (ex. 61993781810), não a linha do bot.`,
    });
  } else if (
    inboundOnly.some(
      (m) =>
        isBotFromNumber(m.fromNumber) &&
        m.processedAs === "user_not_found" &&
        m !== latestInbound,
    )
  ) {
    issues.push({
      severity: "info",
      code: "BOT_NUMBER_HISTORICAL_LOGS",
      message:
        "Há registros antigos com o número do bot (5531992907578) — bug já corrigido; novas mensagens devem usar o celular do motoboy.",
      action: "Envie uma mensagem de teste agora; a linha mais recente deve mostrar o número do motoboy.",
    });
  }

  const unknownSenders = await listUnknownSenders(40);
  const activeUnknown = unknownSenders.filter((u) => !u.blocked);

  if (activeUnknown.length > 0) {
    issues.push({
      severity: "info",
      code: "UNREGISTERED_WHATSAPP_SENDERS",
      message: `${activeUnknown.length} número(s) sem cadastro mandaram Zap (resposta automática limitada a 1x; depois ignorados).`,
      action:
        "Veja a lista abaixo — bloqueie spam. Motoboys devem cadastrar o celular pessoal no app (não a linha 5531992907578).",
    });
  }

  const legacyUnknown24h = recentMessages.filter(
    (m) =>
      unknownProcessed.has(m.processedAs ?? "") &&
      !isBotFromNumber(m.fromNumber),
  ).length;

  return {
    checkedAt: new Date().toISOString(),
    expectedWebhookUrl: expected,
    processing,
    runWhatsAppWorker,
    redisEnabled: isRedisEnabled(env),
    openAiConfigured: Boolean(env.OPENAI_API_KEY?.trim()),
    evolution: {
      configured: evolutionConfigured,
      apiUrl: env.EVOLUTION_API_URL ?? null,
      instance: env.EVOLUTION_INSTANCE ?? null,
      connectionState,
      apiReachable,
    },
    webhook,
    database: {
      messagesLast48h,
      messagesLast24h,
      webhookHitsLast24h,
      deliveriesLast48h,
      recentMessages: recentMessages.map((m) => {
        const phoneKey =
          m.messageType === "webhook" || m.fromNumber === "unknown"
            ? null
            : m.fromNumber.replace(/@s\.whatsapp\.net$/i, "");
        const link = phoneKey ? linkByPhone.get(phoneKey) : null;
        return {
          receivedAt: m.receivedAt.toISOString(),
          fromNumber: m.fromNumber,
          messageType: m.messageType,
          userId: m.userId,
          processedAs: m.processedAs,
          phoneLink: link
            ? {
                linkStatus: link.linkStatus,
                lookupKeys: link.lookupKeys,
                registeredAs: link.matchedUser?.whatsappNumber ?? null,
                userName: link.matchedUser?.name ?? null,
              }
            : null,
        };
      }),
      unmatchedPhones,
      unknownSenders,
      legacyUnknownMessageCount24h: legacyUnknown24h,
      recentWhatsAppErrors: recentWhatsAppErrors.map((e) => ({
        createdAt: e.createdAt.toISOString(),
        errorCode: e.errorCode,
        rawMessage: e.rawMessage.slice(0, 200),
        userId: e.userId,
      })),
    },
    issues,
  };
}

/** Reaplica webhook correto na Evolution (mesmo body do setup-whatsapp.mjs). */
export async function repairEvolutionWebhook(env: Env): Promise<{
  ok: boolean;
  status: number;
  webhookUrl: string;
}> {
  const base = env.EVOLUTION_API_URL?.replace(/\/$/, "");
  const key = env.EVOLUTION_API_KEY?.trim();
  const instance = env.EVOLUTION_INSTANCE?.trim();
  const secrets = evolutionWebhookSecrets(env);
  const secret = secrets[0] ?? "";
  if (!base || !key || !instance || !secret) {
    throw Object.assign(new Error("Evolution ou secret não configurado"), {
      statusCode: 503,
    });
  }
  const webhookUrl = whatsappWebhookUrl(resolvePublicAppUrl(env));
  const res = await fetch(`${base}/webhook/set/${instance}`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({
      webhook: {
        enabled: true,
        url: webhookUrl,
        webhookByEvents: false,
        webhookBase64: false,
        headers: { apikey: secret },
        events: ["MESSAGES_UPSERT"],
      },
    }),
    signal: AbortSignal.timeout(15_000),
  });
  return { ok: res.ok, status: res.status, webhookUrl };
}
