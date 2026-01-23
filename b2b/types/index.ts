// Tipos TypeScript globais da aplicação

export interface User {
  id: string;
  email: string;
  name: string;
  role: "cliente" | "fornecedor" | "admin";
}

export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  fornecedorId: string;
}

export interface Pedido {
  id: string;
  clienteId: string;
  status: "pendente" | "confirmado" | "enviado" | "entregue" | "cancelado";
  total: number;
  dataCriacao: Date;
}
