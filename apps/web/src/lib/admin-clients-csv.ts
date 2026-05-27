import type { AdminUserRow } from "@motoboy/types";
import { buildCsv, downloadCsvFile } from "@/lib/csv";

const STATUS_LABEL: Record<AdminUserRow["status"], string> = {
  ACTIVE: "Ativo",
  TRIAL: "Trial",
  PAUSED: "Pausado",
  CANCELED: "Cancelado",
};

const PAYMENT_LABEL: Record<
  NonNullable<AdminUserRow["lastPaymentStatus"]>,
  string
> = {
  PENDING: "Pendente",
  PAID: "Pago",
  FAILED: "Falhou",
  REFUNDED: "Estornado",
};

const DELINQUENCY_LABEL: Record<
  NonNullable<AdminUserRow["delinquencyReason"]>,
  string
> = {
  trial_expired: "Trial vencido",
  payment_pending: "Cobrança pendente",
  payment_failed: "Pagamento falhou",
};

export const CLIENT_CSV_HEADERS = [
  "ID",
  "Nome",
  "E-mail",
  "WhatsApp",
  "Cidade",
  "Status",
  "Cadastro",
  "Trial até",
  "Assinante desde",
  "Cupom indicação",
  "Afiliado",
  "Entregas",
  "Último pagamento",
  "Inadimplente",
  "Motivo inadimplência",
  "Dias em atraso",
  "Tempo no app",
  "Dias no app (total)",
] as const;

function formatDateBr(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR");
}

function rowToCsvCells(row: AdminUserRow): string[] {
  const usageParts: string[] = [];
  if (row.usageMonths > 0) {
    usageParts.push(
      row.usageMonths === 1 ? "1 mês" : `${row.usageMonths} meses`,
    );
  }
  if (row.usageRemainderDays > 0 || row.usageMonths === 0) {
    usageParts.push(
      row.usageRemainderDays === 1
        ? "1 dia"
        : `${row.usageRemainderDays} dias`,
    );
  }
  const tempoNoApp =
    usageParts.length > 0 ? usageParts.join(" e ") : "Hoje";

  return [
    row.id,
    row.name ?? "",
    row.email ?? "",
    row.whatsappNumber,
    row.city ?? "",
    STATUS_LABEL[row.status],
    formatDateBr(row.createdAt),
    formatDateBr(row.trialEndsAt),
    formatDateBr(row.subscribedAt),
    row.affiliateCode ?? "",
    row.affiliateName ?? "",
    String(row.deliveryCount),
    row.lastPaymentStatus ? PAYMENT_LABEL[row.lastPaymentStatus] : "",
    row.isDelinquent ? "Sim" : "Não",
    row.delinquencyReason ? DELINQUENCY_LABEL[row.delinquencyReason] : "",
    row.daysOverdue != null ? String(row.daysOverdue) : "",
    tempoNoApp,
    String(row.usageDays),
  ];
}

export function buildClientsCsv(items: AdminUserRow[]): string {
  return buildCsv(
    [...CLIENT_CSV_HEADERS],
    items.map((row) => rowToCsvCells(row)),
  );
}

export function downloadClientsCsv(
  items: AdminUserRow[],
  filename: string,
): number {
  downloadCsvFile(buildClientsCsv(items), filename);
  return items.length;
}
