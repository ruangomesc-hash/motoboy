import { describe, expect, it } from "vitest";
import type { Env } from "@motoboy/types";
import {
  buildCartpandaCheckoutUrl,
  isCartpandaPaidEvent,
  parseCartpandaWebhookPayload,
} from "../services/cartpanda.js";

const checkoutEnv = {
  CARTPANDA_CHECKOUT_URL: "https://assinatura.motocopiloto.com.br",
} as Env;

describe("cartpanda checkout url", () => {
  it("prefills email, phone and utm_content", () => {
    const url = buildCartpandaCheckoutUrl(
      checkoutEnv,
      {
        id: "user_abc",
        email: "Moto@Email.com",
        whatsappNumber: "5561999999999",
        name: "João",
      },
    );
    const parsed = new URL(url);
    expect(parsed.hostname).toBe("assinatura.motocopiloto.com.br");
    expect(parsed.searchParams.get("email")).toBe("moto@email.com");
    expect(parsed.searchParams.get("phone")).toBe("61999999999");
    expect(parsed.searchParams.get("utm_content")).toBe("user_abc");
  });
});

describe("cartpanda webhook parse", () => {
  it("detects paid order with email and phone", () => {
    const identity = parseCartpandaWebhookPayload({
      event: "order.paid",
      order: {
        id: "ord_123",
        email: "test@motocopiloto.com.br",
        phone_number: "61993781810",
        status: "paid",
        total_price: 15.9,
      },
    });
    expect(identity.orderId).toBe("ord_123");
    expect(identity.email).toBe("test@motocopiloto.com.br");
    expect(identity.phone).toMatch(/61993781810/);
    expect(isCartpandaPaidEvent(identity)).toBe(true);
  });
});
