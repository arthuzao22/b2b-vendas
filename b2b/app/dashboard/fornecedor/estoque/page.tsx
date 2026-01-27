import { requireFornecedor } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { EstoqueClient } from "./estoque-client";

async function getMovimentacoes(fornecedorId: string) {
  return await prisma.movimentacaoEstoque.findMany({
    where: {
      produto: {
        fornecedorId,
      },
    },
    include: {
      produto: {
        select: {
          id: true,
          nome: true,
          sku: true,
        },
      },
    },
    orderBy: {
      criadoEm: "desc",
    },
    take: 100,
  });
}

async function getProdutos(fornecedorId: string) {
  return await prisma.produto.findMany({
    where: {
      fornecedorId,
      ativo: true,
    },
    select: {
      id: true,
      nome: true,
      sku: true,
      quantidadeEstoque: true,
      estoqueMinimo: true,
      estoqueMaximo: true,
    },
    orderBy: {
      nome: "asc",
    },
  });
}

export default async function EstoquePage() {
  const { fornecedorId } = await requireFornecedor();

  const [movimentacoes, produtos] = await Promise.all([
    getMovimentacoes(fornecedorId),
    getProdutos(fornecedorId),
  ]);

  return <EstoqueClient movimentacoes={movimentacoes} produtos={produtos} />;
}

