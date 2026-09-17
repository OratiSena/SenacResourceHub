import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getResourceDetailBySlug } from "@/lib/data/resources";
import { InDevelopmentPage } from "@/components/common/in-development";

/**
 * Placeholder mínimo (Prompt 6, seção 2) — a implementação real de
 * calendário e disponibilidade por período vem no Prompt 7. Já valida o
 * slug para não linkar para um recurso inexistente.
 */
export default async function ResourceCalendarioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resource = await getResourceDetailBySlug(slug);

  if (!resource) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/recursos/${slug}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Voltar para {resource.nome}
      </Link>

      <InDevelopmentPage
        eyebrow={resource.nome}
        title="Calendário e disponibilidade"
        description="A consulta de disponibilidade por horário e a criação de reservas para este recurso serão implementadas no Prompt 7."
      />
    </div>
  );
}
