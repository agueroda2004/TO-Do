import { useMemo } from "react";
import type { Task } from "../types/task";
import { computeStats, type DashboardStats } from "../utils/stats";

export function useDashboardStats(tasks: Task[]): DashboardStats {
  return useMemo(() => computeStats(tasks), [tasks]);
}