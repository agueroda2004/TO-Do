import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarPlus,
  ChevronDown,
  Flag,
  Inbox as InboxIcon,
  Pencil,
  Plus,
  Tag,
  Trash2,
} from "lucide-react";
import type { Category } from "../../types/category";
import type { Task } from "../../types/task";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";
import { formatDate } from "../../utils/date";
import {
  PRIORITY_BADGE_STYLES,
  PRIORITY_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
} from "../../utils/validation";

interface InboxSectionProps {
  tasks: Task[];
  categories: Category[];
  onSchedule: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onCreate: () => void;
  onToggleStatus: (task: Task) => void;
}

export function InboxSection({
  tasks,
  categories,
  onSchedule,
  onEdit,
  onDelete,
  onCreate,
  onToggleStatus,
}: InboxSectionProps) {
  const [collapsed, setCollapsed] = useState(false);

  const categoryById = useMemo(() => {
    const map = new Map<string, Category>();
    for (const c of categories) map.set(c.id, c);
    return map;
  }, [categories]);

  if (tasks.length === 0) return null;

  return (
    <section className="space-y-3">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-expanded={!collapsed}
          className="group flex items-center gap-2 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/50"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
            <InboxIcon className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Bandeja de entrada
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Pensamientos rápidos sin fecha asignada
            </p>
          </div>
          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
            {tasks.length}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-slate-400 transition-transform",
              collapsed && "-rotate-90",
            )}
          />
        </button>
        <Button
          size="sm"
          variant="outline"
          onClick={onCreate}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Añadir a la bandeja
        </Button>
      </header>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="grid grid-cols-1 gap-3 overflow-hidden md:grid-cols-2"
          >
            {tasks.map((task) => {
              const category = task.categoryId
                ? categoryById.get(task.categoryId)
                : undefined;
              const isCompleted = task.status === "completed";
              return (
                <motion.li
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className={cn(
                    "group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white p-4 transition-all hover:border-indigo-300 hover:shadow-sm",
                    "dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-500/50",
                    isCompleted && "opacity-80",
                  )}
                >
                  <div
                    aria-hidden
                    className={cn(
                      "absolute inset-y-0 left-0 w-1",
                      task.priority === "high" && "bg-rose-500",
                      task.priority === "medium" && "bg-amber-500",
                      task.priority === "low" && "bg-slate-300 dark:bg-slate-600",
                    )}
                  />
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleStatus(task)}
                      aria-label={`Cambiar estado: ${isCompleted ? "reabrir" : "terminar"}`}
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                        isCompleted
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-slate-300 text-transparent hover:border-indigo-400 dark:border-slate-600 dark:hover:border-indigo-400",
                      )}
                    >
                      {isCompleted && (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="h-3 w-3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-semibold leading-snug text-slate-900 dark:text-slate-50",
                          isCompleted &&
                            "text-slate-500 line-through dark:text-slate-400",
                        )}
                      >
                        {task.name}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                        <Badge className={STATUS_COLORS[task.status]}>
                          {STATUS_LABELS[task.status]}
                        </Badge>
                        <Badge className={PRIORITY_BADGE_STYLES[task.priority]}>
                          <Flag className="h-3 w-3" />
                          {PRIORITY_LABELS[task.priority]}
                        </Badge>
                        {category && (
                          <Badge variant="outline">
                            <Tag className="h-3 w-3" />
                            {category.name}
                          </Badge>
                        )}
                        <span className="text-slate-400 dark:text-slate-500">
                          {formatDate(task.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-1 border-t border-dashed border-slate-200 pt-3 dark:border-slate-700">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(task)}
                      leftIcon={<Pencil className="h-3.5 w-3.5" />}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(task)}
                      leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                      className="text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
                    >
                      Eliminar
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => onSchedule(task)}
                      leftIcon={<CalendarPlus className="h-3.5 w-3.5" />}
                    >
                      Programar
                    </Button>
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </section>
  );
}