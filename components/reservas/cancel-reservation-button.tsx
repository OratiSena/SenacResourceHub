"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { cancelReservationAction } from "@/lib/actions/reservations";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";

export function CancelReservationButton({
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
      const formData = new FormData();
      formData.set("reservationId", reservationId);
      const result = await cancelReservationAction(
        { status: "idle" },
        formData,
      );
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
            Cancelar reserva
          </Button>
        }
        title="Cancelar esta reserva?"
        description="Esta ação não pode ser desfeita. A reserva ficará registrada no seu histórico como cancelada."
        confirmLabel={pending ? "Cancelando..." : "Sim, cancelar"}
        cancelLabel="Voltar"
        destructive
        onConfirm={handleConfirm}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
