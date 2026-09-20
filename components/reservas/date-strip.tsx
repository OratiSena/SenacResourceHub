import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  formatDiaCurto,
  formatDiaDoMes,
  shiftLocalDate,
  todayLocalISODate,
} from "@/lib/reservations/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DateStripProps {
  /** Data selecionada, "YYYY-MM-DD". */
  data: string;
  /** Rota base para montar os links (ex.: `/recursos/osciloscopio/calendario`). */
  baseHref: string;
}

/**
 * Navegação de datas em semana (Seg–Dom), sem biblioteca de calendário —
 * só Links (navegação real, sem JS necessário) trocando o query param
 * `?data=`. O dia da semana usado como início é sempre calculado a partir
 * de `data`, nunca da data selecionada no cliente, para o SSR renderizar a
 * semana certa mesmo em fuso diferente do usuário (America/Sao_Paulo já é a
 * convenção de exibição do projeto).
 */
export function DateStrip({ data, baseHref }: DateStripProps) {
  const dow = new Date(`${data}T12:00:00`).getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = shiftLocalDate(data, mondayOffset);
  const days = Array.from({ length: 7 }, (_, i) => shiftLocalDate(monday, i));
  const today = todayLocalISODate();
  const prevWeek = shiftLocalDate(monday, -7);
  const nextWeek = shiftLocalDate(monday, 7);

  return (
    <div className="space-y-2.5 rounded-2xl border border-border bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href={`${baseHref}?data=${prevWeek}`}>
            <ChevronLeft aria-hidden="true" />
            <span className="hidden sm:inline">Semana anterior</span>
          </Link>
        </Button>
        <Button asChild variant={data === today ? "default" : "outline"} size="sm">
          <Link href={`${baseHref}?data=${today}`}>Hoje</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href={`${baseHref}?data=${nextWeek}`}>
            <span className="hidden sm:inline">Próxima semana</span>
            <ChevronRight aria-hidden="true" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((day) => {
          const isSelected = day === data;
          const isToday = day === today;
          return (
            <Link
              key={day}
              href={`${baseHref}?data=${day}`}
              aria-current={isSelected ? "date" : undefined}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl border px-1 py-2 text-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground font-semibold"
                  : "border-border bg-background text-navy hover:border-primary/40 hover:bg-muted",
              )}
            >
              <span className="uppercase">{formatDiaCurto(day)}</span>
              <span className="text-sm font-bold sm:text-base">
                {formatDiaDoMes(day)}
              </span>
              {isToday && !isSelected ? (
                <span
                  className="size-1 rounded-full bg-primary"
                  aria-hidden="true"
                />
              ) : (
                <span className="size-1" aria-hidden="true" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
