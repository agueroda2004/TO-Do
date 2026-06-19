import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity } from "lucide-react";
import type { Task } from "../../types/task";
import { computeWeeklyProductivity } from "../../utils/stats";
import { getWeekStart } from "../../utils/date";

interface WeeklyChartProps {
  tasks: Task[];
}

interface TooltipPayloadItem {
  value?: number | string;
  name?: string;
  color?: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md dark:border-slate-700 dark:bg-slate-900">
      <p className="font-medium text-slate-700 dark:text-slate-200">{label}</p>
      {payload.map((p, idx) => (
        <p
          key={idx}
          className="text-slate-500 dark:text-slate-400"
          style={{ color: p.color }}
        >
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export function WeeklyChart({ tasks }: WeeklyChartProps) {
  const data = useMemo(
    () => computeWeeklyProductivity(tasks, getWeekStart()),
    [tasks],
  );

  const totalMinutes = data.reduce((acc, d) => acc + d.minutes, 0);
  const totalCompleted = data.reduce((acc, d) => acc + d.completed, 0);

  return (
    <section
      aria-label="Productividad semanal"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-indigo-500" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Productividad semanal
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            Minutos
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Terminadas
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="minutesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
              <XAxis
                dataKey="label"
                stroke="currentColor"
                className="text-xs text-slate-400"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="currentColor"
                className="text-xs text-slate-400"
                tickLine={false}
                axisLine={false}
                width={32}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#6366f1", strokeOpacity: 0.3 }} />
              <Area
                type="monotone"
                dataKey="minutes"
                name="Minutos"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#minutesGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
              <XAxis
                dataKey="label"
                stroke="currentColor"
                className="text-xs text-slate-400"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="currentColor"
                className="text-xs text-slate-400"
                tickLine={false}
                axisLine={false}
                width={32}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "transparent" }} />
              <Bar
                dataKey="completed"
                name="Terminadas"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <footer className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Semana actual (lunes a domingo)</span>
        <span className="tabular-nums">
          {totalMinutes} min · {totalCompleted} tareas terminadas
        </span>
      </footer>
    </section>
  );
}