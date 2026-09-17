import { Ban, CheckCircle2, Wrench } from "lucide-react";

import type { UnitStatus } from "@/lib/data/resources";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

/**
 * Badge específico para o status administrativo de uma resource_unit —
 * separado do ResourceStatus (que é sobre o recurso/reserva como um todo).
 * "disponivel" aqui aparece como "Operacional", nunca "Disponível", para não
 * insinuar que a unidade está livre num horário específico (Prompt 6,
 * seção 3) — isso só existe a partir do Prompt 7.
 */
const CONFIG: Record<
  UnitStatus,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  disponivel: {
    label: "Operacional",
    icon: CheckCircle2,
    className: "border-success/20 bg-success/10 text-success",
  },
  manutencao: {
    label: "Manutenção",
    icon: Wrench,
    className: "border-warning/20 bg-warning/10 text-warning",
  },
  inativa: {
    label: "Inativa",
    icon: Ban,
    className: "border-muted-foreground/20 bg-muted text-muted-foreground",
  },
};

export function UnitStatusBadge({ status }: { status: UnitStatus }) {
  const config = CONFIG[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("gap-1 border font-medium", config.className)}>
      <Icon aria-hidden="true" />
      {config.label}
    </Badge>
  );
}
