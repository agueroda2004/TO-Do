import { useRef } from "react";
import {
  CalendarCheck,
  Download,
  ListTodo,
  Tags,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/Button";
import { ThemeToggle } from "./ThemeToggle";
import {
  downloadJSON,
  exportToJSON,
  importFromJSON,
} from "../../utils/exportImport";
import type { Category } from "../../types/category";
import type { Task } from "../../types/task";

interface HeaderProps {
  onCreateTask: () => void;
  onToggleCategories: () => void;
  tasks: Task[];
  categories: Category[];
  onImport: (tasks: Task[], categories: Category[]) => void;
}

export function Header({
  onCreateTask,
  onToggleCategories,
  tasks,
  categories,
  onImport,
}: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const json = exportToJSON(tasks, categories);
    const filename = `daily-task-planner-${new Date().toISOString().slice(0, 10)}.json`;
    downloadJSON(json, filename);
    toast.success("Datos exportados", { description: filename });
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const result = importFromJSON(text);
      if (!result.ok || !result.tasks || !result.categories) {
        toast.error("No se pudo importar", { description: result.error });
        return;
      }
      onImport(result.tasks, result.categories);
      toast.success("Datos importados", {
        description: `${result.tasks.length} tareas · ${result.categories.length} categorías`,
      });
    } catch (err) {
      toast.error("Error al leer el archivo", {
        description: err instanceof Error ? err.message : "Desconocido",
      });
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30">
            <CalendarCheck className="h-5 w-5" />
          </span>
          <div className="hidden sm:block">
            <h1 className="text-base font-semibold leading-tight text-slate-900 dark:text-slate-50">
              Daily Task Planner
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Organiza tu día, registra tu tiempo, mide tu progreso.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleCategories}
            leftIcon={<Tags className="h-4 w-4" />}
            className="hidden sm:inline-flex"
          >
            Categorías
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFile}
            className="hidden"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleImportClick}
            aria-label="Importar datos"
            leftIcon={<Upload className="h-4 w-4" />}
          >
            <span className="hidden sm:inline">Importar</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            aria-label="Exportar datos"
            leftIcon={<Download className="h-4 w-4" />}
          >
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <ThemeToggle />
          <Button
            onClick={onCreateTask}
            size="sm"
            leftIcon={<ListTodo className="h-4 w-4" />}
          >
            Nueva tarea
          </Button>
        </div>
      </div>
    </header>
  );
}