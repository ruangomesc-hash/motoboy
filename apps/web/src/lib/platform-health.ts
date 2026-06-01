import type { PlatformHealthReport, PlatformHealthRow } from "@motoboy/types";
import type { SystemHealthSnapshot } from "@/lib/system-health";

const STATUS_PAGES = {
  railway: "https://status.railway.app/",
  vercel: "https://www.vercel-status.com/",
} as const;

function railwayRow(snapshot: SystemHealthSnapshot): PlatformHealthRow {
  const liveOk = snapshot.live?.ok === true;

  return {
    id: "railway",
    label: "Railway (API)",
    status: liveOk ? "ok" : snapshot.live === null ? "error" : "error",
    ok: liveOk,
    message: liveOk
      ? "/health/live respondendo"
      : snapshot.fetchError ?? "API indisponível",
    latencyMs: snapshot.liveLatencyMs,
    statusPageUrl: STATUS_PAGES.railway,
    detail: "Fastify · /health/live",
  };
}

async function vercelRow(): Promise<PlatformHealthRow> {
  const t0 = performance.now();
  try {
    const res = await fetch("/api/health", { cache: "no-store" });
    const latencyMs = Math.round(performance.now() - t0);
    if (!res.ok) {
      return {
        id: "vercel",
        label: "Vercel (Web)",
        status: "error",
        ok: false,
        message: `HTTP ${res.status}`,
        latencyMs,
        statusPageUrl: STATUS_PAGES.vercel,
        detail: "Next.js app",
      };
    }
    return {
      id: "vercel",
      label: "Vercel (Web)",
      status: "ok",
      ok: true,
      message: "App respondendo",
      latencyMs,
      statusPageUrl: STATUS_PAGES.vercel,
      detail: "Next.js app",
    };
  } catch (err) {
    return {
      id: "vercel",
      label: "Vercel (Web)",
      status: "error",
      ok: false,
      message:
        err instanceof Error ? err.message : "Frontend indisponível",
      latencyMs: Math.round(performance.now() - t0),
      statusPageUrl: STATUS_PAGES.vercel,
      detail: null,
    };
  }
}

const PLATFORM_ORDER: PlatformHealthRow["id"][] = [
  "railway",
  "vercel",
  "upstash",
  "evolution",
  "whatsapp",
];

export function platformStatusLabel(
  status: PlatformHealthRow["status"],
): string {
  const map: Record<PlatformHealthRow["status"], string> = {
    ok: "Online",
    degraded: "Parcial",
    error: "Offline",
    not_configured: "Não config.",
  };
  return map[status];
}

export function mergePlatformHealth(
  snapshot: SystemHealthSnapshot,
  server: PlatformHealthReport | null,
  vercel: PlatformHealthRow,
): PlatformHealthReport {
  const byId = new Map<PlatformHealthRow["id"], PlatformHealthRow>();
  byId.set("railway", railwayRow(snapshot));
  byId.set("vercel", vercel);
  for (const row of server?.platforms ?? []) {
    byId.set(row.id, row);
  }

  return {
    checkedAt: new Date().toISOString(),
    platforms: PLATFORM_ORDER.map((id) => byId.get(id)).filter(
      (row): row is PlatformHealthRow => row != null,
    ),
  };
}

export async function fetchVercelHealth(): Promise<PlatformHealthRow> {
  return vercelRow();
}
