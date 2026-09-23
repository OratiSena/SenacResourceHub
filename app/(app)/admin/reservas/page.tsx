import { X } from "lucide-react";

import {
  getAdminAllResourceOptions,
  getAdminReservations,
  type AdminReservationStatusFilter,
} from "@/lib/data/admin";
import { deriveReservationStatus, formatDataLocal, formatHoraLocal } from "@/lib/reservations/format";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminReservationRowActions } from "@/components/admin/admin-reservation-row-actions";
import { ReservationStatusBadge } from "@/components/reservas/reservation-status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATUS_OPTIONS: { value: AdminReservationStatusFilter; label: string }[] = [
  { value: "futura", label: "Futura" },
  { value: "em_uso", label: "Em uso" },
  { value: "expirada", label: "Expirada" },
  { value: "cancelada", label: "Cancelada" },
];

interface SearchParams {
  page?: string;
  resource?: string;
  usuario?: string;
  data?: string;
  status?: string;
}

function buildHref(params: SearchParams, overrides: Partial<SearchParams>) {
  const merged = { ...params, ...overrides };
  const qs = new URLSearchParams();
  if (merged.resource) qs.set("resource", merged.resource);
  if (merged.usuario) qs.set("usuario", merged.usuario);
  if (merged.data) qs.set("data", merged.data);
  if (merged.status) qs.set("status", merged.status);
  if (merged.page && merged.page !== "1") qs.set("page", merged.page);
  const str = qs.toString();
  return `/admin/reservas${str ? `?${str}` : ""}`;
}

export default async function AdminReservasPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const status = STATUS_OPTIONS.some((o) => o.value === params.status)
    ? (params.status as AdminReservationStatusFilter)
    : undefined;
  // O <Select> submete "todos" quando nenhum recurso específico é escolhido
  // (não existe um jeito nativo de "sem valor" num form GET) — precisa ser
  // tratado como ausência de filtro, nunca passado adiante como um id.
  const resourceId = params.resource && params.resource !== "todos" ? params.resource : undefined;

  const [resourceOptions, { items: reservations, total, page, pageSize }] = await Promise.all([
    getAdminAllResourceOptions(),
    getAdminReservations({
      page: params.page ? Number(params.page) : 1,
      resourceId,
      usuario: params.usuario,
      data: params.data,
      status,
    }),
  ]);

  const selectedResourceNome = resourceOptions.find((r) => r.id === resourceId)?.nome;
  const chips: { key: keyof SearchParams; label: string }[] = [];
  if (resourceId) chips.push({ key: "resource", label: `Recurso: ${selectedResourceNome ?? "—"}` });
  if (params.usuario) chips.push({ key: "usuario", label: `Usuário: ${params.usuario}` });
  if (params.data) chips.push({ key: "data", label: `Data: ${params.data.split("-").reverse().join("/")}` });
  if (status) chips.push({ key: "status", label: `Status: ${STATUS_OPTIONS.find((o) => o.value === status)?.label}` });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Reservas"
        description="Consulte, filtre e cancele reservas de qualquer usuário."
      />

      <form className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="space-y-1.5">
          <label htmlFor="resource" className="text-xs font-medium text-muted-foreground">
            Recurso
          </label>
          <Select name="resource" defaultValue={params.resource ?? "todos"}>
            <SelectTrigger id="resource" className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os recursos</SelectItem>
              {resourceOptions.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-40 space-y-1.5">
          <label htmlFor="usuario" className="text-xs font-medium text-muted-foreground">
            Usuário (nome ou e-mail)
          </label>
          <Input id="usuario" name="usuario" defaultValue={params.usuario} placeholder="Ex.: Ana Silva" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="data" className="text-xs font-medium text-muted-foreground">
            Data
          </label>
          <Input id="data" name="data" type="date" defaultValue={params.data} className="w-40" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="status" className="text-xs font-medium text-muted-foreground">
            Status
          </label>
          <Select name="status" defaultValue={status ?? "todos"}>
            <SelectTrigger id="status" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" size="sm">
          Filtrar
        </Button>
        {chips.length > 0 ? (
          <Button asChild type="button" variant="ghost" size="sm">
            <a href="/admin/reservas">Limpar filtros</a>
          </Button>
        ) : null}
      </form>

      {chips.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <a key={chip.key} href={buildHref(params, { [chip.key]: undefined, page: "1" })}>
              <Badge variant="outline" className="gap-1 border-primary/20 bg-primary/10 text-primary">
                {chip.label}
                <X className="size-3" aria-hidden="true" />
              </Badge>
            </a>
          ))}
        </div>
      ) : null}

      <p className="text-sm text-muted-foreground">
        {total} {total === 1 ? "reserva encontrada" : "reservas encontradas"}
      </p>

      {reservations.length === 0 ? (
        <EmptyState
          title="Nenhuma reserva corresponde aos filtros."
          description={chips.length > 0 ? "Tente ajustar ou limpar os filtros." : "Ainda não há reservas no sistema."}
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border border-border bg-card lg:block">
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
                        <p className="text-xs text-muted-foreground">{r.usuarioEmail}</p>
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
                      <ReservationStatusBadge
                        status={deriveReservationStatus({
                          status: r.status,
                          data_hora_inicio: r.dataHoraInicio,
                          data_hora_fim: r.dataHoraFim,
                        })}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <AdminReservationRowActions reservation={r} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3 lg:hidden">
            {reservations.map((r) => (
              <div
                key={r.id}
                className="space-y-3 rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-navy">{r.resourceNome}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.usuarioNome}
                      {r.usuarioEmail ? ` · ${r.usuarioEmail}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <ReservationStatusBadge
                      status={deriveReservationStatus({
                        status: r.status,
                        data_hora_inicio: r.dataHoraInicio,
                        data_hora_fim: r.dataHoraFim,
                      })}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDataLocal(r.dataHoraInicio)} · {formatHoraLocal(r.dataHoraInicio)}–
                  {formatHoraLocal(r.dataHoraFim)} ·{" "}
                  {r.isSharedSpace ? "Uso compartilhado" : (r.unitCodigo ?? "—")}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <AdminReservationRowActions reservation={r} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <AdminPagination
        page={page}
        pageSize={pageSize}
        total={total}
        buildHref={(p) => buildHref(params, { page: String(p) })}
      />
    </div>
  );
}
