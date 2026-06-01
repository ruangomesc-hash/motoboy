import type { Env } from "@motoboy/types";

export type IntegrationStatus =
  | "ok"
  | "degraded"
  | "rate_limited"
  | "error"
  | "not_configured";

export type IntegrationRateLimit = {
  remainingTokens: number | null;
  limitTokens: number | null;
  remainingRequests: number | null;
  limitRequests: number | null;
};

export type IntegrationHealthRow = {
  id: string;
  label: string;
  model: string | null;
  role: string;
  configured: boolean;
  status: IntegrationStatus;
  message: string | null;
  latencyMs: number | null;
  rateLimit: IntegrationRateLimit | null;
};

export type IntegrationsHealthReport = {
  checkedAt: string;
  integrations: IntegrationHealthRow[];
};

function parseHeaderInt(headers: Headers, key: string): number | null {
  const raw = headers.get(key);
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function rateLimitFromHeaders(headers: Headers): IntegrationRateLimit {
  return {
    remainingTokens: parseHeaderInt(headers, "x-ratelimit-remaining-tokens"),
    limitTokens: parseHeaderInt(headers, "x-ratelimit-limit-tokens"),
    remainingRequests: parseHeaderInt(headers, "x-ratelimit-remaining-requests"),
    limitRequests: parseHeaderInt(headers, "x-ratelimit-limit-requests"),
  };
}

function classifyTokenPressure(
  rateLimit: IntegrationRateLimit | null,
): IntegrationStatus | null {
  if (!rateLimit?.limitTokens || rateLimit.remainingTokens == null) {
    return null;
  }
  const ratio = rateLimit.remainingTokens / rateLimit.limitTokens;
  if (ratio <= 0) return "rate_limited";
  if (ratio < 0.05) return "rate_limited";
  if (ratio < 0.2) return "degraded";
  return null;
}

function openAiErrorMessage(body: unknown): string {
  if (!body || typeof body !== "object") return "Erro desconhecido na OpenAI";
  const err = (body as { error?: { message?: string; code?: string; type?: string } })
    .error;
  if (!err) return "Erro desconhecido na OpenAI";
  const code = err.code ?? err.type;
  if (code === "insufficient_quota") {
    return "Cota / billing esgotado (sem tokens disponíveis)";
  }
  if (code === "rate_limit_exceeded") {
    return "Limite de requisições ou tokens por minuto atingido";
  }
  return err.message ?? String(code ?? "Erro OpenAI");
}

function openAiStatusFromHttp(
  status: number,
  body: unknown,
  rateLimit: IntegrationRateLimit | null,
): { status: IntegrationStatus; message: string } {
  if (status === 429) {
    return {
      status: "rate_limited",
      message: openAiErrorMessage(body),
    };
  }
  if (status === 401 || status === 403) {
    return {
      status: "error",
      message: openAiErrorMessage(body),
    };
  }
  if (status >= 400) {
    return {
      status: "error",
      message: openAiErrorMessage(body),
    };
  }
  const pressure = classifyTokenPressure(rateLimit);
  if (pressure === "rate_limited") {
    return {
      status: "rate_limited",
      message: "Tokens quase esgotados no plano atual",
    };
  }
  if (pressure === "degraded") {
    return {
      status: "degraded",
      message: "Poucos tokens restantes — monitore o billing OpenAI",
    };
  }
  return { status: "ok", message: "Conectado e respondendo" };
}

async function probeOpenAiChatModel(
  apiKey: string,
  model: string,
  label: string,
  role: string,
): Promise<IntegrationHealthRow> {
  const base: IntegrationHealthRow = {
    id: `openai-${model}`,
    label,
    model,
    role,
    configured: true,
    status: "error",
    message: null,
    latencyMs: null,
    rateLimit: null,
  };

  const t0 = Date.now();
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 1,
      }),
      signal: AbortSignal.timeout(25_000),
    });
    const latencyMs = Date.now() - t0;
    const rateLimit = rateLimitFromHeaders(res.headers);
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    const verdict = openAiStatusFromHttp(res.status, body, rateLimit);
    return {
      ...base,
      status: verdict.status,
      message: verdict.message,
      latencyMs,
      rateLimit,
    };
  } catch (err) {
    return {
      ...base,
      status: "error",
      message:
        err instanceof Error ? err.message : "Falha ao contactar a OpenAI",
      latencyMs: Date.now() - t0,
      rateLimit: null,
    };
  }
}

async function probeOpenAiWhisper(
  apiKey: string,
): Promise<IntegrationHealthRow> {
  const base: IntegrationHealthRow = {
    id: "openai-whisper-1",
    label: "OpenAI Whisper",
    model: "whisper-1",
    role: "Transcrição de áudio (WhatsApp)",
    configured: true,
    status: "error",
    message: null,
    latencyMs: null,
    rateLimit: null,
  };

  const t0 = Date.now();
  try {
    const res = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(15_000),
    });
    const latencyMs = Date.now() - t0;
    const rateLimit = rateLimitFromHeaders(res.headers);
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }

    if (!res.ok) {
      const verdict = openAiStatusFromHttp(res.status, body, rateLimit);
      return { ...base, ...verdict, latencyMs, rateLimit };
    }

    const models = (body as { data?: { id?: string }[] })?.data ?? [];
    const hasWhisper = models.some((m) => m.id === "whisper-1");
    if (!hasWhisper) {
      return {
        ...base,
        status: "degraded",
        message: "API OK, mas modelo whisper-1 não listado na conta",
        latencyMs,
        rateLimit,
      };
    }

    const pressure = classifyTokenPressure(rateLimit);
    return {
      ...base,
      status: pressure ?? "ok",
      message:
        pressure === "rate_limited"
          ? "Limite de uso atingido"
          : pressure === "degraded"
            ? "API OK — verifique cota de áudio no painel OpenAI"
            : "Modelo disponível na conta",
      latencyMs,
      rateLimit,
    };
  } catch (err) {
    return {
      ...base,
      status: "error",
      message:
        err instanceof Error ? err.message : "Falha ao contactar a OpenAI",
      latencyMs: Date.now() - t0,
      rateLimit: null,
    };
  }
}

async function probeGoogleMaps(apiKey: string): Promise<IntegrationHealthRow> {
  const base: IntegrationHealthRow = {
    id: "google-maps",
    label: "Google Maps",
    model: null,
    role: "Rotas e geocoding no app",
    configured: true,
    status: "error",
    message: null,
    latencyMs: null,
    rateLimit: null,
  };

  const t0 = Date.now();
  try {
    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    url.searchParams.set("address", "São Paulo, SP");
    url.searchParams.set("key", apiKey);
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    const latencyMs = Date.now() - t0;
    const json = (await res.json()) as {
      status?: string;
      error_message?: string;
    };

    if (json.status === "OK" || json.status === "ZERO_RESULTS") {
      return {
        ...base,
        status: "ok",
        message: "Geocoding respondendo",
        latencyMs,
        rateLimit: null,
      };
    }
    if (json.status === "OVER_QUERY_LIMIT") {
      return {
        ...base,
        status: "rate_limited",
        message: json.error_message ?? "Cota da API Google esgotada",
        latencyMs,
        rateLimit: null,
      };
    }
    return {
      ...base,
      status: "error",
      message: json.error_message ?? `Status: ${json.status ?? "erro"}`,
      latencyMs,
      rateLimit: null,
    };
  } catch (err) {
    return {
      ...base,
      status: "error",
      message:
        err instanceof Error ? err.message : "Falha ao contactar Google Maps",
      latencyMs: Date.now() - t0,
      rateLimit: null,
    };
  }
}

async function probeEvolution(env: Env): Promise<IntegrationHealthRow> {
  const configured = Boolean(
    env.EVOLUTION_API_URL?.trim() &&
      env.EVOLUTION_API_KEY?.trim() &&
      env.EVOLUTION_INSTANCE?.trim(),
  );
  const base: IntegrationHealthRow = {
    id: "evolution-whatsapp",
    label: "Evolution API",
    model: env.EVOLUTION_INSTANCE ?? null,
    role: "WhatsApp (entrada de mensagens)",
    configured,
    status: configured ? "error" : "not_configured",
    message: configured ? null : "Variáveis EVOLUTION_* não configuradas",
    latencyMs: null,
    rateLimit: null,
  };
  if (!configured) return base;

  const t0 = Date.now();
  try {
    const res = await fetch(
      `${env.EVOLUTION_API_URL!.replace(/\/$/, "")}/instance/connectionState/${env.EVOLUTION_INSTANCE}`,
      {
        headers: { apikey: env.EVOLUTION_API_KEY! },
        signal: AbortSignal.timeout(12_000),
      },
    );
    const latencyMs = Date.now() - t0;
    let json: { instance?: { state?: string }; state?: string } = {};
    try {
      json = (await res.json()) as typeof json;
    } catch {
      json = {};
    }

    if (!res.ok) {
      return {
        ...base,
        status: "error",
        message: `HTTP ${res.status} ao consultar instância`,
        latencyMs,
        rateLimit: null,
      };
    }

    const state =
      json?.instance?.state ?? json?.state ?? JSON.stringify(json ?? {});
    const normalized = String(state).toLowerCase();
    if (normalized.includes("open")) {
      return {
        ...base,
        status: "ok",
        message: `Conectado (${state})`,
        latencyMs,
        rateLimit: null,
      };
    }
    if (
      normalized.includes("connecting") ||
      normalized.includes("qrcode") ||
      normalized.includes("qr")
    ) {
      return {
        ...base,
        status: "degraded",
        message: `Aguardando conexão (${state})`,
        latencyMs,
        rateLimit: null,
      };
    }
    return {
      ...base,
      status: "error",
      message: `Desconectado (${state})`,
      latencyMs,
      rateLimit: null,
    };
  } catch (err) {
    return {
      ...base,
      status: "error",
      message:
        err instanceof Error ? err.message : "Evolution API inacessível",
      latencyMs: Date.now() - t0,
      rateLimit: null,
    };
  }
}

function notConfiguredRow(
  id: string,
  label: string,
  model: string | null,
  role: string,
): IntegrationHealthRow {
  return {
    id,
    label,
    model,
    role,
    configured: false,
    status: "not_configured",
    message: "Chave não configurada no servidor",
    latencyMs: null,
    rateLimit: null,
  };
}

export async function getIntegrationsHealth(
  env: Env,
): Promise<IntegrationsHealthReport> {
  const openAiKey = env.OPENAI_API_KEY?.trim();
  const mapsKey = env.GOOGLE_MAPS_API_KEY?.trim();

  const rows: IntegrationHealthRow[] = [];

  if (openAiKey) {
    const [whisper, mini, vision] = await Promise.all([
      probeOpenAiWhisper(openAiKey),
      probeOpenAiChatModel(
        openAiKey,
        "gpt-4o-mini",
        "OpenAI GPT-4o mini",
        "Extração de texto (WhatsApp / comandos)",
      ),
      probeOpenAiChatModel(
        openAiKey,
        "gpt-4o",
        "OpenAI GPT-4o",
        "Visão — fotos de entrega e hodômetro",
      ),
    ]);
    rows.push(whisper, mini, vision);
  } else {
    rows.push(
      notConfiguredRow(
        "openai-whisper-1",
        "OpenAI Whisper",
        "whisper-1",
        "Transcrição de áudio",
      ),
      notConfiguredRow(
        "openai-gpt-4o-mini",
        "OpenAI GPT-4o mini",
        "gpt-4o-mini",
        "Extração de texto",
      ),
      notConfiguredRow(
        "openai-gpt-4o",
        "OpenAI GPT-4o",
        "gpt-4o",
        "Visão (imagens)",
      ),
    );
  }

  rows.push(
    mapsKey
      ? await probeGoogleMaps(mapsKey)
      : notConfiguredRow(
          "google-maps",
          "Google Maps",
          null,
          "Rotas no app",
        ),
  );

  rows.push(await probeEvolution(env));

  return {
    checkedAt: new Date().toISOString(),
    integrations: rows,
  };
}
