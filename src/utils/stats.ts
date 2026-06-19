import type { Task, TaskStatus } from "../types/task";
import { clamp } from "./time";

export function progressPercent(task: Task): number {
  if (task.targetMinutes <= 0) return 0;
  return clamp((task.workedMinutes / task.targetMinutes) * 100, 0, 100);
}

export function remainingMinutes(task: Task): number {
  return Math.max(task.targetMinutes - task.workedMinutes, 0);
}

export interface DashboardStats {
  total: number;
  pending: number;
  working: number;
  completed: number;
  totalWorkedMinutes: number;
  completionRate: number;
}

export function computeStats(tasks: Task[]): DashboardStats {
  const counts: Record<TaskStatus, number> = {
    pending: 0,
    working: 0,
    completed: 0,
  };
  let totalWorked = 0;
  for (const t of tasks) {
    counts[t.status] += 1;
    totalWorked += t.workedMinutes;
  }
  const total = tasks.length;
  return {
    total,
    pending: counts.pending,
    working: counts.working,
    completed: counts.completed,
    totalWorkedMinutes: totalWorked,
    completionRate: total === 0 ? 0 : (counts.completed / total) * 100,
  };
}

export interface DailyPoint {
  date: string;
  label: string;
  minutes: number;
  completed: number;
}

export function computeWeeklyProductivity(
  tasks: Task[],
  weekStart: Date,
): DailyPoint[] {
  const days: DailyPoint[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    days.push({
      date: iso,
      label: d.toLocaleDateString("es-ES", { weekday: "short" }).slice(0, 3),
      minutes: 0,
      completed: 0,
    });
  }
  for (const t of tasks) {
    const created = t.createdAt.slice(0, 10);
    const point = days.find((d) => d.date === created);
    if (point) {
      point.minutes += t.workedMinutes;
      if (t.status === "completed") point.completed += 1;
    }
  }
  return days;
}