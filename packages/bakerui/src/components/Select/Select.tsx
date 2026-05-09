import { forwardRef, type SelectHTMLAttributes } from "react";
import { cx } from "../../utils/cx";
import "./Select.css";

export type SelectSize = "sm" | "md" | "lg";

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  selectSize?: SelectSize;
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { selectSize = "md", invalid, className, children, ...rest },
  ref,
) {
  return (
    <span className="bui-select-wrapper">
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cx(
          "bui-select",
          selectSize !== "md" && `bui-select--${selectSize}`,
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      <svg
        className="bui-select-wrapper__chevron"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M3.5 5.5L7 9l3.5-3.5" />
      </svg>
    </span>
  );
});
