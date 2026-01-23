import { requireFornecedor } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { EstoqueClient } from "./estoque-client";

interface MovimentacaoEstoque {
  id: string;
  tipo: string;
  quantidade: number;
  estoqueAnterior: number;
  estoqueAtual: number;
  motivo: string;
  referencia?: string | null;
  criadoEm: Date;
  produto: {
    id: string;
    nome: string;
    sku: string;
  };
}

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

export default async function EstoquePage() {
  const { fornecedorId } = await requireFornecedor();
  const movimentacoes = await getMovimentacoes(fornecedorId);

  return <EstoqueClient movimentacoes={movimentacoes} />;
}
