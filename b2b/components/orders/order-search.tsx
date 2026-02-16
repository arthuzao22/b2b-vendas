"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface OrderSearchProps {
    className?: string;
    placeholder?: string;
}

export function OrderSearch({
    className,
    placeholder = "Buscar por número do pedido..."
}: OrderSearchProps) {
    const [numero, setNumero] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSearch = async () => {
        const trimmed = numero.trim();
        if (!trimmed) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/pedidos/numero/${encodeURIComponent(trimmed)}`);

            if (response.ok) {
                const { data } = await response.json();
                router.push(`/pedidos/${data.id}`);
            } else {
                const errorData = await response.json();
                setError(errorData.error || "Pedido não encontrado");
            }
        } catch (err) {
            setError("Erro ao buscar pedido");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={className}>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Input
                        placeholder={placeholder}
                        value={numero}
                        onChange={(e) => {
                            setNumero(e.target.value);
                            if (error) setError(null);
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="pr-4"
                        disabled={loading}
                    />
                </div>
                <Button
                    onClick={handleSearch}
                    size="icon"
                    disabled={loading || !numero.trim()}
                    variant="outline"
                >
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Search className="h-4 w-4" />
                    )}
                </Button>
            </div>
            {error && (
                <p className="text-sm text-destructive mt-1">{error}</p>
            )}
        </div>
    );
}
