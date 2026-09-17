import { z } from "zod";

const CAMPO_OBRIGATORIO = "Campo obrigatório.";

export const updateNameSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, CAMPO_OBRIGATORIO)
    .max(100, "Máximo de 100 caracteres.")
    .refine((v) => v.trim().length > 0, "Nome não pode conter apenas espaços."),
});

export type UpdateNameInput = z.infer<typeof updateNameSchema>;

export const updatePasswordSchema = z
  .object({
    senha: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),
    confirmarSenha: z.string().min(1, CAMPO_OBRIGATORIO),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem.",
    path: ["confirmarSenha"],
  });

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
