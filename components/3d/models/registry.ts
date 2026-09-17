import type { ComponentType } from "react";

import { BambuLabA1Model } from "@/components/3d/models/bambu-lab-a1-model";

/**
 * Registro de quais recursos (por slug) têm modelo 3D interativo próprio.
 * Adicionar um novo recurso 3D no futuro é só criar o componente do modelo e
 * incluir uma linha aqui — nada mais no restante da página de detalhe muda
 * (Prompt 6, seção 14).
 */
export const RESOURCE_3D_MODELS: Record<string, ComponentType> = {
  "bambu-lab-a1": BambuLabA1Model,
};

export function getResource3DModel(slug: string): ComponentType | null {
  return RESOURCE_3D_MODELS[slug] ?? null;
}
