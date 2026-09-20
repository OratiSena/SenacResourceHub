"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";

import type { ReservationListItem } from "@/lib/data/reservations";
import {
  formatDataLocal,
  formatDuracaoEntre,
  formatHoraLocal,
  type ReservationDerivedStatus,
} from "@/lib/reservations/format";
import { CancelReservationButton } from "@/components/reservas/cancel-reservation-button";
import { ReservationDetailDialog } from "@/components/reservas/reservation-detail-dialog";
import { ReservationStatusBadge } from "@/components/reservas/reservation-status-badge";
import { ResourceMediaPlaceholder } from "@/components/common/resource-media-placeholder";
import { Button } from "@/components/ui/button";

export function ReservationCard({
  reservation,
  status,
  canCancel,
}: {
  reservation: ReservationListItem;
  status: ReservationDerivedStatus;
  canCancel: boolean;
}) {
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <div className="flex gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="size-16 shrink-0 overflow-hidden rounded-xl sm:size-20">
        <ResourceMediaPlaceholder
          tipo={reservation.resourceTipo}
          slug={reservation.resourceSlug}
          label={reservation.resourceNome}
        />
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-navy">{reservation.resourceNome}</p>
          <ReservationStatusBadge status={status} />
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span>{formatDataLocal(reservation.dataHoraInicio)}</span>
          <span>
            {formatHoraLocal(reservation.dataHoraInicio)} –{" "}
            {formatHoraLocal(reservation.dataHoraFim)}
          </span>
          <span>
            {formatDuracaoEntre(reservation.dataHoraInicio, reservation.dataHoraFim)}
          </span>
          {reservation.resourceLocal ? (
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              {reservation.resourceLocal}
            </span>
          ) : null}
          {!reservation.isSharedSpace && reservation.unitCodigo ? (
            <span className="font-mono text-xs">
              Unidade {reservation.unitCodigo}
            </span>
          ) : null}
        </div>

        <p className="truncate text-sm text-navy">{reservation.finalidade}</p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDetailOpen(true)}
          >
            Ver detalhes
          </Button>
          {status === "FUTURA" ? (
            <CancelReservationButton
              reservationId={reservation.id}
              resourceNome={reservation.resourceNome}
              dataHoraInicio={reservation.dataHoraInicio}
              dataHoraFim={reservation.dataHoraFim}
              canCancel={canCancel}
            />
          ) : null}
        </div>
      </div>

      <ReservationDetailDialog
        reservation={reservation}
        status={status}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
