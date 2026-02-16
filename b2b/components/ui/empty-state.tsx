import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface ActionObject {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

interface EmptyStateProps {
  /** Accept a LucideIcon component or pre-rendered ReactNode */
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }> | React.ReactNode;
  title: string;
  description?: string;
  action?: ActionObject | React.ReactNode;
  className?: string;
}

function isActionObject(action: unknown): action is ActionObject {
  return (
    typeof action === 'object' &&
    action !== null &&
    'label' in action &&
    'onClick' in action
  );
}

function isComponentType(icon: unknown): icon is React.ComponentType<{ className?: string; strokeWidth?: number }> {
  return typeof icon === 'function';
}

export function EmptyState({
  icon: IconProp,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const iconElement = IconProp
    ? isComponentType(IconProp)
      ? <IconProp className="size-16 text-[hsl(var(--color-neutral-300))]" strokeWidth={1.5} />
      : IconProp
    : null;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-[var(--space-16)] px-[var(--space-6)]",
        className
      )}
    >
      {iconElement && (
        <div className="mb-[var(--space-4)]" aria-hidden="true">
          {iconElement}
        </div>
      )}
      <h3 className="text-[length:var(--text-md)] font-semibold text-[hsl(var(--color-neutral-700))] text-center">
        {title}
      </h3>
      {description && (
        <p className="mt-[var(--space-1-5)] text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-500))] text-center max-w-[360px]">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-[var(--space-6)]">
          {isActionObject(action) ? (
            <Button
              variant={action.variant || 'primary'}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ) : (
            action
          )}
        </div>
      )}
    </div>
  );
}
