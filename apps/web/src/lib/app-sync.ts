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
  /** true = só aplica cache local; API reconcilia em background */
  skipReconcile?: boolean;
};

let broadcastChannel: BroadcastChannel | null = null;

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === "undefined") return null;
  if (!broadcastChannel) {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  }
  return broadcastChannel;
}

export function notifyAppSync(
  topics: AppSyncTopic | AppSyncTopic[] = "all",
  extra?: Omit<AppSyncDetail, "topics">,
): void {
  if (typeof window === "undefined") return;
  const list = Array.isArray(topics) ? topics : [topics];
  const detail: AppSyncDetail = { topics: list, ...extra };

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
    handler((event as CustomEvent<AppSyncDetail>).detail);
  };

  const onStorage = (event: StorageEvent) => {
    if (event.key !== APP_SYNC_BRIDGE_KEY || !event.newValue) return;
    try {
      const parsed = JSON.parse(event.newValue) as { detail?: AppSyncDetail };
      if (parsed.detail) handler(parsed.detail);
    } catch {
      /* ignore */
    }
  };

  const channel = getBroadcastChannel();
  const onBroadcast = (event: MessageEvent<AppSyncDetail>) => {
    if (event.data?.topics) handler(event.data);
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
