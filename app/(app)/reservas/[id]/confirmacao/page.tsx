import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { getMyReservationById } from "@/lib/data/reservations";
import {
  formatDataLocal,
  formatDiaSemanaLocal,
  formatHoraLocal,
} from "@/lib/reservations/format";
import { Button } from "@/components/ui/button";

export default async function ReservationConfirmacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reservation = await getMyReservationById(id);

  if (!reservation) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-8">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-success/20 bg-success/5 p-8 text-center">
        <CheckCircle2 className="size-12 text-success" aria-hidden="true" />
        <h1 className="text-xl font-bold text-navy">Reserva confirmada!</h1>
        <p className="text-sm text-muted-foreground">
          Sua reserva foi registrada com sucesso.
        </p>
      </div>

      <dl className="space-y-3 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-sm text-muted-foreground">Recurso</dt>
          <dd className="text-sm font-semibold text-navy">
            {reservation.resourceNome}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-sm text-muted-foreground">Data</dt>
          <dd className="text-sm font-semibold text-navy capitalize">
            {formatDiaSemanaLocal(reservation.dataHoraInicio)},{" "}
            {formatDataLocal(reservation.dataHoraInicio)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-sm text-muted-foreground">Horário</dt>
          <dd className="text-sm font-semibold text-navy">
            {formatHoraLocal(reservation.dataHoraInicio)} –{" "}
            {formatHoraLocal(reservation.dataHoraFim)}
          </dd>
        </div>
        {!reservation.isSharedSpace && reservation.unitCodigo ? (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-sm text-muted-foreground">Unidade</dt>
            <dd className="font-mono text-sm font-semibold text-navy">
              {reservation.unitCodigo}
            </dd>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-4">
          <dt className="text-sm text-muted-foreground">Finalidade</dt>
          <dd className="text-right text-sm font-semibold text-navy">
            {reservation.finalidade}
          </dd>
        </div>
        {reservation.observacoes ? (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-sm text-muted-foreground">Observações</dt>
            <dd className="text-right text-sm text-navy">
              {reservation.observacoes}
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild variant="outline">
          <Link href="/">Voltar para Home</Link>
        </Button>
        <Button asChild>
          <Link href="/minhas-reservas">Ver minhas reservas</Link>
        </Button>
      </div>
    </div>
  );
}
