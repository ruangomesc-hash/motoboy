import { Server as SocketServer } from "socket.io";
import { loadEnv } from "./lib/env.js";
import { isRedisEnabled } from "./lib/redis.js";
import { createApp } from "./create-app.js";
import { startWhatsAppWorker } from "./workers/whatsapp-processor.js";
import { setSocketServer } from "./lib/socket.js";
import { verifyToken } from "./lib/auth.js";

const env = loadEnv();
const app = await createApp();

await app.listen({ port: env.PORT, host: "0.0.0.0" });

const io = new SocketServer(app.server, {
  cors: { origin: env.APP_URL, credentials: true },
});
setSocketServer(io);

io.use((socket, next) => {
  const token = socket.handshake.auth.token as string | undefined;
  if (!token?.trim()) {
    next(new Error("Unauthorized"));
    return;
  }
  try {
    const payload = verifyToken(token, env.JWT_SECRET);
    if (payload.role === "admin" || !payload.userId) {
      next(new Error("Unauthorized"));
      return;
    }
    socket.data.userId = payload.userId;
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.data.userId as string | undefined;
  if (userId) {
    socket.join(`user:${userId}`);
  }
});

const runWorker =
  process.env.RUN_WHATSAPP_WORKER === "true" && isRedisEnabled(env);

if (runWorker) {
  const worker = startWhatsAppWorker(env, app.log, io);
  worker.on("failed", (job, err) => {
    app.log.error({ jobId: job?.id, err }, "Worker job failed");
  });

  process.on("SIGTERM", async () => {
    await worker.close();
    await app.close();
    process.exit(0);
  });
} else {
  app.log.warn(
    "WhatsApp worker desligado (defina RUN_WHATSAPP_WORKER=true e REDIS_URL para filas)",
  );
}

app.log.info(`API + Socket.io on http://localhost:${env.PORT}`);
