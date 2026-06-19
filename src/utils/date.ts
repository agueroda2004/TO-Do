import { format, parseISO, startOfWeek } from "date-fns";
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