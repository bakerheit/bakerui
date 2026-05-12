import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  type RefObject,
} from "react";

export type Side = "top" | "right" | "bottom" | "left";
export type Align = "start" | "center" | "end";
export type Placement = Side | `${Side}-${Align}`;

export interface PositionResult {
  x: number;
  y: number;
  placement: Placement;
}

export interface UsePositionOptions {
  triggerRef: RefObject<HTMLElement | null>;
  contentRef: RefObject<HTMLElement | null>;
  open: boolean;
  placement?: Placement;
  /** Gap between trigger and content, in px. */
  offset?: number;
  /** Min distance from viewport edge. */
  padding?: number;
}

function parsePlacement(p: Placement): { side: Side; align: Align } {
  const [side, align] = p.split("-") as [Side, Align | undefined];
  return { side, align: align ?? "center" };
}

function oppositeSide(side: Side): Side {
  return ({ top: "bottom", bottom: "top", left: "right", right: "left" } as const)[side];
}

function compute(
  trigger: DOMRect,
  content: DOMRect,
  side: Side,
  align: Align,
  offset: number,
): { x: number; y: number } {
  let x = 0;
  let y = 0;

  if (side === "top" || side === "bottom") {
    if (align === "start") x = trigger.left;
    else if (align === "end") x = trigger.right - content.width;
    else x = trigger.left + (trigger.width - content.width) / 2;
    y = side === "top" ? trigger.top - content.height - offset : trigger.bottom + offset;
  } else {
    if (align === "start") y = trigger.top;
    else if (align === "end") y = trigger.bottom - content.height;
    else y = trigger.top + (trigger.height - content.height) / 2;
    x = side === "left" ? trigger.left - content.width - offset : trigger.right + offset;
  }

  return { x, y };
}

function fits(
  pos: { x: number; y: number },
  content: DOMRect,
  vw: number,
  vh: number,
  padding: number,
): boolean {
  return (
    pos.x >= padding &&
    pos.y >= padding &&
    pos.x + content.width <= vw - padding &&
    pos.y + content.height <= vh - padding
  );
}

export function usePosition({
  triggerRef,
  contentRef,
  open,
  placement = "bottom",
  offset = 8,
  padding = 8,
}: UsePositionOptions): PositionResult | null {
  const [result, setResult] = useState<PositionResult | null>(null);

  const update = useCallback(() => {
    const trigger = triggerRef.current;
    const content = contentRef.current;
    if (!trigger || !content) return;

    const triggerRect = trigger.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;

    const { side, align } = parsePlacement(placement);

    let chosenSide = side;
    let pos = compute(triggerRect, contentRect, side, align, offset);

    if (!fits(pos, contentRect, vw, vh, padding)) {
      const flipped = oppositeSide(side);
      const flippedPos = compute(triggerRect, contentRect, flipped, align, offset);
      if (fits(flippedPos, contentRect, vw, vh, padding)) {
        chosenSide = flipped;
        pos = flippedPos;
      }
    }

    pos.x = Math.max(padding, Math.min(pos.x, vw - contentRect.width - padding));
    pos.y = Math.max(padding, Math.min(pos.y, vh - contentRect.height - padding));

    const finalPlacement: Placement =
      align === "center" ? chosenSide : (`${chosenSide}-${align}` as Placement);

    setResult((prev) => {
      if (
        prev &&
        prev.x === pos.x &&
        prev.y === pos.y &&
        prev.placement === finalPlacement
      ) {
        return prev;
      }
      return { x: pos.x, y: pos.y, placement: finalPlacement };
    });
  }, [triggerRef, contentRef, placement, offset, padding]);

  // Compute the initial position synchronously after DOM mount, before paint.
  // Without this, the content would paint once at its fallback top:0;left:0
  // before the passive effect could read layout and set a transform.
  useLayoutEffect(() => {
    if (!open) {
      setResult(null);
      return;
    }
    update();
  }, [open, update]);

  // Attach scroll/resize/observer listeners passively while open.
  useEffect(() => {
    if (!open) return;

    // Scrolls that originate inside the popover content (e.g. scrolling
    // through a long Combobox list) don't move the trigger, so they must
    // not trigger a reposition. Without this guard, sub-pixel rounding and
    // scrollbar-gutter changes during the inner scroll visibly shift the
    // popover — most noticeable with end-aligned placements where x is
    // anchored to the content's right edge.
    const handleScroll = (event: Event) => {
      const target = event.target;
      if (target instanceof Node && contentRef.current?.contains(target)) {
        return;
      }
      update();
    };

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", update);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(update);
      if (contentRef.current) observer.observe(contentRef.current);
      if (triggerRef.current) observer.observe(triggerRef.current);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", update);
      observer?.disconnect();
    };
  }, [open, update, contentRef, triggerRef]);

  return result;
}
