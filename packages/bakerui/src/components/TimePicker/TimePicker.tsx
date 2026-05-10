import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Portal } from "../../utils/portal";
import { useClickOutside } from "../../utils/useClickOutside";
import { useEscape } from "../../utils/useEscape";
import { usePosition } from "../../utils/usePosition";
import { cx } from "../../utils/cx";
import "./TimePicker.css";

/* === Helpers ============================================================= */

function parseTime(s: string | null | undefined): { h: number; m: number } | null {
  if (!s) return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return { h, m };
}

function fromHM(h: number, m: number): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function formatDisplay(value: string, mode: TimeFormat): string {
  const t = parseTime(value);
  if (!t) return value;
  if (mode === "24h") {
    return `${String(t.h).padStart(2, "0")}:${String(t.m).padStart(2, "0")}`;
  }
  const period = t.h >= 12 ? "PM" : "AM";
  const h12 = t.h % 12 === 0 ? 12 : t.h % 12;
  return `${h12}:${String(t.m).padStart(2, "0")} ${period}`;
}

/** Snap minute to the nearest multiple of `step` within [0, 59]. */
function snapMinute(m: number, step: number): number {
  if (step <= 1) return m;
  return Math.min(59, Math.round(m / step) * step);
}

/* === Constants =========================================================== */

const ITEM_HEIGHT = 36; // px — also referenced in CSS
const VISIBLE_ITEMS = 5; // odd number; selection sits in the middle row
const PAD_ITEMS = (VISIBLE_ITEMS - 1) / 2;
const PERIOD_ITEMS: readonly string[] = ["AM", "PM"];

/* === Component =========================================================== */

export type TimePickerSize = "sm" | "md" | "lg";
export type TimeFormat = "12h" | "24h";

export interface TimePickerProps {
  /** Current time in "HH:MM" 24-hour format (controlled). */
  value?: string | null;
  /** Initial time for uncontrolled mode. */
  defaultValue?: string | null;
  /** Fires when the user picks a time. */
  onValueChange?: (value: string | null) => void;
  /** Placeholder shown when no time is selected. */
  placeholder?: string;
  /** Display format. Internal value is always 24h. Defaults to "24h". */
  format?: TimeFormat;
  /** Minutes between options on the minute wheel. Defaults to 1 (iOS-like). */
  step?: number;
  /** Disable the entire control. */
  disabled?: boolean;
  /** Apply error styling and set aria-invalid. */
  invalid?: boolean;
  /** Visual size of the trigger field. */
  inputSize?: TimePickerSize;
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

export const TimePicker = forwardRef<HTMLButtonElement, TimePickerProps>(
  function TimePicker(
    {
      value: controlled,
      defaultValue = null,
      onValueChange,
      placeholder = "Pick a time",
      format = "24h",
      step = 1,
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
    const [internalValue, setInternalValue] = useState<string | null>(defaultValue);
    const isControlled = controlled !== undefined;
    const value = isControlled ? (controlled ?? null) : internalValue;

    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const popoverRef = useRef<HTMLDivElement | null>(null);

    // Wheel value state — mirrors `value` while open so each wheel can track
    // independently as the user scrolls. Committed on close or on selection.
    const [draft, setDraft] = useState<{ h: number; m: number; isPM: boolean }>(() =>
      seedDraft(value, format, step),
    );

    // Reseed draft whenever the popover opens or format/step changes.
    useEffect(() => {
      if (open) setDraft(seedDraft(value, format, step));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, format, step]);

    const setValue = useCallback(
      (next: string | null) => {
        if (!isControlled) setInternalValue(next);
        onValueChange?.(next);
      },
      [isControlled, onValueChange],
    );

    // Build wheel items.
    const hourItems = useMemo<number[]>(() => {
      if (format === "24h") return Array.from({ length: 24 }, (_, i) => i);
      // 12h: display 12, 1, 2, ..., 11 (12 represents both 0 and 12 of 24h).
      return [12, ...Array.from({ length: 11 }, (_, i) => i + 1)];
    }, [format]);

    const minuteItems = useMemo<number[]>(() => {
      const safeStep = Math.max(1, Math.min(60, step));
      const arr: number[] = [];
      for (let m = 0; m < 60; m += safeStep) arr.push(m);
      return arr;
    }, [step]);

    // PERIOD_ITEMS is module-level; reused as-is.

    // Convert draft → 24h hour for the canonical value.
    const draftTo24h = useCallback(
      (h: number, isPM: boolean): number => {
        if (format === "24h") return h;
        if (h === 12) return isPM ? 12 : 0;
        return isPM ? h + 12 : h;
      },
      [format],
    );

    // Apply draft → fire onChange. Called on each wheel snap.
    const commitDraft = useCallback(
      (next: { h: number; m: number; isPM: boolean }) => {
        const h24 = draftTo24h(next.h, next.isPM);
        setValue(fromHM(h24, next.m));
      },
      [draftTo24h, setValue],
    );

    const updateHour = (h: number) => {
      const next = { ...draft, h };
      setDraft(next);
      commitDraft(next);
    };
    const updateMinute = (m: number) => {
      const next = { ...draft, m };
      setDraft(next);
      commitDraft(next);
    };
    const updatePeriod = (isPM: boolean) => {
      const next = { ...draft, isPM };
      setDraft(next);
      commitDraft(next);
    };

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
            "bui-timepicker__trigger",
            `bui-timepicker__trigger--${inputSize}`,
            invalid && "bui-timepicker__trigger--invalid",
            !value && "bui-timepicker__trigger--placeholder",
            className,
          )}
          onClick={() => !disabled && setOpen((o) => !o)}
          {...ariaRest}
        >
          <ClockIcon />
          <span className="bui-timepicker__value">
            {value ? formatDisplay(value, format) : placeholder}
          </span>
          {clearable && value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear time"
              className="bui-timepicker__clear"
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
              aria-label="Choose a time"
              className="bui-timepicker__popover"
              style={{ left: position?.x ?? 0, top: position?.y ?? 0 }}
            >
              <div className="bui-timepicker__wheels">
                {/* Selection band — sits behind all wheels in the middle row */}
                <div className="bui-timepicker__band" aria-hidden />

                <Wheel
                  ariaLabel="Hour"
                  items={hourItems}
                  selected={draft.h}
                  format={(n) =>
                    format === "24h" ? String(n).padStart(2, "0") : String(n)
                  }
                  onSelect={updateHour}
                />

                <span className="bui-timepicker__sep" aria-hidden>
                  :
                </span>

                <Wheel
                  ariaLabel="Minute"
                  items={minuteItems}
                  selected={snapMinute(draft.m, step)}
                  format={(n) => String(n).padStart(2, "0")}
                  onSelect={updateMinute}
                />

                {format === "12h" && (
                  <Wheel
                    ariaLabel="AM or PM"
                    items={PERIOD_ITEMS as string[]}
                    selected={draft.isPM ? "PM" : "AM"}
                    format={(s) => String(s)}
                    onSelect={(p) => updatePeriod(p === "PM")}
                  />
                )}
              </div>

              {/* Top + bottom fade overlays so off-center items dissolve. */}
              <div className="bui-timepicker__fade bui-timepicker__fade--top" aria-hidden />
              <div
                className="bui-timepicker__fade bui-timepicker__fade--bottom"
                aria-hidden
              />
            </div>
          </Portal>
        )}
      </>
    );
  },
);

/* === Wheel sub-component ================================================ */

interface WheelProps<T extends number | string> {
  items: T[];
  selected: T;
  format: (item: T) => string;
  onSelect: (item: T) => void;
  ariaLabel: string;
}

function Wheel<T extends number | string>({
  items,
  selected,
  format,
  onSelect,
  ariaLabel,
}: WheelProps<T>) {
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const scrollTimeoutRef = useRef<number | null>(null);
  const programmaticScrollRef = useRef(false);

  // On mount or when `selected` changes from outside, scroll the wheel so the
  // selected item sits in the center band.
  useEffect(() => {
    const el = wheelRef.current;
    if (!el) return;
    const idx = items.indexOf(selected);
    if (idx < 0) return;
    programmaticScrollRef.current = true;
    el.scrollTop = idx * ITEM_HEIGHT;
    // Clear the flag after the scroll settles so user-driven scrolls are
    // detected normally on the next tick.
    requestAnimationFrame(() => {
      programmaticScrollRef.current = false;
    });
  }, [selected, items]);

  const handleScroll = () => {
    if (programmaticScrollRef.current) return;
    if (scrollTimeoutRef.current !== null) {
      window.clearTimeout(scrollTimeoutRef.current);
    }
    // Debounce — wait for scroll to settle before snapping.
    scrollTimeoutRef.current = window.setTimeout(() => {
      const el = wheelRef.current;
      if (!el) return;
      const idx = Math.round(el.scrollTop / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      const next = items[clamped];
      if (next !== undefined && next !== selected) {
        onSelect(next);
      }
    }, 80);
  };

  const handleClick = (item: T, idx: number) => {
    const el = wheelRef.current;
    if (!el) return;
    el.scrollTo({ top: idx * ITEM_HEIGHT, behavior: "smooth" });
    onSelect(item);
  };

  return (
    <div
      ref={wheelRef}
      role="listbox"
      aria-label={ariaLabel}
      tabIndex={0}
      className="bui-timepicker__wheel"
      onScroll={handleScroll}
      onKeyDown={(e) => {
        const idx = items.indexOf(selected);
        if (idx < 0) return;
        if (e.key === "ArrowDown") {
          e.preventDefault();
          const next = items[Math.min(items.length - 1, idx + 1)];
          if (next !== undefined) onSelect(next);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          const next = items[Math.max(0, idx - 1)];
          if (next !== undefined) onSelect(next);
        }
      }}
    >
      {/* Top spacer so the first item can sit in the center band. */}
      <div style={{ height: ITEM_HEIGHT * PAD_ITEMS }} />
      {items.map((item, i) => (
        <button
          key={String(item)}
          type="button"
          role="option"
          aria-selected={item === selected}
          data-selected={item === selected || undefined}
          className="bui-timepicker__wheel-item"
          onClick={() => handleClick(item, i)}
        >
          {format(item)}
        </button>
      ))}
      <div style={{ height: ITEM_HEIGHT * PAD_ITEMS }} />
    </div>
  );
}

/* === Draft seeding ====================================================== */

function seedDraft(
  value: string | null | undefined,
  format: TimeFormat,
  step: number,
): { h: number; m: number; isPM: boolean } {
  const t = parseTime(value) ?? { h: 9, m: 0 };
  const isPM = t.h >= 12;
  let h: number;
  if (format === "24h") {
    h = t.h;
  } else {
    // Convert 24h → 12h: 0→12, 1-11→same, 12→12, 13-23→1-11
    h = t.h % 12;
    if (h === 0) h = 12;
  }
  return { h, m: snapMinute(t.m, step), isPM };
}

/* === Icons =============================================================== */

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 4.5V8l2.5 1.5" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transition: "transform var(--bui-duration-fast) var(--bui-easing-standard)",
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
      }}
      aria-hidden
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M3 3l10 10M13 3L3 13" />
    </svg>
  );
}
