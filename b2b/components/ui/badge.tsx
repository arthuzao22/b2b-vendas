import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  [
    "inline-flex items-center",
    "rounded-[var(--radius-full)]",
    "px-2.5 py-0.5",
    "text-[length:var(--text-xs)] font-medium",
    "transition-colors duration-[var(--transition-fast)]",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-[hsl(var(--color-brand-50))] text-[hsl(var(--color-brand-600))]",
        success: "bg-[hsl(var(--color-success-50))] text-[hsl(var(--color-success-700))]",
        warning: "bg-[hsl(var(--color-warning-50))] text-[hsl(var(--color-warning-700))]",
        error: "bg-[hsl(var(--color-error-50))] text-[hsl(var(--color-error-700))]",
        destructive: "bg-[hsl(var(--color-error-50))] text-[hsl(var(--color-error-700))]",
        info: "bg-[hsl(var(--color-info-50))] text-[hsl(var(--color-info-700))]",
        neutral: "bg-[hsl(var(--color-neutral-100))] text-[hsl(var(--color-neutral-600))]",
        secondary: "bg-[hsl(var(--color-neutral-100))] text-[hsl(var(--color-neutral-600))]",
        outline: "border border-[hsl(var(--color-neutral-200))] text-[hsl(var(--color-neutral-600))]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
