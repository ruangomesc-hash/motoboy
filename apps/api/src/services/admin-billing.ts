import { prisma } from "@motoboy/db";
import type { AdminPaymentLinkResponse, Env } from "@motoboy/types";
import { SUBSCRIPTION_PRICE } from "./admin-metrics.js";
import { AsaasService } from "./asaas.js";

function buildWhatsappText(
  name: string | null,
  amount: number,
  invoiceUrl: string,
  pixCopyPaste: string | null,
): string {
  const greeting = name ? `Olá, ${name}!` : "Olá!";
  let text = `${greeting}\n\nAssinatura *Motocopiloto* — R$ ${amount.toFixed(2).replace(".", ",")}/mês.\n\n`;
  if (pixCopyPaste) {
    text += `*Pix copia e cola:*\n${pixCopyPaste}\n\n`;
  }
  text += `*Link de pagamento:*\n${invoiceUrl}\n\nQualquer dúvida, estamos à disposição.`;
  return text;
}

function whatsappUrl(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export async function createAdminPaymentLink(
  userId: string,
  env: Env,
): Promise<AdminPaymentLinkResponse> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw Object.assign(new Error("Cliente não encontrado"), { statusCode: 404 });
  }

  const asaas = new AsaasService(env);
  const result = await asaas.createPaymentCharge(
    user.id,
    user.subscriptionPaymentMethod ?? "PIX",
  );

  const whatsappText = buildWhatsappText(
    user.name,
    SUBSCRIPTION_PRICE,
    result.invoiceUrl,
    result.pixCopyPaste,
  );

  return {
    paymentId: result.paymentId,
    invoiceUrl: result.invoiceUrl,
    pixCopyPaste: result.pixCopyPaste,
    amount: SUBSCRIPTION_PRICE,
    whatsappText,
    whatsappUrl: whatsappUrl(user.whatsappNumber, whatsappText),
  };
}

export async function activateAdminUser(userId: string): Promise<{
  ok: true;
  status: "ACTIVE";
}> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw Object.assign(new Error("Cliente não encontrado"), { statusCode: 404 });
  }

  if (user.status === "ACTIVE") {
    throw Object.assign(new Error("Cliente já está ativo"), { statusCode: 400 });
  }

  const now = new Date();
  const pending = await prisma.payment.findFirst({
    where: { userId, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });

  await prisma.$transaction([
    pending
      ? prisma.payment.update({
          where: { id: pending.id },
          data: { status: "PAID", paidAt: now },
        })
      : prisma.payment.create({
          data: {
            userId,
            status: "PAID",
            amount: SUBSCRIPTION_PRICE,
            paidAt: now,
          },
        }),
    prisma.user.update({
      where: { id: userId },
      data: {
        status: "ACTIVE",
        subscribedAt: user.subscribedAt ?? now,
        trialEndsAt: null,
      },
    }),
  ]);

  return { ok: true, status: "ACTIVE" };
}
