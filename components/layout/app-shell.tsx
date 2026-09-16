import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";

/**
 * Shell principal da área autenticada: sidebar fixa (desktop) + topbar +
 * conteúdo. Em telas menores que `lg`, a sidebar fica escondida e o menu de
 * navegação passa a viver dentro do Sheet acionado pelo AppHeader.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-60 lg:shrink-0">
        <AppSidebar className="w-60" />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-10">
          <AppHeader />
        </div>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
