import type { Env } from "@motoboy/types";

export const ASAAS_BASE_SANDBOX = "https://sandbox.asaas.com/api/v3";
export const ASAAS_BASE_PROD = "https://api.asaas.com/v3";

export type AsaasBillingType = "PIX" | "CREDIT_CARD" | "BOLETO" | "UNDEFINED";

export function asaasBaseUrl(env: Env): string {
  return env.ASAAS_SANDBOX ? ASAAS_BASE_SANDBOX : ASAAS_BASE_PROD;
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

export async function asaasRequest<T>(
  env: Env,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  if (!env.ASAAS_API_KEY?.trim()) {
    throw new AsaasApiError("ASAAS_API_KEY não configurada", 503);
  }

  const url = `${asaasBaseUrl(env)}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...init,
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
}
