import { RESOURCE_TYPE_ICONS, type ResourceType } from "@/lib/resources/resource-types";

/**
 * Placeholder de mídia usado enquanto o recurso não tem imagem cadastrada
 * (todo o catálogo, nesta etapa — `resources.imagens` está vazio para os 9
 * recursos semente). Ícone coerente com o tipo em vez de uma caixa cinza
 * genérica (Prompt 5, seção 8). Substituído por imagem real ou pelo preview
 * 3D (Prompt 6) assim que existirem.
 */
export function ResourceMediaPlaceholder({ tipo }: { tipo: ResourceType }) {
  const Icon = RESOURCE_TYPE_ICONS[tipo];

  return (
    <div className="flex size-full items-center justify-center bg-gradient-to-br from-primary/15 via-primary/5 to-navy/10">
      <Icon className="size-12 text-primary/60" aria-hidden="true" />
    </div>
  );
}
