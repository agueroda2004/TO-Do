import { useCallback, useEffect, useReducer } from "react";
import type { Task } from "../types/task";
import { STORAGE_KEYS, localStorageService } from "../services/localStorageService";
import {
  applyTimeEntry,
  buildTaskFromForm,
  type TaskFilter,
} from "./useTasks";
import { isTask, type TaskFormValues } from "../utils/validation";

type State = { tasks: Task[]; filter: TaskFilter };

type Action =
  | { type: "HYDRATE"; tasks: Task[] }
  | { type: "SET_FILTER"; filter: Partial<TaskFilter> }
  | { type: "RESET_FILTER" }
  | { type: "ADD_TASK"; task: Task }
  | { type: "UPDATE_TASK"; task: Task }
  | { type: "DELETE_TASK"; id: string }
  | { type: "REGISTER_TIME"; id: string; minutes: number }
  | { type: "SET_STATUS"; id: string; status: Task["status"] }
  | { type: "REORDER"; ids: string[] }
  | { type: "CLEAR_CATEGORY"; categoryId: string }
  | { type: "REPLACE_ALL"; tasks: Task[] }
  | { type: "CLEAR_ALL" };

const EMPTY_FILTER: TaskFilter = {
  search: "",
  categoryId: null,
  status: null,
  period: null,
  priority: null,
  hideCompleted: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, tasks: action.tasks };
    case "SET_FILTER":
      return { ...state, filter: { ...state.filter, ...action.filter } };
    case "RESET_FILTER":
      return { ...state, filter: EMPTY_FILTER };
    case "ADD_TASK":
      return { ...state, tasks: [action.task, ...state.tasks] };
    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.task.id ? action.task : t,
        ),
      };
    case "DELETE_TASK":
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) };
    case "REGISTER_TIME": {
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id ? applyTimeEntry(t, action.minutes) : t,
        ),
      };
    }
    case "SET_STATUS":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id ? { ...t, status: action.status } : t,
        ),
      };
    case "REORDER": {
      const map = new Map(state.tasks.map((t) => [t.id, t]));
      const reordered: Task[] = [];
      for (const id of action.ids) {
        const task = map.get(id);
        if (task) {
          reordered.push(task);
          map.delete(id);
        }
      }
      for (const remaining of map.values()) reordered.push(remaining);
      return { ...state, tasks: reordered };
    }
    case "CLEAR_CATEGORY":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.categoryId === action.categoryId ? { ...t, categoryId: null } : t,
        ),
      };
    case "REPLACE_ALL":
      return { ...state, tasks: action.tasks };
    case "CLEAR_ALL":
      return { tasks: [], filter: EMPTY_FILTER };
    default:
      return state;
  }
}

export interface TasksApi {
  tasks: Task[];
  filter: TaskFilter;
  setFilter: (filter: Partial<TaskFilter>) => void;
  resetFilter: () => void;
  addTask: (values: TaskFormValues) => Task;
  updateTask: (id: string, values: TaskFormValues) => void;
  deleteTask: (id: string) => void;
  registerTime: (id: string, minutes: number) => void;
  setStatus: (id: string, status: Task["status"]) => void;
  reorder: (ids: string[]) => void;
  clearCategoryFromTasks: (categoryId: string) => number;
  replaceAll: (tasks: Task[]) => void;
  clearAll: () => void;
  affectedByCategory: (categoryId: string) => number;
}

function migrateTasks(tasks: unknown[]): Task[] {
  const today = new Date().toISOString().slice(0, 10);
  let mutated = false;
  const migrated: Task[] = [];
  for (const raw of tasks) {
    if (!isTask(raw)) continue;
    const t = raw as Task & {
      scheduledFor?: string | null;
      priority?: string;
    };
    let updated = t;
    if (!("scheduledFor" in t) || t.scheduledFor === undefined) {
      updated = { ...updated, scheduledFor: today };
      mutated = true;
    }
    if (!("priority" in t) || t.priority === undefined) {
      updated = { ...updated, priority: "medium" };
      mutated = true;
    }
    migrated.push(updated);
  }
  if (mutated) {
    localStorageService.set(STORAGE_KEYS.tasks, migrated);
  }
  return migrated;
}

export function useTaskStore(): TasksApi {
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const raw = localStorageService.get<unknown[]>(STORAGE_KEYS.tasks, []);
    const tasks = migrateTasks(raw);
    return { tasks, filter: EMPTY_FILTER };
  });

  useEffect(() => {
    localStorageService.set(STORAGE_KEYS.tasks, state.tasks);
  }, [state.tasks]);

  const setFilter = useCallback(
    (filter: Partial<TaskFilter>) => dispatch({ type: "SET_FILTER", filter }),
    [],
  );
  const resetFilter = useCallback(() => dispatch({ type: "RESET_FILTER" }), []);

  const addTask = useCallback((values: TaskFormValues) => {
    const task = buildTaskFromForm(values);
    dispatch({ type: "ADD_TASK", task });
    return task;
  }, []);

  const updateTask = useCallback(
    (id: string, values: TaskFormValues) => {
      const existing = state.tasks.find((t) => t.id === id);
      if (!existing) return;
      const isInbox = values.scheduledFor === null;
      const task: Task = {
        ...existing,
        name: values.name.trim(),
        categoryId: values.categoryId,
        period: isInbox ? null : values.period,
        targetMinutes: isInbox ? 0 : values.targetMinutes,
        scheduledFor: values.scheduledFor,
        priority: values.priority,
      };
      dispatch({ type: "UPDATE_TASK", task });
    },
    [state.tasks],
  );

  const deleteTask = useCallback((id: string) => {
    dispatch({ type: "DELETE_TASK", id });
  }, []);

  const registerTime = useCallback((id: string, minutes: number) => {
    dispatch({ type: "REGISTER_TIME", id, minutes });
  }, []);

  const setStatus = useCallback((id: string, status: Task["status"]) => {
    dispatch({ type: "SET_STATUS", id, status });
  }, []);

  const reorder = useCallback((ids: string[]) => {
    dispatch({ type: "REORDER", ids });
  }, []);

  const clearCategoryFromTasks = useCallback(
    (categoryId: string) => {
      const affected = state.tasks.filter(
        (t) => t.categoryId === categoryId,
      ).length;
      dispatch({ type: "CLEAR_CATEGORY", categoryId });
      return affected;
    },
    [state.tasks],
  );

  const replaceAll = useCallback((tasks: Task[]) => {
    dispatch({ type: "REPLACE_ALL", tasks });
  }, []);

  const clearAll = useCallback(() => dispatch({ type: "CLEAR_ALL" }), []);

  const affectedByCategory = useCallback(
    (categoryId: string) =>
      state.tasks.filter((t) => t.categoryId === categoryId).length,
    [state.tasks],
  );

  return {
    tasks: state.tasks,
    filter: state.filter,
    setFilter,
    resetFilter,
    addTask,
    updateTask,
    deleteTask,
    registerTime,
    setStatus,
    reorder,
    clearCategoryFromTasks,
    replaceAll,
    clearAll,
    affectedByCategory,
  };
}