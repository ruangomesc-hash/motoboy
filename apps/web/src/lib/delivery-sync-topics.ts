import type { AppSyncTopic } from "@/lib/app-sync";

/** Tópicos padrão para criar, editar ou apagar entrega. */
export const DELIVERY_SYNC_TOPICS: AppSyncTopic[] = [
  "deliveries",
  "today",
  "stats",
  "history",
];
