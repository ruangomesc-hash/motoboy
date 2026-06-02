import { describe, expect, it } from "vitest";
import { getEvolutionBotPhoneKeys } from "../lib/evolution-bot.js";
import {
  resolveEvolutionContact,
  resolveEvolutionWebhookContact,
  resolveStoredPhoneFromReplyTo,
} from "../lib/evolution-contact.js";
import { extractReplyTargetFromWebhookBody } from "../lib/whatsapp-reply.js";
import {
  extractEvolutionMessageText,
  parseEvolutionInboundMessage,
} from "../lib/evolution-webhook.js";

describe("parseEvolutionInboundMessage", () => {
  it("aceita messages.upsert com conversation", () => {
    const body = {
      event: "messages.upsert",
      data: {
        key: {
          remoteJid: "5531999988888@s.whatsapp.net",
          fromMe: false,
          id: "ABC",
        },
        message: { conversation: "R$ 30 entrega teste" },
        messageType: "conversation",
      },
    };
    const parsed = parseEvolutionInboundMessage(body);
    expect(parsed?.key.remoteJid).toContain("5531999988888");
    expect(extractEvolutionMessageText(parsed?.message)).toBe(
      "R$ 30 entrega teste",
    );
  });

  it("aceita data como array", () => {
    const body = {
      event: "messages.upsert",
      data: [
        {
          key: {
            remoteJid: "5531999988888@s.whatsapp.net",
            fromMe: false,
            id: "1",
          },
          message: { conversation: "oi" },
        },
      ],
    };
    const parsed = parseEvolutionInboundMessage(body);
    expect(extractEvolutionMessageText(parsed?.message)).toBe("oi");
  });

  it("extrai extendedTextMessage", () => {
    const body = {
      data: {
        key: {
          remoteJid: "5531999988888@s.whatsapp.net",
          fromMe: false,
        },
        message: {
          extendedTextMessage: { text: "entrega 25 reais" },
        },
      },
    };
    expect(extractEvolutionMessageText(body.data.message)).toBe(
      "entrega 25 reais",
    );
  });

  it("ignora mensagens enviadas pelo bot", () => {
    const body = {
      data: {
        key: { remoteJid: "5531999988888@s.whatsapp.net", fromMe: true },
        message: { conversation: "x" },
      },
    };
    const parsed = parseEvolutionInboundMessage(body);
    expect(parsed?.key.fromMe).toBe(true);
  });
});

describe("resolveEvolutionContact", () => {
  it("usa remoteJidAlt quando remoteJid é @lid", () => {
    const contact = resolveEvolutionContact({
      remoteJid: "69385314111689@lid",
      remoteJidAlt: "5531999988888@s.whatsapp.net",
      fromMe: false,
    });
    expect(contact?.storedPhone).toBe("5531999988888");
    expect(contact?.replyTo).toBe("5531999988888");
  });

  it("usa senderPn quando presente", () => {
    const contact = resolveEvolutionContact({
      remoteJid: "69385314111689@lid",
      senderPn: "5531987654321@s.whatsapp.net",
      fromMe: false,
    });
    expect(contact?.storedPhone).toBe("5531987654321");
  });

  it("fallback para JID @lid quando não há telefone", () => {
    const contact = resolveEvolutionContact({
      remoteJid: "69385314111689@lid",
      fromMe: false,
    });
    expect(contact?.storedPhone).toBeNull();
    expect(contact?.replyTo).toBe("69385314111689@lid");
  });

  it("coerce telefone sem o 9 a partir do JID", () => {
    expect(
      resolveStoredPhoneFromReplyTo("551187654321@s.whatsapp.net"),
    ).toBe("5511987654321");
  });

  it("ignora sender do root quando é o número da instância (bot)", () => {
    const botKeys = getEvolutionBotPhoneKeys({
      EVOLUTION_BOT_NUMBER: "5531992907578",
      EVOLUTION_INSTANCE: "motoboy",
    });
    const body = {
      event: "messages.upsert",
      sender: "5531992907578@s.whatsapp.net",
      data: {
        key: {
          remoteJid: "5531987654321@s.whatsapp.net",
          fromMe: false,
          id: "AC412",
        },
        message: { conversation: "R$ 30 entrega teste" },
      },
    };
    const parsed = parseEvolutionInboundMessage(body);
    expect(parsed).not.toBeNull();
    const contact = resolveEvolutionWebhookContact(body, parsed!.key, {
      botPhoneKeys: botKeys,
    });
    expect(contact?.storedPhone).toBe("5531987654321");
    expect(contact?.replyTo).toBe("5531987654321");
  });

  it("lead @lid: não usa bot no root; responde pelo JID @lid", () => {
    const botKeys = getEvolutionBotPhoneKeys({
      EVOLUTION_BOT_NUMBER: "5531992907578",
      EVOLUTION_INSTANCE: "motoboy",
    });
    const body = {
      event: "messages.upsert",
      sender: "5531992907578@s.whatsapp.net",
      data: {
        key: {
          remoteJid: "11927141003400@lid",
          fromMe: false,
          id: "AC412",
        },
        message: { conversation: "quero saber mais" },
      },
    };
    const parsed = parseEvolutionInboundMessage(body);
    const contact = resolveEvolutionWebhookContact(body, parsed!.key, {
      botPhoneKeys: botKeys,
    });
    expect(contact?.storedPhone).toBeNull();
    expect(contact?.replyTo).toBe("11927141003400@lid");
  });
});
