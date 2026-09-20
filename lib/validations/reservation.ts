import { z } from "zod";

const CAMPO_OBRIGATORIO = "Campo obrigatório.";

export const createReservationSchema = z.object({
  resourceId: z.string().uuid("Recurso inválido."),
  data: z.string().min(1, CAMPO_OBRIGATORIO),
  horaInicio: z.string().min(1, CAMPO_OBRIGATORIO),
  /** Só usado por recursos sem janela diária (impressoras 3D), quando a reserva termina em outro dia. Vazio = mesmo dia de `data`. */
  dataFim: z.string().optional().or(z.literal("")),
  horaFim: z.string().min(1, CAMPO_OBRIGATORIO),
  finalidade: z
    .string()
    .trim()
    .min(1, CAMPO_OBRIGATORIO)
    .max(300, "Máximo de 300 caracteres."),
  observacoes: z
    .string()
    .trim()
    .max(500, "Máximo de 500 caracteres.")
    .optional()
    .or(z.literal("")),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
