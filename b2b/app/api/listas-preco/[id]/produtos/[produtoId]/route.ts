import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireFornecedor } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";

// DELETE /api/listas-preco/[id]/produtos/[produtoId] - Remover produto da lista
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; produtoId: string }> }
) {
  try {
    const { fornecedorId } = await requireFornecedor();
    const { id: listaPrecoId, produtoId } = await params;

    // Verificar se lista pertence ao fornecedor
    const listaPreco = await prisma.listaPreco.findFirst({
      where: {
        id: listaPrecoId,
        fornecedorId,
      },
    });

    if (!listaPreco) {
      return errorResponse("Lista de preço não encontrada", 404);
    }

    // Verificar se produto está na lista
    const item = await prisma.itemListaPreco.findUnique({
      where: {
        listaPrecoId_produtoId: {
          listaPrecoId,
          produtoId,
        },
      },
    });

    if (!item) {
      return errorResponse("Produto não encontrado na lista de preço", 404);
    }

    // Remover produto da lista
    await prisma.itemListaPreco.delete({
      where: {
        id: item.id,
      },
    });

    logger.info("Produto removido da lista de preço", {
      listaPrecoId,
      produtoId,
      fornecedorId,
    });

    return successResponse({ message: "Produto removido da lista de preço com sucesso" });
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    logger.error("Erro ao remover produto da lista de preço", error);
    return errorResponse("Erro ao remover produto da lista de preço", 500);
  }
}
