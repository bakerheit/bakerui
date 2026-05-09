import type { ReactNode } from "react";
import { createPortal } from "react-dom";

export interface PortalProps {
  children: ReactNode;
  container?: Element | null;
}

export function Portal({ children, container }: PortalProps) {
  if (typeof document === "undefined") return null;
  const target = container ?? document.body;
  if (!target) return null;
  return createPortal(children, target);
}
