"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { countActiveAdmins } from "@/lib/data/admin";
import { requireAdminProfile } from "@/lib/auth/require-admin";
import type { ActionState } from "@/lib/actions/action-state";
import {
  resourceFormSchema,
  unitFormSchema,
  unitStatusSchema,
} from "@/lib/validations/admin";

function parseResourceForm(formData: FormData) {
  return resourceFormSchema.safeParse({
    nome: formData.get("nome"),
    slug: formData.get("slug"),
    tipo: formData.get("tipo"),
    descricao: formData.get("descricao"),
    local: formData.get("local"),
    ativo: formData.get("ativo") === "on",
    horarioAbertura: formData.get("horarioAbertura"),
    horarioFechamento: formData.get("horarioFechamento"),
    duracaoMaximaMinutos: formData.get("duracaoMaximaMinutos"),
    antecedenciaMinimaMinutos: formData.get("antecedenciaMinimaMinutos"),
  });
}

export async function createResourceAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdminProfile();

  const parsed = parseResourceForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Verifique os campos destacados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { data } = parsed;

  const { error } = await supabase.from("resources").insert({
    nome: data.nome,
    slug: data.slug,
    tipo: data.tipo,
    descricao: data.descricao || null,
    local: data.local || null,
    ativo: data.ativo,
    is_shared_space: data.tipo === "espaco_compartilhado",
    horario_abertura: data.horarioAbertura || null,
    horario_fechamento: data.horarioFechamento || null,
    duracao_maxima_minutos: data.duracaoMaximaMinutos
      ? Number(data.duracaoMaximaMinutos)
      : null,
    antecedencia_minima_minutos: data.antecedenciaMinimaMinutos
      ? Number(data.antecedenciaMinimaMinutos)
      : 0,
  });

  if (error) {
    return {
      status: "error",
      message:
        error.code === "23505"
          ? "Já existe um recurso com este slug."
          : "Não foi possível criar o recurso.",
    };
  }

  revalidatePath("/admin/recursos");
  return { status: "success", message: "Recurso criado com sucesso." };
}

export async function updateResourceAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdminProfile();

  const resourceId = formData.get("resourceId");
  if (typeof resourceId !== "string" || !resourceId) {
    return { status: "error", message: "Recurso inválido." };
  }

  const parsed = parseResourceForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Verifique os campos destacados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { data } = parsed;

  const { error } = await supabase
    .from("resources")
    .update({
      nome: data.nome,
      slug: data.slug,
      tipo: data.tipo,
      descricao: data.descricao || null,
      local: data.local || null,
      ativo: data.ativo,
      is_shared_space: data.tipo === "espaco_compartilhado",
      horario_abertura: data.horarioAbertura || null,
      horario_fechamento: data.horarioFechamento || null,
      duracao_maxima_minutos: data.duracaoMaximaMinutos
        ? Number(data.duracaoMaximaMinutos)
        : null,
      antecedencia_minima_minutos: data.antecedenciaMinimaMinutos
        ? Number(data.antecedenciaMinimaMinutos)
        : 0,
    })
    .eq("id", resourceId);

  if (error) {
    return {
      status: "error",
      message:
        error.code === "23505"
          ? "Já existe um recurso com este slug."
          : "Não foi possível atualizar o recurso.",
    };
  }

  revalidatePath("/admin/recursos");
  return { status: "success", message: "Recurso atualizado com sucesso." };
}

export async function toggleResourceAtivoAction(
  resourceId: string,
  ativo: boolean,
): Promise<ActionState> {
  await requireAdminProfile();

  const supabase = await createClient();
  const { error } = await supabase
    .from("resources")
    .update({ ativo })
    .eq("id", resourceId);

  if (error) {
    return { status: "error", message: "Não foi possível atualizar o recurso." };
  }

  revalidatePath("/admin/recursos");
  return {
    status: "success",
    message: ativo ? "Recurso ativado." : "Recurso desativado.",
  };
}

export async function createUnitAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdminProfile();

  const parsed = unitFormSchema.safeParse({
    resourceId: formData.get("resourceId"),
    codigo: formData.get("codigo"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Verifique os campos destacados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("resource_units").insert({
    resource_id: parsed.data.resourceId,
    codigo: parsed.data.codigo,
  });

  if (error) {
    return {
      status: "error",
      message:
        error.code === "23505"
          ? "Já existe uma unidade com este código."
          : "Não foi possível criar a unidade.",
    };
  }

  revalidatePath("/admin/unidades");
  return { status: "success", message: "Unidade criada com sucesso." };
}

export async function updateUnitStatusAction(
  unitId: string,
  status: string,
): Promise<ActionState> {
  await requireAdminProfile();

  const parsed = unitStatusSchema.safeParse({ unitId, status });
  if (!parsed.success) {
    return { status: "error", message: "Dados inválidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("resource_units")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.unitId);

  if (error) {
    return { status: "error", message: "Não foi possível atualizar a unidade." };
  }

  revalidatePath("/admin/unidades");
  return { status: "success", message: "Status da unidade atualizado." };
}

/**
 * Admin cancela qualquer reserva ATIVA, a qualquer momento — via a mesma RPC
 * sancionada usada pelo usuário comum (cancel_reservation já trata o caso
 * is_admin() sem a restrição de 48h, ver migration 20250601090007).
 */
export async function adminCancelReservationAction(
  reservationId: string,
): Promise<ActionState> {
  await requireAdminProfile();

  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_reservation", {
    p_reservation_id: reservationId,
  });

  if (error) {
    return { status: "error", message: "Não foi possível cancelar a reserva." };
  }

  revalidatePath("/admin/reservas");
  return { status: "success", message: "Reserva cancelada com sucesso." };
}

export async function promoteUserAction(userId: string): Promise<ActionState> {
  await requireAdminProfile();

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", userId);

  if (error) {
    return { status: "error", message: "Não foi possível promover este usuário." };
  }

  revalidatePath("/admin/usuarios");
  return { status: "success", message: "Usuário promovido a administrador." };
}

export async function demoteUserAction(userId: string): Promise<ActionState> {
  const currentProfile = await requireAdminProfile();

  if (currentProfile.id === userId) {
    return {
      status: "error",
      message: "Você não pode remover seu próprio acesso de administrador.",
    };
  }

  const activeAdmins = await countActiveAdmins();
  if (activeAdmins <= 1) {
    return {
      status: "error",
      message: "Não é possível remover o único administrador do sistema.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: "user" })
    .eq("id", userId);

  if (error) {
    return { status: "error", message: "Não foi possível rebaixar este usuário." };
  }

  revalidatePath("/admin/usuarios");
  return { status: "success", message: "Acesso de administrador removido." };
}
