"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateUnitStatusAction } from "@/lib/actions/admin";
import { UNIT_STATUS_VALUES } from "@/lib/validations/admin";
import type { UnitStatus } from "@/lib/data/admin";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// "Operacional" (não "Disponível") de propósito — mesmo status usado nos
// cards/detalhe de recursos, nunca "Reservado" (isso não é um status
// administrativo persistido, é calculado a partir de reservations).
const LABELS: Record<UnitStatus, string> = {
  disponivel: "Operacional",
  manutencao: "Manutenção",
  inativa: "Inativa",
};

// Mudar PARA manutenção/inativa impede novas reservas dessa unidade — pede
// confirmação. Voltar para operacional não é destrutivo.
const REQUIRES_CONFIRM: UnitStatus[] = ["manutencao", "inativa"];

export function UnitStatusSelect({
  unitId,
  codigo,
  status,
}: {
  unitId: string;
  codigo: string;
  status: UnitStatus;
}) {
  const [pending, startTransition] = useTransition();
  const [pendingValue, setPendingValue] = useState<UnitStatus | null>(null);
  const router = useRouter();

  function apply(value: UnitStatus) {
    startTransition(async () => {
      await updateUnitStatusAction(unitId, value);
      setPendingValue(null);
      router.refresh();
    });
  }

  function handleChange(value: string) {
    const next = value as UnitStatus;
    if (REQUIRES_CONFIRM.includes(next)) {
      setPendingValue(next);
      return;
    }
    apply(next);
  }

  return (
    <>
      <Select value={status} disabled={pending} onValueChange={handleChange}>
        <SelectTrigger size="sm" className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {UNIT_STATUS_VALUES.map((value) => (
            <SelectItem key={value} value={value}>
              {LABELS[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <ConfirmDialog
        open={pendingValue != null}
        onOpenChange={(open) => !open && setPendingValue(null)}
        trigger={<span />}
        title={`Marcar ${codigo} como ${pendingValue ? LABELS[pendingValue] : ""}?`}
        description="A unidade deixa de aceitar novas reservas enquanto estiver neste status. O histórico de reservas já feitas é mantido."
        confirmLabel={pending ? "Aplicando..." : "Confirmar"}
        cancelLabel="Cancelar"
        destructive
        onConfirm={() => pendingValue && apply(pendingValue)}
      />
    </>
  );
}
