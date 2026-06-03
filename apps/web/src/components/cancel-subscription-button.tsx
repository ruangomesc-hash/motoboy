"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Loader2 } from "lucide-react";
import { signOut } from "next-auth/react";

type Props = {
  onCanceled?: () => void;
};

export function CancelSubscriptionButton({ onCanceled }: Props) {
  const api = useApi();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function confirmCancel() {
    setLoading(true);
    setError("");
    try {
      await api<{ ok: boolean }>("/me/subscription/cancel", { method: "POST" });
      setOpen(false);
      onCanceled?.();
      await signOut({ redirect: false });
      router.push("/login?canceled=1");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Não foi possível cancelar. Tente de novo.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full border-destructive/40 text-destructive hover:bg-destructive/10"
        onClick={() => setOpen(true)}
      >
        Cancelar assinatura
      </Button>
      <ConfirmDialog
        open={open}
        title="Cancelar assinatura?"
        description="A renovação mensal será interrompida no Asaas. Você perde o acesso ao app e pode assinar de novo depois."
        confirmLabel="Sim, cancelar"
        cancelLabel="Manter assinatura"
        loading={loading}
        error={error || null}
        onConfirm={() => void confirmCancel()}
        onCancel={() => {
          if (!loading) setOpen(false);
        }}
      />
      {loading && (
        <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Enviando cancelamento ao Asaas…
        </p>
      )}
    </>
  );
}
