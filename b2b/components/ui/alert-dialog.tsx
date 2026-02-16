"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

// ==========================================
// AlertDialog Context
// ==========================================

interface AlertDialogContextType {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AlertDialogContext = React.createContext<AlertDialogContextType>({
    open: false,
    setOpen: () => { },
});

// ==========================================
// AlertDialog Root
// ==========================================

export function AlertDialog({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = React.useState(false);

    return (
        <AlertDialogContext.Provider value={{ open, setOpen }}>
            {children}
        </AlertDialogContext.Provider>
    );
}

// ==========================================
// AlertDialogTrigger
// ==========================================

export function AlertDialogTrigger({
    children,
    asChild,
}: {
    children: React.ReactNode;
    asChild?: boolean;
}) {
    const { setOpen } = React.useContext(AlertDialogContext);

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            onClick: (e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(true);
            },
        });
    }

    return (
        <button onClick={() => setOpen(true)}>
            {children}
        </button>
    );
}

// ==========================================
// AlertDialogContent
// ==========================================

export function AlertDialogContent({ children }: { children: React.ReactNode }) {
    const { open, setOpen } = React.useContext(AlertDialogContext);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={() => setOpen(false)}
            />
            {/* Content */}
            <div className="relative z-50 w-full max-w-lg mx-4 bg-white rounded-lg shadow-xl p-6 animate-in fade-in-0 zoom-in-95">
                {children}
            </div>
        </div>
    );
}

// ==========================================
// AlertDialogHeader
// ==========================================

export function AlertDialogHeader({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`flex flex-col space-y-2 text-center sm:text-left ${className || ""}`}>
            {children}
        </div>
    );
}

// ==========================================
// AlertDialogTitle
// ==========================================

export function AlertDialogTitle({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <h2 className="text-lg font-semibold">{children}</h2>
    );
}

// ==========================================
// AlertDialogDescription
// ==========================================

export function AlertDialogDescription({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <p className="text-sm text-muted-foreground">{children}</p>
    );
}

// ==========================================
// AlertDialogFooter
// ==========================================

export function AlertDialogFooter({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4 ${className || ""}`}>
            {children}
        </div>
    );
}

// ==========================================
// AlertDialogCancel
// ==========================================

export function AlertDialogCancel({
    children,
}: {
    children: React.ReactNode;
}) {
    const { setOpen } = React.useContext(AlertDialogContext);

    return (
        <Button variant="outline" onClick={() => setOpen(false)}>
            {children}
        </Button>
    );
}

// ==========================================
// AlertDialogAction
// ==========================================

export function AlertDialogAction({
    children,
    onClick,
    className,
}: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
}) {
    const { setOpen } = React.useContext(AlertDialogContext);

    return (
        <Button
            className={className}
            onClick={() => {
                onClick?.();
                setOpen(false);
            }}
        >
            {children}
        </Button>
    );
}
