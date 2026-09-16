import { createClient } from "@/lib/supabase/server";
import type { ResourceType } from "@/lib/resources/resource-types";

export interface ResourceUnitsSummary {
  /** Total de unidades físicas cadastradas para o recurso. */
  total: number;
  /**
   * Unidades com status = 'disponivel' — significa apenas que a unidade está
   * operacional administrativamente (não em manutenção/inativa). NÃO indica
   * disponibilidade para um horário específico — isso só existe a partir do
   * Prompt 7, quando passamos a cruzar com reservations.
   */
  operational: number;
}

export interface ResourceListItem {
  id: string;
  slug: string;
  nome: string;
  tipo: ResourceType;
  descricao: string | null;
  local: string | null;
  isSharedSpace: boolean;
  modelo3dUrl: string | null;
  imagens: string[];
  units: ResourceUnitsSummary;
}

function summarizeUnits(units: { status: string }[] | null): ResourceUnitsSummary {
  const list = units ?? [];
  return {
    total: list.length,
    operational: list.filter((u) => u.status === "disponivel").length,
  };
}

/**
 * Recursos ativos para o catálogo (Home e /recursos). RLS já garante que só
 * recursos com ativo = true (ou tudo, se admin) retornam — o filtro abaixo é
 * redundante para o caso comum, mas explícito porque a regra de negócio é
 * "recursos ativos no catálogo", não "o que a policy deixa passar".
 */
export async function getActiveResources(): Promise<ResourceListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("resources")
    .select(
      "id, slug, nome, tipo, descricao, local, is_shared_space, modelo_3d_url, imagens, resource_units(status)",
    )
    .eq("ativo", true)
    .order("nome");

  if (error) {
    throw new Error("Não foi possível carregar os recursos.");
  }

  return (data ?? []).map((resource) => ({
    id: resource.id,
    slug: resource.slug,
    nome: resource.nome,
    tipo: resource.tipo,
    descricao: resource.descricao,
    local: resource.local,
    isSharedSpace: resource.is_shared_space,
    modelo3dUrl: resource.modelo_3d_url,
    imagens: resource.imagens,
    units: summarizeUnits(resource.resource_units),
  }));
}

export interface ResourceSummary {
  slug: string;
  nome: string;
}

/**
 * Usado só pelo placeholder de /recursos/[slug] nesta etapa — a
 * implementação completa (Prompt 6) provavelmente vai querer mais campos.
 * RLS decide sozinha se o slug existe E está visível para quem está
 * consultando; `null` cobre os dois casos (não existe / existe mas está
 * oculto), sem distinguir um do outro para quem não pode ver.
 */
export async function getResourceSummaryBySlug(
  slug: string,
): Promise<ResourceSummary | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("resources")
    .select("slug, nome")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível carregar o recurso.");
  }

  return data;
}
