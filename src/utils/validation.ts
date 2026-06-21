import type { Period, Priority, Task, TaskStatus } from "../types/task";

export const PERIODS: readonly Period[] = ["morning", "afternoon", "night"] as const;

export const PERIOD_LABELS: Record<Period, string> = {
  morning: "Mañana",
  afternoon: "Tarde",
  night: "Noche",
};

export const TASK_STATUSES: readonly TaskStatus[] = [
  "pending",
  "working",
  "completed",
] as const;

export const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Pendiente",
  working: "En progreso",
  completed: "Terminado",
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  pending: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
  working: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  completed:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
};

export const PRIORITIES: readonly Priority[] = ["low", "medium", "high"] as const;

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

export const PRIORITY_ORDER: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export const PRIORITY_BADGE_STYLES: Record<Priority, string> = {
  low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  high: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

export const PRIORITY_ACTIVE_STYLES: Record<Priority, string> = {
  low: "border-slate-400 bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-100",
  medium: "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
  high: "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200",
};

export const PRIORITY_DOT_STYLES: Record<Priority, string> = {
  low: "bg-slate-400",
  medium: "bg-amber-500",
  high: "bg-rose-500",
};

export interface TaskFormErrors {
  name?: string;
  targetMinutes?: string;
  categoryId?: string;
  period?: string;
  scheduledFor?: string;
  priority?: string;
  [key: string]: string | undefined;
}

export interface TaskFormValues {
  name: string;
  categoryId: string | null;
  period: Period | null;
  targetMinutes: number;
  scheduledFor: string | null;
  priority: Priority;
}

export function validateTaskForm(values: TaskFormValues): TaskFormErrors {
  const errors: TaskFormErrors = {};
  const trimmed = values.name.trim();

  if (!trimmed) {
    errors.name = "El nombre es obligatorio.";
  } else if (trimmed.length < 2) {
    errors.name = "Debe tener al menos 2 caracteres.";
  } else if (trimmed.length > 80) {
    errors.name = "Máximo 80 caracteres.";
  }

  const isInbox = values.scheduledFor === null;

  if (isInbox) {
    if (values.targetMinutes !== 0) {
      errors.targetMinutes = "Las tareas en la bandeja no tienen tiempo.";
    }
    if (values.period !== null) {
      errors.period = "Las tareas en la bandeja no tienen periodo.";
    }
  } else {
    if (!Number.isFinite(values.targetMinutes)) {
      errors.targetMinutes = "Duración inválida.";
    } else if (values.targetMinutes < 1) {
      errors.targetMinutes = "Debe ser al menos 1 minuto.";
    } else if (values.targetMinutes > 1440) {
      errors.targetMinutes = "Máximo 1440 minutos (24h).";
    } else if (!Number.isInteger(values.targetMinutes)) {
      errors.targetMinutes = "Debe ser un número entero.";
    }

    if (values.period === null || !PERIODS.includes(values.period)) {
      errors.period = "Periodo obligatorio.";
    }
  }

  if (!PRIORITIES.includes(values.priority)) {
    errors.priority = "Prioridad inválida.";
  }

  return errors;
}

export interface TimeTrackingErrors {
  minutes?: string;
  [key: string]: string | undefined;
}

export function validateTimeTracking(minutes: number): TimeTrackingErrors {
  const errors: TimeTrackingErrors = {};
  if (!Number.isFinite(minutes)) {
    errors.minutes = "Cantidad inválida.";
  } else if (minutes < 1) {
    errors.minutes = "Debe ser al menos 1 minuto.";
  } else if (minutes > 1440) {
    errors.minutes = "Máximo 1440 minutos (24h).";
  } else if (!Number.isInteger(minutes)) {
    errors.minutes = "Debe ser un número entero.";
  }
  return errors;
}

export interface CategoryFormErrors {
  name?: string;
  [key: string]: string | undefined;
}

export function validateCategoryForm(name: string): CategoryFormErrors {
  const errors: CategoryFormErrors = {};
  const trimmed = name.trim();
  if (!trimmed) {
    errors.name = "El nombre es obligatorio.";
  } else if (trimmed.length < 2) {
    errors.name = "Debe tener al menos 2 caracteres.";
  } else if (trimmed.length > 30) {
    errors.name = "Máximo 30 caracteres.";
  }
  return errors;
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some((v) => Boolean(v));
}

export function isTask(t: unknown): t is Task {
  if (typeof t !== "object" || t === null) return false;
  const task = t as Record<string, unknown>;
  return (
    typeof task.id === "string" &&
    typeof task.name === "string" &&
    (typeof task.categoryId === "string" || task.categoryId === null) &&
    (typeof task.period === "string" || task.period === null) &&
    typeof task.targetMinutes === "number" &&
    typeof task.workedMinutes === "number" &&
    typeof task.status === "string" &&
    typeof task.createdAt === "string" &&
    (typeof task.scheduledFor === "string" || task.scheduledFor === null ||
      !("scheduledFor" in task)) &&
    (typeof task.priority === "string" || !("priority" in task))
  );
}