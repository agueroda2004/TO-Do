import { useState } from "react";
import { Timer } from "lucide-react";
import type { Task } from "../../types/task";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import {
  hasErrors,
  validateTimeTracking,
  type TimeTrackingErrors,
} from "../../utils/validation";
import { minutesToHours } from "../../utils/time";

interface TimeTrackingModalProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onSubmit: (minutes: number) => void;
}

const QUICK_VALUES = [5, 15, 25, 45, 60];

export function TimeTrackingModal({
  open,
  task,
  onClose,
  onSubmit,
}: TimeTrackingModalProps) {
  const [minutes, setMinutes] = useState<number>(15);
  const [errors, setErrors] = useState<TimeTrackingErrors>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateTimeTracking(minutes);
    setErrors(errs);
    if (hasErrors(errs)) return;
    onSubmit(minutes);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar tiempo"
      description={
        task
          ? `Acumula minutos trabajados en "${task.name}". Al alcanzar la meta, la tarea se marcará como terminada automáticamente.`
          : "Suma minutos trabajados a la tarea seleccionada."
      }
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button type="submit" form="time-form" leftIcon={<Timer className="h-4 w-4" />}>
            Registrar
          </Button>
        </>
      }
    >
      <form id="time-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        {task && (
          <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
            <span className="font-medium">Progreso actual:</span>{" "}
            {task.workedMinutes} / {task.targetMinutes} min
            {task.targetMinutes > 0 &&
              ` (${Math.round((task.workedMinutes / task.targetMinutes) * 100)}%)`}
          </div>
        )}

        <Input
          label="Minutos trabajados"
          type="number"
          inputMode="numeric"
          min={1}
          max={1440}
          value={minutes}
          onChange={(e) =>
            setMinutes(e.target.value === "" ? 0 : Number(e.target.value))
          }
          error={errors.minutes}
          required
        />

        <div className="flex flex-wrap gap-2">
          {QUICK_VALUES.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setMinutes(v)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                minutes === v
                  ? "border-indigo-500 bg-indigo-500 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {minutesToHours(v)}
            </button>
          ))}
        </div>
      </form>
    </Modal>
  );
}