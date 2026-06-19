import {
  CheckCircle2,
  CircleDashed,
  Clock3,
  ListTodo,
  Timer,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { DashboardStats } from "../../utils/stats";
import { minutesToHours } from "../../utils/time";
import { cn } from "../../utils/cn";

interface DashboardStatsProps {
  stats: DashboardStats;
}

interface StatCard {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
  tone: "indigo" | "amber" | "emerald" | "slate" | "rose";
}

const toneStyles: Record<
  StatCard["tone"],
  { bg: string; text: string; ring: string }
> = {
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
    text: "text-indigo-600 dark:text-indigo-300",
    ring: "ring-indigo-200 dark:ring-indigo-500/20",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-300",
    ring: "ring-amber-200 dark:ring-amber-500/20",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-300",
    ring: "ring-emerald-200 dark:ring-emerald-500/20",
  },
  slate: {
    bg: "bg-slate-100 dark:bg-slate-800/60",
    text: "text-slate-700 dark:text-slate-200",
    ring: "ring-slate-200 dark:ring-slate-700",
  },
  rose: {
    bg: "bg-rose-50 dark:bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-300",
    ring: "ring-rose-200 dark:ring-rose-500/20",
  },
};

export function DashboardStatsView({ stats }: DashboardStatsProps) {
  const cards: StatCard[] = [
    {
      label: "Total",
      value: stats.total.toString(),
      hint: "Tareas creadas",
      icon: <ListTodo className="h-5 w-5" />,
      tone: "indigo",
    },
    {
      label: "Pendientes",
      value: stats.pending.toString(),
      hint: "Por empezar",
      icon: <CircleDashed className="h-5 w-5" />,
      tone: "slate",
    },
    {
      label: "En progreso",
      value: stats.working.toString(),
      hint: "Activas ahora",
      icon: <Clock3 className="h-5 w-5" />,
      tone: "amber",
    },
    {
      label: "Terminadas",
      value: stats.completed.toString(),
      hint: `${Math.round(stats.completionRate)}% completado`,
      icon: <CheckCircle2 className="h-5 w-5" />,
      tone: "emerald",
    },
    {
      label: "Tiempo trabajado",
      value: minutesToHours(stats.totalWorkedMinutes),
      hint: "Minutos acumulados",
      icon: <Timer className="h-5 w-5" />,
      tone: "rose",
    },
  ];

  return (
    <section aria-label="Resumen general">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-indigo-500" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
          Resumen
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c, i) => {
          const style = toneStyles[c.tone];
          return (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.2 }}
              className={cn(
                "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
                "dark:border-slate-800 dark:bg-slate-900",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {c.label}
                </span>
                <span
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-xl ring-1",
                    style.bg,
                    style.text,
                    style.ring,
                  )}
                >
                  {c.icon}
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-50">
                {c.value}
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {c.hint}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}