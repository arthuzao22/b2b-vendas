'use client';

import { Breadcrumbs, type BreadcrumbItem } from '@/components/ui/breadcrumbs';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    breadcrumbs?: BreadcrumbItem[];
    actions?: React.ReactNode;
    className?: string;
}

export function PageHeader({
    title,
    subtitle,
    breadcrumbs,
    actions,
    className,
}: PageHeaderProps) {
    return (
        <div className={cn("space-y-[var(--space-3)]", className)}>
            {breadcrumbs && breadcrumbs.length > 0 && (
                <Breadcrumbs items={breadcrumbs} />
            )}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h2 className="text-[length:var(--text-xl)] sm:text-[length:var(--text-2xl)] font-bold text-[hsl(var(--color-neutral-900))] tracking-[var(--tracking-tight)]">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="mt-[var(--space-1)] text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-500))]">
                            {subtitle}
                        </p>
                    )}
                </div>
                {actions && (
                    <div className="flex items-center gap-[var(--space-3)] shrink-0 self-start sm:self-auto">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}
