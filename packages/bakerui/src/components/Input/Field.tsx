import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  type ReactElement,
  type ReactNode,
} from "react";
import { cx } from "../../utils/cx";

export interface FieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  htmlFor?: string;
  /** Mark the field as required. Adds an asterisk to the label and `required` to the input. */
  required?: boolean;
  /** Show an "(optional)" annotation next to the label. Ignored if `required`. */
  showOptional?: boolean;
  className?: string;
  children: ReactNode;
}

interface InjectableProps {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  required?: boolean;
  invalid?: boolean;
}

/**
 * Field wraps an input with a label, hint, and error. The first valid child
 * receives an auto-generated id and `aria-describedby` linking to the hint
 * or error. When `error` is set, the child also receives `invalid`/`aria-invalid`.
 */
export function Field({
  label,
  hint,
  error,
  htmlFor,
  required,
  showOptional,
  className,
  children,
}: FieldProps) {
  const generatedId = useId();
  const id = htmlFor ?? generatedId;

  let injected = false;
  const wired = Children.map(children, (child) => {
    if (!injected && isValidElement(child)) {
      injected = true;
      const existing = child.props as InjectableProps;
      return cloneElement(child as ReactElement<InjectableProps>, {
        id: existing.id ?? id,
        "aria-describedby":
          existing["aria-describedby"] ??
          (error ? `${id}-error` : hint ? `${id}-hint` : undefined),
        invalid: error ? true : existing.invalid,
        required: required || existing.required,
      });
    }
    return child;
  });

  return (
    <div className={cx("bui-field", className)}>
      {label && (
        <label className="bui-field__label" htmlFor={id}>
          {label}
          {required ? (
            <span className="bui-field__required" aria-hidden>
              *
            </span>
          ) : showOptional ? (
            <span className="bui-field__optional">(optional)</span>
          ) : null}
        </label>
      )}
      {wired}
      {error ? (
        <span id={`${id}-error`} className="bui-field__error">
          {error}
        </span>
      ) : hint ? (
        <span id={`${id}-hint`} className="bui-field__hint">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
