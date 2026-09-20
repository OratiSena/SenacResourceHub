import { MapPin } from "lucide-react";

import type { ResourceType } from "@/lib/resources/resource-types";
import { RESOURCE_TYPE_LABELS } from "@/lib/resources/resource-types";
import { ResourceMediaPlaceholder } from "@/components/common/resource-media-placeholder";
import { ResourceStatus, type ResourceStatusValue } from "@/components/common/resource-status";

interface ResourceCalendarHeaderProps {
  slug: string;
  nome: string;
  tipo: ResourceType;
  local: string | null;
  status: ResourceStatusValue;
}

/**
 * Cabeçalho compacto do calendário do recurso: miniatura + nome + local +
 * tipo + status — para o usuário confirmar rapidamente que está no recurso
 * certo antes de escolher data/horário. Reaproveita ResourceMediaPlaceholder
 * (mesma mídia dos cards) e ResourceStatus (Prompt 3) — nenhuma lógica nova.
 */
export function ResourceCalendarHeader({
  slug,
  nome,
  tipo,
  local,
  status,
}: ResourceCalendarHeaderProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
      <div className="size-16 shrink-0 overflow-hidden rounded-xl sm:size-20">
        <ResourceMediaPlaceholder tipo={tipo} slug={slug} label={nome} />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-semibold text-navy">{nome}</h2>
          <ResourceStatus status={status} />
        </div>
        <p className="text-xs font-medium text-muted-foreground uppercase">
          {RESOURCE_TYPE_LABELS[tipo]}
        </p>
        {local ? (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            {local}
          </p>
        ) : null}
      </div>
    </div>
  );
}
