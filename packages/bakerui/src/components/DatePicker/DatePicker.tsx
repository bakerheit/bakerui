import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { Portal } from "../../utils/portal";
import { useClickOutside } from "../../utils/useClickOutside";
import { useEscape } from "../../utils/useEscape";
import { usePosition } from "../../utils/usePosition";
import { cx } from "../../utils/cx";
import "./DatePicker.css";

/* === Date utilities (no deps) ============================================ */

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** Build a 6×7 grid of dates anchored to the supplied year/month, padded
 *  with prev/next month days so the leading row starts on weekStartsOn. */
function getMonthGrid(
  year: number,
  month: number,
  weekStartsOn: number,
): Date[] {
  const firstOfMonth = new Date(year, month, 1);
  const dayOfWeek = firstOfMonth.getDay();
  const offset = (dayOfWeek - weekStartsOn + 7) % 7;
  const start = new Date(year, month, 1 - offset);
  const grid: Date[] = [];
  for (let i = 0; i < 42; i++) {
    grid.push(addDays(start, i));
  }
  return grid;
}

function clampDate(d: Date, min?: Date, max?: Date): Date {
  if (min && d < min) return min;
  if (max && d > max) return max;
  return d;
}

/* === Component =========================================================== */

export type DatePickerSize = "sm" | "md" | "lg";

export interface DatePickerProps {
  /** Current date (controlled). Pass `null` for "no selection". */
  value?: Date | null;
  /** Initial date for uncontrolled mode. */
  defaultValue?: Date | null;
  /** Fires when the user picks a date. */
  onValueChange?: (value: Date | null) => void;
  /** Placeholder shown when no date is selected. */
  placeholder?: string;
  /** Format used to render the selected date in the trigger.
   *  Either a function or `Intl.DateTimeFormatOptions`. Default: medium-style. */
  format?: ((date: Date) => string) | Intl.DateTimeFormatOptions;
  /** Locale passed to Intl.DateTimeFormat. */
  locale?: string;
  /** Day of week the calendar grid starts on (0 = Sunday, 1 = Monday, …). */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Earliest selectable date. Days before are disabled. */
  minDate?: Date;
  /** Latest selectable date. Days after are disabled. */
  maxDate?: Date;
  /** Custom predicate for disabling individual dates. */
  disabledDate?: (date: Date) => boolean;
  /** Disable the entire control. */
  disabled?: boolean;
  /** Apply error styling and set aria-invalid. */
  invalid?: boolean;
  /** Visual size of the trigger field. */
  inputSize?: DatePickerSize;
  /** Allow clearing the selection via an X button. */
  clearable?: boolean;
  /** Override the popover placement. */
  placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
  id?: string;
  name?: string;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
}

const DEFAULT_FORMAT: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
};

export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(
  function DatePicker(
    {
      value: controlled,
      defaultValue = null,
      onValueChange,
      placeholder = "Pick a date",
      format,
      locale,
      weekStartsOn = 0,
      minDate,
      maxDate,
      disabledDate,
      disabled,
      invalid,
      inputSize = "md",
      clearable = false,
      placement = "bottom-start",
      id,
      name,
      className,
      ...ariaRest
    },
    ref,
  ) {
    const [internalValue, setInternalValue] = useState<Date | null>(defaultValue);
    const isControlled = controlled !== undefined;
    const value = isControlled ? (controlled ?? null) : internalValue;

    const [open, setOpen] = useState(false);
    const [viewMonth, setViewMonth] = useState<Date>(() =>
      startOfMonth(value ?? new Date()),
    );
    const [focusedDate, setFocusedDate] = useState<Date>(() =>
      startOfDay(value ?? new Date()),
    );

    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const popoverRef = useRef<HTMLDivElement | null>(null);

    // Sync the view to the selected value when it changes externally.
    useEffect(() => {
      if (value) {
        setViewMonth(startOfMonth(value));
        setFocusedDate(startOfDay(value));
      }
    }, [value?.getTime()]);

    // When opening, sync view + focused date to the current selection.
    useEffect(() => {
      if (open) {
        const seed = value ?? new Date();
        setViewMonth(startOfMonth(seed));
        setFocusedDate(startOfDay(seed));
      }
    }, [open]);

    const formatDate = useCallback(
      (d: Date) => {
        if (typeof format === "function") return format(d);
        return new Intl.DateTimeFormat(locale, format ?? DEFAULT_FORMAT).format(d);
      },
      [format, locale],
    );

    const setValue = useCallback(
      (next: Date | null) => {
        if (!isControlled) setInternalValue(next);
        onValueChange?.(next);
      },
      [isControlled, onValueChange],
    );

    const isDisabled = useCallback(
      (d: Date): boolean => {
        const day = startOfDay(d);
        if (minDate && day < startOfDay(minDate)) return true;
        if (maxDate && day > startOfDay(maxDate)) return true;
        if (disabledDate?.(day)) return true;
        return false;
      },
      [minDate, maxDate, disabledDate],
    );

    const position = usePosition({
      triggerRef,
      contentRef: popoverRef,
      open,
      placement,
      offset: 8,
    });

    useEscape(open, () => {
      setOpen(false);
      triggerRef.current?.focus();
    });
    useClickOutside(open, [triggerRef, popoverRef], () => setOpen(false));

    const handleSelect = (d: Date) => {
      if (isDisabled(d)) return;
      setValue(startOfDay(d));
      setOpen(false);
      triggerRef.current?.focus();
    };

    const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
      if (!open) return;
      let next: Date | null = null;
      switch (e.key) {
        case "ArrowLeft":
          next = addDays(focusedDate, -1);
          break;
        case "ArrowRight":
          next = addDays(focusedDate, 1);
          break;
        case "ArrowUp":
          next = addDays(focusedDate, -7);
          break;
        case "ArrowDown":
          next = addDays(focusedDate, 7);
          break;
        case "PageUp":
          next = addMonths(focusedDate, -1);
          // Try to keep the same day-of-month; clamp if the target month is shorter.
          next = new Date(
            next.getFullYear(),
            next.getMonth(),
            Math.min(focusedDate.getDate(), daysInMonth(next)),
          );
          break;
        case "PageDown":
          next = addMonths(focusedDate, 1);
          next = new Date(
            next.getFullYear(),
            next.getMonth(),
            Math.min(focusedDate.getDate(), daysInMonth(next)),
          );
          break;
        case "Home": {
          // First day of the displayed week.
          const dow = focusedDate.getDay();
          const offset = (dow - weekStartsOn + 7) % 7;
          next = addDays(focusedDate, -offset);
          break;
        }
        case "End": {
          const dow = focusedDate.getDay();
          const offset = (dow - weekStartsOn + 7) % 7;
          next = addDays(focusedDate, 6 - offset);
          break;
        }
        case "Enter":
        case " ":
          handleSelect(focusedDate);
          e.preventDefault();
          return;
        default:
          return;
      }
      e.preventDefault();
      const clamped = clampDate(next, minDate, maxDate);
      setFocusedDate(startOfDay(clamped));
      if (!isSameMonth(clamped, viewMonth)) {
        setViewMonth(startOfMonth(clamped));
      }
    };

    const today = startOfDay(new Date());
    const monthLabel = useMemo(
      () =>
        new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(
          viewMonth,
        ),
      [locale, viewMonth],
    );
    const weekdayNames = useMemo(
      () => getWeekdayNames(locale, weekStartsOn),
      [locale, weekStartsOn],
    );

    const grid = useMemo(
      () => getMonthGrid(viewMonth.getFullYear(), viewMonth.getMonth(), weekStartsOn),
      [viewMonth, weekStartsOn],
    );

    return (
      <>
        <button
          ref={(node) => {
            triggerRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
          }}
          type="button"
          id={id}
          name={name}
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-invalid={invalid || undefined}
          className={cx(
            "bui-datepicker__trigger",
            `bui-datepicker__trigger--${inputSize}`,
            invalid && "bui-datepicker__trigger--invalid",
            !value && "bui-datepicker__trigger--placeholder",
            className,
          )}
          onClick={() => !disabled && setOpen((o) => !o)}
          {...ariaRest}
        >
          <CalendarIcon />
          <span className="bui-datepicker__value">
            {value ? formatDate(value) : placeholder}
          </span>
          {clearable && value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear date"
              className="bui-datepicker__clear"
              onClick={(e) => {
                e.stopPropagation();
                setValue(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  setValue(null);
                }
              }}
            >
              <XIcon />
            </span>
          )}
          <ChevronIcon open={open} />
        </button>

        {open && (
          <Portal>
            <div
              ref={popoverRef}
              role="dialog"
              aria-label="Choose a date"
              className="bui-datepicker__popover"
              style={{ left: position?.x ?? 0, top: position?.y ?? 0 }}
              onKeyDown={handleKeyDown}
            >
              <div className="bui-datepicker__nav">
                <button
                  type="button"
                  className="bui-datepicker__navbtn"
                  aria-label="Previous month"
                  onClick={() => setViewMonth((m) => addMonths(m, -1))}
                >
                  <NavIcon dir="left" />
                </button>
                <div className="bui-datepicker__monthlabel" aria-live="polite">
                  {monthLabel}
                </div>
                <button
                  type="button"
                  className="bui-datepicker__navbtn"
                  aria-label="Next month"
                  onClick={() => setViewMonth((m) => addMonths(m, 1))}
                >
                  <NavIcon dir="right" />
                </button>
              </div>

              <div role="grid" className="bui-datepicker__grid">
                <div role="row" className="bui-datepicker__weekrow">
                  {weekdayNames.map((d, i) => (
                    <div key={i} role="columnheader" className="bui-datepicker__weekday">
                      {d}
                    </div>
                  ))}
                </div>
                {Array.from({ length: 6 }).map((_, weekIdx) => (
                  <div role="row" key={weekIdx} className="bui-datepicker__weekrow">
                    {grid.slice(weekIdx * 7, weekIdx * 7 + 7).map((d) => {
                      const inMonth = isSameMonth(d, viewMonth);
                      const selected = value ? isSameDay(d, value) : false;
                      const focused = isSameDay(d, focusedDate);
                      const today_ = isSameDay(d, today);
                      const dis = isDisabled(d);
                      return (
                        <button
                          key={d.toISOString()}
                          type="button"
                          role="gridcell"
                          aria-selected={selected}
                          aria-disabled={dis || undefined}
                          tabIndex={focused ? 0 : -1}
                          ref={(el) => {
                            if (focused && el && open) {
                              // Defer focus so the popover is mounted before we ask the cell to focus.
                              requestAnimationFrame(() => el.focus({ preventScroll: true }));
                            }
                          }}
                          disabled={dis}
                          onClick={() => handleSelect(d)}
                          className={cx(
                            "bui-datepicker__day",
                            !inMonth && "bui-datepicker__day--outside",
                            selected && "bui-datepicker__day--selected",
                            today_ && "bui-datepicker__day--today",
                          )}
                        >
                          {d.getDate()}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="bui-datepicker__footer">
                <button
                  type="button"
                  className="bui-datepicker__footerbtn"
                  onClick={() => {
                    const t = startOfDay(new Date());
                    if (!isDisabled(t)) handleSelect(t);
                  }}
                >
                  Today
                </button>
                {clearable && (
                  <button
                    type="button"
                    className="bui-datepicker__footerbtn"
                    onClick={() => {
                      setValue(null);
                      setOpen(false);
                      triggerRef.current?.focus();
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </Portal>
        )}
      </>
    );
  },
);

function daysInMonth(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

/** Localized weekday names (narrow), rotated so the array starts on weekStartsOn. */
function getWeekdayNames(locale: string | undefined, weekStartsOn: number): string[] {
  // Sunday = 2024-01-07
  const base = new Date(2024, 0, 7);
  const fmt = new Intl.DateTimeFormat(locale, { weekday: "narrow" });
  const all: string[] = [];
  for (let i = 0; i < 7; i++) all.push(fmt.format(addDays(base, i)));
  return all.slice(weekStartsOn).concat(all.slice(0, weekStartsOn));
}

function CalendarIcon() {
  return (
    <svg
      aria-hidden
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="10" height="9" rx="1.5" />
      <path d="M2 6h10M5 1.5v3M9 1.5v3" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      aria-hidden
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M3 3l6 6M9 3L3 9" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform var(--bui-duration-fast) var(--bui-easing-standard)",
      }}
    >
      <path d="M3 4.5L6 7.5 9 4.5" />
    </svg>
  );
}

function NavIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      aria-hidden
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: dir === "left" ? "rotate(180deg)" : undefined }}
    >
      <path d="M4 3l4 3-4 3" />
    </svg>
  );
}
