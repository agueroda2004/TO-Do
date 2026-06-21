import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, LayoutGrid, Tags } from "lucide-react";
import { toast } from "sonner";
import { Header } from "../components/layout/Header";
import { Button } from "../components/ui/Button";
import { DashboardStatsView } from "../components/dashboard/DashboardStats";
import { WeeklyChart } from "../components/dashboard/WeeklyChart";
import { FilterBar } from "../components/tasks/FilterBar";
import { TaskList } from "../components/tasks/TaskList";
import { TaskFormModal } from "../components/tasks/TaskFormModal";
import { TimeTrackingModal } from "../components/tasks/TimeTrackingModal";
import { CategoryManager } from "../components/categories/CategoryManager";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { useCategories } from "../context/CategoryContext";
import { useTasksContext } from "../context/TaskContext";
import { useFilteredTasks } from "../hooks/useFilteredTasks";
import { useDashboardStats } from "../hooks/useDashboardStats";
import type { Task } from "../types/task";
import type { TaskFormValues } from "../utils/validation";

export function DashboardPage() {
  const tasksCtx = useTasksContext();
  const { categories, addCategory, updateCategory, deleteCategory, existsByName, replaceAll } =
    useCategories();

  const stats = useDashboardStats(tasksCtx.tasks);
  const filteredTasks = useFilteredTasks(tasksCtx.tasks, tasksCtx.filter);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [trackingTask, setTrackingTask] = useState<Task | null>(null);
  const [toDeleteTask, setToDeleteTask] = useState<Task | null>(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const categoryById = useMemo(() => {
    const map = new Map<string, (typeof categories)[number]>();
    for (const c of categories) map.set(c.id, c);
    return map;
  }, [categories]);

  function openCreateTask() {
    setEditingTask(null);
    setTaskModalOpen(true);
  }

  function openEditTask(task: Task) {
    setEditingTask(task);
    setTaskModalOpen(true);
  }

  function handleTaskSubmit(values: TaskFormValues) {
    if (editingTask) {
      tasksCtx.updateTask(editingTask.id, values);
      toast.success("Tarea actualizada");
    } else {
      tasksCtx.addTask(values);
      toast.success("Tarea creada", { description: values.name });
    }
    setTaskModalOpen(false);
    setEditingTask(null);
  }

  function handleToggleStatus(task: Task) {
    if (task.status === "pending") {
      tasksCtx.setStatus(task.id, "working");
      toast.info("Tarea en progreso");
    } else if (task.status === "working") {
      tasksCtx.setStatus(task.id, "completed");
      toast.success("Tarea terminada", { description: task.name });
    } else {
      tasksCtx.setStatus(task.id, "pending");
      toast.info("Tarea reabierta");
    }
  }

  function handleRegisterTime(minutes: number) {
    if (!trackingTask) return;
    tasksCtx.registerTime(trackingTask.id, minutes);
    const willComplete =
      trackingTask.workedMinutes + minutes >= trackingTask.targetMinutes;
    if (willComplete) {
      toast.success("¡Meta alcanzada!", {
        description: `"${trackingTask.name}" marcada como terminada.`,
      });
    } else {
      toast.success("Tiempo registrado", { description: `${minutes} minutos` });
    }
    setTrackingTask(null);
  }

  function handleDeleteTask() {
    if (!toDeleteTask) return;
    tasksCtx.deleteTask(toDeleteTask.id);
    toast.success("Tarea eliminada", { description: toDeleteTask.name });
    setToDeleteTask(null);
  }

  function handleCreateCategory(name: string) {
    if (existsByName(name)) {
      toast.error("Categoría duplicada", { description: `"${name}" ya existe.` });
      return;
    }
    addCategory(name);
    toast.success("Categoría creada", { description: name });
  }

  function handleUpdateCategory(id: string, name: string) {
    if (existsByName(name, id)) {
      toast.error("Categoría duplicada", { description: `"${name}" ya existe.` });
      return;
    }
    updateCategory(id, name);
    toast.success("Categoría actualizada");
  }

  function handleDeleteCategory(id: string) {
    const cat = categoryById.get(id);
    if (!cat) return;
    const affected = tasksCtx.affectedByCategory(id);
    deleteCategory(id);
    if (affected > 0) {
      tasksCtx.clearCategoryFromTasks(id);
      toast.success("Categoría eliminada", {
        description: `${affected} tarea${affected === 1 ? "" : "s"} reasignada${affected === 1 ? "" : "s"}.`,
      });
    } else {
      toast.success("Categoría eliminada");
    }
  }

  function handleImport(tasks: Task[], cats: typeof categories) {
    tasksCtx.replaceAll(tasks);
    replaceAll(cats);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header
        onCreateTask={openCreateTask}
        onToggleCategories={() => setCategoriesOpen((v) => !v)}
        tasks={tasksCtx.tasks}
        categories={categories}
        onImport={handleImport}
      />

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <DashboardStatsView stats={stats} />

        <WeeklyChart tasks={tasksCtx.tasks} />

        <FilterBar
          filter={tasksCtx.filter}
          categories={categories}
          onChange={tasksCtx.setFilter}
          onReset={tasksCtx.resetFilter}
          resultsCount={filteredTasks.length}
        />

        <section className="space-y-4">
          <header className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-indigo-500" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Mis tareas
              </h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {filteredTasks.length}
                {tasksCtx.filter.hideCompleted && stats.completed > 0 && (
                  <span className="ml-1 text-slate-400 dark:text-slate-500">
                    / {tasksCtx.tasks.length}
                  </span>
                )}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant={tasksCtx.filter.hideCompleted ? "primary" : "outline"}
                onClick={() =>
                  tasksCtx.setFilter({
                    hideCompleted: !tasksCtx.filter.hideCompleted,
                  })
                }
                leftIcon={
                  tasksCtx.filter.hideCompleted ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )
                }
                aria-pressed={tasksCtx.filter.hideCompleted}
                title={
                  tasksCtx.filter.hideCompleted
                    ? "Mostrar tareas terminadas"
                    : "Ocultar tareas terminadas"
                }
              >
                <span className="hidden sm:inline">
                  {tasksCtx.filter.hideCompleted
                    ? "Mostrar terminadas"
                    : "Ocultar terminadas"}
                </span>
                {stats.completed > 0 && (
                  <span
                    className={
                      tasksCtx.filter.hideCompleted
                        ? "ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1.5 text-[11px] font-semibold"
                        : "ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-100 px-1.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    }
                  >
                    {stats.completed}
                  </span>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCategoriesOpen((v) => !v)}
                leftIcon={<Tags className="h-4 w-4" />}
                className="sm:hidden"
              >
                Categorías
              </Button>
            </div>
          </header>

          <AnimatePresence initial={false}>
            {categoriesOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <CategoryManager
                    categories={categories}
                    affectedByCategory={tasksCtx.affectedByCategory}
                    onCreate={handleCreateCategory}
                    onUpdate={handleUpdateCategory}
                    onDelete={handleDeleteCategory}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <TaskList
            tasks={filteredTasks}
            categories={categories}
            onEdit={openEditTask}
            onDelete={setToDeleteTask}
            onTrackTime={setTrackingTask}
            onToggleStatus={handleToggleStatus}
            onReorder={tasksCtx.reorder}
            onCreate={openCreateTask}
          />
        </section>
      </main>

      <TaskFormModal
        key={editingTask?.id ?? "new-task"}
        open={taskModalOpen}
        task={editingTask}
        categories={categories}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleTaskSubmit}
      />

      <TimeTrackingModal
        key={trackingTask?.id ?? "no-task"}
        open={trackingTask !== null}
        task={trackingTask}
        onClose={() => setTrackingTask(null)}
        onSubmit={handleRegisterTime}
      />

      <ConfirmDialog
        open={toDeleteTask !== null}
        title="Eliminar tarea"
        description={
          toDeleteTask
            ? `Vas a eliminar "${toDeleteTask.name}". Esta acción no se puede deshacer.`
            : undefined
        }
        confirmLabel="Eliminar"
        variant="danger"
        onCancel={() => setToDeleteTask(null)}
        onConfirm={handleDeleteTask}
      />
    </div>
  );
}