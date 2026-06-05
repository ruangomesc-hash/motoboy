"use client";

import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

type Props = {
  refreshing: boolean;
  onClick: () => void;
};

export function VerifyPaymentButton({ refreshing, onClick }: Props) {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={refreshing}
      onClick={onClick}
    >
      {refreshing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Verificando…
        </>
      ) : (
        <>
          <RefreshCw className="h-4 w-4 mr-2" />
          Verificar pagamento
        </>
      )}
    </Button>
  );
}
