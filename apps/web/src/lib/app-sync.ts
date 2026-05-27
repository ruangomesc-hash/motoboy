export const APP_SYNC_EVENT = "motoboy:sync";
export const APP_SYNC_BRIDGE_KEY = "motoboy:sync:bridge";

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
  const detail: AppSyncDetail = { topics: list, ...extra };
  window.dispatchEvent(
    new CustomEvent<AppSyncDetail>(APP_SYNC_EVENT, {
      detail,
    }),
  );
  try {
    // Cross-tab sync: other tabs receive this via "storage".
    window.localStorage.setItem(
      APP_SYNC_BRIDGE_KEY,
      JSON.stringify({ ts: Date.now(), detail }),
    );
  } catch {
    /* ignore storage errors */
  }
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
    return ["profile"];
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
