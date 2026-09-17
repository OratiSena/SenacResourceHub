import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, Clock, MapPin, ShieldCheck } from "lucide-react";

import { getResourceDetailBySlug } from "@/lib/data/resources";
import { formatDuracaoMinutos, formatHorario } from "@/lib/resources/format";
import { getResourceStatusFromCounts } from "@/lib/resources/resource-card-view";
import {
  RESOURCE_TYPE_ICONS,
  RESOURCE_TYPE_LABELS,
} from "@/lib/resources/resource-types";
import { getResource3DModel } from "@/components/3d/models/registry";
import { Resource3DViewerLoader } from "@/components/3d/resource-3d-viewer-loader";
import { ResourceMediaPlaceholder } from "@/components/common/resource-media-placeholder";
import { ResourceStatus } from "@/components/common/resource-status";
import { UnitStatusBadge } from "@/components/recursos/unit-status-badge";
import { Button } from "@/components/ui/button";

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resource = await getResourceDetailBySlug(slug);

  if (!resource) {
    notFound();
  }

  const operationalCount = resource.units.filter(
    (u) => u.status === "disponivel",
  ).length;
  const status = getResourceStatusFromCounts(
    resource.isSharedSpace,
    operationalCount,
  );
  const CategoryIcon = RESOURCE_TYPE_ICONS[resource.tipo];
  const has3D = Boolean(getResource3DModel(resource.slug));

  const ctaLabel = resource.isSharedSpace
    ? "Agendar uso orientado"
    : "Ver disponibilidade";

  const temHorario = resource.horarioAbertura && resource.horarioFechamento;
  const temDuracaoMaxima = resource.duracaoMaximaMinutos != null;
  const temAntecedencia = resource.antecedenciaMinimaMinutos > 0;
  const temInformacoesAgendamento =
    temHorario || temDuracaoMaxima || temAntecedencia;
  const temOrientacoes =
    resource.orientacoesSeguranca != null &&
    resource.orientacoesSeguranca.length > 0;

  return (
    <div className="space-y-8 pb-8">
      <Link
        href="/recursos"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Voltar para Recursos
      </Link>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="aspect-4/3 overflow-hidden rounded-2xl border border-border lg:aspect-auto">
          {has3D ? (
            <Resource3DViewerLoader slug={resource.slug} label={resource.nome} />
          ) : (
            <ResourceMediaPlaceholder tipo={resource.tipo} />
          )}
        </div>

        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <ResourceStatus status={status} />
            <span className="text-xs font-medium text-muted-foreground uppercase">
              {RESOURCE_TYPE_LABELS[resource.tipo]}
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-navy sm:text-3xl">
              {resource.nome}
            </h1>
            {resource.descricao ? (
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                {resource.descricao}
              </p>
            ) : null}
          </div>

          {resource.local ? (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              {resource.local}
            </p>
          ) : null}

          {resource.isSharedSpace ? (
            <div className="space-y-1 rounded-xl border border-info/20 bg-info/5 p-4">
              <p className="text-sm font-semibold text-info">
                Uso compartilhado
              </p>
              <p className="text-sm text-muted-foreground">
                Agendamento orientado, sem exclusividade de horário — mais de
                uma pessoa pode usar o espaço no mesmo período. Apoio técnico
                disponível no local.
              </p>
            </div>
          ) : resource.units.length === 1 ? (
            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <CategoryIcon
                  className="size-5 text-primary"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-medium text-navy">
                    1 unidade cadastrada
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {resource.units[0].codigo}
                  </p>
                </div>
              </div>
              <UnitStatusBadge status={resource.units[0].status} />
            </div>
          ) : resource.units.length > 1 ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Total de unidades
                </p>
                <p className="text-xl font-bold text-navy">
                  {resource.units.length}
                </p>
              </div>
              <div className="rounded-xl border border-success/20 bg-success/5 p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Operacionais
                </p>
                <p className="text-xl font-bold text-success">
                  {operationalCount}
                </p>
              </div>
            </div>
          ) : null}

          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href={`/recursos/${resource.slug}/calendario`}>
              <CalendarClock aria-hidden="true" />
              {ctaLabel}
            </Link>
          </Button>
        </div>
      </div>

      {temInformacoesAgendamento ? (
        <section className="space-y-3 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-navy">
            Informações de agendamento
          </h2>
          <dl className="grid gap-4 sm:grid-cols-3">
            {temHorario ? (
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Horário de funcionamento
                  </dt>
                  <dd className="text-sm font-medium text-navy">
                    {formatHorario(resource.horarioAbertura!)} –{" "}
                    {formatHorario(resource.horarioFechamento!)}
                  </dd>
                </div>
              </div>
            ) : null}
            {temDuracaoMaxima ? (
              <div className="flex items-start gap-2">
                <CalendarClock
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Duração máxima por reserva
                  </dt>
                  <dd className="text-sm font-medium text-navy">
                    {formatDuracaoMinutos(resource.duracaoMaximaMinutos!)}
                  </dd>
                </div>
              </div>
            ) : null}
            {temAntecedencia ? (
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Antecedência mínima
                  </dt>
                  <dd className="text-sm font-medium text-navy">
                    {formatDuracaoMinutos(resource.antecedenciaMinimaMinutos)}
                  </dd>
                </div>
              </div>
            ) : null}
          </dl>
        </section>
      ) : null}

      {resource.units.length > 1 ? (
        <section className="space-y-3 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-navy">
            Unidades físicas
          </h2>
          <p className="text-sm text-muted-foreground">
            &ldquo;Operacional&rdquo; indica que a unidade está apta a uso — a
            disponibilidade para um horário específico é calculada na etapa
            de reserva.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {resource.units.map((unit) => (
              <li
                key={unit.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
              >
                <span className="font-mono font-medium text-navy">
                  {unit.codigo}
                </span>
                <UnitStatusBadge status={unit.status} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {temOrientacoes ? (
        <section className="space-y-3 rounded-2xl border border-border bg-card p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-navy">
            <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
            Antes de utilizar o espaço
          </h2>
          <ul className="space-y-2">
            {resource.orientacoesSeguranca!.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
