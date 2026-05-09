import { useCallback, type Ref, type RefCallback } from "react";

type AnyRef<T> = Ref<T> | undefined;

function setRef<T>(ref: AnyRef<T>, value: T | null): void {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref && typeof ref === "object") {
    (ref as { current: T | null }).current = value;
  }
}

export function composeRefs<T>(...refs: AnyRef<T>[]): RefCallback<T> {
  return (node) => {
    for (const ref of refs) setRef(ref, node);
  };
}

export function useComposedRefs<T>(...refs: AnyRef<T>[]): RefCallback<T> {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(composeRefs(...refs), refs);
}
