import { createClient } from "@/lib/supabase/server";
import { localDateTimeToISO, shiftLocalDate } from "@/lib/reservations/format";
import type { ResourceType } from "@/lib/resources/resource-types";
import type { Database } from "@/lib/supabase/database.types";

const DEFAULT_PAGE_SIZE = 20;

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

function clampPage(page: number | undefined): number {
  return page && page > 0 ? Math.floor(page) : 1;
}

function pageRange(page: number, pageSize: number): [number, number] {
  const from = (page - 1) * pageSize;
  return [from, from + pageSize - 1];
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export interface AdminDashboardCounts {
  recursosAtivos: number;
  unidadesOperacionais: number;
  reservasFuturas: number;
  reservasEmUso: number;
  usuariosAtivos: number;
  administradores: number;
}

export interface ReservationsByStatus {
  futura: number;
  emUso: number;
  expirada: number;
  cancelada: number;
}

export interface ReservationsPerDay {
  /** "YYYY-MM-DD", em America/Sao_Paulo */
  data: string;
  total: number;
}

export interface ResourcesByType {
  tipo: ResourceType;
  total: number;
}

export interface AdminDashboardData {
  counts: AdminDashboardCounts;
  statusBreakdown: ReservationsByStatus;
  next7Days: ReservationsPerDay[];
  resourcesByType: ResourcesByType[];
  upcomingReservations: AdminReservationItem[];
}

/**
 * Todas as consultas do dashboard rodam em paralelo e são agregadas
 * (count/head, ou datasets pequenos e já delimitados por período) — nunca
 * um "SELECT * FROM reservations" completo só para montar um gráfico.
 */
export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const supabase = await createClient();
  const nowISO = new Date().toISOString();

  const in7DaysISO = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    recursosAtivos,
    unidadesOperacionais,
    reservasFuturas,
    reservasEmUso,
    reservasExpiradas,
    reservasCanceladas,
    usuariosAtivos,
    administradores,
    proximosDiasResult,
    resourcesTypeResult,
    upcoming,
  ] = await Promise.all([
    supabase.from("resources").select("*", { count: "exact", head: true }).eq("ativo", true),
    supabase.from("resource_units").select("*", { count: "exact", head: true }).eq("status", "disponivel"),
    supabase.from("reservations").select("*", { count: "exact", head: true }).eq("status", "ATIVA").gt("data_hora_inicio", nowISO),
    supabase.from("reservations").select("*", { count: "exact", head: true }).eq("status", "ATIVA").lte("data_hora_inicio", nowISO).gt("data_hora_fim", nowISO),
    supabase.from("reservations").select("*", { count: "exact", head: true }).eq("status", "ATIVA").lte("data_hora_fim", nowISO),
    supabase.from("reservations").select("*", { count: "exact", head: true }).eq("status", "CANCELADA"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "admin").eq("status", "active"),
    supabase
      .from("reservations")
      .select("data_hora_inicio")
      .eq("status", "ATIVA")
      .gte("data_hora_inicio", nowISO)
      .lt("data_hora_inicio", in7DaysISO),
    supabase.from("resources").select("tipo"),
    supabase
      .from("reservations")
      .select(
        "id, status, data_hora_inicio, data_hora_fim, finalidade, observacoes, profiles!reservations_user_id_fkey(nome, email), resources(nome, local, is_shared_space), resource_units(codigo)",
      )
      .eq("status", "ATIVA")
      .gt("data_hora_fim", nowISO)
      .order("data_hora_inicio", { ascending: true })
      .limit(5),
  ]);

  const next7Days = buildNext7DaysBuckets(
    (proximosDiasResult.data ?? []).map((r) => r.data_hora_inicio),
  );

  const resourcesByTypeMap = new Map<ResourceType, number>();
  for (const row of resourcesTypeResult.data ?? []) {
    resourcesByTypeMap.set(row.tipo, (resourcesByTypeMap.get(row.tipo) ?? 0) + 1);
  }

  return {
    counts: {
      recursosAtivos: recursosAtivos.count ?? 0,
      unidadesOperacionais: unidadesOperacionais.count ?? 0,
      reservasFuturas: reservasFuturas.count ?? 0,
      reservasEmUso: reservasEmUso.count ?? 0,
      usuariosAtivos: usuariosAtivos.count ?? 0,
      administradores: administradores.count ?? 0,
    },
    statusBreakdown: {
      futura: reservasFuturas.count ?? 0,
      emUso: reservasEmUso.count ?? 0,
      expirada: reservasExpiradas.count ?? 0,
      cancelada: reservasCanceladas.count ?? 0,
    },
    next7Days,
    resourcesByType: Array.from(resourcesByTypeMap.entries()).map(([tipo, total]) => ({
      tipo,
      total,
    })),
    upcomingReservations: (upcoming.data ?? []).map(mapReservationRow),
  };
}

function buildNext7DaysBuckets(startTimestamps: string[]): ReservationsPerDay[] {
  const formatter = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" });
  const counts = new Map<string, number>();
  for (const iso of startTimestamps) {
    const key = formatter.format(new Date(iso));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const days: ReservationsPerDay[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
    const key = formatter.format(date);
    days.push({ data: key, total: counts.get(key) ?? 0 });
  }
  return days;
}

export interface AdminRecentActivityItem {
  id: string;
  status: "ATIVA" | "CANCELADA";
  usuarioNome: string;
  resourceNome: string;
  dataHoraInicio: string;
  createdAt: string;
  canceladoEm: string | null;
}

/**
 * Reservas de qualquer usuário criadas ou canceladas desde `sinceISO` — só
 * para alimentar o painel de notificações do admin, nunca uma listagem geral
 * (para isso já existe `getAdminReservations`, paginada).
 */
export async function getAdminRecentReservationActivity(
  sinceISO: string,
): Promise<AdminRecentActivityItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reservations")
    .select(
      "id, status, data_hora_inicio, created_at, cancelado_em, profiles!reservations_user_id_fkey(nome), resources(nome)",
    )
    .or(`created_at.gte.${sinceISO},cancelado_em.gte.${sinceISO}`)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error("Não foi possível carregar a atividade recente.");
  }

  return (data ?? []).map((r) => ({
    id: r.id,
    status: r.status,
    usuarioNome: r.profiles?.nome ?? "Usuário",
    resourceNome: r.resources?.nome ?? "Recurso",
    dataHoraInicio: r.data_hora_inicio,
    createdAt: r.created_at,
    canceladoEm: r.cancelado_em,
  }));
}

// ---------------------------------------------------------------------------
// Recursos
// ---------------------------------------------------------------------------

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
  operacionais: number;
  horarioAbertura: string | null;
  horarioFechamento: string | null;
  duracaoMaximaMinutos: number | null;
  antecedenciaMinimaMinutos: number;
}

export interface AdminResourceFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  tipo?: ResourceType;
  ativo?: "true" | "false";
}

export async function getAdminResources(
  filters: AdminResourceFilters = {},
): Promise<PageResult<AdminResourceListItem>> {
  const supabase = await createClient();
  const page = clampPage(filters.page);
  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;

  let query = supabase
    .from("resources")
    .select(
      "id, slug, nome, tipo, descricao, local, ativo, is_shared_space, horario_abertura, horario_fechamento, duracao_maxima_minutos, antecedencia_minima_minutos, resource_units(status)",
      { count: "exact" },
    );

  if (filters.search) {
    query = query.ilike("nome", `%${filters.search}%`);
  }
  if (filters.tipo) {
    query = query.eq("tipo", filters.tipo);
  }
  if (filters.ativo) {
    query = query.eq("ativo", filters.ativo === "true");
  }

  const [from, to] = pageRange(page, pageSize);
  const { data, error, count } = await query.order("nome").range(from, to);

  if (error) {
    throw new Error("Não foi possível carregar os recursos.");
  }

  const items = (data ?? []).map((r) => ({
    id: r.id,
    slug: r.slug,
    nome: r.nome,
    tipo: r.tipo,
    descricao: r.descricao,
    local: r.local,
    ativo: r.ativo,
    isSharedSpace: r.is_shared_space,
    totalUnidades: r.resource_units?.length ?? 0,
    operacionais: r.resource_units?.filter((u) => u.status === "disponivel").length ?? 0,
    horarioAbertura: r.horario_abertura,
    horarioFechamento: r.horario_fechamento,
    duracaoMaximaMinutos: r.duracao_maxima_minutos,
    antecedenciaMinimaMinutos: r.antecedencia_minima_minutos,
  }));

  return { items, total: count ?? 0, page, pageSize };
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

/** Lista enxuta com TODOS os recursos (inclusive Oficina) — para o filtro de /admin/reservas. */
export async function getAdminAllResourceOptions(): Promise<AdminResourceOption[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("resources")
    .select("id, nome, is_shared_space")
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

// ---------------------------------------------------------------------------
// Unidades
// ---------------------------------------------------------------------------

export type UnitStatus = Database["public"]["Enums"]["unit_status"];

export interface AdminUnit {
  id: string;
  codigo: string;
  status: UnitStatus;
}

export interface AdminUnitFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: UnitStatus;
}

export async function getAdminUnitsByResource(
  resourceId: string,
  filters: AdminUnitFilters = {},
): Promise<PageResult<AdminUnit>> {
  const supabase = await createClient();
  const page = clampPage(filters.page);
  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;

  let query = supabase
    .from("resource_units")
    .select("id, codigo, status", { count: "exact" })
    .eq("resource_id", resourceId);

  if (filters.search) {
    query = query.ilike("codigo", `%${filters.search}%`);
  }
  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  const [from, to] = pageRange(page, pageSize);
  const { data, error, count } = await query.order("codigo").range(from, to);

  if (error) {
    throw new Error("Não foi possível carregar as unidades.");
  }

  return { items: data ?? [], total: count ?? 0, page, pageSize };
}

// ---------------------------------------------------------------------------
// Reservas
// ---------------------------------------------------------------------------

export type AdminReservationStatusFilter =
  | "futura"
  | "em_uso"
  | "expirada"
  | "cancelada";

export interface AdminReservationItem {
  id: string;
  status: "ATIVA" | "CANCELADA";
  dataHoraInicio: string;
  dataHoraFim: string;
  finalidade: string;
  observacoes: string | null;
  usuarioNome: string;
  usuarioEmail: string;
  resourceNome: string;
  resourceLocal: string | null;
  unitCodigo: string | null;
  isSharedSpace: boolean;
}

function mapReservationRow(r: {
  id: string;
  status: "ATIVA" | "CANCELADA";
  data_hora_inicio: string;
  data_hora_fim: string;
  finalidade: string;
  observacoes: string | null;
  profiles: { nome: string; email: string } | null;
  resources: { nome: string; local: string | null; is_shared_space: boolean } | null;
  resource_units: { codigo: string } | null;
}): AdminReservationItem {
  return {
    id: r.id,
    status: r.status,
    dataHoraInicio: r.data_hora_inicio,
    dataHoraFim: r.data_hora_fim,
    finalidade: r.finalidade,
    observacoes: r.observacoes,
    usuarioNome: r.profiles?.nome ?? "Usuário removido",
    usuarioEmail: r.profiles?.email ?? "",
    resourceNome: r.resources?.nome ?? "Recurso",
    resourceLocal: r.resources?.local ?? null,
    unitCodigo: r.resource_units?.codigo ?? null,
    isSharedSpace: r.resources?.is_shared_space ?? false,
  };
}

export interface AdminReservationFilters {
  page?: number;
  pageSize?: number;
  resourceId?: string;
  usuario?: string;
  data?: string;
  status?: AdminReservationStatusFilter;
}

export async function getAdminReservations(
  filters: AdminReservationFilters = {},
): Promise<PageResult<AdminReservationItem>> {
  const supabase = await createClient();
  const page = clampPage(filters.page);
  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;
  const nowISO = new Date().toISOString();

  let query = supabase
    .from("reservations")
    .select(
      "id, status, data_hora_inicio, data_hora_fim, finalidade, observacoes, profiles!reservations_user_id_fkey!inner(nome, email), resources(nome, local, is_shared_space), resource_units(codigo)",
      { count: "exact" },
    );

  if (filters.resourceId) {
    query = query.eq("resource_id", filters.resourceId);
  }
  if (filters.usuario) {
    query = query.or(
      `nome.ilike.%${filters.usuario}%,email.ilike.%${filters.usuario}%`,
      { referencedTable: "profiles" },
    );
  }
  if (filters.data) {
    const startISO = localDateTimeToISO(filters.data, "00:00");
    const endISO = localDateTimeToISO(shiftLocalDate(filters.data, 1), "00:00");
    query = query.gte("data_hora_inicio", startISO).lt("data_hora_inicio", endISO);
  }
  if (filters.status === "cancelada") {
    query = query.eq("status", "CANCELADA");
  } else if (filters.status === "futura") {
    query = query.eq("status", "ATIVA").gt("data_hora_inicio", nowISO);
  } else if (filters.status === "em_uso") {
    query = query.eq("status", "ATIVA").lte("data_hora_inicio", nowISO).gt("data_hora_fim", nowISO);
  } else if (filters.status === "expirada") {
    query = query.eq("status", "ATIVA").lte("data_hora_fim", nowISO);
  }

  const [from, to] = pageRange(page, pageSize);
  const { data, error, count } = await query
    .order("data_hora_inicio", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error("Não foi possível carregar as reservas.");
  }

  return { items: (data ?? []).map(mapReservationRow), total: count ?? 0, page, pageSize };
}

// ---------------------------------------------------------------------------
// Usuários
// ---------------------------------------------------------------------------

export interface AdminUserItem {
  id: string;
  nome: string;
  email: string;
  role: "user" | "admin";
  status: "active" | "deleted";
  createdAt: string;
}

export interface AdminUserFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: "user" | "admin";
  status?: "active" | "deleted";
}

export async function getAdminUsers(
  filters: AdminUserFilters = {},
): Promise<PageResult<AdminUserItem>> {
  const supabase = await createClient();
  const page = clampPage(filters.page);
  const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;

  let query = supabase
    .from("profiles")
    .select("id, nome, email, role, status, created_at", { count: "exact" });

  if (filters.search) {
    query = query.or(`nome.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
  }
  if (filters.role) {
    query = query.eq("role", filters.role);
  }
  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  const [from, to] = pageRange(page, pageSize);
  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error("Não foi possível carregar os usuários.");
  }

  return {
    items: (data ?? []).map((u) => ({
      id: u.id,
      nome: u.nome,
      email: u.email,
      role: u.role,
      status: u.status,
      createdAt: u.created_at,
    })),
    total: count ?? 0,
    page,
    pageSize,
  };
}

export interface AdminUserDetail extends AdminUserItem {
  totalReservas: number;
  reservasFuturas: number;
}

export async function getAdminUserDetail(userId: string): Promise<AdminUserDetail | null> {
  const supabase = await createClient();
  const nowISO = new Date().toISOString();

  const [profileResult, totalResult, futurasResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, nome, email, role, status, created_at")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("reservations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("reservations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "ATIVA")
      .gt("data_hora_inicio", nowISO),
  ]);

  if (profileResult.error || !profileResult.data) return null;

  const u = profileResult.data;
  return {
    id: u.id,
    nome: u.nome,
    email: u.email,
    role: u.role,
    status: u.status,
    createdAt: u.created_at,
    totalReservas: totalResult.count ?? 0,
    reservasFuturas: futurasResult.count ?? 0,
  };
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
