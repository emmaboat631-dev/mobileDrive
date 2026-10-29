'use client';

import { create } from 'zustand';

export type ToastTone = 'default' | 'success' | 'warning' | 'danger' | 'info';

export interface Toast {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** Milliseconds. 0 = sticky, user must dismiss. Default 4500. */
  duration?: number;
}

interface ToastInput extends Omit<Toast, 'id'> {}

interface ToastState {
  toasts: Toast[];
  push: (toast: ToastInput) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

export const useToasts = create<ToastState>((set, get) => ({
  toasts: [],
  push: (toast) => {
    const id = 't_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
    const t: Toast = { id, duration: 4500, ...toast };
    set((s) => ({ toasts: [...s.toasts, t] }));
    if (t.duration && t.duration > 0) {
      window.setTimeout(() => get().dismiss(id), t.duration);
    }
    return id;
  },
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));

/** Shorthand helpers so call sites don't repeat tone defaults. */
export const toast = {
  success: (title: string, description?: string, extra?: Partial<ToastInput>) =>
    useToasts.getState().push({ tone: 'success', title, description, ...extra }),
  info: (title: string, description?: string, extra?: Partial<ToastInput>) =>
    useToasts.getState().push({ tone: 'info', title, description, ...extra }),
  warn: (title: string, description?: string, extra?: Partial<ToastInput>) =>
    useToasts.getState().push({ tone: 'warning', title, description, ...extra }),
  error: (title: string, description?: string, extra?: Partial<ToastInput>) =>
    useToasts.getState().push({ tone: 'danger', title, description, ...extra }),
};
