import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import "./Alert.css";

export type AlertTone = "neutral" | "info" | "success" | "warning" | "danger";

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  tone?: AlertTone;
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  /** When provided, renders a close button. */
  onClose?: () => void;
  /** Right-aligned action buttons (e.g., "Retry"). */
  actions?: ReactNode;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { tone = "neutral", title, description, icon, onClose, actions, className, children, ...rest },
  ref,
) {
  const resolvedIcon = icon !== undefined ? icon : <DefaultIcon tone={tone} />;
  return (
    <div
      ref={ref}
      role={tone === "danger" || tone === "warning" ? "alert" : "status"}
      className={cx("bui-alert", tone !== "neutral" && `bui-alert--${tone}`, className)}
      {...rest}
    >
      {resolvedIcon && <span className="bui-alert__icon" aria-hidden>{resolvedIcon}</span>}
      <div className="bui-alert__body">
        {title && <div className="bui-alert__title">{title}</div>}
        {(description || children) && (
          <div className="bui-alert__description">{description ?? children}</div>
        )}
        {actions && <div className="bui-alert__actions">{actions}</div>}
      </div>
      {onClose && (
        <button type="button" className="bui-alert__close" aria-label="Dismiss" onClick={onClose}>
          <CloseIcon />
        </button>
      )}
    </div>
  );
});

function DefaultIcon({ tone }: { tone: AlertTone }) {
  if (tone === "neutral") return null;
  const path = {
    info: "M10 13.5h.01M10 7v3.5",
    success: "M6 10.5l3 3 5-6",
    warning: "M10 7v4M10 14h.01",
    danger: "M7 7l6 6M13 7l-6 6",
  }[tone];
  const showCircle = tone !== "success";
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      {showCircle && <circle cx="10" cy="10" r="8" />}
      {tone === "success" && <circle cx="10" cy="10" r="8" />}
      <path d={path} />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 3l10 10M13 3L3 13" />
    </svg>
  );
}
