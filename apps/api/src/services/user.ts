import { prisma } from "@motocheck/db";
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
