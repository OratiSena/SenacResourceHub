import { getActiveResources } from "@/lib/data/resources";
import { PageHeader } from "@/components/common/page-header";
import { ResourceCatalog } from "@/components/recursos/resource-catalog";

export default async function RecursosPage() {
  const resources = await getActiveResources();

  return (
    <div className="space-y-2">
      <PageHeader
        title="Explorar Recursos"
        description="Encontre e reserve laboratórios, equipamentos e kits para seus projetos."
      />
      <ResourceCatalog resources={resources} />
    </div>
  );
}
