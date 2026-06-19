import type { Category } from "../types/category";
import type { Task } from "../types/task";
import { isTask } from "./validation";

export interface AppData {
  version: number;
  exportedAt: string;
  tasks: Task[];
  categories: Category[];
}

export function exportToJSON(
  tasks: Task[],
  categories: Category[],
): string {
  const data: AppData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    tasks,
    categories,
  };
  return JSON.stringify(data, null, 2);
}

export interface ImportResult {
  ok: boolean;
  tasks?: Task[];
  categories?: Category[];
  error?: string;
}

export function importFromJSON(raw: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "JSON inválido." };
  }

  if (typeof parsed !== "object" || parsed === null) {
    return { ok: false, error: "Estructura no reconocida." };
  }

  const obj = parsed as Record<string, unknown>;
  const tasksRaw = obj.tasks;
  const categoriesRaw = obj.categories;

  if (!Array.isArray(tasksRaw) || !Array.isArray(categoriesRaw)) {
    return { ok: false, error: "Faltan listas de tareas o categorías." };
  }

  const categories: Category[] = categoriesRaw
    .filter((c): c is Category => {
      if (typeof c !== "object" || c === null) return false;
      const cat = c as Record<string, unknown>;
      return typeof cat.id === "string" && typeof cat.name === "string";
    })
    .map((c) => ({ id: c.id, name: c.name }));

  const validCategoryIds = new Set(categories.map((c) => c.id));
  const tasks: Task[] = tasksRaw.filter(isTask).map((t) => ({
    ...t,
    categoryId:
      t.categoryId && validCategoryIds.has(t.categoryId) ? t.categoryId : null,
  }));

  return { ok: true, tasks, categories };
}

export function downloadJSON(content: string, filename: string): void {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}