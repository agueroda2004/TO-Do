import { useCallback, useEffect, useReducer } from "react";
import type { Category } from "../types/category";
import { STORAGE_KEYS, localStorageService } from "../services/localStorageService";

type State = { categories: Category[] };

type Action =
  | { type: "HYDRATE"; categories: Category[] }
  | { type: "ADD"; category: Category }
  | { type: "UPDATE"; id: string; name: string }
  | { type: "DELETE"; id: string }
  | { type: "REPLACE_ALL"; categories: Category[] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return { categories: action.categories };
    case "ADD":
      return { categories: [...state.categories, action.category] };
    case "UPDATE":
      return {
        categories: state.categories.map((c) =>
          c.id === action.id ? { ...c, name: action.name } : c,
        ),
      };
    case "DELETE":
      return {
        categories: state.categories.filter((c) => c.id !== action.id),
      };
    case "REPLACE_ALL":
      return { categories: action.categories };
    default:
      return state;
  }
}

export interface CategoriesApi {
  categories: Category[];
  addCategory: (name: string) => Category;
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
  replaceAll: (categories: Category[]) => void;
  existsByName: (name: string, ignoreId?: string) => boolean;
}

function generateId(): string {
  return `cat_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function useCategoryStore(): CategoriesApi {
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const categories = localStorageService.get<Category[]>(
      STORAGE_KEYS.categories,
      [],
    );
    return { categories };
  });

  useEffect(() => {
    localStorageService.set(STORAGE_KEYS.categories, state.categories);
  }, [state.categories]);

  const addCategory = useCallback((name: string) => {
    const trimmed = name.trim();
    const category: Category = { id: generateId(), name: trimmed };
    dispatch({ type: "ADD", category });
    return category;
  }, []);

  const updateCategory = useCallback((id: string, name: string) => {
    dispatch({ type: "UPDATE", id, name: name.trim() });
  }, []);

  const deleteCategory = useCallback((id: string) => {
    dispatch({ type: "DELETE", id });
  }, []);

  const replaceAll = useCallback((categories: Category[]) => {
    dispatch({ type: "REPLACE_ALL", categories });
  }, []);

  const existsByName = useCallback(
    (name: string, ignoreId?: string) => {
      const normalized = name.trim().toLowerCase();
      return state.categories.some(
        (c) => c.name.toLowerCase() === normalized && c.id !== ignoreId,
      );
    },
    [state.categories],
  );

  return {
    categories: state.categories,
    addCategory,
    updateCategory,
    deleteCategory,
    replaceAll,
    existsByName,
  };
}