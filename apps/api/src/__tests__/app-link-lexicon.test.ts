import { describe, expect, it } from "vitest";
import {
  formatAppLinkWhatsAppReply,
  isAppLinkRequest,
} from "@motoboy/ai";

describe("isAppLinkRequest", () => {
  it("detecta pedidos diretos de link/acesso", () => {
    expect(isAppLinkRequest("link")).toBe(true);
    expect(isAppLinkRequest("qual o link do app")).toBe(true);
    expect(isAppLinkRequest("como acesso o aplicativo")).toBe(true);
    expect(isAppLinkRequest("manda o site por favor")).toBe(true);
    expect(isAppLinkRequest("onde entro no motocopiloto")).toBe(true);
    expect(isAppLinkRequest("preciso do link do aplicativo")).toBe(true);
    expect(isAppLinkRequest("url do app")).toBe(true);
    expect(isAppLinkRequest("acesso")).toBe(true);
    expect(isAppLinkRequest("aplicativo")).toBe(true);
    expect(isAppLinkRequest("me envia o link do site")).toBe(true);
  });

  it("não confunde com registro de entrega", () => {
    expect(isAppLinkRequest("R$ 50 entrega ifood")).toBe(false);
    expect(isAppLinkRequest("30 reais particular cachorro quente")).toBe(false);
  });
});

describe("formatAppLinkWhatsAppReply", () => {
  it("inclui URL do app", () => {
    const msg = formatAppLinkWhatsAppReply("https://app.motocopiloto.com.br");
    expect(msg).toContain("https://app.motocopiloto.com.br");
    expect(msg).toContain("Motocopiloto");
  });
});
