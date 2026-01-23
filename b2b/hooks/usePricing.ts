// Custom hook for pricing calculations
'use client';

import { useCallback } from 'react';

interface PriceParams {
  precoBase: number;
  clienteId?: string;
  produtoId: string;
}

export function usePricing() {
  const getPrice = useCallback(async (params: PriceParams): Promise<number> => {
    try {
      const response = await fetch(
        `/api/produtos/${params.produtoId}/preco?clienteId=${params.clienteId || ''}`
      );

      if (!response.ok) {
        return params.precoBase;
      }

      const data = await response.json();
      return data.success ? data.data.preco : params.precoBase;
    } catch (error) {
      console.error('Error fetching price:', error);
      return params.precoBase;
    }
  }, []);

  const formatPrice = useCallback((price: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  }, []);

  return {
    getPrice,
    formatPrice,
  };
}
