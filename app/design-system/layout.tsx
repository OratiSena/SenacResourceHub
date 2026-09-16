import type { ReactNode } from "react";

import { DEMO_USER } from "@/lib/demo-data";
import { AppShell } from "@/components/layout/app-shell";

/**
 * Rota de desenvolvimento (Prompt 3, seção 13): existe só para validar a
 * identidade visual e os componentes-base antes de construir as telas
 * finais. Não aparece no menu principal e não deve ser linkada a partir de
 * nenhuma tela real do produto.
 *
 * Único lugar do projeto que ainda usa DEMO_USER — role fixado como "admin"
 * apenas para exibir o item Admin da sidebar como demonstração visual (ver
 * Prompt 3, seção 6). Nenhuma rota real deve misturar este dado fictício com
 * o profile autenticado de verdade.
 */
export default function DesignSystemLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AppShell
      user={{
        nome: DEMO_USER.nome,
        subtitulo: DEMO_USER.papel,
        iniciais: DEMO_USER.iniciais,
        role: "admin",
      }}
    >
      {children}
    </AppShell>
  );
}
