import { Pencil, Plus } from "lucide-react";

import { requireAdminProfile } from "@/lib/auth/require-admin";
import { getAdminResources } from "@/lib/data/admin";
import { RESOURCE_TYPE_LABELS } from "@/lib/resources/resource-types";
import { PageHeader } from "@/components/common/page-header";
import { ResourceFormDialog } from "@/components/admin/resource-form-dialog";
import { ResourceActiveToggle } from "@/components/admin/resource-active-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminRecursosPage() {
  await requireAdminProfile();
  const resources = await getAdminResources();

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

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
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
                <TableCell className="font-medium text-navy">
                  {resource.nome}
                </TableCell>
                <TableCell>{RESOURCE_TYPE_LABELS[resource.tipo]}</TableCell>
                <TableCell>{resource.local ?? "—"}</TableCell>
                <TableCell>
                  {resource.isSharedSpace ? "Compartilhado" : resource.totalUnidades}
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
                      ativo={resource.ativo}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
