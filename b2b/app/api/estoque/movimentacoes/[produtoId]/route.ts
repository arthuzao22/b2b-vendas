import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireFornecedor } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";

// GET /api/estoque/movimentacoes/[produtoId] - Obter histórico de movimentações do produto
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ produtoId: string }> }
) {
  try {
    const { fornecedorId } = await requireFornecedor();
    const { produtoId } = await params;
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const skip = (page - 1) * limit;

    // Verificar se produto pertence ao fornecedor
    const produto = await prisma.produto.findFirst({
      where: {
        id: produtoId,
        fornecedorId,
      },
    });

    if (!produto) {
      return errorResponse("Produto não encontrado", 404);
    }

    const [movimentacoes, total] = await Promise.all([
      prisma.movimentacaoEstoque.findMany({
        where: { produtoId },
        skip,
        take: limit,
        orderBy: { criadoEm: "desc" },
      }),
      prisma.movimentacaoEstoque.count({ where: { produtoId } }),
    ]);

    return successResponse({
      produto: {
        id: produto.id,
        nome: produto.nome,
        sku: produto.sku,
        quantidadeEstoque: produto.quantidadeEstoque,
        estoqueMinimo: produto.estoqueMinimo,
        estoqueMaximo: produto.estoqueMaximo,
      },
      movimentacoes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    logger.error("Erro ao obter histórico de movimentações do produto", error);
    return errorResponse("Erro ao obter histórico de movimentações do produto", 500);
  }
}
