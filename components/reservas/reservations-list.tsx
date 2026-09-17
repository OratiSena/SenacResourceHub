"use client";

import { useMemo, useState } from "react";

import type { ReservationListItem } from "@/lib/data/reservations";
import {
  deriveReservationStatus,
  formatDataLocal,
  formatHoraLocal,
  type ReservationDerivedStatus,
} from "@/lib/reservations/format";
import { CancelReservationButton } from "@/components/reservas/cancel-reservation-button";
import { ReservationStatusBadge } from "@/components/reservas/reservation-status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FilterKey = "todas" | "futuras" | "em_uso" | "historico" | "canceladas";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "futuras", label: "Futuras" },
  { key: "em_uso", label: "Em uso" },
  { key: "historico", label: "Histórico" },
  { key: "canceladas", label: "Canceladas" },
];

function matchesFilter(status: ReservationDerivedStatus, filter: FilterKey) {
  if (filter === "todas") return true;
  if (filter === "futuras") return status === "FUTURA";
  if (filter === "em_uso") return status === "EM_USO";
  if (filter === "historico") return status === "EXPIRADA";
  return status === "CANCELADA";
}

export function ReservationsList({
  reservations,
}: {
  reservations: ReservationListItem[];
}) {
  const [filter, setFilter] = useState<FilterKey>("todas");

  const withStatus = useMemo(
    () =>
      reservations.map((r) => ({
        reservation: r,
        status: deriveReservationStatus({
          status: r.status,
          data_hora_inicio: r.dataHoraInicio,
          data_hora_fim: r.dataHoraFim,
        }),
      })),
    [reservations],
  );

  const filtered = withStatus.filter((r) => matchesFilter(r.status, filter));

  return (
    <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterKey)}>
      <TabsList>
        {FILTERS.map((f) => (
          <TabsTrigger key={f.key} value={f.key}>
            {f.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={filter} className="mt-4 space-y-3">
        {filtered.length === 0 ? (
          <EmptyState
            title="Nenhuma reserva encontrada."
            description="Não há reservas nesta categoria."
          />
        ) : (
          filtered.map(({ reservation, status }) => (
            <div
              key={reservation.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-navy">
                    {reservation.resourceNome}
                  </p>
                  <ReservationStatusBadge status={status} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDataLocal(reservation.dataHoraInicio)} ·{" "}
                  {formatHoraLocal(reservation.dataHoraInicio)} –{" "}
                  {formatHoraLocal(reservation.dataHoraFim)}
                  {!reservation.isSharedSpace && reservation.unitCodigo
                    ? ` · Unidade ${reservation.unitCodigo}`
                    : reservation.isSharedSpace
                      ? " · Uso compartilhado"
                      : ""}
                </p>
                <p className="text-sm text-navy">{reservation.finalidade}</p>
                {reservation.observacoes ? (
                  <p className="text-xs text-muted-foreground">
                    {reservation.observacoes}
                  </p>
                ) : null}
              </div>

              {status === "FUTURA" ? (
                <CancelReservationButton reservationId={reservation.id} />
              ) : null}
            </div>
          ))
        )}
      </TabsContent>
    </Tabs>
  );
}
