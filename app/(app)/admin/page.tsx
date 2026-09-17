import Link from "next/link";
import { Boxes, CalendarCheck, Layers, Users } from "lucide-react";

import { requireAdminProfile } from "@/lib/auth/require-admin";
import { getAdminDashboardCounts } from "@/lib/data/admin";
import { MetricCard } from "@/components/common/metric-card";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";

export default async function AdminPage() {
  await requireAdminProfile();
  const counts = await getAdminDashboardCounts();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Admin"
        title="Área administrativa"
        description="Visão geral do sistema e atalhos de gestão."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={Boxes} label="Recursos" value={counts.recursos} />
        <MetricCard icon={Layers} label="Unidades físicas" value={counts.unidades} />
        <MetricCard
          icon={CalendarCheck}
          label="Reservas ativas"
          value={counts.reservasAtivas}
        />
        <MetricCard icon={Users} label="Usuários" value={counts.usuarios} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Button asChild variant="outline" className="h-auto justify-start py-4">
          <Link href="/admin/recursos">
            <Boxes />
            Gerenciar recursos
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto justify-start py-4">
          <Link href="/admin/unidades">
            <Layers />
            Gerenciar unidades
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto justify-start py-4">
          <Link href="/admin/reservas">
            <CalendarCheck />
            Gerenciar reservas
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto justify-start py-4">
          <Link href="/admin/usuarios">
            <Users />
            Gerenciar usuários
          </Link>
        </Button>
      </div>
    </div>
  );
}
