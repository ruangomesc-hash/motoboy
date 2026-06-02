import { Queue } from "bullmq";
import type { Env } from "@motoboy/types";
import type { WhatsAppJobData } from "../workers/whatsapp-processor.js";
import { getBullMQConnection } from "./bullmq-connection.js";

let queue: Queue<WhatsAppJobData> | null = null;

export function getWhatsAppQueue(redisUrl: string): Queue<WhatsAppJobData> {
  if (!queue) {
    queue = new Queue<WhatsAppJobData>("whatsapp-process", {
      connection: getBullMQConnection(redisUrl),
    });
  }
  return queue;
}

export async function getWhatsAppQueueCounts(env: Env): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
} | null> {
  const url = env.REDIS_URL?.trim();
  if (!url) return null;
  try {
    const counts = await getWhatsAppQueue(url).getJobCounts(
      "waiting",
      "active",
      "completed",
      "failed",
      "delayed",
    );
    return {
      waiting: counts.waiting ?? 0,
      active: counts.active ?? 0,
      completed: counts.completed ?? 0,
      failed: counts.failed ?? 0,
      delayed: counts.delayed ?? 0,
    };
  } catch {
    return null;
  }
}
