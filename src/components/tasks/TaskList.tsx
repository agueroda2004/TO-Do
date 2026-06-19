import { useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, ListTodo, Moon, Sun } from "lucide-react";
import type { Category } from "../../types/category";
import type { Period, Task } from "../../types/task";
import { EmptyState } from "../ui/EmptyState";
import { TaskCard } from "./TaskCard";
import { PERIOD_LABELS } from "../../utils/validation";
import { cn } from "../../utils/cn";

interface TaskListProps {
  tasks: Task[];
  categories: Category[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onTrackTime: (task: Task) => void;
  onToggleStatus: (task: Task) => void;
  onReorder: (ids: string[]) => void;
  onCreate: () => void;
}

const PERIOD_ICONS: Record<Period, typeof Sun> = {
  morning: Sun,
  afternoon: CalendarDays,
  night: Moon,
};

export function TaskList({
  tasks,
  categories,
  onEdit,
  onDelete,
  onTrackTime,
  onToggleStatus,
  onReorder,
  onCreate,
}: TaskListProps) {
  const [groupByPeriod, setGroupByPeriod] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const categoryById = useMemo(() => {
    const map = new Map<string, Category>();
    for (const c of categories) map.set(c.id, c);
    return map;
  }, [categories]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const newOrder = arrayMove(tasks, oldIndex, newIndex).map((t) => t.id);
    onReorder(newOrder);
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={<ListTodo className="h-6 w-6" />}
        title="No hay tareas todavía"
        description="Crea tu primera tarea para empezar a organizar tu día y registrar tu tiempo."
        action={
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
          >
            <ListTodo className="h-4 w-4" />
            Crear primera tarea
          </button>
        }
      />
    );
  }

  const periods: Period[] = ["morning", "afternoon", "night"];
  const grouped = periods.map((p) => ({
    period: p,
    items: tasks.filter((t) => t.period === p),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 text-xs font-medium dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setGroupByPeriod(true)}
            className={cn(
              "rounded-md px-3 py-1.5 transition-colors",
              groupByPeriod
                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
            )}
          >
            Por periodo
          </button>
          <button
            type="button"
            onClick={() => setGroupByPeriod(false)}
            className={cn(
              "rounded-md px-3 py-1.5 transition-colors",
              !groupByPeriod
                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
            )}
          >
            Plano
          </button>
        </div>
      </div>

      {groupByPeriod ? (
        <div className="space-y-8">
          {grouped.map(({ period, items }) => (
            <section key={period} className="space-y-3">
              <header className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                  {(() => {
                    const Icon = PERIOD_ICONS[period];
                    return <Icon className="h-4 w-4" />;
                  })()}
                </div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  {PERIOD_LABELS[period]}
                </h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {items.length}
                </span>
              </header>

              {items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400 dark:border-slate-800 dark:text-slate-500">
                  Sin tareas en este periodo.
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={items.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <AnimatePresence mode="popLayout">
                        {items.map((task) => (
                          <motion.div key={task.id} layout>
                            <TaskCard
                              task={task}
                              category={categoryById.get(task.categoryId ?? "")}
                              onEdit={onEdit}
                              onDelete={onDelete}
                              onTrackTime={onTrackTime}
                              onToggleStatus={onToggleStatus}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </section>
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {tasks.map((task) => (
                  <motion.div key={task.id} layout>
                    <TaskCard
                      task={task}
                      category={categoryById.get(task.categoryId ?? "")}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onTrackTime={onTrackTime}
                      onToggleStatus={onToggleStatus}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}