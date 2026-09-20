"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { ReservationListItem } from "@/lib/data/reservations";
import {
  deriveReservationStatus,
  type ReservationDerivedStatus,
} from "@/lib/reservations/format";
import { ReservationCard } from "@/components/reservas/reservation-card";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FilterKey = "todas" | "futuras" | "em_uso" | "historico" | "canceladas";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "futuras", label: "Futuras" },
  { key: "em_uso", label: "Em uso" },
  { key: "historico", label: "Histórico" },
  { key: "canceladas", label: "Canceladas" },
];

const EMPTY_COPY: Record<FilterKey, { title: string; description: string }> = {
  todas: {
    title: "Você ainda não possui reservas.",
    description: "Explore o catálogo e escolha um recurso para começar.",
  },
  futuras: {
    title: "Você ainda não possui reservas futuras.",
    description: "Escolha um recurso e um horário no calendário.",
  },
  em_uso: {
    title: "Nenhuma reserva em uso agora.",
    description: "Reservas em andamento aparecem aqui automaticamente.",
  },
  historico: {
    title: "Seu histórico está vazio.",
    description: "Reservas já encerradas aparecerão aqui.",
  },
  canceladas: {
    title: "Nenhuma reserva cancelada.",
    description: "Reservas que você cancelar ficam registradas aqui.",
  },
};

const TAB_TRIGGER_CLASS =
  "data-active:bg-primary data-active:text-primary-foreground data-active:shadow-none";

function matchesFilter(status: ReservationDerivedStatus, filter: FilterKey) {
  if (filter === "todas") return true;
  if (filter === "futuras") return status === "FUTURA";
  if (filter === "em_uso") return status === "EM_USO";
  if (filter === "historico") return status === "EXPIRADA";
  return status === "CANCELADA";
}

const QUARENTA_OITO_HORAS_MS = 48 * 60 * 60 * 1000;

export function ReservationsList({
  reservations,
}: {
  reservations: ReservationListItem[];
}) {
  const [filter, setFilter] = useState<FilterKey>("todas");

  // Capturado uma única vez (não a cada render) para não violar a regra de
  // pureza do React — só usado para o indicativo visual da janela de 48h;
  // cancel_reservation continua sendo a autoridade real no servidor.
  const [now] = useState(() => Date.now());

  const withStatus = useMemo(
    () =>
      reservations.map((r) => ({
        reservation: r,
        status: deriveReservationStatus({
          status: r.status,
          data_hora_inicio: r.dataHoraInicio,
          data_hora_fim: r.dataHoraFim,
        }),
        canCancel:
          new Date(r.dataHoraInicio).getTime() - now >= QUARENTA_OITO_HORAS_MS,
      })),
    [reservations, now],
  );

  const filtered = withStatus.filter((r) => matchesFilter(r.status, filter));
  const emptyCopy = EMPTY_COPY[filter];

  return (
    <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterKey)}>
      <TabsList className="h-auto flex-wrap gap-1 bg-muted/70 p-1">
        {FILTERS.map((f) => (
          <TabsTrigger key={f.key} value={f.key} className={TAB_TRIGGER_CLASS}>
            {f.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={filter} className="mt-4 space-y-3">
        {filtered.length === 0 ? (
          <EmptyState
            title={emptyCopy.title}
            description={emptyCopy.description}
            action={
              filter === "todas" || filter === "futuras" ? (
                <Button asChild size="sm">
                  <Link href="/recursos">Explorar recursos</Link>
                </Button>
              ) : undefined
            }
          />
        ) : (
          filtered.map(({ reservation, status, canCancel }) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              status={status}
              canCancel={canCancel}
            />
          ))
        )}
      </TabsContent>
    </Tabs>
  );
}
