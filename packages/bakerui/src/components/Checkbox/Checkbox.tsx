import { forwardRef, useEffect, useRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { composeRefs } from "../../utils/useComposedRefs";
import "./Checkbox.css";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: ReactNode;
  description?: ReactNode;
  /** Three-state checkbox (e.g., "select all" with mixed children). */
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, indeterminate, className, ...rest },
  ref,
) {
  const localRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (localRef.current) localRef.current.indeterminate = !!indeterminate;
  }, [indeterminate]);

  return (
    <label className={cx("bui-checkbox", className)}>
      <input
        ref={composeRefs(ref, localRef)}
        type="checkbox"
        className="bui-checkbox__input"
        {...rest}
      />
      <span className="bui-checkbox__box" aria-hidden>
        {indeterminate ? (
          <svg className="bui-checkbox__check" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 6h6" />
          </svg>
        ) : (
          <svg className="bui-checkbox__check" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 6.5l2.5 2.5 4.5-5" />
          </svg>
        )}
      </span>
      {(label || description) && (
        <span className="bui-checkbox__body">
          {label && <span className="bui-checkbox__label">{label}</span>}
          {description && <span className="bui-checkbox__description">{description}</span>}
        </span>
      )}
    </label>
  );
});
