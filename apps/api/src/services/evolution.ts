import type { Env } from "@motocheck/types";
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
    const number = to.replace(/\D/g, "");
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
        throw new Error(`Evolution send failed: ${res.status}`);
      }
    }, this.log);
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
