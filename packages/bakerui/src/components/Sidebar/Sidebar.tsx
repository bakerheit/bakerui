import {
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { cx } from "../../utils/cx";
import { composeRefs } from "../../utils/useComposedRefs";
import { Slot } from "../Slot/Slot";
import "./Sidebar.css";

export type SidebarPosition = "left" | "right";

interface SidebarContextValue {
  open: boolean;
  setOpen: (next: boolean) => void;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

function useSidebarContext(): SidebarContextValue | null {
  return useContext(SidebarContext);
}

export interface SidebarProviderProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

function SidebarProvider({
  open: controlledOpen,
  defaultOpen = true,
  onOpenChange,
  children,
}: SidebarProviderProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );

  const toggle = useCallback(() => setOpen(!open), [open, setOpen]);

  const value = useMemo<SidebarContextValue>(
    () => ({ open, setOpen, toggle }),
    [open, setOpen, toggle],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  /** Which side of the layout the sidebar sits on. Affects only its border. */
  position?: SidebarPosition;
  /** Width in px (number) or any CSS length. Default 240px. */
  width?: number | string;
  /** Controlled open state. Use this if no Sidebar.Provider wraps the tree. */
  open?: boolean;
  /** Initial open state for uncontrolled use. */
  defaultOpen?: boolean;
  /** Fired when the sidebar opens or closes. */
  onOpenChange?: (open: boolean) => void;
}

export const SidebarRoot = forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  {
    position = "left",
    width,
    open: openProp,
    defaultOpen,
    onOpenChange,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const ctx = useSidebarContext();

  // Local state, used when neither a provider nor `open` prop is passed.
  const [localOpen, setLocalOpen] = useState(defaultOpen ?? true);

  const open = ctx?.open ?? openProp ?? localOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (ctx) {
        ctx.setOpen(next);
        return;
      }
      if (openProp === undefined) setLocalOpen(next);
      onOpenChange?.(next);
    },
    [ctx, openProp, onOpenChange],
  );

  const widthValue =
    width === undefined
      ? undefined
      : typeof width === "number"
        ? `${width}px`
        : width;
  const mergedStyle: CSSProperties = widthValue
    ? { ...(style ?? {}), ["--bui-sidebar-width" as string]: widthValue }
    : (style ?? {});

  // Provide context to descendants if no upstream provider exists, so a
  // `Sidebar.Trigger` rendered inside the sidebar still works.
  const inner = (
    <aside
      ref={ref}
      id="bui-sidebar"
      className={cx("bui-sidebar", `bui-sidebar--${position}`, className)}
      data-state={open ? "open" : "closed"}
      style={mergedStyle}
      {...rest}
    >
      <div className="bui-sidebar__inner">{children}</div>
    </aside>
  );

  if (ctx) return inner;

  const value: SidebarContextValue = {
    open,
    setOpen,
    toggle: () => setOpen(!open),
  };
  return <SidebarContext.Provider value={value}>{inner}</SidebarContext.Provider>;
});

const SidebarHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function SidebarHeader({ className, ...rest }, ref) {
    return <div ref={ref} className={cx("bui-sidebar__header", className)} {...rest} />;
  },
);

const SidebarBody = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
  function SidebarBody({ className, ...rest }, ref) {
    return (
      <nav
        ref={ref as React.Ref<HTMLElement>}
        className={cx("bui-sidebar__body", className)}
        {...rest}
      />
    );
  },
);

const SidebarFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function SidebarFooter({ className, ...rest }, ref) {
    return <div ref={ref} className={cx("bui-sidebar__footer", className)} {...rest} />;
  },
);

interface SidebarGroupProps extends HTMLAttributes<HTMLDivElement> {
  label?: ReactNode;
}

const SidebarGroup = forwardRef<HTMLDivElement, SidebarGroupProps>(function SidebarGroup(
  { label, className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} className={cx("bui-sidebar__group", className)} {...rest}>
      {label && <div className="bui-sidebar__group-label">{label}</div>}
      {children}
    </div>
  );
});

const SidebarSeparator = forwardRef<HTMLHRElement, HTMLAttributes<HTMLHRElement>>(
  function SidebarSeparator({ className, ...rest }, ref) {
    return <hr ref={ref} className={cx("bui-sidebar__separator", className)} {...rest} />;
  },
);

interface SidebarItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  /** Icon rendered to the left of the label. */
  icon?: ReactNode;
  /** Trailing content (e.g., a Badge or shortcut hint). */
  trailing?: ReactNode;
  /** Render the underlying element as the provided child (e.g., an <a> link). */
  asChild?: boolean;
}

const SidebarItem = forwardRef<HTMLButtonElement, SidebarItemProps>(function SidebarItem(
  { active, icon, trailing, asChild, className, disabled, children, ...rest },
  ref,
) {
  const itemClass = cx(
    "bui-sidebar__item",
    active && "bui-sidebar__item--active",
    className,
  );
  const ariaCurrent = active ? "page" : undefined;
  const content = (
    <ItemContent icon={icon} trailing={trailing}>
      {asChild && isValidElement(children)
        ? (children.props as { children?: ReactNode }).children
        : children}
    </ItemContent>
  );

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{
      className?: string;
      children?: ReactNode;
    }> & { ref?: Ref<HTMLElement> };
    return cloneElement(
      child,
      {
        className: cx(itemClass, child.props.className),
        "aria-current": ariaCurrent,
        "aria-disabled": disabled || undefined,
        ref: composeRefs(ref as Ref<HTMLElement>, child.ref),
        ...rest,
      } as Record<string, unknown>,
      content,
    );
  }

  return (
    <button
      ref={ref}
      type="button"
      className={itemClass}
      aria-current={ariaCurrent}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      {...rest}
    >
      {content}
    </button>
  );
});

function ItemContent({
  icon,
  trailing,
  children,
}: {
  icon?: ReactNode;
  trailing?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <>
      {icon && <span className="bui-sidebar__item-icon" aria-hidden>{icon}</span>}
      <span className="bui-sidebar__item-label">{children}</span>
      {trailing && <span className="bui-sidebar__item-trailing">{trailing}</span>}
    </>
  );
}

interface SidebarTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Render as the supplied child element (e.g., a custom Button). */
  asChild?: boolean;
  /** Override the default hamburger icon. */
  children?: ReactNode;
}

const SidebarTrigger = forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  function SidebarTrigger({ asChild, onClick, children, className, ...rest }, ref) {
    const ctx = useSidebarContext();
    if (!ctx) {
      throw new Error(
        "<Sidebar.Trigger> must be rendered inside a <Sidebar.Provider> or a <Sidebar> that owns the open state.",
      );
    }
    const { open, toggle } = ctx;

    const handleClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) toggle();
    };

    if (asChild) {
      return (
        <Slot
          ref={ref as unknown as Ref<HTMLElement>}
          onClick={handleClick as unknown as (e: unknown) => void}
          aria-expanded={open}
          aria-controls="bui-sidebar"
          aria-label={open ? "Hide sidebar" : "Show sidebar"}
          className={className}
          {...rest}
        />
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        aria-expanded={open}
        aria-controls="bui-sidebar"
        aria-label={open ? "Hide sidebar" : "Show sidebar"}
        className={cx("bui-sidebar-trigger", className)}
        {...rest}
      >
        {children ?? <HamburgerIcon open={open} />}
      </button>
    );
  },
);

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M3 5h12" />
      <path d={open ? "M3 9h12" : "M3 9h12"} />
      <path d="M3 13h12" />
      {/* The icon is the same in both states; aria-label conveys the change. */}
    </svg>
  );
}

type SidebarComponent = typeof SidebarRoot & {
  Provider: typeof SidebarProvider;
  Trigger: typeof SidebarTrigger;
  Header: typeof SidebarHeader;
  Body: typeof SidebarBody;
  Footer: typeof SidebarFooter;
  Group: typeof SidebarGroup;
  Item: typeof SidebarItem;
  Separator: typeof SidebarSeparator;
};

export const Sidebar = SidebarRoot as SidebarComponent;
Sidebar.Provider = SidebarProvider;
Sidebar.Trigger = SidebarTrigger;
Sidebar.Header = SidebarHeader;
Sidebar.Body = SidebarBody;
Sidebar.Footer = SidebarFooter;
Sidebar.Group = SidebarGroup;
Sidebar.Item = SidebarItem;
Sidebar.Separator = SidebarSeparator;

export { useSidebarContext };
