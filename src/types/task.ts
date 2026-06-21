export interface Task {
  id: string;
  name: string;
  categoryId: string | null;
  period: Period | null;
  targetMinutes: number;
  workedMinutes: number;
  status: "pending" | "working" | "completed";
  createdAt: string;
  scheduledFor: string | null;
  priority: Priority;
}

export type Period = "morning" | "afternoon" | "night";
export type TaskStatus = Task["status"];
export type Priority = "low" | "medium" | "high";