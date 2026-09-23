import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AuthLogo } from "@/components/auth/auth-logo";

/**
 * Estrutura compartilhada por /termos e /privacidade: cabeçalho com logo,
 * título, aviso de que é um projeto acadêmico, e um link de volta claro —
 * nenhuma tela pode ser beco sem saída (Prompt 4, seção 21).
 */
export function LegalPage({
  title,
  subtitle,
  backHref = "/cadastro",
  backLabel = "Voltar ao cadastro",
  children,
}: {
  title: string;
  /** Sobrescreve o aviso padrão de "projeto acadêmico" abaixo do título. */
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-4 py-10 sm:px-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {backLabel}
      </Link>

      <div>
        <AuthLogo />
        <h1 className="mt-8 text-2xl font-bold text-navy">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {subtitle ??
            "Senac ResourceHub é um projeto acadêmico da disciplina Engenharia de Software II — este documento é simplificado para fins didáticos."}
        </p>
      </div>

      <div className="space-y-4 text-sm leading-relaxed text-foreground">
        {children}
      </div>

      <Link
        href={backHref}
        className="inline-flex h-9 w-fit items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80"
      >
        {backLabel}
      </Link>
    </div>
  );
}
