import Link from "next/link";
import {
  Boxes,
  CalendarCheck,
  CalendarClock,
  Layers,
  ShieldCheck,
  Users,
} from "lucide-react";

import { getAdminDashboardData } from "@/lib/data/admin";
import { RESOURCE_TYPE_LABELS } from "@/lib/resources/resource-types";
import { BreakdownBarChart } from "@/components/admin/breakdown-bar-chart";
import { ReservationsWeekChart } from "@/components/admin/reservations-week-chart";
import { UpcomingReservationsList } from "@/components/admin/upcoming-reservations-list";
import { MetricCard } from "@/components/common/metric-card";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const SHORTCUTS = [
  { href: "/admin/recursos", label: "Gerenciar recursos", icon: Boxes },
  { href: "/admin/unidades", label: "Gerenciar unidades", icon: Layers },
  { href: "/admin/reservas", label: "Ver reservas", icon: CalendarCheck },
  { href: "/admin/usuarios", label: "Gerenciar usuários", icon: Users },
] as const;

export default async function AdminPage() {
  const { counts, statusBreakdown, next7Days, resourcesByType, upcomingReservations } =
    await getAdminDashboardData();

  const metrics = [
    { icon: Boxes, label: "Recursos ativos", value: counts.recursosAtivos },
    { icon: Layers, label: "Unidades operacionais", value: counts.unidadesOperacionais },
    { icon: CalendarClock, label: "Reservas futuras", value: counts.reservasFuturas },
    { icon: CalendarCheck, label: "Reservas em uso", value: counts.reservasEmUso },
    { icon: Users, label: "Usuários ativos", value: counts.usuariosAtivos },
    { icon: ShieldCheck, label: "Administradores", value: counts.administradores },
  ];

  const statusItems = [
    { label: "Futuras", value: statusBreakdown.futura, className: "bg-info" },
    { label: "Em uso", value: statusBreakdown.emUso, className: "bg-success" },
    { label: "Expiradas", value: statusBreakdown.expirada, className: "bg-muted-foreground" },
    { label: "Canceladas", value: statusBreakdown.cancelada, className: "bg-destructive" },
  ];

  const typeItems = resourcesByType.map((r) => ({
    label: RESOURCE_TYPE_LABELS[r.tipo],
    value: r.total,
    className: "bg-primary",
  }));

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        eyebrow="Admin"
        title="Painel Administrativo"
        description="Gerencie recursos, reservas, unidades e usuários do Senac ResourceHub."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {metrics.map((metric, i) => (
          <div
            key={metric.label}
            className="animate-in fade-in slide-in-from-bottom-2 duration-500"
            style={{ animationDelay: `${i * 50}ms`, animationFillMode: "backwards" }}
          >
            <MetricCard icon={metric.icon} label={metric.label} value={metric.value} />
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SHORTCUTS.map((shortcut) => (
          <Button
            key={shortcut.href}
            asChild
            variant="outline"
            className="h-auto justify-start py-4"
          >
            <Link href={shortcut.href}>
              <shortcut.icon aria-hidden="true" />
              {shortcut.label}
            </Link>
          </Button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="space-y-4">
            <h2 className="text-lg font-semibold text-navy">
              Reservas nos próximos 7 dias
            </h2>
            <ReservationsWeekChart days={next7Days} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-lg font-semibold text-navy">Reservas por status</h2>
            <BreakdownBarChart items={statusItems} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent>
            <UpcomingReservationsList reservations={upcomingReservations} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-lg font-semibold text-navy">Recursos por categoria</h2>
            {typeItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum recurso cadastrado ainda.
              </p>
            ) : (
              <BreakdownBarChart items={typeItems} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
