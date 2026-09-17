import { requireAdminProfile } from "@/lib/auth/require-admin";
import { getAdminResourceOptions, getAdminUnitsByResource } from "@/lib/data/admin";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { ResourcePicker } from "@/components/admin/resource-picker";
import { UnitFormDialog } from "@/components/admin/unit-form-dialog";
import { UnitStatusSelect } from "@/components/admin/unit-status-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminUnidadesPage({
  searchParams,
}: {
  searchParams: Promise<{ resourceId?: string }>;
}) {
  await requireAdminProfile();
  const { resourceId: resourceIdParam } = await searchParams;

  const resources = await getAdminResourceOptions();
  const selectedId = resourceIdParam ?? resources[0]?.id ?? "";
  const units = selectedId ? await getAdminUnitsByResource(selectedId) : [];

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

          {units.length === 0 ? (
            <EmptyState
              title="Nenhuma unidade cadastrada para este recurso."
              description="Use o botão acima para criar a primeira unidade."
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
                        <UnitStatusSelect unitId={unit.id} status={unit.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
