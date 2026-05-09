import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
} from "react";
import { composeRefs } from "../../utils/useComposedRefs";

export interface SlotProps extends HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

/**
 * Slot lets a component delegate its rendering to a child element while still
 * passing down props, refs, and event handlers. Used by `<X.Trigger asChild>`
 * patterns so consumers can swap in any element/component as the trigger.
 */
export const Slot = forwardRef<HTMLElement, SlotProps>(function Slot(
  { children, ...slotProps },
  ref,
) {
  if (!isValidElement(children)) {
    return null;
  }
  const child = Children.only(children) as ReactElement<Record<string, unknown>>;
  const childProps = child.props ?? {};
  const merged = mergeProps(slotProps, childProps);

  const childRef = (child as unknown as { ref?: Ref<HTMLElement> }).ref;
  (merged as Record<string, unknown>).ref = composeRefs(ref, childRef);

  return cloneElement(child, merged);
});

function mergeProps(
  slotProps: Record<string, unknown>,
  childProps: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...childProps };

  for (const key in slotProps) {
    const slotValue = slotProps[key];
    const childValue = childProps[key];

    // Compose event handlers — call slot handler then child's. Child handler
    // can call `event.preventDefault()` to skip the slot handler... but our
    // typical pattern is the opposite (slot fires first, child can still run).
    if (/^on[A-Z]/.test(key) && typeof slotValue === "function") {
      out[key] =
        typeof childValue === "function"
          ? (...args: unknown[]) => {
              (slotValue as (...a: unknown[]) => void)(...args);
              const event = args[0] as { defaultPrevented?: boolean } | undefined;
              if (!event?.defaultPrevented) {
                (childValue as (...a: unknown[]) => void)(...args);
              }
            }
          : slotValue;
      continue;
    }

    // Merge classNames.
    if (key === "className") {
      out.className = [slotValue, childValue].filter(Boolean).join(" ");
      continue;
    }

    // Merge styles.
    if (key === "style") {
      out.style = { ...(slotValue as object), ...(childValue as object) };
      continue;
    }

    // Default: child wins (preserves explicit child overrides).
    if (childValue === undefined) out[key] = slotValue;
  }

  return out;
}
