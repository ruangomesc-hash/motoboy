import type { Server as SocketServer } from "socket.io";
import { publishRealtimeEvent } from "./realtime-bridge.js";

let io: SocketServer | null = null;

export function setSocketServer(server: SocketServer): void {
  io = server;
}

export function getSocketServer(): SocketServer | null {
  return io;
}

export function emitToUser(
  userId: string,
  event: string,
  payload: unknown,
): void {
  if (io) {
    io.to(`user:${userId}`).emit(event, payload);
    return;
  }
  publishRealtimeEvent(userId, event, payload);
}
