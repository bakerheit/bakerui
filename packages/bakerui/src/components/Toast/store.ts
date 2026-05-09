import type { ReactNode } from "react";

export type ToastTone = "neutral" | "info" | "success" | "warning" | "danger";

export interface ToastData {
  id: string;
  tone: ToastTone;
  title?: ReactNode;
  description?: ReactNode;
  /** Right-aligned action buttons. */
  actions?: ReactNode;
  /** Auto-dismiss after this many ms. 0 disables auto-dismiss. */
  duration: number;
  /** Render a leading spinner instead of the tone icon. */
  loading?: boolean;
  /** Whether the user has dismissed (or auto-dismiss fired). The Toaster keeps
   * rendering this toast until its exit animation finishes. */
  dismissed?: boolean;
  /** Called when the toast is fully removed (after exit animation). */
  onDismiss?: () => void;
  createdAt: number;
}

export interface AddToastInput {
  id?: string;
  tone?: ToastTone;
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  duration?: number;
  loading?: boolean;
  onDismiss?: () => void;
}

type Listener = () => void;

const DEFAULT_DURATION = 4000;

class ToastStore {
  private _toasts: ToastData[] = [];
  private listeners = new Set<Listener>();

  /** Snapshot — referentially stable between mutations. */
  get toasts(): ToastData[] {
    return this._toasts;
  }

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): ToastData[] => this._toasts;

  private emit() {
    this.listeners.forEach((l) => l());
  }

  add(input: AddToastInput): string {
    const id = input.id ?? `bui-toast-${Math.random().toString(36).slice(2, 10)}`;
    const tone = input.tone ?? "neutral";
    const isLoading = !!input.loading;
    const duration =
      input.duration !== undefined
        ? input.duration
        : isLoading
          ? 0
          : DEFAULT_DURATION;
    const next: ToastData = {
      id,
      tone,
      title: input.title,
      description: input.description,
      actions: input.actions,
      duration,
      loading: isLoading,
      onDismiss: input.onDismiss,
      createdAt: Date.now(),
    };
    // If a toast with this id already exists, replace it (used by .update).
    const existing = this._toasts.findIndex((t) => t.id === id);
    if (existing >= 0) {
      this._toasts = [
        ...this._toasts.slice(0, existing),
        next,
        ...this._toasts.slice(existing + 1),
      ];
    } else {
      this._toasts = [...this._toasts, next];
    }
    this.emit();
    return id;
  }

  update(id: string, patch: Partial<AddToastInput>): void {
    const idx = this._toasts.findIndex((t) => t.id === id);
    if (idx < 0) return;
    const current = this._toasts[idx];
    const merged: ToastData = {
      ...current,
      ...patch,
      tone: patch.tone ?? current.tone,
      duration: patch.duration ?? current.duration,
      loading: patch.loading ?? current.loading,
      // Reset dismissed so an updated toast (e.g., promise resolve) re-shows.
      dismissed: false,
    };
    this._toasts = [
      ...this._toasts.slice(0, idx),
      merged,
      ...this._toasts.slice(idx + 1),
    ];
    this.emit();
  }

  /** Mark a toast as dismissed; the Toaster will run its exit animation. */
  dismiss(id?: string): void {
    if (id) {
      const idx = this._toasts.findIndex((t) => t.id === id);
      if (idx < 0) return;
      this._toasts = [
        ...this._toasts.slice(0, idx),
        { ...this._toasts[idx], dismissed: true },
        ...this._toasts.slice(idx + 1),
      ];
    } else {
      this._toasts = this._toasts.map((t) => ({ ...t, dismissed: true }));
    }
    this.emit();
  }

  /** Remove a toast from the store entirely (called by ToastItem after exit). */
  remove(id: string): void {
    const t = this._toasts.find((x) => x.id === id);
    if (!t) return;
    t.onDismiss?.();
    this._toasts = this._toasts.filter((x) => x.id !== id);
    this.emit();
  }
}

export const toastStore = new ToastStore();
