import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  CircleDashed,
  Clock3,
  GripVertical,
  Pencil,
  PlayCircle,
  Tag,
  Timer,
  Trash2,
} from "lucide-react";
import type { CSSProperties } from "react";
import type { Category } from "../../types/category";
import type { Task } from "../../types/task";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { ProgressBar } from "../ui/ProgressBar";
import { cn } from "../../utils/cn";
import {
  PERIOD_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
} from "../../utils/validation";
import { formatDate, formatTime } from "../../utils/date";
import { progressPercent, remainingMinutes } from "../../utils/stats";

interface TaskCardProps {
  task: Task;
  category: Category | undefined;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onTrackTime: (task: Task) => void;
  onToggleStatus: (task: Task) => void;
  draggable?: boolean;
}

export function TaskCard({
  task,
  category,
  onEdit,
  onDelete,
  onTrackTime,
  onToggleStatus,
  draggable = true,
}: TaskCardProps) {
  const sortable = useSortable({ id: task.id, disabled: !draggable });
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = sortable;

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const percent = progressPercent(task);
  const remaining = remainingMinutes(task);
  const isCompleted = task.status === "completed";
  const nextStatusLabel =
    task.status === "pending"
      ? "Empezar"
      : task.status === "working"
        ? "Terminar"
        : "Reabrir";

  return (
    <motion.article
      ref={setNodeRef}
      style={style}
      layout
      className={cn(
        "group relative flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md",
        "dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/50",
        isCompleted && "opacity-90",
        isDragging &&
          "z-10 rotate-1 shadow-xl ring-2 ring-indigo-300 dark:ring-indigo-500/50",
      )}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      <div className="flex items-start gap-3">
        {draggable && (
          <button
            type="button"
            aria-label="Reordenar tarea"
            className="mt-0.5 cursor-grab rounded-md p-1 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-500 active:cursor-grabbing dark:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}

        <button
          type="button"
          onClick={() => onToggleStatus(task)}
          aria-label={`Cambiar estado: ${nextStatusLabel}`}
          className={cn(
            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all",
            isCompleted
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-slate-300 text-transparent hover:border-indigo-400 dark:border-slate-600 dark:hover:border-indigo-400",
          )}
        >
          {isCompleted && <CheckCircle2 className="h-4 w-4" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={cn(
                "text-base font-semibold leading-tight text-slate-900 dark:text-slate-50",
                isCompleted &&
                  "text-slate-500 line-through decoration-slate-400 dark:text-slate-400",
              )}
            >
              {task.name}
            </h3>
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(task)}
                leftIcon={<Pencil className="h-3.5 w-3.5" />}
                aria-label="Editar tarea"
              >
                Editar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(task)}
                leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                aria-label="Eliminar tarea"
                className="text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
              >
                Eliminar
              </Button>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
            <Badge className={STATUS_COLORS[task.status]}>
              {task.status === "completed" ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : task.status === "working" ? (
                <PlayCircle className="h-3 w-3" />
              ) : (
                <CircleDashed className="h-3 w-3" />
              )}
              {STATUS_LABELS[task.status]}
            </Badge>
            <Badge variant="outline">
              <Clock3 className="h-3 w-3" />
              {PERIOD_LABELS[task.period]}
            </Badge>
            {category && (
              <Badge variant="outline">
                <Tag className="h-3 w-3" />
                {category.name}
              </Badge>
            )}
            <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
              <Calendar className="h-3 w-3" />
              {formatDate(task.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <ProgressBar
          value={percent}
          label={`${task.workedMinutes} / ${task.targetMinutes} minutos · ${Math.round(percent)}%`}
          tone={isCompleted ? "success" : "brand"}
          showValue
        />
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Timer className="h-3 w-3" />
            {isCompleted
              ? `Meta alcanzada · ${task.workedMinutes} min`
              : `${remaining} min restantes`}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
            Actualizado {formatTime(new Date(task.createdAt))}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onToggleStatus(task)}
          leftIcon={
            task.status === "pending" ? (
              <PlayCircle className="h-4 w-4" />
            ) : task.status === "working" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <CircleDashed className="h-4 w-4" />
            )
          }
        >
          {nextStatusLabel}
        </Button>
        <Button
          size="sm"
          variant="primary"
          onClick={() => onTrackTime(task)}
          leftIcon={<Timer className="h-4 w-4" />}
          disabled={isCompleted}
        >
          Registrar tiempo
        </Button>
      </div>
    </motion.article>
  );
}