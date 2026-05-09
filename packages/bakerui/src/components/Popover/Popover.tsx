import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { Portal } from "../../utils/portal";
import { useEscape } from "../../utils/useEscape";
import { useClickOutside } from "../../utils/useClickOutside";
import { usePosition, type Placement } from "../../utils/usePosition";
import { cx } from "../../utils/cx";
import { Slot } from "../Slot/Slot";
import "./Popover.css";

interface PopoverContextValue {
  open: boolean;
  setOpen: (next: boolean) => void;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopover(component: string): PopoverContextValue {
  const ctx = useContext(PopoverContext);
  if (!ctx) throw new Error(`<Popover.${component}> must be used inside <Popover>`);
  return ctx;
}

export interface PopoverProps {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export function PopoverRoot({
  defaultOpen = false,
  open: controlled,
  onOpenChange,
  children,
}: PopoverProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlled ?? internalOpen;
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const setOpen = useCallback(
    (next: boolean) => {
      if (controlled === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [controlled, onOpenChange],
  );

  const value = useMemo<PopoverContextValue>(
    () => ({ open, setOpen, triggerRef, contentRef }),
    [open, setOpen],
  );

  return <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>;
}

interface TriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const PopoverTrigger = forwardRef<HTMLButtonElement, TriggerProps>(function PopoverTrigger(
  { asChild, onClick, ...rest },
  ref,
) {
  const { open, setOpen, triggerRef } = usePopover("Trigger");
  const handleClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) setOpen(!open);
  };
  const composedRef = useCallback(
    (node: HTMLButtonElement | null) => {
      triggerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
    },
    [ref, triggerRef],
  );
  if (asChild) {
    return (
      <Slot
        ref={composedRef as unknown as React.Ref<HTMLElement>}
        onClick={handleClick as unknown as (e: unknown) => void}
        aria-haspopup="dialog"
        aria-expanded={open}
        {...rest}
      />
    );
  }
  return (
    <button
      ref={composedRef}
      type="button"
      onClick={handleClick}
      aria-haspopup="dialog"
      aria-expanded={open}
      {...rest}
    />
  );
});

interface ContentProps extends HTMLAttributes<HTMLDivElement> {
  placement?: Placement;
  offset?: number;
}

const PopoverContent = forwardRef<HTMLDivElement, ContentProps>(function PopoverContent(
  { placement = "bottom", offset = 8, className, style, children, ...rest },
  ref,
) {
  const { open, setOpen, triggerRef, contentRef } = usePopover("Content");
  const [mountState, setMountState] = useState<"closed" | "open">("closed");
  const position = usePosition({ triggerRef, contentRef, open, placement, offset });

  useEscape(open, () => {
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  });

  useClickOutside(open, [triggerRef as React.RefObject<HTMLElement>, contentRef as React.RefObject<HTMLElement>], () => setOpen(false));

  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => setMountState("open"));
      // Move focus to the content (or first focusable inside).
      const node = contentRef.current;
      if (node) {
        const focusable = node.querySelector<HTMLElement>(
          "[data-bui-autofocus], button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
        );
        (focusable ?? node).focus({ preventScroll: true });
      }
      return () => cancelAnimationFrame(id);
    }
    setMountState("closed");
  }, [open, contentRef]);

  if (!open) return null;

  return (
    <Portal>
      <div
        className="bui-popover-anchor"
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
          role="dialog"
          tabIndex={-1}
          data-state={mountState}
          data-placement={position?.placement}
          className={cx("bui-root bui-popover", className)}
          style={style}
          {...rest}
        >
          {children}
        </div>
      </div>
    </Portal>
  );
});

const PopoverClose = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }>(
  function PopoverClose({ asChild, onClick, ...rest }, ref) {
    const { setOpen, triggerRef } = usePopover("Close");
    const handleClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) {
        setOpen(false);
        triggerRef.current?.focus({ preventScroll: true });
      }
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
  },
);

type PopoverComponent = typeof PopoverRoot & {
  Trigger: typeof PopoverTrigger;
  Content: typeof PopoverContent;
  Close: typeof PopoverClose;
};

export const Popover = PopoverRoot as PopoverComponent;
Popover.Trigger = PopoverTrigger;
Popover.Content = PopoverContent;
Popover.Close = PopoverClose;
