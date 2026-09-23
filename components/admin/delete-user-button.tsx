"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { adminDeleteUserAction } from "@/lib/actions/admin";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";

export function DeleteUserButton({
  userId,
  nome,
  email,
  onDeleted,
}: {
  userId: string;
  nome: string;
  email: string;
  onDeleted?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await adminDeleteUserAction(userId);
      if (result.status === "error") {
        setError(result.message ?? "Não foi possível excluir este usuário.");
        return;
      }
      setOpen(false);
      router.refresh();
      onDeleted?.();
    });
  }

  return (
    <div className="space-y-1.5">
      <ConfirmDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setError(null);
        }}
        trigger={
          <Button variant="destructive" size="sm">
            Excluir usuário
          </Button>
        }
        title="Excluir usuário?"
        description={
          <>
            <span className="block font-medium text-foreground">{nome}</span>
            <span className="block">{email}</span>
            <span className="mt-2 block">
              As reservas futuras serão canceladas e o acesso será removido.
              O histórico necessário será preservado de forma anonimizada.
            </span>
          </>
        }
        confirmLabel={pending ? "Excluindo..." : "Excluir usuário"}
        cancelLabel="Cancelar"
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
