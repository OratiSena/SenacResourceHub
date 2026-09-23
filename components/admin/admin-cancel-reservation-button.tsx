"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { adminCancelReservationAction } from "@/lib/actions/admin";
import { formatDataLocal, formatHoraLocal } from "@/lib/reservations/format";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";

interface AdminCancelReservationButtonProps {
  reservationId: string;
  usuarioNome: string;
  resourceNome: string;
  dataHoraInicio: string;
  dataHoraFim: string;
}

export function AdminCancelReservationButton({
  reservationId,
  usuarioNome,
  resourceNome,
  dataHoraInicio,
  dataHoraFim,
}: AdminCancelReservationButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ status: "error" | "success"; message: string } | null>(null);
  const router = useRouter();

  function handleConfirm() {
    setResult(null);
    startTransition(async () => {
      const actionResult = await adminCancelReservationAction(reservationId);
      if (actionResult.status === "error") {
        setResult({
          status: "error",
          message: actionResult.message ?? "Não foi possível cancelar a reserva.",
        });
        return;
      }
      setResult({ status: "success", message: "Reserva cancelada com sucesso." });
      setOpen(false);
      router.refresh();
    });
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
            Cancelar
          </Button>
        }
        title="Cancelar reserva?"
        description={`${usuarioNome} · ${resourceNome} · ${formatDataLocal(dataHoraInicio)} · ${formatHoraLocal(dataHoraInicio)}–${formatHoraLocal(dataHoraFim)}. Como administrador, você pode cancelar qualquer reserva ativa — a reserva permanece no histórico como cancelada.`}
        confirmLabel={pending ? "Cancelando..." : "Sim, cancelar"}
        cancelLabel="Voltar"
        destructive
        onConfirm={handleConfirm}
      />
      {result ? (
        <Alert
          variant={result.status === "error" ? "destructive" : "default"}
          className={result.status === "success" ? "border-success/20 bg-success/5" : undefined}
        >
          <AlertDescription className={result.status === "success" ? "text-success" : undefined}>
            {result.message}
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
