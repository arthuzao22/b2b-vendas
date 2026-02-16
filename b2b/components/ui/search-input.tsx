'use client';

import { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onChange?: (query: string) => void;
  defaultValue?: string;
  variant?: 'compact' | 'full';
  className?: string;
  shortcutHint?: boolean;
}

export function SearchInput({
  placeholder = 'Buscar...',
  onSearch,
  onChange,
  defaultValue = '',
  variant = 'compact',
  className,
  shortcutHint = false,
}: SearchInputProps) {
  const [query, setQuery] = useState(defaultValue);

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);
      onChange?.(value);
    },
    [onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch?.(query);
    }
  };

  const handleClear = () => {
    setQuery('');
    onChange?.('');
    onSearch?.('');
  };

  return (
    <div
      className={cn(
        "relative",
        variant === 'compact' ? "w-80" : "w-full max-w-[640px]",
        className
      )}
    >
      <Search
        className={cn(
          "absolute left-[var(--space-3)] top-1/2 -translate-y-1/2",
          "text-[hsl(var(--color-neutral-400))]",
          variant === 'full' ? "size-5" : "size-4"
        )}
        aria-hidden="true"
      />
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-[var(--radius-md)]",
          "border border-[hsl(var(--color-neutral-200))]",
          "bg-[hsl(var(--color-neutral-0))]",
          "text-[hsl(var(--color-neutral-700))]",
          "placeholder:text-[hsl(var(--color-neutral-400))]",
          "transition-all duration-[var(--transition-fast)]",
          "focus:outline-none focus:border-[hsl(var(--color-brand-500))]",
          "focus:ring-2 focus:ring-[hsl(var(--color-brand-500)/0.2)]",
          variant === 'full'
            ? "h-12 pl-11 pr-[var(--space-4)] text-[length:var(--text-md)]"
            : "h-10 pl-10 pr-[var(--space-4)] text-[length:var(--text-base)]"
        )}
        aria-label={placeholder}
      />
      {query && (
        <button
          onClick={handleClear}
          className={cn(
            "absolute top-1/2 -translate-y-1/2",
            "text-[hsl(var(--color-neutral-400))] hover:text-[hsl(var(--color-neutral-600))]",
            "transition-colors duration-[var(--transition-fast)]",
            shortcutHint ? "right-16" : "right-[var(--space-3)]"
          )}
          aria-label="Limpar busca"
        >
          <X className="size-3.5" />
        </button>
      )}
      {shortcutHint && !query && (
        <div className="absolute right-[var(--space-3)] top-1/2 -translate-y-1/2">
          <kbd className="px-[var(--space-1-5)] py-0.5 text-[length:var(--text-xs)] text-[hsl(var(--color-neutral-400))] bg-[hsl(var(--color-neutral-100))] rounded-[var(--radius-sm)] font-mono">
            ⌘K
          </kbd>
        </div>
      )}
    </div>
  );
}
