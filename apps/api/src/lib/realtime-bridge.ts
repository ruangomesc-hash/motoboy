import type { Server as SocketServer } from "socket.io";
import type { FastifyBaseLogger } from "fastify";
import { loadEnv } from "./env.js";
import { getRedis, isRedisEnabled } from "./redis.js";

const CHANNEL = "motoboy:realtime";

type RealtimeMessage = {
  userId: string;
  event: string;
  payload: unknown;
};

/** Webhook na Vercel (sem Socket.io local) publica; Railway assina e emite. */
export function publishRealtimeEvent(
  userId: string,
  event: string,
  payload: unknown,
): void {
  try {
    const env = loadEnv();
    if (!isRedisEnabled(env)) return;
    const client = getRedis(env);
    const msg: RealtimeMessage = { userId, event, payload };
    void client.publish(CHANNEL, JSON.stringify(msg)).catch(() => {});
  } catch {
    /* Redis opcional */
  }
}

export function startRealtimeBridge(
  io: SocketServer,
  log: FastifyBaseLogger,
): void {
  try {
    const env = loadEnv();
    if (!isRedisEnabled(env)) {
      log.info("Realtime bridge: REDIS_URL ausente — só Socket local");
      return;
    }
    const sub = getRedis(env).duplicate();
    void sub.subscribe(CHANNEL, (err) => {
      if (err) {
        log.warn({ err }, "Realtime bridge: falha ao assinar Redis");
        return;
      }
      log.info("Realtime bridge: Redis → Socket.io ativo");
    });
    sub.on("message", (_channel, raw) => {
      try {
        const parsed = JSON.parse(raw) as RealtimeMessage;
        if (!parsed.userId || !parsed.event) return;
        io.to(`user:${parsed.userId}`).emit(parsed.event, parsed.payload);
      } catch (err) {
        log.warn({ err }, "Realtime bridge: mensagem inválida");
      }
    });
  } catch (err) {
    log.warn({ err }, "Realtime bridge não iniciado");
  }
}
