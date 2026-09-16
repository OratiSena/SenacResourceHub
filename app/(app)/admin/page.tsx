import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth/current-profile";
import { PageHeader } from "@/components/common/page-header";

/**
 * Placeholder protegido (Prompt 4, seção 18) — o objetivo aqui é validar
 * autorização por role, não construir o dashboard admin. Esconder o link na
 * sidebar é só conveniência visual (ver AppSidebar); a proteção real é esta
 * checagem no servidor, que nunca confia em role vindo do cliente.
 */
export default async function AdminPage() {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  return (
    <PageHeader
      eyebrow="Admin"
      title="Área administrativa"
      description="Dashboard administrativo será implementado em etapa posterior."
    />
  );
}
