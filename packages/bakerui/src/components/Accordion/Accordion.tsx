import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { cx } from "../../utils/cx";
import "./Accordion.css";

export type AccordionType = "single" | "multiple";

interface AccordionContextValue {
  type: AccordionType;
  value: string[];
  toggle: (value: string) => void;
  rootRef: React.MutableRefObject<HTMLDivElement | null>;
  baseId: string;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordion(component: string): AccordionContextValue {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error(`<Accordion.${component}> must be used inside <Accordion>`);
  return ctx;
}

interface ItemContextValue {
  value: string;
  open: boolean;
  triggerId: string;
  contentId: string;
}

const ItemContext = createContext<ItemContextValue | null>(null);

function useItem(component: string): ItemContextValue {
  const ctx = useContext(ItemContext);
  if (!ctx)
    throw new Error(`<Accordion.${component}> must be used inside <Accordion.Item>`);
  return ctx;
}

interface AccordionBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Whether the user can open one or many items. */
  type?: AccordionType;
  /** When type="single", allow toggling the open item closed. */
  collapsible?: boolean;
  children: ReactNode;
}

interface SingleProps extends AccordionBaseProps {
  type?: "single";
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

interface MultipleProps extends AccordionBaseProps {
  type: "multiple";
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

export type AccordionProps = SingleProps | MultipleProps;

export const AccordionRoot = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  props,
  ref,
) {
  const {
    type = "single",
    collapsible = true,
    className,
    children,
    ...rest
  } = props as AccordionBaseProps & {
    value?: string | string[];
    defaultValue?: string | string[];
    onValueChange?: (value: string | string[]) => void;
  };

  const controlled = (props as { value?: string | string[] }).value;
  const defaultValue = (props as { defaultValue?: string | string[] }).defaultValue;
  const onValueChange = (props as { onValueChange?: (v: string | string[]) => void }).onValueChange;

  const initial: string[] =
    type === "single"
      ? defaultValue
        ? [defaultValue as string]
        : []
      : ((defaultValue as string[]) ?? []);
  const [internal, setInternal] = useState<string[]>(initial);

  const value: string[] =
    controlled !== undefined
      ? type === "single"
        ? controlled
          ? [controlled as string]
          : []
        : (controlled as string[])
      : internal;

  const setValue = useCallback(
    (next: string[]) => {
      if (controlled === undefined) setInternal(next);
      if (type === "single") {
        onValueChange?.(next[0] ?? "");
      } else {
        onValueChange?.(next);
      }
    },
    [controlled, onValueChange, type],
  );

  const toggle = useCallback(
    (v: string) => {
      const isOpen = value.includes(v);
      if (type === "single") {
        if (isOpen) {
          if (collapsible) setValue([]);
        } else {
          setValue([v]);
        }
      } else {
        setValue(isOpen ? value.filter((x) => x !== v) : [...value, v]);
      }
    },
    [value, setValue, type, collapsible],
  );

  const rootRef = useRef<HTMLDivElement | null>(null);
  const baseId = useId();

  const ctx = useMemo<AccordionContextValue>(
    () => ({ type, value, toggle, rootRef, baseId }),
    [type, value, toggle, baseId],
  );

  const composedRef = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  return (
    <AccordionContext.Provider value={ctx}>
      <div ref={composedRef} className={cx("bui-accordion", className)} {...rest}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
});

interface ItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

const AccordionItem = forwardRef<HTMLDivElement, ItemProps>(function AccordionItem(
  { value, className, children, ...rest },
  ref,
) {
  const acc = useAccordion("Item");
  const open = acc.value.includes(value);
  const itemCtx = useMemo<ItemContextValue>(
    () => ({
      value,
      open,
      triggerId: `${acc.baseId}-trigger-${value}`,
      contentId: `${acc.baseId}-content-${value}`,
    }),
    [value, open, acc.baseId],
  );
  return (
    <ItemContext.Provider value={itemCtx}>
      <div
        ref={ref}
        className={cx("bui-accordion__item", className)}
        data-state={open ? "open" : "closed"}
        {...rest}
      >
        {children}
      </div>
    </ItemContext.Provider>
  );
});

const AccordionTrigger = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function AccordionTrigger({ className, onClick, onKeyDown, children, ...rest }, ref) {
    const acc = useAccordion("Trigger");
    const item = useItem("Trigger");

    const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      const root = acc.rootRef.current;
      if (!root) return;
      const triggers = Array.from(
        root.querySelectorAll<HTMLButtonElement>(".bui-accordion__trigger:not([disabled])"),
      );
      const idx = triggers.indexOf(event.currentTarget);
      let target: HTMLButtonElement | undefined;
      if (event.key === "ArrowDown") {
        target = triggers[(idx + 1) % triggers.length];
      } else if (event.key === "ArrowUp") {
        target = triggers[(idx - 1 + triggers.length) % triggers.length];
      } else if (event.key === "Home") {
        target = triggers[0];
      } else if (event.key === "End") {
        target = triggers[triggers.length - 1];
      }
      if (target) {
        event.preventDefault();
        target.focus();
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        id={item.triggerId}
        aria-expanded={item.open}
        aria-controls={item.contentId}
        data-state={item.open ? "open" : "closed"}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) acc.toggle(item.value);
        }}
        onKeyDown={handleKeyDown}
        className={cx("bui-accordion__trigger", className)}
        {...rest}
      >
        <span>{children}</span>
        <svg
          className="bui-accordion__chevron"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>
    );
  },
);

const AccordionContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function AccordionContent({ className, children, ...rest }, ref) {
    const item = useItem("Content");
    return (
      <div
        ref={ref}
        role="region"
        id={item.contentId}
        aria-labelledby={item.triggerId}
        data-state={item.open ? "open" : "closed"}
        className={cx("bui-accordion__content", className)}
        {...rest}
      >
        <div className="bui-accordion__content-inner">
          <div>{children}</div>
        </div>
      </div>
    );
  },
);

type AccordionComponent = typeof AccordionRoot & {
  Item: typeof AccordionItem;
  Trigger: typeof AccordionTrigger;
  Content: typeof AccordionContent;
};

export const Accordion = AccordionRoot as AccordionComponent;
Accordion.Item = AccordionItem;
Accordion.Trigger = AccordionTrigger;
Accordion.Content = AccordionContent;
