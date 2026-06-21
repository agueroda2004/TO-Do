import { useState } from "react";
import { Calendar, CalendarPlus, Clock } from "lucide-react";
import type { Period, Task } from "../../types/task";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { CustomDropdown } from "../ui/CustomDropdown";
import {
  PERIODS,
  PERIOD_LABELS,
  hasErrors,
  validateTaskForm,
  type TaskFormErrors,
  type TaskFormValues,
} from "../../utils/validation";
import { formatScheduledForLong, todayIso } from "../../utils/date";

interface ScheduleTaskModalProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => void;
}

function fromTask(task: Task): TaskFormValues {
  return {
    name: task.name,
    categoryId: task.categoryId,
    period: task.period ?? "morning",
    targetMinutes: task.targetMinutes > 0 ? task.targetMinutes : 30,
    scheduledFor: task.scheduledFor ?? todayIso(),
    priority: task.priority,
  };
}

export function ScheduleTaskModal({
  open,
  task,
  onClose,
  onSubmit,
}: ScheduleTaskModalProps) {
  const [values, setValues] = useState<TaskFormValues>(() =>
    task
      ? fromTask(task)
      : {
          name: "",
          categoryId: null,
          period: "morning",
          targetMinutes: 30,
          scheduledFor: todayIso(),
          priority: "medium",
        },
  );
  const [errors, setErrors] = useState<TaskFormErrors>({});

  function update<K extends keyof TaskFormValues>(
    key: K,
    value: TaskFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
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
      title="Programar tarea"
      description={
        task
          ? `Define cuándo trabajar en "${task.name}".`
          : "Define cuándo quieres hacer esta tarea."
      }
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button
            type="submit"
            form="schedule-form"
            leftIcon={<CalendarPlus className="h-4 w-4" />}
          >
            Programar
          </Button>
        </>
      }
    >
      <form
        id="schedule-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        noValidate
      >
        {task && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
            <span className="font-medium">{task.name}</span>
            {task.categoryId && (
              <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                · categoría actual
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Fecha"
            type="date"
            value={values.scheduledFor ?? todayIso()}
            min={todayIso()}
            onChange={(e) => update("scheduledFor", e.target.value)}
            leftIcon={<Calendar className="h-4 w-4" />}
            error={errors.scheduledFor}
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
            error={errors.period}
          />
        </div>

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
          hint={
            values.scheduledFor
              ? `Programada para ${formatScheduledForLong(values.scheduledFor)}`
              : "Entre 1 y 1440 minutos."
          }
          required
        />
      </form>
    </Modal>
  );
}