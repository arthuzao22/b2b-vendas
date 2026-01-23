import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireFornecedor } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";
import { Decimal } from "@prisma/client/runtime/library";

// GET /api/estoque/dashboard - Obter métricas de estoque (fornecedor only)
export async function GET(request: NextRequest) {
  try {
    const { fornecedorId } = await requireFornecedor();

    // Buscar todos os produtos do fornecedor
    const produtos = await prisma.produto.findMany({
      where: {
        fornecedorId,
        ativo: true,
      },
      select: {
        id: true,
        nome: true,
        quantidadeEstoque: true,
        estoqueMinimo: true,
        precoBase: true,
      },
    });

    const totalProdutos = produtos.length;

    // Produtos com estoque baixo (quantidadeEstoque <= estoqueMinimo)
    const produtosComEstoqueBaixo = produtos.filter(
      (p) => p.quantidadeEstoque <= p.estoqueMinimo
    );
    const totalProdutosEstoqueBaixo = produtosComEstoqueBaixo.length;

    // Produtos sem estoque (quantidadeEstoque = 0)
    const produtosSemEstoque = produtos.filter((p) => p.quantidadeEstoque === 0);
    const totalProdutosSemEstoque = produtosSemEstoque.length;

    // Valor total do estoque (quantidadeEstoque * precoBase)
    const valorTotalEstoque = produtos.reduce((acc, produto) => {
      const valorProduto = new Decimal(produto.precoBase).mul(produto.quantidadeEstoque);
      return acc.add(valorProduto);
    }, new Decimal(0));

    // Movimentações recentes (últimos 7 dias)
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

    const movimentacoesRecentes = await prisma.movimentacaoEstoque.count({
      where: {
        produto: {
          fornecedorId,
        },
        criadoEm: {
          gte: seteDiasAtras,
        },
      },
    });

    // Movimentações por tipo (últimos 30 dias)
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

    const [entradasCount, saidasCount, ajustesCount] = await Promise.all([
      prisma.movimentacaoEstoque.count({
        where: {
          produto: { fornecedorId },
          tipo: "entrada",
          criadoEm: { gte: trintaDiasAtras },
        },
      }),
      prisma.movimentacaoEstoque.count({
        where: {
          produto: { fornecedorId },
          tipo: "saida",
          criadoEm: { gte: trintaDiasAtras },
        },
      }),
      prisma.movimentacaoEstoque.count({
        where: {
          produto: { fornecedorId },
          tipo: "ajuste",
          criadoEm: { gte: trintaDiasAtras },
        },
      }),
    ]);

    // Top 5 produtos com estoque mais baixo (não zerados)
    const topProdutosEstoqueBaixo = produtos
      .filter((p) => p.quantidadeEstoque > 0 && p.quantidadeEstoque <= p.estoqueMinimo)
      .sort((a, b) => {
        const percentualA = a.estoqueMinimo > 0 ? a.quantidadeEstoque / a.estoqueMinimo : 0;
        const percentualB = b.estoqueMinimo > 0 ? b.quantidadeEstoque / b.estoqueMinimo : 0;
        return percentualA - percentualB;
      })
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        nome: p.nome,
        quantidadeEstoque: p.quantidadeEstoque,
        estoqueMinimo: p.estoqueMinimo,
        percentual: p.estoqueMinimo > 0 
          ? Math.round((p.quantidadeEstoque / p.estoqueMinimo) * 100) 
          : 0,
      }));

    logger.info("Dashboard de estoque consultado", {
      fornecedorId,
      totalProdutos,
      totalProdutosEstoqueBaixo,
      totalProdutosSemEstoque,
    });

    return successResponse({
      resumo: {
        totalProdutos,
        totalProdutosEstoqueBaixo,
        totalProdutosSemEstoque,
        valorTotalEstoque: valorTotalEstoque.toString(),
        movimentacoesRecentes,
      },
      movimentacoesPorTipo: {
        periodo: "Últimos 30 dias",
        entradas: entradasCount,
        saidas: saidasCount,
        ajustes: ajustesCount,
      },
      topProdutosEstoqueBaixo,
    });
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    logger.error("Erro ao obter dashboard de estoque", error);
    return errorResponse("Erro ao obter dashboard de estoque", 500);
  }
}
