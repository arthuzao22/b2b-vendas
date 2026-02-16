'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

// Global toast store
let listeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];
const MAX_VISIBLE = 3;

function notify() {
  listeners.forEach((listener) => listener([...toasts]));
}

export function toast(options: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast: Toast = { ...options, id, duration: options.duration ?? 5000 };
  toasts = [newToast, ...toasts].slice(0, MAX_VISIBLE);
  notify();
  return id;
}

export function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  notify();
}

// Convenience methods
toast.success = (title: string, message?: string) => toast({ type: 'success', title, message });
toast.error = (title: string, message?: string) => toast({ type: 'error', title, message });
toast.warning = (title: string, message?: string) => toast({ type: 'warning', title, message });
toast.info = (title: string, message?: string) => toast({ type: 'info', title, message });

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const borderColorMap = {
  success: 'border-l-[hsl(var(--color-success-500))]',
  error: 'border-l-[hsl(var(--color-error-500))]',
  warning: 'border-l-[hsl(var(--color-warning-500))]',
  info: 'border-l-[hsl(var(--color-info-500))]',
};

const iconColorMap = {
  success: 'text-[hsl(var(--color-success-500))]',
  error: 'text-[hsl(var(--color-error-500))]',
  warning: 'text-[hsl(var(--color-warning-500))]',
  info: 'text-[hsl(var(--color-info-500))]',
};

const progressColorMap = {
  success: 'bg-[hsl(var(--color-success-500))]',
  error: 'bg-[hsl(var(--color-error-500))]',
  warning: 'bg-[hsl(var(--color-warning-500))]',
  info: 'bg-[hsl(var(--color-info-500))]',
};

function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [isExiting, setIsExiting] = useState(false);
  const Icon = iconMap[t.type];

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onDismiss(t.id), 150);
  }, [t.id, onDismiss]);

  useEffect(() => {
    if (t.duration && t.duration > 0) {
      const timer = setTimeout(handleDismiss, t.duration);
      return () => clearTimeout(timer);
    }
  }, [t.duration, handleDismiss]);

  return (
    <div
      className={cn(
        "relative flex items-start gap-[var(--space-3)]",
        "w-full max-w-[400px]",
        "bg-[hsl(var(--color-neutral-0))]",
        "rounded-[var(--radius-lg)]",
        "shadow-[var(--shadow-lg)]",
        "border border-[hsl(var(--color-neutral-200))]",
        "border-l-[3px]",
        borderColorMap[t.type],
        "p-[var(--space-4)]",
        "transition-all duration-[var(--transition-base)]",
        isExiting
          ? "opacity-0 translate-x-[100%]"
          : "opacity-100 translate-x-0 animate-in slide-in-from-right"
      )}
      role="alert"
    >
      <Icon className={cn("size-5 shrink-0 mt-0.5", iconColorMap[t.type])} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-[length:var(--text-sm)] font-medium text-[hsl(var(--color-neutral-800))]">
          {t.title}
        </p>
        {t.message && (
          <p className="mt-[var(--space-0-5)] text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-500))]">
            {t.message}
          </p>
        )}
      </div>
      <button
        onClick={handleDismiss}
        className={cn(
          "shrink-0 p-1 rounded-[var(--radius-sm)]",
          "text-[hsl(var(--color-neutral-400))]",
          "hover:text-[hsl(var(--color-neutral-600))] hover:bg-[hsl(var(--color-neutral-50))]",
          "transition-colors duration-[var(--transition-fast)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-brand-500))]"
        )}
        aria-label="Fechar notificação"
      >
        <X className="size-3.5" />
      </button>

      {/* Progress bar */}
      {t.duration && t.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden rounded-b-[var(--radius-lg)]">
          <div
            className={cn("h-full animate-toast-progress", progressColorMap[t.type])}
            style={{ animationDuration: `${t.duration}ms` }}
          />
        </div>
      )}
    </div>
  );
}

export function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);

  useEffect(() => {
    listeners.push(setCurrentToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setCurrentToasts);
    };
  }, []);

  if (currentToasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-[var(--space-6)] right-[var(--space-6)] z-[var(--z-toast)] flex flex-col gap-[var(--space-2)]"
      aria-live="polite"
      aria-label="Notificações"
    >
      {currentToasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={dismissToast} />
      ))}
    </div>
  );
}
