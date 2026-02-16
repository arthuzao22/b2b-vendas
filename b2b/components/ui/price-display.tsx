import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  price?: number | string;
  /** @deprecated Use `price` instead */
  value?: number | string;
  originalPrice?: number | string;
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
  discount?: number;
  className?: string;
}

function formatCurrency(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
}

export function PriceDisplay({
  price,
  value,
  originalPrice,
  unit,
  size = 'md',
  discount,
  className,
}: PriceDisplayProps) {
  const resolvedPrice = price ?? value ?? 0;
  const priceNum = typeof resolvedPrice === 'string' ? parseFloat(resolvedPrice) : resolvedPrice;
  const hasDiscount = originalPrice || discount;

  return (
    <div className={cn("flex flex-col", className)}>
      {hasDiscount && originalPrice && (
        <div className="flex items-center gap-[var(--space-2)]">
          <span className="text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-400))] line-through">
            {formatCurrency(originalPrice)}
          </span>
          {discount && (
            <span className="inline-flex items-center px-[var(--space-1-5)] py-0.5 rounded-[var(--radius-sm)] bg-[hsl(var(--color-error-50))] text-[length:var(--text-xs)] font-medium text-[hsl(var(--color-error-700))]">
              −{discount}%
            </span>
          )}
        </div>
      )}
      <div className="flex items-baseline gap-[var(--space-1)]">
        <span
          className={cn(
            "font-bold text-[hsl(var(--color-neutral-900))]",
            size === 'sm' && "text-[length:var(--text-md)]",
            size === 'md' && "text-[length:var(--text-lg)]",
            size === 'lg' && "text-[length:var(--text-2xl)]"
          )}
        >
          {formatCurrency(priceNum)}
        </span>
        {unit && (
          <span className="text-[length:var(--text-xs)] text-[hsl(var(--color-neutral-500))]">
            / {unit}
          </span>
        )}
      </div>
    </div>
  );
}
