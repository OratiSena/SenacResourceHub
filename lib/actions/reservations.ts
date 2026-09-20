"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { localDateTimeToISO } from "@/lib/reservations/format";
import type { ActionState } from "@/lib/actions/action-state";
import { createReservationSchema } from "@/lib/validations/reservation";

/**
 * Traduz as mensagens de erro da RPC create_reservation (já em português,
 * ver migrations 20250601090008/09) para um texto mais direto e amigável na
 * UI — nunca inventa uma regra nova, só reformula o texto de uma condição
 * que a RPC já rejeitou. Mensagens não reconhecidas passam direto (nunca
 * escondemos um erro real, só evitamos jargão nas conhecidas).
 */
function translateReservationError(message: string): string {
  const semSegundos = message.replace(/(\d{2}:\d{2}):\d{2}/g, "$1");

  const EXATAS: Record<string, string> = {
    "Nenhuma unidade disponivel para o periodo informado":
      "Esse horário não está mais disponível. Escolha outro período.",
    "Horario de termino deve ser posterior ao horario de inicio":
      "O horário de término deve ser depois do início.",
    "Recurso indisponivel para reservas":
      "Este recurso não está disponível para reservas no momento.",
    "Recurso nao encontrado": "Recurso não encontrado.",
    "Usuario nao autenticado": "Sua sessão expirou. Faça login novamente.",
  };

  return EXATAS[semSegundos] ?? semSegundos;
}

/**
 * A regra de negócio inteira (horário de funcionamento, duração máxima,
 * antecedência mínima, atribuição atômica de unidade livre) já vive em
 * public.create_reservation (RPC security definer) — esta action só valida
 * o formato do formulário, monta os dois timestamps e traduz o resultado
 * para uma mensagem amigável (translateReservationError).
 */
export async function createReservationAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = createReservationSchema.safeParse({
    resourceId: formData.get("resourceId"),
    data: formData.get("data"),
    horaInicio: formData.get("horaInicio"),
    dataFim: formData.get("dataFim") ?? undefined,
    horaFim: formData.get("horaFim"),
    finalidade: formData.get("finalidade"),
    observacoes: formData.get("observacoes"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Verifique os campos destacados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { resourceId, data, horaInicio, dataFim, horaFim, finalidade, observacoes } =
    parsed.data;

  // dataFim só é enviado por recursos sem janela diária (impressoras 3D),
  // quando o usuário escolhe um dia de término diferente do de início — nos
  // demais casos, início e fim estão sempre no mesmo dia.
  const dataHoraInicio = localDateTimeToISO(data, horaInicio);
  const dataHoraFim = localDateTimeToISO(dataFim || data, horaFim);

  const supabase = await createClient();
  const { data: reservation, error } = await supabase.rpc(
    "create_reservation",
    {
      p_resource_id: resourceId,
      p_data_hora_inicio: dataHoraInicio,
      p_data_hora_fim: dataHoraFim,
      p_finalidade: finalidade,
      p_observacoes: observacoes || undefined,
    },
  );

  if (error || !reservation) {
    return {
      status: "error",
      message: error
        ? translateReservationError(error.message)
        : "Não foi possível concluir a reserva. Tente novamente.",
    };
  }

  redirect(`/reservas/${reservation.id}/confirmacao`);
}

export async function cancelReservationAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const reservationId = formData.get("reservationId");
  if (typeof reservationId !== "string" || !reservationId) {
    return { status: "error", message: "Reserva inválida." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_reservation", {
    p_reservation_id: reservationId,
  });

  if (error) {
    return {
      status: "error",
      message:
        error.message === "Cancelamento permitido somente ate 2 dias antes do inicio da reserva"
          ? "Cancelamento permitido somente até 2 dias antes do início da reserva."
          : (error.message ?? "Não foi possível cancelar a reserva."),
    };
  }

  return { status: "success", message: "Reserva cancelada com sucesso." };
}
