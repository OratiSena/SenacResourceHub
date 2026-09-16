import { z } from "zod";

const CAMPO_OBRIGATORIO = "Campo obrigatório.";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, CAMPO_OBRIGATORIO)
    .email("Informe um e-mail válido."),
  senha: z.string().min(1, CAMPO_OBRIGATORIO),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(1, CAMPO_OBRIGATORIO)
      .max(100, "Máximo de 100 caracteres."),
    email: z
      .string()
      .min(1, CAMPO_OBRIGATORIO)
      .email("Informe um e-mail válido."),
    senha: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),
    confirmarSenha: z.string().min(1, CAMPO_OBRIGATORIO),
    aceitaTermos: z.boolean().refine((v) => v === true, {
      message: "É necessário aceitar os Termos de Uso e a Política de Privacidade.",
    }),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem.",
    path: ["confirmarSenha"],
  });

export type SignupInput = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, CAMPO_OBRIGATORIO)
    .email("Informe um e-mail válido."),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    senha: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),
    confirmarSenha: z.string().min(1, CAMPO_OBRIGATORIO),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem.",
    path: ["confirmarSenha"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
