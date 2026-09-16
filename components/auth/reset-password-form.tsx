"use client";

import Link from "next/link";
import { useActionState } from "react";

import { resetPasswordAction } from "@/lib/actions/auth";
import { INITIAL_AUTH_ACTION_STATE } from "@/lib/actions/auth-state";
import { AuthLogo } from "@/components/auth/auth-logo";
import { FormMessage } from "@/components/auth/form-message";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    INITIAL_AUTH_ACTION_STATE,
  );

  const concluido = state.status === "success";

  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
      <AuthLogo />

      <h1 className="mt-6 text-xl font-bold text-navy">Redefinir senha</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Escolha uma nova senha para sua conta.
      </p>

      {concluido ? (
        <div className="mt-6 space-y-4">
          <FormMessage state={state} />
          <Button asChild className="w-full">
            <Link href="/">Entrar no sistema</Link>
          </Button>
        </div>
      ) : (
        <form action={formAction} className="mt-6 space-y-4" noValidate>
          <FormMessage state={state} />

          <PasswordInput
            name="senha"
            label="Nova senha"
            autoComplete="new-password"
            minLength={8}
            error={state.fieldErrors?.senha?.[0]}
          />

          <PasswordInput
            name="confirmarSenha"
            label="Confirmar nova senha"
            autoComplete="new-password"
            minLength={8}
            placeholder="Repita a nova senha"
            error={state.fieldErrors?.confirmarSenha?.[0]}
          />

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Salvando..." : "Salvar nova senha"}
          </Button>
        </form>
      )}
    </div>
  );
}
