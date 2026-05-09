import { useEffect } from "react";

let lockCount = 0;
let savedOverflow: string | null = null;
let savedPaddingRight: string | null = null;

export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    if (lockCount === 0) {
      const body = document.body;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      savedOverflow = body.style.overflow;
      savedPaddingRight = body.style.paddingRight;
      body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`;
      }
    }
    lockCount += 1;

    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        document.body.style.overflow = savedOverflow ?? "";
        document.body.style.paddingRight = savedPaddingRight ?? "";
        savedOverflow = null;
        savedPaddingRight = null;
      }
    };
  }, [active]);
}
