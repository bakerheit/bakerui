import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "../../utils/cx";
import "./Skeleton.css";

export type SkeletonShape = "rect" | "circle" | "text";

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  shape?: SkeletonShape;
  width?: number | string;
  height?: number | string;
}

export const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(function Skeleton(
  { shape = "rect", width, height, className, style, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      aria-hidden
      className={cx("bui-skeleton", shape !== "rect" && `bui-skeleton--${shape}`, className)}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        ...style,
      }}
      {...rest}
    />
  );
});
