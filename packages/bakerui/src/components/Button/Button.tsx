import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { Spinner } from "../Spinner/Spinner";
import "./Button.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  /** Renders the button as a square container for a single icon. Pair with `aria-label`. */
  iconOnly?: boolean;
  /** Show a spinner overlay and disable the button. */
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    fullWidth,
    iconOnly,
    loading,
    leadingIcon,
    trailingIcon,
    className,
    type = "button",
    disabled,
    children,
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading;
  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      className={cx(
        "bui-button",
        `bui-button--${variant}`,
        `bui-button--${size}`,
        fullWidth && "bui-button--full",
        iconOnly && "bui-button--icon",
        className,
      )}
      {...rest}
    >
      <span className="bui-button__label">
        {leadingIcon}
        {children}
        {trailingIcon}
      </span>
      {loading && (
        <span className="bui-button__spinner" aria-hidden>
          <Spinner size={size === "lg" ? "md" : "sm"} label="" />
        </span>
      )}
    </button>
  );
});
