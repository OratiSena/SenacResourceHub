import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getResourceSummaryBySlug } from "@/lib/data/resources";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";

/**
 * Placeholder temporário (Prompt 5, seção 9) — só valida o slug e mostra o
 * nome do recurso. A página de detalhe completa (galeria, regras de uso,
 * preview 3D) vem no Prompt 6.
 */
export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resource = await getResourceSummaryBySlug(slug);

  if (!resource) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/recursos"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Voltar para Recursos
      </Link>

      <PageHeader
        eyebrow="Recursos"
        title={resource.nome}
        description="A página completa deste recurso — galeria, regras de uso e agendamento — será implementada no Prompt 6."
        actions={
          <Button asChild variant="outline">
            <Link href="/recursos">Ver todos os recursos</Link>
          </Button>
        }
      />
    </div>
  );
}
