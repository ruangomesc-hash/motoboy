import { resolveApiBase } from "./api-base";
import { buildClientErrorReport, reportClientError } from "./report-client-error";
import { friendlyAuthErrorMessage } from "./auth-errors";
import { redirectIfSessionInvalid } from "./session-expired";

const API_BASE = resolveApiBase();

let lastReportToken: string | null = null;

export function setApiErrorReportToken(token: string | null): void {
  lastReportToken = token;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const hasBody =
    options.body !== undefined &&
    options.body !== null &&
    options.body !== "";
  const headers = new Headers(options.headers);
  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
    ...options,
    credentials: "include",
    headers,
  });
  if (!res.ok) {
    const text = await res.text();
    let message: string | undefined;
    try {
      const err = JSON.parse(text) as {
        error?: string;
        message?: string;
        details?: string[];
      };
      message = err.error ?? err.message;
      if (err.details?.length) {
        message = `${message}\n${err.details.join("\n")}`;
      }
    } catch {
      /* body não é JSON (ex.: proxy do Next quando a API está offline) */
    }
    if (!message) {
      if (res.status === 500 || res.status === 502 || res.status === 503) {
        message =
          "Não foi possível falar com o servidor. Confira a conexão com o banco (Supabase) e as variáveis na Vercel.";
      } else {
        message = `Erro ${res.status}`;
      }
    }
    let authCode: string | undefined;
    try {
      const parsed = JSON.parse(text) as { code?: string };
      authCode = parsed.code;
    } catch {
      /* ignore */
    }
    const friendlyMessage = friendlyAuthErrorMessage(
      message ?? `Erro ${res.status}`,
      authCode,
    );
    const err = new Error(friendlyMessage) as Error & {
      status?: number;
      code?: string;
    };
    err.status = res.status;
    err.code = authCode;
    void redirectIfSessionInvalid(res.status, authCode);
    if (res.status === 402 && typeof window !== "undefined") {
      window.location.href = "/assinar";
    }
    reportClientError(
      buildClientErrorReport(err, path, (options.method ?? "GET").toUpperCase()),
      lastReportToken,
    );
    throw err;
  }
  const text = await res.text();
  if (!text.trim()) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}
