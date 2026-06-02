import type { AppSyncDetail, AppSyncTopic } from "@/lib/app-sync";
import { DELIVERY_SYNC_TOPICS } from "@/lib/delivery-sync-topics";
import type { DailyCostExclusionTombstone } from "@/lib/excluded-daily-cost-tombstones";

export type DailyCostSyncPhase = "optimistic" | "confirmed";

export type PublishAppSyncFn = (
  topics: AppSyncTopic | AppSyncTopic[],
  extra?: Omit<AppSyncDetail, "topics" | "syncKey">,
) => void;

export function publishDailyCostSync(
  publish: PublishAppSyncFn,
  phase: DailyCostSyncPhase,
  extra: {
    excludedDailyCost?: DailyCostExclusionTombstone;
    restoredDailyCost?: { dateKey: string; costKey: DailyCostExclusionTombstone["costKey"] };
  },
): void {
  publish(DELIVERY_SYNC_TOPICS, {
    ...extra,
    skipReconcile: phase === "optimistic",
  });
}
