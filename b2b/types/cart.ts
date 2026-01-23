// Cart types for the B2B Marketplace

export interface CartItem {
  id: string; // produto ID
  nome: string;
  sku: string;
  preco: number;
  quantidade: number;
  imagemUrl?: string;
  fornecedorId: string;
  fornecedorNome: string;
  estoqueDisponivel: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  desconto: number;
  total: number;
  fornecedorId?: string; // Um carrinho por fornecedor
}

export interface CartState extends Cart {
  // Actions
  addItem: (item: Omit<CartItem, 'quantidade'> & { quantidade?: number }) => void;
  removeItem: (produtoId: string) => void;
  updateQuantity: (produtoId: string, quantidade: number) => void;
  clearCart: () => void;
  setFornecedorId: (fornecedorId: string) => void;
  calculateTotals: () => void;
}
