import type { FastifyInstance } from "fastify";
import type { WhatsAppJobData } from "../workers/whatsapp-processor.js";
import { AsaasService } from "../services/asaas.js";
import {
  verifyAsaasWebhook,
  verifyEvolutionWebhook,
} from "../lib/webhook-auth.js";
import { isProductionRuntime } from "../lib/runtime-env.js";
import { authRateLimit } from "../lib/rate-limit.js";
import { resolveEvolutionContact } from "../lib/evolution-contact.js";
import {
  extractEvolutionMessageText,
  inferEvolutionMessageType,
  parseEvolutionInboundMessage,
} from "../lib/evolution-webhook.js";
import { getWhatsAppQueue } from "../lib/whatsapp-queue.js";
import {
  WHATSAPP_INVALID_PAYLOAD_MESSAGE,
  WHATSAPP_QUEUE_DOWN_MESSAGE,
} from "../lib/whatsapp-user-message.js";
import { acquireWhatsAppMessageLock } from "../lib/whatsapp-idempotency.js";
import { getSocketServer } from "../lib/socket.js";
import {
  processWhatsAppJobData,
} from "../workers/whatsapp-processor.js";

export async function webhookRoutes(app: FastifyInstance): Promise<void> {
  const env = app.config.env;
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
      return reply.send({ ok: true, skipped: true, reason: "parse_failed" });
    }

    if (!data.key || data.key.fromMe) {
      return reply.send({ ok: true, skipped: true, reason: "from_me" });
    }

    const contact = resolveEvolutionContact(data.key);
    if (!contact) {
      request.log.warn(
        { key: data.key },
        "Webhook WhatsApp: não foi possível resolver remetente (JID/@lid)",
      );
      return reply.status(400).send({
        error:
          "Remetente sem número válido. Atualize a Evolution para v2.3.7+ ou confira remoteJidAlt no webhook.",
        code: "INVALID_SENDER_JID",
      });
    }

    const { replyTo } = contact;

    if (!contact.storedPhone) {
      request.log.warn(
        { key: data.key, replyTo },
        "Webhook WhatsApp: remetente só @lid — cadastre o número no app",
      );
      try {
        await app.evolution.sendText(
          replyTo,
          "❌ Não identifiquei seu número de WhatsApp. Em Configurações, confira o campo WhatsApp (mesmo celular que manda mensagem no Zap).",
        );
      } catch (sendErr) {
        request.log.error({ sendErr }, "Falha ao avisar usuário no WhatsApp");
      }
      return reply.send({
        ok: true,
        skipped: true,
        reason: "no_stored_phone",
      });
    }

    const fromNumber = contact.storedPhone;

    const msg = data.message;
    const text = extractEvolutionMessageText(msg);
    let messageType = inferEvolutionMessageType(msg, data.messageType);

    if (messageType === "audio") {
      const seconds =
        (msg?.audioMessage as { seconds?: number } | undefined)?.seconds ?? 0;
      if (seconds > 60) {
        await app.evolution.sendText(
          replyTo,
          "Áudio muito longo. Fala mais curto, fica mais rápido 🙂",
        );
        return reply.send({ ok: true });
      }
    }

    const jobData: WhatsAppJobData = {
      fromNumber,
      replyTarget: replyTo,
      messageType,
      rawContent: request.body as object,
      text,
      latitude: (msg?.locationMessage as { degreesLatitude?: number })
        ?.degreesLatitude,
      longitude: (msg?.locationMessage as { degreesLongitude?: number })
        ?.degreesLongitude,
    };

    if (messageType === "audio" || messageType === "image") {
      const buffer = await app.evolution.downloadMedia({
        id: data.key.id,
        remoteJid: data.key.remoteJid,
      });
      if (buffer) {
        jobData.mediaBuffer = buffer.toString("base64");
        const audio = msg?.audioMessage as { mimetype?: string } | undefined;
        const image = msg?.imageMessage as { mimetype?: string } | undefined;
        jobData.mediaMime =
          audio?.mimetype ?? image?.mimetype ?? "application/octet-stream";
      }
    }

    if (!text.trim() && messageType === "text") {
      await app.evolution.sendText(replyTo, WHATSAPP_INVALID_PAYLOAD_MESSAGE);
      return reply.send({ ok: true, skipped: true, reason: "empty_text" });
    }

    const redisUrl = env.REDIS_URL?.trim();
    const messageId = data.key.id;
    const workerOnHost = process.env.RUN_WHATSAPP_WORKER === "true";

    if (redisUrl && messageId) {
      const acquired = await acquireWhatsAppMessageLock(redisUrl, messageId);
      if (!acquired) {
        return reply.send({ ok: true, duplicate: true });
      }
    }

    if (workerOnHost) {
      if (!redisUrl) {
        request.log.error("REDIS_URL ausente — fila WhatsApp indisponível");
        try {
          await app.evolution.sendText(replyTo, WHATSAPP_QUEUE_DOWN_MESSAGE);
        } catch (sendErr) {
          request.log.error({ sendErr }, "Falha ao avisar usuário no WhatsApp");
        }
        return reply.status(503).send({
          error: "REDIS_URL não configurado",
          code: "REDIS_QUEUE_ERROR",
        });
      }

      try {
        await getWhatsAppQueue(redisUrl).add("process", jobData, {
          attempts: 3,
          backoff: { type: "exponential", delay: 2000 },
        });
      } catch (err) {
        request.log.error({ err }, "Falha ao enfileirar job WhatsApp (Redis)");
        try {
          await app.evolution.sendText(replyTo, WHATSAPP_QUEUE_DOWN_MESSAGE);
        } catch (sendErr) {
          request.log.error({ sendErr }, "Falha ao avisar usuário no WhatsApp");
        }
        return reply.status(503).send({
          error: "Fila indisponível. Confira REDIS_URL (Upstash TCP rediss://).",
          code: "REDIS_QUEUE_ERROR",
        });
      }

      return reply.send({
        ok: true,
        queued: true,
        hasStoredPhone: Boolean(contact.storedPhone),
      });
    }

    try {
      await processWhatsAppJobData(jobData, {
        env,
        log: request.log,
        io: getSocketServer(),
      });
    } catch (err) {
      request.log.error({ err, messageId }, "WhatsApp processamento inline falhou");
      try {
        await app.evolution.sendText(
          replyTo,
          "⚠️ Não consegui processar agora. Tente de novo em instantes ou use o app.",
        );
      } catch {
        /* ignore */
      }
      return reply.status(500).send({
        error: "Falha ao processar mensagem",
        code: "WHATSAPP_PROCESS_ERROR",
      });
    }

    return reply.send({
      ok: true,
      processed: true,
      hasStoredPhone: Boolean(contact.storedPhone),
    });
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
