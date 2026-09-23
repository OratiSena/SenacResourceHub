interface BreakdownItem {
  label: string;
  value: number;
  className: string;
}

/**
 * Barras horizontais leves (só CSS) reaproveitadas para "Reservas por
 * status" e "Recursos por categoria" — mesma ideia visual, dados diferentes.
 */
export function BreakdownBarChart({ items }: { items: BreakdownItem[] }) {
  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => {
        const widthPct = item.value === 0 ? 0 : Math.max(4, Math.round((item.value / max) * 100));
        return (
          <li key={item.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-navy">{item.label}</span>
              <span className="text-muted-foreground">{item.value}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
              <div
                className={`h-full origin-left animate-in slide-in-from-left-8 rounded-full transition-[width] duration-500 ${item.className}`}
                style={{
                  width: `${widthPct}%`,
                  animationDelay: `${i * 60}ms`,
                  animationFillMode: "backwards",
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
