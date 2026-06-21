import { differenceInCalendarDays, format, parseISO, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";

export function formatDate(iso: string, pattern: string = "dd MMM yyyy"): string {
  try {
    return format(parseISO(iso), pattern, { locale: es });
  } catch {
    return iso;
  }
}

export function formatTime(date: Date = new Date()): string {
  return format(date, "HH:mm", { locale: es });
}

export function getWeekStart(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

export function toIsoDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

export function formatScheduledFor(yyyyMmDd: string, now: Date = new Date()): string {
  try {
    const date = parseISO(yyyyMmDd);
    const diff = differenceInCalendarDays(date, now);
    if (diff === 0) return "Hoy";
    if (diff === 1) return "Mañana";
    if (diff === -1) return "Ayer";
    if (diff > 1 && diff < 7) return format(date, "EEEE", { locale: es });
    return format(date, "d MMM", { locale: es });
  } catch {
    return yyyyMmDd;
  }
}

export function formatScheduledForLong(yyyyMmDd: string): string {
  try {
    return format(parseISO(yyyyMmDd), "EEEE d 'de' MMMM", { locale: es });
  } catch {
    return yyyyMmDd;
  }
}