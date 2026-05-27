import type { FastifyInstance } from "fastify";
import { Queue } from "bullmq";
import { z } from "zod";
import type { WhatsAppJobData } from "../workers/whatsapp-processor.js";
import { normalizePhone } from "../lib/phone.js";
import { AsaasService } from "../services/asaas.js";
import {
  verifyAsaasWebhook,
  verifyEvolutionWebhook,
} from "../lib/webhook-auth.js";
import { isProductionRuntime } from "../lib/runtime-env.js";
import { authRateLimit } from "../lib/rate-limit.js";

const evolutionPayloadSchema = z.object({
  event: z.string().optional(),
  data: z
    .object({
      key: z
        .object({
          remoteJid: z.string().optional(),
          fromMe: z.boolean().optional(),
          id: z.string().optional(),
        })
        .optional(),
      message: z
        .object({
          conversation: z.string().optional(),
          extendedTextMessage: z
            .object({ text: z.string().optional() })
            .optional(),
          audioMessage: z
            .object({
              mimetype: z.string().optional(),
              seconds: z.number().optional(),
            })
            .optional(),
          imageMessage: z
            .object({
              mimetype: z.string().optional(),
              caption: z.string().optional(),
            })
            .optional(),
          locationMessage: z
            .object({
              degreesLatitude: z.number().optional(),
              degreesLongitude: z.number().optional(),
            })
            .optional(),
        })
        .optional(),
      messageType: z.string().optional(),
    })
    .optional(),
});

function extractPhone(remoteJid?: string): string | null {
  if (!remoteJid) return null;
  const digits = remoteJid.replace("@s.whatsapp.net", "").replace(/\D/g, "");
  return normalizePhone(digits);
}

export async function webhookRoutes(app: FastifyInstance): Promise<void> {
  const env = app.config.env;
  const queue = new Queue<WhatsAppJobData>("whatsapp-process", {
    connection: { url: env.REDIS_URL },
  });
  const asaas = new AsaasService(env);

  app.addHook("preHandler", authRateLimit);

  app.post("/webhooks/whatsapp", async (request, reply) => {
    if (!verifyEvolutionWebhook(env, request.headers)) {
      request.log.warn("Webhook WhatsApp rejeitado: assinatura inválida");
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const parsed = evolutionPayloadSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "Invalid payload" });
    }

    const { data } = parsed.data;
    if (!data?.key || data.key.fromMe) {
      return reply.send({ ok: true, skipped: true });
    }

    const fromNumber = extractPhone(data.key.remoteJid);
    if (!fromNumber) {
      return reply.status(400).send({ error: "No phone" });
    }

    const msg = data.message;
    let messageType = "text";
    let text =
      msg?.conversation ??
      msg?.extendedTextMessage?.text ??
      msg?.imageMessage?.caption ??
      "";

    if (msg?.audioMessage) {
      messageType = "audio";
      if ((msg.audioMessage.seconds ?? 0) > 60) {
        const evolution = app.evolution;
        await evolution.sendText(
          fromNumber,
          "Áudio muito longo. Fala mais curto, fica mais rápido 🙂",
        );
        return reply.send({ ok: true });
      }
    } else if (msg?.imageMessage) {
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

    await queue.add("process", jobData, {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
    });

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
