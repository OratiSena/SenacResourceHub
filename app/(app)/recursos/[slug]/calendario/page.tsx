import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

import { getResourceDetailBySlug } from "@/lib/data/resources";
import { getResourceBusyIntervals } from "@/lib/data/reservations";
import { computeAvailabilitySlots } from "@/lib/reservations/availability";
import { localDateTimeToISO, todayLocalISODate } from "@/lib/reservations/format";
import { PageHeader } from "@/components/common/page-header";
import { ReservationForm } from "@/components/reservas/reservation-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function shiftDate(dataYYYYMMDD: string, days: number): string {
  const [y, m, d] = dataYYYYMMDD.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

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
  const diaAnterior = shiftDate(data, -1);
  const proximoDia = shiftDate(data, 1);

  const operationalUnits = resource.units.filter(
    (u) => u.status === "disponivel",
  );

  let busyIntervals: Awaited<ReturnType<typeof getResourceBusyIntervals>> = [];
  if (!resource.isSharedSpace && operationalUnits.length > 0) {
    const startISO = localDateTimeToISO(data, "00:00");
    const endISO = localDateTimeToISO(shiftDate(data, 1), "00:00");
    busyIntervals = await getResourceBusyIntervals(resource.id, startISO, endISO);
  }

  const slots = resource.isSharedSpace
    ? []
    : computeAvailabilitySlots({
        dataYYYYMMDD: data,
        horarioAbertura: resource.horarioAbertura,
        horarioFechamento: resource.horarioFechamento,
        operationalUnitIds: operationalUnits.map((u) => u.id),
        busyIntervals,
      });

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
        eyebrow={resource.nome}
        title="Calendário e disponibilidade"
        description={
          resource.isSharedSpace
            ? "Uso compartilhado — múltiplas pessoas podem agendar o mesmo período."
            : "Escolha um horário livre e confirme os dados da sua reserva."
        }
      />

      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
        <Button asChild variant="ghost" size="sm">
          <Link href={`?data=${diaAnterior}`}>
            <ChevronLeft aria-hidden="true" />
            Dia anterior
          </Link>
        </Button>
        <span className="text-sm font-semibold text-navy">
          {new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
        <Button asChild variant="ghost" size="sm">
          <Link href={`?data=${proximoDia}`}>
            Próximo dia
            <ChevronRight aria-hidden="true" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-navy">Disponibilidade</h2>

          {resource.isSharedSpace ? (
            <div className="space-y-1 rounded-xl border border-info/20 bg-info/5 p-4">
              <p className="text-sm font-semibold text-info">Uso compartilhado</p>
              <p className="text-sm text-muted-foreground">
                Este espaço aceita múltiplos agendamentos no mesmo horário —
                não há verificação de exclusividade.
              </p>
            </div>
          ) : operationalUnits.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma unidade operacional cadastrada para este recurso no momento.
            </p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Este recurso não possui horário de funcionamento configurado.
            </p>
          ) : (
            <ul className="grid max-h-96 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
              {slots.map((slot) => (
                <li
                  key={slot.horaInicio}
                  className="flex items-center justify-between rounded-lg border border-border px-2.5 py-1.5 text-xs"
                >
                  <span className="font-medium text-navy">
                    {slot.horaInicio}
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      slot.unidadesLivres > 0
                        ? "border-success/20 bg-success/10 text-success"
                        : "border-destructive/20 bg-destructive/10 text-destructive"
                    }
                  >
                    {slot.unidadesLivres}/{operationalUnits.length}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-navy">Nova reserva</h2>
          <ReservationForm
            resourceId={resource.id}
            resourceSlug={resource.slug}
            data={data}
          />
        </section>
      </div>
    </div>
  );
}
