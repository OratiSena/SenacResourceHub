export type NotificationTone = "info" | "success" | "warning" | "destructive";

export interface AppNotification {
  /** Estável entre carregamentos — usado para marcar como lida no localStorage. */
  id: string;
  title: string;
  description: string;
  /** ISO — usado para ordenar e exibir tempo relativo. */
  timestamp: string;
  tone: NotificationTone;
  href?: string;
  actionLabel?: string;
}
