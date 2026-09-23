"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  createResourceAction,
  updateResourceAction,
} from "@/lib/actions/admin";
import { INITIAL_ACTION_STATE, type ActionState } from "@/lib/actions/action-state";
import { RESOURCE_TYPE_LABELS } from "@/lib/resources/resource-types";
import { RESOURCE_TYPE_VALUES } from "@/lib/validations/admin";
import type { AdminResourceListItem } from "@/lib/data/admin";
import { FormMessage } from "@/components/common/form-message";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ResourceFormDialogProps {
  trigger: React.ReactNode;
  resource?: AdminResourceListItem;
}

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ResourceFormDialog({ trigger, resource }: ResourceFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ActionState>(INITIAL_ACTION_STATE);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const action = resource ? updateResourceAction : createResourceAction;

  // Slug gerado automaticamente a partir do nome enquanto o usuário não
  // editar o campo slug manualmente (Prompt 9.1, seção 8.1) — só faz
  // sentido para criação; ao editar um recurso existente, o slug começa
  // "travado" no valor atual (slugTouched=true), preservando URLs antigas.
  const [nome, setNome] = useState(resource?.nome ?? "");
  const [slug, setSlug] = useState(resource?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(resource));

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await action(state, formData);
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
        if (nextOpen) {
          setState(INITIAL_ACTION_STATE);
          setNome(resource?.nome ?? "");
          setSlug(resource?.slug ?? "");
          setSlugTouched(Boolean(resource));
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{resource ? "Editar recurso" : "Novo recurso"}</DialogTitle>
          <DialogDescription>
            Campos de horário e duração são opcionais — deixe em branco quando não houver regra.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {resource ? (
            <input type="hidden" name="resourceId" value={resource.id} />
          ) : null}

          <FormMessage state={state} />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                name="nome"
                required
                maxLength={150}
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
              />
              {state.fieldErrors?.nome ? (
                <p className="text-xs text-destructive">{state.fieldErrors.nome[0]}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                required
                maxLength={150}
                placeholder="ex.: osciloscopio"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugTouched(true);
                }}
              />
              {state.fieldErrors?.slug ? (
                <p className="text-xs text-destructive">{state.fieldErrors.slug[0]}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tipo">Tipo</Label>
            <Select name="tipo" defaultValue={resource?.tipo ?? "equipamento"} required>
              <SelectTrigger id="tipo" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RESOURCE_TYPE_VALUES.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {RESOURCE_TYPE_LABELS[tipo]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Somente &ldquo;Espaço compartilhado&rdquo; permite múltiplas reservas simultâneas (sem unidades físicas).
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              name="descricao"
              rows={2}
              maxLength={500}
              defaultValue={resource?.descricao ?? ""}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="local">Local</Label>
            <Input id="local" name="local" maxLength={150} defaultValue={resource?.local ?? ""} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="horarioAbertura">Abertura</Label>
              <Input
                id="horarioAbertura"
                name="horarioAbertura"
                type="time"
                defaultValue={resource?.horarioAbertura?.slice(0, 5) ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="horarioFechamento">Fechamento</Label>
              <Input
                id="horarioFechamento"
                name="horarioFechamento"
                type="time"
                defaultValue={resource?.horarioFechamento?.slice(0, 5) ?? ""}
              />
              {state.fieldErrors?.horarioFechamento ? (
                <p className="text-xs text-destructive">
                  {state.fieldErrors.horarioFechamento[0]}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="duracaoMaximaMinutos">Duração máxima (min)</Label>
              <Input
                id="duracaoMaximaMinutos"
                name="duracaoMaximaMinutos"
                type="number"
                min={1}
                defaultValue={resource?.duracaoMaximaMinutos ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="antecedenciaMinimaMinutos">Antecedência mínima (min)</Label>
              <Input
                id="antecedenciaMinimaMinutos"
                name="antecedenciaMinimaMinutos"
                type="number"
                min={0}
                defaultValue={resource?.antecedenciaMinimaMinutos ?? 0}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="ativo"
              name="ativo"
              defaultChecked={resource?.ativo ?? true}
            />
            <Label htmlFor="ativo" className="font-normal">
              Recurso ativo (visível no catálogo)
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
