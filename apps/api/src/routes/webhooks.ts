import type { FastifyInstance } from "fastify";
import { Queue } from "bullmq";
import type { WhatsAppJobData } from "../workers/whatsapp-processor.js";
import { normalizePhone } from "../lib/phone.js";
import { AsaasService } from "../services/asaas.js";
import {
  verifyAsaasWebhook,
  verifyEvolutionWebhook,
} from "../lib/webhook-auth.js";
import { isProductionRuntime } from "../lib/runtime-env.js";
import { authRateLimit } from "../lib/rate-limit.js";
import { getBullMQConnection } from "../lib/bullmq-connection.js";
import { parseEvolutionInboundMessage } from "../lib/evolution-webhook.js";
import {
  WHATSAPP_INVALID_PAYLOAD_MESSAGE,
  WHATSAPP_QUEUE_DOWN_MESSAGE,
} from "../lib/whatsapp-user-message.js";

function extractPhone(remoteJid?: string): string | null {
  if (!remoteJid) return null;
  const jidUser = remoteJid.split("@")[0] ?? remoteJid;
  const digits = jidUser.replace(/\D/g, "");
  try {
    return normalizePhone(digits);
  } catch {
    return null;
  }
}

export async function webhookRoutes(app: FastifyInstance): Promise<void> {
  const env = app.config.env;
  const queue = new Queue<WhatsAppJobData>("whatsapp-process", {
    connection: getBullMQConnection(env.REDIS_URL),
  });
  const asaas = new AsaasService(env);

  app.addHook("preHandler", authRateLimit);

  app.post("/webhooks/whatsapp", async (request, reply) => {
    if (!verifyEvolutionWebhook(env, request.headers)) {
      request.log.warn("Webhook WhatsApp rejeitado: assinatura inválida");
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const data = parseEvolutionInboundMessage(request.body);
    if (!data) {
      request.log.warn(
        { body: request.body },
        "Webhook WhatsApp: evento ignorado ou payload inválido",
      );
      return reply.send({ ok: true, skipped: true });
    }

    if (!data.key || data.key.fromMe) {
      return reply.send({ ok: true, skipped: true });
    }

    const fromNumber = extractPhone(data.key.remoteJid);
    if (!fromNumber) {
      request.log.warn(
        { remoteJid: data.key.remoteJid },
        "Webhook WhatsApp: JID/telefone inválido (use 11 dígitos BR com 9 após DDD)",
      );
      return reply.status(400).send({
        error:
          "Telefone do remetente inválido. Cadastre no app com DDD + 9 dígitos (ex.: 31999998888).",
        code: "INVALID_PHONE",
      });
    }

    const msg = data.message;
    let messageType = "text";
    let text =
      msg?.conversation ??
      msg?.extendedTextMessage?.text ??
      msg?.imageMessage?.caption ??
      "";

    if (data.messageType?.toLowerCase().includes("audio") || msg?.audioMessage) {
      messageType = "audio";
      if ((msg?.audioMessage?.seconds ?? 0) > 60) {
        await app.evolution.sendText(
          fromNumber,
          "Áudio muito longo. Fala mais curto, fica mais rápido 🙂",
        );
        return reply.send({ ok: true });
      }
    } else if (
      data.messageType?.toLowerCase().includes("image") ||
      msg?.imageMessage
    ) {
      messageType = "image";
    }

    const jobData: WhatsAppJobData = {
      fromNumber,
      messageType,
      rawContent: request.body as object,
      text,
      latitude: msg?.locationMessage?.degreesLatitude,
      longitude: msg?.locationMessage?.degreesLongitude,
    };

    if (messageType === "audio" || messageType === "image") {
      const buffer = await app.evolution.downloadMedia({
        id: data.key.id,
        remoteJid: data.key.remoteJid,
      });
      if (buffer) {
        jobData.mediaBuffer = buffer.toString("base64");
        jobData.mediaMime =
          msg?.audioMessage?.mimetype ??
          msg?.imageMessage?.mimetype ??
          "application/octet-stream";
      }
    }

    if (!text.trim() && messageType === "text") {
      await app.evolution.sendText(fromNumber, WHATSAPP_INVALID_PAYLOAD_MESSAGE);
      return reply.send({ ok: true, skipped: true, reason: "empty_text" });
    }

    try {
      await queue.add("process", jobData, {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
      });
    } catch (err) {
      request.log.error({ err }, "Falha ao enfileirar job WhatsApp (Redis)");
      try {
        await app.evolution.sendText(fromNumber, WHATSAPP_QUEUE_DOWN_MESSAGE);
      } catch (sendErr) {
        request.log.error({ sendErr }, "Falha ao avisar usuário no WhatsApp");
      }
      return reply.status(503).send({
        error: "Fila indisponível. Confira REDIS_URL (Upstash TCP rediss://).",
        code: "REDIS_QUEUE_ERROR",
      });
    } finally {
      await queue.close();
    }

    return reply.send({ ok: true, queued: true });
  });

  app.post("/webhooks/asaas", async (request, reply) => {
    if (!verifyAsaasWebhook(env, request.headers)) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const body = request.body as {
      event?: string;
      payment?: {
        id?: string;
        status?: string;
        subscription?: string;
        externalReference?: string;
      };
    };

    try {
      await asaas.handleWebhook(body);
      return reply.send({ ok: true });
    } catch (err) {
      request.log.error({ err, event: body.event }, "Asaas webhook handler");
      return reply.status(500).send({
        error: isProductionRuntime()
          ? "Falha ao processar webhook"
          : (err as Error).message,
      });
    }
  });
}
