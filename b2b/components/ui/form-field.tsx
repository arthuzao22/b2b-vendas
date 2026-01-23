// FormField component for consistent form inputs
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
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, helperText, required, className, ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className="space-y-2">
        <Label htmlFor={props.id} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Input
          ref={ref}
          className={`${hasError ? 'border-red-500 focus-visible:ring-red-500' : ''} ${className}`}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${props.id}-error` : undefined}
          {...props}
        />
        {hasError && (
          <div
            id={`${props.id}-error`}
            className="flex items-center gap-1 text-sm text-red-600"
          >
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        {helperText && !hasError && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
