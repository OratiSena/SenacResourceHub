"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarClock, Search } from "lucide-react";

import type { ResourceListItem } from "@/lib/data/resources";
import { getResourceCardStatus } from "@/lib/resources/resource-card-view";
import {
  RESOURCE_TYPE_FILTER_ORDER,
  RESOURCE_TYPE_LABELS,
  RESOURCE_TYPE_ICONS,
  type ResourceType,
} from "@/lib/resources/resource-types";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/common/empty-state";
import { ResourceMediaPlaceholder } from "@/components/common/resource-media-placeholder";
import { ResourceStatus } from "@/components/common/resource-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TipoFilter = "todos" | ResourceType;

function matchesSearch(resource: ResourceListItem, term: string) {
  if (!term) return true;
  const haystack = [
    resource.nome,
    resource.descricao ?? "",
    RESOURCE_TYPE_LABELS[resource.tipo],
    resource.local ?? "",
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(term);
}

/**
 * Explorador do calendário global: coluna esquerda com busca/filtro/lista
 * compacta de recursos, área principal com o recurso selecionado em
 * destaque + atalho para o calendário real dele (onde a disponibilidade por
 * horário de fato é calculada — ver /recursos/[slug]/calendario). Não
 * duplica a lógica de disponibilidade aqui: esta tela é só um seletor
 * visual, nunca mostra dados de reservas de outras pessoas.
 */
export function GlobalCalendarExplorer({
  resources,
}: {
  resources: ResourceListItem[];
}) {
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState<TipoFilter>("todos");
  const [selectedId, setSelectedId] = useState(resources[0]?.id ?? null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return resources.filter((resource) => {
      if (tipoFilter !== "todos" && resource.tipo !== tipoFilter) return false;
      return matchesSearch(resource, term);
    });
  }, [resources, search, tipoFilter]);

  const selected =
    filtered.find((r) => r.id === selectedId) ?? filtered[0] ?? null;

  if (resources.length === 0) {
    return (
      <EmptyState
        title="Nenhum recurso disponível no momento."
        description="Volte mais tarde ou fale com a coordenação do laboratório."
      />
    );
  }

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-[320px_1fr] lg:items-start">
      {/* Coluna esquerda: filtro + lista compacta */}
      <div className="min-w-0 space-y-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar recurso..."
            className="pl-9"
            aria-label="Buscar recursos"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Button
            size="xs"
            variant={tipoFilter === "todos" ? "default" : "outline"}
            onClick={() => setTipoFilter("todos")}
          >
            Todos
          </Button>
          {RESOURCE_TYPE_FILTER_ORDER.map((tipo) => (
            <Button
              key={tipo}
              size="xs"
              variant={tipoFilter === tipo ? "default" : "outline"}
              onClick={() => setTipoFilter(tipo)}
            >
              {RESOURCE_TYPE_LABELS[tipo]}
            </Button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            Nenhum recurso encontrado com esse filtro.
          </p>
        ) : (
          <ul className="max-h-[28rem] space-y-1.5 overflow-y-auto rounded-2xl border border-border bg-card p-1.5 lg:max-h-[36rem]">
            {filtered.map((resource) => {
              const Icon = RESOURCE_TYPE_ICONS[resource.tipo];
              const isSelected = selected?.id === resource.id;
              return (
                <li key={resource.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(resource.id)}
                    aria-pressed={isSelected}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 shrink-0",
                        isSelected ? "text-primary-foreground" : "text-primary/70",
                      )}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {resource.nome}
                      </p>
                      <p
                        className={cn(
                          "truncate text-xs",
                          isSelected
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground",
                        )}
                      >
                        {RESOURCE_TYPE_LABELS[resource.tipo]}
                        {resource.local ? ` · ${resource.local}` : ""}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Área principal: recurso selecionado em destaque */}
      {selected ? (
        <div className="min-w-0 space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="grid gap-5 sm:grid-cols-[160px_1fr]">
            <div className="aspect-4/3 overflow-hidden rounded-xl border border-border sm:aspect-square">
              <ResourceMediaPlaceholder
                tipo={selected.tipo}
                slug={selected.slug}
                label={selected.nome}
              />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <ResourceStatus status={getResourceCardStatus(selected)} />
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  {RESOURCE_TYPE_LABELS[selected.tipo]}
                </span>
              </div>
              <h2 className="text-xl font-bold text-navy">{selected.nome}</h2>
              {selected.local ? (
                <p className="text-sm text-muted-foreground">{selected.local}</p>
              ) : null}
              {selected.descricao ? (
                <p className="text-sm text-muted-foreground">
                  {selected.descricao}
                </p>
              ) : null}
              <p className="text-sm font-medium text-navy">
                {selected.isSharedSpace
                  ? "Uso compartilhado · agendamento orientado"
                  : `${selected.units.operational} de ${selected.units.total} unidades operacionais`}
              </p>
            </div>
          </div>

          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href={`/recursos/${selected.slug}/calendario`}>
              <CalendarClock aria-hidden="true" />
              Ver disponibilidade
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
