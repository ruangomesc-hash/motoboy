import type { AppSyncDetail, AppSyncTopic } from "@/lib/app-sync";
import { DELIVERY_SYNC_TOPICS } from "@/lib/delivery-sync-topics";

export type DeliverySyncPhase = "optimistic" | "confirmed";

export type PublishAppSyncFn = (
  topics: AppSyncTopic | AppSyncTopic[],
  extra?: Omit<AppSyncDetail, "topics" | "syncKey">,
) => void;

/** optimistic = só cache local; confirmed = reconcilia API em todas as abas/dispositivos. */
export function publishDeliverySync(
  publish: PublishAppSyncFn,
  phase: DeliverySyncPhase,
  extra: Omit<AppSyncDetail, "topics" | "syncKey" | "skipReconcile">,
): void {
  publish(DELIVERY_SYNC_TOPICS, {
    ...extra,
    skipReconcile: phase === "optimistic",
  });
}
