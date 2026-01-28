// Typed Prisma filter interfaces
import { Prisma } from "@prisma/client";

// Where input types for common models
export type ProdutoWhereInput = Prisma.ProdutoWhereInput;
export type PedidoWhereInput = Prisma.PedidoWhereInput;
export type ClienteWhereInput = Prisma.ClienteWhereInput;
export type FornecedorWhereInput = Prisma.FornecedorWhereInput;
export type CategoriaWhereInput = Prisma.CategoriaWhereInput;
export type NotificacaoWhereInput = Prisma.NotificacaoWhereInput;
export type ListaPrecoWhereInput = Prisma.ListaPrecoWhereInput;
export type PrecoCustomizadoWhereInput = Prisma.PrecoCustomizadoWhereInput;
export type MovimentacaoEstoqueWhereInput = Prisma.MovimentacaoEstoqueWhereInput;

// Order by types
export type ProdutoOrderByInput = Prisma.ProdutoOrderByWithRelationInput;
export type PedidoOrderByInput = Prisma.PedidoOrderByWithRelationInput;

// Include types
export type ProdutoInclude = Prisma.ProdutoInclude;
export type PedidoInclude = Prisma.PedidoInclude;
