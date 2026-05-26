import { Redis as RedisClient } from "ioredis";
import type { Env } from "@motoboy/types";

let redis: RedisClient | null = null;

/** Redis opcional: auth e CRUD usam Postgres (Supabase). Redis só para fila WhatsApp. */
export function isRedisEnabled(env: Env): boolean {
  const url = env.REDIS_URL?.trim();
  if (!url) return false;
  if (url === "redis://localhost:6379" && process.env.VERCEL === "1") {
    return false;
  }
  return true;
}

export function getRedis(env: Env): RedisClient {
  if (!isRedisEnabled(env)) {
    throw new Error("REDIS_URL não configurado");
  }
  if (!redis) {
    redis = new RedisClient(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      tls: env.REDIS_URL.startsWith("rediss://") ? {} : undefined,
      lazyConnect: true,
    });
  }
  return redis;
}

export async function redisSetex(
  client: RedisClient | null,
  key: string,
  seconds: number,
  value: string,
): Promise<void> {
  if (!client) return;
  try {
    await client.setex(key, seconds, value);
  } catch {
    // Postgres AuthCode é a fonte de verdade
  }
}

export async function redisGet(
  client: RedisClient | null,
  key: string,
): Promise<string | null> {
  if (!client) return null;
  try {
    return await client.get(key);
  } catch {
    return null;
  }
}

export async function redisDel(
  client: RedisClient | null,
  key: string,
): Promise<void> {
  if (!client) return;
  try {
    await client.del(key);
  } catch {
    // ignore
  }
}
