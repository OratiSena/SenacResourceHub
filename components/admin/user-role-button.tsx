"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { demoteUserAction, promoteUserAction } from "@/lib/actions/admin";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";

export function UserRoleButton({
  userId,
  nome,
  role,
  isSelf,
}: {
  userId: string;
  nome: string;
  role: "user" | "admin";
  isSelf: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  if (role === "user") {
    return (
      <div className="space-y-1">
        <ConfirmDialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (next) setError(null);
          }}
          trigger={
            <Button variant="outline" size="sm">
              Tornar administrador
            </Button>
          }
          title={`Tornar ${nome} administrador?`}
          description="Administradores possuem acesso à gestão de recursos, reservas e usuários."
          confirmLabel={pending ? "Aplicando..." : "Tornar administrador"}
          cancelLabel="Cancelar"
          onConfirm={() =>
            startTransition(async () => {
              setError(null);
              const result = await promoteUserAction(userId);
              if (result.status === "error") {
                setError(result.message ?? null);
                return;
              }
              setOpen(false);
              setSuccess("Usuário promovido a administrador.");
              router.refresh();
            })
          }
        />
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        {success ? (
          <Alert className="border-success/20 bg-success/5">
            <AlertDescription className="text-success">{success}</AlertDescription>
          </Alert>
        ) : null}
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
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setError(null);
        }}
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
            setSuccess("Acesso de administrador removido.");
            router.refresh();
          })
        }
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {success ? (
        <Alert className="border-success/20 bg-success/5">
          <AlertDescription className="text-success">{success}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
