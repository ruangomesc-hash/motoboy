/** IDs `local-*` em voo — evita refetch apagar otimista antes do POST terminar. */
export function createPendingDeliveryRegistry() {
  const ids = new Set<string>();

  return {
    mark(id: string) {
      if (id.startsWith("local-")) ids.add(id);
    },
    unmark(id: string) {
      ids.delete(id);
    },
    hasLocal(): boolean {
      return ids.size > 0;
    },
    clear() {
      ids.clear();
    },
  };
}
