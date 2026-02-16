"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { XCircle, Loader2 } from "lucide-react";

interface CancelOrderButtonProps {
    pedidoId: string;
    status: string;
    onCancel?: () => void;
}

export function CancelOrderButton({ pedidoId, status, onCancel }: CancelOrderButtonProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canCancel = status === "pendente" || status === "confirmado";

    if (!canCancel) return null;

    const handleCancel = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/pedidos/${pedidoId}/cancelar`, {
                method: "POST",
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Erro ao cancelar pedido");
                return;
            }

            onCancel?.();

            // Recarregar a página para refletir o novo status
            window.location.reload();
        } catch (err) {
            setError("Erro de conexão ao cancelar pedido");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Cancelando...
                            </>
                        ) : (
                            <>
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancelar Pedido
                            </>
                        )}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancelar Pedido?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O estoque dos produtos será restaurado
                            automaticamente após o cancelamento.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Voltar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancel}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Confirmar Cancelamento
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {error && (
                <p className="text-sm text-destructive mt-2">{error}</p>
            )}
        </>
    );
}
