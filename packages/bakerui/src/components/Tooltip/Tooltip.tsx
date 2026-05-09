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
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Portal } from "../../utils/portal";
import { useEscape } from "../../utils/useEscape";
import { usePosition, type Placement } from "../../utils/usePosition";
import { cx } from "../../utils/cx";
import { Slot } from "../Slot/Slot";
import "./Tooltip.css";

interface TooltipContextValue {
  open: boolean;
  setOpen: (next: boolean) => void;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  contentId: string;
  delay: number;
  scheduleOpen: () => void;
  cancelOpen: () => void;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

function useTooltip(component: string): TooltipContextValue {
  const ctx = useContext(TooltipContext);
  if (!ctx) throw new Error(`<Tooltip.${component}> must be used inside <Tooltip>`);
  return ctx;
}

export interface TooltipProps {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Hover delay before showing, in ms. */
  delay?: number;
  children: ReactNode;
}

export function TooltipRoot({
  defaultOpen = false,
  open: controlled,
  onOpenChange,
  delay = 300,
  children,
}: TooltipProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlled ?? internalOpen;
  const triggerRef = useRef<HTMLElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const contentId = useId();

  const setOpen = useCallback(
    (next: boolean) => {
      if (controlled === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [controlled, onOpenChange],
  );

  const cancelOpen = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleOpen = useCallback(() => {
    cancelOpen();
    timerRef.current = window.setTimeout(() => {
      setOpen(true);
      timerRef.current = null;
    }, delay);
  }, [cancelOpen, delay, setOpen]);

  useEffect(() => () => cancelOpen(), [cancelOpen]);

  const value = useMemo<TooltipContextValue>(
    () => ({ open, setOpen, triggerRef, contentId, delay, scheduleOpen, cancelOpen }),
    [open, setOpen, contentId, delay, scheduleOpen, cancelOpen],
  );

  return <TooltipContext.Provider value={value}>{children}</TooltipContext.Provider>;
}

interface TriggerProps extends HTMLAttributes<HTMLElement> {
  asChild?: boolean;
  children: ReactNode;
}

const TooltipTrigger = forwardRef<HTMLElement, TriggerProps>(function TooltipTrigger(
  { asChild, onPointerEnter, onPointerLeave, onFocus, onBlur, children, ...rest },
  ref,
) {
  const { setOpen, scheduleOpen, cancelOpen, triggerRef, contentId, open } = useTooltip("Trigger");

  const handlePointerEnter = (event: React.PointerEvent<HTMLElement>) => {
    onPointerEnter?.(event);
    if (event.pointerType === "touch") return;
    scheduleOpen();
  };
  const handlePointerLeave = (event: React.PointerEvent<HTMLElement>) => {
    onPointerLeave?.(event);
    cancelOpen();
    setOpen(false);
  };
  const handleFocus = (event: React.FocusEvent<HTMLElement>) => {
    onFocus?.(event);
    setOpen(true);
  };
  const handleBlur = (event: React.FocusEvent<HTMLElement>) => {
    onBlur?.(event);
    cancelOpen();
    setOpen(false);
  };

  const composedRef = useCallback(
    (node: HTMLElement | null) => {
      triggerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
    },
    [ref, triggerRef],
  );

  const handlerProps = {
    onPointerEnter: handlePointerEnter,
    onPointerLeave: handlePointerLeave,
    onFocus: handleFocus,
    onBlur: handleBlur,
    "aria-describedby": open ? contentId : undefined,
  };

  if (asChild) {
    return (
      <Slot ref={composedRef} {...(handlerProps as object)} {...rest}>
        {children}
      </Slot>
    );
  }
  return (
    <span ref={composedRef} {...(handlerProps as object)} {...rest}>
      {children}
    </span>
  );
});

interface ContentProps extends HTMLAttributes<HTMLDivElement> {
  placement?: Placement;
  offset?: number;
}

const TooltipContent = forwardRef<HTMLDivElement, ContentProps>(function TooltipContent(
  { placement = "top", offset = 8, className, style, children, ...rest },
  ref,
) {
  const { open, triggerRef, contentId, setOpen } = useTooltip("Content");
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [mountState, setMountState] = useState<"closed" | "open">("closed");
  const position = usePosition({ triggerRef, contentRef, open, placement, offset });

  useEscape(open, () => setOpen(false));

  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => setMountState("open"));
      return () => cancelAnimationFrame(id);
    }
    setMountState("closed");
  }, [open]);

  if (!open) return null;

  return (
    <Portal>
      <div
        className="bui-tooltip-anchor"
        style={
          {
            "--bui-anchor-x": position ? `${position.x}px` : "0px",
            "--bui-anchor-y": position ? `${position.y}px` : "0px",
            visibility: position ? undefined : "hidden",
          } as React.CSSProperties
        }
      >
        <div
          ref={(node) => {
            contentRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }}
          id={contentId}
          role="tooltip"
          data-state={mountState}
          className={cx("bui-root bui-tooltip", className)}
          style={style}
          {...rest}
        >
          {children}
        </div>
      </div>
    </Portal>
  );
});

type TooltipComponent = typeof TooltipRoot & {
  Trigger: typeof TooltipTrigger;
  Content: typeof TooltipContent;
};

export const Tooltip = TooltipRoot as TooltipComponent;
Tooltip.Trigger = TooltipTrigger;
Tooltip.Content = TooltipContent;
