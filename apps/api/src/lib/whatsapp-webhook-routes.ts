/** Evolution com webhookByEvents envia POST para /webhooks/whatsapp/messages-upsert etc. */
export function normalizeWhatsAppWebhookPath(url: string): string {
  const [pathPart, query] = url.split("?");
  const path = pathPart ?? url;
  if (
    path.startsWith("/webhooks/whatsapp/") &&
    path.length > "/webhooks/whatsapp".length
  ) {
    return `/webhooks/whatsapp${query ? `?${query}` : ""}`;
  }
  return url;
}

export function isWhatsAppWebhookPath(path: string): boolean {
  const p = path.split("?")[0] ?? path;
  return p === "/webhooks/whatsapp" || p.startsWith("/webhooks/whatsapp/");
}
