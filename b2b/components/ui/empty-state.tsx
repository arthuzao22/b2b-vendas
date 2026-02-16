'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { Button } from './button';

interface ActionObject {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

interface EmptyStateProps {
  icon?: LucideIcon;
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

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-[var(--space-16)] px-[var(--space-6)]",
        className
      )}
    >
      {Icon && (
        <div className="mb-[var(--space-4)]">
          <Icon
            className="size-16 text-[hsl(var(--color-neutral-300))]"
            strokeWidth={1.5}
            aria-hidden="true"
          />
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
