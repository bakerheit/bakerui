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
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { cx } from "../../utils/cx";
import "./Tree.css";

export type TreeSelectionMode = "single" | "multiple";

export type TreeSelectedValue<M extends TreeSelectionMode = TreeSelectionMode> =
  M extends "multiple" ? string[] : string | null;

export interface TreeNode {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  children?: TreeNode[];
}

interface NodeRecord {
  parent: string | null;
  children: string[];
  disabled: boolean;
}

interface TreeContextValue {
  selectionMode: TreeSelectionMode;
  selected: Set<string>;
  toggleSelected: (value: string) => void;
  setSingleSelected: (value: string) => void;

  expanded: Set<string>;
  toggleExpanded: (value: string) => void;
  setExpandedValue: (value: string, next: boolean) => void;

  focusedValue: string | null;
  setFocusedValue: (value: string | null) => void;

  registerNode: (value: string, parent: string | null, disabled: boolean) => () => void;
  /** Reads node graph; updated whenever a node registers/unregisters. */
  nodesRef: React.MutableRefObject<Map<string, NodeRecord>>;
  /** Bumped on register/unregister so consumers re-render when graph changes. */
  graphVersion: number;

  baseId: string;
  rootRef: React.MutableRefObject<HTMLDivElement | null>;
}

const TreeContext = createContext<TreeContextValue | null>(null);

function useTreeContext(component: string): TreeContextValue {
  const ctx = useContext(TreeContext);
  if (!ctx) throw new Error(`<Tree.${component}> must be used inside <Tree>`);
  return ctx;
}

/** Tracks the parent value for nested Tree.Item children. */
const TreeParentContext = createContext<string | null>(null);

/** Walks descendants of a value via the registered node graph. */
function collectDescendants(
  nodes: Map<string, NodeRecord>,
  value: string,
  out: string[] = [],
): string[] {
  const record = nodes.get(value);
  if (!record) return out;
  for (const child of record.children) {
    out.push(child);
    collectDescendants(nodes, child, out);
  }
  return out;
}

/** Returns leaves under `value` (or [value] if value itself is a leaf). */
function collectLeaves(nodes: Map<string, NodeRecord>, value: string, out: string[] = []): string[] {
  const record = nodes.get(value);
  if (!record || record.children.length === 0) {
    out.push(value);
    return out;
  }
  for (const child of record.children) collectLeaves(nodes, child, out);
  return out;
}

/** Flattens the currently-visible items in DFS order (skipping under collapsed parents). */
function collectVisible(
  nodes: Map<string, NodeRecord>,
  expanded: Set<string>,
  roots: string[],
  out: string[] = [],
): string[] {
  for (const value of roots) {
    const record = nodes.get(value);
    if (!record) continue;
    out.push(value);
    if (record.children.length > 0 && expanded.has(value)) {
      collectVisible(nodes, expanded, record.children, out);
    }
  }
  return out;
}

/** Roots = nodes whose parent is null. */
function getRoots(nodes: Map<string, NodeRecord>): string[] {
  const roots: string[] = [];
  for (const [value, record] of nodes) {
    if (record.parent === null) roots.push(value);
  }
  return roots;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface TreeProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect" | "children"> {
  /** Optional data-driven tree. When provided, renders rows automatically. Mutually exclusive with children. */
  data?: TreeNode[];
  /** Composition children (Tree.Item). Ignored when `data` is provided. */
  children?: ReactNode;
  /** Controlled expanded set. */
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (expanded: string[]) => void;
  /** Single-select picks one value; multi-select supports tri-state checkboxes. Default "single". */
  selectionMode?: TreeSelectionMode;
  /** Controlled selection. Pass a single value for single-select, or an array for multi-select. */
  selected?: string | string[] | null;
  defaultSelected?: string | string[] | null;
  /** Fires with the new selection. Type matches the active selectionMode. */
  onSelectedChange?: (selected: string | string[] | null) => void;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

function TreeRoot(props: TreeProps) {
  const {
    data,
    children,
    expanded: controlledExpanded,
    defaultExpanded,
    onExpandedChange,
    selectionMode = "single",
    selected: controlledSelected,
    defaultSelected,
    onSelectedChange,
    className,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    ...rest
  } = props;

  const baseId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);

  // --- Expansion state ----------------------------------------------------
  const [internalExpanded, setInternalExpanded] = useState<Set<string>>(
    () => new Set(defaultExpanded ?? []),
  );
  const expanded = useMemo(
    () => (controlledExpanded ? new Set(controlledExpanded) : internalExpanded),
    [controlledExpanded, internalExpanded],
  );

  const commitExpanded = useCallback(
    (next: Set<string>) => {
      if (controlledExpanded === undefined) setInternalExpanded(next);
      onExpandedChange?.(Array.from(next));
    },
    [controlledExpanded, onExpandedChange],
  );

  const setExpandedValue = useCallback(
    (value: string, next: boolean) => {
      const copy = new Set(expanded);
      if (next) copy.add(value);
      else copy.delete(value);
      commitExpanded(copy);
    },
    [expanded, commitExpanded],
  );

  const toggleExpanded = useCallback(
    (value: string) => setExpandedValue(value, !expanded.has(value)),
    [expanded, setExpandedValue],
  );

  // --- Selection state ----------------------------------------------------
  const toSet = useCallback(
    (raw: string | string[] | null | undefined): Set<string> => {
      if (raw == null) return new Set<string>();
      if (Array.isArray(raw)) return new Set<string>(raw);
      return new Set<string>([raw]);
    },
    [],
  );

  const [internalSelected, setInternalSelected] = useState<Set<string>>(() =>
    toSet(defaultSelected),
  );

  const controlledSet = useMemo<Set<string> | null>(
    () => (controlledSelected === undefined ? null : toSet(controlledSelected)),
    [controlledSelected, toSet],
  );

  const selected = controlledSet ?? internalSelected;

  const commitSelected = useCallback(
    (next: Set<string>) => {
      if (controlledSet === null) setInternalSelected(next);
      if (!onSelectedChange) return;
      if (selectionMode === "multiple") {
        onSelectedChange(Array.from(next));
      } else {
        const first = next.values().next().value ?? null;
        onSelectedChange(first);
      }
    },
    [controlledSet, selectionMode, onSelectedChange],
  );

  // --- Node graph registration --------------------------------------------
  const nodesRef = useRef<Map<string, NodeRecord>>(new Map());
  const [graphVersion, setGraphVersion] = useState(0);

  const registerNode = useCallback(
    (value: string, parent: string | null, disabled: boolean): (() => void) => {
      const nodes = nodesRef.current;
      const existing = nodes.get(value);
      // Re-register: keep children list if already populated (children register
      // independently and we don't want to lose them across a parent re-render).
      nodes.set(value, {
        parent,
        children: existing?.children ?? [],
        disabled,
      });
      if (parent !== null) {
        const parentRecord =
          nodes.get(parent) ?? ({ parent: null, children: [], disabled: false } as NodeRecord);
        if (!parentRecord.children.includes(value)) {
          parentRecord.children = [...parentRecord.children, value];
        }
        nodes.set(parent, parentRecord);
      }
      setGraphVersion((v) => v + 1);

      return () => {
        const map = nodesRef.current;
        const record = map.get(value);
        if (!record) return;
        if (record.parent !== null) {
          const parentRecord = map.get(record.parent);
          if (parentRecord) {
            parentRecord.children = parentRecord.children.filter((c) => c !== value);
          }
        }
        map.delete(value);
        setGraphVersion((v) => v + 1);
      };
    },
    [],
  );

  // --- Selection logic ----------------------------------------------------
  const toggleSelected = useCallback(
    (value: string) => {
      const nodes = nodesRef.current;
      if (selectionMode === "single") {
        commitSelected(new Set([value]));
        return;
      }
      const next = new Set(selected);
      const descendants = collectDescendants(nodes, value);
      const subtree = [value, ...descendants];
      const allChecked = subtree.every((v) => next.has(v));

      if (allChecked) {
        for (const v of subtree) next.delete(v);
      } else {
        for (const v of subtree) {
          if (!nodes.get(v)?.disabled) next.add(v);
        }
      }

      // Reconcile ancestors: a parent is "checked" iff all of its direct
      // (enabled) children are checked. Walk up to root.
      let cursor = nodes.get(value)?.parent ?? null;
      while (cursor !== null) {
        const record = nodes.get(cursor);
        if (!record) break;
        const enabledChildren = record.children.filter((c) => !nodes.get(c)?.disabled);
        const allChildrenChecked =
          enabledChildren.length > 0 && enabledChildren.every((c) => next.has(c));
        if (allChildrenChecked) next.add(cursor);
        else next.delete(cursor);
        cursor = record.parent;
      }

      commitSelected(next);
    },
    [selected, selectionMode, commitSelected],
  );

  const setSingleSelected = useCallback(
    (value: string) => commitSelected(new Set([value])),
    [commitSelected],
  );

  // --- Roving tabindex / focus -------------------------------------------
  const [focusedValue, setFocusedValueState] = useState<string | null>(null);
  const setFocusedValue = useCallback((value: string | null) => {
    setFocusedValueState(value);
  }, []);

  // After the graph is known, seed the focused value to the first visible
  // item so the tree has a valid tabstop. Don't clobber an existing one.
  useEffect(() => {
    if (focusedValue !== null) {
      // Validate it still exists; if not, reset.
      if (!nodesRef.current.has(focusedValue)) setFocusedValueState(null);
      return;
    }
    const roots = getRoots(nodesRef.current);
    if (roots.length === 0) return;
    const visible = collectVisible(nodesRef.current, expanded, roots);
    const firstEnabled = visible.find((v) => !nodesRef.current.get(v)?.disabled);
    if (firstEnabled) setFocusedValueState(firstEnabled);
  }, [graphVersion, expanded, focusedValue]);

  const ctx = useMemo<TreeContextValue>(
    () => ({
      selectionMode,
      selected,
      toggleSelected,
      setSingleSelected,
      expanded,
      toggleExpanded,
      setExpandedValue,
      focusedValue,
      setFocusedValue,
      registerNode,
      nodesRef,
      graphVersion,
      baseId,
      rootRef,
    }),
    [
      selectionMode,
      selected,
      toggleSelected,
      setSingleSelected,
      expanded,
      toggleExpanded,
      setExpandedValue,
      focusedValue,
      setFocusedValue,
      registerNode,
      graphVersion,
      baseId,
    ],
  );

  return (
    <TreeContext.Provider value={ctx}>
      <TreeParentContext.Provider value={null}>
        <div
          ref={rootRef}
          role="tree"
          aria-multiselectable={selectionMode === "multiple" || undefined}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          className={cx("bui-tree", className)}
          {...rest}
        >
          {data ? renderNodes(data) : children}
        </div>
      </TreeParentContext.Provider>
    </TreeContext.Provider>
  );
}

function renderNodes(nodes: TreeNode[]): ReactNode {
  return nodes.map((node) => (
    <TreeItem
      key={node.value}
      value={node.value}
      label={node.label}
      icon={node.icon}
      disabled={node.disabled}
    >
      {node.children && node.children.length > 0 ? renderNodes(node.children) : null}
    </TreeItem>
  ));
}

// ---------------------------------------------------------------------------
// Item
// ---------------------------------------------------------------------------

interface TreeItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  children?: ReactNode;
}

const TreeItem = forwardRef<HTMLDivElement, TreeItemProps>(function TreeItem(
  { value, label, icon, disabled = false, children, className, onClick, onKeyDown, ...rest },
  ref,
) {
  const ctx = useTreeContext("Item");
  const parent = useContext(TreeParentContext);

  // Register this item in the node graph.
  useEffect(() => {
    return ctx.registerNode(value, parent, disabled);
  }, [value, parent, disabled, ctx.registerNode]);

  const nodes = ctx.nodesRef.current;
  // Read graphVersion so this component re-renders when descendants register.
  void ctx.graphVersion;

  // Whether this row has a subtree is determined by the `children` prop,
  // not the registered graph — children can't register until they're
  // mounted, and they can't mount until the parent decides it has any.
  const hasChildren = children != null && children !== false;
  const isExpanded = ctx.expanded.has(value);
  const isFocused = ctx.focusedValue === value;

  // Selection state (renders the checkbox glyph).
  let selectionState: "checked" | "mixed" | "unchecked" = "unchecked";
  if (ctx.selectionMode === "multiple") {
    if (ctx.selected.has(value)) {
      selectionState = "checked";
    } else if (hasChildren) {
      const leaves = collectLeaves(nodes, value);
      const checkedLeaves = leaves.filter((l) => ctx.selected.has(l)).length;
      if (checkedLeaves > 0 && checkedLeaves < leaves.length) selectionState = "mixed";
    }
  } else if (ctx.selected.has(value)) {
    selectionState = "checked";
  }

  // Depth: walk up parents.
  let depth = 0;
  for (let cursor = parent; cursor !== null; ) {
    depth += 1;
    cursor = nodes.get(cursor)?.parent ?? null;
  }

  const itemId = `${ctx.baseId}-item-${value}`;
  const rowRef = useRef<HTMLDivElement | null>(null);
  const composedRef = useCallback(
    (node: HTMLDivElement | null) => {
      rowRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    },
    [ref],
  );

  // Focus the row when this item becomes the tree's tabstop AND the focus is
  // already inside the tree (i.e., the user used the keyboard or clicked).
  useEffect(() => {
    if (!isFocused) return;
    const node = rowRef.current;
    if (!node) return;
    if (ctx.rootRef.current?.contains(document.activeElement)) {
      node.focus({ preventScroll: false });
    }
  }, [isFocused, ctx.rootRef]);

  const handleClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || disabled) return;

    // Click on the chevron toggles expansion only; click elsewhere on the
    // row selects (and, for parents, toggles expand on second click via the
    // standard tree pattern). We keep it simple: chevron → expand only;
    // row body → select and also expand parents on click.
    if ((event.target as HTMLElement).closest(".bui-tree-item__chevron")) {
      ctx.toggleExpanded(value);
    } else {
      ctx.setFocusedValue(value);
      ctx.toggleSelected(value);
      if (hasChildren && ctx.selectionMode === "single") {
        ctx.toggleExpanded(value);
      }
    }
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    const roots = getRoots(ctx.nodesRef.current);
    const visible = collectVisible(ctx.nodesRef.current, ctx.expanded, roots).filter(
      (v) => !ctx.nodesRef.current.get(v)?.disabled,
    );
    const idx = visible.indexOf(value);

    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        const next = visible[idx + 1];
        if (next) ctx.setFocusedValue(next);
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        const prev = visible[idx - 1];
        if (prev) ctx.setFocusedValue(prev);
        break;
      }
      case "ArrowRight": {
        event.preventDefault();
        if (hasChildren && !isExpanded) {
          ctx.setExpandedValue(value, true);
        } else if (hasChildren && isExpanded) {
          const firstChild = ctx.nodesRef.current.get(value)?.children[0];
          if (firstChild) ctx.setFocusedValue(firstChild);
        }
        break;
      }
      case "ArrowLeft": {
        event.preventDefault();
        if (hasChildren && isExpanded) {
          ctx.setExpandedValue(value, false);
        } else if (parent !== null) {
          ctx.setFocusedValue(parent);
        }
        break;
      }
      case "Home": {
        event.preventDefault();
        if (visible[0]) ctx.setFocusedValue(visible[0]);
        break;
      }
      case "End": {
        event.preventDefault();
        const last = visible[visible.length - 1];
        if (last) ctx.setFocusedValue(last);
        break;
      }
      case "Enter":
      case " ": {
        event.preventDefault();
        if (disabled) break;
        ctx.toggleSelected(value);
        break;
      }
      default:
        break;
    }
  };

  return (
    <div role="none" className="bui-tree-item">
      <div
        ref={composedRef}
        role="treeitem"
        id={itemId}
        data-value={value}
        data-disabled={disabled || undefined}
        data-selected={selectionState !== "unchecked" || undefined}
        data-state={selectionState}
        aria-selected={
          ctx.selectionMode === "single" ? selectionState === "checked" : undefined
        }
        aria-checked={
          ctx.selectionMode === "multiple"
            ? selectionState === "mixed"
              ? "mixed"
              : selectionState === "checked"
            : undefined
        }
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-disabled={disabled || undefined}
        aria-level={depth + 1}
        tabIndex={isFocused && !disabled ? 0 : -1}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cx("bui-tree-item__row", className)}
        style={{ "--bui-tree-depth": depth } as React.CSSProperties}
        {...rest}
      >
        <span
          className="bui-tree-item__chevron"
          aria-hidden
          data-visible={hasChildren || undefined}
        >
          {hasChildren && <ChevronIcon expanded={isExpanded} />}
        </span>
        {ctx.selectionMode === "multiple" && (
          <span
            className="bui-tree-item__checkbox"
            data-state={selectionState}
            aria-hidden
          >
            <CheckboxGlyph state={selectionState} />
          </span>
        )}
        {icon && (
          <span className="bui-tree-item__icon" aria-hidden>
            {icon}
          </span>
        )}
        <span className="bui-tree-item__label">{label}</span>
      </div>
      {hasChildren && (
        // Always mount children so they register in the node graph (needed
        // for descendant queries in multi-select, and for keyboard nav).
        // `hidden` removes them from layout AND the accessibility tree when
        // the row is collapsed.
        <div role="group" hidden={!isExpanded} className="bui-tree-item__group">
          <TreeParentContext.Provider value={value}>{children}</TreeParentContext.Provider>
        </div>
      )}
    </div>
  );
});

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
        transition: "transform var(--bui-duration-fast) var(--bui-easing-standard)",
      }}
    >
      <path d="M3.5 2L7 5l-3.5 3" />
    </svg>
  );
}

function CheckboxGlyph({ state }: { state: "checked" | "mixed" | "unchecked" }) {
  if (state === "mixed") {
    return (
      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M3 6h6" />
      </svg>
    );
  }
  if (state === "checked") {
    return (
      <svg
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2.5 6.5l2.5 2.5 4.5-5" />
      </svg>
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

type TreeComponent = typeof TreeRoot & {
  Item: typeof TreeItem;
};

export const Tree = TreeRoot as TreeComponent;
Tree.Item = TreeItem;
