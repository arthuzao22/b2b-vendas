"use client";

import { Suspense } from "react";
import { useCart } from "@/hooks/useCart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PriceDisplay } from "@/components/ui/price-display";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { Skeleton } from "@/components/ui/loading-skeleton";
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
      <Container className="py-[var(--space-6)] md:py-[var(--space-10)]">
        <EmptyState
          icon={ShoppingCart}
          title="Seu carrinho está vazio"
          description="Adicione produtos ao carrinho para continuar comprando"
          action={{
            label: "Ver Catálogo",
            onClick: () => router.push("/dashboard/cliente/catalogo"),
          }}
        />
      </Container>
    );
  }

  return (
    <Container className="py-[var(--space-6)] md:py-[var(--space-10)]">
      <div className="mb-[var(--space-6)] md:mb-[var(--space-8)]">
        <h1 className="text-2xl md:text-[length:var(--text-3xl)] font-bold tracking-[var(--tracking-tight)] text-[hsl(var(--color-neutral-900))]">
          Carrinho de Compras
        </h1>
        <p className="text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-500))] mt-[var(--space-1)]">
          {itemCount} {itemCount === 1 ? "item" : "itens"} no carrinho
        </p>
      </div>

      <div className="grid gap-[var(--space-6)] lg:gap-[var(--space-8)] lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-[var(--space-4)]">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-[var(--space-4)] sm:p-[var(--space-6)]">
                <div className="flex gap-[var(--space-3)] sm:gap-[var(--space-4)]">
                  {/* Product Image */}
                  <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-[var(--radius-lg)] border border-[hsl(var(--color-neutral-200))]">
                    {item.imagemUrl ? (
                      <Image
                        src={item.imagemUrl}
                        alt={item.nome}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[hsl(var(--color-neutral-50))]">
                        <ShoppingBag className="size-8 text-[hsl(var(--color-neutral-300))]" aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <div>
                          <h3 className="font-semibold text-[hsl(var(--color-neutral-800))]">{item.nome}</h3>
                          <p className="text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-500))]">
                            SKU: {item.sku}
                          </p>
                          <p className="text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-500))]">
                            {item.fornecedorNome}
                          </p>
                        </div>
                        <PriceDisplay price={item.preco} size="md" />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[var(--space-3)] mt-[var(--space-3)]">
                      <QuantitySelector
                        value={item.quantidade}
                        onChange={(qty) => updateItemQuantity(item.id, qty)}
                        min={1}
                        max={item.estoqueDisponivel}
                      />

                      <div className="flex items-center gap-[var(--space-4)]">
                        <div className="text-right">
                          <p className="text-[length:var(--text-xs)] text-[hsl(var(--color-neutral-500))]">Subtotal</p>
                          <PriceDisplay
                            price={item.preco * item.quantidade}
                            size="md"
                          />
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="text-[hsl(var(--color-error-500))] hover:text-[hsl(var(--color-error-700))] hover:bg-[hsl(var(--color-error-50))]"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>

                    {item.quantidade >= item.estoqueDisponivel && (
                      <p className="text-[length:var(--text-xs)] text-[hsl(var(--color-warning-700))] mt-[var(--space-2)]">
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
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-[var(--space-4)]">
              <div className="space-y-[var(--space-2)]">
                <div className="flex justify-between text-[length:var(--text-sm)]">
                  <span className="text-[hsl(var(--color-neutral-500))]">Subtotal</span>
                  <PriceDisplay price={subtotal} size="sm" />
                </div>

                <div className="border-t border-[hsl(var(--color-neutral-100))] pt-[var(--space-3)]">
                  <div className="flex justify-between font-bold">
                    <span className="text-[hsl(var(--color-neutral-900))]">Total</span>
                    <PriceDisplay price={total} size="lg" />
                  </div>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
              >
                Finalizar Compra
                <ArrowRight className="ml-2" />
              </Button>

              <Button variant="secondary" className="w-full" asChild>
                <Link href="/dashboard/cliente/catalogo">
                  Continuar Comprando
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}

export default function CarrinhoPage() {
  return (
    <Suspense fallback={<Container className="py-[var(--space-6)] md:py-[var(--space-10)]"><Skeleton className="h-96 w-full" /></Container>}>
      <CarrinhoContent />
    </Suspense>
  );
}
