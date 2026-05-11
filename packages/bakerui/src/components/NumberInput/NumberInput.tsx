import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Input, type InputProps } from "../Input";
import "./NumberInput.css";

export interface NumberInputProps
  extends Omit<
    InputProps,
    "value" | "defaultValue" | "onChange" | "type" | "trailingAddon" | "inputMode"
  > {
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  /** Increment applied per step (and per ArrowUp/Down press). Default 1. */
  step?: number;
  /** Maximum decimal places kept on commit. Inferred from `step` when omitted. */
  precision?: number;
  /** Hide the +/− stepper column. ArrowUp/Down still step. */
  hideSteppers?: boolean;
}

function inferPrecision(step: number): number {
  const s = String(step);
  const dot = s.indexOf(".");
  return dot === -1 ? 0 : s.length - dot - 1;
}

function clamp(n: number, min: number | undefined, max: number | undefined): number {
  if (min !== undefined && n < min) return min;
  if (max !== undefined && n > max) return max;
  return n;
}

function roundTo(n: number, precision: number): number {
  if (precision <= 0) return Math.round(n);
  const factor = 10 ** precision;
  return Math.round(n * factor) / factor;
}

function formatNumber(n: number | null, precision: number): string {
  if (n === null) return "";
  // Use toFixed for precision > 0 but strip trailing zeros so "1.5" doesn't
  // render as "1.50" when precision=2. Integers stay clean.
  if (precision <= 0) return String(Math.round(n));
  return n
    .toFixed(precision)
    .replace(/(\.\d*?)0+$/, "$1")
    .replace(/\.$/, "");
}

function parseInput(s: string): number | null {
  const trimmed = s.trim();
  if (trimmed === "" || trimmed === "-" || trimmed === "." || trimmed === "-.") return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

function Caret({ dir }: { dir: "up" | "down" }) {
  return (
    <svg
      width="8"
      height="6"
      viewBox="0 0 8 6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {dir === "up" ? <path d="M1 4.5L4 1.5l3 3" /> : <path d="M1 1.5L4 4.5l3-3" />}
    </svg>
  );
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  {
    value: controlledValue,
    defaultValue,
    onValueChange,
    min,
    max,
    step = 1,
    precision: precisionProp,
    hideSteppers,
    disabled,
    onBlur,
    onKeyDown,
    ...inputProps
  },
  ref,
) {
  const precision = precisionProp ?? inferPrecision(step);

  const [internalValue, setInternalValue] = useState<number | null>(defaultValue ?? null);
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const [display, setDisplay] = useState(() => formatNumber(value, precision));

  const inputRef = useRef<HTMLInputElement | null>(null);
  const composedRef = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
    },
    [ref],
  );

  // Sync display from external value updates that don't match our current
  // parse (e.g. consumer reset, async load). Skip while the user is mid-edit
  // so we don't reformat "1." → "1" out from under them.
  const lastSeenValueRef = useRef<number | null | undefined>(value);
  useEffect(() => {
    if (lastSeenValueRef.current === value) return;
    lastSeenValueRef.current = value;
    const isFocused = document.activeElement === inputRef.current;
    if (isFocused && parseInput(display) === value) return;
    setDisplay(formatNumber(value, precision));
  }, [value, display, precision]);

  const commit = useCallback(
    (next: number | null) => {
      if (controlledValue === undefined) setInternalValue(next);
      onValueChange?.(next);
    },
    [controlledValue, onValueChange],
  );

  const applyValue = useCallback(
    (next: number | null) => {
      setDisplay(formatNumber(next, precision));
      commit(next);
    },
    [precision, commit],
  );

  const stepBy = useCallback(
    (delta: number) => {
      const base = parseInput(display) ?? value ?? min ?? 0;
      const next = roundTo(clamp(base + delta, min, max), precision);
      applyValue(next);
    },
    [display, value, min, max, precision, applyValue],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    // Permissive while typing — allow transient "-" and "." so the user
    // can build up a number. Reject anything that isn't a partial number.
    if (!/^-?\d*\.?\d*$/.test(next)) return;
    setDisplay(next);
    commit(parseInput(next));
  };

  const handleBlur = (e: ReactFocusEvent<HTMLInputElement>) => {
    onBlur?.(e);
    if (e.defaultPrevented) return;
    const parsed = parseInput(display);
    if (parsed === null) {
      setDisplay("");
      commit(null);
      return;
    }
    const clamped = roundTo(clamp(parsed, min, max), precision);
    setDisplay(formatNumber(clamped, precision));
    if (clamped !== parsed) commit(clamped);
  };

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        stepBy(step);
        break;
      case "ArrowDown":
        e.preventDefault();
        stepBy(-step);
        break;
      case "PageUp":
        e.preventDefault();
        stepBy(step * 10);
        break;
      case "PageDown":
        e.preventDefault();
        stepBy(-step * 10);
        break;
      case "Home":
        if (min !== undefined) {
          e.preventDefault();
          applyValue(roundTo(min, precision));
        }
        break;
      case "End":
        if (max !== undefined) {
          e.preventDefault();
          applyValue(roundTo(max, precision));
        }
        break;
    }
  };

  // Press-and-hold repeats the step after a short delay. Standard UX:
  // 400ms initial pause, then ~60ms cadence. Stop on pointerup/leave/cancel.
  const repeatRef = useRef<{ timeout?: ReturnType<typeof setTimeout>; interval?: ReturnType<typeof setInterval> }>({});
  const stopRepeat = useCallback(() => {
    if (repeatRef.current.timeout) clearTimeout(repeatRef.current.timeout);
    if (repeatRef.current.interval) clearInterval(repeatRef.current.interval);
    repeatRef.current = {};
  }, []);
  const startRepeat = useCallback(
    (delta: number) => {
      stepBy(delta);
      repeatRef.current.timeout = setTimeout(() => {
        repeatRef.current.interval = setInterval(() => stepBy(delta), 60);
      }, 400);
    },
    [stepBy],
  );
  useEffect(() => stopRepeat, [stopRepeat]);

  const handleStepPointerDown =
    (delta: number) => (e: ReactPointerEvent<HTMLButtonElement>) => {
      // Keep the input focused so the spinbutton state stays announced and
      // the caret/selection survives a step click.
      e.preventDefault();
      inputRef.current?.focus({ preventScroll: true });
      startRepeat(delta);
    };

  const canIncrement =
    !disabled && (max === undefined || value === null || value < max);
  const canDecrement =
    !disabled && (min === undefined || value === null || value > min);

  return (
    <Input
      {...inputProps}
      ref={composedRef}
      type="text"
      inputMode={precision > 0 ? "decimal" : "numeric"}
      role="spinbutton"
      aria-valuenow={value ?? undefined}
      aria-valuemin={min}
      aria-valuemax={max}
      disabled={disabled}
      value={display}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      trailingAddon={
        hideSteppers ? undefined : (
          <span className="bui-number-input__steppers">
            <button
              type="button"
              tabIndex={-1}
              aria-hidden
              disabled={!canIncrement}
              className="bui-number-input__step bui-number-input__step--up"
              onPointerDown={handleStepPointerDown(step)}
              onPointerUp={stopRepeat}
              onPointerLeave={stopRepeat}
              onPointerCancel={stopRepeat}
            >
              <Caret dir="up" />
            </button>
            <button
              type="button"
              tabIndex={-1}
              aria-hidden
              disabled={!canDecrement}
              className="bui-number-input__step bui-number-input__step--down"
              onPointerDown={handleStepPointerDown(-step)}
              onPointerUp={stopRepeat}
              onPointerLeave={stopRepeat}
              onPointerCancel={stopRepeat}
            >
              <Caret dir="down" />
            </button>
          </span>
        )
      }
    />
  );
});
