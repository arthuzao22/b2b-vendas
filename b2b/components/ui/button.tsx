import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-medium tracking-wide",
    "transition-all duration-[var(--transition-fast)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-brand-500))] focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.98] active:transition-[50ms]",
    "select-none cursor-pointer",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "bg-[hsl(var(--color-brand-500))] text-white",
          "hover:bg-[hsl(var(--color-brand-600))] hover:shadow-[var(--shadow-sm)]",
        ].join(" "),
        secondary: [
          "bg-[hsl(var(--color-neutral-0))] text-[hsl(var(--color-neutral-700))]",
          "border border-[hsl(var(--color-neutral-200))]",
          "hover:bg-[hsl(var(--color-neutral-50))] hover:border-[hsl(var(--color-neutral-300))]",
        ].join(" "),
        ghost: [
          "bg-transparent text-[hsl(var(--color-neutral-600))]",
          "hover:bg-[hsl(var(--color-neutral-50))]",
        ].join(" "),
        destructive: [
          "bg-[hsl(var(--color-error-500))] text-white",
          "hover:bg-[hsl(var(--color-error-700))]",
        ].join(" "),
        link: [
          "bg-transparent text-[hsl(var(--color-brand-500))] underline-offset-4",
          "hover:underline hover:text-[hsl(var(--color-brand-600))]",
          "active:scale-100",
        ].join(" "),
        // Backwards compatibility aliases
        default: [
          "bg-[hsl(var(--color-brand-500))] text-white",
          "hover:bg-[hsl(var(--color-brand-600))] hover:shadow-[var(--shadow-sm)]",
        ].join(" "),
        outline: [
          "bg-[hsl(var(--color-neutral-0))] text-[hsl(var(--color-neutral-700))]",
          "border border-[hsl(var(--color-neutral-200))]",
          "hover:bg-[hsl(var(--color-neutral-50))] hover:border-[hsl(var(--color-neutral-300))]",
        ].join(" "),
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-[var(--radius-md)] [&_svg]:size-3.5",
        md: "h-9 px-4 text-sm rounded-[var(--radius-md)] [&_svg]:size-4",
        default: "h-9 px-4 text-sm rounded-[var(--radius-md)] [&_svg]:size-4",
        lg: "h-11 px-6 text-sm rounded-[var(--radius-md)] [&_svg]:size-[18px]",
        icon: "h-9 w-9 rounded-[var(--radius-md)] [&_svg]:size-4",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin-fast" aria-hidden="true" />
            <span className="sr-only">Carregando...</span>
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
