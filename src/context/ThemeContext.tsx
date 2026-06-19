import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { STORAGE_KEYS, localStorageService } from "../services/localStorageService";

export type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function readInitialTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const stored = localStorageService.get<ThemeMode>(STORAGE_KEYS.theme, "light");
  if (stored === "light" || stored === "dark") return stored;
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = readInitialTheme();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorageService.set(STORAGE_KEYS.theme, theme);
  }, [theme]);

  const setTheme = useCallback((next: ThemeMode) => {
    const root = document.documentElement;
    root.classList.toggle("dark", next === "dark");
    localStorageService.set(STORAGE_KEYS.theme, next);
    window.dispatchEvent(new CustomEvent<ThemeMode>("dtp:theme", { detail: next }));
  }, []);

  const toggleTheme = useCallback(() => {
    const root = document.documentElement;
    const next: ThemeMode = root.classList.contains("dark") ? "light" : "dark";
    setTheme(next);
  }, [setTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de ThemeProvider");
  return ctx;
}