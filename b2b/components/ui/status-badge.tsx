'use client';

import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
  showDot?: boolean;
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, {
  bg: string;
  text: string;
  dot: string;
  pulse?: boolean;
}> = {
  // Order statuses
  pendente: {
    bg: "bg-[hsl(var(--color-warning-50))]",
    text: "text-[hsl(var(--color-warning-700))]",
    dot: "bg-[hsl(var(--color-warning-500))]",
  },
  confirmado: {
    bg: "bg-[hsl(var(--color-info-50))]",
    text: "text-[hsl(var(--color-info-700))]",
    dot: "bg-[hsl(var(--color-info-500))]",
  },
  em_preparo: {
    bg: "bg-[hsl(var(--color-info-50))]",
    text: "text-[hsl(var(--color-info-700))]",
    dot: "bg-[hsl(var(--color-info-500))]",
  },
  enviado: {
    bg: "bg-[hsl(var(--color-brand-50))]",
    text: "text-[hsl(var(--color-brand-600))]",
    dot: "bg-[hsl(var(--color-brand-500))]",
  },
  entregue: {
    bg: "bg-[hsl(var(--color-success-50))]",
    text: "text-[hsl(var(--color-success-700))]",
    dot: "bg-[hsl(var(--color-success-500))]",
    pulse: true,
  },
  cancelado: {
    bg: "bg-[hsl(var(--color-error-50))]",
    text: "text-[hsl(var(--color-error-700))]",
    dot: "bg-[hsl(var(--color-error-500))]",
  },
  // Generic statuses
  ativo: {
    bg: "bg-[hsl(var(--color-success-50))]",
    text: "text-[hsl(var(--color-success-700))]",
    dot: "bg-[hsl(var(--color-success-500))]",
    pulse: true,
  },
  inativo: {
    bg: "bg-[hsl(var(--color-neutral-100))]",
    text: "text-[hsl(var(--color-neutral-600))]",
    dot: "bg-[hsl(var(--color-neutral-400))]",
  },
  success: {
    bg: "bg-[hsl(var(--color-success-50))]",
    text: "text-[hsl(var(--color-success-700))]",
    dot: "bg-[hsl(var(--color-success-500))]",
    pulse: true,
  },
  warning: {
    bg: "bg-[hsl(var(--color-warning-50))]",
    text: "text-[hsl(var(--color-warning-700))]",
    dot: "bg-[hsl(var(--color-warning-500))]",
  },
  error: {
    bg: "bg-[hsl(var(--color-error-50))]",
    text: "text-[hsl(var(--color-error-700))]",
    dot: "bg-[hsl(var(--color-error-500))]",
  },
  info: {
    bg: "bg-[hsl(var(--color-info-50))]",
    text: "text-[hsl(var(--color-info-700))]",
    dot: "bg-[hsl(var(--color-info-500))]",
  },
  neutral: {
    bg: "bg-[hsl(var(--color-neutral-100))]",
    text: "text-[hsl(var(--color-neutral-600))]",
    dot: "bg-[hsl(var(--color-neutral-400))]",
  },
};

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  em_preparo: "Em Preparo",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
  ativo: "Ativo",
  inativo: "Inativo",
};

export function StatusBadge({
  status,
  label,
  className,
  showDot = true,
  size = 'md',
}: StatusBadgeProps) {
  const key = status.toLowerCase().replace(/\s+/g, '_');
  const config = statusConfig[key] || statusConfig.neutral;
  const displayLabel = label || statusLabels[key] || status;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-[var(--space-1-5)]",
        "rounded-[var(--radius-full)] font-medium",
        config.bg,
        config.text,
        size === 'sm' ? "px-2 py-0.5 text-[length:var(--text-xs)]" : "px-2.5 py-1 text-[length:var(--text-xs)]",
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            "inline-block size-1.5 rounded-full",
            config.dot,
            config.pulse && "animate-pulse-dot"
          )}
          aria-hidden="true"
        />
      )}
      {displayLabel}
    </span>
  );
}
