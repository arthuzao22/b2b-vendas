'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

export function Breadcrumbs({ items, className, showHome = true }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("hidden md:flex items-center gap-[var(--space-1)]", className)}>
      {showHome && (
        <>
          <Link
            href="/dashboard"
            className="text-[hsl(var(--color-neutral-500))] hover:text-[hsl(var(--color-brand-500))] transition-colors duration-[var(--transition-fast)]"
            aria-label="Início"
          >
            <Home className="size-3.5" />
          </Link>
          {items.length > 0 && (
            <ChevronRight className="size-3 text-[hsl(var(--color-neutral-300))]" aria-hidden="true" />
          )}
        </>
      )}
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={item.label} className="flex items-center gap-[var(--space-1)]">
            {isLast || !item.href ? (
              <span
                className="text-[length:var(--text-xs)] font-medium text-[hsl(var(--color-neutral-800))]"
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-[length:var(--text-xs)] font-medium text-[hsl(var(--color-neutral-500))] hover:text-[hsl(var(--color-brand-500))] transition-colors duration-[var(--transition-fast)]"
              >
                {item.label}
              </Link>
            )}
            {!isLast && (
              <ChevronRight className="size-3 text-[hsl(var(--color-neutral-300))]" aria-hidden="true" />
            )}
          </div>
        );
      })}
    </nav>
  );
}
