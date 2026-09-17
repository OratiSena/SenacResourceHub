"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/actions/action-state";
import { updateNameSchema, updatePasswordSchema } from "@/lib/validations/profile";

export async function updateNameAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = updateNameSchema.safeParse({ nome: formData.get("nome") });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Verifique os campos destacados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Sessão expirada. Faça login novamente." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ nome: parsed.data.nome })
    .eq("id", user.id);

  if (error) {
    return { status: "error", message: "Não foi possível atualizar o nome." };
  }

  return { status: "success", message: "Nome atualizado com sucesso." };
}

export async function updatePasswordAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = updatePasswordSchema.safeParse({
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
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.senha,
  });

  if (error) {
    return { status: "error", message: "Não foi possível atualizar a senha." };
  }

  return { status: "success", message: "Senha atualizada com sucesso." };
}

/**
 * Autoexclusão de conta — delega toda a regra de negócio (cancelar reservas
 * futuras, anonimizar profile, remover credenciais) para a RPC security
 * definer delete_my_account, que opera exclusivamente sobre auth.uid()
 * (nunca aceita um id vindo do cliente). Ver supabase/migrations
 * 20250601090008.
 */
export async function deleteAccountAction(): Promise<ActionState> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("delete_my_account");

  if (error) {
    return {
      status: "error",
      message: "Não foi possível excluir sua conta. Tente novamente.",
    };
  }

  await supabase.auth.signOut();
  redirect("/login");
}
