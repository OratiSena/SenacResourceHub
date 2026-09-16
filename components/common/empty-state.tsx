import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Inbox, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type EmptyStateTone = "neutral" | "error" | "success";

const TONE_CONFIG: Record<
  EmptyStateTone,
  { icon: LucideIcon; iconClassName: string }
> = {
  neutral: { icon: Inbox, iconClassName: "bg-muted text-muted-foreground" },
  error: { icon: AlertTriangle, iconClassName: "bg-destructive/10 text-destructive" },
  success: { icon: CheckCircle2, iconClassName: "bg-success/10 text-success" },
};

interface EmptyStateProps {
  tone?: EmptyStateTone;
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Bloco genérico de feedback: sem resultados, sem reservas, erro ao
 * carregar, ou confirmação de sucesso simples. Cobre os três estados
 * pedidos no Prompt 3 (empty/error/success) sem fragmentar em três
 * componentes quase idênticos.
 */
export function EmptyState({
  tone = "neutral",
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const config = TONE_CONFIG[tone];
  const Icon = icon ?? config.icon;

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-12 items-center justify-center rounded-full",
          config.iconClassName,
        )}
      >
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description ? (
          <p className="max-w-sm text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
