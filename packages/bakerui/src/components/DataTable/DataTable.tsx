import {
  useCallback,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Button } from "../Button/Button";
import { Checkbox } from "../Checkbox/Checkbox";
import { Popover } from "../Popover/Popover";
import { Skeleton } from "../Skeleton/Skeleton";
import { cx } from "../../utils/cx";
import "./DataTable.css";

export type SortDirection = "asc" | "desc";

export interface SortState {
  key: string;
  direction: SortDirection;
}

export type TableCellAlign = "left" | "center" | "right";

export interface FilterOption {
  value: string;
  label: ReactNode;
}

export type ColumnFilterConfig =
  | { type: "text"; placeholder?: string }
  | { type: "select"; options: FilterOption[]; placeholder?: string }
  | { type: "multi-select"; options: FilterOption[] };

/** Map of column key → filter value. */
export type FilterState = Record<string, string | string[] | undefined>;

export interface DataTableColumn<T> {
  /** Unique column identifier. Also used as the default field key on `row[key]`. */
  key: string;
  header: ReactNode;
  /** Render the cell value. Defaults to `row[key]`. */
  cell?: (row: T, rowIndex: number) => ReactNode;
  /** Whether the column is sortable. */
  sortable?: boolean;
  /** Custom comparator. Defaults to localeCompare on `row[key]` strings, numeric compare on numbers. */
  sortFn?: (a: T, b: T) => number;
  /** Adds a per-column filter control to the header. */
  filter?: ColumnFilterConfig;
  /** Custom filter predicate. Default: substring (text) or strict equality (select). */
  filterFn?: (row: T, value: string | string[]) => boolean;
  align?: TableCellAlign;
  /** CSS width. Number is treated as px. */
  width?: string | number;
  /** Hide on small screens via responsive class. */
  hideBelow?: "sm" | "md";
  /** Extra className applied to all cells in this column (header + body). */
  className?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  /** Stable identifier per row — used for keys, selection, and React reconciliation. */
  rowKey: (row: T) => string;

  /* --- Sorting -------------------------------------------------------- */
  sortBy?: SortState | null;
  defaultSortBy?: SortState | null;
  onSortChange?: (sort: SortState | null) => void;
  /** Disable internal sorting (you'll provide pre-sorted data — e.g., server-side). */
  manualSort?: boolean;

  /* --- Filtering ------------------------------------------------------ */
  filters?: FilterState;
  defaultFilters?: FilterState;
  onFiltersChange?: (filters: FilterState) => void;
  /** Disable internal filtering (you'll provide pre-filtered data). */
  manualFilter?: boolean;

  /* --- Selection ------------------------------------------------------ */
  selectable?: boolean;
  selectedKeys?: Set<string>;
  defaultSelectedKeys?: Set<string>;
  onSelectionChange?: (keys: Set<string>) => void;

  /* --- Visuals -------------------------------------------------------- */
  zebra?: boolean;
  stickyHeader?: boolean;
  hoverable?: boolean;
  /** "default" | "compact" — compact reduces vertical padding. */
  density?: "default" | "compact";

  /* --- States --------------------------------------------------------- */
  loading?: boolean;
  loadingRows?: number;
  emptyState?: ReactNode;

  /* --- Interaction ---------------------------------------------------- */
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string | undefined;

  /* --- Misc ----------------------------------------------------------- */
  className?: string;
  style?: CSSProperties;
  caption?: ReactNode;
  "aria-label"?: string;
}

function defaultCompare(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

function widthValue(w: string | number | undefined): string | undefined {
  if (w === undefined) return undefined;
  return typeof w === "number" ? `${w}px` : w;
}

function isFilterActive(value: string | string[] | undefined): boolean {
  if (value === undefined || value === null) return false;
  if (Array.isArray(value)) return value.length > 0;
  return value.length > 0;
}

function defaultMatch<T>(row: T, key: string, value: string | string[]): boolean {
  const cell = (row as Record<string, unknown>)[key];
  if (Array.isArray(value)) {
    if (value.length === 0) return true;
    return value.includes(String(cell));
  }
  if (value.length === 0) return true;
  return String(cell ?? "")
    .toLowerCase()
    .includes(value.toLowerCase());
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  sortBy: controlledSort,
  defaultSortBy = null,
  onSortChange,
  manualSort,
  filters: controlledFilters,
  defaultFilters,
  onFiltersChange,
  manualFilter,
  selectable,
  selectedKeys: controlledSelected,
  defaultSelectedKeys,
  onSelectionChange,
  zebra,
  stickyHeader = true,
  hoverable = true,
  density = "default",
  loading,
  loadingRows = 5,
  emptyState,
  onRowClick,
  rowClassName,
  className,
  style,
  caption,
  "aria-label": ariaLabel,
}: DataTableProps<T>) {
  // Sort state ----------------------------------------------------------
  const [internalSort, setInternalSort] = useState<SortState | null>(defaultSortBy);
  const sort = controlledSort !== undefined ? controlledSort : internalSort;

  const setSort = useCallback(
    (next: SortState | null) => {
      if (controlledSort === undefined) setInternalSort(next);
      onSortChange?.(next);
    },
    [controlledSort, onSortChange],
  );

  const cycleSort = useCallback(
    (key: string) => {
      if (sort?.key !== key) {
        setSort({ key, direction: "asc" });
        return;
      }
      if (sort.direction === "asc") {
        setSort({ key, direction: "desc" });
        return;
      }
      setSort(null); // third click clears
    },
    [sort, setSort],
  );

  // Filter state --------------------------------------------------------
  const [internalFilters, setInternalFilters] = useState<FilterState>(defaultFilters ?? {});
  const filters = controlledFilters ?? internalFilters;

  const setFilters = useCallback(
    (next: FilterState) => {
      if (controlledFilters === undefined) setInternalFilters(next);
      onFiltersChange?.(next);
    },
    [controlledFilters, onFiltersChange],
  );

  const setFilter = useCallback(
    (key: string, value: string | string[] | undefined) => {
      const next = { ...filters };
      if (value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) {
        delete next[key];
      } else {
        next[key] = value;
      }
      setFilters(next);
    },
    [filters, setFilters],
  );

  // Selection state -----------------------------------------------------
  const [internalSelected, setInternalSelected] = useState<Set<string>>(
    defaultSelectedKeys ?? new Set(),
  );
  const selected = controlledSelected ?? internalSelected;

  const setSelected = useCallback(
    (next: Set<string>) => {
      if (controlledSelected === undefined) setInternalSelected(next);
      onSelectionChange?.(next);
    },
    [controlledSelected, onSelectionChange],
  );

  const toggleRow = useCallback(
    (key: string) => {
      const next = new Set(selected);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      setSelected(next);
    },
    [selected, setSelected],
  );

  // Filtered + sorted data ---------------------------------------------
  const filteredData = useMemo(() => {
    if (manualFilter) return data;
    const activeEntries = Object.entries(filters).filter(([, v]) => isFilterActive(v));
    if (activeEntries.length === 0) return data;

    return data.filter((row) =>
      activeEntries.every(([k, v]) => {
        if (v === undefined) return true;
        const col = columns.find((c) => c.key === k);
        if (col?.filterFn) return col.filterFn(row, v);
        return defaultMatch(row, k, v);
      }),
    );
  }, [data, filters, columns, manualFilter]);

  const sortedData = useMemo(() => {
    if (!sort || manualSort) return filteredData;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return filteredData;
    const compare =
      col.sortFn ??
      ((a: T, b: T) =>
        defaultCompare(
          (a as Record<string, unknown>)[col.key],
          (b as Record<string, unknown>)[col.key],
        ));
    const sorted = [...filteredData].sort(compare);
    return sort.direction === "asc" ? sorted : sorted.reverse();
  }, [filteredData, sort, columns, manualSort]);

  // Selection helpers operate on the *visible* data so select-all only
  // selects what the user actually sees after filtering.
  const visibleKeys = useMemo(() => sortedData.map(rowKey), [sortedData, rowKey]);
  const allSelected =
    visibleKeys.length > 0 && visibleKeys.every((k) => selected.has(k));
  const someSelected = !allSelected && visibleKeys.some((k) => selected.has(k));

  const toggleAll = useCallback(() => {
    if (allSelected) {
      const next = new Set(selected);
      visibleKeys.forEach((k) => next.delete(k));
      setSelected(next);
    } else {
      const next = new Set(selected);
      visibleKeys.forEach((k) => next.add(k));
      setSelected(next);
    }
  }, [allSelected, visibleKeys, selected, setSelected]);

  const colCount = columns.length + (selectable ? 1 : 0);
  const activeFilterCount = Object.values(filters).filter(isFilterActive).length;

  return (
    <div
      className={cx(
        "bui-table-wrapper",
        stickyHeader && "bui-table-wrapper--sticky",
        className,
      )}
      style={style}
    >
      <table
        className={cx(
          "bui-table",
          zebra && "bui-table--zebra",
          hoverable && "bui-table--hoverable",
          density === "compact" && "bui-table--compact",
        )}
        aria-label={ariaLabel}
      >
        {caption && <caption className="bui-table__caption">{caption}</caption>}
        <thead className="bui-table__head">
          <tr>
            {selectable && (
              <th className="bui-table__select-cell" scope="col">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={toggleAll}
                  aria-label={allSelected ? "Deselect all rows" : "Select all rows"}
                />
              </th>
            )}
            {columns.map((col) => {
              const isSorted = sort?.key === col.key;
              const dir = isSorted ? sort.direction : undefined;
              const w = widthValue(col.width);
              const filterValue = filters[col.key];
              const filterActive = isFilterActive(filterValue);
              return (
                <th
                  key={col.key}
                  scope="col"
                  className={cx(
                    "bui-table__th",
                    col.align && `bui-table__cell--${col.align}`,
                    col.hideBelow && `bui-table__cell--hide-${col.hideBelow}`,
                    col.className,
                  )}
                  style={w ? { width: w } : undefined}
                  aria-sort={
                    !col.sortable
                      ? undefined
                      : isSorted
                        ? dir === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                  }
                >
                  <div className="bui-table__th-inner">
                    {col.sortable ? (
                      <button
                        type="button"
                        className="bui-table__sort-btn"
                        onClick={() => cycleSort(col.key)}
                      >
                        <span>{col.header}</span>
                        <SortIcon direction={isSorted ? dir : undefined} />
                      </button>
                    ) : (
                      <span>{col.header}</span>
                    )}
                    {col.filter && (
                      <FilterControl
                        column={col}
                        value={filterValue}
                        active={filterActive}
                        onChange={(next) => setFilter(col.key, next)}
                      />
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="bui-table__body">
          {loading ? (
            Array.from({ length: loadingRows }).map((_, i) => (
              <tr key={`loading-${i}`} className="bui-table__tr">
                {selectable && (
                  <td className="bui-table__select-cell">
                    <Skeleton width={16} height={16} />
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cx(
                      "bui-table__td",
                      col.align && `bui-table__cell--${col.align}`,
                      col.hideBelow && `bui-table__cell--hide-${col.hideBelow}`,
                      col.className,
                    )}
                  >
                    <Skeleton shape="text" width={`${50 + ((i * 13) % 40)}%`} />
                  </td>
                ))}
              </tr>
            ))
          ) : sortedData.length === 0 ? (
            <tr>
              <td colSpan={colCount} className="bui-table__empty">
                {activeFilterCount > 0 ? (
                  <div className="bui-table__empty-with-clear">
                    <span>{emptyState ?? "No rows match the current filters."}</span>
                    <Button size="sm" variant="ghost" onClick={() => setFilters({})}>
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  emptyState ?? "No data."
                )}
              </td>
            </tr>
          ) : (
            sortedData.map((row, rowIndex) => {
              const key = rowKey(row);
              const isSelected = selected.has(key);
              const clickable = !!onRowClick;
              return (
                <tr
                  key={key}
                  data-selected={isSelected || undefined}
                  className={cx(
                    "bui-table__tr",
                    clickable && "bui-table__tr--clickable",
                    rowClassName?.(row),
                  )}
                  onClick={
                    clickable
                      ? (event) => {
                          // Don't fire row click when clicking interactive cells
                          // (checkboxes, buttons, links) — they handle their own.
                          const target = event.target as HTMLElement;
                          if (target.closest('input, button, a, [role="button"]')) return;
                          onRowClick(row);
                        }
                      : undefined
                  }
                >
                  {selectable && (
                    <td className="bui-table__select-cell" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleRow(key)}
                        aria-label={`Select row ${rowIndex + 1}`}
                      />
                    </td>
                  )}
                  {columns.map((col) => {
                    const value = col.cell
                      ? col.cell(row, rowIndex)
                      : ((row as Record<string, unknown>)[col.key] as ReactNode);
                    return (
                      <td
                        key={col.key}
                        className={cx(
                          "bui-table__td",
                          col.align && `bui-table__cell--${col.align}`,
                          col.hideBelow && `bui-table__cell--hide-${col.hideBelow}`,
                          col.className,
                        )}
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

interface FilterControlProps<T> {
  column: DataTableColumn<T>;
  value: string | string[] | undefined;
  active: boolean;
  onChange: (next: string | string[] | undefined) => void;
}

function FilterControl<T>({ column, value, active, onChange }: FilterControlProps<T>) {
  const filter = column.filter!;
  return (
    <Popover>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cx(
            "bui-table__filter-btn",
            active && "bui-table__filter-btn--active",
          )}
          aria-label={active ? `Edit ${String(column.header)} filter` : `Filter ${String(column.header)}`}
        >
          <FilterIcon />
          {active && <span className="bui-table__filter-dot" aria-hidden />}
        </button>
      </Popover.Trigger>
      <Popover.Content placement="bottom-end">
        <FilterPanel
          filter={filter}
          value={value}
          headerText={typeof column.header === "string" ? column.header : column.key}
          onChange={onChange}
        />
      </Popover.Content>
    </Popover>
  );
}

interface FilterPanelProps {
  filter: ColumnFilterConfig;
  value: string | string[] | undefined;
  headerText: string;
  onChange: (next: string | string[] | undefined) => void;
}

function FilterPanel({ filter, value, headerText, onChange }: FilterPanelProps) {
  if (filter.type === "text") {
    return (
      <div className="bui-table__filter-panel">
        <input
          type="text"
          autoFocus
          placeholder={filter.placeholder ?? `Filter ${headerText}…`}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="bui-table__filter-text"
        />
        <div className="bui-table__filter-footer">
          <Button
            size="sm"
            variant="ghost"
            disabled={!isFilterActive(value)}
            onClick={() => onChange(undefined)}
          >
            Clear
          </Button>
        </div>
      </div>
    );
  }

  if (filter.type === "select") {
    return (
      <div className="bui-table__filter-panel">
        <div className="bui-table__filter-options" role="radiogroup">
          {filter.options.map((opt) => (
            <label key={opt.value} className="bui-table__filter-option">
              <input
                type="radio"
                name="filter"
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
        <div className="bui-table__filter-footer">
          <Button
            size="sm"
            variant="ghost"
            disabled={!isFilterActive(value)}
            onClick={() => onChange(undefined)}
          >
            Clear
          </Button>
        </div>
      </div>
    );
  }

  // multi-select
  const arrayValue = Array.isArray(value) ? value : [];
  const toggle = (v: string) => {
    if (arrayValue.includes(v)) onChange(arrayValue.filter((x) => x !== v));
    else onChange([...arrayValue, v]);
  };
  return (
    <div className="bui-table__filter-panel">
      <div className="bui-table__filter-options">
        {filter.options.map((opt) => (
          <Checkbox
            key={opt.value}
            checked={arrayValue.includes(opt.value)}
            onChange={() => toggle(opt.value)}
            label={opt.label}
          />
        ))}
      </div>
      <div className="bui-table__filter-footer">
        <Button
          size="sm"
          variant="ghost"
          disabled={!isFilterActive(value)}
          onClick={() => onChange(undefined)}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}

function SortIcon({ direction }: { direction?: SortDirection }) {
  return (
    <span className="bui-table__sort-icon" data-direction={direction ?? "none"} aria-hidden>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.5 7.5L6 10l2.5-2.5" className="bui-table__sort-icon-down" />
        <path d="M3.5 4.5L6 2l2.5 2.5" className="bui-table__sort-icon-up" />
      </svg>
    </span>
  );
}

function FilterIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" aria-hidden>
      <path d="M2 2.5h8L7 6.5v3.5l-2-1V6.5L2 2.5z" />
    </svg>
  );
}
