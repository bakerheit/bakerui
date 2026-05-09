import { useEffect, type RefObject } from "react";

export function useClickOutside(
  active: boolean,
  refs: RefObject<HTMLElement | null> | RefObject<HTMLElement | null>[],
  callback: (event: MouseEvent | TouchEvent) => void,
) {
  useEffect(() => {
    if (!active) return;
    const list = Array.isArray(refs) ? refs : [refs];

    const handler = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      for (const ref of list) {
        if (ref.current && ref.current.contains(target)) return;
      }
      callback(event);
    };

    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [active, refs, callback]);
}
