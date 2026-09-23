import type { ReactNode } from "react";

import { requireAdminProfile } from "@/lib/auth/require-admin";

/**
 * Guarda de rota única para toda a área /admin/** — server-side, redireciona
 * para "/" quando o usuário autenticado não é admin (app/(app)/layout.tsx já
 * garante que existe sessão; aqui só falta checar o role). Antes, cada
 * página chamava requireAdminProfile() individualmente (5 vezes
 * duplicadas) — centralizado aqui, continua sendo checado no servidor a
 * cada navegação, nunca só escondendo o link da sidebar. Mutações (Server
 * Actions) continuam chamando requireAdminProfile() de novo por conta
 * própria, já que actions não passam pela árvore de layout de páginas.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdminProfile();
  return <>{children}</>;
}
