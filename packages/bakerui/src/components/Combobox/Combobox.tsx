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
  type InputHTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { Portal } from "../../utils/portal";
import { useEscape } from "../../utils/useEscape";
import { useClickOutside } from "../../utils/useClickOutside";
import { usePosition, type Placement } from "../../utils/usePosition";
import { cx } from "../../utils/cx";
import "./Combobox.css";

interface ComboboxContextValue {
  value: string | null;
  setValue: (next: string | null) => void;
  query: string;
  setQuery: (next: string) => void;
  open: boolean;
  setOpen: (next: boolean) => void;
  highlight: string | null;
  setHighlight: (next: string | null) => void;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  listRef: React.MutableRefObject<HTMLDivElement | null>;
  baseId: string;
  /** Tracks the displayed label for the selected value (used by Trigger). */
  selectedLabel: string | null;
  registerLabel: (value: string, label: string) => () => void;
}

const ComboboxContext = createContext<ComboboxContextValue | null>(null);

function useCombobox(component: string): ComboboxContextValue {
  const ctx = useContext(ComboboxContext);
  if (!ctx) throw new Error(`<Combobox.${component}> must be used inside <Combobox>`);
  return ctx;
}

export interface ComboboxProps {
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export function ComboboxRoot({
  value: controlledValue,
  defaultValue = null,
  onValueChange,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}: ComboboxProps) {
  const [internalValue, setInternalValue] = useState<string | null>(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;

  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState<string | null>(null);
  const baseId = useId();

  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // Items register their value→label mapping so the Trigger can render the
  // selected label without the consumer having to pass it twice.
  const labelMap = useRef(new Map<string, string>());
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const registerLabel = useCallback(
    (val: string, label: string): (() => void) => {
      labelMap.current.set(val, label);
      if (value === val) setSelectedLabel(label);
      return () => {
        labelMap.current.delete(val);
      };
    },
    [value],
  );

  useEffect(() => {
    setSelectedLabel(value !== null ? (labelMap.current.get(value) ?? value) : null);
  }, [value]);

  const setValue = useCallback(
    (next: string | null) => {
      if (controlledValue === undefined) setInternalValue(next);
      onValueChange?.(next);
    },
    [controlledValue, onValueChange],
  );

  const setOpen = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) setInternalOpen(next);
      onOpenChange?.(next);
      if (!next) {
        setQuery("");
        setHighlight(null);
      }
    },
    [controlledOpen, onOpenChange],
  );

  const ctx = useMemo<ComboboxContextValue>(
    () => ({
      value,
      setValue,
      query,
      setQuery,
      open,
      setOpen,
      highlight,
      setHighlight,
      triggerRef,
      contentRef,
      inputRef,
      listRef,
      baseId,
      selectedLabel,
      registerLabel,
    }),
    [value, setValue, query, open, setOpen, highlight, baseId, selectedLabel, registerLabel],
  );

  return <ComboboxContext.Provider value={ctx}>{children}</ComboboxContext.Provider>;
}

interface TriggerProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  placeholder?: string;
}

const ComboboxTrigger = forwardRef<HTMLButtonElement, TriggerProps>(function ComboboxTrigger(
  { placeholder = "Select…", onClick, className, children, ...rest },
  ref,
) {
  const ctx = useCombobox("Trigger");
  const composedRef = useCallback(
    (node: HTMLButtonElement | null) => {
      ctx.triggerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
    },
    [ref, ctx.triggerRef],
  );

  const handleClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    ctx.setOpen(!ctx.open);
  };

  return (
    <button
      ref={composedRef}
      type="button"
      role="combobox"
      aria-expanded={ctx.open}
      aria-controls={`${ctx.baseId}-list`}
      aria-haspopup="listbox"
      onClick={handleClick}
      className={cx(
        "bui-combobox-trigger",
        ctx.value === null && "bui-combobox-trigger--empty",
        className,
      )}
      {...rest}
    >
      <span className="bui-combobox-trigger__label">
        {children ?? ctx.selectedLabel ?? placeholder}
      </span>
      <span className="bui-combobox-trigger__chevron" aria-hidden>
        <ChevronIcon />
      </span>
    </button>
  );
});

interface ContentProps extends HTMLAttributes<HTMLDivElement> {
  placement?: Placement;
  /** Match the trigger's width. Default true. */
  matchTriggerWidth?: boolean;
}

const ComboboxContent = forwardRef<HTMLDivElement, ContentProps>(function ComboboxContent(
  { placement = "bottom-start", matchTriggerWidth = true, className, style, children, ...rest },
  ref,
) {
  const ctx = useCombobox("Content");
  const [mountState, setMountState] = useState<"closed" | "open">("closed");
  const position = usePosition({
    triggerRef: ctx.triggerRef,
    contentRef: ctx.contentRef,
    open: ctx.open,
    placement,
    offset: 4,
  });

  // Match trigger width when requested.
  const [triggerWidth, setTriggerWidth] = useState<number | null>(null);
  useEffect(() => {
    if (!ctx.open || !matchTriggerWidth) return;
    const node = ctx.triggerRef.current;
    if (!node) return;
    setTriggerWidth(node.getBoundingClientRect().width);
  }, [ctx.open, matchTriggerWidth, ctx.triggerRef]);

  useEscape(ctx.open, () => {
    ctx.setOpen(false);
    ctx.triggerRef.current?.focus({ preventScroll: true });
  });

  useClickOutside(
    ctx.open,
    [ctx.triggerRef as React.RefObject<HTMLElement>, ctx.contentRef as React.RefObject<HTMLElement>],
    () => ctx.setOpen(false),
  );

  // Open animation + initial focus on input.
  useEffect(() => {
    if (ctx.open) {
      const id = requestAnimationFrame(() => {
        setMountState("open");
        ctx.inputRef.current?.focus({ preventScroll: true });
      });
      return () => cancelAnimationFrame(id);
    }
    setMountState("closed");
  }, [ctx.open, ctx.inputRef]);

  if (!ctx.open) return null;

  return (
    <Portal>
      <div
        className="bui-combobox-anchor"
        style={
          {
            "--bui-anchor-x": position ? `${position.x}px` : "0px",
            "--bui-anchor-y": position ? `${position.y}px` : "0px",
            visibility: position ? undefined : "hidden",
            width: matchTriggerWidth && triggerWidth ? `${triggerWidth}px` : undefined,
          } as React.CSSProperties
        }
      >
        <div
          ref={(node) => {
            ctx.contentRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }}
          data-state={mountState}
          className={cx("bui-root bui-combobox-content", className)}
          style={style}
          {...rest}
        >
          {children}
        </div>
      </div>
    </Portal>
  );
});

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {}

const ComboboxInput = forwardRef<HTMLInputElement, InputProps>(function ComboboxInput(
  { placeholder = "Search…", onKeyDown, className, ...rest },
  ref,
) {
  const ctx = useCombobox("Input");
  const composedRef = useCallback(
    (node: HTMLInputElement | null) => {
      ctx.inputRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
    },
    [ref, ctx.inputRef],
  );

  // Reset highlight when query changes — pick the first visible item.
  useEffect(() => {
    if (!ctx.open) return;
    const list = ctx.listRef.current;
    if (!list) return;
    const first = list.querySelector<HTMLElement>('[role="option"]:not([data-disabled="true"])');
    ctx.setHighlight(first ? first.dataset.value ?? null : null);
  }, [ctx.query, ctx.open]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    const list = ctx.listRef.current;
    if (!list) return;
    const items = Array.from(
      list.querySelectorAll<HTMLElement>('[role="option"]:not([data-disabled="true"])'),
    );
    if (items.length === 0 && event.key !== "Escape" && event.key !== "Tab") return;

    const currentIdx = items.findIndex((el) => el.dataset.value === ctx.highlight);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = items[(currentIdx + 1 + items.length) % items.length];
      if (next) {
        ctx.setHighlight(next.dataset.value ?? null);
        next.scrollIntoView({ block: "nearest" });
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const prev = items[(currentIdx - 1 + items.length) % items.length];
      if (prev) {
        ctx.setHighlight(prev.dataset.value ?? null);
        prev.scrollIntoView({ block: "nearest" });
      }
    } else if (event.key === "Home") {
      event.preventDefault();
      const first = items[0];
      if (first) ctx.setHighlight(first.dataset.value ?? null);
    } else if (event.key === "End") {
      event.preventDefault();
      const last = items[items.length - 1];
      if (last) ctx.setHighlight(last.dataset.value ?? null);
    } else if (event.key === "Enter" && ctx.highlight !== null) {
      event.preventDefault();
      ctx.setValue(ctx.highlight);
      ctx.setOpen(false);
      ctx.triggerRef.current?.focus({ preventScroll: true });
    } else if (event.key === "Tab") {
      ctx.setOpen(false);
    }
  };

  return (
    <div className="bui-combobox-input-wrapper">
      <span className="bui-combobox-input-wrapper__icon" aria-hidden>
        <SearchIcon />
      </span>
      <input
        ref={composedRef}
        type="text"
        role="combobox"
        autoComplete="off"
        aria-autocomplete="list"
        aria-controls={`${ctx.baseId}-list`}
        aria-activedescendant={
          ctx.highlight !== null ? `${ctx.baseId}-item-${ctx.highlight}` : undefined
        }
        value={ctx.query}
        onChange={(e) => ctx.setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cx("bui-combobox-input", className)}
        {...rest}
      />
    </div>
  );
});

const ComboboxList = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ComboboxList({ className, children, ...rest }, ref) {
    const ctx = useCombobox("List");
    const composedRef = useCallback(
      (node: HTMLDivElement | null) => {
        ctx.listRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      },
      [ref, ctx.listRef],
    );
    return (
      <div
        ref={composedRef}
        role="listbox"
        id={`${ctx.baseId}-list`}
        className={cx("bui-combobox-list", className)}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

interface ItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  value: string;
  /** Additional searchable terms (in addition to the visible children). */
  keywords?: string[];
  disabled?: boolean;
  onSelect?: (value: string) => void;
}

const ComboboxItem = forwardRef<HTMLDivElement, ItemProps>(function ComboboxItem(
  { value, keywords, disabled, onSelect, onClick, onPointerMove, className, children, ...rest },
  ref,
) {
  const ctx = useCombobox("Item");

  // Register this item's label so the Trigger can render it.
  const labelText =
    typeof children === "string"
      ? children
      : typeof children === "number"
        ? String(children)
        : value;
  useEffect(() => {
    return ctx.registerLabel(value, labelText);
  }, [value, labelText, ctx.registerLabel]);

  // Filter against query (substring, case-insensitive).
  const haystack = (labelText + " " + (keywords ?? []).join(" ")).toLowerCase();
  const needle = ctx.query.trim().toLowerCase();
  const matches = needle.length === 0 || haystack.includes(needle);
  if (!matches) return null;

  const isSelected = ctx.value === value;
  const isHighlighted = ctx.highlight === value;
  const id = `${ctx.baseId}-item-${value}`;

  const handleClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || disabled) return;
    onSelect?.(value);
    ctx.setValue(value);
    ctx.setOpen(false);
    ctx.triggerRef.current?.focus({ preventScroll: true });
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    if (event.defaultPrevented || disabled) return;
    if (ctx.highlight !== value) ctx.setHighlight(value);
  };

  return (
    <div
      ref={ref}
      role="option"
      id={id}
      data-value={value}
      data-highlighted={isHighlighted || undefined}
      data-selected={isSelected || undefined}
      data-disabled={disabled || undefined}
      aria-selected={isSelected}
      onClick={handleClick}
      onPointerMove={handlePointerMove}
      className={cx("bui-combobox-item", className)}
      {...rest}
    >
      <span className="bui-combobox-item__check" aria-hidden>
        {isSelected && <CheckIcon />}
      </span>
      <span className="bui-combobox-item__label">{children}</span>
    </div>
  );
});

const ComboboxEmpty = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ComboboxEmpty({ className, children, ...rest }, ref) {
    const ctx = useCombobox("Empty");
    // Show only when query yields zero matches. Inspect the list DOM after render.
    const [hasMatches, setHasMatches] = useState(true);
    useEffect(() => {
      const list = ctx.listRef.current;
      if (!list) return;
      const items = list.querySelectorAll('[role="option"]');
      setHasMatches(items.length > 0);
    });

    if (hasMatches) return null;
    return (
      <div ref={ref} className={cx("bui-combobox-empty", className)} {...rest}>
        {children ?? "No results."}
      </div>
    );
  },
);

interface GroupProps extends HTMLAttributes<HTMLDivElement> {
  label?: ReactNode;
}

const ComboboxGroup = forwardRef<HTMLDivElement, GroupProps>(function ComboboxGroup(
  { label, className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role="group"
      className={cx("bui-combobox-group", className)}
      {...rest}
    >
      {label && <div className="bui-combobox-group__label">{label}</div>}
      {children}
    </div>
  );
});

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 5.5L7 9l3.5-3.5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="6" cy="6" r="4" />
      <path d="M9.5 9.5L12 12" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2.5 7.5l2.8 2.8L11.5 4" />
    </svg>
  );
}

type ComboboxComponent = typeof ComboboxRoot & {
  Trigger: typeof ComboboxTrigger;
  Content: typeof ComboboxContent;
  Input: typeof ComboboxInput;
  List: typeof ComboboxList;
  Item: typeof ComboboxItem;
  Empty: typeof ComboboxEmpty;
  Group: typeof ComboboxGroup;
};

export const Combobox = ComboboxRoot as ComboboxComponent;
Combobox.Trigger = ComboboxTrigger;
Combobox.Content = ComboboxContent;
Combobox.Input = ComboboxInput;
Combobox.List = ComboboxList;
Combobox.Item = ComboboxItem;
Combobox.Empty = ComboboxEmpty;
Combobox.Group = ComboboxGroup;
