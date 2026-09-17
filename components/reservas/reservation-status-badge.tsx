import { Ban, CalendarClock, CheckCircle2, History } from "lucide-react";

import type { ReservationDerivedStatus } from "@/lib/reservations/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const CONFIG: Record<
  ReservationDerivedStatus,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  FUTURA: {
    label: "Futura",
    icon: CalendarClock,
    className: "border-info/20 bg-info/10 text-info",
  },
  EM_USO: {
    label: "Em uso",
    icon: CheckCircle2,
    className: "border-success/20 bg-success/10 text-success",
  },
  EXPIRADA: {
    label: "Expirada",
    icon: History,
    className: "border-muted-foreground/20 bg-muted text-muted-foreground",
  },
  CANCELADA: {
    label: "Cancelada",
    icon: Ban,
    className: "border-destructive/20 bg-destructive/10 text-destructive",
  },
};

export function ReservationStatusBadge({
  status,
}: {
  status: ReservationDerivedStatus;
}) {
  const config = CONFIG[status];
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={cn("gap-1 border font-medium", config.className)}>
      <Icon aria-hidden="true" />
      {config.label}
    </Badge>
  );
}
