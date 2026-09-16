"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { AuthActionState } from "@/lib/actions/auth-state";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/lib/validations/auth";

async function getOrigin() {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    senha: formData.get("senha"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Verifique os campos destacados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.senha,
  });

  if (error || !data.user) {
    if (error?.code === "email_not_confirmed") {
      return {
        status: "error",
        message:
          "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.",
      };
    }
    return { status: "error", message: "Credenciais inválidas." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  redirect(profile?.role === "admin" ? "/admin" : "/");
}

export async function signupAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    senha: formData.get("senha"),
    confirmarSenha: formData.get("confirmarSenha"),
    aceitaTermos: formData.get("aceitaTermos") === "on",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Verifique os campos destacados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const origin = await getOrigin();

  // A chave de metadata "nome" precisa bater exatamente com o que a
  // migration handle_new_user lê de raw_user_meta_data (ver
  // supabase/migrations/20250601090003_handle_new_user.sql).
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.senha,
    options: {
      data: { nome: parsed.data.nome },
      emailRedirectTo: `${origin}/auth/confirm?next=/`,
    },
  });

  if (error) {
    if (error.code === "user_already_exists") {
      return {
        status: "error",
        message: "E-mail já cadastrado. Utilize outro e-mail.",
        fieldErrors: { email: ["E-mail já cadastrado. Utilize outro e-mail."] },
      };
    }
    return {
      status: "error",
      message: "Não foi possível concluir o cadastro. Tente novamente.",
    };
  }

  // Com confirmação de e-mail habilitada, signUp não retorna sessão — o
  // usuário só ganha acesso depois de clicar no link enviado por e-mail.
  if (!data.session) {
    return {
      status: "success",
      message:
        "Cadastro recebido! Verifique seu e-mail para confirmar sua conta antes de entrar.",
    };
  }

  redirect("/");
}

export async function forgotPasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  const GENERIC_MESSAGE =
    "Se existir uma conta associada a este e-mail, enviaremos as instruções para redefinir sua senha.";

  if (!parsed.success) {
    return {
      status: "error",
      message: "Verifique os campos destacados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const origin = await getOrigin();

  // Nunca revelar se o e-mail existe ou não: a mensagem de sucesso é a
  // mesma independentemente do resultado da chamada.
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/confirm?next=/redefinir-senha`,
  });

  return { status: "success", message: GENERIC_MESSAGE };
}

export async function resetPasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    senha: formData.get("senha"),
    confirmarSenha: formData.get("confirmarSenha"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Verifique os campos destacados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();

  // Só funciona se o usuário chegou aqui através do link de recuperação
  // (que já estabelece uma sessão temporária via /auth/confirm). Sem essa
  // sessão, updateUser retorna erro de autenticação.
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.senha,
  });

  if (error) {
    return {
      status: "error",
      message:
        "Não foi possível redefinir sua senha. O link pode ter expirado — solicite uma nova recuperação.",
    };
  }

  return {
    status: "success",
    message: "Senha redefinida com sucesso. Você já pode entrar novamente.",
  };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
