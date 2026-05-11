import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

interface TocNode {
  id: string;
  label: string;
  items: TocNode[];
}

export interface PageLayoutProps {
  children: ReactNode;
}

/**
 * The App renders the right-rail aside and exposes its DOM node here.
 * PageLayout reads it from context and portals its discovered TOC into
 * that aside, so the rail lives outside the scrolling main pane (a true
 * sibling sidebar) while the TOC content is still owned by the page.
 */
export const TocSlotContext = createContext<HTMLElement | null>(null);

/**
 * Constrains page width and discovers a TOC from DocSection / DocExample
 * anchors in the rendered DOM. Discovered entries get portaled into the
 * App's right-rail slot via TocSlotContext.
 */
export function PageLayout({ children }: PageLayoutProps) {
  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null);
  const tree = useTocTree();
  const ids = flattenIds(tree);
  const active = useActiveSection(ids, rootEl);
  const tocSlot = useContext(TocSlotContext);

  return (
    <div className="page-layout" ref={setRootEl}>
      {children}
      {tree.length > 0 && tocSlot
        ? createPortal(<Toc tree={tree} active={active} />, tocSlot)
        : null}
    </div>
  );
}

function Toc({ tree, active }: { tree: TocNode[]; active: string | null }) {
  // 3-level layout (categories → sections → examples) needs a distinct
  // scale so the middle tier — the component names — doesn't end up
  // visually smaller than the sub-items below it. Detect from the tree.
  const isNested = tree.some((node) =>
    node.items.some((child) => child.items.length > 0),
  );
  return (
    <div className={isNested ? "page-toc page-toc--nested" : "page-toc"}>
      <div className="page-toc__heading">On this page</div>
      <ul className="page-toc__list">
        {tree.map((node) => (
          <TocLink key={node.id} node={node} active={active} depth={0} />
        ))}
      </ul>
    </div>
  );
}

function TocLink({
  node,
  active,
  depth,
}: {
  node: TocNode;
  active: string | null;
  depth: number;
}) {
  const isActive = active === node.id;
  return (
    <li>
      <a
        href={`#${node.id}`}
        className={
          isActive ? "page-toc__link page-toc__link--active" : "page-toc__link"
        }
        data-depth={depth}
        onClick={(e) => {
          e.preventDefault();
          const el = document.getElementById(node.id);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            history.replaceState(null, "", `#${node.id}`);
          }
        }}
      >
        {node.label}
      </a>
      {node.items.length > 0 && (
        <ul className="page-toc__sublist">
          {node.items.map((item) => (
            <TocLink key={item.id} node={item} active={active} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

function flattenIds(tree: TocNode[]): string[] {
  const out: string[] = [];
  const walk = (nodes: TocNode[]) => {
    for (const n of nodes) {
      out.push(n.id);
      if (n.items.length) walk(n.items);
    }
  };
  walk(tree);
  return out;
}

/**
 * Discover the TOC from the rendered DOM. Two modes:
 *
 *  • Category mode — pages that mark groups with `data-toc-category` (e.g.
 *    the consolidated Components page). Categories sit at the top level,
 *    `data-toc-section` items nest beneath their parent category, and each
 *    section's `data-toc-example` entries (Options / individual examples)
 *    nest one level deeper. Three-level hierarchy.
 *
 *  • Flat mode — every other page. Sections at the top level, with their
 *    examples nested below them. Two-level hierarchy.
 */
function useTocTree(): TocNode[] {
  const [tree, setTree] = useState<TocNode[]>([]);
  const lastJsonRef = useRef("");

  useLayoutEffect(() => {
    const examplesOf = (parent: HTMLElement): TocNode[] =>
      Array.from(parent.querySelectorAll<HTMLElement>("[data-toc-example]"))
        .filter((ex) => !!ex.id)
        .map((ex) => ({
          id: ex.id,
          label: ex.dataset.tocLabel ?? ex.id,
          items: [],
        }));

    const sectionToNode = (section: HTMLElement): TocNode => ({
      id: section.id,
      label: section.dataset.tocLabel ?? section.id,
      items: examplesOf(section),
    });

    const categories = Array.from(
      document.querySelectorAll<HTMLElement>("[data-toc-category]"),
    );

    let next: TocNode[];
    if (categories.length > 0) {
      next = categories.map((cat) => ({
        id: cat.id,
        label: cat.dataset.tocLabel ?? cat.id,
        items: Array.from(
          cat.querySelectorAll<HTMLElement>("[data-toc-section]"),
        )
          .filter((s) => !!s.id)
          .map(sectionToNode),
      }));
    } else {
      next = Array.from(
        document.querySelectorAll<HTMLElement>("[data-toc-section]"),
      ).map(sectionToNode);
    }

    const json = JSON.stringify(next);
    if (json !== lastJsonRef.current) {
      lastJsonRef.current = json;
      setTree(next);
    }
  });

  return tree;
}

/**
 * Active-section spy. The body no longer scrolls — the App's main pane is
 * the scroll source. Walk up from the page-layout root to find any
 * scrolling ancestor and listen there too.
 */
function useActiveSection(
  ids: string[],
  rootEl: HTMLElement | null,
): string | null {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);
  const activeRef = useRef<string | null>(active);
  activeRef.current = active;

  useEffect(() => {
    if (ids.length === 0) {
      setActive(null);
      return;
    }

    let rafId: number | null = null;

    const update = () => {
      rafId = null;
      const triggerY = getTriggerOffset();

      let bestId: string | null = null;
      let bestTop = -Infinity;
      let activeTop: number | null = null;

      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (id === activeRef.current) activeTop = top;
        if (top - triggerY <= 1) {
          if (top > bestTop) {
            bestTop = top;
            bestId = id;
          }
        }
      }

      if (bestId === null) {
        const next = ids[0] ?? null;
        if (next !== activeRef.current) setActive(next);
        return;
      }

      if (
        activeRef.current &&
        activeRef.current !== bestId &&
        activeTop !== null &&
        activeTop - triggerY <= 1 &&
        bestTop - activeTop < HYSTERESIS
      ) {
        return;
      }

      if (bestId !== activeRef.current) setActive(bestId);
    };

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(update);
    };

    const scrollers: (HTMLElement | Window)[] = [window];
    let n = rootEl?.parentElement ?? null;
    while (n && n !== document.body) {
      const overflowY = getComputedStyle(n).overflowY;
      if (overflowY === "auto" || overflowY === "scroll") scrollers.push(n);
      n = n.parentElement;
    }

    update();
    scrollers.forEach((s) =>
      s.addEventListener("scroll", onScroll, { passive: true }),
    );
    window.addEventListener("resize", onScroll);
    return () => {
      scrollers.forEach((s) => s.removeEventListener("scroll", onScroll));
      window.removeEventListener("resize", onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [ids.join(","), rootEl]);

  return active;
}

const HYSTERESIS = 24;

function getTriggerOffset(): number {
  if (typeof document === "undefined") return 0;
  const topbar = document.querySelector<HTMLElement>(
    ".bui-topbar:not(.bui-topbar--static)",
  );
  const topbarHeight = topbar ? topbar.getBoundingClientRect().height : 0;
  return topbarHeight + 40;
}
