"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { createUnitAction } from "@/lib/actions/admin";
import { INITIAL_ACTION_STATE, type ActionState } from "@/lib/actions/action-state";
import { FormMessage } from "@/components/common/form-message";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function UnitFormDialog({ resourceId }: { resourceId: string }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ActionState>(INITIAL_ACTION_STATE);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await createUnitAction(state, formData);
      setState(result);
      if (result.status === "success") {
        setOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) setState(INITIAL_ACTION_STATE);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus aria-hidden="true" />
          Nova unidade
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova unidade</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <input type="hidden" name="resourceId" value={resourceId} />
          <FormMessage state={state} />
          <div className="space-y-1.5">
            <Label htmlFor="codigo">Código</Label>
            <Input
              id="codigo"
              name="codigo"
              placeholder="Ex.: OSC-05"
              required
              maxLength={30}
              aria-invalid={Boolean(state.fieldErrors?.codigo)}
            />
            {state.fieldErrors?.codigo ? (
              <p className="text-xs text-destructive">
                {state.fieldErrors.codigo[0]}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
