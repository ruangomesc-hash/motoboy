/** Resposta de GET /api/backend/health */
export type SystemHealthResponse = {
  ok: boolean;
  database?: string;
  error?: string;
  adminTable?: boolean;
  userPasswordColumn?: boolean;
  migrationsHint?: string | null;
  redis?: boolean;
  asaas?: {
    configured: boolean;
    sandbox: boolean;
    webhookPath: string;
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

export async function fetchSystemHealth(): Promise<SystemHealthSnapshot> {
  const checkedAt = new Date().toISOString();
  const base = "/api/backend";

  let live: SystemHealthLiveResponse | null = null;
  let liveLatencyMs: number | null = null;
  try {
    const t0 = performance.now();
    const res = await fetch(`${base}/health/live`, { cache: "no-store" });
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
    const res = await fetch(`${base}/health`, { cache: "no-store" });
    latencyMs = Math.round(performance.now() - t0);
    httpStatus = res.status;
    const body = (await res.json()) as SystemHealthResponse;
    health = body;
    if (!res.ok) {
      fetchError = body.error ?? `HTTP ${res.status}`;
    }
  } catch (err) {
    fetchError =
      err instanceof Error ? err.message : "Não foi possível consultar a API";
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
