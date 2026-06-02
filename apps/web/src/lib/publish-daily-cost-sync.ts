import type { AppSyncDetail, AppSyncTopic } from "@/lib/app-sync";
import { DELIVERY_SYNC_TOPICS } from "@/lib/delivery-sync-topics";
export type DailyCostSyncPhase = "optimistic" | "confirmed";

export type PublishAppSyncFn = (
  topics: AppSyncTopic | AppSyncTopic[],
  extra?: Omit<AppSyncDetail, "topics" | "syncKey">,
) => void;

export type DailyCostSyncExtra = Pick<
  AppSyncDetail,
  "excludedDailyCost" | "restoredDailyCost"
>;

export function publishDailyCostSync(
  publish: PublishAppSyncFn,
  phase: DailyCostSyncPhase,
  extra: DailyCostSyncExtra,
): void {
  publish(DELIVERY_SYNC_TOPICS, {
    ...extra,
    skipReconcile: phase === "optimistic",
  });
}
