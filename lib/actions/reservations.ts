"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { localDateTimeToISO } from "@/lib/reservations/format";
import type { ActionState } from "@/lib/actions/action-state";
import { createReservationSchema } from "@/lib/validations/reservation";

/**
 * A regra de negócio inteira (horário de funcionamento, duração máxima,
 * antecedência mínima, atribuição atômica de unidade livre) já vive em
 * public.create_reservation (RPC security definer) — esta action só valida
 * o formato do formulário e traduz o resultado. As mensagens de erro da RPC
 * já são escritas em português para o usuário final (ver migrations
 * 20250601090008 e 20250601090009), então repassamos error.message
 * diretamente em vez de reimplementar cada regra aqui.
 */
export async function createReservationAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = createReservationSchema.safeParse({
    resourceId: formData.get("resourceId"),
    data: formData.get("data"),
    horaInicio: formData.get("horaInicio"),
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

  const { resourceId, data, horaInicio, horaFim, finalidade, observacoes } =
    parsed.data;

  const dataHoraInicio = localDateTimeToISO(data, horaInicio);
  const dataHoraFim = localDateTimeToISO(data, horaFim);

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
      message: error?.message ?? "Não foi possível concluir a reserva. Tente novamente.",
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
