// DataTable component with pagination, sorting, and filtering
'use client';

import { ReactNode, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { EmptyState } from './empty-state';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    total?: number;
    onPageChange: (page: number) => void;
  };
  emptyMessage?: string;
  emptyDescription?: string;
  loading?: boolean;
  onRowClick?: (item: T) => void;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  searchable = false,
  searchPlaceholder = 'Buscar...',
  onSearch,
  pagination,
  emptyMessage = 'Nenhum item encontrado',
  emptyDescription = '',
  loading = false,
  onRowClick,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');

  const safeData = Array.isArray(data) ? data : [];

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const sortedData = sortKey
    ? [...safeData].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      const order = sortOrder === 'asc' ? 1 : -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * order;
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * order;
      }
      return 0;
    })
    : safeData;

  // Skeleton loading state
  if (loading) {
    return (
      <div className="space-y-[var(--space-4)]">
        {searchable && (
          <div className="flex items-center gap-[var(--space-4)]">
            <Input
              placeholder={searchPlaceholder}
              value=""
              disabled
              className="max-w-sm"
              icon={<Search />}
            />
          </div>
        )}
        <div className="rounded-[var(--radius-lg)] border border-[hsl(var(--color-neutral-200))] overflow-hidden">
          {/* Skeleton header */}
          <div className="bg-[hsl(var(--color-neutral-50))] border-b border-[hsl(var(--color-neutral-100))] px-[var(--space-4)] h-11 flex items-center gap-[var(--space-8)]">
            {columns.map((col) => (
              <div key={col.key} className="h-3 w-20 rounded animate-shimmer" />
            ))}
          </div>
          {/* Skeleton rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={cn(
              "px-[var(--space-4)] h-[52px] flex items-center gap-[var(--space-8)]",
              "border-b border-[hsl(var(--color-neutral-100))] last:border-0",
              i % 2 === 0 ? "bg-[hsl(var(--color-neutral-0))]" : "bg-[hsl(var(--color-neutral-25))]"
            )}>
              {columns.map((col) => (
                <div key={col.key} className="h-3 w-24 rounded animate-shimmer" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (safeData.length === 0 && !searchQuery) {
    return (
      <div className="space-y-[var(--space-4)]">
        {searchable && (
          <div className="flex items-center gap-[var(--space-4)]">
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="max-w-sm"
              icon={<Search />}
            />
          </div>
        )}
        <EmptyState title={emptyMessage} description={emptyDescription} />
      </div>
    );
  }

  return (
    <div className="space-y-[var(--space-4)]">
      {searchable && (
        <div className="flex items-center gap-[var(--space-4)]">
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery ?? ""}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="max-w-sm"
            icon={<Search />}
          />
        </div>
      )}

      <div className="rounded-[var(--radius-lg)] border border-[hsl(var(--color-neutral-200))] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(var(--color-neutral-100))] bg-[hsl(var(--color-neutral-50))]">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "px-[var(--space-4)] h-11 text-left",
                      "text-[length:var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-wider)]",
                      "text-[hsl(var(--color-neutral-500))]"
                    )}
                    style={{ width: column.width }}
                  >
                    {column.sortable ? (
                      <button
                        onClick={() => handleSort(column.key)}
                        className={cn(
                          "flex items-center gap-[var(--space-1)] transition-colors duration-[var(--transition-fast)]",
                          "hover:text-[hsl(var(--color-neutral-800))]",
                          sortKey === column.key && "text-[hsl(var(--color-brand-500))]"
                        )}
                      >
                        {column.label}
                        {sortKey === column.key ? (
                          sortOrder === 'asc' ? (
                            <ArrowUp className="size-3 transition-transform duration-[var(--transition-fast)]" />
                          ) : (
                            <ArrowDown className="size-3 transition-transform duration-[var(--transition-fast)]" />
                          )
                        ) : (
                          <ArrowUpDown className="size-3 text-[hsl(var(--color-neutral-400))]" />
                        )}
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((item, index) => (
                <tr
                  key={keyExtractor(item)}
                  className={cn(
                    "border-b border-[hsl(var(--color-neutral-100))] last:border-0",
                    "transition-colors duration-[var(--transition-fast)]",
                    "hover:bg-[hsl(var(--color-neutral-50))]",
                    index % 2 === 0 ? "bg-[hsl(var(--color-neutral-0))]" : "bg-[hsl(var(--color-neutral-25))]",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-[var(--space-4)] h-[52px] text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-700))]"
                    >
                      {column.render ? column.render(item) : item[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between h-12">
          <p className="text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-500))]">
            {pagination.total
              ? `Mostrando ${((pagination.currentPage - 1) * pagination.pageSize) + 1} - ${Math.min(pagination.currentPage * pagination.pageSize, pagination.total)} de ${pagination.total}`
              : `Página ${pagination.currentPage} de ${pagination.totalPages}`
            }
          </p>
          <div className="flex items-center gap-[var(--space-1)]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => pagination.onPageChange(1)}
              disabled={pagination.currentPage === 1}
              aria-label="Primeira página"
            >
              <ChevronsLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              aria-label="Página anterior"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              aria-label="Próxima página"
            >
              <ChevronRight className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.totalPages)}
              disabled={pagination.currentPage === pagination.totalPages}
              aria-label="Última página"
            >
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
