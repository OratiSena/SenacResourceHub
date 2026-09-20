import Link from "next/link";

import { getMyReservations } from "@/lib/data/reservations";
import { deriveReservationStatus } from "@/lib/reservations/format";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { MetricCard } from "@/components/common/metric-card";
import { ReservationsList } from "@/components/reservas/reservations-list";
import { Button } from "@/components/ui/button";
import { CalendarClock, CheckCircle2, History } from "lucide-react";

export default async function MinhasReservasPage() {
  const reservations = await getMyReservations();

  const counts = reservations.reduce(
    (acc, r) => {
      const status = deriveReservationStatus({
        status: r.status,
        data_hora_inicio: r.dataHoraInicio,
        data_hora_fim: r.dataHoraFim,
      });
      if (status === "FUTURA") acc.futuras += 1;
      if (status === "EM_USO") acc.emUso += 1;
      if (status === "EXPIRADA") acc.historico += 1;
      return acc;
    },
    { futuras: 0, emUso: 0, historico: 0 },
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Minhas Reservas"
        title="Minhas Reservas"
        description="Acompanhe seus agendamentos, consulte detalhes e gerencie suas reservas."
      />

      {reservations.length === 0 ? (
        <EmptyState
          title="Você ainda não possui reservas."
          description="Explore o catálogo e escolha um recurso para começar."
          action={
            <Button asChild size="sm">
              <Link href="/recursos">Explorar recursos</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard icon={CalendarClock} label="Reservas futuras" value={counts.futuras} />
            <MetricCard icon={CheckCircle2} label="Em uso" value={counts.emUso} />
            <MetricCard icon={History} label="Histórico" value={counts.historico} />
          </div>

          <ReservationsList reservations={reservations} />
        </>
      )}
    </div>
  );
}
