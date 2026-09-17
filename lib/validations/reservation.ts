import { z } from "zod";

const CAMPO_OBRIGATORIO = "Campo obrigatório.";

export const createReservationSchema = z.object({
  resourceId: z.string().uuid("Recurso inválido."),
  data: z.string().min(1, CAMPO_OBRIGATORIO),
  horaInicio: z.string().min(1, CAMPO_OBRIGATORIO),
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
