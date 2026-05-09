import { forwardRef, type CSSProperties, type HTMLAttributes } from "react";
import { cx } from "../../utils/cx";
import "./ProgressBar.css";

export type ProgressSize = "sm" | "md" | "lg";
export type ProgressTone = "accent" | "success" | "warning" | "danger";

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  /** Current value 0–max. Omit (or pass null) for an indeterminate progress bar. */
  value?: number | null;
  /** Maximum value. Default 100. */
  max?: number;
  size?: ProgressSize;
  tone?: ProgressTone;
  /** Accessible label. */
  label?: string;
}

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(function ProgressBar(
  { value, max = 100, size = "md", tone = "accent", label, className, style, ...rest },
  ref,
) {
  const isIndeterminate = value === undefined || value === null;
  const clamped = isIndeterminate ? 0 : Math.max(0, Math.min(value, max));
  const ratio = isIndeterminate ? 0 : clamped / max;

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={isIndeterminate ? undefined : clamped}
      data-indeterminate={isIndeterminate || undefined}
      className={cx(
        "bui-progress",
        `bui-progress--${size}`,
        tone !== "accent" && `bui-progress--${tone}`,
        className,
      )}
      style={
        {
          "--bui-progress-value": ratio.toString(),
          ...style,
        } as CSSProperties
      }
      {...rest}
    >
      <div className="bui-progress__fill" />
    </div>
  );
});
