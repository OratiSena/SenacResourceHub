const TIMEZONE = "America/Sao_Paulo";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TIMEZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
});

const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TIMEZONE,
  weekday: "long",
});

/** ISO timestamptz -> "17/09/2026", sempre em America/Sao_Paulo. */
export function formatDataLocal(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

/** ISO timestamptz -> "14:30", sempre em America/Sao_Paulo. */
export function formatHoraLocal(iso: string): string {
  return timeFormatter.format(new Date(iso));
}

/** ISO timestamptz -> "quinta-feira", sempre em America/Sao_Paulo. */
export function formatDiaSemanaLocal(iso: string): string {
  return weekdayFormatter.format(new Date(iso));
}

/** "2026-09-17" (a partir de um <input type="date">) + "14:30" -> Date UTC correta. */
export function localDateTimeToISO(dataYYYYMMDD: string, horaHHMM: string): string {
  // new Date com sufixo de offset não é confiável entre navegadores para IANA
  // zones — em vez disso, construímos a string local e deixamos o backend
  // (Postgres) resolver o offset de America/Sao_Paulo, enviando um ISO com
  // um deslocamento fixo aproximado é arriscado. Como o input já representa
  // um instante "horário de Brasília", usamos o truque de formatar a data
  // pretendida em UTC e comparar com a mesma data formatada em
  // America/Sao_Paulo para achar o offset vigente (cobre horário de verão,
  // hoje inexistente no Brasil, mas robusto a mudanças futuras de lei).
  const naiveUTC = new Date(`${dataYYYYMMDD}T${horaHHMM}:00Z`);
  const offsetMinutes = getTimeZoneOffsetMinutes(naiveUTC, TIMEZONE);
  return new Date(naiveUTC.getTime() - offsetMinutes * 60_000).toISOString();
}

function getTimeZoneOffsetMinutes(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = Object.fromEntries(
    dtf.formatToParts(date).map((p) => [p.type, p.value]),
  );
  const asUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return (asUTC - date.getTime()) / 60_000;
}

/** "YYYY-MM-DD" para hoje, em America/Sao_Paulo (para o valor inicial do input de data). */
export function todayLocalISODate(): string {
  const dtf = new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE });
  return dtf.format(new Date());
}

/** "2026-09-17" + 3 -> "2026-09-20" (aritmética pura de calendário, sem fuso). */
export function shiftLocalDate(dataYYYYMMDD: string, days: number): string {
  const [y, m, d] = dataYYYYMMDD.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

const weekdayShortFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });

/** "2026-09-17" -> "qui" (abreviação de dia da semana, para a tira de datas). */
export function formatDiaCurto(dataYYYYMMDD: string): string {
  return weekdayShortFormatter.format(new Date(`${dataYYYYMMDD}T12:00:00`)).replace(".", "");
}

/** "2026-09-17" -> "17" (dia do mês, para a tira de datas). */
export function formatDiaDoMes(dataYYYYMMDD: string): string {
  return dataYYYYMMDD.slice(8, 10);
}

/** "2026-09-17" -> "quinta-feira, 17/09/2026" (para o resumo da reserva). */
export function formatDataLonga(dataYYYYMMDD: string): string {
  return new Date(`${dataYYYYMMDD}T12:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Diferença entre dois ISO timestamptz -> "4 horas" / "1h30min" (mesma convenção de formatDuracaoMinutos). */
export function formatDuracaoEntre(inicioISO: string, fimISO: string): string {
  const minutos = Math.round(
    (new Date(fimISO).getTime() - new Date(inicioISO).getTime()) / 60_000,
  );
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (horas === 0) return `${minutos} min`;
  if (resto === 0) return horas === 1 ? "1 hora" : `${horas} horas`;
  return `${horas}h${resto}min`;
}

export type ReservationDerivedStatus = "FUTURA" | "EM_USO" | "EXPIRADA" | "CANCELADA";

export function deriveReservationStatus(reservation: {
  status: "ATIVA" | "CANCELADA";
  data_hora_inicio: string;
  data_hora_fim: string;
}): ReservationDerivedStatus {
  if (reservation.status === "CANCELADA") return "CANCELADA";

  const now = Date.now();
  const inicio = new Date(reservation.data_hora_inicio).getTime();
  const fim = new Date(reservation.data_hora_fim).getTime();

  if (now < inicio) return "FUTURA";
  if (now < fim) return "EM_USO";
  return "EXPIRADA";
}
