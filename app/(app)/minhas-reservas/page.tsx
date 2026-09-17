import { getMyReservations } from "@/lib/data/reservations";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ReservationsList } from "@/components/reservas/reservations-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function MinhasReservasPage() {
  const reservations = await getMyReservations();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Minhas Reservas"
        title="Minhas Reservas"
        description="Acompanhe, filtre e cancele suas reservas."
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
        <ReservationsList reservations={reservations} />
      )}
    </div>
  );
}
