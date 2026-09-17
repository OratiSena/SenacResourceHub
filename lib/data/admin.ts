import { createClient } from "@/lib/supabase/server";
import type { ResourceType } from "@/lib/resources/resource-types";
import type { Database } from "@/lib/supabase/database.types";

export interface AdminDashboardCounts {
  recursos: number;
  unidades: number;
  reservasAtivas: number;
  usuarios: number;
}

export async function getAdminDashboardCounts(): Promise<AdminDashboardCounts> {
  const supabase = await createClient();

  const [recursos, unidades, reservasAtivas, usuarios] = await Promise.all([
    supabase.from("resources").select("*", { count: "exact", head: true }),
    supabase.from("resource_units").select("*", { count: "exact", head: true }),
    supabase
      .from("reservations")
      .select("*", { count: "exact", head: true })
      .eq("status", "ATIVA"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  return {
    recursos: recursos.count ?? 0,
    unidades: unidades.count ?? 0,
    reservasAtivas: reservasAtivas.count ?? 0,
    usuarios: usuarios.count ?? 0,
  };
}

export interface AdminResourceListItem {
  id: string;
  slug: string;
  nome: string;
  tipo: ResourceType;
  descricao: string | null;
  local: string | null;
  ativo: boolean;
  isSharedSpace: boolean;
  totalUnidades: number;
  horarioAbertura: string | null;
  horarioFechamento: string | null;
  duracaoMaximaMinutos: number | null;
  antecedenciaMinimaMinutos: number;
}

/** Todos os recursos (RLS já deixa admin ver inclusive os inativos). */
export async function getAdminResources(): Promise<AdminResourceListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("resources")
    .select(
      "id, slug, nome, tipo, descricao, local, ativo, is_shared_space, horario_abertura, horario_fechamento, duracao_maxima_minutos, antecedencia_minima_minutos, resource_units(id)",
    )
    .order("nome");

  if (error) {
    throw new Error("Não foi possível carregar os recursos.");
  }

  return (data ?? []).map((r) => ({
    id: r.id,
    slug: r.slug,
    nome: r.nome,
    tipo: r.tipo,
    descricao: r.descricao,
    local: r.local,
    ativo: r.ativo,
    isSharedSpace: r.is_shared_space,
    totalUnidades: r.resource_units?.length ?? 0,
    horarioAbertura: r.horario_abertura,
    horarioFechamento: r.horario_fechamento,
    duracaoMaximaMinutos: r.duracao_maxima_minutos,
    antecedenciaMinimaMinutos: r.antecedencia_minima_minutos,
  }));
}

export interface AdminResourceOption {
  id: string;
  nome: string;
  isSharedSpace: boolean;
}

/** Lista enxuta para o seletor de recurso em /admin/unidades — exclui espaços compartilhados, que nunca têm unidades. */
export async function getAdminResourceOptions(): Promise<AdminResourceOption[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("resources")
    .select("id, nome, is_shared_space")
    .eq("is_shared_space", false)
    .order("nome");

  if (error) {
    throw new Error("Não foi possível carregar os recursos.");
  }

  return (data ?? []).map((r) => ({
    id: r.id,
    nome: r.nome,
    isSharedSpace: r.is_shared_space,
  }));
}

export type UnitStatus = Database["public"]["Enums"]["unit_status"];

export interface AdminUnit {
  id: string;
  codigo: string;
  status: UnitStatus;
}

export async function getAdminUnitsByResource(
  resourceId: string,
): Promise<AdminUnit[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("resource_units")
    .select("id, codigo, status")
    .eq("resource_id", resourceId)
    .order("codigo");

  if (error) {
    throw new Error("Não foi possível carregar as unidades.");
  }

  return data ?? [];
}

export interface AdminReservationItem {
  id: string;
  status: "ATIVA" | "CANCELADA";
  dataHoraInicio: string;
  dataHoraFim: string;
  finalidade: string;
  usuarioNome: string;
  usuarioEmail: string;
  resourceNome: string;
  unitCodigo: string | null;
  isSharedSpace: boolean;
}

export async function getAdminReservations(): Promise<AdminReservationItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reservations")
    .select(
      "id, status, data_hora_inicio, data_hora_fim, finalidade, profiles!reservations_user_id_fkey(nome, email), resources(nome, is_shared_space), resource_units(codigo)",
    )
    .order("data_hora_inicio", { ascending: false })
    .limit(200);

  if (error) {
    throw new Error("Não foi possível carregar as reservas.");
  }

  return (data ?? []).map((r) => ({
    id: r.id,
    status: r.status,
    dataHoraInicio: r.data_hora_inicio,
    dataHoraFim: r.data_hora_fim,
    finalidade: r.finalidade,
    usuarioNome: r.profiles?.nome ?? "Usuário removido",
    usuarioEmail: r.profiles?.email ?? "",
    resourceNome: r.resources?.nome ?? "Recurso",
    unitCodigo: r.resource_units?.codigo ?? null,
    isSharedSpace: r.resources?.is_shared_space ?? false,
  }));
}

export interface AdminUserItem {
  id: string;
  nome: string;
  email: string;
  role: "user" | "admin";
  status: "active" | "deleted";
  createdAt: string;
}

export async function getAdminUsers(): Promise<AdminUserItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, nome, email, role, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Não foi possível carregar os usuários.");
  }

  return (data ?? []).map((u) => ({
    id: u.id,
    nome: u.nome,
    email: u.email,
    role: u.role,
    status: u.status,
    createdAt: u.created_at,
  }));
}

export async function countActiveAdmins(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin")
    .eq("status", "active");
  return count ?? 0;
}
