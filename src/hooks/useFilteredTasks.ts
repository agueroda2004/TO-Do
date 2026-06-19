import { useMemo } from "react";
import type { Task } from "../types/task";
import type { TaskFilter } from "./useTasks";
import { filterTasks } from "./useTasks";

export function useFilteredTasks(
  tasks: Task[],
  filter: TaskFilter,
): Task[] {
  return useMemo(() => filterTasks(tasks, filter), [tasks, filter]);
}