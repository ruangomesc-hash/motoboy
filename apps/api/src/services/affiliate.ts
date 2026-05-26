import { prisma } from "@motoboy/db";
import type {
  AdminAffiliateReferrals,
  AdminAffiliateRow,
  AdminAffiliatesList,
  AdminCreateAffiliateInput,
} from "@motoboy/types";

export function normalizeAffiliateCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export async function findActiveAffiliateByCode(code: string) {
  const normalized = normalizeAffiliateCode(code);
  if (!normalized) return null;
  return prisma.affiliate.findFirst({
    where: { code: normalized, active: true },
  });
}

export async function attachReferralToUser(
  userId: string,
  affiliateCode: string | undefined,
): Promise<void> {
  if (!affiliateCode?.trim()) return;

  const affiliate = await findActiveAffiliateByCode(affiliateCode);
  if (!affiliate) return;

  await prisma.user.updateMany({
    where: { id: userId, referredByAffiliateId: null },
    data: {
      referredByAffiliateId: affiliate.id,
      affiliateCouponCode: affiliate.code,
      referredAt: new Date(),
    },
  });
}

export async function validateAffiliateCode(code: string) {
  const affiliate = await findActiveAffiliateByCode(code);
  if (!affiliate) {
    return { valid: false as const, name: null, code: null };
  }
  return {
    valid: true as const,
    name: affiliate.name,
    code: affiliate.code,
  };
}

function monthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function getAdminAffiliatesRanking(): Promise<AdminAffiliatesList> {
  const startMonth = monthStart();
  const affiliates = await prisma.affiliate.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      referrals: {
        select: {
          id: true,
          status: true,
          createdAt: true,
          subscribedAt: true,
        },
      },
    },
  });

  const rows: Omit<AdminAffiliateRow, "rank">[] = affiliates.map((a) => {
    const totalReferrals = a.referrals.length;
    const activeReferrals = a.referrals.filter((r) => r.status === "ACTIVE").length;
    const trialReferrals = a.referrals.filter((r) => r.status === "TRIAL").length;
    const paidReferrals = activeReferrals;
    const referralsThisMonth = a.referrals.filter(
      (r) => r.createdAt >= startMonth,
    ).length;
    const conversionRatePercent =
      totalReferrals > 0
        ? Math.round((paidReferrals / totalReferrals) * 1000) / 10
        : 0;

    return {
      id: a.id,
      name: a.name,
      code: a.code,
      active: a.active,
      phone: a.phone,
      email: a.email,
      notes: a.notes,
      createdAt: a.createdAt.toISOString(),
      totalReferrals,
      activeReferrals,
      trialReferrals,
      paidReferrals,
      referralsThisMonth,
      conversionRatePercent,
    };
  });

  rows.sort((a, b) => {
    if (b.totalReferrals !== a.totalReferrals) {
      return b.totalReferrals - a.totalReferrals;
    }
    if (b.paidReferrals !== a.paidReferrals) {
      return b.paidReferrals - a.paidReferrals;
    }
    return b.referralsThisMonth - a.referralsThisMonth;
  });

  const items: AdminAffiliateRow[] = rows.map((row, index) => ({
    ...row,
    rank: index + 1,
  }));

  return { items, total: items.length };
}

export async function createAdminAffiliate(
  input: AdminCreateAffiliateInput,
): Promise<AdminAffiliateRow> {
  const code = normalizeAffiliateCode(input.code);
  const existing = await prisma.affiliate.findUnique({ where: { code } });
  if (existing) {
    throw Object.assign(new Error("Cupom já em uso"), { statusCode: 409 });
  }

  const affiliate = await prisma.affiliate.create({
    data: {
      name: input.name.trim(),
      code,
      phone: input.phone?.trim() || null,
      email: input.email?.trim().toLowerCase() || null,
      notes: input.notes?.trim() || null,
    },
  });

  return {
    id: affiliate.id,
    name: affiliate.name,
    code: affiliate.code,
    active: affiliate.active,
    phone: affiliate.phone,
    email: affiliate.email,
    notes: affiliate.notes,
    createdAt: affiliate.createdAt.toISOString(),
    totalReferrals: 0,
    activeReferrals: 0,
    trialReferrals: 0,
    paidReferrals: 0,
    referralsThisMonth: 0,
    conversionRatePercent: 0,
    rank: 0,
  };
}

export async function getAdminAffiliateReferrals(
  affiliateId: string,
): Promise<AdminAffiliateReferrals> {
  const affiliate = await prisma.affiliate.findUnique({
    where: { id: affiliateId },
  });
  if (!affiliate) {
    throw Object.assign(new Error("Afiliado não encontrado"), { statusCode: 404 });
  }

  const referrals = await prisma.user.findMany({
    where: { referredByAffiliateId: affiliateId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      whatsappNumber: true,
      city: true,
      status: true,
      createdAt: true,
      subscribedAt: true,
      affiliateCouponCode: true,
    },
  });

  return {
    affiliate: {
      id: affiliate.id,
      name: affiliate.name,
      code: affiliate.code,
    },
    items: referrals.map((r) => ({
      id: r.id,
      name: r.name,
      whatsappNumber: r.whatsappNumber,
      city: r.city,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      subscribedAt: r.subscribedAt?.toISOString() ?? null,
      affiliateCouponCode: r.affiliateCouponCode,
    })),
    total: referrals.length,
  };
}
