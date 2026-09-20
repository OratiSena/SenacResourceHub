import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getResourceDetailBySlug } from "@/lib/data/resources";
import { getResourceBusyIntervals } from "@/lib/data/reservations";
import { computeAvailabilitySlots } from "@/lib/reservations/availability";
import {
  localDateTimeToISO,
  shiftLocalDate,
  todayLocalISODate,
} from "@/lib/reservations/format";
import { getResourceStatusFromCounts } from "@/lib/resources/resource-card-view";
import { PageHeader } from "@/components/common/page-header";
import { DateStrip } from "@/components/reservas/date-strip";
import { ResourceCalendarHeader } from "@/components/reservas/resource-calendar-header";
import { ReservationScheduler } from "@/components/reservas/reservation-scheduler";

export default async function ResourceCalendarioPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ data?: string }>;
}) {
  const { slug } = await params;
  const { data: dataParam } = await searchParams;
  const resource = await getResourceDetailBySlug(slug);

  if (!resource) {
    notFound();
  }

  const data = dataParam && /^\d{4}-\d{2}-\d{2}$/.test(dataParam)
    ? dataParam
    : todayLocalISODate();

  const operationalUnits = resource.units.filter(
    (u) => u.status === "disponivel",
  );
  const status = getResourceStatusFromCounts(
    resource.isSharedSpace,
    operationalUnits.length,
  );

  const semJanelaDiaria = !resource.horarioAbertura || !resource.horarioFechamento;
  const mode = resource.isSharedSpace
    ? "shared"
    : semJanelaDiaria
      ? "no-window"
      : "grid";

  let slots: ReturnType<typeof computeAvailabilitySlots> = [];
  let printerBusyIntervals: Awaited<ReturnType<typeof getResourceBusyIntervals>> = [];

  if (mode === "grid" && operationalUnits.length > 0) {
    const startISO = localDateTimeToISO(data, "00:00");
    const endISO = localDateTimeToISO(shiftLocalDate(data, 1), "00:00");
    const busyIntervals = await getResourceBusyIntervals(resource.id, startISO, endISO);
    slots = computeAvailabilitySlots({
      dataYYYYMMDD: data,
      horarioAbertura: resource.horarioAbertura,
      horarioFechamento: resource.horarioFechamento,
      operationalUnitIds: operationalUnits.map((u) => u.id),
      busyIntervals,
    });
  } else if (mode === "no-window" && operationalUnits.length > 0) {
    // Sem janela diária fixa: em vez de uma grade de horários (que não faria
    // sentido — o recurso não fecha), mostramos as próximas ocupações reais
    // num período mais largo (14 dias), para o usuário evitar conflitos sem
    // depender de uma grade "infinita".
    const startISO = localDateTimeToISO(data, "00:00");
    const endISO = localDateTimeToISO(shiftLocalDate(data, 14), "00:00");
    printerBusyIntervals = await getResourceBusyIntervals(resource.id, startISO, endISO);
  }

  const printerUnitCodigoById = Object.fromEntries(
    resource.units.map((u) => [u.id, u.codigo]),
  );

  return (
    <div className="space-y-6 pb-8">
      <Link
        href={`/recursos/${slug}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Voltar para {resource.nome}
      </Link>

      <PageHeader
        eyebrow="Calendário"
        title="Calendário e disponibilidade"
        description={
          resource.isSharedSpace
            ? "Uso compartilhado — múltiplas pessoas podem agendar o mesmo período."
            : "Escolha um horário livre e confirme os dados da sua reserva."
        }
      />

      <ResourceCalendarHeader
        slug={resource.slug}
        nome={resource.nome}
        tipo={resource.tipo}
        local={resource.local}
        status={status}
      />

      {mode === "grid" ? (
        <DateStrip data={data} baseHref={`/recursos/${slug}/calendario`} />
      ) : null}

      <ReservationScheduler
        mode={mode}
        resourceId={resource.id}
        resourceSlug={resource.slug}
        resourceNome={resource.nome}
        data={data}
        slots={slots}
        operationalUnitsTotal={operationalUnits.length}
        duracaoMaximaMinutos={resource.duracaoMaximaMinutos}
        antecedenciaMinimaMinutos={resource.antecedenciaMinimaMinutos}
        printerBusyIntervals={printerBusyIntervals}
        printerUnitCodigoById={printerUnitCodigoById}
      />
    </div>
  );
}
