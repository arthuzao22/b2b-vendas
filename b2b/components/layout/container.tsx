import { cn } from '@/lib/utils';

interface ContainerProps {
    children: React.ReactNode;
    variant?: 'content' | 'dashboard';
    className?: string;
}

export function Container({ children, variant = 'content', className }: ContainerProps) {
    return (
        <div
            className={cn(
                "mx-auto w-full",
                "px-[var(--space-4)] md:px-[var(--space-6)] lg:px-[var(--space-12)]",
                variant === 'content' ? "max-w-[1280px]" : "max-w-[1440px]",
                className
            )}
        >
            {children}
        </div>
    );
}
