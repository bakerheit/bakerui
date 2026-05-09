import {
  Children,
  Fragment,
  cloneElement,
  forwardRef,
  isValidElement,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { cx } from "../../utils/cx";
import { composeRefs } from "../../utils/useComposedRefs";
import "./Breadcrumb.css";

export interface BreadcrumbProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** Custom separator between items. Defaults to a chevron icon. */
  separator?: ReactNode;
  children?: ReactNode;
}

export const BreadcrumbRoot = forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb(
  { separator, className, children, ...rest },
  ref,
) {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement[];
  const sep = separator ?? <ChevronIcon />;

  return (
    <nav ref={ref} aria-label="Breadcrumb" className={className} {...rest}>
      <ol className={cx("bui-breadcrumb")}>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          // Mark the last item as the current page when it isn't already.
          const itemEl =
            isLast && (item.props as { current?: boolean }).current === undefined
              ? cloneElement(item as ReactElement<{ current?: boolean }>, { current: true })
              : item;
          return (
            <Fragment key={item.key ?? idx}>
              {itemEl}
              {!isLast && (
                <li aria-hidden className="bui-breadcrumb__separator">
                  {sep}
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
});

interface BreadcrumbItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Marks this as the current page; renders as a non-link span. */
  current?: boolean;
  /** Render as the supplied child (e.g., a router Link). */
  asChild?: boolean;
}

const BreadcrumbItem = forwardRef<HTMLElement, BreadcrumbItemProps>(function BreadcrumbItem(
  { current, asChild, href, className, children, ...rest },
  ref,
) {
  if (current || (!href && !asChild)) {
    return (
      <li className="bui-breadcrumb__item">
        <span
          ref={ref as Ref<HTMLSpanElement>}
          aria-current="page"
          className={cx("bui-breadcrumb__current", className)}
          {...(rest as HTMLAttributes<HTMLSpanElement>)}
        >
          {children}
        </span>
      </li>
    );
  }

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string }> & {
      ref?: Ref<HTMLElement>;
    };
    return (
      <li className="bui-breadcrumb__item">
        {cloneElement(child, {
          className: cx("bui-breadcrumb__link", child.props.className),
          ref: composeRefs(ref as Ref<HTMLElement>, child.ref),
          ...rest,
        } as Record<string, unknown>)}
      </li>
    );
  }

  return (
    <li className="bui-breadcrumb__item">
      <a
        ref={ref as Ref<HTMLAnchorElement>}
        href={href}
        className={cx("bui-breadcrumb__link", className)}
        {...rest}
      >
        {children}
      </a>
    </li>
  );
});

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 3.5L8.5 7 5 10.5" />
    </svg>
  );
}

type BreadcrumbComponent = typeof BreadcrumbRoot & {
  Item: typeof BreadcrumbItem;
};

export const Breadcrumb = BreadcrumbRoot as BreadcrumbComponent;
Breadcrumb.Item = BreadcrumbItem;
