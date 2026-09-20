"use client";

import { useState, useTransition } from "react";

import { deleteAccountAction } from "@/lib/actions/profile";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
    <div className="space-y-2">
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        trigger={
          <Button variant="destructive" size="sm">
            Excluir minha conta
          </Button>
        }
        title="Excluir sua conta permanentemente?"
        description={
          <>
            <span className="block">• Suas reservas futuras serão canceladas.</span>
            <span className="block">• Seu acesso ao sistema será removido imediatamente.</span>
            <span className="block">• Esta ação não pode ser desfeita facilmente.</span>
          </>
        }
        confirmLabel={pending ? "Excluindo..." : "Excluir conta"}
        cancelLabel="Manter minha conta"
        destructive
        onConfirm={handleConfirm}
      />
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
