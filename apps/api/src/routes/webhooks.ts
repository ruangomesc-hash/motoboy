import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { WhatsAppJobData } from "../workers/whatsapp-processor.js";
import { AsaasService } from "../services/asaas.js";
import type { AsaasWebhookPayload } from "../services/asaas-webhook.js";
import {
  verifyAsaasWebhook,
  verifyEvolutionWebhook,
  verifyEvolutionWebhookQuery,
} from "../lib/webhook-auth.js";
import { isProductionRuntime } from "../lib/runtime-env.js";
import { authRateLimit } from "../lib/rate-limit.js";
import { getEvolutionBotPhoneKeys } from "../lib/evolution-bot.js";
import {
  collectInboundPhoneCandidates,
  resolveEvolutionWebhookContact,
} from "../lib/evolution-contact.js";
import { findUserByPhoneCandidates } from "../services/user.js";
import {
  extractEvolutionMessageText,
  inferEvolutionMessageType,
  parseEvolutionInboundMessage,
} from "../lib/evolution-webhook.js";
import { getWhatsAppQueue } from "../lib/whatsapp-queue.js";
import { shouldEnqueueWhatsAppOnWebhook } from "../lib/whatsapp-processing-mode.js";
import {
  WHATSAPP_INVALID_PAYLOAD_MESSAGE,
  WHATSAPP_QUEUE_DOWN_MESSAGE,
  formatWhatsAppProcessingError,
} from "../lib/whatsapp-user-message.js";
import { getSocketServer } from "../lib/socket.js";
import { processWhatsAppJobData } from "../workers/whatsapp-processor.js";
import { logWhatsAppWebhookHit } from "../lib/whatsapp-inbound-log.js";
import {
  extractReplyTargetFromWebhookBody,
  extractWebhookAuditPhone,
  safeWhatsAppErrorReply,
  safeWhatsAppReply,
} from "../lib/whatsapp-reply.js";

function evolutionWebhookAuthorized(
  env: FastifyInstance["config"]["env"],
  request: FastifyRequest,
): boolean {
  return (
    verifyEvolutionWebhook(env, request.headers) ||
    verifyEvolutionWebhookQuery(
      env,
      request.query as Record<string, unknown> | undefined,
    )
  );
}

async function handleWhatsAppWebhook(
  app: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const env = app.config.env;
  const body = request.body;
  const botPhoneKeys = getEvolutionBotPhoneKeys(env);
  const contactOptions = { botPhoneKeys };
  let replyTo: string | null = extractReplyTargetFromWebhookBody(
    body,
    contactOptions,
  );

  try {
    if (!evolutionWebhookAuthorized(env, request)) {
      request.log.warn("Webhook WhatsApp rejeitado: assinatura inválida");
      await logWhatsAppWebhookHit(
        body,
        "auth_rejected",
        extractWebhookAuditPhone(body, contactOptions),
      );
      return reply.status(401).send({ error: "Unauthorized" });
    }

    await logWhatsAppWebhookHit(
      body,
      "auth_ok",
      extractWebhookAuditPhone(body, contactOptions),
    );

    const data = parseEvolutionInboundMessage(body);
    if (!data) {
      request.log.warn({ body }, "Webhook WhatsApp: parse_failed");
      await logWhatsAppWebhookHit(
        body,
        "parse_failed",
        extractWebhookAuditPhone(body, contactOptions),
      );
      await safeWhatsAppReply(
        app.evolution,
        replyTo,
        "⚠️ Recebi sua mensagem mas não consegui ler o formato. Mande texto simples, ex.: R$ 30 entrega ifood",
        request.log,
      );
      return reply.send({ ok: true, skipped: true, reason: "parse_failed" });
    }

    if (!data.key || data.key.fromMe) {
      await logWhatsAppWebhookHit(
        body,
        "skipped_from_me",
        extractWebhookAuditPhone(body, contactOptions),
      );
      return reply.send({ ok: true, skipped: true, reason: "from_me" });
    }

    const contact = resolveEvolutionWebhookContact(
      body,
      data.key,
      contactOptions,
    );
    if (!contact) {
      request.log.warn({ key: data.key }, "Webhook: invalid_sender_jid");
      await logWhatsAppWebhookHit(body, "invalid_sender_jid", replyTo ?? "unknown");
      await safeWhatsAppReply(
        app.evolution,
        replyTo,
        "❌ Não identifiquei seu número. No app → Configurações, confira o WhatsApp (mesmo celular deste Zap).",
        request.log,
      );
      return reply.send({
        ok: true,
        skipped: true,
        reason: "invalid_sender_jid",
      });
    }

    replyTo = contact.replyTo;

    const phoneCandidates = collectInboundPhoneCandidates(
      body,
      data.key,
      contact,
      replyTo,
      botPhoneKeys,
    );
    const matchedUser = await findUserByPhoneCandidates(phoneCandidates);
    const fromNumber = matchedUser?.matchedPhone ?? phoneCandidates[0] ?? null;

    if (!fromNumber) {
      request.log.warn({ key: data.key, replyTo }, "Webhook: no_stored_phone");
      await logWhatsAppWebhookHit(body, "no_stored_phone", replyTo);
      await safeWhatsAppReply(
        app.evolution,
        replyTo,
        "❌ Não identifiquei seu número de WhatsApp. Em Configurações, confira o campo WhatsApp (mesmo celular que manda mensagem no Zap).",
        request.log,
      );
      return reply.send({ ok: true, skipped: true, reason: "no_stored_phone" });
    }
    const msg = data.message;
    const text = extractEvolutionMessageText(msg);
    const messageType = inferEvolutionMessageType(msg, data.messageType);

    if (messageType === "audio") {
      const seconds =
        (msg?.audioMessage as { seconds?: number } | undefined)?.seconds ?? 0;
      if (seconds > 60) {
        await safeWhatsAppReply(
          app.evolution,
          replyTo,
          "Áudio muito longo. Fala mais curto, fica mais rápido 🙂",
          request.log,
        );
        return reply.send({ ok: true });
      }
    }

    if (messageType === "audio" || messageType === "image") {
      void safeWhatsAppReply(
        app.evolution,
        replyTo,
        "⏳ Registrando…",
        request.log,
      );
    }

    const jobData: WhatsAppJobData = {
      fromNumber,
      replyTarget: replyTo,
      messageType,
      rawContent: body as object,
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
      await safeWhatsAppReply(
        app.evolution,
        replyTo,
        WHATSAPP_INVALID_PAYLOAD_MESSAGE,
        request.log,
      );
      await logWhatsAppWebhookHit(body, "empty_text", fromNumber);
      return reply.send({ ok: true, skipped: true, reason: "empty_text" });
    }

    const redisUrl = env.REDIS_URL?.trim();
    const messageId = data.key.id;
    const enqueue = shouldEnqueueWhatsAppOnWebhook();
    if (
      !enqueue &&
      process.env.RUN_WHATSAPP_WORKER === "true" &&
      process.env.VERCEL === "1"
    ) {
      request.log.warn(
        "RUN_WHATSAPP_WORKER=true na Vercel ignorado — processamento inline (remova da Vercel ou use só no Railway)",
      );
    }

    if (enqueue) {
      if (!redisUrl) {
        await safeWhatsAppReply(
          app.evolution,
          replyTo,
          WHATSAPP_QUEUE_DOWN_MESSAGE,
          request.log,
        );
        return reply.status(503).send({ code: "REDIS_QUEUE_ERROR" });
      }

      try {
        await getWhatsAppQueue(redisUrl).add("process", jobData, {
          attempts: 3,
          backoff: { type: "exponential", delay: 2000 },
        });
      } catch (err) {
        request.log.error({ err }, "Falha ao enfileirar job WhatsApp");
        await safeWhatsAppErrorReply(app.evolution, replyTo, err, request.log);
        return reply.status(503).send({ code: "REDIS_QUEUE_ERROR" });
      }

      return reply.send({ ok: true, queued: true });
    }

    try {
      await processWhatsAppJobData(jobData, {
        env,
        log: request.log,
        io: getSocketServer(),
      });
    } catch (err) {
      request.log.error({ err, messageId }, "WhatsApp inline falhou");
      await logWhatsAppWebhookHit(body, "process_error", fromNumber);
      await safeWhatsAppErrorReply(app.evolution, replyTo, err, request.log);
      return reply.send({
        ok: true,
        processed: false,
        error_notified: true,
        message: formatWhatsAppProcessingError(err),
      });
    }

    return reply.send({ ok: true, processed: true });
  } catch (err) {
    request.log.error({ err }, "Webhook WhatsApp exceção não tratada");
    await logWhatsAppWebhookHit(body, "handler_crash", replyTo ?? "unknown");
    await safeWhatsAppErrorReply(
      app.evolution,
      replyTo ?? extractReplyTargetFromWebhookBody(body),
      err,
      request.log,
    );
    return reply.send({
      ok: true,
      processed: false,
      error_notified: true,
    });
  }
}

export async function webhookRoutes(app: FastifyInstance): Promise<void> {
  const env = app.config.env;

  const whatsappHandler = (request: FastifyRequest, reply: FastifyReply) =>
    handleWhatsAppWebhook(app, request, reply);

  app.post("/webhooks/whatsapp", whatsappHandler);
  app.post("/webhooks/whatsapp/:eventName", whatsappHandler);

  app.post("/webhooks/asaas", {
    preHandler: authRateLimit,
    handler: async (request, reply) => {
      if (!verifyAsaasWebhook(env, request.headers)) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const body = request.body as AsaasWebhookPayload;

      try {
        const asaas = new AsaasService(env, request.log);
        await asaas.handleWebhook(body, request.log);
        return reply.send({ ok: true });
      } catch (err) {
        request.log.error({ err, event: body.event }, "Asaas webhook handler");
        return reply.status(500).send({
          error: isProductionRuntime()
            ? "Falha ao processar webhook"
            : (err as Error).message,
        });
      }
    },
  });

}
