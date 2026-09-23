import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth/current-profile";
import { getNotificationsForProfile } from "@/lib/notifications/get-notifications";
import { AppShell, type AppShellUser } from "@/components/layout/app-shell";

function buildInitials(nome: string) {
  const parts = nome.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

/**
 * Layout da área autenticada real (Home, Admin e futuramente Recursos,
 * Calendário, Minhas Reservas, Perfil). Revalida a sessão aqui também, além
 * do proxy — nunca confiar apenas no proxy para autorização (ver
 * lib/supabase/proxy.ts e a nota da documentação oficial do Next.js sobre
 * Proxy).
 */
export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  const user: AppShellUser = {
    id: profile.id,
    nome: profile.nome,
    subtitulo:
      profile.role === "admin"
        ? "Administrador · Senac"
        : (profile.categoria ?? "Aluno · Senac"),
    iniciais: buildInitials(profile.nome),
    role: profile.role,
  };

  const notifications = await getNotificationsForProfile(profile);

  return (
    <AppShell user={user} notifications={notifications}>
      {children}
    </AppShell>
  );
}
