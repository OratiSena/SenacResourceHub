import type { CurrentProfile } from "@/lib/auth/current-profile";
import { getAdminRecentReservationActivity, getAdminDashboardData } from "@/lib/data/admin";
import { getMyReservationsForNotifications } from "@/lib/data/reservations";
import { deriveReservationStatus, formatDataLocal, formatHoraLocal } from "@/lib/reservations/format";
import type { AppNotification } from "@/lib/notifications/types";

const RECENT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const UPCOMING_WINDOW_MS = 48 * 60 * 60 * 1000;
const MAX_NOTIFICATIONS = 12;

function isWithin(timestamp: string | null, windowMs: number, now: number): boolean {
  if (!timestamp) return false;
  const t = new Date(timestamp).getTime();
  return now - t >= 0 && now - t <= windowMs;
}

/**
 * Notificações a partir das próprias reservas da pessoa (comum ou admin):
 * criada recentemente, cancelada recentemente, próxima do início, concluída
 * recentemente. Tudo derivado de dados reais já existentes (created_at,
 * cancelado_em, data_hora_inicio/fim) — nenhum evento é inventado.
 */
async function buildOwnReservationNotifications(
  userId: string,
  now: number,
): Promise<AppNotification[]> {
  const reservations = await getMyReservationsForNotifications(userId);
  const notifications: AppNotification[] = [];

  for (const r of reservations) {
    const derived = deriveReservationStatus({
      status: r.status,
      data_hora_inicio: r.dataHoraInicio,
      data_hora_fim: r.dataHoraFim,
    });

    if (r.status === "ATIVA" && isWithin(r.createdAt, RECENT_WINDOW_MS, now)) {
      notifications.push({
        id: `created:${r.id}`,
        title: "Reserva criada com sucesso",
        description: `${r.resourceNome} · ${formatDataLocal(r.dataHoraInicio)} às ${formatHoraLocal(r.dataHoraInicio)}`,
        timestamp: r.createdAt,
        tone: "success",
        href: "/minhas-reservas",
        actionLabel: "Ver minhas reservas",
      });
    }

    if (derived === "CANCELADA" && isWithin(r.canceladoEm, RECENT_WINDOW_MS, now)) {
      notifications.push({
        id: `cancelled:${r.id}`,
        title: "Reserva cancelada",
        description: `${r.resourceNome} · ${formatDataLocal(r.dataHoraInicio)}`,
        timestamp: r.canceladoEm!,
        tone: "destructive",
        href: "/minhas-reservas",
        actionLabel: "Ver minhas reservas",
      });
    }

    if (derived === "FUTURA") {
      const inicio = new Date(r.dataHoraInicio).getTime();
      if (inicio - now <= UPCOMING_WINDOW_MS) {
        notifications.push({
          id: `reminder:${r.id}`,
          title: "Reserva se aproxima",
          description: `${r.resourceNome} · ${formatDataLocal(r.dataHoraInicio)} às ${formatHoraLocal(r.dataHoraInicio)}`,
          timestamp: r.dataHoraInicio,
          tone: "warning",
          href: "/minhas-reservas",
          actionLabel: "Ver minhas reservas",
        });
      }
    }

    if (derived === "EXPIRADA" && isWithin(r.dataHoraFim, RECENT_WINDOW_MS, now)) {
      notifications.push({
        id: `completed:${r.id}`,
        title: "Reserva concluída",
        description: `${r.resourceNome} · ${formatDataLocal(r.dataHoraInicio)}`,
        timestamp: r.dataHoraFim,
        tone: "info",
        href: "/minhas-reservas",
        actionLabel: "Ver minhas reservas",
      });
    }
  }

  if (reservations.length === 0) {
    notifications.push({
      id: "welcome",
      title: "Bem-vindo ao Senac ResourceHub",
      description: "Explore os recursos disponíveis e faça sua primeira reserva.",
      timestamp: new Date(now).toISOString(),
      tone: "info",
      href: "/recursos",
      actionLabel: "Ver recursos",
    });
  }

  return notifications;
}

/**
 * Notificações administrativas: atividade recente de reservas de qualquer
 * usuário (criadas/canceladas nos últimos 7 dias) e um resumo de recursos em
 * uso agora. Não inclui promoção/remoção de admin ou desativação de recurso
 * porque o banco não guarda um carimbo específico para esses eventos
 * (`updated_at` muda por qualquer edição, não só essas) — mostrar isso como
 * notificação seria inventar um dado que não existe de fato.
 */
async function buildAdminNotifications(now: number): Promise<AppNotification[]> {
  const sinceISO = new Date(now - RECENT_WINDOW_MS).toISOString();
  const [activity, dashboard] = await Promise.all([
    getAdminRecentReservationActivity(sinceISO),
    getAdminDashboardData(),
  ]);

  const notifications: AppNotification[] = [];

  for (const item of activity) {
    if (item.status === "ATIVA" && isWithin(item.createdAt, RECENT_WINDOW_MS, now)) {
      notifications.push({
        id: `admin-created:${item.id}`,
        title: "Nova reserva",
        description: `${item.usuarioNome} · ${item.resourceNome} · ${formatDataLocal(item.dataHoraInicio)}`,
        timestamp: item.createdAt,
        tone: "info",
        href: "/admin/reservas",
        actionLabel: "Ver reservas",
      });
    }
    if (item.status === "CANCELADA" && isWithin(item.canceladoEm, RECENT_WINDOW_MS, now)) {
      notifications.push({
        id: `admin-cancelled:${item.id}`,
        title: "Reserva cancelada",
        description: `${item.usuarioNome} · ${item.resourceNome} · ${formatDataLocal(item.dataHoraInicio)}`,
        timestamp: item.canceladoEm!,
        tone: "destructive",
        href: "/admin/reservas",
        actionLabel: "Ver reservas",
      });
    }
  }

  if (dashboard.counts.reservasEmUso > 0) {
    notifications.push({
      id: "admin-em-uso",
      title: "Recursos em uso agora",
      description: `${dashboard.counts.reservasEmUso} reserva(s) em andamento neste momento.`,
      timestamp: new Date(now).toISOString(),
      tone: "info",
      href: "/admin",
      actionLabel: "Ver dashboard admin",
    });
  }

  return notifications;
}

export async function getNotificationsForProfile(
  profile: CurrentProfile,
): Promise<AppNotification[]> {
  const now = Date.now();

  const own = await buildOwnReservationNotifications(profile.id, now);
  const admin = profile.role === "admin" ? await buildAdminNotifications(now) : [];

  return [...own, ...admin]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, MAX_NOTIFICATIONS);
}
