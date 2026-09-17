import type { ResourceListItem } from "@/lib/data/resources";
import type { ResourceStatusValue } from "@/components/common/resource-status";

/**
 * Deriva o status visual (ResourceCard, detalhe do recurso) a partir dos
 * dados reais — nunca a partir de disponibilidade por horário (isso só
 * existe a partir do Prompt 7). "disponivel" aqui significa "tem ao menos
 * uma unidade operacional cadastrada", não "livre agora".
 */
export function getResourceStatusFromCounts(
  isSharedSpace: boolean,
  operationalUnits: number,
): ResourceStatusValue {
  if (isSharedSpace) return "compartilhado";
  return operationalUnits > 0 ? "disponivel" : "manutencao";
}

export function getResourceCardStatus(
  resource: ResourceListItem,
): ResourceStatusValue {
  return getResourceStatusFromCounts(
    resource.isSharedSpace,
    resource.units.operational,
  );
}

export const SHARED_SPACE_NOTE = "Uso compartilhado · Agendamento orientado";

export const UNITS_LABEL = "operacionais";
