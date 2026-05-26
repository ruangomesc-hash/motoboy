import { Worker, type Job } from "bullmq";
import { prisma } from "@motoboy/db";
import { AiService } from "@motoboy/ai";
import type { Env } from "@motoboy/types";
import type { Server as SocketServer } from "socket.io";
import type { FastifyBaseLogger } from "fastify";
import { findOrCreateUser, isTrialExpired } from "../services/user.js";
import { EvolutionService } from "../services/evolution.js";
import {
  createDeliveryFromExtraction,
  buildDeliveryConfirmation,
} from "../services/delivery.js";
import {
  formatDeliverySource,
  formatMoney,
  recordActivity,
} from "../services/activity-log.js";
import { getTodaySummary, formatCurrency } from "../services/today.js";
import { optimizeRoute } from "../services/maps.js";
import {
  registerFuelRefuel,
  getFuelDayStats,
  formatFuelConfirmation,
} from "../services/fuel.js";
import {
  registerOdometerReading,
  getOdometerDayStats,
  formatOdometerConfirmation,
} from "../services/odometer.js";
import { normalizePhone } from "../lib/phone.js";

function dayBounds() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export interface WhatsAppJobData {
  fromNumber: string;
  messageType: string;
  rawContent: unknown;
  text?: string;
  mediaUrl?: string;
  mediaBuffer?: string;
  mediaMime?: string;
  latitude?: number;
  longitude?: number;
}

export function startWhatsAppWorker(
  env: Env,
  log: FastifyBaseLogger,
  io: SocketServer | null,
): Worker<WhatsAppJobData> {
  const connection = { url: env.REDIS_URL };
  const ai = new AiService(env.OPENAI_API_KEY);
  const evolution = new EvolutionService(env, log);

  return new Worker<WhatsAppJobData>(
    "whatsapp-process",
    async (job: Job<WhatsAppJobData>) => {
      const { fromNumber, messageType, rawContent } = job.data;
      const phone = normalizePhone(fromNumber);
      const user = await findOrCreateUser(phone);

      await prisma.whatsAppMessage.create({
        data: {
          userId: user.id,
          fromNumber: phone,
          messageType,
          rawContent: rawContent as object,
        },
      });

      if (isTrialExpired(user) && user.status !== "ACTIVE") {
        await evolution.sendText(
          phone,
          `Trial encerrado. Assine em: ${env.APP_URL}/assinar`,
        );
        return;
      }

      let text = job.data.text ?? "";

      if (messageType === "audio" && job.data.mediaBuffer) {
        const buffer = Buffer.from(job.data.mediaBuffer, "base64");
        if (buffer.length > 5_000_000) {
          await evolution.sendText(
            phone,
            "Áudio muito longo. Fala mais curto, fica mais rápido 🙂",
          );
          return;
        }
        text = await ai.transcribeAudio(
          buffer,
          job.data.mediaMime ?? "audio/ogg",
        );
      }

      if (messageType === "image" && (job.data.mediaUrl || job.data.mediaBuffer)) {
        const imageUrl = job.data.mediaUrl
          ?? `data:${job.data.mediaMime ?? "image/jpeg"};base64,${job.data.mediaBuffer}`;
        const cacheKey = job.data.mediaBuffer?.slice(0, 64);
        const vision = await ai.analyzeImage(imageUrl, cacheKey);

        if (vision.type === "fuel_receipt") {
          const refuel = await registerFuelRefuel(user.id, {
            totalAmount: vision.totalAmount,
            liters: vision.liters,
            receiptPhotoUrl: job.data.mediaUrl,
            rawInput: rawContent,
          });
          const { start, end } = dayBounds();
          const stats = await getFuelDayStats(user.id, start, end, 0);
          io?.to(`user:${user.id}`).emit("fuel:refuel", { id: refuel.id });
          await evolution.sendText(
            phone,
            formatFuelConfirmation(
              vision.totalAmount,
              vision.liters,
              Number(refuel.pricePerLiter),
              stats,
            ),
          );
          return;
        }

        if (vision.type === "dashboard_odometer") {
          await registerOdometerReading(user.id, {
            odometerKm: vision.odometerKm,
            photoUrl: job.data.mediaUrl,
            rawInput: rawContent,
          });
          const { start, end } = dayBounds();
          const stats = await getOdometerDayStats(user.id, start, end, 0);
          io?.to(`user:${user.id}`).emit("odometer:updated", {
            km: vision.odometerKm,
          });
          await evolution.sendText(
            phone,
            formatOdometerConfirmation(vision.odometerKm, stats),
          );
          return;
        }

        if (vision.type === "delivery_data") {
          const delivery = await prisma.delivery.create({
            data: {
              userId: user.id,
              source: "PARTICULAR",
              grossValue: vision.grossValue,
              originName: vision.originName,
              destinationAddr: vision.destinationAddr,
              proofPhotoUrl: job.data.mediaUrl,
              proofLat: job.data.latitude,
              proofLng: job.data.longitude,
              proofAt: new Date(),
              rawInput: rawContent as object,
            },
          });
          io?.to(`user:${user.id}`).emit("delivery:created", { id: delivery.id });
          const msg = await buildDeliveryConfirmation(user.id);
          await evolution.sendText(phone, msg);
          return;
        }

        if (vision.type === "delivery_proof") {
          const last = await prisma.delivery.findFirst({
            where: { userId: user.id },
            orderBy: { occurredAt: "desc" },
          });
          if (last) {
            await prisma.delivery.update({
              where: { id: last.id },
              data: {
                proofPhotoUrl: job.data.mediaUrl,
                proofLat: job.data.latitude,
                proofLng: job.data.longitude,
                proofAt: new Date(),
              },
            });
            await evolution.sendText(phone, "✅ Foto de prova anexada à última entrega.");
          } else {
            await evolution.sendText(
              phone,
              "Não achei entrega recente pra anexar a foto. Registra a entrega primeiro.",
            );
          }
          return;
        }
      }

      if (!text.trim()) {
        await evolution.sendText(
          phone,
          "Não entendi. Manda texto, áudio ou foto da comanda.",
        );
        return;
      }

      const extraction = await ai.extractFromText(text);

      if (extraction.type === "fuel_refuel") {
        const refuel = await registerFuelRefuel(user.id, {
          totalAmount: extraction.totalAmount,
          liters: extraction.liters,
          rawInput: { messageType, text, rawContent },
        });
        const { start, end } = dayBounds();
        const stats = await getFuelDayStats(user.id, start, end, 0);
        io?.to(`user:${user.id}`).emit("fuel:refuel", { id: refuel.id });
        await evolution.sendText(
          phone,
          formatFuelConfirmation(
            extraction.totalAmount,
            extraction.liters,
            Number(refuel.pricePerLiter),
            stats,
          ),
        );
        return;
      }

      if (extraction.type === "odometer") {
        await registerOdometerReading(user.id, {
          odometerKm: extraction.odometerKm,
          rawInput: { messageType, text, rawContent },
        });
        const { start, end } = dayBounds();
        const stats = await getOdometerDayStats(user.id, start, end, 0);
        io?.to(`user:${user.id}`).emit("odometer:updated", {
          km: extraction.odometerKm,
        });
        await evolution.sendText(
          phone,
          formatOdometerConfirmation(extraction.odometerKm, stats),
        );
        return;
      }

      if (extraction.type === "delivery") {
        const delivery = await createDeliveryFromExtraction(
          user.id,
          extraction,
          { messageType, text, rawContent },
        );
        await recordActivity(user.id, {
          category: "DELIVERY",
          action: "CREATED",
          title: "Entrega via WhatsApp",
          entityId: delivery.id,
          source: "whatsapp",
          changes: [
            {
              field: "grossValue",
              label: "Valor",
              from: null,
              to: formatMoney(delivery.grossValue),
            },
            {
              field: "source",
              label: "Origem",
              from: null,
              to: formatDeliverySource(delivery.source),
            },
          ],
        });
        io?.to(`user:${user.id}`).emit("delivery:created", {
          id: delivery.id,
        });
        const msg = await buildDeliveryConfirmation(user.id);
        await evolution.sendText(phone, msg);
        return;
      }

      if (extraction.type === "route_request") {
        const route = await optimizeRoute(extraction.addresses, env, log);
        await prisma.route.create({
          data: {
            userId: user.id,
            addresses: extraction.addresses,
            optimizedOrder: route.orderedAddresses,
            totalKm: route.totalKm,
            totalMin: route.totalMin,
          },
        });
        const lines = route.orderedAddresses
          .map((a, i) => `${i + 1}. ${a}`)
          .join("\n");
        await evolution.sendText(
          phone,
          `🗺️ Rota otimizada (${route.totalKm.toFixed(1)} km, ~${route.totalMin} min):\n${lines}\n\n${route.googleMapsUrl}`,
        );
        return;
      }

      if (extraction.type === "command") {
        if (extraction.action === "start_shift") {
          const freshUser = await prisma.user.findUnique({
            where: { id: user.id },
          });
          const startKm = freshUser?.currentOdometerKm
            ? Number(freshUser.currentOdometerKm)
            : undefined;
          await prisma.shift.create({
            data: {
              userId: user.id,
              startedAt: new Date(),
              ...(startKm != null ? { startKm } : {}),
            },
          });
          const kmNote =
            startKm != null ? ` KM inicial: ${startKm.toLocaleString("pt-BR")}.` : "";
          await evolution.sendText(
            phone,
            `✅ Turno iniciado.${kmNote} Boa corrida!`,
          );
          return;
        }
        if (extraction.action === "end_shift") {
          const shift = await prisma.shift.findFirst({
            where: { userId: user.id, endedAt: null },
            orderBy: { startedAt: "desc" },
          });
          if (shift) {
            await prisma.shift.update({
              where: { id: shift.id },
              data: { endedAt: new Date() },
            });
          }
          const summary = await getTodaySummary(user.id);
          await evolution.sendText(
            phone,
            `🏁 Turno encerrado.\nLucro do dia: ${formatCurrency(summary.netProfit)}`,
          );
          return;
        }
        if (extraction.action === "today_summary") {
          const summary = await getTodaySummary(user.id);
          await evolution.sendText(
            phone,
            `Hoje: ${formatCurrency(summary.netProfit)} líquido | ${summary.deliveryCount} entregas | ${summary.totalKm.toFixed(0)} km`,
          );
          return;
        }
        if (extraction.action === "delete_last") {
          const last = await prisma.delivery.findFirst({
            where: { userId: user.id },
            orderBy: { occurredAt: "desc" },
          });
          if (last) {
            await prisma.delivery.delete({ where: { id: last.id } });
            await evolution.sendText(phone, "🗑️ Última entrega removida.");
            io?.to(`user:${user.id}`).emit("delivery:deleted", { id: last.id });
          }
          return;
        }
      }

      if (extraction.type === "config") {
        if (extraction.key === "fuel_price") {
          await prisma.costConfig.upsert({
            where: { userId: user.id },
            create: { userId: user.id, fuelPricePerLiter: extraction.value },
            update: { fuelPricePerLiter: extraction.value },
          });
          await evolution.sendText(
            phone,
            `⛽ Gasolina atualizada: R$ ${extraction.value.toFixed(2)}/L`,
          );
          return;
        }
        if (extraction.key === "daily_goal") {
          await prisma.goal.updateMany({
            where: { userId: user.id, period: "DAILY" },
            data: { active: false },
          });
          await prisma.goal.create({
            data: {
              userId: user.id,
              period: "DAILY",
              targetValue: extraction.value,
            },
          });
          await evolution.sendText(
            phone,
            `🎯 Meta do dia: R$ ${extraction.value.toFixed(2)}`,
          );
          return;
        }
      }

      await evolution.sendText(
        phone,
        "Não entendi. Exemplos:\n• entrega farmácia 25 reais\n• abasteci 40 reais 6 litros\n• foto do cupom do posto\n• foto do painel da moto (KM)",
      );
    },
    { connection },
  );
}
