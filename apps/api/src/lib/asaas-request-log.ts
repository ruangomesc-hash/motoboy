import type { FastifyBaseLogger } from "fastify";

export type AsaasRequestContext = {
  log?: FastifyBaseLogger;
  /** Nome da operação para logs (ex.: createCustomer, createSubscription). */
  operation?: string;
};

export function logAsaasRequestError(
  err: unknown,
  ctx: AsaasRequestContext,
  meta: { path: string; method: string },
): void {
  if (!ctx.log) return;
  ctx.log.error(
    {
      err,
      asaasOperation: ctx.operation,
      asaasPath: meta.path,
      asaasMethod: meta.method,
    },
    "Falha na chamada à API Asaas",
  );
}
