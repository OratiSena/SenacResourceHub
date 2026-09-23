"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import { AlertCircle, Info, Users } from "lucide-react";

import { createReservationAction } from "@/lib/actions/reservations";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import type { AvailabilitySlot } from "@/lib/reservations/availability";
import type { BusyInterval } from "@/lib/data/reservations";
import {
  formatDataLocal,
  formatDataLonga,
  formatHoraLocal,
  localDateTimeToISO,
} from "@/lib/reservations/format";
import { formatDuracaoMinutos as formatDuracaoMin } from "@/lib/resources/format";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type SchedulerMode = "grid" | "shared" | "no-window";

interface ReservationSchedulerProps {
  mode: SchedulerMode;
  resourceId: string;
  resourceSlug: string;
  resourceNome: string;
  /**
   * Data selecionada/sugerida (DateStrip ou query param `?data=`). Fonte de
   * verdade direta do início/fim para os modos "grid" e "shared" (recursos
   * de um dia só). Para "no-window" (impressoras), é só o valor INICIAL do
   * campo "Data de início", editável — nunca fica escondida (ver Prompt 7.2).
   */
  data: string;
  slots: AvailabilitySlot[];
  operationalUnitsTotal: number;
  duracaoMaximaMinutos: number | null;
  antecedenciaMinimaMinutos: number;
  printerBusyIntervals?: BusyInterval[];
  printerUnitCodigoById?: Record<string, string>;
}

function minutesBetween(inicioISO: string, fimISO: string): number {
  return Math.round((new Date(fimISO).getTime() - new Date(inicioISO).getTime()) / 60_000);
}

function computeMinFreeUnits(
  slots: AvailabilitySlot[],
  start: string,
  end: string,
): number | null {
  const relevant = slots.filter((s) => s.horaInicio < end && s.horaFim > start);
  if (relevant.length === 0) return null;
  return Math.min(...relevant.map((s) => s.unidadesLivres));
}

/** "22/09/2026" a partir de uma data pura (YYYY-MM-DD), via o mesmo truque de meio-dia usado no resto do arquivo. */
function formatDataCurta(dataYYYYMMDD: string): string {
  return formatDataLocal(localDateTimeToISO(dataYYYYMMDD, "12:00"));
}

export function ReservationScheduler({
  mode,
  resourceId,
  resourceSlug,
  resourceNome,
  data,
  slots,
  operationalUnitsTotal,
  duracaoMaximaMinutos,
  antecedenciaMinimaMinutos,
  printerBusyIntervals = [],
  printerUnitCodigoById = {},
}: ReservationSchedulerProps) {
  const [state, formAction, pending] = useActionState(
    createReservationAction,
    INITIAL_ACTION_STATE,
  );

  // Só usada pelo modo "no-window" — nos outros dois modos, a data de
  // início É a `data` recebida (DateStrip), nunca um estado paralelo.
  const [dataInicio, setDataInicio] = useState(data);
  const [dataFim, setDataFim] = useState(data);
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");
  const [finalidade, setFinalidade] = useState("");

  // Capturado uma única vez na montagem (não a cada render, para não violar
  // a regra de pureza do React) — pequena imprecisão com o tempo real é
  // aceitável aqui, já que o servidor sempre revalida antecedência/horário
  // de verdade ao confirmar (create_reservation).
  const [now] = useState(() => Date.now());

  const dataInicioEfetiva = mode === "no-window" ? dataInicio : data;
  const dataFimEfetiva = mode === "no-window" ? dataFim : data;

  function handleSlotClick(slot: AvailabilitySlot) {
    if (slot.unidadesLivres <= 0) return;
    const slotStartMs = new Date(localDateTimeToISO(data, slot.horaInicio)).getTime();
    if (slotStartMs < now + antecedenciaMinimaMinutos * 60_000) return;

    if (!horaInicio) {
      setHoraInicio(slot.horaInicio);
      setHoraFim(slot.horaFim);
      return;
    }
    if (slot.horaInicio >= horaInicio) {
      setHoraFim(slot.horaFim);
    } else {
      setHoraInicio(slot.horaInicio);
      setHoraFim(slot.horaFim);
    }
  }

  const inicioISO = horaInicio
    ? localDateTimeToISO(dataInicioEfetiva, horaInicio)
    : null;
  const fimISO = horaFim ? localDateTimeToISO(dataFimEfetiva, horaFim) : null;

  const duracaoMinutos =
    inicioISO && fimISO ? minutesBetween(inicioISO, fimISO) : null;

  const excedeMaximo =
    duracaoMinutos != null &&
    duracaoMaximaMinutos != null &&
    duracaoMinutos > duracaoMaximaMinutos;

  const intervaloInvalido = duracaoMinutos != null && duracaoMinutos <= 0;

  const minFreeUnits =
    mode === "grid" && horaInicio && horaFim
      ? computeMinFreeUnits(slots, horaInicio, horaFim)
      : null;

  const semUnidadeLivre = mode === "grid" && minFreeUnits === 0;

  const inicioNoPassado = inicioISO != null && new Date(inicioISO).getTime() < now;
  const antecedenciaInsuficiente =
    inicioISO != null &&
    !inicioNoPassado &&
    new Date(inicioISO).getTime() < now + antecedenciaMinimaMinutos * 60_000;

  const horarioSelecionado = Boolean(horaInicio && horaFim);
  const finalidadePreenchida = finalidade.trim().length > 0;
  const datasCruzamDia = mode === "no-window" && dataInicioEfetiva !== dataFimEfetiva;

  const canSubmit =
    horarioSelecionado &&
    !excedeMaximo &&
    !intervaloInvalido &&
    !semUnidadeLivre &&
    !inicioNoPassado &&
    !antecedenciaInsuficiente &&
    finalidadePreenchida &&
    !pending;

  const relevantPrinterIntervals = useMemo(() => {
    return [...printerBusyIntervals]
      .sort((a, b) => a.inicio.localeCompare(b.inicio))
      .slice(0, 8);
  }, [printerBusyIntervals]);

  return (
    <form action={formAction} className="grid min-w-0 gap-6 lg:grid-cols-[1.2fr_1fr]">
      <input type="hidden" name="resourceId" value={resourceId} />
      <input type="hidden" name="data" value={dataInicioEfetiva} />
      <input type="hidden" name="horaInicio" value={horaInicio} />
      <input type="hidden" name="horaFim" value={horaFim} />
      {mode === "no-window" ? (
        <input type="hidden" name="dataFim" value={dataFim} />
      ) : null}

      {/* Coluna de disponibilidade */}
      <section className="min-w-0 space-y-3 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold text-navy">Disponibilidade</h2>

        {mode === "shared" ? (
          <div className="space-y-3 rounded-xl border border-info/20 bg-info/5 p-4">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-info">
              <Users className="size-4" aria-hidden="true" />
              Uso compartilhado
            </p>
            <p className="text-sm text-muted-foreground">
              Agendamento orientado. Este espaço permite múltiplos
              agendamentos simultâneos — não há verificação de exclusividade
              nem atribuição de unidade.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <Label htmlFor="horaInicioShared">Início</Label>
                <Input
                  id="horaInicioShared"
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="horaFimShared">Fim</Label>
                <Input
                  id="horaFimShared"
                  type="time"
                  value={horaFim}
                  onChange={(e) => setHoraFim(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        ) : mode === "no-window" ? (
          <div className="space-y-4">
            <Alert className="border-info/20 bg-info/5">
              <Info className="size-4 text-info" aria-hidden="true" />
              <AlertTitle className="text-info">Sem horário fixo de funcionamento</AlertTitle>
              <AlertDescription>
                Reservas de impressão podem começar e terminar em dias
                diferentes, inclusive durante a madrugada — respeitando o
                limite de{" "}
                {duracaoMaximaMinutos ? formatDuracaoMin(duracaoMaximaMinutos) : "24 horas"}
                {" "}por reserva.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dataInicioNw">Data de início</Label>
                <Input
                  id="dataInicioNw"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => {
                    setDataInicio(e.target.value);
                    // Fim nunca fica implicitamente antes do início.
                    if (e.target.value > dataFim) setDataFim(e.target.value);
                  }}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="horaInicioNw">Hora de início</Label>
                <Input
                  id="horaInicioNw"
                  type="time"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dataFimNw">Data de término</Label>
                <Input
                  id="dataFimNw"
                  type="date"
                  value={dataFim}
                  min={dataInicio}
                  onChange={(e) => setDataFim(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="horaFimNw">Hora de término</Label>
                <Input
                  id="horaFimNw"
                  type="time"
                  value={horaFim}
                  onChange={(e) => setHoraFim(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Próximas ocupações ({operationalUnitsTotal}{" "}
                {operationalUnitsTotal === 1 ? "unidade" : "unidades"} no total)
              </p>
              {relevantPrinterIntervals.length === 0 ? (
                <p className="text-sm text-success">
                  Nenhuma reserva ativa nos próximos dias.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {relevantPrinterIntervals.map((interval, i) => (
                    <li
                      key={i}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground"
                    >
                      <span className="font-mono font-medium text-navy">
                        {printerUnitCodigoById[interval.resourceUnitId] ?? "Unidade"}
                      </span>{" "}
                      ocupada de {formatDataLocal(interval.inicio)}{" "}
                      {formatHoraLocal(interval.inicio)} até{" "}
                      {formatDataLocal(interval.fim)} {formatHoraLocal(interval.fim)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : slots.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma unidade operacional cadastrada para este recurso no momento.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-success/20 ring-1 ring-success/40" aria-hidden="true" />
                Livre
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-primary" aria-hidden="true" />
                Selecionado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-muted ring-1 ring-border" aria-hidden="true" />
                Ocupado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm border border-dashed border-border bg-background opacity-60" aria-hidden="true" />
                Indisponível
              </span>
            </div>

            <ul className="grid max-h-96 grid-cols-3 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-4">
              {slots.map((slot) => {
                const slotStartMs = new Date(
                  localDateTimeToISO(data, slot.horaInicio),
                ).getTime();
                const isPast = slotStartMs < now + antecedenciaMinimaMinutos * 60_000;
                const isOcupado = slot.unidadesLivres <= 0;
                const isSelecionado =
                  horaInicio !== "" &&
                  slot.horaInicio >= horaInicio &&
                  slot.horaFim <= horaFim;
                const disabled = isPast || isOcupado;

                return (
                  <li key={slot.horaInicio}>
                    <button
                      type="button"
                      disabled={disabled}
                      aria-disabled={disabled}
                      aria-pressed={isSelecionado}
                      title={
                        isPast
                          ? "Fora do prazo mínimo de antecedência"
                          : isOcupado
                            ? "Sem unidade livre neste horário"
                            : `${slot.unidadesLivres} de ${operationalUnitsTotal} unidades livres`
                      }
                      onClick={() => handleSlotClick(slot)}
                      className={cn(
                        "flex w-full flex-col items-center rounded-lg border px-1.5 py-1.5 text-xs font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                        isSelecionado
                          ? "border-primary bg-primary text-primary-foreground"
                          : isPast
                            ? "cursor-not-allowed border-dashed border-border bg-background text-muted-foreground/50"
                            : isOcupado
                              ? "cursor-not-allowed border-border bg-muted text-muted-foreground"
                              : "border-success/30 bg-success/10 text-navy hover:border-success/60",
                      )}
                    >
                      <span>{slot.horaInicio}</span>
                      {!isPast ? (
                        <span
                          className={cn(
                            "text-[10px]",
                            isSelecionado ? "text-primary-foreground/80" : "opacity-70",
                          )}
                        >
                          {slot.unidadesLivres}/{operationalUnitsTotal}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>

      {/* Coluna de resumo */}
      <section className="min-w-0 space-y-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold text-navy">Resumo da reserva</h2>

        {state.status === "error" ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" aria-hidden="true" />
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        ) : null}

        <dl className="space-y-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Recurso</dt>
            <dd className="font-medium text-navy">{resourceNome}</dd>
          </div>

          {!horarioSelecionado ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Data</dt>
                <dd className="text-right font-medium text-navy capitalize">
                  {formatDataLonga(dataInicioEfetiva)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Horário</dt>
                <dd className="font-medium text-muted-foreground">
                  Selecione um horário
                </dd>
              </div>
            </>
          ) : datasCruzamDia ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Início</dt>
                <dd className="font-medium text-navy">
                  {formatDataCurta(dataInicioEfetiva)} {horaInicio}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Fim</dt>
                <dd className="font-medium text-navy">
                  {formatDataCurta(dataFimEfetiva)} {horaFim}
                </dd>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Data</dt>
                <dd className="text-right font-medium text-navy capitalize">
                  {formatDataLonga(dataInicioEfetiva)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">Horário</dt>
                <dd className="font-medium text-navy">
                  {horaInicio} – {horaFim}
                </dd>
              </div>
            </>
          )}

          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Duração</dt>
            <dd className="font-medium text-navy">
              {duracaoMinutos != null && duracaoMinutos > 0
                ? formatDuracaoMin(duracaoMinutos)
                : "—"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">
              {mode === "shared" ? "Uso" : "Unidades"}
            </dt>
            <dd className="text-right font-medium text-navy">
              {mode === "shared" ? (
                "Uso compartilhado"
              ) : mode === "no-window" ? (
                `${operationalUnitsTotal} cadastradas`
              ) : minFreeUnits != null ? (
                <Badge
                  variant="outline"
                  className={
                    minFreeUnits > 0
                      ? "border-success/20 bg-success/10 text-success"
                      : "border-destructive/20 bg-destructive/10 text-destructive"
                  }
                >
                  {minFreeUnits > 0
                    ? `${minFreeUnits} livre${minFreeUnits > 1 ? "s" : ""}`
                    : "Nenhuma disponível"}
                </Badge>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </dd>
          </div>
        </dl>

        {intervaloInvalido ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" aria-hidden="true" />
            <AlertDescription>
              O término deve ocorrer depois do início.
            </AlertDescription>
          </Alert>
        ) : null}
        {!intervaloInvalido && excedeMaximo ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" aria-hidden="true" />
            <AlertDescription>
              A duração máxima para este recurso é de{" "}
              {formatDuracaoMin(duracaoMaximaMinutos!)}.
            </AlertDescription>
          </Alert>
        ) : null}
        {!intervaloInvalido && !excedeMaximo && inicioNoPassado ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" aria-hidden="true" />
            <AlertDescription>
              Não é possível iniciar uma reserva no passado.
            </AlertDescription>
          </Alert>
        ) : null}
        {!intervaloInvalido && !excedeMaximo && !inicioNoPassado && antecedenciaInsuficiente ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" aria-hidden="true" />
            <AlertDescription>
              É necessário reservar com pelo menos{" "}
              {formatDuracaoMin(antecedenciaMinimaMinutos)} de antecedência.
            </AlertDescription>
          </Alert>
        ) : null}
        {!excedeMaximo && semUnidadeLivre ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" aria-hidden="true" />
            <AlertDescription>
              Esse horário não tem unidade disponível. Escolha outro período.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor="finalidade" className="text-sm font-semibold">
            Finalidade
          </Label>
          <Input
            id="finalidade"
            name="finalidade"
            placeholder="Ex.: Aula prática de Redes I"
            required
            maxLength={300}
            value={finalidade}
            onChange={(e) => setFinalidade(e.target.value)}
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
            rows={2}
          />
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          <Button type="button" variant="outline" asChild>
            <a href={`/recursos/${resourceSlug}`}>Voltar</a>
          </Button>
          <Button type="submit" disabled={!canSubmit} className="flex-1 sm:flex-none">
            {pending ? "Confirmando..." : "Confirmar reserva"}
          </Button>
        </div>
      </section>
    </form>
  );
}
