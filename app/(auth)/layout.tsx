import type { ReactNode } from "react";

import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";

/**
 * Layout público das telas de autenticação (login, cadastro, esqueci-senha,
 * redefinir-senha). Deliberadamente sem sidebar/header/AppShell — identidade
 * visual própria (Prompt 4, seção 20).
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <AuthBrandPanel />
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
