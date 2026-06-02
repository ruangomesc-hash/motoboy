import { prisma } from "@motoboy/db";
import type { Env } from "@motoboy/types";
import { isRedisEnabled } from "../lib/redis.js";

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
    urlMatches: boolean;
    hasApikeyHeader: boolean;
    events: string[];
  };
  database: {
    messagesLast48h: number;
    messagesLast24h: number;
    deliveriesLast48h: number;
    recentMessages: Array<{
      receivedAt: string;
      fromNumber: string;
      messageType: string;
      userId: string | null;
    }>;
    recentWhatsAppErrors: Array<{
      createdAt: string;
      errorCode: string;
      rawMessage: string;
      userId: string | null;
    }>;
  };
  issues: WhatsAppPipelineIssue[];
};

function expectedWebhookUrl(env: Env): string {
  const base = env.APP_URL.replace(/\/$/, "");
  return `${base}/api/backend/webhooks/whatsapp`;
}

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
  return { enabled, url, events, hasApikeyHeader };
}

export async function getWhatsAppPipelineDiagnostics(
  env: Env,
): Promise<WhatsAppPipelineDiagnostics> {
  const issues: WhatsAppPipelineIssue[] = [];
  const expected = expectedWebhookUrl(env);
  const runWhatsAppWorker = process.env.RUN_WHATSAPP_WORKER === "true";
  const processing = runWhatsAppWorker ? "queue" : "inline";
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
    urlMatches: false,
    hasApikeyHeader: false,
    events: [] as string[],
  };

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
    webhook = {
      enabled: parsed.enabled,
      configuredUrl: parsed.url,
      urlMatches:
        Boolean(parsed.url) &&
        parsed.url!.replace(/\/$/, "") === expected.replace(/\/$/, ""),
      hasApikeyHeader: parsed.hasApikeyHeader,
      events: parsed.events,
    };

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
          message: `Webhook aponta para ${webhook.configuredUrl}, mas deveria ser ${expected}.`,
          action:
            "Mensagens não chegam na Vercel. Repare o webhook ou corrija no manager Evolution.",
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

  if (runWhatsAppWorker && processing === "queue") {
    issues.push({
      severity: "warning",
      code: "QUEUE_MODE_VERCEL",
      message:
        "Modo fila ativo: o webhook só enfileira; o Railway precisa estar no ar.",
      action:
        "Para só Vercel: RUN_WHATSAPP_WORKER=false. Para fila: Railway com build OK + mesmo REDIS_URL.",
    });
  }

  const since48 = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const since24 = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [messagesLast48h, messagesLast24h, recentMessages, recentWhatsAppErrors] =
    await Promise.all([
      prisma.whatsAppMessage.count({
        where: { receivedAt: { gte: since48 } },
      }),
      prisma.whatsAppMessage.count({
        where: { receivedAt: { gte: since24 } },
      }),
      prisma.whatsAppMessage.findMany({
        where: { receivedAt: { gte: since48 } },
        orderBy: { receivedAt: "desc" },
        take: 10,
        select: {
          receivedAt: true,
          fromNumber: true,
          messageType: true,
          userId: true,
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

  if (messagesLast24h === 0 && evolutionConfigured && apiReachable) {
    issues.push({
      severity: "critical",
      code: "NO_MESSAGES_IN_DB",
      message:
        "Nenhuma mensagem WhatsApp no banco nas últimas 24h — o webhook não está entregando na API.",
      action:
        "Corrija URL/secret do webhook na Evolution (veja WEBHOOK_URL_MISMATCH acima).",
    });
  }

  const unmatched = recentMessages.filter((m) => !m.userId).length;
  if (unmatched >= 3) {
    issues.push({
      severity: "warning",
      code: "PHONE_NOT_MATCHED",
      message: `${unmatched} mensagens recentes sem usuário — número do Zap ≠ cadastro no app.`,
      action:
        "Configurações → WhatsApp deve ser o mesmo celular (55 + DDD + 9 dígitos).",
    });
  }

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
      deliveriesLast48h,
      recentMessages: recentMessages.map((m) => ({
        receivedAt: m.receivedAt.toISOString(),
        fromNumber: m.fromNumber,
        messageType: m.messageType,
        userId: m.userId,
      })),
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
  const secret =
    process.env.EVOLUTION_WEBHOOK_SECRET?.trim() ||
    env.EVOLUTION_API_KEY?.trim() ||
    "";
  if (!base || !key || !instance || !secret) {
    throw Object.assign(new Error("Evolution ou secret não configurado"), {
      statusCode: 503,
    });
  }
  const webhookUrl = expectedWebhookUrl(env);
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
