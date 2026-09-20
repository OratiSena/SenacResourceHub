"use client";

import { useActionState } from "react";

import { updatePasswordAction } from "@/lib/actions/profile";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { FormMessage } from "@/components/common/form-message";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";

export function UpdatePasswordForm() {
  const [state, formAction, pending] = useActionState(
    updatePasswordAction,
    INITIAL_ACTION_STATE,
  );

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <div className="space-y-1">
        <PasswordInput
          name="senha"
          label="Nova senha"
          autoComplete="new-password"
          placeholder="Digite a nova senha"
          minLength={8}
          error={state.fieldErrors?.senha?.[0]}
        />
        {!state.fieldErrors?.senha ? (
          <p className="text-xs text-muted-foreground">Mínimo de 8 caracteres.</p>
        ) : null}
      </div>
      <PasswordInput
        name="confirmarSenha"
        label="Confirmar nova senha"
        autoComplete="new-password"
        placeholder="Repita a nova senha"
        error={state.fieldErrors?.confirmarSenha?.[0]}
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Alterar senha"}
      </Button>
    </form>
  );
}
