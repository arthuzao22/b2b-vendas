// Price Display component for formatting prices in BRL
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  value: number | string;
  className?: string;
  showPrefix?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-2xl font-bold",
};

export function PriceDisplay({
  value,
  className,
  showPrefix = false,
  size = "md",
}: PriceDisplayProps) {
  const formatted = formatCurrency(value);
  
  return (
    <span className={cn("font-semibold text-primary", sizeClasses[size], className)}>
      {showPrefix && "R$ "}
      {formatted}
    </span>
  );
}
