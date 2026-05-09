import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "../../utils/cx";
import "./Badge.css";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  /** Use a solid filled variant instead of soft. */
  solid?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { tone = "neutral", solid, className, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cx("bui-badge", `bui-badge--${tone}`, solid && "bui-badge--solid", className)}
      {...rest}
    />
  );
});
