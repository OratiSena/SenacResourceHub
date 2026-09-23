"use client";

import { useActionState } from "react";

import { adminUpdateUserNameAction } from "@/lib/actions/admin";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import type { AdminUserDetail } from "@/lib/data/admin";
import { formatDataLocal } from "@/lib/reservations/format";
import { DeleteUserButton } from "@/components/admin/delete-user-button";
import { UserRoleButton } from "@/components/admin/user-role-button";
import { FormMessage } from "@/components/common/form-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UserDetailDialogProps {
  user: AdminUserDetail;
  isSelf: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailDialog({ user, isSelf, open, onOpenChange }: UserDetailDialogProps) {
  const [state, formAction, pending] = useActionState(
    adminUpdateUserNameAction,
    INITIAL_ACTION_STATE,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes do usuário</DialogTitle>
        </DialogHeader>

        <dl className="space-y-2.5 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">E-mail</dt>
            <dd className="text-right font-medium text-navy">{user.email}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Papel</dt>
            <dd>
              <Badge
                variant="outline"
                className={
                  user.role === "admin"
                    ? "border-primary/20 bg-primary/10 text-primary"
                    : "border-muted-foreground/20 bg-muted text-muted-foreground"
                }
              >
                {user.role === "admin" ? "Administrador" : "Usuário"}
              </Badge>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Status</dt>
            <dd>
              <Badge
                variant="outline"
                className={
                  user.status === "active"
                    ? "border-success/20 bg-success/10 text-success"
                    : "border-destructive/20 bg-destructive/10 text-destructive"
                }
              >
                {user.status === "active" ? "Ativo" : "Excluído"}
              </Badge>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Cadastro</dt>
            <dd className="font-medium text-navy">{formatDataLocal(user.createdAt)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Reservas</dt>
            <dd className="font-medium text-navy">
              {user.totalReservas} no total · {user.reservasFuturas} futuras
            </dd>
          </div>
        </dl>

        {user.status === "active" ? (
          <>
            <form action={formAction} className="space-y-3 border-t border-border pt-4">
              <input type="hidden" name="userId" value={user.id} />
              <FormMessage state={state} />
              <div className="space-y-1.5">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  name="nome"
                  defaultValue={user.nome}
                  required
                  maxLength={100}
                  aria-invalid={Boolean(state.fieldErrors?.nome)}
                />
                {state.fieldErrors?.nome ? (
                  <p className="text-xs text-destructive">{state.fieldErrors.nome[0]}</p>
                ) : null}
              </div>
              <Button type="submit" size="sm" disabled={pending}>
                {pending ? "Salvando..." : "Salvar nome"}
              </Button>
            </form>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <UserRoleButton
                userId={user.id}
                nome={user.nome}
                role={user.role}
                isSelf={isSelf}
              />
              {!isSelf ? (
                <DeleteUserButton
                  userId={user.id}
                  nome={user.nome}
                  email={user.email}
                  onDeleted={() => onOpenChange(false)}
                />
              ) : null}
            </div>
            {isSelf ? (
              <p className="text-xs text-muted-foreground">
                Sua própria conta é gerenciada em Perfil, não aqui.
              </p>
            ) : null}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
