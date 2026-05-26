"use client";

import { useState } from "react";
import type { AdminPaymentLinkResponse, AdminUserRow } from "@motocheck/types";
import { Button } from "@/components/ui/button";
import { useAdminApi } from "@/hooks/use-admin-api";
import {
  Check,
  Copy,
  ExternalLink,
  Link2,
  MessageCircle,
  X,
} from "lucide-react";

export function ClientPaymentActions({
  client,
  onUpdated,
}: {
  client: AdminUserRow;
  onUpdated: () => void;
}) {
  const api = useAdminApi();
  const [linkData, setLinkData] = useState<AdminPaymentLinkResponse | null>(
    null,
  );
  const [loadingLink, setLoadingLink] = useState(false);
  const [loadingActivate, setLoadingActivate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isActive = client.status === "ACTIVE";

  async function generateLink() {
    setLoadingLink(true);
    setError(null);
    try {
      const data = await api<AdminPaymentLinkResponse>(
        `/admin/users/${client.id}/payment-link`,
        { method: "POST" },
      );
      setLinkData(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao gerar link");
    } finally {
      setLoadingLink(false);
    }
  }

  async function confirmPayment() {
    if (
      !window.confirm(
        `Confirmar que ${client.name ?? "o cliente"} pagou via Pix e ativar a assinatura?`,
      )
    ) {
      return;
    }
    setLoadingActivate(true);
    setError(null);
    try {
      await api(`/admin/users/${client.id}/activate`, { method: "POST" });
      onUpdated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao ativar");
    } finally {
      setLoadingActivate(false);
    }
  }

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <div className="flex flex-col gap-1.5 min-w-[7.5rem]">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 text-xs justify-start px-2"
          disabled={loadingLink}
          onClick={generateLink}
        >
          <Link2 className="h-3.5 w-3.5 mr-1 shrink-0" />
          Link Pix
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 text-xs justify-start px-2 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
          disabled={loadingActivate || isActive}
          onClick={confirmPayment}
          title={isActive ? "Cliente já ativo" : "Dar baixa manual do Pix"}
        >
          <Check className="h-3.5 w-3.5 mr-1 shrink-0" />
          {isActive ? "Ativo" : "Dar baixa"}
        </Button>
        {error && (
          <p className="text-[10px] text-destructive leading-tight">{error}</p>
        )}
      </div>

      {linkData && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0a0f0d] p-5 space-y-4 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">Cobrança — {client.name ?? "Cliente"}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Copie e envie no WhatsApp dele
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLinkData(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {linkData.pixCopyPaste && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Pix copia e cola
                </p>
                <textarea
                  readOnly
                  value={linkData.pixCopyPaste}
                  className="w-full h-20 text-xs rounded-lg border border-border bg-muted/30 p-2 font-mono resize-none"
                />
              </div>
            )}

            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Link de pagamento
              </p>
              <input
                readOnly
                value={linkData.invoiceUrl}
                className="w-full text-xs rounded-lg border border-border bg-muted/30 p-2"
              />
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Mensagem pronta para WhatsApp
              </p>
              <textarea
                readOnly
                value={linkData.whatsappText}
                className="w-full h-32 text-xs rounded-lg border border-border bg-muted/30 p-2 resize-none"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                className="flex-1 min-w-[120px]"
                onClick={() => copyText(linkData.whatsappText)}
              >
                <Copy className="h-4 w-4 mr-1" />
                {copied ? "Copiado!" : "Copiar mensagem"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="flex-1 min-w-[120px]"
                asChild
              >
                <a
                  href={linkData.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Abrir WhatsApp
                </a>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                asChild
              >
                <a
                  href={linkData.invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Ver cobrança
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
