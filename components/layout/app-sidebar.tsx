"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  Home,
  LayoutDashboard,
  Layers,
  UserRound,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/recursos", label: "Recursos", icon: Boxes },
  { href: "/calendario", label: "Calendário", icon: CalendarDays },
  { href: "/minhas-reservas", label: "Minhas Reservas", icon: ClipboardList },
  { href: "/perfil", label: "Perfil", icon: UserRound },
] as const;

// Visibilidade real controlada por `showAdmin` (calculado a partir do role
// do profile — ver AppShell). Isso é só conveniência visual: toda a área
// /admin/** se protege sozinha no servidor (ver app/(app)/admin/layout.tsx),
// independentemente do que a sidebar mostra ou esconde.
const ADMIN_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/recursos", label: "Recursos", icon: Boxes },
  { href: "/admin/unidades", label: "Unidades", icon: Layers },
  { href: "/admin/reservas", label: "Reservas", icon: CalendarCheck },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
] as const;

function isItemActive(pathname: string, href: string) {
  // "/" e "/admin" são raízes exatas — sem isso, "/admin" ficaria marcado
  // como ativo em qualquer sub-rota (/admin/recursos, /admin/usuarios...).
  if (href === "/" || href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar({
  className,
  showAdmin = false,
}: {
  className?: string;
  showAdmin?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação principal"
      className={cn(
        "flex h-full flex-col bg-sidebar text-sidebar-foreground",
        className,
      )}
    >
      <div className="flex items-center gap-2 px-5 py-6">
        <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
          RH
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">
            Senac ResourceHub
          </p>
          <p className="text-xs text-sidebar-foreground/60">
            Reservas de recursos
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-3">
        {NAV_ITEMS.map((item) => {
          const active = isItemActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}

        {showAdmin ? (
          <>
            <Separator className="my-3 bg-sidebar-border" />
            <p className="px-3 pb-1 text-xs font-semibold tracking-wide text-sidebar-foreground/50 uppercase">
              Administração
            </p>
            {ADMIN_ITEMS.map((item) => {
              const active = isItemActive(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </>
        ) : null}
      </div>

      <div className="px-5 py-4 text-xs text-sidebar-foreground/50">
        Centro Universitário Senac
      </div>
    </nav>
  );
}
