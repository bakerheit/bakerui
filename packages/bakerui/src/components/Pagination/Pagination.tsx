import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
} from "react";
import { cx } from "../../utils/cx";
import "./Pagination.css";

export type PaginationSize = "sm" | "md";

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  /** Total number of pages. Pages are 1-indexed. */
  pageCount: number;
  /** Currently active page (1-indexed, controlled). */
  page: number;
  /** Fires when the user picks a different page. */
  onPageChange: (page: number) => void;
  /** Pages to keep visible on each side of the active page. */
  siblingCount?: number;
  /** Pages to always show at the start and end. */
  boundaryCount?: number;
  /** Visual size. */
  size?: PaginationSize;
  /** Disable all controls. */
  disabled?: boolean;
  /** Show jump-to-first / jump-to-last buttons in addition to prev/next. */
  showFirstLast?: boolean;
  /** Hide the prev/next buttons (e.g., compact contexts). */
  hideNavigation?: boolean;
  /** Override the visible label for prev/next/first/last buttons. */
  labels?: Partial<{
    previous: string;
    next: string;
    first: string;
    last: string;
    page: (n: number) => string;
  }>;
}

type Item = number | "ellipsis-start" | "ellipsis-end";

/** Compute which page numbers + ellipsis markers to render. */
function getItems(
  pageCount: number,
  page: number,
  siblingCount: number,
  boundaryCount: number,
): Item[] {
  if (pageCount <= 0) return [];

  // When the truncated set would be larger than just listing every page,
  // show all pages — keeps narrow ranges from looking sparse.
  const minSlots = boundaryCount * 2 + siblingCount * 2 + 3;
  if (pageCount <= minSlots) {
    return range(1, pageCount);
  }

  const startPages = range(1, boundaryCount);
  const endPages = range(pageCount - boundaryCount + 1, pageCount);

  const left = Math.max(page - siblingCount, boundaryCount + 2);
  const right = Math.min(page + siblingCount, pageCount - boundaryCount - 1);

  const items: Item[] = [...startPages];

  if (left > boundaryCount + 2) items.push("ellipsis-start");
  else if (left === boundaryCount + 2) items.push(boundaryCount + 1);

  for (let i = left; i <= right; i++) items.push(i);

  if (right < pageCount - boundaryCount - 1) items.push("ellipsis-end");
  else if (right === pageCount - boundaryCount - 1) items.push(pageCount - boundaryCount);

  items.push(...endPages);
  return items;
}

function range(start: number, end: number): number[] {
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  {
    pageCount,
    page,
    onPageChange,
    siblingCount = 1,
    boundaryCount = 1,
    size = "md",
    disabled,
    showFirstLast,
    hideNavigation,
    labels,
    className,
    ...rest
  },
  ref,
) {
  const safeCount = Math.max(0, Math.floor(pageCount));
  const safePage = Math.min(Math.max(1, Math.floor(page)), Math.max(1, safeCount));
  const items = getItems(safeCount, safePage, siblingCount, boundaryCount);

  const previousLabel = labels?.previous ?? "Previous page";
  const nextLabel = labels?.next ?? "Next page";
  const firstLabel = labels?.first ?? "First page";
  const lastLabel = labels?.last ?? "Last page";
  const pageLabelFor = labels?.page ?? ((n) => `Go to page ${n}`);

  const goTo = (n: number) => {
    if (disabled) return;
    if (n < 1 || n > safeCount || n === safePage) return;
    onPageChange(n);
  };

  return (
    <nav
      ref={ref}
      aria-label="Pagination"
      className={cx("bui-pagination", `bui-pagination--${size}`, className)}
      {...rest}
    >
      <ul className="bui-pagination__list">
        {showFirstLast && (
          <li>
            <PaginationButton
              aria-label={firstLabel}
              disabled={disabled || safePage === 1}
              onClick={() => goTo(1)}
            >
              <ChevronDoubleLeftIcon />
            </PaginationButton>
          </li>
        )}
        {!hideNavigation && (
          <li>
            <PaginationButton
              aria-label={previousLabel}
              disabled={disabled || safePage === 1}
              onClick={() => goTo(safePage - 1)}
            >
              <ChevronLeftIcon />
            </PaginationButton>
          </li>
        )}

        {items.map((item, idx) => {
          if (item === "ellipsis-start" || item === "ellipsis-end") {
            return (
              <li key={`${item}-${idx}`} aria-hidden className="bui-pagination__ellipsis">
                …
              </li>
            );
          }
          const isCurrent = item === safePage;
          return (
            <li key={item}>
              <PaginationButton
                aria-label={pageLabelFor(item)}
                aria-current={isCurrent ? "page" : undefined}
                data-state={isCurrent ? "active" : undefined}
                disabled={disabled}
                onClick={() => goTo(item)}
              >
                {item}
              </PaginationButton>
            </li>
          );
        })}

        {!hideNavigation && (
          <li>
            <PaginationButton
              aria-label={nextLabel}
              disabled={disabled || safePage === safeCount}
              onClick={() => goTo(safePage + 1)}
            >
              <ChevronRightIcon />
            </PaginationButton>
          </li>
        )}
        {showFirstLast && (
          <li>
            <PaginationButton
              aria-label={lastLabel}
              disabled={disabled || safePage === safeCount}
              onClick={() => goTo(safeCount)}
            >
              <ChevronDoubleRightIcon />
            </PaginationButton>
          </li>
        )}
      </ul>
    </nav>
  );
});

const PaginationButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function PaginationButton({ className, ...rest }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        className={cx("bui-pagination__btn", className)}
        {...rest}
      />
    );
  },
);

function ChevronLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 3.5L5.5 7 9 10.5" />
    </svg>
  );
}
function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 3.5L8.5 7 5 10.5" />
    </svg>
  );
}
function ChevronDoubleLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11 3.5L7.5 7 11 10.5M6.5 3.5L3 7l3.5 3.5" />
    </svg>
  );
}
function ChevronDoubleRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 3.5L6.5 7 3 10.5M7.5 3.5L11 7l-3.5 3.5" />
    </svg>
  );
}
