// Drawer component for side panels
'use client';

import { X } from 'lucide-react';
import { ReactNode, useEffect } from 'react';
import { Button } from './button';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  position?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function Drawer({
  open,
  onClose,
  title,
  children,
  position = 'right',
  size = 'md',
}: DrawerProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 ${position === 'right' ? 'right-0' : 'left-0'} h-full w-full ${
          sizeClasses[size]
        } bg-white shadow-xl z-50 flex flex-col`}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b px-4 py-3 sm:px-6 sm:py-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
      </div>
    </>
  );
}
