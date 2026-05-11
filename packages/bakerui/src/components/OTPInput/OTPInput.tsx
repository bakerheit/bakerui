import {
  Fragment,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { cx } from "../../utils/cx";
import "./OTPInput.css";

export type OTPPattern = "numeric" | "alphanumeric" | RegExp;
export type OTPInputSize = "sm" | "md" | "lg";

export interface OTPInputProps {
  /** Number of cells. Default 6. */
  length?: number;
  /** Controlled value. Pass a string up to `length` chars — only a prefix; gaps aren't allowed. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Fires when every cell is filled. Receives the final string. */
  onComplete?: (value: string) => void;
  /** Per-character validator. Default `"numeric"` (digits only). */
  pattern?: OTPPattern;
  /** Render filled cells as a bullet glyph instead of the raw char. */
  mask?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  inputSize?: OTPInputSize;
  /** Focus the first cell on mount. */
  autoFocus?: boolean;
  /** Render a visual separator before this 0-indexed cell (e.g. 3 for "XXX-XXX"). */
  separatorAt?: number;
  /** Accessible group label, e.g. "Verification code". */
  "aria-label"?: string;
  className?: string;
  /** Forwarded onto the first cell so HTML forms can submit it. */
  name?: string;
  id?: string;
}

function resolvePattern(p: OTPPattern | undefined): RegExp {
  if (p instanceof RegExp) return p;
  if (p === "alphanumeric") return /^[a-zA-Z0-9]$/;
  return /^\d$/;
}

export const OTPInput = forwardRef<HTMLInputElement, OTPInputProps>(function OTPInput(
  {
    length = 6,
    value: controlledValue,
    defaultValue,
    onValueChange,
    onComplete,
    pattern,
    mask,
    invalid,
    disabled,
    inputSize = "md",
    autoFocus,
    separatorAt,
    "aria-label": ariaLabel,
    className,
    name,
    id: idProp,
  },
  ref,
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const patternRegex = useMemo(() => resolvePattern(pattern), [pattern]);

  const [internalValue, setInternalValue] = useState(() => (defaultValue ?? "").slice(0, length));
  const rawValue = controlledValue !== undefined ? controlledValue : internalValue;
  const value = rawValue.slice(0, length);

  // Strict left-to-right fill: the "active" cell is the next empty slot,
  // clamped to the last cell when the code is full.
  const activeIndex = Math.min(value.length, length - 1);

  const refs = useRef<(HTMLInputElement | null)[]>([]);

  // Expose the first cell as the imperative handle so form libraries can
  // focus/blur the component naturally.
  useEffect(() => {
    const first = refs.current[0];
    if (typeof ref === "function") ref(first ?? null);
    else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = first ?? null;
  }, [ref]);

  const commit = useCallback(
    (next: string) => {
      const clipped = next.slice(0, length);
      if (controlledValue === undefined) setInternalValue(clipped);
      onValueChange?.(clipped);
    },
    [controlledValue, length, onValueChange],
  );

  // Fire onComplete only on the transition from incomplete → complete.
  const wasCompleteRef = useRef(value.length === length);
  useEffect(() => {
    const isComplete = value.length === length;
    if (isComplete && !wasCompleteRef.current) onComplete?.(value);
    wasCompleteRef.current = isComplete;
  }, [value, length, onComplete]);

  const focusCell = useCallback((i: number) => {
    const clamped = Math.max(0, Math.min(length - 1, i));
    const node = refs.current[clamped];
    if (!node) return;
    node.focus();
    // Selecting on focus lets a typed char overwrite a filled cell.
    node.select();
  }, [length]);

  const handleChange = (i: number) => (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") {
      // Backspace inside an empty cell can fire onChange with "" in some
      // browsers (mainly Android keyboards). Handled in keydown for
      // desktop, but mirror it here for robustness.
      if (i > 0 && !value[i]) {
        commit(value.slice(0, i - 1));
        focusCell(i - 1);
      } else if (i < value.length) {
        commit(value.slice(0, i));
        focusCell(i);
      }
      return;
    }
    // maxLength=1 caps at one char, but when the cell was pre-filled the
    // browser may yield e.g. "5X" before clamping; take the most recently
    // typed char.
    const char = raw.slice(-1);
    if (!patternRegex.test(char)) return;

    // Replace at position i and truncate everything after (strict prefix).
    const nextValue = (value.slice(0, i) + char).slice(0, length);
    commit(nextValue);

    // Advance focus to the next cell, unless we just filled the last one.
    if (i + 1 < length) focusCell(i + 1);
  };

  const handleKeyDown = (i: number) => (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (value[i]) {
        // Clear this cell (and everything after, but in strict-prefix mode
        // there isn't anything after this index that's filled — i would
        // have to be >= activeIndex, so just truncate to i).
        commit(value.slice(0, i));
        focusCell(i);
      } else if (i > 0) {
        // Empty cell, pop previous and focus it.
        commit(value.slice(0, i - 1));
        focusCell(i - 1);
      }
      return;
    }
    if (e.key === "Delete") {
      e.preventDefault();
      if (value[i]) {
        commit(value.slice(0, i));
        focusCell(i);
      }
      return;
    }
    if (e.key === "ArrowLeft") {
      if (i > 0) {
        e.preventDefault();
        focusCell(i - 1);
      }
      return;
    }
    if (e.key === "ArrowRight") {
      // Don't let users skip past the active cell — there's nothing to edit there.
      if (i < activeIndex) {
        e.preventDefault();
        focusCell(i + 1);
      }
      return;
    }
    if (e.key === "Home") {
      e.preventDefault();
      focusCell(0);
      return;
    }
    if (e.key === "End") {
      e.preventDefault();
      focusCell(activeIndex);
      return;
    }
  };

  const handlePaste = (i: number) => (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    if (!text) return;
    const chars = text.split("").filter((c) => patternRegex.test(c));
    if (chars.length === 0) return;
    // Paste replaces from position i forward.
    const next = (value.slice(0, i) + chars.join("")).slice(0, length);
    commit(next);
    focusCell(Math.min(next.length, length - 1));
  };

  const handleClick = (i: number) => (e: ReactMouseEvent<HTMLInputElement>) => {
    // Clicking past the active (next empty) cell snaps focus back to it —
    // there's nothing to edit at indices >= value.length except activeIndex.
    if (i > activeIndex) {
      e.preventDefault();
      focusCell(activeIndex);
    }
  };

  const handleFocus = (e: ReactFocusEvent<HTMLInputElement>) => {
    // Select so a typed char overwrites the existing one.
    e.target.select();
  };

  return (
    <div
      className={cx(
        "bui-otp",
        inputSize !== "md" && `bui-otp--${inputSize}`,
        invalid && "bui-otp--invalid",
        disabled && "bui-otp--disabled",
        className,
      )}
      role="group"
      aria-label={ariaLabel}
    >
      {Array.from({ length }).map((_, i) => {
        const cellChar = value[i] ?? "";
        const displayValue = mask && cellChar ? "•" : cellChar;
        return (
          <Fragment key={i}>
            {separatorAt === i && (
              <span className="bui-otp__separator" aria-hidden>
                –
              </span>
            )}
            <input
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="text"
              inputMode={
                pattern instanceof RegExp
                  ? "text"
                  : pattern === "alphanumeric"
                    ? "text"
                    : "numeric"
              }
              // The first cell carries one-time-code so iOS/Android SMS
              // autofill can populate it; subsequent cells stay off so the
              // browser doesn't try to suggest values for individual digits.
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={1}
              aria-label={`${ariaLabel ?? "Code"} digit ${i + 1} of ${length}`}
              autoFocus={autoFocus && i === 0}
              disabled={disabled}
              name={i === 0 ? name : undefined}
              id={i === 0 ? id : `${id}-${i}`}
              data-filled={cellChar ? "true" : undefined}
              className="bui-otp__cell"
              value={displayValue}
              onChange={handleChange(i)}
              onKeyDown={handleKeyDown(i)}
              onPaste={handlePaste(i)}
              onClick={handleClick(i)}
              onFocus={handleFocus}
            />
          </Fragment>
        );
      })}
    </div>
  );
});
