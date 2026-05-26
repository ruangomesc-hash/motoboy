"use client";

import { useEffect } from "react";
import { io, type Socket } from "socket.io-client";

const SOCKET_ENABLED = process.env.NEXT_PUBLIC_ENABLE_SOCKET === "true";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function useSocket(
  userId: string | undefined,
  onDeliveryCreated?: () => void,
  enabled = true,
): void {
  useEffect(() => {
    if (!SOCKET_ENABLED || !userId || !enabled) return;
    let socket: Socket | undefined;
    socket = io(API_URL, {
      auth: { userId },
      transports: ["websocket", "polling"],
    });
    socket.on("delivery:created", () => {
      onDeliveryCreated?.();
    });
    socket.on("delivery:deleted", () => {
      onDeliveryCreated?.();
    });
    socket.on("fuel:refuel", () => {
      onDeliveryCreated?.();
    });
    socket.on("odometer:updated", () => {
      onDeliveryCreated?.();
    });
    return () => {
      socket?.disconnect();
    };
  }, [userId, onDeliveryCreated, enabled]);
}
