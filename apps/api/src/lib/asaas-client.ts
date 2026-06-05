import type { Env } from "@motoboy/types";
import {
  logAsaasRequestError,
  type AsaasRequestContext,
} from "./asaas-request-log.js";

export const ASAAS_PRODUCTION_BASE_URL = "https://api.asaas.com/v3";
export const ASAAS_SANDBOX_BASE_URL = "https://api-sandbox.asaas.com/v3";

/** @deprecated Use asaasBaseUrl(env) */
export const ASAAS_BASE_URL = ASAAS_PRODUCTION_BASE_URL;

export type AsaasBillingType = "PIX" | "CREDIT_CARD" | "BOLETO" | "UNDEFINED";

export type AsaasConnectionProbe = {
  ok: boolean;
  sandbox: boolean;
  baseUrl: string;
  latencyMs: number;
  error?: string;
  httpStatus?: number;
};

export function asaasBaseUrl(env: Env): string {
  if (env.ASAAS_SANDBOX) {
    return ASAAS_SANDBOX_BASE_URL;
  }
  return ASAAS_PRODUCTION_BASE_URL;
}

export function isAsaasConfigured(env: Env): boolean {
  return Boolean(env.ASAAS_API_KEY?.trim());
}

export function toAsaasBillingType(method: string): AsaasBillingType {
  if (method === "CREDIT_CARD") return "CREDIT_CARD";
  if (method === "BOLETO") return "BOLETO";
  return "PIX";
}

export class AsaasApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = "AsaasApiError";
  }
}

type AsaasErrorBody = {
  errors?: { code?: string; description?: string }[];
};

function isAsaasTimeoutError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return (
    err.name === "TimeoutError" ||
    err.name === "AbortError" ||
    /timeout|aborted/i.test(err.message)
  );
}

export async function probeAsaasConnection(
  env: Env,
  timeoutMs = 8_000,
): Promise<AsaasConnectionProbe> {
  const baseUrl = asaasBaseUrl(env);
  const sandbox = Boolean(env.ASAAS_SANDBOX);
  const started = Date.now();

  if (!env.ASAAS_API_KEY?.trim()) {
    return {
      ok: false,
      sandbox,
      baseUrl,
      latencyMs: 0,
      error: "ASAAS_API_KEY não configurada",
    };
  }

  try {
    const res = await fetch(`${baseUrl}/customers?limit=1`, {
      headers: {
        access_token: env.ASAAS_API_KEY,
        "User-Agent": "Motocopiloto/1.0",
      },
      signal: AbortSignal.timeout(timeoutMs),
    });
    const latencyMs = Date.now() - started;
    if (res.status === 401 || res.status === 403) {
      return {
        ok: false,
        sandbox,
        baseUrl,
        latencyMs,
        httpStatus: res.status,
        error:
          "Chave Asaas inválida ou ambiente errado (produção vs sandbox). Confira ASAAS_API_KEY e ASAAS_SANDBOX na Vercel.",
      };
    }
    if (!res.ok) {
      return {
        ok: false,
        sandbox,
        baseUrl,
        latencyMs,
        httpStatus: res.status,
        error: `Asaas respondeu HTTP ${res.status}`,
      };
    }
    return { ok: true, sandbox, baseUrl, latencyMs };
  } catch (err) {
    return {
      ok: false,
      sandbox,
      baseUrl,
      latencyMs: Date.now() - started,
      error: isAsaasTimeoutError(err)
        ? `Asaas não respondeu em ${timeoutMs}ms (${baseUrl})`
        : err instanceof Error
          ? err.message
          : "Falha ao conectar no Asaas",
    };
  }
}

export async function asaasRequest<T>(
  env: Env,
  path: string,
  init: RequestInit = {},
  ctx: AsaasRequestContext = {},
): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  try {
    if (!env.ASAAS_API_KEY?.trim()) {
      throw new AsaasApiError("ASAAS_API_KEY não configurada", 503);
    }

    const url = `${asaasBaseUrl(env)}${path.startsWith("/") ? path : `/${path}`}`;
    const res = await fetch(url, {
      ...init,
      signal: init.signal ?? AbortSignal.timeout(12_000),
      headers: {
        "Content-Type": "application/json",
        access_token: env.ASAAS_API_KEY,
        "User-Agent": "Motocopiloto/1.0",
        ...(init.headers as Record<string, string> | undefined),
      },
    });

    const text = await res.text();
    let data: T & AsaasErrorBody = {} as T & AsaasErrorBody;
    if (text) {
      try {
        data = JSON.parse(text) as T & AsaasErrorBody;
      } catch {
        throw new AsaasApiError(
          `Resposta inválida do Asaas (${res.status})`,
          res.status,
          text.slice(0, 200),
        );
      }
    }

    if (!res.ok) {
      const msg =
        data.errors?.[0]?.description ??
        data.errors?.[0]?.code ??
        `Erro Asaas HTTP ${res.status}`;
      throw new AsaasApiError(msg, res.status, data);
    }

    return data as T;
  } catch (err) {
    if (isAsaasTimeoutError(err)) {
      const timeoutErr = new AsaasApiError(
        `Asaas demorou para responder (${asaasBaseUrl(env)}). Verifique ASAAS_API_KEY, ASAAS_SANDBOX e a conexão.`,
        504,
      );
      logAsaasRequestError(timeoutErr, ctx, { path, method });
      throw timeoutErr;
    }
    logAsaasRequestError(err, ctx, { path, method });
    throw err;
  }
}
