import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Portal } from "../../utils/portal";
import { Spinner } from "../Spinner/Spinner";
import { cx } from "../../utils/cx";
import { toastStore, type ToastData, type ToastTone } from "./store";
import "./Toast.css";

const EXIT_DURATION = 200; // keep in sync with --bui-duration-base in tokens.css

export type ToasterPosition =
  | "top-right"
  | "top-left"
  | "top-center"
  | "bottom-right"
  | "bottom-left"
  | "bottom-center";

export interface ToasterProps {
  position?: ToasterPosition;
  /** Cap the visible stack; older toasts past the cap are auto-dismissed. */
  maxToasts?: number;
}

export function Toaster({ position = "bottom-right", maxToasts = 5 }: ToasterProps) {
  const toasts = useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot, toastStore.getSnapshot);

  // Enforce maxToasts by dismissing the oldest non-dismissed extras.
  useEffect(() => {
    const live = toasts.filter((t) => !t.dismissed);
    if (live.length > maxToasts) {
      const overflow = live.length - maxToasts;
      live.slice(0, overflow).forEach((t) => toastStore.dismiss(t.id));
    }
  }, [toasts, maxToasts]);

  if (toasts.length === 0) return null;

  return (
    <Portal>
      <div className={cx("bui-root bui-toaster", `bui-toaster--${position}`)} aria-live="polite" aria-relevant="additions">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </div>
    </Portal>
  );
}

interface ToastItemProps {
  toast: ToastData;
}

function ToastItem({ toast }: ToastItemProps) {
  // visibleState drives the data-state attribute used by CSS transitions.
  const [visibleState, setVisibleState] = useState<"opening" | "open" | "closed">("opening");
  const dismissTimerRef = useRef<number | null>(null);
  const remainingRef = useRef<number>(toast.duration);
  const startedAtRef = useRef<number>(Date.now());
  const removeTimerRef = useRef<number | null>(null);

  // Enter animation: flip to "open" on the next frame so the transition fires.
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisibleState("open"));
    return () => cancelAnimationFrame(id);
  }, []);

  // Auto-dismiss timer (resettable via toast.update).
  useEffect(() => {
    if (toast.dismissed || toast.loading || toast.duration <= 0) return;
    remainingRef.current = toast.duration;
    startedAtRef.current = Date.now();
    dismissTimerRef.current = window.setTimeout(() => {
      toastStore.dismiss(toast.id);
    }, toast.duration);
    return () => {
      if (dismissTimerRef.current !== null) {
        window.clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
    };
  }, [toast.id, toast.duration, toast.loading, toast.dismissed]);

  // Exit animation when the store marks this toast dismissed.
  useEffect(() => {
    if (!toast.dismissed) return;
    if (dismissTimerRef.current !== null) {
      window.clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    setVisibleState("closed");
    removeTimerRef.current = window.setTimeout(() => {
      toastStore.remove(toast.id);
    }, EXIT_DURATION);
    return () => {
      if (removeTimerRef.current !== null) {
        window.clearTimeout(removeTimerRef.current);
      }
    };
  }, [toast.dismissed, toast.id]);

  const onPointerEnter = () => {
    if (dismissTimerRef.current !== null) {
      window.clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
      remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startedAtRef.current));
    }
  };

  const onPointerLeave = () => {
    if (toast.dismissed || toast.loading || toast.duration <= 0) return;
    if (dismissTimerRef.current !== null) return; // already running
    startedAtRef.current = Date.now();
    dismissTimerRef.current = window.setTimeout(() => {
      toastStore.dismiss(toast.id);
    }, remainingRef.current > 0 ? remainingRef.current : toast.duration);
  };

  const onClose = () => toastStore.dismiss(toast.id);

  const dataState = visibleState === "open" ? "open" : "closed";

  return (
    <div
      className={cx("bui-toast", toast.tone !== "neutral" && `bui-toast--${toast.tone}`)}
      data-state={dataState}
      role={toast.tone === "danger" || toast.tone === "warning" ? "alert" : "status"}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <span className="bui-toast__icon" aria-hidden>
        {toast.loading ? <Spinner size="sm" label="" /> : <ToneIcon tone={toast.tone} />}
      </span>
      <div className="bui-toast__body">
        {toast.title !== undefined && toast.title !== null && (
          <div className="bui-toast__title">{toast.title}</div>
        )}
        {toast.description && <div className="bui-toast__description">{toast.description}</div>}
        {toast.actions && <div className="bui-toast__actions">{toast.actions}</div>}
      </div>
      <button type="button" className="bui-toast__close" aria-label="Dismiss" onClick={onClose}>
        <CloseIcon />
      </button>
    </div>
  );
}

function ToneIcon({ tone }: { tone: ToastTone }): ReactNode {
  if (tone === "neutral") return null;
  const path = {
    info: "M10 13.5h.01M10 7v3.5",
    success: "M6 10.5l3 3 5-6",
    warning: "M10 7v4M10 14h.01",
    danger: "M7 7l6 6M13 7l-6 6",
  }[tone];
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="10" cy="10" r="8" />
      <path d={path} />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
      <path d="M3 3l8 8M11 3l-8 8" />
    </svg>
  );
}
