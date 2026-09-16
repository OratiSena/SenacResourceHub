"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { Mail } from "lucide-react";

import { loginAction } from "@/lib/actions/auth";
import { INITIAL_AUTH_ACTION_STATE } from "@/lib/actions/auth-state";
import { AuthLogo } from "@/components/auth/auth-logo";
import { FormMessage } from "@/components/auth/form-message";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    INITIAL_AUTH_ACTION_STATE,
  );
  const searchParams = useSearchParams();
  const linkInvalido = searchParams.get("erro") === "link-invalido";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end text-sm">
        <span className="text-muted-foreground">Novo por aqui?&nbsp;</span>
        <Link
          href="/cadastro"
          className="font-medium text-primary hover:underline"
        >
          Criar conta
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <AuthLogo />

        <h1 className="mt-6 text-xl font-bold text-navy">
          Entrar na sua conta
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acesse o sistema e gerencie suas reservas.
        </p>

        <form action={formAction} className="mt-6 space-y-4" noValidate>
          {state.status === "idle" && linkInvalido ? (
            <FormMessage
              state={{
                status: "error",
                message:
                  "Este link não é mais válido. Solicite uma nova recuperação de senha, se for o caso.",
              }}
            />
          ) : (
            <FormMessage state={state} />
          )}

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

          <div>
            <PasswordInput
              name="senha"
              label="Senha"
              error={state.fieldErrors?.senha?.[0]}
            />
            <div className="mt-2 flex justify-end">
              <Link
                href="/esqueci-senha"
                className="text-sm font-medium text-primary hover:underline"
              >
                Esqueci minha senha?
              </Link>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
