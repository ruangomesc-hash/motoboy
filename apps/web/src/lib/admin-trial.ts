import type { AdminUserRow } from "@motoboy/types";
import { SUBSCRIPTION_PRICE_BRL, TRIAL_DAYS } from "@motoboy/types";

export type AdminTrialCell = {
  headline: string;
  detail: string;
  tone: "ok" | "warning" | "expired" | "na";
};

/** Resumo do trial de um cliente para tabelas do admin. */
export function formatAdminTrialCell(
  row: AdminUserRow,
  configuredDays = TRIAL_DAYS,
): AdminTrialCell {
  if (row.status === "ACTIVE") {
    return {
      headline: "Assinante",
      detail: row.subscribedAt
        ? `desde ${new Date(row.subscribedAt).toLocaleDateString("pt-BR")}`
        : "ativo",
      tone: "ok",
    };
  }

  if (row.status !== "TRIAL") {
    return { headline: "—", detail: "", tone: "na" };
  }

  if (!row.trialEndsAt) {
    return {
      headline: `Trial (${configuredDays}d config.)`,
      detail: "Sem data de término no cadastro",
      tone: "warning",
    };
  }

  const start = new Date(row.createdAt);
  const end = new Date(row.trialEndsAt);
  const now = new Date();
  const msDay = 86_400_000;

  const totalDays = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / msDay),
  );
  const elapsedMs = Math.min(now.getTime(), end.getTime()) - start.getTime();
  const usedDays = Math.min(
    totalDays,
    Math.max(0, Math.ceil(elapsedMs / msDay)),
  );
  const remainingMs = end.getTime() - now.getTime();
  const remainingDays = Math.ceil(remainingMs / msDay);

  const endLabel = end.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
  });

  if (remainingMs <= 0) {
    const overdue = Math.abs(remainingDays);
    return {
      headline: `Vencido há ${overdue}d`,
      detail: `${usedDays}/${totalDays} dias usados · acabou ${endLabel}`,
      tone: "expired",
    };
  }

  if (remainingDays <= 1) {
    return {
      headline: remainingDays === 0 ? "Acaba hoje" : "Falta 1 dia",
      detail: `${usedDays}/${totalDays} dias · até ${endLabel}`,
      tone: "warning",
    };
  }

  return {
    headline: `Faltam ${remainingDays} dias`,
    detail: `${usedDays}/${totalDays} dias usados · até ${endLabel}`,
    tone: remainingDays <= 2 ? "warning" : "ok",
  };
}

export function trialPolicySummary(configuredDays = TRIAL_DAYS): string {
  const price = SUBSCRIPTION_PRICE_BRL.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  return `Novos cadastros recebem ${configuredDays} dias de trial gratuito. Depois precisam assinar o Pro (${price}/mês).`;
}
