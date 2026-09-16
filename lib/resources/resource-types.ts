import {
  Boxes,
  Building2,
  CircuitBoard,
  Gauge,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import type { Database } from "@/lib/supabase/database.types";

export type ResourceType = Database["public"]["Enums"]["resource_type"];

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  laboratorio: "Laboratório",
  equipamento: "Equipamento",
  impressora_3d: "Impressão 3D",
  kit: "Kit",
  espaco_compartilhado: "Espaço compartilhado",
};

export const RESOURCE_TYPE_ICONS: Record<ResourceType, LucideIcon> = {
  laboratorio: Building2,
  equipamento: Gauge,
  impressora_3d: Boxes,
  kit: CircuitBoard,
  espaco_compartilhado: Wrench,
};

/** Ordem usada nos filtros de /recursos — "Todos" é tratado à parte na UI. */
export const RESOURCE_TYPE_FILTER_ORDER: ResourceType[] = [
  "laboratorio",
  "equipamento",
  "impressora_3d",
  "kit",
  "espaco_compartilhado",
];
