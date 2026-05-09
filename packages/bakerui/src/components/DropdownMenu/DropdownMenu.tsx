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
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { Portal } from "../../utils/portal";
import { useClickOutside } from "../../utils/useClickOutside";
import { useEscape } from "../../utils/useEscape";
import { usePosition, type Placement } from "../../utils/usePosition";
import { cx } from "../../utils/cx";
import { Slot } from "../Slot/Slot";
import "./DropdownMenu.css";

interface MenuContextValue {
  open: boolean;
  setOpen: (next: boolean) => void;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
  initialFocus: "first" | "last" | null;
  setInitialFocus: (v: "first" | "last" | null) => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenu(component: string): MenuContextValue {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error(`<DropdownMenu.${component}> must be used inside <DropdownMenu>`);
  return ctx;
}

export interface DropdownMenuProps {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export function DropdownMenuRoot({
  defaultOpen = false,
  open: controlled,
  onOpenChange,
  children,
}: DropdownMenuProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlled ?? internalOpen;
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [initialFocus, setInitialFocus] = useState<"first" | "last" | null>(null);

  const setOpen = useCallback(
    (next: boolean) => {
      if (controlled === undefined) setInternalOpen(next);
      onOpenChange?.(next);
      if (!next) setInitialFocus(null);
    },
    [controlled, onOpenChange],
  );

  const value = useMemo<MenuContextValue>(
    () => ({ open, setOpen, triggerRef, contentRef, initialFocus, setInitialFocus }),
    [open, setOpen, initialFocus],
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

interface TriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DropdownMenuTrigger = forwardRef<HTMLButtonElement, TriggerProps>(
  function DropdownMenuTrigger({ asChild, onClick, onKeyDown, ...rest }, ref) {
    const { open, setOpen, triggerRef, setInitialFocus } = useMenu("Trigger");

    const handleClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      setInitialFocus("first");
      setOpen(!open);
    };

    const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setInitialFocus("first");
        setOpen(true);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setInitialFocus("last");
        setOpen(true);
      }
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
          onKeyDown={handleKeyDown as unknown as (e: unknown) => void}
          aria-haspopup="menu"
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
        onKeyDown={handleKeyDown}
        aria-haspopup="menu"
        aria-expanded={open}
        {...rest}
      />
    );
  },
);

interface ContentProps extends HTMLAttributes<HTMLDivElement> {
  placement?: Placement;
  offset?: number;
}

const ITEM_SELECTOR = '[role="menuitem"]:not([aria-disabled="true"])';

const DropdownMenuContent = forwardRef<HTMLDivElement, ContentProps>(function DropdownMenuContent(
  { placement = "bottom-start", offset = 6, className, style, children, onKeyDown, ...rest },
  ref,
) {
  const { open, setOpen, triggerRef, contentRef, initialFocus } = useMenu("Content");
  const [mountState, setMountState] = useState<"closed" | "open">("closed");
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const typeaheadRef = useRef<{ buffer: string; timer: number | null }>({
    buffer: "",
    timer: null,
  });
  const position = usePosition({ triggerRef, contentRef, open, placement, offset });

  useEscape(open, () => {
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  });

  useClickOutside(open, [triggerRef as React.RefObject<HTMLElement>, contentRef as React.RefObject<HTMLElement>], () =>
    setOpen(false),
  );

  // Open animation + initial focus.
  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => {
        setMountState("open");
        const items = getItems();
        if (items.length === 0) {
          contentRef.current?.focus({ preventScroll: true });
          return;
        }
        const idx = initialFocus === "last" ? items.length - 1 : 0;
        setHighlightIndex(idx);
        items[idx]?.focus({ preventScroll: true });
      });
      return () => cancelAnimationFrame(id);
    }
    setMountState("closed");
    setHighlightIndex(-1);
  }, [open, initialFocus, contentRef]);

  const getItems = useCallback((): HTMLElement[] => {
    const node = contentRef.current;
    if (!node) return [];
    return Array.from(node.querySelectorAll<HTMLElement>(ITEM_SELECTOR));
  }, [contentRef]);

  const moveHighlight = useCallback(
    (delta: number, absolute?: "first" | "last") => {
      const items = getItems();
      if (items.length === 0) return;
      let next: number;
      if (absolute === "first") next = 0;
      else if (absolute === "last") next = items.length - 1;
      else {
        // Resolve current from the actually focused element so arrow keys
        // resume from wherever the pointer last hovered.
        const activeIdx = items.indexOf(document.activeElement as HTMLElement);
        const current = activeIdx >= 0 ? activeIdx : highlightIndex;
        next = (current + delta + items.length) % items.length;
      }
      setHighlightIndex(next);
      items[next]?.focus({ preventScroll: true });
    },
    [getItems, highlightIndex],
  );

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveHighlight(1);
        return;
      case "ArrowUp":
        event.preventDefault();
        moveHighlight(-1);
        return;
      case "Home":
        event.preventDefault();
        moveHighlight(0, "first");
        return;
      case "End":
        event.preventDefault();
        moveHighlight(0, "last");
        return;
      case "Tab":
        // Closing on Tab (per WAI menu pattern) and letting focus advance naturally.
        setOpen(false);
        return;
    }

    // Typeahead: single printable character
    if (event.key.length === 1 && /\S/.test(event.key)) {
      const cache = typeaheadRef.current;
      cache.buffer += event.key.toLowerCase();
      if (cache.timer !== null) window.clearTimeout(cache.timer);
      cache.timer = window.setTimeout(() => {
        cache.buffer = "";
        cache.timer = null;
      }, 500);

      const items = getItems();
      const activeIdx = items.indexOf(document.activeElement as HTMLElement);
      const startBase = activeIdx >= 0 ? activeIdx : highlightIndex;
      const start = startBase >= 0 ? startBase + 1 : 0;
      const ordered = [...items.slice(start), ...items.slice(0, start)];
      const match = ordered.find((el) =>
        (el.textContent ?? "").trim().toLowerCase().startsWith(cache.buffer),
      );
      if (match) {
        const matchIndex = items.indexOf(match);
        setHighlightIndex(matchIndex);
        match.focus({ preventScroll: true });
      }
    }
  };

  if (!open) return null;

  return (
    <Portal>
      <div
        className="bui-menu-anchor"
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
          role="menu"
          tabIndex={-1}
          data-state={mountState}
          data-placement={position?.placement}
          className={cx("bui-root bui-menu", className)}
          style={style}
          onKeyDown={handleKeyDown}
          {...rest}
        >
          {children}
        </div>
      </div>
    </Portal>
  );
});

interface ItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onSelect"> {
  /** Called when the item is selected (clicked or activated by keyboard). Call event.preventDefault to prevent the menu from closing. */
  onSelect?: (event: Event) => void;
  destructive?: boolean;
}

const DropdownMenuItem = forwardRef<HTMLButtonElement, ItemProps>(function DropdownMenuItem(
  { onSelect, onClick, onKeyDown, onPointerMove, onPointerLeave, destructive, disabled, className, children, ...rest },
  ref,
) {
  const { setOpen, triggerRef, contentRef } = useMenu("Item");

  const select = useCallback(
    (sourceEvent: ReactMouseEvent | ReactKeyboardEvent) => {
      if (disabled) return;
      const native = new Event("select", { cancelable: true });
      onSelect?.(native);
      // Always run the supplied click handler too.
      if ("button" in sourceEvent) {
        // Mouse event already invoked onClick above.
      }
      if (!native.defaultPrevented) {
        setOpen(false);
        triggerRef.current?.focus({ preventScroll: true });
      }
    },
    [disabled, onSelect, setOpen, triggerRef],
  );

  const handleClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || disabled) return;
    select(event);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      select(event);
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    onPointerMove?.(event);
    if (event.defaultPrevented || disabled) return;
    // Focus follows the pointer so keyboard and mouse navigation share state.
    if (document.activeElement !== event.currentTarget) {
      event.currentTarget.focus({ preventScroll: true });
    }
  };

  const handlePointerLeave = (event: React.PointerEvent<HTMLButtonElement>) => {
    onPointerLeave?.(event);
    if (event.defaultPrevented) return;
    // When the pointer leaves the item but stays inside the menu, drop focus
    // back to the menu container so no item appears highlighted until the
    // user hovers another or arrows around.
    if (document.activeElement === event.currentTarget) {
      contentRef.current?.focus({ preventScroll: true });
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      role="menuitem"
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cx(
        "bui-menu__item",
        destructive && "bui-menu__item--destructive",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
});

const DropdownMenuLabel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function DropdownMenuLabel({ className, ...rest }, ref) {
    return <div ref={ref} aria-hidden className={cx("bui-menu__label", className)} {...rest} />;
  },
);

const DropdownMenuSeparator = forwardRef<HTMLHRElement, HTMLAttributes<HTMLHRElement>>(
  function DropdownMenuSeparator({ className, ...rest }, ref) {
    return <hr ref={ref} role="separator" className={cx("bui-menu__separator", className)} {...rest} />;
  },
);

type DropdownMenuComponent = typeof DropdownMenuRoot & {
  Trigger: typeof DropdownMenuTrigger;
  Content: typeof DropdownMenuContent;
  Item: typeof DropdownMenuItem;
  Label: typeof DropdownMenuLabel;
  Separator: typeof DropdownMenuSeparator;
};

export const DropdownMenu = DropdownMenuRoot as DropdownMenuComponent;
DropdownMenu.Trigger = DropdownMenuTrigger;
DropdownMenu.Content = DropdownMenuContent;
DropdownMenu.Item = DropdownMenuItem;
DropdownMenu.Label = DropdownMenuLabel;
DropdownMenu.Separator = DropdownMenuSeparator;
