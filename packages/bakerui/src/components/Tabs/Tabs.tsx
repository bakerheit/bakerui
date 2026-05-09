import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { cx } from "../../utils/cx";
import "./Tabs.css";

export type TabsOrientation = "horizontal" | "vertical";

interface TabsContextValue {
  value: string;
  setValue: (next: string) => void;
  baseId: string;
  orientation: TabsOrientation;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs(component: string): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error(`<Tabs.${component}> must be used inside <Tabs>`);
  return ctx;
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: TabsOrientation;
}

export const TabsRoot = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    value: controlled,
    defaultValue,
    onValueChange,
    orientation = "horizontal",
    className,
    children,
    ...rest
  },
  ref,
) {
  const [internal, setInternal] = useState<string>(defaultValue ?? "");
  const value = controlled ?? internal;
  const baseId = useId();

  const setValue = useCallback(
    (next: string) => {
      if (controlled === undefined) setInternal(next);
      onValueChange?.(next);
    },
    [controlled, onValueChange],
  );

  const ctx = useMemo<TabsContextValue>(
    () => ({ value, setValue, baseId, orientation }),
    [value, setValue, baseId, orientation],
  );

  return (
    <TabsContext.Provider value={ctx}>
      <div
        ref={ref}
        className={cx(
          "bui-tabs",
          orientation === "vertical" && "bui-tabs--vertical",
          className,
        )}
        data-orientation={orientation}
        {...rest}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
});

const TabsList = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function TabsList({ className, children, onKeyDown, ...rest }, ref) {
    const { orientation } = useTabs("List");
    const listRef = useRef<HTMLDivElement | null>(null);
    const { value } = useTabs("List");

    // Slide the indicator under the active trigger.
    const [indicator, setIndicator] = useState<{ pos: number; size: number } | null>(null);

    useLayoutEffect(() => {
      const list = listRef.current;
      if (!list) return;
      const active = list.querySelector<HTMLElement>('[data-state="active"]');
      if (!active) {
        setIndicator(null);
        return;
      }
      if (orientation === "horizontal") {
        setIndicator({ pos: active.offsetLeft, size: active.offsetWidth });
      } else {
        setIndicator({ pos: active.offsetTop, size: active.offsetHeight });
      }
    }, [value, orientation]);

    const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;

      const triggers = Array.from(
        listRef.current?.querySelectorAll<HTMLElement>('[role="tab"]:not([aria-disabled="true"])') ?? [],
      );
      if (triggers.length === 0) return;

      const isHorizontal = orientation === "horizontal";
      const next = isHorizontal ? "ArrowRight" : "ArrowDown";
      const prev = isHorizontal ? "ArrowLeft" : "ArrowUp";

      const currentIdx = triggers.indexOf(document.activeElement as HTMLElement);
      let target: HTMLElement | undefined;
      if (event.key === next) {
        target = triggers[(currentIdx + 1) % triggers.length];
      } else if (event.key === prev) {
        target = triggers[(currentIdx - 1 + triggers.length) % triggers.length];
      } else if (event.key === "Home") {
        target = triggers[0];
      } else if (event.key === "End") {
        target = triggers[triggers.length - 1];
      }
      if (target) {
        event.preventDefault();
        target.focus();
        target.click(); // automatic activation — focus + select
      }
    };

    const composedRef = (node: HTMLDivElement | null) => {
      listRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    };

    return (
      <div
        ref={composedRef}
        role="tablist"
        aria-orientation={orientation}
        className={cx("bui-tabs__list", className)}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {children}
        <span
          className="bui-tabs__indicator"
          data-empty={indicator === null || undefined}
          aria-hidden
          style={
            indicator
              ? orientation === "horizontal"
                ? {
                    transform: `translateX(${indicator.pos}px)`,
                    width: `${indicator.size}px`,
                  }
                : {
                    transform: `translateY(${indicator.pos}px)`,
                    height: `${indicator.size}px`,
                  }
              : undefined
          }
        />
      </div>
    );
  },
);

interface TriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const TabsTrigger = forwardRef<HTMLButtonElement, TriggerProps>(function TabsTrigger(
  { value, disabled, onClick, className, children, ...rest },
  ref,
) {
  const ctx = useTabs("Trigger");
  const isActive = ctx.value === value;

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      id={`${ctx.baseId}-trigger-${value}`}
      aria-controls={`${ctx.baseId}-panel-${value}`}
      aria-selected={isActive}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      tabIndex={isActive ? 0 : -1}
      data-state={isActive ? "active" : "inactive"}
      data-value={value}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented && !disabled) ctx.setValue(value);
      }}
      className={cx("bui-tabs__trigger", className)}
      {...rest}
    >
      {children}
    </button>
  );
});

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  /** Keep the panel mounted even when inactive (just hidden). */
  keepMounted?: boolean;
}

const TabsPanel = forwardRef<HTMLDivElement, PanelProps>(function TabsPanel(
  { value, keepMounted, className, children, ...rest },
  ref,
) {
  const ctx = useTabs("Panel");
  const isActive = ctx.value === value;
  if (!isActive && !keepMounted) return null;
  return (
    <div
      ref={ref}
      role="tabpanel"
      id={`${ctx.baseId}-panel-${value}`}
      aria-labelledby={`${ctx.baseId}-trigger-${value}`}
      hidden={!isActive}
      tabIndex={0}
      className={cx("bui-tabs__panel", className)}
      {...rest}
    >
      {children}
    </div>
  );
});

type TabsComponent = typeof TabsRoot & {
  List: typeof TabsList;
  Trigger: typeof TabsTrigger;
  Panel: typeof TabsPanel;
};

export const Tabs = TabsRoot as TabsComponent;
Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Panel = TabsPanel;
