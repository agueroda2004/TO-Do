import { useState } from "react";
import { Tag } from "lucide-react";
import type { Category } from "../../types/category";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import {
  hasErrors,
  validateCategoryForm,
  type CategoryFormErrors,
} from "../../utils/validation";

interface CategoryModalProps {
  open: boolean;
  category?: Category | null;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export function CategoryModal({
  open,
  category,
  onClose,
  onSubmit,
}: CategoryModalProps) {
  const [name, setName] = useState(() => category?.name ?? "");
  const [errors, setErrors] = useState<CategoryFormErrors>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateCategoryForm(name);
    setErrors(errs);
    if (hasErrors(errs)) return;
    onSubmit(name);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={category ? "Editar categoría" : "Nueva categoría"}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button type="submit" form="category-form" leftIcon={<Tag className="h-4 w-4" />}>
            {category ? "Guardar" : "Crear"}
          </Button>
        </>
      }
    >
      <form id="category-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Trabajo, Estudio, Personal…"
          error={errors.name}
          autoFocus
          maxLength={30}
          required
        />
      </form>
    </Modal>
  );
}