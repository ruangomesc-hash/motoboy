"use client";

import { useState } from "react";
import type { AdminCreateUserInput, AdminUserRow } from "@motoboy/types";
import {
  maskPhone,
  parseBrazilWhatsAppDigits,
  WHATSAPP_VALIDATION_MESSAGE,
} from "@/lib/phone-mask";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, X } from "lucide-react";

export function AddClientDialog({
  onCreated,
  onSubmit,
}: {
  onCreated: () => void;
  onSubmit: (body: AdminCreateUserInput) => Promise<AdminUserRow>;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState<AdminCreateUserInput["status"]>("TRIAL");
  const [affiliateCode, setAffiliateCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function reset() {
    setName("");
    setPhone("");
    setCity("");
    setStatus("TRIAL");
    setAffiliateCode("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    let whatsappDigits: string;
    try {
      whatsappDigits = parseBrazilWhatsAppDigits(phone);
    } catch (err) {
      setError(err instanceof Error ? err.message : WHATSAPP_VALIDATION_MESSAGE);
      setLoading(false);
      return;
    }
    try {
      await onSubmit({
        whatsappNumber: whatsappDigits,
        name: name.trim() || undefined,
        city: city.trim() || null,
        status,
        affiliateCode: affiliateCode.trim()
          ? affiliateCode.trim().toUpperCase()
          : undefined,
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
        Adicionar cliente
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
          <h2 className="text-lg font-semibold">Novo cliente</h2>
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
          <label className="text-sm text-muted-foreground">Nome</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do motoboy"
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">WhatsApp *</label>
          <Input
            value={phone}
            onChange={(e) => setPhone(maskPhone(e.target.value))}
            placeholder="(61) 99999-9999"
            inputMode="tel"
            maxLength={16}
            className="mt-1"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            11 números com DDD (sem +55).
          </p>
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Cidade</label>
          <Input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="São Paulo"
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">
            Cupom de indicação (opcional)
          </label>
          <Input
            value={affiliateCode}
            onChange={(e) =>
              setAffiliateCode(e.target.value.toUpperCase().replace(/\s/g, ""))
            }
            placeholder="JOAO10"
            className="mt-1 font-mono"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Status inicial</label>
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as AdminCreateUserInput["status"])
            }
            className="mt-1 w-full h-11 rounded-lg border border-border bg-background px-3 text-sm"
          >
            <option value="TRIAL">Trial (4 dias)</option>
            <option value="ACTIVE">Ativo (pago)</option>
            <option value="PAUSED">Pausado</option>
            <option value="CANCELED">Cancelado</option>
          </select>
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
