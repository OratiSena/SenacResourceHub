"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { toggleResourceAtivoAction } from "@/lib/actions/admin";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";

export function ResourceActiveToggle({
  resourceId,
  nome,
  ativo,
}: {
  resourceId: string;
  nome: string;
  ativo: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function apply() {
    setError(null);
    startTransition(async () => {
      const result = await toggleResourceAtivoAction(resourceId, !ativo);
      if (result.status === "error") {
        setError(result.message ?? "Não foi possível atualizar o recurso.");
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  // Ativar não é destrutivo — só inativar (bloqueia novas reservas) exige
  // confirmação (Prompt 9.1, seção 21).
  if (!ativo) {
    return (
      <Button variant="outline" size="sm" disabled={pending} onClick={apply}>
        Ativar
      </Button>
    );
  }

  return (
    <div className="space-y-1">
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        trigger={
          <Button variant="outline" size="sm">
            Desativar
          </Button>
        }
        title={`Inativar "${nome}"?`}
        description="Recursos inativos não aceitam novas reservas. Reservas futuras já existentes permanecem registradas e continuam valendo — trate-as antes, se necessário."
        confirmLabel={pending ? "Inativando..." : "Inativar"}
        cancelLabel="Cancelar"
        destructive
        onConfirm={apply}
      />
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
