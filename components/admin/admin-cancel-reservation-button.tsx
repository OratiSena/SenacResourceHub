"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { adminCancelReservationAction } from "@/lib/actions/admin";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";

export function AdminCancelReservationButton({
  reservationId,
}: {
  reservationId: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await adminCancelReservationAction(reservationId);
      if (result.status === "error") {
        setError(result.message ?? "Não foi possível cancelar a reserva.");
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-1">
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        trigger={
          <Button variant="outline" size="sm">
            Cancelar
          </Button>
        }
        title="Cancelar esta reserva?"
        description="Como administrador, você pode cancelar qualquer reserva ativa. Esta ação não pode ser desfeita."
        confirmLabel={pending ? "Cancelando..." : "Sim, cancelar"}
        cancelLabel="Voltar"
        destructive
        onConfirm={handleConfirm}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
