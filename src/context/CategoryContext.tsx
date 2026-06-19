import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { useCategoryStore, type CategoriesApi } from "../hooks/useCategoryStore";

const CategoryContext = createContext<CategoriesApi | undefined>(undefined);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const store = useCategoryStore();
  const value = useMemo(() => store, [store]);
  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCategories(): CategoriesApi {
  const ctx = useContext(CategoryContext);
  if (!ctx) throw new Error("useCategories debe usarse dentro de CategoryProvider");
  return ctx;
}