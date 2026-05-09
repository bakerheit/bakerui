import {
  forwardRef,
  useCallback,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cx } from "../../utils/cx";
import "./Slider.css";

export type SliderSize = "sm" | "md";

interface SliderBaseProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Lower bound, inclusive. */
  min?: number;
  /** Upper bound, inclusive. */
  max?: number;
  /** Increment between valid values. */
  step?: number;
  /** Visual size. */
  size?: SliderSize;
  /** Disable interaction. */
  disabled?: boolean;
  /** Optional tick-mark values rendered under the track. */
  marks?: number[];
  /** Format the value reported via aria-valuetext. */
  formatLabel?: (value: number) => string;
}

export interface SingleSliderProps extends SliderBaseProps {
  /** Active value (controlled). */
  value: number;
  onValueChange: (value: number) => void;
}

export interface RangeSliderProps extends SliderBaseProps {
  /** Active range (controlled). */
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
}

export type SliderProps = SingleSliderProps | RangeSliderProps;

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

function snapToStep(value: number, min: number, step: number) {
  if (step <= 0) return value;
  const steps = Math.round((value - min) / step);
  return min + steps * step;
}

function pct(value: number, min: number, max: number) {
  const range = max - min;
  if (range <= 0) return 0;
  return ((value - min) / range) * 100;
}

export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(
  props,
  ref,
) {
  const {
    min = 0,
    max = 100,
    step = 1,
    size = "md",
    disabled,
    marks,
    formatLabel,
    className,
    value,
    onValueChange,
    ...rest
  } = props as SliderBaseProps & {
    value: number | [number, number];
    onValueChange: (v: number | [number, number]) => void;
  };

  const isRange = Array.isArray(value);
  const values = isRange ? (value as [number, number]) : [value as number];

  const trackRef = useRef<HTMLDivElement | null>(null);
  // Active thumb index for the current pointer drag, so pointermove keeps
  // updating the same handle even when the cursor crosses the other thumb.
  const draggingIndexRef = useRef<number | null>(null);

  const commit = useCallback(
    (next: number[]) => {
      if (isRange) {
        const sorted: [number, number] = [
          Math.min(next[0], next[1]),
          Math.max(next[0], next[1]),
        ];
        (onValueChange as (v: [number, number]) => void)(sorted);
      } else {
        (onValueChange as (v: number) => void)(next[0]);
      }
    },
    [isRange, onValueChange],
  );

  const valueFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return min;
      const rect = track.getBoundingClientRect();
      const ratio = rect.width > 0 ? (clientX - rect.left) / rect.width : 0;
      const raw = min + clamp(ratio, 0, 1) * (max - min);
      return clamp(snapToStep(raw, min, step), min, max);
    },
    [min, max, step],
  );

  const nearestThumb = useCallback(
    (target: number) => {
      if (!isRange) return 0;
      const [a, b] = values;
      // If both thumbs sit on the same value, prefer the one the drag is
      // moving away from so a stuck range can be unstuck in either direction.
      if (a === b) return target < a ? 0 : 1;
      return Math.abs(target - a) <= Math.abs(target - b) ? 0 : 1;
    },
    [isRange, values],
  );

  const updateAt = useCallback(
    (index: number, next: number) => {
      const arr = [...values];
      arr[index] = clamp(snapToStep(next, min, step), min, max);
      commit(arr);
    },
    [values, min, max, step, commit],
  );

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    const v = valueFromClientX(e.clientX);
    const idx = nearestThumb(v);
    draggingIndexRef.current = idx;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updateAt(idx, v);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (draggingIndexRef.current === null) return;
    const v = valueFromClientX(e.clientX);
    updateAt(draggingIndexRef.current, v);
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (draggingIndexRef.current === null) return;
    draggingIndexRef.current = null;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  const onThumbKeyDown =
    (index: number) => (e: ReactKeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      const big = step * 10;
      let delta = 0;
      let next: number | null = null;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
          delta = step;
          break;
        case "ArrowLeft":
        case "ArrowDown":
          delta = -step;
          break;
        case "PageUp":
          delta = big;
          break;
        case "PageDown":
          delta = -big;
          break;
        case "Home":
          next = min;
          break;
        case "End":
          next = max;
          break;
        default:
          return;
      }
      e.preventDefault();
      const target = next !== null ? next : values[index] + delta;
      updateAt(index, target);
    };

  const lo = isRange ? Math.min(values[0], values[1]) : min;
  const hi = isRange ? Math.max(values[0], values[1]) : values[0];
  const fillStart = pct(lo, min, max);
  const fillEnd = pct(hi, min, max);

  return (
    <div
      ref={ref}
      className={cx(
        "bui-slider",
        `bui-slider--${size}`,
        disabled && "bui-slider--disabled",
        className,
      )}
      data-disabled={disabled || undefined}
      {...rest}
    >
      <div
        ref={trackRef}
        className="bui-slider__track"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="bui-slider__fill"
          style={{ left: `${fillStart}%`, right: `${100 - fillEnd}%` }}
        />
        {marks?.map((m) => (
          <span
            key={m}
            aria-hidden
            className="bui-slider__mark"
            style={{ left: `${pct(m, min, max)}%` }}
            data-active={m >= lo && m <= hi || undefined}
          />
        ))}
        {values.map((v, idx) => (
          <div
            key={idx}
            role="slider"
            tabIndex={disabled ? -1 : 0}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={v}
            aria-valuetext={formatLabel ? formatLabel(v) : undefined}
            aria-disabled={disabled || undefined}
            aria-orientation="horizontal"
            className="bui-slider__thumb"
            style={{ left: `${pct(v, min, max)}%` }}
            onKeyDown={onThumbKeyDown(idx)}
          />
        ))}
      </div>
    </div>
  );
});
