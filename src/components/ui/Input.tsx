import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightAdornment?: ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    hint,
    leftIcon,
    rightAdornment,
    containerClassName,
    id,
    className,
    ...rest
  },
  ref,
) {
  const reactId = useId();
  const fieldId = id ?? reactId;
  const describedBy = error
    ? `${fieldId}-error`
    : hint
      ? `${fieldId}-hint`
      : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", containerClassName)}>
      {label && (
        <label
          htmlFor={fieldId}
          className="text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors",
            "border-slate-200 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100",
            "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-900",
            leftIcon && "pl-10",
            rightAdornment && "pr-12",
            error &&
              "border-rose-400 focus:border-rose-500 focus:ring-rose-100 dark:border-rose-500 dark:focus:ring-rose-900",
            className,
          )}
          {...rest}
        />
        {rightAdornment && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
            {rightAdornment}
          </span>
        )}
      </div>
      {error ? (
        <p id={`${fieldId}-error`} className="text-xs text-rose-600 dark:text-rose-400">
          {error}
        </p>
      ) : hint ? (
        <p id={`${fieldId}-hint`} className="text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
});