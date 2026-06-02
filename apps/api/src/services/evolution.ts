import type { Env } from "@motoboy/types";
import type { FastifyBaseLogger } from "fastify";

async function withRetry<T>(
  fn: () => Promise<T>,
  log: FastifyBaseLogger,
  maxAttempts = 3,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
      log.warn({ err, attempt }, "Evolution API retry");
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}

export class EvolutionService {
  constructor(
    private env: Env,
    private log: FastifyBaseLogger,
  ) {}

  private get configured(): boolean {
    return Boolean(
      this.env.EVOLUTION_API_URL &&
        this.env.EVOLUTION_API_KEY &&
        this.env.EVOLUTION_INSTANCE,
    );
  }

  async sendText(to: string, text: string): Promise<void> {
    if (!this.configured) {
      this.log.info({ to, text }, "Evolution mock send");
      return;
    }
    const digits = to.replace(/\D/g, "");
    /** Evolution v2 exige número com DDI, sem @s.whatsapp.net */
    const candidates: string[] = [];
    if (to.includes("@lid")) {
      candidates.push(to.trim());
    } else if (digits.length >= 10) {
      candidates.push(digits);
    } else if (to.includes("@")) {
      candidates.push(to.trim());
    } else {
      candidates.push(digits || to.trim());
    }

    let lastError: unknown;
    for (const number of [...new Set(candidates)]) {
      try {
        await withRetry(async () => {
          const res = await fetch(
            `${this.env.EVOLUTION_API_URL}/message/sendText/${this.env.EVOLUTION_INSTANCE}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                apikey: this.env.EVOLUTION_API_KEY!,
              },
              body: JSON.stringify({ number, text }),
            },
          );
          if (!res.ok) {
            const body = await res.text().catch(() => "");
            throw new Error(
              `Evolution send failed: ${res.status}${body ? ` — ${body.slice(0, 200)}` : ""}`,
            );
          }
        }, this.log);
        return;
      } catch (err) {
        lastError = err;
        this.log.warn({ err, number }, "Evolution sendText tentativa falhou");
      }
    }
    throw lastError;
  }

  async downloadMedia(messageKey: {
    id?: string;
    remoteJid?: string;
  }): Promise<Buffer | null> {
    if (!this.configured || !messageKey.id) return null;
    return withRetry(async () => {
      const res = await fetch(
        `${this.env.EVOLUTION_API_URL}/chat/getBase64FromMediaMessage/${this.env.EVOLUTION_INSTANCE}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: this.env.EVOLUTION_API_KEY!,
          },
          body: JSON.stringify({ message: { key: messageKey } }),
        },
      );
      if (!res.ok) return null;
      const data = (await res.json()) as { base64?: string };
      if (!data.base64) return null;
      return Buffer.from(data.base64, "base64");
    }, this.log);
  }
}
