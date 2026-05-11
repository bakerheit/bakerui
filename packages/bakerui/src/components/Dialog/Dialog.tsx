import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { Portal } from "../../utils/portal";
import { useBodyScrollLock } from "../../utils/useBodyScrollLock";
import { useEscape } from "../../utils/useEscape";
import { useFocusTrap } from "../../utils/useFocusTrap";
import { cx } from "../../utils/cx";
import { Slot } from "../Slot/Slot";
import "./Dialog.css";

interface DialogContextValue {
  open: boolean;
  setOpen: (next: boolean) => void;
  titleId: string;
  descriptionId: string;
  registerTitle: () => () => void;
  registerDescription: () => () => void;
  hasTitle: boolean;
  hasDescription: boolean;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialog(component: string): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error(`<Dialog.${component}> must be used inside <Dialog>`);
  return ctx;
}

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export function DialogRoot({ open: controlled, defaultOpen = false, onOpenChange, children }: DialogProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlled ?? internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (controlled === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [controlled, onOpenChange],
  );

  const titleId = useId();
  const descriptionId = useId();
  const [titleCount, setTitleCount] = useState(0);
  const [descriptionCount, setDescriptionCount] = useState(0);

  const registerTitle = useCallback(() => {
    setTitleCount((c) => c + 1);
    return () => setTitleCount((c) => c - 1);
  }, []);
  const registerDescription = useCallback(() => {
    setDescriptionCount((c) => c + 1);
    return () => setDescriptionCount((c) => c - 1);
  }, []);

  const value = useMemo<DialogContextValue>(
    () => ({
      open,
      setOpen,
      titleId,
      descriptionId,
      registerTitle,
      registerDescription,
      hasTitle: titleCount > 0,
      hasDescription: descriptionCount > 0,
    }),
    [open, setOpen, titleId, descriptionId, registerTitle, registerDescription, titleCount, descriptionCount],
  );

  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
}

interface TriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DialogTrigger = forwardRef<HTMLButtonElement, TriggerProps>(function DialogTrigger(
  { asChild, onClick, ...rest },
  ref,
) {
  const { setOpen, open } = useDialog("Trigger");
  const handleClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) setOpen(true);
  };

  if (asChild) {
    return (
      <Slot
        ref={ref as unknown as React.Ref<HTMLElement>}
        onClick={handleClick as unknown as (e: unknown) => void}
        aria-haspopup="dialog"
        aria-expanded={open}
        {...rest}
      />
    );
  }
  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      aria-haspopup="dialog"
      aria-expanded={open}
      {...rest}
    />
  );
});

interface ContentProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  closeOnBackdropClick?: boolean;
  showCloseButton?: boolean;
  /**
   * Render as an alert dialog. Switches `role` to `"alertdialog"` and
   * forces an explicit decision: Escape, backdrop click, and the close-X
   * are all disabled by default, so the user must use one of the action
   * buttons in `Dialog.Footer`. The individual `closeOnBackdropClick` and
   * `showCloseButton` props still win if you set them explicitly.
   */
  alert?: boolean;
}

const DialogContent = forwardRef<HTMLDivElement, ContentProps>(function DialogContent(
  {
    size = "md",
    closeOnBackdropClick,
    showCloseButton,
    alert,
    className,
    children,
    onKeyDown,
    ...rest
  },
  ref,
) {
  const { open, setOpen, titleId, descriptionId, hasTitle, hasDescription } = useDialog("Content");
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [mountState, setMountState] = useState<"closed" | "open">("closed");

  // Alert dialogs default to all-dismiss-paths-disabled — the whole point
  // is to make the user pick an action. Consumers can still opt back in
  // per-prop if they have a reason to.
  const resolvedCloseOnBackdrop = closeOnBackdropClick ?? !alert;
  const resolvedShowClose = showCloseButton ?? !alert;

  // Defer to open state so CSS transitions can run.
  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => setMountState("open"));
      return () => cancelAnimationFrame(id);
    }
    setMountState("closed");
  }, [open]);

  useEscape(open && !alert, () => setOpen(false));
  useFocusTrap(open, contentRef);
  useBodyScrollLock(open);

  if (!open) return null;

  const onBackdropClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && resolvedCloseOnBackdrop) {
      setOpen(false);
    }
  };

  return (
    <Portal>
      <div
        className="bui-root bui-dialog__backdrop"
        data-state={mountState}
        onMouseDown={onBackdropClick}
      >
        <div
          ref={(node) => {
            contentRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }}
          role={alert ? "alertdialog" : "dialog"}
          aria-modal="true"
          aria-labelledby={hasTitle ? titleId : undefined}
          aria-describedby={hasDescription ? descriptionId : undefined}
          data-state={mountState}
          className={cx("bui-dialog", `bui-dialog--${size}`, className)}
          onKeyDown={onKeyDown}
          {...rest}
        >
          {resolvedShowClose && (
            <button
              type="button"
              className="bui-dialog__close-x"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              <CloseIcon />
            </button>
          )}
          {children}
        </div>
      </div>
    </Portal>
  );
});

const DialogHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function DialogHeader({ className, ...rest }, ref) {
    return <div ref={ref} className={cx("bui-dialog__header", className)} {...rest} />;
  },
);

const DialogTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  function DialogTitle({ className, ...rest }, ref) {
    const { titleId, registerTitle } = useDialog("Title");
    useEffect(() => registerTitle(), [registerTitle]);
    return <h2 ref={ref} id={titleId} className={cx("bui-dialog__title", className)} {...rest} />;
  },
);

const DialogDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function DialogDescription({ className, ...rest }, ref) {
    const { descriptionId, registerDescription } = useDialog("Description");
    useEffect(() => registerDescription(), [registerDescription]);
    return (
      <p
        ref={ref}
        id={descriptionId}
        className={cx("bui-dialog__description", className)}
        {...rest}
      />
    );
  },
);

const DialogBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function DialogBody({ className, ...rest }, ref) {
    return <div ref={ref} className={cx("bui-dialog__body", className)} {...rest} />;
  },
);

const DialogFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function DialogFooter({ className, ...rest }, ref) {
    return <div ref={ref} className={cx("bui-dialog__footer", className)} {...rest} />;
  },
);

interface CloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DialogClose = forwardRef<HTMLButtonElement, CloseProps>(function DialogClose(
  { asChild, onClick, ...rest },
  ref,
) {
  const { setOpen } = useDialog("Close");
  const handleClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) setOpen(false);
  };
  if (asChild) {
    return (
      <Slot
        ref={ref as unknown as React.Ref<HTMLElement>}
        onClick={handleClick as unknown as (e: unknown) => void}
        {...rest}
      />
    );
  }
  return <button ref={ref} type="button" onClick={handleClick} {...rest} />;
});

function CloseIcon() {
  return (
    <svg
      aria-hidden
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M3 3l10 10M13 3L3 13" />
    </svg>
  );
}

type DialogComponent = typeof DialogRoot & {
  Trigger: typeof DialogTrigger;
  Content: typeof DialogContent;
  Header: typeof DialogHeader;
  Title: typeof DialogTitle;
  Description: typeof DialogDescription;
  Body: typeof DialogBody;
  Footer: typeof DialogFooter;
  Close: typeof DialogClose;
};

export const Dialog = DialogRoot as DialogComponent;
Dialog.Trigger = DialogTrigger;
Dialog.Content = DialogContent;
Dialog.Header = DialogHeader;
Dialog.Title = DialogTitle;
Dialog.Description = DialogDescription;
Dialog.Body = DialogBody;
Dialog.Footer = DialogFooter;
Dialog.Close = DialogClose;
