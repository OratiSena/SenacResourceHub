import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { AuthLogo } from "@/components/auth/auth-logo";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

/**
 * Só renderiza o formulário se o usuário chegou por um link de recuperação
 * válido (que já estabelece uma sessão temporária via /auth/confirm — ver
 * seção "confirmação de e-mail" em documentacao/decisoes/autenticacao.md).
 * Sem sessão, mostra um estado claro de link inválido/expirado em vez do
 * formulário (Prompt 4, seções 16 e 22).
 */
export default async function RedefinirSenhaPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    return (
      <div className="space-y-6">
        <Link
          href="/esqueci-senha"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar
        </Link>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <AuthLogo />
          <h1 className="mt-6 text-xl font-bold text-navy">
            Link inválido ou expirado
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Este link de redefinição de senha não é mais válido. Solicite uma
            nova recuperação de senha.
          </p>
          <Link
            href="/esqueci-senha"
            className="mt-6 inline-flex h-9 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            Solicitar nova recuperação
          </Link>
        </div>
      </div>
    );
  }

  return <ResetPasswordForm />;
}
