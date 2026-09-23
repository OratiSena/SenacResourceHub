"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search } from "lucide-react";

import { logoutAction } from "@/lib/actions/auth";
import type { AppNotification } from "@/lib/notifications/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { NotificationBell } from "@/components/layout/notification-bell";
import type { AppShellUser } from "@/components/layout/app-shell";

export function AppHeader({
  user,
  showAdmin,
  notifications,
}: {
  user: AppShellUser;
  showAdmin: boolean;
  notifications: AppNotification[];
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <header className="flex h-16 items-center gap-3 border-b border-border bg-card px-4 sm:px-6">
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileNavOpen(true)}
        >
          <Menu className="size-5" aria-hidden="true" />
          <span className="sr-only">Abrir menu de navegação</span>
        </Button>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navegação principal</SheetTitle>
          <AppSidebar showAdmin={showAdmin} />
        </SheetContent>
      </Sheet>

      <div className="relative hidden max-w-md flex-1 sm:block">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="Buscar equipamentos, laboratórios ou palavras-chave..."
          className="pl-9"
          aria-label="Buscar recursos"
        />
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
        <NotificationBell notifications={notifications} userId={user.id} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-muted"
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.iniciais}
                </AvatarFallback>
              </Avatar>
              <span className="hidden leading-tight sm:block">
                <span className="block text-sm font-medium">
                  {user.nome}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {user.subtitulo}
                </span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/perfil">Perfil</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => {
                logoutAction();
              }}
            >
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
