import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-neutral-400))] [&_svg]:size-4" aria-hidden="true">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            [
              "flex h-10 w-full rounded-[var(--radius-md)]",
              "border bg-[hsl(var(--color-neutral-0))]",
              "px-3 py-2 text-[length:var(--text-base)]",
              "text-[hsl(var(--color-neutral-700))]",
              "placeholder:text-[hsl(var(--color-neutral-400))]",
              "transition-all duration-[var(--transition-fast)]",
              "focus-visible:outline-none focus-visible:border-[hsl(var(--color-brand-500))]",
              "focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-brand-500)/0.2)]",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "disabled:bg-[hsl(var(--color-neutral-50))] disabled:border-[hsl(var(--color-neutral-100))]",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            ].join(" "),
            error && "border-[hsl(var(--color-error-500))] focus-visible:border-[hsl(var(--color-error-500))] focus-visible:ring-[hsl(var(--color-error-500)/0.2)]",
            icon && "pl-10",
            className
          )}
          ref={ref}
          aria-invalid={error || undefined}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
