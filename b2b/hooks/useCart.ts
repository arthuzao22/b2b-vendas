// Custom hook for cart operations
'use client';

import { useCartStore } from '@/store/cart';
import { CartItem } from '@/types/cart';
import { useCallback } from 'react';

export function useCart() {
  const cart = useCartStore();

  const addToCart = useCallback(
    async (item: Omit<CartItem, 'quantidade'> & { quantidade?: number }) => {
      try {
        cart.addItem(item);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Erro ao adicionar item',
        };
      }
    },
    [cart]
  );

  const removeFromCart = useCallback(
    (produtoId: string) => {
      cart.removeItem(produtoId);
    },
    [cart]
  );

  const updateItemQuantity = useCallback(
    (produtoId: string, quantidade: number) => {
      cart.updateQuantity(produtoId, quantidade);
    },
    [cart]
  );

  const clearCart = useCallback(() => {
    cart.clearCart();
  }, [cart]);

  const getItemCount = useCallback(() => {
    return cart.items.reduce((total, item) => total + item.quantidade, 0);
  }, [cart.items]);

  const hasItem = useCallback(
    (produtoId: string) => {
      return cart.items.some((item) => item.id === produtoId);
    },
    [cart.items]
  );

  const getItem = useCallback(
    (produtoId: string) => {
      return cart.items.find((item) => item.id === produtoId);
    },
    [cart.items]
  );

  return {
    items: cart.items,
    subtotal: cart.subtotal,
    desconto: cart.desconto,
    total: cart.total,
    fornecedorId: cart.fornecedorId,
    itemCount: getItemCount(),
    addToCart,
    removeFromCart,
    updateItemQuantity,
    clearCart,
    hasItem,
    getItem,
  };
}
