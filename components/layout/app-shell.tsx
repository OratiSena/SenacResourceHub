import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";

export interface AppShellUser {
  nome: string;
  /** Linha secundária sob o nome — categoria/vínculo ou e-mail. */
  subtitulo: string;
  iniciais: string;
  role: "user" | "admin";
}

/**
 * Shell principal da área autenticada: sidebar fixa (desktop) + topbar +
 * conteúdo. Em telas menores que `lg`, a sidebar fica escondida e o menu de
 * navegação passa a viver dentro do Sheet acionado pelo AppHeader.
 *
 * `user` vem de dados reais (profile) nas rotas da aplicação, e de
 * DEMO_USER apenas em /design-system — nunca misturar os dois.
 */
export function AppShell({
  user,
  children,
}: {
  user: AppShellUser;
  children: ReactNode;
}) {
  const showAdmin = user.role === "admin";

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-60 lg:shrink-0">
        <AppSidebar className="w-60" showAdmin={showAdmin} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-10">
          <AppHeader user={user} showAdmin={showAdmin} />
        </div>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
