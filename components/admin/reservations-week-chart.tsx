import type { ReservationsPerDay } from "@/lib/data/admin";

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  weekday: "short",
});

/**
 * Gráfico de barras leve (só CSS, sem biblioteca de charts) para "Reservas
 * nos próximos 7 dias". Dados sempre reais — vêm de getAdminDashboardData,
 * uma única consulta já delimitada ao período de 7 dias.
 */
export function ReservationsWeekChart({ days }: { days: ReservationsPerDay[] }) {
  const max = Math.max(1, ...days.map((d) => d.total));

  return (
    <div className="flex h-40 items-end justify-between gap-2 sm:gap-3">
      {days.map((day, i) => {
        const heightPct = Math.max(4, Math.round((day.total / max) * 100));
        const label = WEEKDAY_FORMATTER.format(
          new Date(`${day.data}T12:00:00`),
        ).replace(".", "");
        return (
          <div
            key={day.data}
            className="flex flex-1 flex-col items-center gap-1.5"
          >
            <span className="text-xs font-semibold text-navy">{day.total}</span>
            <div className="flex h-28 w-full items-end rounded-md bg-muted/60">
              <div
                className="w-full origin-bottom animate-in slide-in-from-bottom-4 rounded-md bg-primary transition-[height] duration-500"
                style={{
                  height: `${heightPct}%`,
                  animationDelay: `${i * 60}ms`,
                  animationFillMode: "backwards",
                }}
              />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground uppercase">
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
