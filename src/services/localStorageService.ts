export const STORAGE_KEYS = {
  tasks: "dtp.v1.tasks",
  categories: "dtp.v1.categories",
  theme: "dtp.v1.theme",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export const localStorageService = {
  get<T>(key: StorageKey, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(`[localStorageService] failed to read ${key}`, err);
      return fallback;
    }
  },

  set<T>(key: StorageKey, value: T): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`[localStorageService] failed to write ${key}`, err);
    }
  },

  remove(key: StorageKey): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch (err) {
      console.warn(`[localStorageService] failed to remove ${key}`, err);
    }
  },
};