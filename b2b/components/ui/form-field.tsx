'use client';

import { Label } from './label';
import { Input } from './input';
import { AlertCircle } from 'lucide-react';
import { InputHTMLAttributes, forwardRef } from 'react';

export interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  icon?: React.ReactNode;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, helperText, required, className, icon, id, ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className="space-y-[var(--space-1-5)]">
        <Label htmlFor={id} className="text-[length:var(--text-sm)] font-medium text-[hsl(var(--color-neutral-700))]">
          {label}
          {required && <span className="text-[hsl(var(--color-error-500))] ml-0.5" aria-hidden="true">*</span>}
        </Label>
        <Input
          ref={ref}
          id={id}
          className={className}
          error={hasError}
          icon={icon}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          {...props}
        />
        {hasError && (
          <div
            id={`${id}-error`}
            className="flex items-center gap-[var(--space-1)] text-[length:var(--text-xs)] text-[hsl(var(--color-error-500))]"
            role="alert"
          >
            <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}
        {helperText && !hasError && (
          <p id={`${id}-helper`} className="text-[length:var(--text-xs)] text-[hsl(var(--color-neutral-500))]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
