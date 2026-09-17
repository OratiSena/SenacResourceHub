import { redirect } from "next/navigation";

import { getCurrentProfile, type CurrentProfile } from "@/lib/auth/current-profile";

/**
 * Checagem de role no servidor para toda página /admin/* — nunca confiar só
 * em esconder o link da sidebar (ver AppSidebar). Redireciona para "/" (não
 * "/login", já que app/(app)/layout.tsx garante sessão) quando o usuário
 * autenticado não é admin.
 */
export async function requireAdminProfile(): Promise<CurrentProfile> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    redirect("/");
  }
  return profile;
}
