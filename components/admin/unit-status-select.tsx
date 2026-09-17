"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateUnitStatusAction } from "@/lib/actions/admin";
import { UNIT_STATUS_VALUES } from "@/lib/validations/admin";
import type { UnitStatus } from "@/lib/data/admin";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LABELS: Record<UnitStatus, string> = {
  disponivel: "Disponível",
  manutencao: "Manutenção",
  inativa: "Inativa",
};

export function UnitStatusSelect({
  unitId,
  status,
}: {
  unitId: string;
  status: UnitStatus;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Select
      value={status}
      disabled={pending}
      onValueChange={(value) =>
        startTransition(async () => {
          await updateUnitStatusAction(unitId, value);
          router.refresh();
        })
      }
    >
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
  );
}
