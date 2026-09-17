import { requireAdminProfile } from "@/lib/auth/require-admin";
import { getAdminReservations } from "@/lib/data/admin";
import { formatDataLocal, formatHoraLocal } from "@/lib/reservations/format";
import { AdminCancelReservationButton } from "@/components/admin/admin-cancel-reservation-button";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminReservasPage() {
  await requireAdminProfile();
  const reservations = await getAdminReservations();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Reservas"
        description="Últimas 200 reservas do sistema, mais recentes primeiro."
      />

      {reservations.length === 0 ? (
        <EmptyState title="Nenhuma reserva registrada ainda." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Recurso</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Fim</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <p className="font-medium text-navy">{r.usuarioNome}</p>
                    {r.usuarioEmail ? (
                      <p className="text-xs text-muted-foreground">
                        {r.usuarioEmail}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell>{r.resourceNome}</TableCell>
                  <TableCell>
                    {r.isSharedSpace ? "Compartilhado" : (r.unitCodigo ?? "—")}
                  </TableCell>
                  <TableCell>
                    {formatDataLocal(r.dataHoraInicio)} {formatHoraLocal(r.dataHoraInicio)}
                  </TableCell>
                  <TableCell>{formatHoraLocal(r.dataHoraFim)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        r.status === "ATIVA"
                          ? "border-success/20 bg-success/10 text-success"
                          : "border-destructive/20 bg-destructive/10 text-destructive"
                      }
                    >
                      {r.status === "ATIVA" ? "Ativa" : "Cancelada"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {r.status === "ATIVA" ? (
                      <AdminCancelReservationButton reservationId={r.id} />
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
