import { useState } from "react";
import { Calendar, CalendarPlus, Clock, Flag, Inbox, Tag } from "lucide-react";
import type { Category } from "../../types/category";
import type { Period, Task } from "../../types/task";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { CustomDropdown } from "../ui/CustomDropdown";
import { cn } from "../../utils/cn";
import { todayIso } from "../../utils/date";
import {
  PERIODS,
  PERIOD_LABELS,
  PRIORITIES,
  PRIORITY_ACTIVE_STYLES,
  PRIORITY_DOT_STYLES,
  PRIORITY_LABELS,
  hasErrors,
  validateTaskForm,
  type TaskFormErrors,
  type TaskFormValues,
} from "../../utils/validation";

interface TaskFormModalProps {
  open: boolean;
  task?: Task | null;
  categories: Category[];
  defaultInbox?: boolean;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => void;
}

const initialScheduled: TaskFormValues = {
  name: "",
  categoryId: null,
  period: "morning",
  targetMinutes: 30,
  scheduledFor: todayIso(),
  priority: "medium",
};

const initialInbox: TaskFormValues = {
  name: "",
  categoryId: null,
  period: null,
  targetMinutes: 0,
  scheduledFor: null,
  priority: "medium",
};

function fromTask(task: Task): TaskFormValues {
  return {
    name: task.name,
    categoryId: task.categoryId,
    period: task.period,
    targetMinutes: task.targetMinutes,
    scheduledFor: task.scheduledFor,
    priority: task.priority,
  };
}

export function TaskFormModal({
  open,
  task,
  categories,
  defaultInbox = false,
  onClose,
  onSubmit,
}: TaskFormModalProps) {
  const [values, setValues] = useState<TaskFormValues>(() =>
    task
      ? fromTask(task)
      : defaultInbox
        ? initialInbox
        : initialScheduled,
  );
  const [errors, setErrors] = useState<TaskFormErrors>({});

  const isInbox = values.scheduledFor === null;

  function update<K extends keyof TaskFormValues>(
    key: K,
    value: TaskFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function setMode(inbox: boolean) {
    if (inbox) {
      setValues((prev) => ({
        ...prev,
        scheduledFor: null,
        period: null,
        targetMinutes: 0,
      }));
    } else {
      setValues((prev) => ({
        ...prev,
        scheduledFor: prev.scheduledFor ?? todayIso(),
        period: prev.period ?? "morning",
        targetMinutes: prev.targetMinutes > 0 ? prev.targetMinutes : 30,
      }));
    }
    setErrors({});
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateTaskForm(values);
    setErrors(errs);
    if (hasErrors(errs)) return;
    onSubmit(values);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={task ? "Editar tarea" : "Nueva tarea"}
      description={
        task
          ? "Modifica los detalles de la tarea."
          : "Define los detalles para empezar a trabajar en ella."
      }
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button type="submit" form="task-form">
            {task ? "Guardar cambios" : isInbox ? "Guardar en bandeja" : "Crear tarea"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div
          role="tablist"
          aria-label="Tipo de tarea"
          className="inline-flex w-full rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800/50"
        >
          <button
            type="button"
            role="tab"
            aria-selected={!isInbox}
            onClick={() => isInbox && setMode(false)}
            disabled={Boolean(task)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              !isInbox
                ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-900 dark:text-indigo-300"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
              task && "cursor-not-allowed opacity-60",
            )}
          >
            <CalendarPlus className="h-4 w-4" />
            Programada
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isInbox}
            onClick={() => !isInbox && setMode(true)}
            disabled={Boolean(task)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isInbox
                ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-900 dark:text-indigo-300"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
              task && "cursor-not-allowed opacity-60",
            )}
          >
            <Inbox className="h-4 w-4" />
            Bandeja de entrada
          </button>
        </div>

        <form
          id="task-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          noValidate
        >
          <Input
            label="Nombre"
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder={
              isInbox
                ? "Ej: Comprar leche en el súper"
                : "Ej: Redactar informe semanal"
            }
            error={errors.name}
            autoFocus
            maxLength={80}
            required
          />

          {!isInbox && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Fecha"
                type="date"
                value={values.scheduledFor ?? todayIso()}
                min={todayIso()}
                onChange={(e) => update("scheduledFor", e.target.value)}
                leftIcon={<Calendar className="h-4 w-4" />}
                required
              />
              <CustomDropdown
                label="Momento del día"
                value={values.period ?? "morning"}
                onChange={(v) => update("period", v as Period)}
                options={PERIODS.map((p) => ({
                  value: p,
                  label: PERIOD_LABELS[p],
                }))}
                leftIcon={<Clock className="h-4 w-4" />}
              />
            </div>
          )}

          <CustomDropdown
            label="Categoría"
            value={values.categoryId ?? ""}
            onChange={(v) => update("categoryId", v === "" ? null : v)}
            options={[
              { value: "", label: "Sin categoría" },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
            leftIcon={<Tag className="h-4 w-4" />}
          />

          {!isInbox && (
            <Input
              label="Duración objetivo (minutos)"
              type="number"
              inputMode="numeric"
              min={1}
              max={1440}
              step={1}
              value={values.targetMinutes}
              onChange={(e) =>
                update(
                  "targetMinutes",
                  e.target.value === "" ? 0 : Number(e.target.value),
                )
              }
              error={errors.targetMinutes}
              hint="Entre 1 y 1440 minutos."
              required
            />
          )}

          {isInbox && (
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
              Las tareas de la bandeja de entrada se guardan sin fecha ni
              duración. Podrás programarlas para un día concreto cuando
              decidas cuándo hacerlas.
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
              <Flag className="h-3.5 w-3.5" />
              Prioridad
            </label>
            <div
              role="radiogroup"
              aria-label="Prioridad"
              className="grid grid-cols-3 gap-2"
            >
              {PRIORITIES.map((p) => {
                const isActive = values.priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => update("priority", p)}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300",
                      isActive
                        ? PRIORITY_ACTIVE_STYLES[p]
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800",
                    )}
                  >
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        PRIORITY_DOT_STYLES[p],
                      )}
                    />
                    {PRIORITY_LABELS[p]}
                  </button>
                );
              })}
            </div>
            {errors.priority && (
              <p className="text-xs text-rose-600 dark:text-rose-400">
                {errors.priority}
              </p>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
}