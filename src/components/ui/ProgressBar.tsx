import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
  size?: "sm" | "md";
  tone?: "brand" | "success";
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  className,
  size = "md",
  tone = "brand",
}: ProgressBarProps) {
  const safeMax = Math.max(max, 1);
  const percentage = Math.min(Math.max((value / safeMax) * 100, 0), 100);

  const fill =
    tone === "success"
      ? "bg-emerald-500 dark:bg-emerald-400"
      : "bg-indigo-500 dark:bg-indigo-400";

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs">
          {label && (
            <span className="font-medium text-slate-600 dark:text-slate-300">
              {label}
            </span>
          )}
          {showValue && (
            <span className="tabular-nums text-slate-500 dark:text-slate-400">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn(
          "w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-700/70",
          size === "sm" ? "h-1.5" : "h-2",
        )}
      >
        <motion.div
          className={cn("h-full rounded-full", fill)}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        />
      </div>
    </div>
  );
}