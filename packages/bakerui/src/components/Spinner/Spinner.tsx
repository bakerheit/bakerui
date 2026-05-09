import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "../../utils/cx";
import "./Spinner.css";

export type SpinnerSize = "sm" | "md" | "lg";

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize;
  /** Accessible label; defaults to "Loading". Pass "" to hide from screen readers (when adjacent text already conveys state). */
  label?: string;
}

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = "md", label = "Loading", className, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      role={label ? "status" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      className={cx("bui-spinner", `bui-spinner--${size}`, className)}
      {...rest}
    />
  );
});
