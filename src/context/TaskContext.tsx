import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { useTaskStore, type TasksApi } from "../hooks/useTaskStore";

const TaskContext = createContext<TasksApi | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const store = useTaskStore();
  const value = useMemo(() => store, [store]);
  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTasksContext(): TasksApi {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTasksContext debe usarse dentro de TaskProvider");
  return ctx;
}