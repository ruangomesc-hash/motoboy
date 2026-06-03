import { prisma, type Prisma } from "@motoboy/db";
import { TRIAL_DAYS } from "@motoboy/types";
import { coerceBrazilStoredPhone } from "../lib/evolution-contact.js";
import { normalizePhone } from "../lib/phone.js";
import { attachReferralToUser, validateAffiliateCode } from "./affiliate.js";

/** Custos + meta diária padrão — mesmo baseline para cadastro público e admin. */
export function defaultUserNestedCreate(): Pick<
  Prisma.UserCreateInput,
  "costs" | "goals"
> {
  return {
    costs: { create: {} },
    goals: {
      create: {
        period: "DAILY",
        targetValue: 250,
        active: true,
      },
    },
  };
}

export async function assertAffiliateCodeValid(
  affiliateCode: string | undefined,
): Promise<void> {
  if (!affiliateCode?.trim()) return;
  const check = await validateAffiliateCode(affiliateCode);
  if (!check.valid) {
    throw Object.assign(new Error("Cupom de indicação inválido ou inativo."), {
      statusCode: 400,
      code: "INVALID_AFFILIATE",
    });
  }
}

function phoneLookupCandidates(whatsappNumber: string): string[] {
  const normalized = normalizePhone(whatsappNumber);
  const candidates = new Set<string>([normalized]);
  if (normalized.length === 13 && normalized.startsWith("55") && normalized[4] === "9") {
    candidates.add(`${normalized.slice(0, 4)}${normalized.slice(5)}`);
    candidates.add(normalized.slice(2));
  }
  if (normalized.length === 12 && normalized.startsWith("55")) {
    candidates.add(`${normalized.slice(0, 4)}9${normalized.slice(4)}`);
    candidates.add(normalized.slice(2));
  }
  return [...candidates];
}

function canonicalBrazilStoredPhone(raw: string): string | null {
  const coerced = coerceBrazilStoredPhone(raw);
  if (coerced) return coerced;
  try {
    return normalizePhone(raw);
  } catch {
    return null;
  }
}

/** Chaves de busca (com/sem 9, JID, etc.) — novos e cadastros antigos. */
export function resolvePhoneLookupKeys(whatsappNumber: string): string[] {
  const keys = new Set<string>();
  const addKeys = (raw: string) => {
    const canonical = canonicalBrazilStoredPhone(raw);
    if (!canonical) return;
    for (const k of phoneLookupCandidates(canonical)) keys.add(k);
  };
  addKeys(whatsappNumber);
  return [...keys];
}

function phonesReferToSameAccount(stored: string, incoming: string): boolean {
  if (stored === incoming) return true;
  const a = new Set(resolvePhoneLookupKeys(stored));
  return resolvePhoneLookupKeys(incoming).some((k) => a.has(k));
}

/**
 * Atualiza contas antigas para 55 + 11 dígitos (com 9) quando o número é o mesmo.
 * Usado no login, GET /me e ao receber mensagem no Zap.
 */
export async function migrateUserWhatsAppToCanonical(
  userId: string,
  preferredPhone?: string,
): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { whatsappNumber: true },
  });
  if (!user) {
    return preferredPhone
      ? (canonicalBrazilStoredPhone(preferredPhone) ?? preferredPhone)
      : "";
  }

  const preferredCanonical = preferredPhone
    ? canonicalBrazilStoredPhone(preferredPhone)
    : null;
  const storedCanonical =
    canonicalBrazilStoredPhone(user.whatsappNumber) ?? user.whatsappNumber;
  const canonical = preferredCanonical ?? storedCanonical;

  if (!phonesReferToSameAccount(user.whatsappNumber, canonical)) {
    return user.whatsappNumber;
  }
  if (user.whatsappNumber === canonical) return canonical;

  const conflict = await prisma.user.findFirst({
    where: { whatsappNumber: canonical, NOT: { id: userId } },
  });
  if (conflict) return user.whatsappNumber;

  await prisma.user.update({
    where: { id: userId },
    data: { whatsappNumber: canonical },
  });
  return canonical;
}

export async function findUserByPhone(whatsappNumber: string) {
  const keys = resolvePhoneLookupKeys(whatsappNumber);
  if (keys.length === 0) return null;

  const user = await prisma.user.findFirst({
    where: { whatsappNumber: { in: keys } },
    include: { costs: true },
  });
  if (!user) return null;

  await migrateUserWhatsAppToCanonical(user.id, whatsappNumber);
  return prisma.user.findUnique({
    where: { id: user.id },
    include: { costs: true },
  });
}

/** Admin / deploy: alinha 55+11 e o 9 do celular em todas as contas existentes. */
export async function normalizeAllUsersWhatsAppNumbers(): Promise<{
  scanned: number;
  updated: number;
  unchanged: number;
  errors: { userId: string; message: string }[];
}> {
  const users = await prisma.user.findMany({
    select: { id: true, whatsappNumber: true },
  });
  let updated = 0;
  let unchanged = 0;
  const errors: { userId: string; message: string }[] = [];

  for (const u of users) {
    try {
      const before = u.whatsappNumber;
      const after = await migrateUserWhatsAppToCanonical(u.id);
      if (after !== before) updated++;
      else unchanged++;
    } catch (err) {
      errors.push({
        userId: u.id,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { scanned: users.length, updated, unchanged, errors };
}

/** Admin: alinha contas antigas (WhatsApp, CostConfig, meta) sem mexer em senha. */
export async function reconcileLegacyUsers(): Promise<{
  phoneSync: Awaited<ReturnType<typeof normalizeAllUsersWhatsAppNumbers>>;
  costsCreated: number;
  goalsCreated: number;
  usersWithoutPassword: number;
  usersWithoutEmail: number;
}> {
  const phoneSync = await normalizeAllUsersWhatsAppNumbers();

  const users = await prisma.user.findMany({
    select: {
      id: true,
      passwordHash: true,
      email: true,
      costs: { select: { id: true } },
      goals: { where: { active: true }, select: { id: true }, take: 1 },
    },
  });

  let costsCreated = 0;
  let goalsCreated = 0;
  let usersWithoutPassword = 0;
  let usersWithoutEmail = 0;

  for (const u of users) {
    if (!u.passwordHash) usersWithoutPassword++;
    if (!u.email?.trim()) usersWithoutEmail++;

    if (!u.costs) {
      await prisma.costConfig.create({ data: { userId: u.id } });
      costsCreated++;
    }

    if (u.goals.length === 0) {
      await prisma.goal.create({
        data: {
          userId: u.id,
          period: "DAILY",
          targetValue: 250,
          active: true,
        },
      });
      goalsCreated++;
    }
  }

  return {
    phoneSync,
    costsCreated,
    goalsCreated,
    usersWithoutPassword,
    usersWithoutEmail,
  };
}

export type PhoneUserLinkDiagnosis = {
  incoming: string;
  lookupKeys: string[];
  matchedUser: {
    id: string;
    name: string | null;
    whatsappNumber: string;
  } | null;
  linkStatus: "linked" | "not_in_database" | "invalid_phone" | "webhook_audit";
};

/** Admin: verifica se um número do Zap existe no cadastro (variantes com/sem 9). */
export async function diagnosePhoneUserLink(
  incoming: string,
): Promise<PhoneUserLinkDiagnosis> {
  const trimmed = incoming.trim();
  if (!trimmed || trimmed === "unknown") {
    return {
      incoming: trimmed || "unknown",
      lookupKeys: [],
      matchedUser: null,
      linkStatus: "webhook_audit",
    };
  }

  const lookupKeys = resolvePhoneLookupKeys(trimmed);
  if (lookupKeys.length === 0) {
    return {
      incoming: trimmed,
      lookupKeys: [],
      matchedUser: null,
      linkStatus: "invalid_phone",
    };
  }

  for (const key of lookupKeys) {
    const user = await prisma.user.findUnique({
      where: { whatsappNumber: key },
      select: { id: true, name: true, whatsappNumber: true },
    });
    if (user) {
      return {
        incoming: trimmed,
        lookupKeys,
        matchedUser: user,
        linkStatus: "linked",
      };
    }
  }

  return {
    incoming: trimmed,
    lookupKeys,
    matchedUser: null,
    linkStatus: "not_in_database",
  };
}

/** Login/cadastro: alinha WhatsApp da conta ao telefone informado (novos e existentes). */
export async function syncUserWhatsAppOnLogin(
  userId: string,
  loginPhone: string,
): Promise<string> {
  return migrateUserWhatsAppToCanonical(userId, loginPhone);
}

export async function createUserWithProfile(input: {
  whatsappNumber: string;
  name: string;
  email: string;
  passwordHash?: string;
  affiliateCode?: string;
}) {
  const normalized = normalizePhone(input.whatsappNumber);
  const email = input.email.trim().toLowerCase();

  const [phoneTaken, emailTaken] = await Promise.all([
    findUserByPhone(input.whatsappNumber),
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

  await assertAffiliateCodeValid(input.affiliateCode);

  const user = await prisma.user.create({
    data: {
      whatsappNumber: normalized,
      name: input.name.trim(),
      email,
      passwordHash: input.passwordHash,
      status: "TRIAL",
      trialEndsAt,
      ...defaultUserNestedCreate(),
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
  const existing = await findUserByPhone(whatsappNumber);
  if (existing) return existing;

  const normalized =
    canonicalBrazilStoredPhone(whatsappNumber) ??
    normalizePhone(whatsappNumber);

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);
  return prisma.user.create({
    data: {
      whatsappNumber: normalized,
      status: "TRIAL",
      trialEndsAt,
      ...defaultUserNestedCreate(),
    },
    include: { costs: true },
  });
}

export function isTrialExpired(user: {
  status: string;
  trialEndsAt: Date | null;
}): boolean {
  if (user.status === "ACTIVE") return false;
  if (!user.trialEndsAt) return false;
  return new Date() > user.trialEndsAt;
}
