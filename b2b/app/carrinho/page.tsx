"use client";

import { Suspense } from "react";
import { useCart } from "@/hooks/useCart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PriceDisplay } from "@/components/ui/price-display";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ShoppingCart, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const dynamic = 'force-dynamic';

function CarrinhoContent() {
  const router = useRouter();
  const { items, total, subtotal, removeFromCart, updateItemQuantity, itemCount } = useCart();

  const handleCheckout = () => {
    router.push("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <EmptyState
          icon={ShoppingCart}
          title="Seu carrinho está vazio"
          description="Adicione produtos ao carrinho para continuar comprando"
          action={
            <Link href="/dashboard/cliente/catalogo">
              <Button>
                <ShoppingBag className="mr-2 h-4 w-4" />
                Ver Catálogo
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Carrinho de Compras</h1>
        <p className="text-muted-foreground">
          {itemCount} {itemCount === 1 ? "item" : "itens"} no carrinho
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border">
                    {item.imagemUrl ? (
                      <Image
                        src={item.imagemUrl}
                        alt={item.nome}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-100">
                        <ShoppingBag className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-semibold">{item.nome}</h3>
                          <p className="text-sm text-muted-foreground">
                            SKU: {item.sku}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.fornecedorNome}
                          </p>
                        </div>
                        <PriceDisplay value={item.preco} size="md" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <QuantitySelector
                        value={item.quantidade}
                        onChange={(qty) => updateItemQuantity(item.id, qty)}
                        min={1}
                        max={item.estoqueDisponivel}
                      />
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Subtotal</p>
                          <PriceDisplay 
                            value={item.preco * item.quantidade} 
                            size="md"
                            className="font-bold"
                          />
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {item.quantidade >= item.estoqueDisponivel && (
                      <p className="text-xs text-yellow-600 mt-2">
                        Quantidade máxima disponível em estoque
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
                  <span className="text-muted-foreground">Subtotal</span>
                  <PriceDisplay value={subtotal} size="sm" />
                </div>
                
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <PriceDisplay value={total} size="lg" />
                  </div>
                </div>
              </div>

              <Button 
                className="w-full" 
                size="lg"
                onClick={handleCheckout}
              >
                Finalizar Compra
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Link href="/dashboard/cliente/catalogo">
                <Button variant="outline" className="w-full">
                  Continuar Comprando
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CarrinhoPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-8"><LoadingSkeleton className="h-96 w-full" /></div>}>
      <CarrinhoContent />
    </Suspense>
  );
}
