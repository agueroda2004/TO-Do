import { Search, X } from "lucide-react";
import type { Category } from "../../types/category";
import type { Period, TaskStatus } from "../../types/task";
import {
  PERIODS,
  PERIOD_LABELS,
  STATUS_LABELS,
  TASK_STATUSES,
} from "../../utils/validation";
import type { TaskFilter } from "../../hooks/useTasks";
import { Input } from "../ui/Input";
import { CustomDropdown } from "../ui/CustomDropdown";
import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";

interface FilterBarProps {
  filter: TaskFilter;
  categories: Category[];
  onChange: (filter: Partial<TaskFilter>) => void;
  onReset: () => void;
  resultsCount: number;
}

export function FilterBar({
  filter,
  categories,
  onChange,
  onReset,
  resultsCount,
}: FilterBarProps) {
  const active =
    filter.search.trim().length > 0 ||
    filter.categoryId !== null ||
    filter.status !== null ||
    filter.period !== null ||
    filter.hideCompleted;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
        "dark:border-slate-800 dark:bg-slate-900",
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1">
          <Input
            label="Buscar"
            value={filter.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="Buscar por nombre…"
            leftIcon={<Search className="h-4 w-4" />}
            rightAdornment={
              filter.search ? (
                <button
                  type="button"
                  onClick={() => onChange({ search: "" })}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null
            }
          />
        </div>
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
          <CustomDropdown
            label="Categoría"
            value={filter.categoryId ?? ""}
            onChange={(v) =>
              onChange({ categoryId: v === "" ? null : v })
            }
            options={[
              { value: "", label: "Todas" },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
          <CustomDropdown
            label="Estado"
            value={filter.status ?? ""}
            onChange={(v) =>
              onChange({ status: v === "" ? null : (v as TaskStatus) })
            }
            options={[
              { value: "", label: "Todos" },
              ...TASK_STATUSES.map((s) => ({
                value: s,
                label: STATUS_LABELS[s],
              })),
            ]}
          />
          <CustomDropdown
            label="Periodo"
            value={filter.period ?? ""}
            onChange={(v) =>
              onChange({ period: v === "" ? null : (v as Period) })
            }
            options={[
              { value: "", label: "Todos" },
              ...PERIODS.map((p) => ({ value: p, label: PERIOD_LABELS[p] })),
            ]}
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>
          {resultsCount} resultado{resultsCount === 1 ? "" : "s"}
        </span>
        {active && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            leftIcon={<X className="h-3.5 w-3.5" />}
          >
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  );
}