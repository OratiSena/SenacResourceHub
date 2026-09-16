import Link from "next/link";
import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";

export default function AppNotFound() {
  return (
    <div className="space-y-6">
      <PageHeader title="Página não encontrada" />
      <EmptyState
        icon={SearchX}
        title="Não encontramos o que você procura"
        description="O recurso ou a página pode ter sido removida, ou o endereço está incorreto."
        action={
          <Button asChild size="sm">
            <Link href="/">Voltar para a Home</Link>
          </Button>
        }
      />
    </div>
  );
}
