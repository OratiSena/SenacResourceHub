import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";

/**
 * Rota de desenvolvimento (Prompt 3, seção 13): existe só para validar a
 * identidade visual e os componentes-base antes de construir as telas
 * finais. Não aparece no menu principal e não deve ser linkada a partir de
 * nenhuma tela real do produto.
 */
export default function DesignSystemLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
