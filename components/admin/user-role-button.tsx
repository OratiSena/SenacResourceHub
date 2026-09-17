"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { demoteUserAction, promoteUserAction } from "@/lib/actions/admin";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";

export function UserRoleButton({
  userId,
  role,
  isSelf,
}: {
  userId: string;
  role: "user" | "admin";
  isSelf: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (role === "user") {
    return (
      <div className="space-y-1">
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          trigger={
            <Button variant="outline" size="sm">
              Tornar administrador
            </Button>
          }
          title="Tornar este usuário administrador?"
          description="Ele passará a ter acesso completo à área administrativa do sistema."
          confirmLabel={pending ? "Aplicando..." : "Sim, promover"}
          cancelLabel="Voltar"
          onConfirm={() =>
            startTransition(async () => {
              setError(null);
              const result = await promoteUserAction(userId);
              if (result.status === "error") {
                setError(result.message ?? null);
                return;
              }
              setOpen(false);
              router.refresh();
            })
          }
        />
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    );
  }

  if (isSelf) {
    return (
      <span className="text-xs text-muted-foreground">Você (admin)</span>
    );
  }

  return (
    <div className="space-y-1">
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        trigger={
          <Button variant="outline" size="sm">
            Remover administrador
          </Button>
        }
        title="Remover acesso de administrador?"
        description="Este usuário voltará a ter acesso apenas de usuário comum."
        confirmLabel={pending ? "Aplicando..." : "Sim, remover"}
        cancelLabel="Voltar"
        destructive
        onConfirm={() =>
          startTransition(async () => {
            setError(null);
            const result = await demoteUserAction(userId);
            if (result.status === "error") {
              setError(result.message ?? null);
              return;
            }
            setOpen(false);
            router.refresh();
          })
        }
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
