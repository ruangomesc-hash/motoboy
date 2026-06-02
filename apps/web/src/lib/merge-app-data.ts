import type { TodaySummary } from "@motoboy/types";
import type { DeliveryListItem } from "@/lib/app-persist-cache";
import { isIsoOnDateInput } from "@/lib/local-date";

function isPendingDeliveryId(id: string): boolean {
  return id.startsWith("local-");
}

function sortDeliveriesByOccurredAt(
  items: DeliveryListItem[],
): DeliveryListItem[] {
  return [...items].sort(
    (a, b) =>
      new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );
}

/** União servidor + local do dia; tombstones e local ganham sobre servidor atrasado. */
export function mergeDeliveryLists(
  server: DeliveryListItem[],
  local: DeliveryListItem[],
  dateFilter: string,
  tombstoneIds: ReadonlySet<string> = new Set(),
): DeliveryListItem[] {
  const byId = new Map<string, DeliveryListItem>();

  for (const d of server) {
    if (tombstoneIds.has(d.id)) continue;
    if (!isIsoOnDateInput(d.occurredAt, dateFilter)) continue;
    byId.set(d.id, d);
  }

  for (const d of local) {
    if (tombstoneIds.has(d.id)) continue;
    if (!isIsoOnDateInput(d.occurredAt, dateFilter)) continue;
    byId.set(d.id, d);
  }

  return sortDeliveriesByOccurredAt([...byId.values()]);
}

/** Entregas de um dia a partir de duas fontes (lista do dia + período/mês). */
export function selectDeliveriesForDate(
  dayList: DeliveryListItem[],
  periodList: DeliveryListItem[],
  dateFilter: string,
  tombstoneIds: ReadonlySet<string> = new Set(),
): DeliveryListItem[] {
  const dayRows = mergeDeliveryLists([], dayList, dateFilter, tombstoneIds);
  return mergeDeliveryLists(dayRows, periodList, dateFilter, tombstoneIds);
}

/** Atualiza só as entregas de `dateFilter` e mantém outros dias no array. */
export function upsertDeliveriesForDate(
  list: DeliveryListItem[],
  serverItems: DeliveryListItem[],
  dateFilter: string,
  tombstoneIds: ReadonlySet<string>,
  options?: { serverPoll?: boolean },
): DeliveryListItem[] {
  const otherDays = list.filter(
    (d) => !isIsoOnDateInput(d.occurredAt, dateFilter),
  );
  const forDay = options?.serverPoll
    ? mergeDeliveryListsFromServerPoll(serverItems, [], dateFilter, tombstoneIds)
    : mergeDeliveryLists(serverItems, [], dateFilter, tombstoneIds);
  return sortDeliveriesByOccurredAt([...forDay, ...otherDays]);
}

/**
 * Poll em background (Zap/socket): servidor manda a verdade; local só `local-*` pendente.
 */
export function mergeDeliveryListsFromServerPoll(
  server: DeliveryListItem[],
  local: DeliveryListItem[],
  dateFilter: string,
  tombstoneIds: ReadonlySet<string> = new Set(),
): DeliveryListItem[] {
  const pendingLocal = local.filter(
    (d) => isPendingDeliveryId(d.id) && !tombstoneIds.has(d.id),
  );
  return mergeDeliveryLists(server, pendingLocal, dateFilter, tombstoneIds);
}

/** Remove duplicatas por id (mantém a primeira ocorrência). */
export function dedupeRecentDeliveries<
  T extends { id: string },
>(rows: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const row of rows) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    out.push(row);
  }
  return out;
}

function sortRecent<T extends { occurredAt: string }>(rows: T[]): T[] {
  return [...rows].sort(
    (a, b) =>
      new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );
}

/**
 * Mescla GET /me/today com estado local sem “voltar no tempo” quando o servidor
 * ainda não refletiu create/delete.
 */
export function mergeTodayFromServer(
  server: TodaySummary,
  local: TodaySummary | null | undefined,
  tombstoneIds: ReadonlySet<string>,
  todayKey: string,
): TodaySummary {
  const serverRecent = server.recentDeliveries.filter(
    (r) => !tombstoneIds.has(r.id),
  );
  const serverBase: TodaySummary = {
    ...server,
    recentDeliveries: serverRecent,
  };

  if (!local) {
    return {
      ...serverBase,
      recentDeliveries: dedupeRecentDeliveries(serverRecent).slice(0, 3),
    };
  }

  const localRecent = local.recentDeliveries.filter(
    (r) => !tombstoneIds.has(r.id),
  );
  const serverIds = new Set(serverRecent.map((r) => r.id));

  const localOnlyOnToday = localRecent.filter(
    (r) =>
      !serverIds.has(r.id) &&
      isIsoOnDateInput(r.occurredAt, todayKey) &&
      !isPendingDeliveryId(r.id),
  );

  const tombstoneActive = tombstoneIds.size > 0;
  const localAhead =
    local.deliveryCount > serverBase.deliveryCount || localOnlyOnToday.length > 0;

  const recentMap = new Map<string, (typeof serverRecent)[0]>();
  for (const r of serverRecent) recentMap.set(r.id, r);
  for (const r of localRecent) {
    if (!tombstoneIds.has(r.id)) recentMap.set(r.id, r);
  }
  const mergedRecent = dedupeRecentDeliveries(
    sortRecent([...recentMap.values()]),
  ).slice(0, 3);

  if (tombstoneActive || localAhead) {
    return {
      ...local,
      recentDeliveries: mergedRecent,
      goalsPlan: serverBase.goalsPlan,
      weeklyGoal: serverBase.weeklyGoal,
      goalTarget: serverBase.goalTarget,
      goalProgress: serverBase.goalProgress,
      goalRemaining: serverBase.goalRemaining,
      fuel: serverBase.fuel,
      odometer: serverBase.odometer,
      costsConfigured: serverBase.costsConfigured,
    };
  }

  if (serverBase.deliveryCount > local.deliveryCount) {
    return {
      ...serverBase,
      recentDeliveries: dedupeRecentDeliveries(serverRecent).slice(0, 3),
    };
  }

  return {
    ...serverBase,
    recentDeliveries: mergedRecent,
  };
}

/** @deprecated use mergeTodayFromServer */
export function mergeTodaySummary(
  server: TodaySummary,
  local: TodaySummary | null | undefined,
  todayKey: string,
): TodaySummary {
  return mergeTodayFromServer(server, local, new Set(), todayKey);
}
