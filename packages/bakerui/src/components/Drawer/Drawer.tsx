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
  type Ref,
} from "react";
import { Portal } from "../../utils/portal";
import { useBodyScrollLock } from "../../utils/useBodyScrollLock";
import { useEscape } from "../../utils/useEscape";
import { useFocusTrap } from "../../utils/useFocusTrap";
import { cx } from "../../utils/cx";
import { Slot } from "../Slot/Slot";
import "./Drawer.css";

export type DrawerSide = "left" | "right" | "top" | "bottom";
export type DrawerSize = "sm" | "md" | "lg" | "xl" | "full";

interface DrawerContextValue {
  open: boolean;
  setOpen: (next: boolean) => void;
  titleId: string;
  descriptionId: string;
  registerTitle: () => () => void;
  registerDescription: () => () => void;
  hasTitle: boolean;
  hasDescription: boolean;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

function useDrawer(component: string): DrawerContextValue {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error(`<Drawer.${component}> must be used inside <Drawer>`);
  return ctx;
}

export interface DrawerProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export function DrawerRoot({
  open: controlled,
  defaultOpen = false,
  onOpenChange,
  children,
}: DrawerProps) {
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

  const value = useMemo<DrawerContextValue>(
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
    [
      open,
      setOpen,
      titleId,
      descriptionId,
      registerTitle,
      registerDescription,
      titleCount,
      descriptionCount,
    ],
  );

  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>;
}

interface TriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DrawerTrigger = forwardRef<HTMLButtonElement, TriggerProps>(function DrawerTrigger(
  { asChild, onClick, ...rest },
  ref,
) {
  const { setOpen, open } = useDrawer("Trigger");
  const handleClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) setOpen(true);
  };

  if (asChild) {
    return (
      <Slot
        ref={ref as unknown as Ref<HTMLElement>}
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
  /** Edge to anchor against. Defaults to "right". */
  side?: DrawerSide;
  /** Drawer width (left/right) or height (top/bottom). "full" fills the cross-axis. */
  size?: DrawerSize;
  closeOnBackdropClick?: boolean;
  showCloseButton?: boolean;
}

const DrawerContent = forwardRef<HTMLDivElement, ContentProps>(function DrawerContent(
  {
    side = "right",
    size = "md",
    closeOnBackdropClick = true,
    showCloseButton = true,
    className,
    children,
    onKeyDown,
    ...rest
  },
  ref,
) {
  const {
    open,
    setOpen,
    titleId,
    descriptionId,
    hasTitle,
    hasDescription,
  } = useDrawer("Content");
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [mountState, setMountState] = useState<"closed" | "open">("closed");

  // Defer to open state so CSS transitions can run.
  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => setMountState("open"));
      return () => cancelAnimationFrame(id);
    }
    setMountState("closed");
  }, [open]);

  useEscape(open, () => setOpen(false));
  useFocusTrap(open, contentRef);
  useBodyScrollLock(open);

  if (!open) return null;

  const onBackdropClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && closeOnBackdropClick) {
      setOpen(false);
    }
  };

  return (
    <Portal>
      <div
        className={cx(
          "bui-root bui-drawer__backdrop",
          `bui-drawer__backdrop--${side}`,
        )}
        data-state={mountState}
        onMouseDown={onBackdropClick}
      >
        <div
          ref={(node) => {
            contentRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={hasTitle ? titleId : undefined}
          aria-describedby={hasDescription ? descriptionId : undefined}
          data-state={mountState}
          data-side={side}
          className={cx(
            "bui-drawer",
            `bui-drawer--${side}`,
            `bui-drawer--${size}`,
            className,
          )}
          onKeyDown={onKeyDown}
          {...rest}
        >
          {showCloseButton && (
            <button
              type="button"
              className="bui-drawer__close-x"
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

const DrawerHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function DrawerHeader({ className, ...rest }, ref) {
    return <div ref={ref} className={cx("bui-drawer__header", className)} {...rest} />;
  },
);

const DrawerTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  function DrawerTitle({ className, ...rest }, ref) {
    const { titleId, registerTitle } = useDrawer("Title");
    useEffect(() => registerTitle(), [registerTitle]);
    return (
      <h2
        ref={ref}
        id={titleId}
        className={cx("bui-drawer__title", className)}
        {...rest}
      />
    );
  },
);

const DrawerDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(function DrawerDescription({ className, ...rest }, ref) {
  const { descriptionId, registerDescription } = useDrawer("Description");
  useEffect(() => registerDescription(), [registerDescription]);
  return (
    <p
      ref={ref}
      id={descriptionId}
      className={cx("bui-drawer__description", className)}
      {...rest}
    />
  );
});

const DrawerBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function DrawerBody({ className, ...rest }, ref) {
    return <div ref={ref} className={cx("bui-drawer__body", className)} {...rest} />;
  },
);

const DrawerFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function DrawerFooter({ className, ...rest }, ref) {
    return <div ref={ref} className={cx("bui-drawer__footer", className)} {...rest} />;
  },
);

interface CloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DrawerClose = forwardRef<HTMLButtonElement, CloseProps>(function DrawerClose(
  { asChild, onClick, ...rest },
  ref,
) {
  const { setOpen } = useDrawer("Close");
  const handleClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) setOpen(false);
  };
  if (asChild) {
    return (
      <Slot
        ref={ref as unknown as Ref<HTMLElement>}
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

type DrawerComponent = typeof DrawerRoot & {
  Trigger: typeof DrawerTrigger;
  Content: typeof DrawerContent;
  Header: typeof DrawerHeader;
  Title: typeof DrawerTitle;
  Description: typeof DrawerDescription;
  Body: typeof DrawerBody;
  Footer: typeof DrawerFooter;
  Close: typeof DrawerClose;
};

export const Drawer = DrawerRoot as DrawerComponent;
Drawer.Trigger = DrawerTrigger;
Drawer.Content = DrawerContent;
Drawer.Header = DrawerHeader;
Drawer.Title = DrawerTitle;
Drawer.Description = DrawerDescription;
Drawer.Body = DrawerBody;
Drawer.Footer = DrawerFooter;
Drawer.Close = DrawerClose;
