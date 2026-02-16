import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("rounded-[var(--radius-md)] animate-shimmer", className)}
      aria-hidden="true"
    />
  );
}

// Pre-built skeleton variants
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-[var(--space-2)]", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-3.5 rounded animate-shimmer",
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'size-8',
    md: 'size-10',
    lg: 'size-12',
  };
  return (
    <div
      className={cn("rounded-full animate-shimmer", sizeClasses[size])}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-[hsl(var(--color-neutral-200))]",
        "bg-[hsl(var(--color-neutral-0))] p-[var(--space-5)]",
        className
      )}
      aria-hidden="true"
    >
      <div className="space-y-[var(--space-3)]">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}

// Backward-compatible aliases
export const LoadingSkeleton = Skeleton;
export const CardSkeleton = SkeletonCard;

export function SkeletonTableRow({ columns = 4 }: { columns?: number }) {
  return (
    <div
      className="flex items-center gap-[var(--space-4)] px-[var(--space-4)] h-[52px] border-b border-[hsl(var(--color-neutral-100))]"
      aria-hidden="true"
    >
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-24 flex-1" />
      ))}
    </div>
  );
}
