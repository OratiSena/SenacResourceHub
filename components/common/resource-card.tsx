import type { ReactNode } from "react";
import { Boxes } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  ResourceStatus,
  type ResourceStatusValue,
} from "@/components/common/resource-status";

interface ResourceCardProps {
  category: string;
  name: string;
  description?: string;
  totalUnits?: number;
  availableUnits?: number;
  status: ResourceStatusValue;
  /**
   * Área de mídia do recurso. Aceita qualquer ReactNode — uma <img>, um
   * carrossel, ou futuramente um <Canvas> do React Three Fiber (Prompt 6).
   * Sem valor, mostra um placeholder neutro. Nunca acoplar este card a uma
   * tag <img> fixa por causa disso.
   */
  media?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function ResourceCard({
  category,
  name,
  description,
  totalUnits,
  availableUnits,
  status,
  media,
  action,
  className,
}: ResourceCardProps) {
  const hasUnitInfo = typeof totalUnits === "number" && totalUnits > 0;
  const availabilityPercent = hasUnitInfo
    ? Math.round(((availableUnits ?? 0) / totalUnits!) * 100)
    : null;

  return (
    <Card className={cn("gap-0 py-0", className)}>
      <div className="flex aspect-4/3 items-center justify-center bg-muted">
        {media ?? (
          <Boxes className="size-10 text-muted-foreground/50" aria-hidden="true" />
        )}
      </div>

      <CardContent className="flex flex-1 flex-col gap-2 pt-4">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase">
            {category}
          </span>
          <ResourceStatus status={status} />
        </div>

        <h3 className="text-base font-semibold text-navy">{name}</h3>

        {description ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}

        {hasUnitInfo ? (
          <div className="mt-1 space-y-1">
            <p className="text-xs text-muted-foreground">
              {availableUnits} de {totalUnits} disponíveis
            </p>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-success"
                style={{ width: `${availabilityPercent}%` }}
              />
            </div>
          </div>
        ) : null}
      </CardContent>

      {action ? (
        <CardFooter className="bg-transparent px-4 pt-2 pb-4">
          {action}
        </CardFooter>
      ) : null}
    </Card>
  );
}
