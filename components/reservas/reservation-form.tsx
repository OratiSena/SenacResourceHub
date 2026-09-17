"use client";

import { useActionState } from "react";

import { createReservationAction } from "@/lib/actions/reservations";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { FormMessage } from "@/components/common/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ReservationFormProps {
  resourceId: string;
  resourceSlug: string;
  data: string;
  horaInicioSugerida?: string;
  horaFimSugerida?: string;
}

export function ReservationForm({
  resourceId,
  resourceSlug,
  data,
  horaInicioSugerida,
  horaFimSugerida,
}: ReservationFormProps) {
  const [state, formAction, pending] = useActionState(
    createReservationAction,
    INITIAL_ACTION_STATE,
  );

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="resourceId" value={resourceId} />

      <FormMessage state={state} />

      <div className="space-y-1.5">
        <Label htmlFor="data">Data</Label>
        <Input
          id="data"
          name="data"
          type="date"
          required
          defaultValue={data}
          aria-invalid={Boolean(state.fieldErrors?.data)}
        />
        {state.fieldErrors?.data ? (
          <p className="text-xs text-destructive">{state.fieldErrors.data[0]}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="horaInicio">Início</Label>
          <Input
            id="horaInicio"
            name="horaInicio"
            type="time"
            required
            defaultValue={horaInicioSugerida}
            aria-invalid={Boolean(state.fieldErrors?.horaInicio)}
          />
          {state.fieldErrors?.horaInicio ? (
            <p className="text-xs text-destructive">
              {state.fieldErrors.horaInicio[0]}
            </p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="horaFim">Fim</Label>
          <Input
            id="horaFim"
            name="horaFim"
            type="time"
            required
            defaultValue={horaFimSugerida}
            aria-invalid={Boolean(state.fieldErrors?.horaFim)}
          />
          {state.fieldErrors?.horaFim ? (
            <p className="text-xs text-destructive">{state.fieldErrors.horaFim[0]}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="finalidade">Finalidade</Label>
        <Input
          id="finalidade"
          name="finalidade"
          placeholder="Ex.: Aula prática de Redes I"
          required
          maxLength={300}
          aria-invalid={Boolean(state.fieldErrors?.finalidade)}
        />
        {state.fieldErrors?.finalidade ? (
          <p className="text-xs text-destructive">
            {state.fieldErrors.finalidade[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="observacoes">Observações (opcional)</Label>
        <Textarea
          id="observacoes"
          name="observacoes"
          placeholder="Detalhes adicionais para o uso do recurso"
          maxLength={500}
          rows={3}
        />
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="button" variant="outline" asChild>
          <a href={`/recursos/${resourceSlug}`}>Voltar</a>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Confirmando..." : "Confirmar reserva"}
        </Button>
      </div>
    </form>
  );
}
