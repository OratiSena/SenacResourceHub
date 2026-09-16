"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Mail, User } from "lucide-react";

import { signupAction } from "@/lib/actions/auth";
import { INITIAL_AUTH_ACTION_STATE } from "@/lib/actions/auth-state";
import { AuthLogo } from "@/components/auth/auth-logo";
import { FormMessage } from "@/components/auth/form-message";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CadastroPage() {
  const [state, formAction, pending] = useActionState(
    signupAction,
    INITIAL_AUTH_ACTION_STATE,
  );

  const cadastroConcluido = state.status === "success";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end text-sm">
        <span className="text-muted-foreground">Já tem conta?&nbsp;</span>
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Entrar
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <AuthLogo />

        <h1 className="mt-6 text-xl font-bold text-navy">Criar sua conta</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cadastre-se para reservar laboratórios e equipamentos do Senac.
        </p>

        {cadastroConcluido ? (
          <div className="mt-6 space-y-4">
            <FormMessage state={state} />
            <Button asChild className="w-full">
              <Link href="/login">Ir para o login</Link>
            </Button>
          </div>
        ) : (
          <form action={formAction} className="mt-6 space-y-4" noValidate>
            <FormMessage state={state} />

            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome completo</Label>
              <div className="relative">
                <User
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="nome"
                  name="nome"
                  placeholder="Seu nome completo"
                  autoComplete="name"
                  required
                  maxLength={100}
                  className="pl-9"
                  aria-invalid={Boolean(state.fieldErrors?.nome)}
                  aria-describedby={
                    state.fieldErrors?.nome ? "nome-error" : undefined
                  }
                />
              </div>
              {state.fieldErrors?.nome ? (
                <p id="nome-error" className="text-xs text-destructive">
                  {state.fieldErrors.nome[0]}
                </p>
              ) : null}
            </div>

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

            <PasswordInput
              name="senha"
              label="Senha"
              autoComplete="new-password"
              minLength={8}
              error={state.fieldErrors?.senha?.[0]}
            />

            <PasswordInput
              name="confirmarSenha"
              label="Confirmar senha"
              autoComplete="new-password"
              minLength={8}
              placeholder="Repita sua senha"
              error={state.fieldErrors?.confirmarSenha?.[0]}
            />

            <div className="space-y-1.5">
              <div className="flex items-start gap-2">
                <Checkbox id="aceitaTermos" name="aceitaTermos" required />
                <Label
                  htmlFor="aceitaTermos"
                  className="block text-sm leading-snug font-normal text-muted-foreground"
                >
                  Li e concordo com os{" "}
                  <Link href="/termos" className="text-primary hover:underline">
                    Termos de Uso
                  </Link>{" "}
                  e a{" "}
                  <Link
                    href="/privacidade"
                    className="text-primary hover:underline"
                  >
                    Política de Privacidade
                  </Link>
                  .
                </Label>
              </div>
              {state.fieldErrors?.aceitaTermos ? (
                <p className="text-xs text-destructive">
                  {state.fieldErrors.aceitaTermos[0]}
                </p>
              ) : null}
            </div>

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
