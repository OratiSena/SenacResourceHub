import { Ban, CheckCircle2, Clock, Users, Wrench, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type ResourceStatusValue =
  | "disponivel"
  | "reservado"
  | "manutencao"
  | "inativo"
  | "ativo"
  | "cancelado"
  | "compartilhado";

/**
 * Cor + ícone + texto para cada status: nunca depender só da cor para
 * comunicar o estado (Prompt 3, seção 12 — acessibilidade).
 */
const STATUS_CONFIG: Record<
  ResourceStatusValue,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  disponivel: {
    label: "Disponível",
    icon: CheckCircle2,
    className: "border-success/20 bg-success/10 text-success",
  },
  ativo: {
    label: "Ativa",
    icon: CheckCircle2,
    className: "border-success/20 bg-success/10 text-success",
  },
  reservado: {
    label: "Reservado",
    icon: Clock,
    className: "border-primary/20 bg-primary/10 text-primary",
  },
  manutencao: {
    label: "Manutenção",
    icon: Wrench,
    className: "border-warning/20 bg-warning/10 text-warning",
  },
  inativo: {
    label: "Inativo",
    icon: Ban,
    className: "border-muted-foreground/20 bg-muted text-muted-foreground",
  },
  cancelado: {
    label: "Cancelada",
    icon: XCircle,
    className: "border-destructive/20 bg-destructive/10 text-destructive",
  },
  compartilhado: {
    label: "Uso compartilhado",
    icon: Users,
    className: "border-info/20 bg-info/10 text-info",
  },
};

export function ResourceStatus({
  status,
  className,
}: {
  status: ResourceStatusValue;
  className?: string;
}) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn("gap-1 border font-medium", config.className, className)}
    >
      <Icon aria-hidden="true" />
      {config.label}
    </Badge>
  );
}
