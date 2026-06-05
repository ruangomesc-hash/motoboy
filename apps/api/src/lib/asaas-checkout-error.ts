import { AsaasApiError } from "./asaas-client.js";

export function mapAsaasCheckoutHttpError(err: unknown): {
  status: number;
  body: { error: string; code: string };
} | null {
  if (!(err instanceof AsaasApiError)) return null;

  const msg = err.message?.trim() || "Erro no gateway de pagamento.";
  if (err.statusCode === 401 || err.statusCode === 403) {
    return {
      status: 503,
      body: {
        error:
          "Chave da API Asaas inválida ou sem permissão. Confira ASAAS_API_KEY na Vercel (conta produção).",
        code: "ASAAS_AUTH_ERROR",
      },
    };
  }
  if (err.statusCode === 503) {
    return { status: 503, body: { error: msg, code: "ASAAS_UNAVAILABLE" } };
  }
  if (err.statusCode >= 500) {
    return {
      status: 502,
      body: {
        error: "Gateway de pagamento indisponível. Tente novamente em instantes.",
        code: "ASAAS_ERROR",
      },
    };
  }
  return { status: 400, body: { error: msg, code: "ASAAS_ERROR" } };
}
