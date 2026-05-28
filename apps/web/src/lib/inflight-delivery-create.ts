/** Cancela POST /me/deliveries quando o usuário apaga antes de salvar. */
const controllers = new Map<string, AbortController>();

export function registerInflightCreate(tempId: string): AbortController {
  const ac = new AbortController();
  controllers.set(tempId, ac);
  return ac;
}

export function abortInflightCreate(tempId: string): boolean {
  const ac = controllers.get(tempId);
  if (!ac) return false;
  ac.abort();
  controllers.delete(tempId);
  return true;
}

export function finishInflightCreate(tempId: string): void {
  controllers.delete(tempId);
}

export function clearInflightCreates(): void {
  controllers.clear();
}
