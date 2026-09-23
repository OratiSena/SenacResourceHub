"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Bell, Ban, CheckCircle2, Info, TriangleAlert } from "lucide-react";

import type { AppNotification, NotificationTone } from "@/lib/notifications/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "cn";

// Estado "lida/não lida" vive no localStorage do navegador (por usuário),
// sincronizado via useSyncExternalStore — evita setState dentro de efeito e
// evita divergência entre a renderização do servidor (sem localStorage) e a
// primeira renderização no cliente.
const EMPTY_SET: ReadonlySet<string> = new Set();
const readIdsCache = new Map<string, ReadonlySet<string>>();
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getServerSnapshot(): ReadonlySet<string> {
  return EMPTY_SET;
}

function readSnapshot(userId: string): ReadonlySet<string> {
  const cached = readIdsCache.get(userId);
  if (cached) return cached;
  let ids: ReadonlySet<string> = EMPTY_SET;
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) ids = new Set(parsed);
  } catch {
    ids = EMPTY_SET;
  }
  readIdsCache.set(userId, ids);
  return ids;
}

function writeReadIds(userId: string, ids: ReadonlySet<string>) {
  readIdsCache.set(userId, ids);
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify([...ids]));
  } catch {
    // localStorage indisponível (modo privado, storage bloqueado) — a
    // experiência continua funcionando, só não persiste entre sessões.
  }
  notifyListeners();
}

const TONE_ICON: Record<NotificationTone, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  destructive: Ban,
};

const TONE_CLASSNAME: Record<NotificationTone, string> = {
  info: "bg-info/10 text-info",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

function storageKey(userId: string) {
  return `resourcehub:notifications-read:${userId}`;
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `há ${diffH} h`;
  const diffD = Math.round(diffH / 24);
  if (diffD < 7) return `há ${diffD} d`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function NotificationBell({
  notifications,
  userId,
}: {
  notifications: AppNotification[];
  userId: string;
}) {
  const readIds = useSyncExternalStore(
    subscribe,
    () => readSnapshot(userId),
    getServerSnapshot,
  );

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  function markAllAsRead() {
    writeReadIds(userId, new Set(notifications.map((n) => n.id)));
  }

  function markAsRead(id: string) {
    if (readIds.has(id)) return;
    const next = new Set(readIds);
    next.add(id);
    writeReadIds(userId, next);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={
            unreadCount > 0
              ? `Notificações, ${unreadCount} não lida(s)`
              : "Notificações"
          }
          className="relative"
        >
          <Bell className="size-5" aria-hidden="true" />
          {unreadCount > 0 ? (
            <span
              className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground"
              aria-hidden="true"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-w-[calc(100vw-2rem)] p-0"
      >
        <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
          <p className="text-sm font-semibold text-navy">Notificações</p>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-xs font-medium text-primary hover:underline"
            >
              Marcar todas como lidas
            </button>
          ) : null}
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <Bell className="size-8 text-muted-foreground/40" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              Você não possui notificações no momento.
            </p>
          </div>
        ) : (
          <ul className="max-h-96 overflow-y-auto py-1">
            {notifications.map((n) => {
              const Icon = TONE_ICON[n.tone];
              const isRead = readIds.has(n.id);
              return (
                <li
                  key={n.id}
                  className={cn(
                    "flex gap-2.5 px-3 py-2.5",
                    !isRead && "bg-accent/40",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
                      TONE_CLASSNAME[n.tone],
                    )}
                    aria-hidden="true"
                  >
                    <Icon className="size-3.5" />
                  </span>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-navy">{n.title}</p>
                      {!isRead ? (
                        <span
                          className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                          aria-hidden="true"
                        />
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground">{n.description}</p>
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <span className="text-xs text-muted-foreground/70">
                        {formatRelativeTime(n.timestamp)}
                      </span>
                      {n.href && n.actionLabel ? (
                        <Link
                          href={n.href}
                          onClick={() => markAsRead(n.id)}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          {n.actionLabel}
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
