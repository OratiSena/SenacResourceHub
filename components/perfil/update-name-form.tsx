"use client";

import { useActionState } from "react";

import { updateNameAction } from "@/lib/actions/profile";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { FormMessage } from "@/components/common/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function UpdateNameForm({ nomeAtual }: { nomeAtual: string }) {
  const [state, formAction, pending] = useActionState(
    updateNameAction,
    INITIAL_ACTION_STATE,
  );

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <div className="space-y-1.5">
        <Label htmlFor="nome">Nome</Label>
        <Input
          id="nome"
          name="nome"
          defaultValue={nomeAtual}
          required
          maxLength={100}
          aria-invalid={Boolean(state.fieldErrors?.nome)}
        />
        {state.fieldErrors?.nome ? (
          <p className="text-xs text-destructive">{state.fieldErrors.nome[0]}</p>
        ) : null}
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar nome"}
      </Button>
    </form>
  );
}
