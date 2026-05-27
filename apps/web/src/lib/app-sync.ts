import type { CreatedDelivery } from "./app-data-cache";

export const APP_SYNC_EVENT = "motoboy:sync";
export const APP_SYNC_BRIDGE_KEY = "motoboy:sync:bridge";
const BROADCAST_CHANNEL_NAME = "motoboy:sync:v1";

export type AppSyncTopic =
  | "today"
  | "deliveries"
  | "stats"
  | "profile"
  | "subscription"
  | "history"
  | "all";

export type AppSyncDetail = {
  topics: AppSyncTopic[];
  delivery?: CreatedDelivery;
  /** Entrega anterior (edição) para recalcular Home na hora */
  previousDelivery?: CreatedDelivery;
  removedDeliveryId?: string;
  /** Tombstones replicados entre abas */
  deletedDeliveryIds?: string[];
  /** true = só aplica cache local; API reconcilia em background */
  skipReconcile?: boolean;
  /** Evita processar o mesmo evento 2x (CustomEvent + BroadcastChannel) */
  syncKey?: string;
};

let broadcastChannel: BroadcastChannel | null = null;
let persistBeforeBroadcast: (() => void) | null = null;
const recentSyncKeys = new Map<string, number>();

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === "undefined") return null;
  if (!broadcastChannel) {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  }
  return broadcastChannel;
}

export function registerAppSyncPersist(fn: (() => void) | null): void {
  persistBeforeBroadcast = fn;
}

function buildSyncKey(detail: AppSyncDetail): string {
  return [
    detail.removedDeliveryId ?? "",
    detail.delivery?.id ?? "",
    detail.previousDelivery?.id ?? "",
    (detail.deletedDeliveryIds ?? []).join(","),
    detail.topics.join(","),
    String(detail.skipReconcile ?? false),
  ].join("|");
}

function shouldProcessIncoming(detail: AppSyncDetail): boolean {
  const key = detail.syncKey ?? buildSyncKey(detail);
  const now = Date.now();
  const last = recentSyncKeys.get(key);
  if (last != null && now - last < 80) return false;
  recentSyncKeys.set(key, now);
  if (recentSyncKeys.size > 200) {
    for (const [k, ts] of recentSyncKeys) {
      if (now - ts > 5000) recentSyncKeys.delete(k);
    }
  }
  return true;
}

export function notifyAppSync(
  topics: AppSyncTopic | AppSyncTopic[] = "all",
  extra?: Omit<AppSyncDetail, "topics" | "syncKey">,
): void {
  if (typeof window === "undefined") return;
  const list = Array.isArray(topics) ? topics : [topics];
  const detail: AppSyncDetail = {
    topics: list,
    ...extra,
    syncKey: buildSyncKey({ topics: list, ...extra, syncKey: "" }),
  };

  persistBeforeBroadcast?.();

  window.dispatchEvent(
    new CustomEvent<AppSyncDetail>(APP_SYNC_EVENT, { detail }),
  );

  try {
    window.localStorage.setItem(
      APP_SYNC_BRIDGE_KEY,
      JSON.stringify({ ts: Date.now(), detail }),
    );
  } catch {
    /* ignore */
  }

  try {
    getBroadcastChannel()?.postMessage(detail);
  } catch {
    /* ignore */
  }
}

export function subscribeAppSync(
  handler: (detail: AppSyncDetail) => void,
): () => void {
  if (typeof window === "undefined") return () => {};

  const onEvent = (event: Event) => {
    const detail = (event as CustomEvent<AppSyncDetail>).detail;
    if (!detail?.topics) return;
    if (!shouldProcessIncoming(detail)) return;
    handler(detail);
  };

  const onStorage = (event: StorageEvent) => {
    if (event.key !== APP_SYNC_BRIDGE_KEY || !event.newValue) return;
    try {
      const parsed = JSON.parse(event.newValue) as { detail?: AppSyncDetail };
      if (parsed.detail?.topics) {
        if (!shouldProcessIncoming(parsed.detail)) return;
        handler(parsed.detail);
      }
    } catch {
      /* ignore */
    }
  };

  const channel = getBroadcastChannel();
  const onBroadcast = (event: MessageEvent<AppSyncDetail>) => {
    if (!event.data?.topics) return;
    if (!shouldProcessIncoming(event.data)) return;
    handler(event.data);
  };

  window.addEventListener(APP_SYNC_EVENT, onEvent);
  window.addEventListener("storage", onStorage);
  channel?.addEventListener("message", onBroadcast);

  return () => {
    window.removeEventListener(APP_SYNC_EVENT, onEvent);
    window.removeEventListener("storage", onStorage);
    channel?.removeEventListener("message", onBroadcast);
  };
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
