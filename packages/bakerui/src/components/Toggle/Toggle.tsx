import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import "./Toggle.css";

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(function Toggle(
  { label, className, ...rest },
  ref,
) {
  return (
    <label className={cx("bui-toggle", className)}>
      <input ref={ref} type="checkbox" className="bui-toggle__input" {...rest} />
      <span className="bui-toggle__track">
        <span className="bui-toggle__thumb" />
      </span>
      {label}
    </label>
  );
});
