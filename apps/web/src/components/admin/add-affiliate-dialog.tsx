"use client";

import { useState } from "react";
import type {
  AdminAffiliateRow,
  AdminCreateAffiliateInput,
} from "@motoboy/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, X } from "lucide-react";

export function AddAffiliateDialog({
  onCreated,
  onSubmit,
}: {
  onCreated: () => void;
  onSubmit: (body: AdminCreateAffiliateInput) => Promise<AdminAffiliateRow>;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function reset() {
    setName("");
    setCode("");
    setPhone("");
    setEmail("");
    setNotes("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onSubmit({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      reset();
      setOpen(false);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        <UserPlus className="h-4 w-4 mr-1.5" />
        Novo afiliado
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0f0d] p-5 shadow-xl space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Novo afiliado</h2>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              reset();
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div>
          <label className="text-sm text-muted-foreground">Nome *</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do parceiro"
            className="mt-1"
            required
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Cupom *</label>
          <Input
            value={code}
            onChange={(e) =>
              setCode(e.target.value.toUpperCase().replace(/\s/g, ""))
            }
            placeholder="JOAO10"
            className="mt-1 font-mono"
            required
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            Link: /cadastro?cupom={code || "CUPOM"}
          </p>
        </div>
        <div>
          <label className="text-sm text-muted-foreground">WhatsApp</label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">E-mail</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Observações</label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        <div className="flex gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => {
              setOpen(false);
              reset();
            }}
          >
            Cancelar
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? "Salvando..." : "Cadastrar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
