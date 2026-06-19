import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "outline";
}

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default"
          ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
          : "border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300",
        className,
      )}
    >
      {children}
    </span>
  );
}