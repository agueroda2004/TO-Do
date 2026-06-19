import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  localStorageService,
  type StorageKey,
} from "../services/localStorageService";

export function useLocalStorage<T>(
  key: StorageKey,
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() =>
    localStorageService.get<T>(key, initialValue),
  );

  useEffect(() => {
    localStorageService.set<T>(key, value);
  }, [key, value]);

  return [value, setValue];
}