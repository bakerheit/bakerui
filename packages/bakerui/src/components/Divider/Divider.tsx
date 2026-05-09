import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import "./Divider.css";

export interface DividerProps extends HTMLAttributes<HTMLElement> {
  orientation?: "horizontal" | "vertical";
  /** Optional label rendered inline in the middle of a horizontal divider. */
  label?: ReactNode;
}

export const Divider = forwardRef<HTMLElement, DividerProps>(function Divider(
  { orientation = "horizontal", label, className, ...rest },
  ref,
) {
  if (label && orientation === "horizontal") {
    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        role="separator"
        aria-orientation="horizontal"
        className={cx("bui-divider", "bui-divider--horizontal", "bui-divider--labeled", className)}
        {...rest}
      >
        <span>{label}</span>
      </div>
    );
  }

  return (
    <hr
      ref={ref as React.Ref<HTMLHRElement>}
      aria-orientation={orientation}
      className={cx("bui-divider", `bui-divider--${orientation}`, className)}
      {...rest}
    />
  );
});
