"use client";

import { useState } from "react";
import type { AdminPaymentLinkResponse, AdminUserRow } from "@motoboy/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminApi } from "@/hooks/use-admin-api";
import {
  Check,
  Copy,
  ExternalLink,
  KeyRound,
  Link2,
  MessageCircle,
  Trash2,
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
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [loadingLink, setLoadingLink] = useState(false);
  const [loadingActivate, setLoadingActivate] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isActive = client.status === "ACTIVE";
  const clientLabel = client.name ?? client.whatsappNumber;

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
        `Confirmar que ${clientLabel} pagou via Pix e ativar a assinatura?`,
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

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError("A senha deve ter no mínimo 8 caracteres.");
      return;
    }
    setLoadingPassword(true);
    setError(null);
    try {
      await api<AdminUserRow>(`/admin/users/${client.id}/password`, {
        method: "PUT",
        body: JSON.stringify({ password: newPassword }),
      });
      setPasswordOpen(false);
      setNewPassword("");
      onUpdated();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível salvar a senha.",
      );
    } finally {
      setLoadingPassword(false);
    }
  }

  async function deleteClient() {
    if (
      !window.confirm(
        `Excluir permanentemente ${clientLabel}?\n\nIsso remove o cadastro, entregas e histórico. Não dá para desfazer.`,
      )
    ) {
      return;
    }
    setLoadingDelete(true);
    setError(null);
    try {
      await api(`/admin/users/${client.id}`, { method: "DELETE" });
      onUpdated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao excluir cliente");
    } finally {
      setLoadingDelete(false);
    }
  }

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <div className="flex flex-col gap-1.5 min-w-[8.5rem]">
        {!client.hasPassword && (
          <p className="text-[10px] text-amber-400 leading-tight">
            Sem senha — não entra no app
          </p>
        )}
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
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 text-xs justify-start px-2 border-amber-500/40 text-amber-200 hover:bg-amber-500/10"
          disabled={loadingPassword}
          onClick={() => {
            setError(null);
            setNewPassword("");
            setPasswordOpen(true);
          }}
        >
          <KeyRound className="h-3.5 w-3.5 mr-1 shrink-0" />
          {client.hasPassword ? "Nova senha" : "Definir senha"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 text-xs justify-start px-2 border-red-500/40 text-red-400 hover:bg-red-500/10"
          disabled={loadingDelete}
          onClick={deleteClient}
        >
          <Trash2 className="h-3.5 w-3.5 mr-1 shrink-0" />
          Excluir
        </Button>
        {error && (
          <p className="text-[10px] text-destructive leading-tight">{error}</p>
        )}
      </div>

      {passwordOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70">
          <form
            onSubmit={savePassword}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0f0d] p-5 space-y-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">
                  {client.hasPassword ? "Redefinir senha" : "Definir senha"} —{" "}
                  {clientLabel}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  O motoboy usa WhatsApp + esta senha em /login
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPasswordOpen(false);
                  setError(null);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Nova senha</label>
              <Input
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1"
                required
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loadingPassword}>
              {loadingPassword ? "Salvando..." : "Salvar senha"}
            </Button>
          </form>
        </div>
      )}

      {linkData && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0a0f0d] p-5 space-y-4 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">Cobrança — {clientLabel}</h3>
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
              <Button type="button" size="sm" variant="outline" asChild>
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
