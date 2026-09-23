import Link from "next/link";

import type { AdminReservationItem } from "@/lib/data/admin";
import { formatDataLocal, formatHoraLocal } from "@/lib/reservations/format";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";

export function UpcomingReservationsList({
  reservations,
}: {
  reservations: AdminReservationItem[];
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-navy">Próximas reservas</h2>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/reservas">Ver todas</Link>
        </Button>
      </div>

      {reservations.length === 0 ? (
        <EmptyState title="Nenhuma reserva futura no momento." />
      ) : (
        <ul className="space-y-2">
          {reservations.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-navy">{r.resourceNome}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {r.usuarioNome} · {formatDataLocal(r.dataHoraInicio)}{" "}
                  {formatHoraLocal(r.dataHoraInicio)}–{formatHoraLocal(r.dataHoraFim)}
                </p>
              </div>
              {!r.isSharedSpace && r.unitCodigo ? (
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {r.unitCodigo}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
