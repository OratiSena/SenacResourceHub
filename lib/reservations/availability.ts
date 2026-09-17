import type { BusyInterval } from "@/lib/data/reservations";
import { localDateTimeToISO } from "@/lib/reservations/format";

export interface AvailabilitySlot {
  /** "08:00" local */
  horaInicio: string;
  /** "08:30" local */
  horaFim: string;
  unidadesLivres: number;
}

/**
 * Divide o horário de funcionamento (ou um intervalo padrão de exibição,
 * quando o recurso não tem horário configurado) em blocos de 30 minutos e
 * calcula, para cada bloco, quantas unidades OPERACIONAIS estão livres —
 * cruzando com os intervalos ocupados retornados por
 * get_resource_busy_intervals. Só para recursos com resource_unit (nunca
 * chamado para a Oficina, que não tem unidades e não bloqueia horário).
 */
export function computeAvailabilitySlots({
  dataYYYYMMDD,
  horarioAbertura,
  horarioFechamento,
  operationalUnitIds,
  busyIntervals,
}: {
  dataYYYYMMDD: string;
  horarioAbertura: string | null;
  horarioFechamento: string | null;
  operationalUnitIds: string[];
  busyIntervals: BusyInterval[];
}): AvailabilitySlot[] {
  const abertura = horarioAbertura?.slice(0, 5) ?? "00:00";
  const fechamento = horarioFechamento?.slice(0, 5) ?? "23:30";

  const [aberturaH, aberturaM] = abertura.split(":").map(Number);
  const [fechamentoH, fechamentoM] = fechamento.split(":").map(Number);

  const slots: AvailabilitySlot[] = [];
  let minutos = aberturaH * 60 + aberturaM;
  const minutosFim = fechamentoH * 60 + fechamentoM;

  while (minutos < minutosFim) {
    const proximoMinutos = Math.min(minutos + 30, minutosFim);
    const horaInicio = minutesToHHMM(minutos);
    const horaFim = minutesToHHMM(proximoMinutos);

    const slotInicio = new Date(localDateTimeToISO(dataYYYYMMDD, horaInicio));
    const slotFim = new Date(localDateTimeToISO(dataYYYYMMDD, horaFim));

    const unidadesOcupadas = new Set(
      busyIntervals
        .filter((interval) => {
          const inicio = new Date(interval.inicio);
          const fim = new Date(interval.fim);
          return inicio < slotFim && fim > slotInicio;
        })
        .map((interval) => interval.resourceUnitId),
    );

    const livres = operationalUnitIds.filter(
      (id) => !unidadesOcupadas.has(id),
    ).length;

    slots.push({ horaInicio, horaFim, unidadesLivres: livres });
    minutos = proximoMinutos;
  }

  return slots;
}

function minutesToHHMM(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (totalMinutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}
