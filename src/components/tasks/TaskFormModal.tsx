import { useState } from "react";
import { Clock, Tag } from "lucide-react";
import type { Category } from "../../types/category";
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

interface TaskFormModalProps {
  open: boolean;
  task?: Task | null;
  categories: Category[];
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => void;
}

const initialValues: TaskFormValues = {
  name: "",
  categoryId: null,
  period: "morning",
  targetMinutes: 30,
};

function fromTask(task: Task): TaskFormValues {
  return {
    name: task.name,
    categoryId: task.categoryId,
    period: task.period,
    targetMinutes: task.targetMinutes,
  };
}

export function TaskFormModal({
  open,
  task,
  categories,
  onClose,
  onSubmit,
}: TaskFormModalProps) {
  const [values, setValues] = useState<TaskFormValues>(() =>
    task ? fromTask(task) : initialValues,
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
            {task ? "Guardar cambios" : "Crear tarea"}
          </Button>
        </>
      }
    >
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
          placeholder="Ej: Redactar informe semanal"
          error={errors.name}
          autoFocus
          maxLength={80}
          required
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CustomDropdown
            label="Momento del día"
            value={values.period}
            onChange={(v) => update("period", v as Period)}
            options={PERIODS.map((p) => ({
              value: p,
              label: PERIOD_LABELS[p],
            }))}
            leftIcon={<Clock className="h-4 w-4" />}
          />
          <CustomDropdown
            label="Categoría"
            value={values.categoryId ?? ""}
            onChange={(v) =>
              update("categoryId", v === "" ? null : v)
            }
            options={[
              { value: "", label: "Sin categoría" },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
            leftIcon={<Tag className="h-4 w-4" />}
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
          hint="Entre 1 y 1440 minutos."
          required
        />
      </form>
    </Modal>
  );
}