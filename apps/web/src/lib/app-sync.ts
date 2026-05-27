export const APP_SYNC_EVENT = "motoboy:sync";

export type AppSyncTopic =
  | "today"
  | "deliveries"
  | "stats"
  | "profile"
  | "subscription"
  | "history"
  | "all";

import type { CreatedDelivery } from "./app-data-cache";

export type AppSyncDetail = {
  topics: AppSyncTopic[];
  delivery?: CreatedDelivery;
};

export function notifyAppSync(
  topics: AppSyncTopic | AppSyncTopic[] = "all",
  extra?: Pick<AppSyncDetail, "delivery">,
): void {
  if (typeof window === "undefined") return;
  const list = Array.isArray(topics) ? topics : [topics];
  window.dispatchEvent(
    new CustomEvent<AppSyncDetail>(APP_SYNC_EVENT, {
      detail: { topics: list, ...extra },
    }),
  );
}

export function syncTopicsForPath(path: string, method: string): AppSyncTopic[] {
  const m = method.toUpperCase();
  if (m === "GET" || m === "HEAD") return [];
  if (path.includes("/deliveries")) {
    return ["deliveries", "today", "stats", "history"];
  }
  if (path.includes("/shifts")) return ["stats", "today"];
  if (
    path.includes("/profile") ||
    path.includes("/costs") ||
    path.includes("/goals")
  ) {
    return ["profile", "today", "stats"];
  }
  if (path.includes("/subscribe") || path.includes("/subscription")) {
    return ["subscription"];
  }
  return ["all"];
}

export function shouldHandleSync(
  subscribed: AppSyncTopic[],
  incoming: AppSyncTopic[],
): boolean {
  if (incoming.includes("all") || subscribed.includes("all")) return true;
  return subscribed.some((t) => incoming.includes(t));
}
