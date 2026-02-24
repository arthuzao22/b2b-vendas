"use client";

import { Suspense, useCallback, useState } from "react";
import { useCart } from "@/hooks/useCart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PriceDisplay } from "@/components/ui/price-display";
import { QuantitySelector } from "@/components/ui/quantity-selector";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  ShoppingBag,
  Package,
  Truck,
  Shield,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function CartItemSkeleton() {
  return (
    <Card>
      <CardContent className="p-[var(--space-4)] sm:p-[var(--space-6)]">
        <div className="flex gap-[var(--space-4)]">
          <Skeleton className="h-24 w-24 flex-shrink-0 rounded-[var(--radius-lg)]" />
          <div className="flex-1 space-y-[var(--space-3)]">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex justify-between items-center pt-[var(--space-2)]">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CarrinhoContent() {
  const router = useRouter();
  const {
    items,
    total,
    subtotal,
    removeFromCart,
    updateItemQuantity,
    clearCart,
    itemCount,
  } = useCart();
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());

  const handleCheckout = useCallback(() => {
    router.push("/checkout");
  }, [router]);

  const handleRemoveItem = useCallback(
    (itemId: string) => {
      setRemovingItems((prev) => new Set(prev).add(itemId));
      // Pequeno delay para a animação de saída
      setTimeout(() => {
        removeFromCart(itemId);
        setRemovingItems((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }, 200);
    },
    [removeFromCart]
  );

  const handleClearCart = useCallback(() => {
    clearCart();
  }, [clearCart]);

  if (items.length === 0) {
    return (
      <Container className="py-[var(--space-8)] md:py-[var(--space-12)]">
        <EmptyState
          icon={ShoppingCart}
          title="Seu carrinho está vazio"
          description="Explore nosso catálogo e adicione produtos ao seu carrinho para começar!"
          action={{
            label: "Explorar Catálogo",
            onClick: () => router.push("/catalogo"),
          }}
        />
      </Container>
    );
  }

  return (
    <Container className="py-[var(--space-6)] md:py-[var(--space-10)]">
      {/* Breadcrumbs */}
      <Breadcrumbs
        className="mb-[var(--space-4)]"
        items={[
          { label: "Catálogo", href: "/catalogo" },
          { label: "Carrinho" },
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[var(--space-3)] mb-[var(--space-6)] md:mb-[var(--space-8)]">
        <div>
          <h1 className="text-2xl md:text-[length:var(--text-3xl)] font-bold tracking-[var(--tracking-tight)] text-[hsl(var(--color-neutral-900))]">
            Carrinho de Compras
          </h1>
          <p className="text-[length:var(--text-sm)] text-[hsl(var(--color-neutral-500))] mt-[var(--space-1)]">
            {itemCount} {itemCount === 1 ? "item" : "itens"} no carrinho
          </p>
        </div>
        {items.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearCart}
            className="text-[hsl(var(--color-error-500))] hover:text-[hsl(var(--color-error-700))] hover:bg-[hsl(var(--color-error-50))] self-start"
          >
            <Trash2 className="size-4 mr-[var(--space-1-5)]" />
            Limpar carrinho
          </Button>
        )}
      </div>

      <div className="grid gap-[var(--space-6)] lg:gap-[var(--space-8)] lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-[var(--space-4)]">
          {items.map((item) => (
            <Card
              key={item.id}
              className={cn(
                "transition-all duration-200",
                removingItems.has(item.id) &&
                  "opacity-0 scale-95 pointer-events-none"
              )}
            >
              <CardContent className="p-[var(--space-4)] sm:p-[var(--space-6)]">
                <div className="flex gap-[var(--space-3)] sm:gap-[var(--space-4)]">
                  {/* Product Image */}
                  <Link
                    href={`/catalogo?produto=${item.id}`}
                    className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-[var(--radius-lg)] border border-[hsl(var(--color-neutral-200))] hover:border-[hsl(var(--color-brand-300))] transition-colors duration-[var(--transition-fast)]"
                  >
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
                        <ShoppingBag
                          className="size-8 text-[hsl(var(--color-neutral-300))]"
                          aria-hidden="true"
                        />
                      </div>
                    )}
                  </Link>

                  {/* Product Details */}
                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-[hsl(var(--color-neutral-800))] truncate">
                            {item.nome}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-[var(--space-3)] gap-y-[var(--space-0-5)] mt-[var(--space-0-5)]">
                            <span className="text-[length:var(--text-xs)] text-[hsl(var(--color-neutral-400))]">
                              SKU: {item.sku}
                            </span>
                            <span className="hidden sm:inline text-[hsl(var(--color-neutral-200))]">
                              •
                            </span>
                            <span className="text-[length:var(--text-xs)] text-[hsl(var(--color-neutral-500))]">
                              {item.fornecedorNome}
                            </span>
                          </div>
                        </div>
                        <div className="hidden sm:block">
                          <PriceDisplay price={item.preco} size="md" />
                          <p className="text-[length:var(--text-xs)] text-[hsl(var(--color-neutral-400))] text-right">
                            un.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[var(--space-3)] mt-[var(--space-3)]">
                      <div className="flex items-center gap-[var(--space-3)]">
                        <QuantitySelector
                          value={item.quantidade}
                          onChange={(qty) =>
                            updateItemQuantity(item.id, qty)
                          }
                          min={1}
                          max={item.estoqueDisponivel}
                        />
                        {item.estoqueDisponivel <= 5 && (
                          <span className="inline-flex items-center gap-1 text-[length:var(--text-xs)] text-[hsl(var(--color-warning-700))]">
                            <AlertCircle className="size-3" />
                            {item.estoqueDisponivel <= 0
                              ? "Sem estoque"
                              : `Restam ${item.estoqueDisponivel}`}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-[var(--space-3)]">
                        <div className="text-right">
                          <p className="text-[length:var(--text-xs)] text-[hsl(var(--color-neutral-400))]">
                            Subtotal
                          </p>
                          <PriceDisplay
                            price={item.preco * item.quantidade}
                            size="md"
                          />
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-[hsl(var(--color-error-500))] hover:text-[hsl(var(--color-error-700))] hover:bg-[hsl(var(--color-error-50))]"
                          aria-label={`Remover ${item.nome} do carrinho`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>

                    {item.quantidade >= item.estoqueDisponivel && (
                      <p className="text-[length:var(--text-xs)] text-[hsl(var(--color-warning-700))] mt-[var(--space-2)] flex items-center gap-1">
                        <AlertCircle className="size-3 flex-shrink-0" />
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
          <div className="sticky top-20 space-y-[var(--space-4)]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-[var(--space-2)]">
                  <Package
                    className="size-5 text-[hsl(var(--color-brand-500))]"
                    aria-hidden="true"
                  />
                  Resumo do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-[var(--space-4)]">
                <div className="space-y-[var(--space-2)]">
                  <div className="flex justify-between text-[length:var(--text-sm)]">
                    <span className="text-[hsl(var(--color-neutral-500))]">
                      Subtotal ({itemCount}{" "}
                      {itemCount === 1 ? "item" : "itens"})
                    </span>
                    <PriceDisplay price={subtotal} size="sm" />
                  </div>

                  <div className="flex justify-between text-[length:var(--text-sm)]">
                    <span className="text-[hsl(var(--color-neutral-500))]">
                      Frete
                    </span>
                    <span className="text-[length:var(--text-sm)] font-medium text-[hsl(var(--color-success-600))]">
                      A calcular
                    </span>
                  </div>

                  <div className="border-t border-[hsl(var(--color-neutral-100))] pt-[var(--space-3)] mt-[var(--space-2)]">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[hsl(var(--color-neutral-900))]">
                        Total
                      </span>
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
                  <ArrowRight className="ml-2 size-4" />
                </Button>

                <Button variant="secondary" className="w-full" asChild>
                  <Link href="/catalogo">Continuar Comprando</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Trust badges */}
            <Card>
              <CardContent className="p-[var(--space-4)]">
                <div className="space-y-[var(--space-3)]">
                  <div className="flex items-center gap-[var(--space-3)]">
                    <div className="flex items-center justify-center size-8 rounded-full bg-[hsl(var(--color-success-50))]">
                      <Shield
                        className="size-4 text-[hsl(var(--color-success-600))]"
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <p className="text-[length:var(--text-sm)] font-medium text-[hsl(var(--color-neutral-700))]">
                        Compra Segura
                      </p>
                      <p className="text-[length:var(--text-xs)] text-[hsl(var(--color-neutral-400))]">
                        Seus dados estão protegidos
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-[var(--space-3)]">
                    <div className="flex items-center justify-center size-8 rounded-full bg-[hsl(var(--color-brand-50))]">
                      <Truck
                        className="size-4 text-[hsl(var(--color-brand-600))]"
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <p className="text-[length:var(--text-sm)] font-medium text-[hsl(var(--color-neutral-700))]">
                        Entrega Rastreada
                      </p>
                      <p className="text-[length:var(--text-xs)] text-[hsl(var(--color-neutral-400))]">
                        Acompanhe seu pedido em tempo real
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  );
}

export default function CarrinhoPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-[var(--space-6)] md:py-[var(--space-10)]">
          <Skeleton className="h-8 w-48 mb-[var(--space-2)]" />
          <Skeleton className="h-4 w-32 mb-[var(--space-8)]" />
          <div className="grid gap-[var(--space-6)] lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-[var(--space-4)]">
              <CartItemSkeleton />
              <CartItemSkeleton />
            </div>
            <div>
              <Skeleton className="h-64 w-full rounded-[var(--radius-lg)]" />
            </div>
          </div>
        </Container>
      }
    >
      <CarrinhoContent />
    </Suspense>
  );
}
