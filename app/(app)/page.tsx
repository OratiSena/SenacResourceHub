import Link from "next/link";
import { Boxes, CalendarDays, CheckCircle2, Compass, Tags } from "lucide-react";

import { getCurrentProfile } from "@/lib/auth/current-profile";
import { getActiveResources } from "@/lib/data/resources";
import {
  getResourceCardStatus,
  SHARED_SPACE_NOTE,
  UNITS_LABEL,
} from "@/lib/resources/resource-card-view";
import { RESOURCE_TYPE_LABELS } from "@/lib/resources/resource-types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { MetricCard } from "@/components/common/metric-card";
import { PageHeader } from "@/components/common/page-header";
import { ResourceCard } from "@/components/common/resource-card";
import { ResourceMediaPlaceholder } from "@/components/common/resource-media-placeholder";

const DESTAQUES_LIMIT = 4;

function getSaudacao() {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

/**
 * Home autenticada real (Prompt 5). Diferente de /recursos: aqui é resumo +
 * atalhos, não catálogo completo. Nenhum número é inventado — tudo vem de
 * `resources`/`resource_units` reais; sem reservas implementadas ainda, o
 * espaço para elas mostra um empty state honesto em vez de dados fictícios.
 */
export default async function HomePage() {
  const [profile, resources] = await Promise.all([
    getCurrentProfile(),
    getActiveResources(),
  ]);

  const primeiroNome = profile?.nome.split(" ")[0] ?? "";
  const totalOperationalUnits = resources.reduce(
    (sum, r) => sum + r.units.operational,
    0,
  );
  const categoriasCount = new Set(resources.map((r) => r.tipo)).size;
  const destaques = resources.slice(0, DESTAQUES_LIMIT);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Home"
        title={`${getSaudacao()}, ${primeiroNome}`}
        description="O que você precisa reservar hoje?"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          icon={Boxes}
          label="Recursos cadastrados"
          value={resources.length}
        />
        <MetricCard icon={Tags} label="Categorias" value={categoriasCount} />
        <MetricCard
          icon={CheckCircle2}
          label="Unidades físicas operacionais"
          value={totalOperationalUnits}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/recursos">
            <Compass />
            Explorar recursos
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/calendario">
            <CalendarDays />
            Ver calendário
          </Link>
        </Button>
      </div>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-navy">
              Recursos em destaque
            </h2>
            <p className="text-sm text-muted-foreground">
              Navegue pelas categorias e encontre o que você precisa.
            </p>
          </div>
          <Link
            href="/recursos"
            className="shrink-0 text-sm font-medium text-primary hover:underline"
          >
            Ver todos os recursos
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {destaques.map((resource) => (
            <ResourceCard
              key={resource.id}
              category={RESOURCE_TYPE_LABELS[resource.tipo]}
              name={resource.nome}
              description={resource.descricao ?? undefined}
              totalUnits={resource.isSharedSpace ? undefined : resource.units.total}
              availableUnits={
                resource.isSharedSpace ? undefined : resource.units.operational
              }
              unitsLabel={UNITS_LABEL}
              status={getResourceCardStatus(resource)}
              sharedSpaceNote={
                resource.isSharedSpace ? SHARED_SPACE_NOTE : undefined
              }
              media={<ResourceMediaPlaceholder tipo={resource.tipo} />}
              action={
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link href={`/recursos/${resource.slug}`}>
                    Ver detalhes
                  </Link>
                </Button>
              }
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-navy">Minhas reservas</h2>
        <EmptyState
          title="Você ainda não possui reservas."
          description="Explore o catálogo e escolha um recurso para começar."
          action={
            <Button asChild size="sm">
              <Link href="/recursos">Explorar recursos</Link>
            </Button>
          }
        />
      </section>
    </div>
  );
}
