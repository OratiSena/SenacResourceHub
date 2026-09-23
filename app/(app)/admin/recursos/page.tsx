import { Pencil, Plus } from "lucide-react";

import { getAdminResources } from "@/lib/data/admin";
import { RESOURCE_TYPE_LABELS } from "@/lib/resources/resource-types";
import { RESOURCE_TYPE_VALUES } from "@/lib/validations/admin";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { ResourceFormDialog } from "@/components/admin/resource-form-dialog";
import { ResourceActiveToggle } from "@/components/admin/resource-active-toggle";
import { ResourceMediaPlaceholder } from "@/components/common/resource-media-placeholder";
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

interface SearchParams {
  page?: string;
  search?: string;
  tipo?: string;
  ativo?: string;
}

function buildHref(params: SearchParams, overrides: Partial<SearchParams>) {
  const merged = { ...params, ...overrides };
  const qs = new URLSearchParams();
  if (merged.search) qs.set("search", merged.search);
  if (merged.tipo) qs.set("tipo", merged.tipo);
  if (merged.ativo) qs.set("ativo", merged.ativo);
  if (merged.page && merged.page !== "1") qs.set("page", merged.page);
  const str = qs.toString();
  return `/admin/recursos${str ? `?${str}` : ""}`;
}

export default async function AdminRecursosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const tipo = RESOURCE_TYPE_VALUES.includes(params.tipo as (typeof RESOURCE_TYPE_VALUES)[number])
    ? (params.tipo as (typeof RESOURCE_TYPE_VALUES)[number])
    : undefined;
  const ativo = params.ativo === "true" || params.ativo === "false" ? params.ativo : undefined;

  const { items: resources, total, page, pageSize } = await getAdminResources({
    page: params.page ? Number(params.page) : 1,
    search: params.search,
    tipo,
    ativo,
  });

  const hasFilters = Boolean(params.search || tipo || ativo);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Recursos"
        description="Catálogo completo de recursos reserváveis."
        actions={
          <ResourceFormDialog
            trigger={
              <Button size="sm">
                <Plus aria-hidden="true" />
                Novo recurso
              </Button>
            }
          />
        }
      />

      <form className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="min-w-48 flex-1 space-y-1.5">
          <label htmlFor="filtroSearch" className="text-xs font-medium text-muted-foreground">
            Buscar por nome
          </label>
          <Input id="filtroSearch" name="search" defaultValue={params.search} placeholder="Ex.: Osciloscópio" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="filtroTipo" className="text-xs font-medium text-muted-foreground">
            Tipo
          </label>
          <Select name="tipo" defaultValue={tipo ?? "todos"}>
            <SelectTrigger id="filtroTipo" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              {RESOURCE_TYPE_VALUES.map((t) => (
                <SelectItem key={t} value={t}>
                  {RESOURCE_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="filtroAtivo" className="text-xs font-medium text-muted-foreground">
            Situação
          </label>
          <Select name="ativo" defaultValue={ativo ?? "todos"}>
            <SelectTrigger id="filtroAtivo" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas</SelectItem>
              <SelectItem value="true">Ativo</SelectItem>
              <SelectItem value="false">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" size="sm">
          Filtrar
        </Button>
        {hasFilters ? (
          <Button asChild type="button" variant="ghost" size="sm">
            <a href="/admin/recursos">Limpar filtros</a>
          </Button>
        ) : null}
      </form>

      <p className="text-sm text-muted-foreground">
        {total} {total === 1 ? "recurso encontrado" : "recursos encontrados"}
      </p>

      {resources.length === 0 ? (
        <EmptyState
          title="Nenhum recurso encontrado."
          description={
            hasFilters
              ? "Tente ajustar a busca ou os filtros."
              : "Cadastre o primeiro recurso para começar."
          }
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border border-border bg-card lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14"></TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Unidades</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell>
                      <div className="size-10 overflow-hidden rounded-lg">
                        <ResourceMediaPlaceholder
                          tipo={resource.tipo}
                          slug={resource.slug}
                          label={resource.nome}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-navy">
                      {resource.nome}
                    </TableCell>
                    <TableCell>{RESOURCE_TYPE_LABELS[resource.tipo]}</TableCell>
                    <TableCell>{resource.local ?? "—"}</TableCell>
                    <TableCell>
                      {resource.isSharedSpace
                        ? "Compartilhado"
                        : `${resource.operacionais}/${resource.totalUnidades}`}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          resource.ativo
                            ? "border-success/20 bg-success/10 text-success"
                            : "border-muted-foreground/20 bg-muted text-muted-foreground"
                        }
                      >
                        {resource.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <ResourceFormDialog
                          resource={resource}
                          trigger={
                            <Button variant="outline" size="sm">
                              <Pencil aria-hidden="true" />
                              Editar
                            </Button>
                          }
                        />
                        <ResourceActiveToggle
                          resourceId={resource.id}
                          nome={resource.nome}
                          ativo={resource.ativo}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3 lg:hidden">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="space-y-3 rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="size-10 shrink-0 overflow-hidden rounded-lg">
                    <ResourceMediaPlaceholder
                      tipo={resource.tipo}
                      slug={resource.slug}
                      label={resource.nome}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-navy">{resource.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {RESOURCE_TYPE_LABELS[resource.tipo]}
                      {resource.local ? ` · ${resource.local}` : ""}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      resource.ativo
                        ? "shrink-0 border-success/20 bg-success/10 text-success"
                        : "shrink-0 border-muted-foreground/20 bg-muted text-muted-foreground"
                    }
                  >
                    {resource.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Unidades:{" "}
                  {resource.isSharedSpace
                    ? "Compartilhado"
                    : `${resource.operacionais}/${resource.totalUnidades} operacionais`}
                </p>
                <div className="flex flex-wrap gap-2">
                  <ResourceFormDialog
                    resource={resource}
                    trigger={
                      <Button variant="outline" size="sm">
                        <Pencil aria-hidden="true" />
                        Editar
                      </Button>
                    }
                  />
                  <ResourceActiveToggle
                    resourceId={resource.id}
                    nome={resource.nome}
                    ativo={resource.ativo}
                  />
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
