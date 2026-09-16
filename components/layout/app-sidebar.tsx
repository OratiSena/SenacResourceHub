"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  CalendarDays,
  ClipboardList,
  Home,
  Settings,
  UserRound,
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

// Visível sem checagem de role nesta etapa — é só demonstração visual do
// item de admin no menu (Prompt 3, seção 6). A restrição real de acesso será
// aplicada no servidor quando a autenticação/autorização for implementada.
const ADMIN_ITEM = { href: "/admin", label: "Admin", icon: Settings } as const;

function isItemActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar({ className }: { className?: string }) {
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

        <Separator className="my-3 bg-sidebar-border" />

        <Link
          href={ADMIN_ITEM.href}
          aria-current={
            isItemActive(pathname, ADMIN_ITEM.href) ? "page" : undefined
          }
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isItemActive(pathname, ADMIN_ITEM.href)
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          )}
        >
          <ADMIN_ITEM.icon className="size-4 shrink-0" aria-hidden="true" />
          {ADMIN_ITEM.label}
        </Link>
      </div>

      <div className="px-5 py-4 text-xs text-sidebar-foreground/50">
        Centro Universitário Senac
      </div>
    </nav>
  );
}
