import { z } from "zod";

const CAMPO_OBRIGATORIO = "Campo obrigatório.";

export const RESOURCE_TYPE_VALUES = [
  "laboratorio",
  "equipamento",
  "impressora_3d",
  "kit",
  "espaco_compartilhado",
] as const;

const horaOpcional = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "Use o formato HH:MM.")
  .optional()
  .or(z.literal(""));

export const resourceFormSchema = z
  .object({
    nome: z.string().trim().min(1, CAMPO_OBRIGATORIO).max(150, "Máximo de 150 caracteres."),
    slug: z
      .string()
      .trim()
      .min(1, CAMPO_OBRIGATORIO)
      .max(150)
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use apenas letras minúsculas, números e hífen."),
    tipo: z.enum(RESOURCE_TYPE_VALUES),
    descricao: z.string().trim().max(500).optional().or(z.literal("")),
    local: z.string().trim().max(150).optional().or(z.literal("")),
    ativo: z.boolean(),
    horarioAbertura: horaOpcional,
    horarioFechamento: horaOpcional,
    duracaoMaximaMinutos: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine(
        (v) => !v || (Number.isInteger(Number(v)) && Number(v) > 0),
        "Deve ser um número inteiro positivo.",
      ),
    antecedenciaMinimaMinutos: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine(
        (v) => !v || (Number.isInteger(Number(v)) && Number(v) >= 0),
        "Deve ser um número inteiro não negativo.",
      ),
  })
  .refine(
    (data) => !data.horarioAbertura === !data.horarioFechamento,
    {
      message: "Informe abertura e fechamento juntos, ou nenhum dos dois.",
      path: ["horarioFechamento"],
    },
  )
  .refine(
    (data) =>
      !data.horarioAbertura ||
      !data.horarioFechamento ||
      data.horarioFechamento > data.horarioAbertura,
    {
      message: "O fechamento deve ser depois da abertura.",
      path: ["horarioFechamento"],
    },
  );

export type ResourceFormInput = z.infer<typeof resourceFormSchema>;

export const UNIT_STATUS_VALUES = ["disponivel", "manutencao", "inativa"] as const;

export const unitFormSchema = z.object({
  resourceId: z.string().uuid("Recurso inválido."),
  codigo: z
    .string()
    .trim()
    .min(1, CAMPO_OBRIGATORIO)
    .max(30, "Máximo de 30 caracteres."),
});

export const unitStatusSchema = z.object({
  unitId: z.string().uuid(),
  status: z.enum(UNIT_STATUS_VALUES),
});

export const adminUpdateUserSchema = z.object({
  userId: z.string().uuid(),
  nome: z
    .string()
    .trim()
    .min(1, CAMPO_OBRIGATORIO)
    .max(100, "Máximo de 100 caracteres.")
    .refine((v) => v.trim().length > 0, "Nome não pode conter apenas espaços."),
});
