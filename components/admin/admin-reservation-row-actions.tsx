"use client";

import { useState } from "react";

import type { AdminReservationItem } from "@/lib/data/admin";
import { AdminCancelReservationButton } from "@/components/admin/admin-cancel-reservation-button";
import { AdminReservationDetailDialog } from "@/components/admin/admin-reservation-detail-dialog";
import { Button } from "@/components/ui/button";

export function AdminReservationRowActions({
  reservation,
}: {
  reservation: AdminReservationItem;
}) {
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button variant="outline" size="sm" onClick={() => setDetailOpen(true)}>
        Ver detalhes
      </Button>
      {reservation.status === "ATIVA" ? (
        <AdminCancelReservationButton
          reservationId={reservation.id}
          usuarioNome={reservation.usuarioNome}
          resourceNome={reservation.resourceNome}
          dataHoraInicio={reservation.dataHoraInicio}
          dataHoraFim={reservation.dataHoraFim}
        />
      ) : null}
      <AdminReservationDetailDialog
        reservation={reservation}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
