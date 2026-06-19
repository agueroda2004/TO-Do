import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Tag, Trash2 } from "lucide-react";
import type { Category } from "../../types/category";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { CategoryModal } from "./CategoryModal";
import { ConfirmDialog } from "../ui/ConfirmDialog";

interface CategoryManagerProps {
  categories: Category[];
  affectedByCategory: (categoryId: string) => number;
  onCreate: (name: string) => void;
  onUpdate: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export function CategoryManager({
  categories,
  affectedByCategory,
  onCreate,
  onUpdate,
  onDelete,
}: CategoryManagerProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [toDelete, setToDelete] = useState<Category | null>(null);

  function handleSubmit(name: string) {
    if (editing) {
      onUpdate(editing.id, name);
    } else {
      onCreate(name);
    }
    setOpen(false);
    setEditing(null);
  }

  function handleDelete() {
    if (!toDelete) return;
    onDelete(toDelete.id);
    setToDelete(null);
  }

  const affected = toDelete ? affectedByCategory(toDelete.id) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
            Categorías
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Agrupa tus tareas con etiquetas personalizadas.
          </p>
        </div>
        <Button
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          Nueva categoría
        </Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={<Tag className="h-5 w-5" />}
          title="Sin categorías"
          description="Crea categorías para clasificar tus tareas fácilmente."
          action={
            <Button
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              Crear primera categoría
            </Button>
          }
        />
      ) : (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {categories.map((c) => {
              const count = affectedByCategory(c.id);
              return (
                <motion.li
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                      <Tag className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                        {c.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {count} tarea{count === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditing(c);
                        setOpen(true);
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setToDelete(c)}
                      aria-label={`Eliminar categoría ${c.name}`}
                      className="text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
                      leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                    >
                      Eliminar
                    </Button>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      <CategoryModal
        key={editing?.id ?? "new-category"}
        open={open}
        category={editing}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title={`Eliminar "${toDelete?.name ?? ""}"`}
        description={
          affected > 0
            ? `${affected} tarea${affected === 1 ? "" : "s"} ${affected === 1 ? "quedará" : "quedarán"} sin categoría. Esta acción no se puede deshacer.`
            : "Esta categoría no está asignada a ninguna tarea."
        }
        confirmLabel="Eliminar"
        variant="danger"
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}