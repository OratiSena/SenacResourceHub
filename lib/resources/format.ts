/** "08:00:00" (Postgres time) -> "08:00" */
export function formatHorario(time: string): string {
  return time.slice(0, 5);
}

export function formatDuracaoMinutos(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (horas === 0) return `${minutos} min`;
  if (resto === 0) return horas === 1 ? "1 hora" : `${horas} horas`;
  return `${horas}h${resto}min`;
}
