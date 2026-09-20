"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { cancelReservationAction } from "@/lib/actions/reservations";
import { formatDataLocal, formatHoraLocal } from "@/lib/reservations/format";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";

interface CancelReservationButtonProps {
  reservationId: string;
  resourceNome: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  /** Regra das 48h (ver cancel_reservation) — só um indicativo visual, o servidor continua sendo a autoridade. */
  canCancel: boolean;
}

export function CancelReservationButton({
  reservationId,
  resourceNome,
  dataHoraInicio,
  dataHoraFim,
  canCancel,
}: CancelReservationButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ status: "error" | "success"; message: string } | null>(null);
  const router = useRouter();

  function handleConfirm() {
    setResult(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("reservationId", reservationId);
      const actionResult = await cancelReservationAction(
        { status: "idle" },
        formData,
      );
      if (actionResult.status === "error") {
        setResult({
          status: "error",
          message: actionResult.message ?? "Não foi possível cancelar a reserva.",
        });
        return;
      }
      setResult({ status: "success", message: "Reserva cancelada com sucesso." });
      router.refresh();
    });
  }

  if (!canCancel) {
    return (
      <p className="text-xs text-muted-foreground">
        Cancelamento indisponível a menos de 48h do início.
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      <ConfirmDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setResult(null);
        }}
        trigger={
          <Button variant="outline" size="sm">
            Cancelar reserva
          </Button>
        }
        title="Cancelar reserva?"
        description={`${resourceNome} · ${formatDataLocal(dataHoraInicio)} · ${formatHoraLocal(dataHoraInicio)}–${formatHoraLocal(dataHoraFim)}. Esta ação manterá a reserva no histórico como cancelada.`}
        confirmLabel={pending ? "Cancelando..." : "Confirmar cancelamento"}
        cancelLabel="Voltar"
        destructive
        onConfirm={handleConfirm}
      />
      {result ? (
        <Alert
          variant={result.status === "error" ? "destructive" : "default"}
          className={
            result.status === "success" ? "border-success/20 bg-success/5" : undefined
          }
        >
          <AlertDescription
            className={result.status === "success" ? "text-success" : undefined}
          >
            {result.message}
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
