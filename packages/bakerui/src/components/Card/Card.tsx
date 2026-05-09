import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "../../utils/cx";
import "./Card.css";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Apply default padding (when not using CardHeader/Body). */
  padded?: boolean;
  /** Use raised surface and shadow instead of border. */
  raised?: boolean;
  /** Hover/lift affordance — pair with role="button" or onClick. */
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { padded, raised, interactive, className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx(
        "bui-card",
        padded && "bui-card--padded",
        raised && "bui-card--raised",
        interactive && "bui-card--interactive",
        className,
      )}
      {...rest}
    />
  );
});

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardHeader({ className, ...rest }, ref) {
    return <div ref={ref} className={cx("bui-card__header", className)} {...rest} />;
  },
);

export const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardBody({ className, ...rest }, ref) {
    return <div ref={ref} className={cx("bui-card__body", className)} {...rest} />;
  },
);

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardFooter({ className, ...rest }, ref) {
    return <div ref={ref} className={cx("bui-card__footer", className)} {...rest} />;
  },
);
