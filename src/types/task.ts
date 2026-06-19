export interface Task {
  id: string;
  name: string;
  categoryId: string | null;
  period: "morning" | "afternoon" | "night";
  targetMinutes: number;
  workedMinutes: number;
  status: "pending" | "working" | "completed";
  createdAt: string;
}

export type Period = Task["period"];
export type TaskStatus = Task["status"];