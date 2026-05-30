/** Opções ioredis/BullMQ compatíveis com Upstash (rediss://). */
export function getBullMQConnection(redisUrl: string) {
  return {
    url: redisUrl,
    maxRetriesPerRequest: null,
    ...(redisUrl.startsWith("rediss://") ? { tls: {} } : {}),
  };
}
