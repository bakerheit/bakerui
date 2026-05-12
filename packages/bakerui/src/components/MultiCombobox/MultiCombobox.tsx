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
  type InputHTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { Badge } from "../Badge";
import { Portal } from "../../utils/portal";
import { useEscape } from "../../utils/useEscape";
import { useClickOutside } from "../../utils/useClickOutside";
import { usePosition, type Placement } from "../../utils/usePosition";
import { cx } from "../../utils/cx";
import "./MultiCombobox.css";

interface MultiComboboxContextValue {
  value: string[];
  toggle: (val: string) => void;
  remove: (val: string) => void;
  removeLast: () => void;
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
  labelMap: React.MutableRefObject<Map<string, string>>;
  registerLabel: (value: string, label: string) => () => void;
  /** Bumped whenever a label is registered/unregistered so consumers re-render. */
  labelVersion: number;
  maxSelected: number | undefined;
}

const MultiComboboxContext = createContext<MultiComboboxContextValue | null>(null);

function useMultiCombobox(component: string): MultiComboboxContextValue {
  const ctx = useContext(MultiComboboxContext);
  if (!ctx) throw new Error(`<MultiCombobox.${component}> must be used inside <MultiCombobox>`);
  return ctx;
}

export interface MultiComboboxProps {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Cap the number of selected values. Further selections are ignored. */
  maxSelected?: number;
  children: ReactNode;
}

export function MultiComboboxRoot({
  value: controlledValue,
  defaultValue,
  onValueChange,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  maxSelected,
  children,
}: MultiComboboxProps) {
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue ?? []);
  const value = controlledValue ?? internalValue;

  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;

  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState<string | null>(null);
  const baseId = useId();

  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const labelMap = useRef(new Map<string, string>());
  const [labelVersion, setLabelVersion] = useState(0);

  const registerLabel = useCallback((val: string, label: string): (() => void) => {
    labelMap.current.set(val, label);
    setLabelVersion((v) => v + 1);
    return () => {
      labelMap.current.delete(val);
      setLabelVersion((v) => v + 1);
    };
  }, []);

  const commit = useCallback(
    (next: string[]) => {
      if (controlledValue === undefined) setInternalValue(next);
      onValueChange?.(next);
    },
    [controlledValue, onValueChange],
  );

  const toggle = useCallback(
    (val: string) => {
      if (value.includes(val)) {
        commit(value.filter((v) => v !== val));
        return;
      }
      if (maxSelected !== undefined && value.length >= maxSelected) return;
      commit([...value, val]);
    },
    [value, commit, maxSelected],
  );

  const remove = useCallback(
    (val: string) => {
      if (!value.includes(val)) return;
      commit(value.filter((v) => v !== val));
    },
    [value, commit],
  );

  const removeLast = useCallback(() => {
    if (value.length === 0) return;
    commit(value.slice(0, -1));
  }, [value, commit]);

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

  const ctx = useMemo<MultiComboboxContextValue>(
    () => ({
      value,
      toggle,
      remove,
      removeLast,
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
      labelMap,
      registerLabel,
      labelVersion,
      maxSelected,
    }),
    [
      value,
      toggle,
      remove,
      removeLast,
      query,
      open,
      setOpen,
      highlight,
      baseId,
      registerLabel,
      labelVersion,
      maxSelected,
    ],
  );

  return <MultiComboboxContext.Provider value={ctx}>{children}</MultiComboboxContext.Provider>;
}

interface TriggerProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  placeholder?: string;
  disabled?: boolean;
  /** Icon rendered inside the trigger on the leading edge (no border). */
  leadingIcon?: ReactNode;
  /** Icon rendered inside the trigger on the trailing edge, before the chevron (no border). */
  trailingIcon?: ReactNode;
  /** Bordered addon block before the trigger (e.g., "https://"). */
  leadingAddon?: ReactNode;
  /** Bordered addon block after the trigger (e.g., ".com"). */
  trailingAddon?: ReactNode;
}

const MultiComboboxTrigger = forwardRef<HTMLDivElement, TriggerProps>(function MultiComboboxTrigger(
  {
    placeholder = "Select…",
    disabled,
    leadingIcon,
    trailingIcon,
    leadingAddon,
    trailingAddon,
    onClick,
    onKeyDown,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const ctx = useMultiCombobox("Trigger");
  const composedRef = useCallback(
    (node: HTMLDivElement | null) => {
      ctx.triggerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    },
    [ref, ctx.triggerRef],
  );

  const handleClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || disabled) return;
    // Skip if click landed on a chip's remove button — its own handler runs.
    if ((event.target as HTMLElement).closest(".bui-multicombobox-chip__remove")) return;
    ctx.setOpen(!ctx.open);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled) return;
    if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
      event.preventDefault();
      if (!ctx.open) ctx.setOpen(true);
    }
  };

  const isEmpty = ctx.value.length === 0;

  return (
    <div
      ref={composedRef}
      className={cx(
        "bui-multicombobox-trigger",
        isEmpty && "bui-multicombobox-trigger--empty",
        disabled && "bui-multicombobox-trigger--disabled",
        className,
      )}
      style={style}
    >
      {leadingAddon && (
        <span className="bui-multicombobox-trigger__addon bui-multicombobox-trigger__addon--leading">
          {leadingAddon}
        </span>
      )}
      {leadingIcon && (
        <span
          className="bui-multicombobox-trigger__icon bui-multicombobox-trigger__icon--leading"
          aria-hidden
        >
          {leadingIcon}
        </span>
      )}
      <div
        className="bui-multicombobox-trigger__field"
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={ctx.open}
        aria-controls={`${ctx.baseId}-list`}
        aria-haspopup="listbox"
        aria-autocomplete="list"
        aria-disabled={disabled || undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        <div className="bui-multicombobox-trigger__values">
          {children ??
            (isEmpty ? (
              <span className="bui-multicombobox-trigger__placeholder">{placeholder}</span>
            ) : (
              ctx.value.map((val) => {
                const label = ctx.labelMap.current.get(val) ?? val;
                return (
                  <Badge key={val} className="bui-multicombobox-chip">
                    <span className="bui-multicombobox-chip__label">{label}</span>
                    <button
                      type="button"
                      className="bui-multicombobox-chip__remove"
                      aria-label={`Remove ${label}`}
                      disabled={disabled}
                      onClick={(e) => {
                        e.stopPropagation();
                        ctx.remove(val);
                      }}
                    >
                      <XIcon />
                    </button>
                  </Badge>
                );
              })
            ))}
        </div>
        <span className="bui-multicombobox-trigger__chevron" aria-hidden>
          <ChevronIcon />
        </span>
      </div>
      {trailingIcon && (
        <span
          className="bui-multicombobox-trigger__icon bui-multicombobox-trigger__icon--trailing"
          aria-hidden
        >
          {trailingIcon}
        </span>
      )}
      {trailingAddon && (
        <span className="bui-multicombobox-trigger__addon bui-multicombobox-trigger__addon--trailing">
          {trailingAddon}
        </span>
      )}
    </div>
  );
});

interface ContentProps extends HTMLAttributes<HTMLDivElement> {
  placement?: Placement;
  /** Match the trigger's width. Default true. */
  matchTriggerWidth?: boolean;
}

const MultiComboboxContent = forwardRef<HTMLDivElement, ContentProps>(function MultiComboboxContent(
  { placement = "bottom-start", matchTriggerWidth = true, className, style, children, ...rest },
  ref,
) {
  const ctx = useMultiCombobox("Content");
  const [mountState, setMountState] = useState<"closed" | "open">("closed");
  const position = usePosition({
    triggerRef: ctx.triggerRef,
    contentRef: ctx.contentRef,
    open: ctx.open,
    placement,
    offset: 4,
  });

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

const MultiComboboxInput = forwardRef<HTMLInputElement, InputProps>(function MultiComboboxInput(
  { placeholder = "Search…", onKeyDown, className, ...rest },
  ref,
) {
  const ctx = useMultiCombobox("Input");
  const composedRef = useCallback(
    (node: HTMLInputElement | null) => {
      ctx.inputRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
    },
    [ref, ctx.inputRef],
  );

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

    // Backspace on empty input removes the last selected value (TagInput idiom).
    if (event.key === "Backspace" && ctx.query === "" && ctx.value.length > 0) {
      event.preventDefault();
      ctx.removeLast();
      return;
    }

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
      ctx.toggle(ctx.highlight);
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

const MultiComboboxList = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function MultiComboboxList({ className, children, ...rest }, ref) {
    const ctx = useMultiCombobox("List");
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
        aria-multiselectable
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
  onSelect?: (value: string, selected: boolean) => void;
}

const MultiComboboxItem = forwardRef<HTMLDivElement, ItemProps>(function MultiComboboxItem(
  { value, keywords, disabled, onSelect, onClick, onPointerMove, className, children, ...rest },
  ref,
) {
  const ctx = useMultiCombobox("Item");

  const labelText =
    typeof children === "string"
      ? children
      : typeof children === "number"
        ? String(children)
        : value;
  useEffect(() => {
    return ctx.registerLabel(value, labelText);
  }, [value, labelText, ctx.registerLabel]);

  const haystack = (labelText + " " + (keywords ?? []).join(" ")).toLowerCase();
  const needle = ctx.query.trim().toLowerCase();
  const matches = needle.length === 0 || haystack.includes(needle);
  if (!matches) return null;

  const isSelected = ctx.value.includes(value);
  const isHighlighted = ctx.highlight === value;
  const atMax =
    !isSelected && ctx.maxSelected !== undefined && ctx.value.length >= ctx.maxSelected;
  const isDisabled = disabled || atMax;
  const id = `${ctx.baseId}-item-${value}`;

  const handleClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || isDisabled) return;
    onSelect?.(value, !isSelected);
    ctx.toggle(value);
    // Keep the popover open and focus the input so the user can keep filtering
    // / picking. This is the key UX difference from single-select Combobox.
    ctx.inputRef.current?.focus({ preventScroll: true });
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event);
    if (event.defaultPrevented || isDisabled) return;
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
      data-disabled={isDisabled || undefined}
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

const MultiComboboxEmpty = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function MultiComboboxEmpty({ className, children, ...rest }, ref) {
    const ctx = useMultiCombobox("Empty");
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

const MultiComboboxGroup = forwardRef<HTMLDivElement, GroupProps>(function MultiComboboxGroup(
  { label, className, children, ...rest },
  ref,
) {
  return (
    <div ref={ref} role="group" className={cx("bui-combobox-group", className)} {...rest}>
      {label && <div className="bui-combobox-group__label">{label}</div>}
      {children}
    </div>
  );
});

function ChevronIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.5 5.5L7 9l3.5-3.5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <circle cx="6" cy="6" r="4" />
      <path d="M9.5 9.5L12 12" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2.5 7.5l2.8 2.8L11.5 4" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M2 2l6 6M8 2l-6 6" />
    </svg>
  );
}

type MultiComboboxComponent = typeof MultiComboboxRoot & {
  Trigger: typeof MultiComboboxTrigger;
  Content: typeof MultiComboboxContent;
  Input: typeof MultiComboboxInput;
  List: typeof MultiComboboxList;
  Item: typeof MultiComboboxItem;
  Empty: typeof MultiComboboxEmpty;
  Group: typeof MultiComboboxGroup;
};

export const MultiCombobox = MultiComboboxRoot as MultiComboboxComponent;
MultiCombobox.Trigger = MultiComboboxTrigger;
MultiCombobox.Content = MultiComboboxContent;
MultiCombobox.Input = MultiComboboxInput;
MultiCombobox.List = MultiComboboxList;
MultiCombobox.Item = MultiComboboxItem;
MultiCombobox.Empty = MultiComboboxEmpty;
MultiCombobox.Group = MultiComboboxGroup;
