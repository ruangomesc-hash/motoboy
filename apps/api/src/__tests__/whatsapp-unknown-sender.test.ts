import { describe, expect, it, vi, beforeEach } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    whatsAppUnknownSender: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

vi.mock("@motoboy/db", () => ({
  prisma: prismaMock,
}));

vi.mock("../lib/whatsapp-reply.js", () => ({
  safeWhatsAppReply: vi.fn().mockResolvedValue(true),
}));

import {
  canonicalUnknownSenderPhone,
  shouldReplyToUnknownSender,
} from "../services/whatsapp-unknown-sender.js";

describe("whatsapp-unknown-sender", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("canonicaliza número BR", () => {
    expect(canonicalUnknownSenderPhone("5511977099993")).toBe("5511977099993");
  });

  it("não responde após 1 reply", async () => {
    prismaMock.whatsAppUnknownSender.findUnique.mockResolvedValue({
      phone: "5511977099993",
      blocked: false,
      replyCount: 1,
    });
    await expect(shouldReplyToUnknownSender("5511977099993")).resolves.toBe(
      false,
    );
  });

  it("não responde se bloqueado", async () => {
    prismaMock.whatsAppUnknownSender.findUnique.mockResolvedValue({
      phone: "5511977099993",
      blocked: true,
      replyCount: 0,
    });
    await expect(shouldReplyToUnknownSender("5511977099993")).resolves.toBe(
      false,
    );
  });
});
