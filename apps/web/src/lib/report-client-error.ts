import type { ClientErrorReport } from "@motoboy/types";
import { resolveApiBase } from "./api-base";

const REPORT_DEDUP_MS = 60_000;
const recentKeys = new Map<string, number>();

function dedupeKey(payload: ClientErrorReport): string {
  return [
    payload.code ?? "",
    payload.route,
    payload.httpStatus ?? "",
    payload.message.slice(0, 120),
  ].join("|");
}

function shouldSkipReport(payload: ClientErrorReport): boolean {
  if (payload.route.startsWith("/admin")) return true;
  const key = dedupeKey(payload);
  const now = Date.now();
  const prev = recentKeys.get(key);
  if (prev != null && now - prev < REPORT_DEDUP_MS) return true;
  recentKeys.set(key, now);
  return false;
}

/** Envia erro ao backend para histórico admin (fire-and-forget). */
export function reportClientError(
  payload: ClientErrorReport,
  token?: string | null,
): void {
  if (typeof window === "undefined") return;
  if (!token) return;
  if (shouldSkipReport(payload)) return;

  const base = resolveApiBase();
  void fetch(`${base}/me/client-errors`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  }).catch(() => {
    /* silencioso — API também registra falhas de auth */
  });
}

export function buildClientErrorReport(
  err: Error & { status?: number; code?: string },
  route: string,
  method: string,
): ClientErrorReport {
  return {
    code: err.code,
    message: err.message.slice(0, 2000),
    httpStatus: err.status,
    route,
    method,
  };
}
