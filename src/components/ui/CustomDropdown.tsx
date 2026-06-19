import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";

export interface DropdownOption {
  value: string;
  label: string;
}

export interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  leftIcon?: ReactNode;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
  id?: string;
  emptyMessage?: string;
}

export function CustomDropdown({
  options,
  value,
  onChange,
  label,
  error,
  hint,
  placeholder = "Seleccionar…",
  leftIcon,
  disabled = false,
  className,
  size = "md",
  id,
  emptyMessage = "Sin opciones",
}: CustomDropdownProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevOpen, setPrevOpen] = useState(open);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const reactId = useId();
  const fieldId = id ?? reactId;
  const listboxId = `${fieldId}-listbox`;

  const selectedOption = options.find((o) => o.value === value);
  const isPlaceholder = !selectedOption;
  const displayLabel = selectedOption?.label ?? placeholder;

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      const idx = options.findIndex((o) => o.value === value);
      setActiveIndex(idx >= 0 ? idx : 0);
    }
  }

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  function handleTriggerKeyDown(e: ReactKeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  }

  function handlePanelKeyDown(e: ReactKeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < 0 ? 0 : Math.min(prev + 1, options.length - 1),
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < 0 ? options.length - 1 : Math.max(prev - 1, 0),
      );
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(options.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const opt = options[activeIndex];
      if (opt) {
        onChange(opt.value);
        setOpen(false);
        triggerRef.current?.focus();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  }

  function selectOption(opt: DropdownOption) {
    onChange(opt.value);
    setOpen(false);
    setTimeout(() => triggerRef.current?.focus(), 0);
  }

  const heightClass = size === "sm" ? "h-9" : "h-10";

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label
          htmlFor={fieldId}
          className="text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <button
          ref={triggerRef}
          id={fieldId}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-invalid={error ? true : undefined}
          aria-label={isPlaceholder ? placeholder : undefined}
          disabled={disabled}
          onClick={() => !disabled && setOpen((v) => !v)}
          onKeyDown={handleTriggerKeyDown}
          className={cn(
            "relative flex w-full items-center rounded-lg border bg-white pr-9 text-sm transition-colors",
            heightClass,
            leftIcon ? "pl-10" : "pl-3",
            "border-slate-200 hover:border-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100",
            "dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 dark:focus:border-indigo-500 dark:focus:ring-indigo-900",
            error &&
              "border-rose-400 hover:border-rose-500 focus:border-rose-500 focus:ring-rose-100 dark:border-rose-500 dark:focus:border-rose-400",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          {leftIcon && (
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              {leftIcon}
            </span>
          )}
          <span
            className={cn(
              "block truncate text-left",
              isPlaceholder
                ? "text-slate-400 dark:text-slate-500"
                : "text-slate-900 dark:text-slate-100",
            )}
          >
            {displayLabel}
          </span>
          <ChevronDown
            className={cn(
              "pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-transform duration-150",
              open && "rotate-180",
            )}
          />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              ref={panelRef}
              role="listbox"
              id={listboxId}
              tabIndex={-1}
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              onKeyDown={handlePanelKeyDown}
              className={cn(
                "absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg outline-none",
                "dark:border-slate-700 dark:bg-slate-900",
                "scrollbar-thin",
              )}
            >
              {options.length === 0 ? (
                <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                  {emptyMessage}
                </div>
              ) : (
                options.map((opt, idx) => {
                  const isSelected = opt.value === value;
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={opt.value === "" ? "__empty__" : opt.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => selectOption(opt)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 px-3 py-2 text-sm text-left transition-colors",
                        "focus:outline-none",
                        isActive && !isSelected &&
                          "bg-slate-100 dark:bg-slate-800/80",
                        isActive &&
                          isSelected &&
                          "bg-indigo-100 dark:bg-indigo-500/20",
                        !isActive &&
                          isSelected &&
                          "bg-indigo-50 dark:bg-indigo-500/10",
                        !isActive &&
                          !isSelected &&
                          "hover:bg-slate-50 dark:hover:bg-slate-800/60",
                        isSelected
                          ? "font-medium text-indigo-700 dark:text-indigo-200"
                          : "text-slate-700 dark:text-slate-200",
                      )}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && (
                        <Check className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-300" />
                      )}
                    </button>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error ? (
        <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}