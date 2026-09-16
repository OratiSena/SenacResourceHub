"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import type { ResourceListItem } from "@/lib/data/resources";
import {
  getResourceCardStatus,
  SHARED_SPACE_NOTE,
  UNITS_LABEL,
} from "@/lib/resources/resource-card-view";
import {
  RESOURCE_TYPE_FILTER_ORDER,
  RESOURCE_TYPE_LABELS,
  type ResourceType,
} from "@/lib/resources/resource-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/common/empty-state";
import { ResourceCard } from "@/components/common/resource-card";
import { ResourceMediaPlaceholder } from "@/components/common/resource-media-placeholder";

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

export function ResourceCatalog({
  resources,
}: {
  resources: ResourceListItem[];
}) {
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState<TipoFilter>("todos");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return resources.filter((resource) => {
      if (tipoFilter !== "todos" && resource.tipo !== tipoFilter) return false;
      return matchesSearch(resource, term);
    });
  }, [resources, search, tipoFilter]);

  const hasActiveFilters = search.trim() !== "" || tipoFilter !== "todos";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={tipoFilter === "todos" ? "default" : "outline"}
          onClick={() => setTipoFilter("todos")}
        >
          Todos
        </Button>
        {RESOURCE_TYPE_FILTER_ORDER.map((tipo) => (
          <Button
            key={tipo}
            size="sm"
            variant={tipoFilter === tipo ? "default" : "outline"}
            onClick={() => setTipoFilter(tipo)}
          >
            {RESOURCE_TYPE_LABELS[tipo]}
          </Button>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nome, descrição, tipo ou local..."
          className="pl-9"
          aria-label="Buscar recursos"
        />
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length}{" "}
        {filtered.length === 1 ? "recurso encontrado" : "recursos encontrados"}
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhum recurso encontrado"
          description="Tente ajustar a busca ou escolher outro filtro."
          action={
            hasActiveFilters ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setTipoFilter("todos");
                }}
              >
                Limpar filtros
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((resource) => (
            <ResourceCard
              key={resource.id}
              category={RESOURCE_TYPE_LABELS[resource.tipo]}
              name={resource.nome}
              description={resource.descricao ?? undefined}
              location={resource.local ?? undefined}
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
      )}
    </div>
  );
}
