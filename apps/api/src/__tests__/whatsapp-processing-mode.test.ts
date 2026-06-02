import { afterEach, describe, expect, it } from "vitest";
import {
  isVercelServerless,
  shouldEnqueueWhatsAppOnWebhook,
  whatsappProcessingMode,
} from "../lib/whatsapp-processing-mode.js";

const env = process.env;

afterEach(() => {
  process.env = { ...env };
});

describe("whatsapp-processing-mode", () => {
  it("forces inline on Vercel even with RUN_WHATSAPP_WORKER=true", () => {
    process.env.VERCEL = "1";
    process.env.RUN_WHATSAPP_WORKER = "true";
    process.env.REDIS_URL = "rediss://localhost";
    expect(isVercelServerless()).toBe(true);
    expect(shouldEnqueueWhatsAppOnWebhook()).toBe(false);
    expect(whatsappProcessingMode()).toBe("inline");
  });

  it("allows queue on Railway with worker flag", () => {
    delete process.env.VERCEL;
    delete process.env.VERCEL_ENV;
    process.env.RUN_WHATSAPP_WORKER = "true";
    process.env.REDIS_URL = "rediss://localhost";
    expect(shouldEnqueueWhatsAppOnWebhook()).toBe(true);
    expect(whatsappProcessingMode()).toBe("queue");
  });
});
