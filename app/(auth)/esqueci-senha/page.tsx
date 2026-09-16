"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft, Mail } from "lucide-react";

import { forgotPasswordAction } from "@/lib/actions/auth";
import { INITIAL_AUTH_ACTION_STATE } from "@/lib/actions/auth-state";
import { AuthLogo } from "@/components/auth/auth-logo";
import { FormMessage } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EsqueciSenhaPage() {
  const [state, formAction, pending] = useActionState(
    forgotPasswordAction,
    INITIAL_AUTH_ACTION_STATE,
  );

  return (
    <div className="space-y-6">
      <Link
        href="/login"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Voltar ao login
      </Link>

      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <AuthLogo />

        <h1 className="mt-6 text-xl font-bold text-navy">
          Recuperar senha
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Informe seu e-mail para receber as instruções de recuperação de
          senha.
        </p>

        <form action={formAction} className="mt-6 space-y-4" noValidate>
          <FormMessage state={state} />

          {state.status !== "success" ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu.nome@senac.br"
                    autoComplete="email"
                    required
                    className="pl-9"
                    aria-invalid={Boolean(state.fieldErrors?.email)}
                    aria-describedby={
                      state.fieldErrors?.email ? "email-error" : undefined
                    }
                  />
                </div>
                {state.fieldErrors?.email ? (
                  <p id="email-error" className="text-xs text-destructive">
                    {state.fieldErrors.email[0]}
                  </p>
                ) : null}
              </div>

              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Enviando..." : "Enviar instruções"}
              </Button>
            </>
          ) : (
            <Button asChild className="w-full">
              <Link href="/login">Voltar ao login</Link>
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
