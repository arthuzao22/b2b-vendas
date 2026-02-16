import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-[var(--radius-lg)] transition-all duration-[var(--transition-base)]",
  {
    variants: {
      variant: {
        default: [
          "bg-[hsl(var(--color-neutral-0))]",
          "border border-[hsl(var(--color-neutral-200))]",
          "shadow-[var(--shadow-xs)]",
        ].join(" "),
        elevated: [
          "bg-[hsl(var(--color-neutral-0))]",
          "shadow-[var(--shadow-md)]",
        ].join(" "),
        interactive: [
          "bg-[hsl(var(--color-neutral-0))]",
          "border border-[hsl(var(--color-neutral-200))]",
          "shadow-[var(--shadow-xs)]",
          "cursor-pointer",
          "hover:shadow-[var(--shadow-md)] hover:border-[hsl(var(--color-neutral-300))]",
        ].join(" "),
        highlighted: [
          "bg-[hsl(var(--color-brand-50))]",
          "border border-[hsl(var(--color-brand-200))]",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardVariants({ variant }), className)}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-[var(--space-1-5)] p-[var(--space-6)] pb-[var(--space-4)]", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-[length:var(--text-md)] font-semibold leading-none tracking-[var(--tracking-normal)] text-[hsl(var(--color-neutral-800))]",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-500))]", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-[var(--space-6)] pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-[var(--space-6)] pt-0",
      className
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
