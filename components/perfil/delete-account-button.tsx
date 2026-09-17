"use client";

import { useState, useTransition } from "react";

import { deleteAccountAction } from "@/lib/actions/profile";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";

export function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await deleteAccountAction();
      if (result?.status === "error") {
        setError(result.message ?? "Não foi possível excluir sua conta.");
      }
    });
  }

  return (
    <div className="space-y-1">
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        trigger={
          <Button variant="destructive" size="sm">
            Excluir conta
          </Button>
        }
        title="Excluir conta"
        description="Esta ação remove seu acesso ao sistema e não pode ser facilmente desfeita. Suas reservas futuras serão canceladas e seus dados pessoais, anonimizados. O histórico de reservas é preservado."
        confirmLabel={pending ? "Excluindo..." : "Sim, excluir minha conta"}
        cancelLabel="Voltar"
        destructive
        onConfirm={handleConfirm}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
