import Link from "next/link";
import { CalendarClock } from "lucide-react";

import { getActiveResources } from "@/lib/data/resources";
import { RESOURCE_TYPE_LABELS } from "@/lib/resources/resource-types";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";

/**
 * Calendário global: em vez de reimplementar uma grade única cruzando todos
 * os recursos (que já têm regras de horário/duração diferentes entre si), a
 * escolha aqui é escolher o recurso e ir direto para o calendário dele
 * (/recursos/[slug]/calendario, onde a disponibilidade real é calculada) —
 * simples, real e sem inventar uma visão agregada que a base de dados não
 * suporta hoje.
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

      {resources.length === 0 ? (
        <EmptyState
          title="Nenhum recurso disponível no momento."
          description="Volte mais tarde ou fale com a coordenação do laboratório."
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <li
              key={resource.id}
              className="flex flex-col justify-between gap-3 rounded-2xl border border-border bg-card p-5"
            >
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  {RESOURCE_TYPE_LABELS[resource.tipo]}
                </p>
                <p className="mt-1 font-semibold text-navy">{resource.nome}</p>
                {resource.local ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {resource.local}
                  </p>
                ) : null}
              </div>
              <Button asChild size="sm" className="w-full">
                <Link href={`/recursos/${resource.slug}/calendario`}>
                  <CalendarClock aria-hidden="true" />
                  Ver disponibilidade
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
