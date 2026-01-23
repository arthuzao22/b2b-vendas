// Cart store using Zustand with persistence
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartState, CartItem } from '@/types/cart';

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      desconto: 0,
      total: 0,
      fornecedorId: undefined,

      addItem: (newItem) => {
        const { items, fornecedorId } = get();
        
        // Validar que todos os itens são do mesmo fornecedor
        if (fornecedorId && newItem.fornecedorId !== fornecedorId) {
          throw new Error('Não é possível adicionar produtos de fornecedores diferentes no mesmo carrinho');
        }

        const existingItemIndex = items.findIndex(item => item.id === newItem.id);
        
        let newItems: CartItem[];
        if (existingItemIndex >= 0) {
          // Atualizar quantidade do item existente
          newItems = items.map((item, index) => 
            index === existingItemIndex
              ? { ...item, quantidade: item.quantidade + (newItem.quantidade || 1) }
              : item
          );
        } else {
          // Adicionar novo item
          newItems = [...items, { ...newItem, quantidade: newItem.quantidade || 1 }];
        }

        set({ 
          items: newItems, 
          fornecedorId: fornecedorId || newItem.fornecedorId 
        });
        get().calculateTotals();
      },

      removeItem: (produtoId) => {
        const { items } = get();
        const newItems = items.filter(item => item.id !== produtoId);
        
        set({ 
          items: newItems,
          fornecedorId: newItems.length > 0 ? get().fornecedorId : undefined
        });
        get().calculateTotals();
      },

      updateQuantity: (produtoId, quantidade) => {
        const { items } = get();
        
        if (quantidade <= 0) {
          get().removeItem(produtoId);
          return;
        }

        const newItems = items.map(item =>
          item.id === produtoId
            ? { ...item, quantidade: Math.min(quantidade, item.estoqueDisponivel) }
            : item
        );

        set({ items: newItems });
        get().calculateTotals();
      },

      clearCart: () => {
        set({
          items: [],
          subtotal: 0,
          desconto: 0,
          total: 0,
          fornecedorId: undefined,
        });
      },

      setFornecedorId: (fornecedorId) => {
        set({ fornecedorId });
      },

      calculateTotals: () => {
        const { items, desconto } = get();
        const subtotal = items.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
        const total = Math.max(0, subtotal - desconto);
        
        set({ subtotal, total });
      },
    }),
    {
      name: 'b2b-cart-storage',
      partialize: (state) => ({
        items: state.items,
        fornecedorId: state.fornecedorId,
      }),
    }
  )
);
