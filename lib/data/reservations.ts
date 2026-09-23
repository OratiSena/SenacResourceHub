import { createClient } from "@/lib/supabase/server";
import type { ResourceType } from "@/lib/resources/resource-types";

export interface BusyInterval {
  resourceUnitId: string;
  inicio: string;
  fim: string;
}

/**
 * Intervalos ATIVOS de um recurso que se sobrepõem ao período pedido, via a
 * função security definer get_resource_busy_intervals — nunca expõe de quem
 * são as reservas, só o suficiente para calcular disponibilidade.
 */
export async function getResourceBusyIntervals(
  resourceId: string,
  startISO: string,
  endISO: string,
): Promise<BusyInterval[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_resource_busy_intervals", {
    p_resource_id: resourceId,
    p_start: startISO,
    p_end: endISO,
  });

  if (error) {
    throw new Error("Não foi possível carregar a disponibilidade do recurso.");
  }

  return (data ?? []).map((row) => ({
    resourceUnitId: row.resource_unit_id,
    inicio: row.data_hora_inicio,
    fim: row.data_hora_fim,
  }));
}

export interface ReservationListItem {
  id: string;
  status: "ATIVA" | "CANCELADA";
  dataHoraInicio: string;
  dataHoraFim: string;
  finalidade: string;
  observacoes: string | null;
  resourceId: string;
  resourceNome: string;
  resourceSlug: string;
  resourceLocal: string | null;
  resourceTipo: ResourceType;
  isSharedSpace: boolean;
  unitCodigo: string | null;
}

/** Reservas da própria pessoa (RLS já restringe a user_id = auth.uid()). */
export async function getMyReservations(): Promise<ReservationListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reservations")
    .select(
      "id, status, data_hora_inicio, data_hora_fim, finalidade, observacoes, resource_id, resources(nome, slug, local, tipo, is_shared_space), resource_units(codigo)",
    )
    .order("data_hora_inicio", { ascending: false });

  if (error) {
    throw new Error("Não foi possível carregar suas reservas.");
  }

  return (data ?? []).map((r) => ({
    id: r.id,
    status: r.status,
    dataHoraInicio: r.data_hora_inicio,
    dataHoraFim: r.data_hora_fim,
    finalidade: r.finalidade,
    observacoes: r.observacoes,
    resourceId: r.resource_id,
    resourceNome: r.resources?.nome ?? "Recurso",
    resourceSlug: r.resources?.slug ?? "",
    resourceLocal: r.resources?.local ?? null,
    resourceTipo: r.resources?.tipo ?? "equipamento",
    isSharedSpace: r.resources?.is_shared_space ?? false,
    unitCodigo: r.resource_units?.codigo ?? null,
  }));
}

export interface ReservationDetail extends ReservationListItem {
  createdAt: string;
}

export async function getMyReservationById(
  id: string,
): Promise<ReservationDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reservations")
    .select(
      "id, status, data_hora_inicio, data_hora_fim, finalidade, observacoes, resource_id, created_at, resources(nome, slug, local, tipo, is_shared_space), resource_units(codigo)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível carregar a reserva.");
  }
  if (!data) return null;

  return {
    id: data.id,
    status: data.status,
    dataHoraInicio: data.data_hora_inicio,
    dataHoraFim: data.data_hora_fim,
    finalidade: data.finalidade,
    observacoes: data.observacoes,
    resourceId: data.resource_id,
    resourceNome: data.resources?.nome ?? "Recurso",
    resourceSlug: data.resources?.slug ?? "",
    resourceLocal: data.resources?.local ?? null,
    resourceTipo: data.resources?.tipo ?? "equipamento",
    isSharedSpace: data.resources?.is_shared_space ?? false,
    unitCodigo: data.resource_units?.codigo ?? null,
    createdAt: data.created_at,
  };
}

export interface ReservationNotificationItem {
  id: string;
  status: "ATIVA" | "CANCELADA";
  dataHoraInicio: string;
  dataHoraFim: string;
  resourceNome: string;
  createdAt: string;
  canceladoEm: string | null;
}

/**
 * Reservas da própria pessoa com carimbos de tempo, só para montar o painel
 * de notificações. Filtra `user_id` explicitamente (não só via RLS) porque
 * quem chama pode ser um admin — que tem acesso de leitura mais amplo via
 * RLS para as telas `/admin/**`, e não deve ver reserva de outra pessoa
 * aqui só porque a política de leitura é mais permissiva para esse papel.
 */
export async function getMyReservationsForNotifications(
  userId: string,
): Promise<ReservationNotificationItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reservations")
    .select(
      "id, status, data_hora_inicio, data_hora_fim, created_at, cancelado_em, resources(nome)",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error("Não foi possível carregar notificações.");
  }

  return (data ?? []).map((r) => ({
    id: r.id,
    status: r.status,
    dataHoraInicio: r.data_hora_inicio,
    dataHoraFim: r.data_hora_fim,
    resourceNome: r.resources?.nome ?? "Recurso",
    createdAt: r.created_at,
    canceladoEm: r.cancelado_em,
  }));
}

/** Próxima reserva futura ativa da pessoa (para a Home). */
export async function getNextReservation(): Promise<ReservationListItem | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reservations")
    .select(
      "id, status, data_hora_inicio, data_hora_fim, finalidade, observacoes, resource_id, resources(nome, slug, local, tipo, is_shared_space), resource_units(codigo)",
    )
    .eq("status", "ATIVA")
    .gt("data_hora_fim", new Date().toISOString())
    .order("data_hora_inicio", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível carregar sua próxima reserva.");
  }
  if (!data) return null;

  return {
    id: data.id,
    status: data.status,
    dataHoraInicio: data.data_hora_inicio,
    dataHoraFim: data.data_hora_fim,
    finalidade: data.finalidade,
    observacoes: data.observacoes,
    resourceId: data.resource_id,
    resourceNome: data.resources?.nome ?? "Recurso",
    resourceSlug: data.resources?.slug ?? "",
    resourceLocal: data.resources?.local ?? null,
    resourceTipo: data.resources?.tipo ?? "equipamento",
    isSharedSpace: data.resources?.is_shared_space ?? false,
    unitCodigo: data.resource_units?.codigo ?? null,
  };
}
