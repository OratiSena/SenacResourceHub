"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";

export default function RecursosError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Explorar Recursos"
        description="Encontre e reserve laboratórios, equipamentos e kits para seus projetos."
      />
      <EmptyState
        tone="error"
        title="Não foi possível carregar os recursos"
        description="Tente novamente em instantes. Se o problema persistir, volte para a Home."
        action={
          <Button size="sm" onClick={() => reset()}>
            Tentar novamente
          </Button>
        }
      />
    </div>
  );
}
