import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type HTMLAttributes,
  type MutableRefObject,
  type Ref,
} from "react";
import { cx } from "../../utils/cx";
import "./Topbar.css";

export interface TopbarProps extends HTMLAttributes<HTMLElement> {
  /** Default sticky pins to the top of the scrolling parent. `static` puts it in flow. */
  position?: "sticky" | "static";
  /** Hide the bottom border. */
  borderless?: boolean;
  /** Use a soft shadow instead of a border. */
  elevated?: boolean;
}

/**
 * Tracks the topmost mounted sticky Topbar so we can publish its measured
 * height as `--bui-content-offset`. We publish the actual pixel value
 * (rather than `var(--bui-topbar-height)`) so consumers can rely on
 * `calc(var(--bui-content-offset) + …)` resolving cleanly.
 *
 * Only one sticky Topbar at a time owns the offset (the most recently
 * mounted one). When the last sticky Topbar unmounts, the property is
 * removed and the offset falls back to its default of `0px`.
 */
const stickyTopbars = new Set<HTMLElement>();
let activeTopbar: HTMLElement | null = null;
let resizeObserver: ResizeObserver | null = null;

function applyOffset(el: HTMLElement) {
  if (typeof document === "undefined") return;
  const h = el.getBoundingClientRect().height;
  document.documentElement.style.setProperty("--bui-content-offset", `${h}px`);
}

function clearOffset() {
  if (typeof document === "undefined") return;
  document.documentElement.style.removeProperty("--bui-content-offset");
}

function watch(el: HTMLElement) {
  stickyTopbars.add(el);
  if (activeTopbar !== el) {
    activeTopbar = el;
    if (resizeObserver) resizeObserver.disconnect();
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        if (activeTopbar) applyOffset(activeTopbar);
      });
      resizeObserver.observe(el);
    }
    applyOffset(el);
  }
}

function unwatch(el: HTMLElement) {
  stickyTopbars.delete(el);
  if (activeTopbar === el) {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    // Promote another mounted sticky Topbar if any remain.
    const next = stickyTopbars.values().next().value as HTMLElement | undefined;
    if (next) {
      activeTopbar = next;
      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(() => {
          if (activeTopbar) applyOffset(activeTopbar);
        });
        resizeObserver.observe(next);
      }
      applyOffset(next);
    } else {
      activeTopbar = null;
      clearOffset();
    }
  }
}

export const TopbarRoot = forwardRef<HTMLElement, TopbarProps>(function Topbar(
  { position = "sticky", borderless, elevated, className, ...rest },
  ref,
) {
  const localRef = useRef<HTMLElement | null>(null);

  const composedRef = useCallback(
    (node: HTMLElement | null) => {
      localRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as MutableRefObject<HTMLElement | null>).current = node;
    },
    [ref],
  );

  // Only sticky Topbars contribute to the content offset — a Topbar embedded
  // in a constrained preview (position="static") doesn't obscure page anchors.
  useEffect(() => {
    if (position !== "sticky") return;
    const el = localRef.current;
    if (!el) return;
    watch(el);
    return () => unwatch(el);
  }, [position]);

  return (
    <header
      ref={composedRef as Ref<HTMLElement>}
      className={cx(
        "bui-topbar",
        position === "static" && "bui-topbar--static",
        borderless && "bui-topbar--borderless",
        elevated && "bui-topbar--elevated",
        className,
      )}
      {...rest}
    />
  );
});

const TopbarTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  function TopbarTitle({ className, ...rest }, ref) {
    return <h1 ref={ref} className={cx("bui-topbar__title", className)} {...rest} />;
  },
);

const TopbarSpacer = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function TopbarSpacer({ className, ...rest }, ref) {
    return <span ref={ref} aria-hidden className={cx("bui-topbar__spacer", className)} {...rest} />;
  },
);

type TopbarComponent = typeof TopbarRoot & {
  Title: typeof TopbarTitle;
  Spacer: typeof TopbarSpacer;
};

export const Topbar = TopbarRoot as TopbarComponent;
Topbar.Title = TopbarTitle;
Topbar.Spacer = TopbarSpacer;
