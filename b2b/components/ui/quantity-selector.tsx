'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
  disabled?: boolean;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max,
  className,
  disabled = false,
}: QuantitySelectorProps) {
  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };

  const handleIncrement = () => {
    if (max === undefined || value < max) onChange(value + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || min;
    if (newValue >= min && (max === undefined || newValue <= max)) {
      onChange(newValue);
    }
  };

  const isAtMin = value <= min;
  const isAtMax = max !== undefined && value >= max;

  return (
    <div className={cn("inline-flex items-center", className)}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || isAtMin}
        className={cn(
          "flex items-center justify-center",
          "size-8 rounded-[var(--radius-sm)]",
          "border border-[hsl(var(--color-neutral-200))]",
          "bg-[hsl(var(--color-neutral-0))]",
          "text-[hsl(var(--color-neutral-600))]",
          "transition-all duration-[var(--transition-fast)]",
          "hover:bg-[hsl(var(--color-neutral-50))] hover:border-[hsl(var(--color-neutral-300))]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[hsl(var(--color-neutral-0))]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-brand-500))]"
        )}
        aria-label="Diminuir quantidade"
      >
        <Minus className="size-3.5" />
      </button>

      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        min={min}
        max={max}
        className={cn(
          "w-12 h-8 text-center",
          "text-[length:var(--text-sm)] font-medium",
          "text-[hsl(var(--color-neutral-700))]",
          "border-y border-[hsl(var(--color-neutral-200))]",
          "bg-[hsl(var(--color-neutral-0))]",
          "focus:outline-none",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        )}
        aria-label="Quantidade"
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || isAtMax}
        className={cn(
          "flex items-center justify-center",
          "size-8 rounded-[var(--radius-sm)]",
          "border border-[hsl(var(--color-neutral-200))]",
          "bg-[hsl(var(--color-neutral-0))]",
          "text-[hsl(var(--color-neutral-600))]",
          "transition-all duration-[var(--transition-fast)]",
          "hover:bg-[hsl(var(--color-neutral-50))] hover:border-[hsl(var(--color-neutral-300))]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[hsl(var(--color-neutral-0))]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-brand-500))]"
        )}
        aria-label="Aumentar quantidade"
      >
        <Plus className="size-3.5" />
      </button>

      {isAtMax && (
        <span
          className="ml-[var(--space-2)] text-[length:var(--text-xs)] text-[hsl(var(--color-error-500))]"
          role="alert"
        >
          Máximo: {max}
        </span>
      )}
    </div>
  );
}
