import { Construction } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";

/**
 * Placeholder mínimo para rotas já linkadas na sidebar mas ainda não
 * implementadas (Prompt 5, seção 10) — evita 404 sem gastar tempo desenhando
 * a tela final antes da hora.
 */
export function InDevelopmentPage({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow={eyebrow} title={title} />
      <EmptyState icon={Construction} title="Em desenvolvimento" description={description} />
    </div>
  );
}
