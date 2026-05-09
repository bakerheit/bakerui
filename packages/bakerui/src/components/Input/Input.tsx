import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { cx } from "../../utils/cx";
import "./Input.css";

export type InputSize = "sm" | "md" | "lg";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Visual size of the input. */
  inputSize?: InputSize;
  invalid?: boolean;
  /** Icon rendered inside the input on the leading edge (no border). */
  leadingIcon?: ReactNode;
  /** Icon rendered inside the input on the trailing edge (no border). */
  trailingIcon?: ReactNode;
  /** Bordered addon block before the input (e.g., "https://"). */
  leadingAddon?: ReactNode;
  /** Bordered addon block after the input (e.g., ".com"). */
  trailingAddon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    inputSize = "md",
    invalid,
    leadingIcon,
    trailingIcon,
    leadingAddon,
    trailingAddon,
    disabled,
    className,
    ...rest
  },
  ref,
) {
  return (
    <span
      className={cx(
        "bui-input-wrapper",
        inputSize !== "md" && `bui-input-wrapper--${inputSize}`,
        invalid && "bui-input-wrapper--invalid",
        disabled && "bui-input-wrapper--disabled",
      )}
    >
      {leadingAddon && <span className="bui-input-wrapper__addon">{leadingAddon}</span>}
      {leadingIcon && (
        <span className="bui-input-wrapper__icon bui-input-wrapper__icon--leading" aria-hidden>
          {leadingIcon}
        </span>
      )}
      <input
        ref={ref}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className={cx("bui-input", className)}
        {...rest}
      />
      {trailingIcon && (
        <span className="bui-input-wrapper__icon bui-input-wrapper__icon--trailing" aria-hidden>
          {trailingIcon}
        </span>
      )}
      {trailingAddon && <span className="bui-input-wrapper__addon">{trailingAddon}</span>}
    </span>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid, className, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cx("bui-textarea", className)}
      {...rest}
    />
  );
});
