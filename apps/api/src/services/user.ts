import { prisma } from "@motoboy/db";
import { normalizePhone } from "../lib/phone.js";
import { attachReferralToUser } from "./affiliate.js";

const TRIAL_DAYS = 14;

export async function findUserByPhone(whatsappNumber: string) {
  const normalized = normalizePhone(whatsappNumber);
  return prisma.user.findUnique({
    where: { whatsappNumber: normalized },
    include: { costs: true },
  });
}

export async function createUserWithProfile(input: {
  whatsappNumber: string;
  name: string;
  email: string;
  affiliateCode?: string;
}) {
  const normalized = normalizePhone(input.whatsappNumber);
  const email = input.email.trim().toLowerCase();

  const [phoneTaken, emailTaken] = await Promise.all([
    prisma.user.findUnique({ where: { whatsappNumber: normalized } }),
    prisma.user.findUnique({ where: { email } }),
  ]);
  if (phoneTaken) {
    throw Object.assign(new Error("WhatsApp já cadastrado"), { statusCode: 409 });
  }
  if (emailTaken) {
    throw Object.assign(new Error("E-mail já cadastrado"), { statusCode: 409 });
  }

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

  const user = await prisma.user.create({
    data: {
      whatsappNumber: normalized,
      name: input.name.trim(),
      email,
      status: "TRIAL",
      trialEndsAt,
      costs: { create: {} },
      goals: {
        create: {
          period: "DAILY",
          targetValue: 250,
          active: true,
        },
      },
    },
    include: { costs: true },
  });

  await attachReferralToUser(user.id, input.affiliateCode);

  return user;
}

/** Preenche nome/e-mail quando o usuário já existia (ex.: criado pelo bot do Zap). */
export async function applyRegistrationInVerify(
  user: { id: string; name: string | null; email: string | null },
  input: { name: string; email: string; affiliateCode?: string },
) {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const needsUpdate = !user.name?.trim() || !user.email?.trim();

  if (!needsUpdate) {
    await attachReferralToUser(user.id, input.affiliateCode);
    return prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      include: { costs: true },
    });
  }

  const emailTaken = await prisma.user.findFirst({
    where: { email, NOT: { id: user.id } },
  });
  if (emailTaken) {
    throw Object.assign(new Error("E-mail já cadastrado"), { statusCode: 409 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { name, email },
    include: { costs: true },
  });

  await attachReferralToUser(updated.id, input.affiliateCode);
  return updated;
}

export async function findOrCreateUser(whatsappNumber: string) {
  const normalized = normalizePhone(whatsappNumber);
  let user = await prisma.user.findUnique({
    where: { whatsappNumber: normalized },
    include: { costs: true },
  });

  if (!user) {
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);
    user = await prisma.user.create({
      data: {
        whatsappNumber: normalized,
        status: "TRIAL",
        trialEndsAt,
        costs: { create: {} },
        goals: {
          create: {
            period: "DAILY",
            targetValue: 250,
            active: true,
          },
        },
      },
      include: { costs: true },
    });
  }

  return user;
}

export function isTrialExpired(user: {
  status: string;
  trialEndsAt: Date | null;
}): boolean {
  if (user.status === "ACTIVE") return false;
  if (!user.trialEndsAt) return false;
  return new Date() > user.trialEndsAt;
}
