/** IDs `local-*` em voo — evita refetch apagar otimista antes do POST terminar. */
export function createPendingDeliveryRegistry() {
  const ids = new Set<string>();
  const cancelledLocal = new Set<string>();

  return {
    mark(id: string) {
      if (id.startsWith("local-")) ids.add(id);
    },
    unmark(id: string) {
      ids.delete(id);
      cancelledLocal.delete(id);
    },
    hasLocal(): boolean {
      return ids.size > 0;
    },
    markCancelled(localId: string) {
      if (localId.startsWith("local-")) cancelledLocal.add(localId);
    },
    isCancelled(localId: string): boolean {
      return cancelledLocal.has(localId);
    },
    clear() {
      ids.clear();
      cancelledLocal.clear();
    },
  };
}
