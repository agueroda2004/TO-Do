import type { Period, Task, TaskStatus } from "../types/task";
import type { TaskFormValues } from "../utils/validation";

export interface TaskFilter {
  search: string;
  categoryId: string | null;
  status: TaskStatus | null;
  period: Period | null;
}

export const EMPTY_FILTER: TaskFilter = {
  search: "",
  categoryId: null,
  status: null,
  period: null,
};

export function filterTasks(tasks: Task[], filter: TaskFilter): Task[] {
  const search = filter.search.trim().toLowerCase();
  return tasks.filter((t) => {
    if (search && !t.name.toLowerCase().includes(search)) return false;
    if (filter.categoryId && t.categoryId !== filter.categoryId) return false;
    if (filter.status && t.status !== filter.status) return false;
    if (filter.period && t.period !== filter.period) return false;
    return true;
  });
}

export function buildTaskFromForm(
  values: TaskFormValues,
  existing?: Task,
): Task {
  const now = new Date().toISOString();
  if (existing) {
    return {
      ...existing,
      name: values.name.trim(),
      categoryId: values.categoryId,
      period: values.period,
      targetMinutes: values.targetMinutes,
    };
  }
  return {
    id: `task_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    name: values.name.trim(),
    categoryId: values.categoryId,
    period: values.period,
    targetMinutes: values.targetMinutes,
    workedMinutes: 0,
    status: "pending",
    createdAt: now,
  };
}

export function applyTimeEntry(task: Task, minutes: number): Task {
  const nextWorked = task.workedMinutes + minutes;
  let nextStatus: TaskStatus = task.status;
  if (nextWorked >= task.targetMinutes) {
    nextStatus = "completed";
  } else if (nextWorked > 0 && task.status === "pending") {
    nextStatus = "working";
  }
  return {
    ...task,
    workedMinutes: nextWorked,
    status: nextStatus,
  };
}