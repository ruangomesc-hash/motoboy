/** Resposta de GET /api/backend/health */
export type SystemHealthResponse = {
  ok: boolean;
  database?: string;
  error?: string;
  adminTable?: boolean;
  userPasswordColumn?: boolean;
  migrationsHint?: string | null;
  redis?: boolean;
  billingSchema?: {
    userCpfCnpj: boolean;
    paymentChargeKind: boolean;
  };
  billingReady?: boolean;
  asaas?: {
    configured: boolean;
    webhookPath: string;
    webhookTokenConfigured?: boolean;
  };
};

export type SystemHealthLiveResponse = {
  ok: boolean;
};

export type SystemHealthSnapshot = {
  checkedAt: string;
  latencyMs: number;
  live: SystemHealthLiveResponse | null;
  liveLatencyMs: number | null;
  health: SystemHealthResponse | null;
  fetchError: string | null;
  httpStatus: number | null;
};

type FetchSystemHealthOptions = {
  /** Evita travar a UI se /health estiver lento (ex.: cold start + checagens de schema). */
  timeoutMs?: number;
};

async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { cache: "no-store", signal: controller.signal });
  } finally {
    window.clearTimeout(timer);
  }
}

export async function fetchSystemHealth(
  options: FetchSystemHealthOptions = {},
): Promise<SystemHealthSnapshot> {
  const timeoutMs = options.timeoutMs ?? 12_000;
  const checkedAt = new Date().toISOString();
  const base = "/api/backend";

  let live: SystemHealthLiveResponse | null = null;
  let liveLatencyMs: number | null = null;
  try {
    const t0 = performance.now();
    const res = await fetchWithTimeout(`${base}/health/live`, Math.min(timeoutMs, 4_000));
    liveLatencyMs = Math.round(performance.now() - t0);
    if (res.ok) {
      live = (await res.json()) as SystemHealthLiveResponse;
    }
  } catch {
    live = null;
  }

  let health: SystemHealthResponse | null = null;
  let fetchError: string | null = null;
  let httpStatus: number | null = null;
  let latencyMs = 0;

  try {
    const t0 = performance.now();
    const res = await fetchWithTimeout(`${base}/health`, timeoutMs);
    latencyMs = Math.round(performance.now() - t0);
    httpStatus = res.status;
    const body = (await res.json()) as SystemHealthResponse;
    health = body;
    if (!res.ok) {
      fetchError = body.error ?? `HTTP ${res.status}`;
    }
  } catch (err) {
    fetchError =
      err instanceof Error && err.name === "AbortError"
        ? "Tempo esgotado ao consultar a API"
        : err instanceof Error
          ? err.message
          : "Não foi possível consultar a API";
  }

  return {
    checkedAt,
    latencyMs,
    live,
    liveLatencyMs,
    health,
    fetchError,
    httpStatus,
  };
}

export function isSystemHealthy(snapshot: SystemHealthSnapshot): boolean {
  if (snapshot.fetchError) return false;
  if (!snapshot.health?.ok) return false;
  if (snapshot.health.database !== "connected") return false;
  if (snapshot.health.adminTable === false) return false;
  if (snapshot.health.userPasswordColumn === false) return false;
  return true;
}
