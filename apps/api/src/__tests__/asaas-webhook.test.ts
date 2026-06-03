import { describe, expect, it, vi, beforeEach } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    asaasWebhookEvent: {
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    payment: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@motoboy/db", () => ({
  prisma: prismaMock,
}));

import { processAsaasWebhook } from "../services/asaas-webhook.js";

describe("processAsaasWebhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.asaasWebhookEvent.create.mockResolvedValue({});
  });

  it("ignora evento duplicado (idempotência)", async () => {
    prismaMock.asaasWebhookEvent.create.mockRejectedValue(
      Object.assign(new Error("unique"), { code: "P2002" }),
    );

    const log = { info: vi.fn(), warn: vi.fn() };
    await processAsaasWebhook(
      {
        id: "evt_dup",
        event: "PAYMENT_CONFIRMED",
        payment: {
          id: "pay_1",
          externalReference: "user_1",
          status: "CONFIRMED",
        },
      },
      log as never,
    );

    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(log.info).toHaveBeenCalled();
  });
});
