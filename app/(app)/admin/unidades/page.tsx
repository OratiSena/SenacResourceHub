import { getAdminResourceOptions, getAdminUnitsByResource } from "@/lib/data/admin";
import { UNIT_STATUS_VALUES } from "@/lib/validations/admin";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { ResourcePicker } from "@/components/admin/resource-picker";
import { UnitFormDialog } from "@/components/admin/unit-form-dialog";
import { UnitStatusSelect } from "@/components/admin/unit-status-select";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
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

const STATUS_LABELS: Record<string, string> = {
  disponivel: "Operacional",
  manutencao: "Manutenção",
  inativa: "Inativa",
};

interface SearchParams {
  resourceId?: string;
  page?: string;
  search?: string;
  status?: string;
}

export default async function AdminUnidadesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const resources = await getAdminResourceOptions();
  const selectedId = params.resourceId ?? resources[0]?.id ?? "";
  const status = UNIT_STATUS_VALUES.includes(params.status as (typeof UNIT_STATUS_VALUES)[number])
    ? (params.status as (typeof UNIT_STATUS_VALUES)[number])
    : undefined;

  const { items: units, total, page, pageSize } = selectedId
    ? await getAdminUnitsByResource(selectedId, {
        page: params.page ? Number(params.page) : 1,
        search: params.search,
        status,
      })
    : { items: [], total: 0, page: 1, pageSize: 20 };

  const hasFilters = Boolean(params.search || status);

  function buildHref(overrides: Partial<SearchParams>) {
    const merged = { ...params, resourceId: selectedId, ...overrides };
    const qs = new URLSearchParams();
    if (merged.resourceId) qs.set("resourceId", merged.resourceId);
    if (merged.search) qs.set("search", merged.search);
    if (merged.status) qs.set("status", merged.status);
    if (merged.page && merged.page !== "1") qs.set("page", merged.page);
    return `/admin/unidades?${qs.toString()}`;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Unidades"
        description="Unidades físicas de cada recurso (a Oficina não possui unidades)."
        actions={selectedId ? <UnitFormDialog resourceId={selectedId} /> : undefined}
      />

      {resources.length === 0 ? (
        <EmptyState
          title="Nenhum recurso com unidades cadastrado."
          description="Crie um recurso em /admin/recursos primeiro."
        />
      ) : (
        <>
          <ResourcePicker resources={resources} selectedId={selectedId} />

          <form className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4">
            <input type="hidden" name="resourceId" value={selectedId} />
            <div className="min-w-48 flex-1 space-y-1.5">
              <label htmlFor="search" className="text-xs font-medium text-muted-foreground">
                Buscar por código
              </label>
              <Input id="search" name="search" defaultValue={params.search} placeholder="Ex.: OSC-01" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="status" className="text-xs font-medium text-muted-foreground">
                Status
              </label>
              <Select name="status" defaultValue={status ?? "todos"}>
                <SelectTrigger id="status" className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {UNIT_STATUS_VALUES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" size="sm">
              Filtrar
            </Button>
            {hasFilters ? (
              <Button asChild type="button" variant="ghost" size="sm">
                <a href={`/admin/unidades?resourceId=${selectedId}`}>Limpar filtros</a>
              </Button>
            ) : null}
          </form>

          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? "unidade encontrada" : "unidades encontradas"}
          </p>

          {units.length === 0 ? (
            <EmptyState
              title="Nenhuma unidade cadastrada para este recurso."
              description={
                hasFilters
                  ? "Tente ajustar a busca ou os filtros."
                  : "Use o botão acima para criar a primeira unidade."
              }
            />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {units.map((unit) => (
                    <TableRow key={unit.id}>
                      <TableCell className="font-mono font-medium text-navy">
                        {unit.codigo}
                      </TableCell>
                      <TableCell>
                        <UnitStatusSelect
                          unitId={unit.id}
                          codigo={unit.codigo}
                          status={unit.status}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <AdminPagination
            page={page}
            pageSize={pageSize}
            total={total}
            buildHref={(p) => buildHref({ page: String(p) })}
          />
        </>
      )}
    </div>
  );
}
