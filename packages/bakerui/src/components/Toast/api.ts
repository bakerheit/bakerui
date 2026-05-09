import type { ReactNode } from "react";
import { toastStore, type AddToastInput, type ToastTone } from "./store";

type ShortInput = ReactNode | (Omit<AddToastInput, "tone"> & { tone?: ToastTone });

function normalize(input: ShortInput, fallbackTone?: ToastTone): AddToastInput {
  if (input === null || input === undefined) {
    return { tone: fallbackTone };
  }
  if (typeof input === "string" || typeof input === "number" || typeof input === "boolean") {
    return { title: input, tone: fallbackTone };
  }
  // ReactElement vs options object: detect by `$$typeof` (React element marker).
  if (typeof input === "object" && input !== null && (input as { $$typeof?: symbol }).$$typeof) {
    return { title: input as ReactNode, tone: fallbackTone };
  }
  // Treat as options object.
  const opts = input as AddToastInput;
  return { ...opts, tone: opts.tone ?? fallbackTone };
}

interface PromiseMessages<T> {
  loading: ReactNode;
  success: ReactNode | ((value: T) => ReactNode);
  error: ReactNode | ((err: unknown) => ReactNode);
}

export interface ToastApi {
  (input: ShortInput): string;
  success: (input: ShortInput) => string;
  error: (input: ShortInput) => string;
  warning: (input: ShortInput) => string;
  info: (input: ShortInput) => string;
  loading: (input: ShortInput) => string;
  dismiss: (id?: string) => void;
  update: (id: string, patch: Partial<AddToastInput>) => void;
  promise: <T>(p: Promise<T>, msgs: PromiseMessages<T>) => Promise<T>;
}

const fn = ((input: ShortInput) => toastStore.add(normalize(input))) as ToastApi;

fn.success = (input) => toastStore.add(normalize(input, "success"));
fn.error = (input) => toastStore.add(normalize(input, "danger"));
fn.warning = (input) => toastStore.add(normalize(input, "warning"));
fn.info = (input) => toastStore.add(normalize(input, "info"));
fn.loading = (input) => {
  const opts = normalize(input);
  return toastStore.add({ ...opts, loading: true, duration: opts.duration ?? 0 });
};
fn.dismiss = (id) => toastStore.dismiss(id);
fn.update = (id, patch) => toastStore.update(id, patch);
fn.promise = <T,>(p: Promise<T>, msgs: PromiseMessages<T>): Promise<T> => {
  const id = fn.loading(msgs.loading);
  return p.then(
    (value) => {
      const title = typeof msgs.success === "function" ? msgs.success(value) : msgs.success;
      toastStore.update(id, { tone: "success", title, loading: false, duration: 4000 });
      return value;
    },
    (err) => {
      const title = typeof msgs.error === "function" ? msgs.error(err) : msgs.error;
      toastStore.update(id, { tone: "danger", title, loading: false, duration: 6000 });
      throw err;
    },
  );
};

export const toast: ToastApi = fn;
