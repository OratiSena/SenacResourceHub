import { RESOURCE_ILLUSTRATIONS } from "@/components/common/resource-illustrations";
import { RESOURCE_TYPE_ICONS, type ResourceType } from "@/lib/resources/resource-types";

interface ResourceMediaPlaceholderProps {
  tipo: ResourceType;
  /** Slug do recurso — usado para escolher a ilustração específica. */
  slug?: string;
  /** Nome do recurso, para o aria-label. */
  label?: string;
}

/**
 * Mídia usada enquanto o recurso não tem foto cadastrada (todo o catálogo,
 * nesta etapa — `resources.imagens` está vazio para os 9 recursos semente).
 * Prioriza uma ilustração própria por recurso (Prompt 6.1); se o slug não
 * tiver uma cadastrada em RESOURCE_ILLUSTRATIONS, cai no ícone genérico por
 * tipo (Prompt 5) — esse é o fallback visual caso um recurso novo ainda não
 * tenha ilustração própria. Substituído por imagem real ou pelo preview 3D
 * (Prompt 6) quando existirem.
 */
export function ResourceMediaPlaceholder({
  tipo,
  slug,
  label,
}: ResourceMediaPlaceholderProps) {
  const Illustration = slug ? RESOURCE_ILLUSTRATIONS[slug] : undefined;
  const Icon = RESOURCE_TYPE_ICONS[tipo];

  return (
    <div
      className="flex size-full items-center justify-center bg-gradient-to-br from-primary/15 via-primary/5 to-navy/10 p-4"
      role="img"
      aria-label={label ? `Ilustração de ${label}` : "Ilustração do recurso"}
    >
      {Illustration ? (
        <Illustration />
      ) : (
        <Icon className="size-12 text-primary/60" aria-hidden="true" />
      )}
    </div>
  );
}
