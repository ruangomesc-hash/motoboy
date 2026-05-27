import type { FastifyReply, FastifyRequest } from "fastify";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitOptions = {
  windowMs: number;
  max: number;
  keyPrefix?: string;
};

function clientIp(request: FastifyRequest): string {
  const forwarded = request.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return request.ip ?? "unknown";
}

export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, max, keyPrefix = "" } = options;

  return async function rateLimit(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const path = request.url.split("?")[0] ?? request.url;
    const key = `${keyPrefix}${clientIp(request)}:${request.method}:${path}`;
    const now = Date.now();
    let bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;

    if (bucket.count > max) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
      reply.header("Retry-After", String(retryAfter));
      return reply.status(429).send({
        error: "Muitas tentativas. Aguarde um momento e tente de novo.",
        code: "RATE_LIMITED",
      });
    }
  };
}

/** Limites mais rígidos para login, OTP e bootstrap admin. */
export const authRateLimit = createRateLimiter({
  windowMs: 60_000,
  max: 30,
  keyPrefix: "auth:",
});

export const strictAuthRateLimit = createRateLimiter({
  windowMs: 15 * 60_000,
  max: 15,
  keyPrefix: "auth-strict:",
});
