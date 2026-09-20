import { getActiveResources } from "@/lib/data/resources";
import { PageHeader } from "@/components/common/page-header";
import { GlobalCalendarExplorer } from "@/components/reservas/global-calendar-explorer";

/**
 * Calendário global: escolher o recurso aqui e ir direto para o calendário
 * dele (/recursos/[slug]/calendario, onde a disponibilidade real por
 * horário é calculada) — nunca reimplementa essa lógica aqui, e nunca expõe
 * reservas de outras pessoas, só o recurso em si.
 */
export default async function CalendarioPage() {
  const resources = await getActiveResources();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Calendário"
        title="Calendário"
        description="Escolha um recurso para ver a disponibilidade e criar uma reserva."
      />

      <GlobalCalendarExplorer resources={resources} />
    </div>
  );
}
