import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
}

/**
 * Card de resumo numérico para dashboards (ex.: "Total de recursos: 34").
 * Deliberadamente simples — o Prompt 3 pede para não encher a tela de cards
 * decorativos, então esta variante fica reservada a números que já existem
 * de verdade no domínio, não métricas inventadas.
 */
export function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("gap-3", className)}>
      <CardContent className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">
            {label}
          </p>
          <p className="text-xl font-bold text-navy">{value}</p>
          {hint ? (
            <p className="truncate text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
