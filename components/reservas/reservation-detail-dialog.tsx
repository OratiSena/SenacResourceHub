"use client";

import { MapPin } from "lucide-react";

import type { ReservationListItem } from "@/lib/data/reservations";
import {
  formatDataLocal,
  formatDuracaoEntre,
  formatHoraLocal,
  type ReservationDerivedStatus,
} from "@/lib/reservations/format";
import { ReservationStatusBadge } from "@/components/reservas/reservation-status-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ReservationDetailDialogProps {
  reservation: ReservationListItem;
  status: ReservationDerivedStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Detalhe completo de uma reserva (Prompt 8.1, seção A6) — Dialog em vez de
 * rota nova, reaproveitando os dados que a lista já carregou (nenhuma nova
 * consulta ao banco).
 */
export function ReservationDetailDialog({
  reservation,
  status,
  open,
  onOpenChange,
}: ReservationDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2 pr-6">
            <DialogTitle>{reservation.resourceNome}</DialogTitle>
            <ReservationStatusBadge status={status} />
          </div>
        </DialogHeader>

        <dl className="space-y-2.5 text-sm">
          {reservation.resourceLocal ? (
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Local</dt>
              <dd className="flex items-center gap-1 text-right font-medium text-navy">
                <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                {reservation.resourceLocal}
              </dd>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Data</dt>
            <dd className="font-medium text-navy">
              {formatDataLocal(reservation.dataHoraInicio)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Início</dt>
            <dd className="font-medium text-navy">
              {formatHoraLocal(reservation.dataHoraInicio)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Fim</dt>
            <dd className="font-medium text-navy">
              {formatHoraLocal(reservation.dataHoraFim)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Duração</dt>
            <dd className="font-medium text-navy">
              {formatDuracaoEntre(reservation.dataHoraInicio, reservation.dataHoraFim)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">
              {reservation.isSharedSpace ? "Uso" : "Unidade"}
            </dt>
            <dd className="font-medium text-navy">
              {reservation.isSharedSpace
                ? "Uso compartilhado"
                : (reservation.unitCodigo ?? "—")}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="shrink-0 text-muted-foreground">Finalidade</dt>
            <dd className="text-right font-medium text-navy">
              {reservation.finalidade}
            </dd>
          </div>
          {reservation.observacoes ? (
            <div className="flex items-start justify-between gap-4">
              <dt className="shrink-0 text-muted-foreground">Observações</dt>
              <dd className="text-right text-navy">{reservation.observacoes}</dd>
            </div>
          ) : null}
        </dl>
      </DialogContent>
    </Dialog>
  );
}
