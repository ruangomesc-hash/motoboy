import { Redis as RedisClient } from "ioredis";

function redisClient(url: string): RedisClient {
  return new RedisClient(url, {
    maxRetriesPerRequest: 3,
    ...(url.startsWith("rediss://") ? { tls: {} } : {}),
  });
}

/** Evita processar o mesmo messageId duas vezes (webhook duplicado). */
export async function acquireWhatsAppMessageLock(
  redisUrl: string,
  messageId: string,
): Promise<boolean> {
  if (!messageId.trim()) return true;
  const client = redisClient(redisUrl);
  try {
    const result = await client.set(
      `motoboy:wa:msg:${messageId}`,
      "1",
      "EX",
      86_400,
      "NX",
    );
    return result === "OK";
  } catch {
    return true;
  } finally {
    client.disconnect();
  }
}
