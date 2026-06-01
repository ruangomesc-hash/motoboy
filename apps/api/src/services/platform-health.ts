import type {
  Env,
  PlatformHealthReport,
  PlatformHealthRow,
} from "@motoboy/types";
import { getRedis, isRedisEnabled } from "../lib/redis.js";

const STATUS_PAGES = {
  upstash: "https://status.upstash.com/",
  railway: "https://status.railway.app/",
  vercel: "https://www.vercel-status.com/",
  evolution: null as string | null,
  whatsapp: "https://developers.facebook.com/status/",
} as const;

function row(
  partial: Omit<PlatformHealthRow, "statusPageUrl"> & {
    statusPageUrl?: string | null;
  },
): PlatformHealthRow {
  return {
    statusPageUrl: STATUS_PAGES[partial.id] ?? null,
    ...partial,
  };
}

async function probeUpstash(env: Env): Promise<PlatformHealthRow> {
  if (!isRedisEnabled(env)) {
    return row({
      id: "upstash",
      label: "Upstash (Redis)",
      status: "not_configured",
      ok: false,
      message: "REDIS_URL não configurado",
      latencyMs: null,
      detail: "Fila WhatsApp desativada",
    });
  }

  const t0 = Date.now();
  try {
    const client = getRedis(env);
    if (client.status === "wait") {
      await client.connect();
    }
    const pong = await client.ping();
    const latencyMs = Date.now() - t0;
    const ok = pong === "PONG";
    return row({
      id: "upstash",
      label: "Upstash (Redis)",
      status: ok ? "ok" : "error",
      ok,
      message: ok ? "PING respondendo" : `Resposta inesperada: ${pong}`,
      latencyMs,
      detail: env.REDIS_URL?.startsWith("rediss://")
        ? "TLS (rediss://)"
        : "TCP redis://",
    });
  } catch (err) {
    return row({
      id: "upstash",
      label: "Upstash (Redis)",
      status: "error",
      ok: false,
      message:
        err instanceof Error ? err.message : "Falha ao conectar no Redis",
      latencyMs: Date.now() - t0,
      detail: null,
    });
  }
}

type EvolutionProbe = {
  evolution: PlatformHealthRow;
  whatsapp: PlatformHealthRow;
};

async function probeEvolutionPlatforms(env: Env): Promise<EvolutionProbe> {
  const configured = Boolean(
    env.EVOLUTION_API_URL?.trim() &&
      env.EVOLUTION_API_KEY?.trim() &&
      env.EVOLUTION_INSTANCE?.trim(),
  );

  const evolutionBase = row({
    id: "evolution",
    label: "Evolution API",
    status: configured ? "error" : "not_configured",
    ok: false,
    message: configured ? null : "Variáveis EVOLUTION_* não configuradas",
    latencyMs: null,
    detail: env.EVOLUTION_API_URL ?? null,
  });

  const whatsappBase = row({
    id: "whatsapp",
    label: "WhatsApp",
    status: configured ? "error" : "not_configured",
    ok: false,
    message: configured ? null : "Depende da Evolution API",
    latencyMs: null,
    detail: env.EVOLUTION_INSTANCE ?? null,
  });

  if (!configured) {
    return { evolution: evolutionBase, whatsapp: whatsappBase };
  }

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
        evolution: {
          ...evolutionBase,
          status: "error",
          ok: false,
          message: `HTTP ${res.status} — API inacessível`,
          latencyMs,
        },
        whatsapp: {
          ...whatsappBase,
          status: "error",
          ok: false,
          message: "Instância não consultada (Evolution com erro)",
          latencyMs,
        },
      };
    }

    const state =
      json?.instance?.state ?? json?.state ?? JSON.stringify(json ?? {});
    const normalized = String(state).toLowerCase();

    const evolution: PlatformHealthRow = {
      ...evolutionBase,
      status: "ok",
      ok: true,
      message: "API respondendo",
      latencyMs,
      detail: env.EVOLUTION_INSTANCE ?? null,
    };

    let whatsappStatus: PlatformHealthRow["status"] = "error";
    let whatsappOk = false;
    let whatsappMessage: string;

    if (normalized.includes("open")) {
      whatsappStatus = "ok";
      whatsappOk = true;
      whatsappMessage = `Conectado (${state})`;
    } else if (
      normalized.includes("connecting") ||
      normalized.includes("qrcode") ||
      normalized.includes("qr")
    ) {
      whatsappStatus = "degraded";
      whatsappOk = false;
      whatsappMessage = `Aguardando pareamento (${state})`;
    } else {
      whatsappStatus = "error";
      whatsappOk = false;
      whatsappMessage = `Desconectado (${state})`;
    }

    return {
      evolution,
      whatsapp: {
        ...whatsappBase,
        status: whatsappStatus,
        ok: whatsappOk,
        message: whatsappMessage,
        latencyMs,
      },
    };
  } catch (err) {
    const latencyMs = Date.now() - t0;
    const message =
      err instanceof Error ? err.message : "Evolution API inacessível";
    return {
      evolution: {
        ...evolutionBase,
        status: "error",
        ok: false,
        message,
        latencyMs,
      },
      whatsapp: {
        ...whatsappBase,
        status: "error",
        ok: false,
        message: "Instância indisponível",
        latencyMs,
      },
    };
  }
}

/** Probes que rodam no servidor (Railway): Upstash, Evolution, WhatsApp. */
export async function getServerPlatformHealth(
  env: Env,
): Promise<PlatformHealthReport> {
  const [upstash, evolutionPair] = await Promise.all([
    probeUpstash(env),
    probeEvolutionPlatforms(env),
  ]);

  return {
    checkedAt: new Date().toISOString(),
    platforms: [upstash, evolutionPair.evolution, evolutionPair.whatsapp],
  };
}
