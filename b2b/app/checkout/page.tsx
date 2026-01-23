"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import { PriceDisplay } from "@/components/ui/price-display";
import { ShoppingCart, CreditCard, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart, fornecedorId } = useCart();
  const { clienteId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate stock and prices on server
      const validateResponse = await fetch("/api/carrinho/calcular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(item => ({
            produtoId: item.id,
            quantidade: item.quantidade,
          })),
        }),
      });

      if (!validateResponse.ok) {
        throw new Error("Erro ao validar carrinho");
      }

      const validationData = await validateResponse.json();
      
      if (!validationData.success) {
        setError(validationData.error || "Erro ao validar carrinho");
        setLoading(false);
        return;
      }

      // Create order
      const orderResponse = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fornecedorId,
          clienteId,
          itens: items.map(item => ({
            produtoId: item.id,
            quantidade: item.quantidade,
            precoUnitario: item.preco,
          })),
          observacoes,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || "Erro ao criar pedido");
      }

      const orderData = await orderResponse.json();
      
      if (orderData.success) {
        clearCart();
        router.push(`/pedidos/${orderData.data.id}`);
      } else {
        throw new Error(orderData.error || "Erro ao criar pedido");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar pedido");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <EmptyState
          icon={ShoppingCart}
          title="Seu carrinho está vazio"
          description="Adicione produtos ao carrinho antes de finalizar a compra"
          action={
            <Link href="/dashboard/cliente/catalogo">
              <Button>Ver Catálogo</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Finalizar Compra</h1>
        <p className="text-muted-foreground">
          Revise seu pedido e confirme a compra
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Itens do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center border-b pb-3 last:border-0"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{item.nome}</h4>
                      <p className="text-sm text-muted-foreground">
                        SKU: {item.sku} • Quantidade: {item.quantidade}
                      </p>
                    </div>
                    <PriceDisplay 
                      value={item.preco * item.quantidade} 
                      size="md"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Adicionais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="observacoes">
                    Observações do Pedido (Opcional)
                  </Label>
                  <textarea
                    id="observacoes"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Adicione observações sobre o pedido..."
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={loading}
                  />
                </div>
              </CardContent>
            </Card>

            {error && (
              <div className="flex items-center gap-2 p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Subtotal ({items.length} {items.length === 1 ? "item" : "itens"})
                    </span>
                    <PriceDisplay value={total} size="sm" />
                  </div>
                  
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <PriceDisplay value={total} size="lg" />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit"
                  className="w-full" 
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    "Processando..."
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Confirmar Pedido
                    </>
                  )}
                </Button>

                <Link href="/carrinho">
                  <Button 
                    type="button"
                    variant="outline" 
                    className="w-full"
                    disabled={loading}
                  >
                    Voltar ao Carrinho
                  </Button>
                </Link>

                <div className="text-xs text-muted-foreground text-center pt-4">
                  Ao confirmar o pedido, você concorda com nossos termos e condições
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
