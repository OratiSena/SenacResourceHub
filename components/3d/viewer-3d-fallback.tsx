import { Boxes, Loader2 } from "lucide-react";

export type Viewer3DFallbackReason = "loading" | "unsupported" | "erro";

const MESSAGES: Record<Viewer3DFallbackReason, string> = {
  loading: "Carregando visualização 3D...",
  unsupported: "Visualização 3D não é suportada neste navegador ou dispositivo.",
  erro: "Não foi possível carregar a visualização 3D.",
};

/**
 * Estado visual único para os três jeitos de o 3D "não estar disponível
 * agora" (Prompt 6, seção 11): ainda carregando, sem suporte a WebGL, ou
 * erro. Nunca deixa a área de mídia em branco/quebrada.
 */
export function Viewer3DFallback({
  label,
  reason,
}: {
  label: string;
  reason: Viewer3DFallbackReason;
}) {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/15 via-primary/5 to-navy/10 p-6 text-center">
      {reason === "loading" ? (
        <Loader2 className="size-10 animate-spin text-primary/60" aria-hidden="true" />
      ) : (
        <Boxes className="size-10 text-primary/50" aria-hidden="true" />
      )}
      {label ? <p className="text-sm font-medium text-navy">{label}</p> : null}
      <p className="text-xs text-muted-foreground">{MESSAGES[reason]}</p>
    </div>
  );
}
