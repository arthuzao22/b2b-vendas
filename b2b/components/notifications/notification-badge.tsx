"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface NotificationBadgeProps {
    className?: string;
    href?: string;
}

export function NotificationBadge({ className, href = "/dashboard" }: NotificationBadgeProps) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        fetchCount();

        // Polling a cada 30 segundos
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchCount = async () => {
        try {
            const response = await fetch("/api/notificacoes/nao-lidas/count");
            if (response.ok) {
                const { data } = await response.json();
                setCount(data?.count || 0);
            }
        } catch {
            // Silenciosamente falhar - não é crítico
        }
    };

    return (
        <Link href={href}>
            <Button variant="ghost" size="icon" className={`relative ${className || ""}`}>
                <Bell className="h-5 w-5" />
                {count > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                        {count > 99 ? "99+" : count}
                    </span>
                )}
            </Button>
        </Link>
    );
}
