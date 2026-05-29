import type { Delivery } from "@motoboy/db";
import { toPublicDelivery } from "./delivery-public.js";
import { emitToUser } from "./socket.js";

export function emitDeliveryCreated(userId: string, row: Delivery): void {
  emitToUser(userId, "delivery:created", toPublicDelivery(row));
}

export function emitDeliveryUpdated(userId: string, row: Delivery): void {
  emitToUser(userId, "delivery:updated", toPublicDelivery(row));
}

export function emitDeliveryDeleted(userId: string, id: string): void {
  emitToUser(userId, "delivery:deleted", { id });
}
