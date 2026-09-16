import type { ResourceListItem } from "@/lib/data/resources";
import type { ResourceStatusValue } from "@/components/common/resource-status";

/**
 * Deriva o status visual do ResourceCard a partir dos dados reais — nunca a
 * partir de disponibilidade por horário (isso só existe a partir do
 * Prompt 7). "disponivel" aqui significa "tem ao menos uma unidade
 * operacional cadastrada", não "livre agora".
 */
export function getResourceCardStatus(
  resource: ResourceListItem,
): ResourceStatusValue {
  if (resource.isSharedSpace) return "compartilhado";
  return resource.units.operational > 0 ? "disponivel" : "manutencao";
}

export const SHARED_SPACE_NOTE = "Uso compartilhado · Agendamento orientado";

export const UNITS_LABEL = "operacionais";
