import Image from "next/image";

import { RESOURCE_ILLUSTRATIONS } from "@/components/common/resource-illustrations";
import { RESOURCE_PHOTOS } from "@/lib/resources/resource-photos";
import { RESOURCE_TYPE_ICONS, type ResourceType } from "@/lib/resources/resource-types";

interface ResourceMediaPlaceholderProps {
  tipo: ResourceType;
  /** Slug do recurso — usado para escolher a foto/ilustração específica. */
  slug?: string;
  /** Nome do recurso, para o aria-label. */
  label?: string;
}

/**
 * Mídia estática dos cards (Home/Recursos) e fallback da página de detalhe
 * quando o recurso não tem modelo 3D. Prioridade: (1) foto real licenciada
 * em RESOURCE_PHOTOS, quando existir uma fonte segura (ver
 * lib/resources/resource-photos.ts); (2) ilustração SVG própria por recurso
 * (RESOURCE_ILLUSTRATIONS); (3) ícone genérico por tipo. Nunca um
 * `<Canvas>` — 3D só existe na página de detalhe (Prompt 6.2).
 */
export function ResourceMediaPlaceholder({
  tipo,
  slug,
  label,
}: ResourceMediaPlaceholderProps) {
  const photo = slug ? RESOURCE_PHOTOS[slug] : undefined;
  const Illustration = slug ? RESOURCE_ILLUSTRATIONS[slug] : undefined;
  const Icon = RESOURCE_TYPE_ICONS[tipo];

  if (photo) {
    return (
      <div className="relative size-full bg-muted">
        <Image
          src={photo.src}
          alt={label ? `Foto de ${label}` : photo.alt}
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-cover"
        />
      </div>
    );
  }

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
