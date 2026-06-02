import { describe, expect, it } from "vitest";
import {
  isWhatsAppWebhookPath,
  normalizeWhatsAppWebhookPath,
} from "../lib/whatsapp-webhook-routes.js";

describe("normalizeWhatsAppWebhookPath", () => {
  it("rewrites Evolution webhook-by-events paths", () => {
    expect(
      normalizeWhatsAppWebhookPath("/webhooks/whatsapp/messages-upsert"),
    ).toBe("/webhooks/whatsapp");
    expect(
      normalizeWhatsAppWebhookPath(
        "/webhooks/whatsapp/messages-upsert?foo=1",
      ),
    ).toBe("/webhooks/whatsapp?foo=1");
  });

  it("keeps base path", () => {
    expect(normalizeWhatsAppWebhookPath("/webhooks/whatsapp")).toBe(
      "/webhooks/whatsapp",
    );
  });
});

describe("isWhatsAppWebhookPath", () => {
  it("matches base and suffixed paths", () => {
    expect(isWhatsAppWebhookPath("/webhooks/whatsapp")).toBe(true);
    expect(isWhatsAppWebhookPath("/webhooks/whatsapp/messages-upsert")).toBe(
      true,
    );
    expect(isWhatsAppWebhookPath("/webhooks/asaas")).toBe(false);
  });
});
