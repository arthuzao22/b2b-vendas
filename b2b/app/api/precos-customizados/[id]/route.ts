import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, handleZodError, requireFornecedor } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";
import { Decimal } from "@prisma/client/runtime/library";

const updatePrecoCustomizadoSchema = z.object({
  preco: z.union([z.number(), z.string()]).transform((val) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num) || num < 0) throw new Error("Preço inválido");
    return new Decimal(num);
  }),
});

// GET /api/precos-customizados/[id] - Obter preço customizado
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { fornecedorId } = await requireFornecedor();
    const { id } = await params;

    const precoCustomizado = await prisma.precoCustomizado.findUnique({
      where: { id },
      include: {
        cliente: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
            cnpj: true,
          },
        },
        produto: {
          select: {
            id: true,
            fornecedorId: true,
            nome: true,
            sku: true,
            precoBase: true,
            imagens: true,
          },
        },
      },
    });

    if (!precoCustomizado) {
      return errorResponse("Preço customizado não encontrado", 404);
    }

    // Verificar se produto pertence ao fornecedor
    if (precoCustomizado.produto.fornecedorId !== fornecedorId) {
      return errorResponse("Preço customizado não encontrado", 404);
    }

    const response = {
      id: precoCustomizado.id,
      cliente: precoCustomizado.cliente,
      produto: {
        id: precoCustomizado.produto.id,
        nome: precoCustomizado.produto.nome,
        sku: precoCustomizado.produto.sku,
        precoBase: precoCustomizado.produto.precoBase.toString(),
        imagens: precoCustomizado.produto.imagens,
      },
      preco: precoCustomizado.preco.toString(),
      criadoEm: precoCustomizado.criadoEm,
      atualizadoEm: precoCustomizado.atualizadoEm,
    };

    return successResponse(response);
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    logger.error("Erro ao buscar preço customizado", error);
    return errorResponse("Erro ao buscar preço customizado", 500);
  }
}

// PUT /api/precos-customizados/[id] - Atualizar preço customizado
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { fornecedorId } = await requireFornecedor();
    const { id } = await params;

    const body = await request.json();
    const validatedData = updatePrecoCustomizadoSchema.parse(body);

    // Buscar preço customizado e verificar ownership
    const precoCustomizado = await prisma.precoCustomizado.findUnique({
      where: { id },
      include: {
        produto: {
          select: {
            fornecedorId: true,
          },
        },
      },
    });

    if (!precoCustomizado) {
      return errorResponse("Preço customizado não encontrado", 404);
    }

    // Verificar se produto pertence ao fornecedor
    if (precoCustomizado.produto.fornecedorId !== fornecedorId) {
      return errorResponse("Preço customizado não encontrado", 404);
    }

    // Atualizar preço
    const updated = await prisma.precoCustomizado.update({
      where: { id },
      data: {
        preco: validatedData.preco,
      },
      include: {
        cliente: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
            cnpj: true,
          },
        },
        produto: {
          select: {
            id: true,
            nome: true,
            sku: true,
            precoBase: true,
            imagens: true,
          },
        },
      },
    });

    logger.info("Preço customizado atualizado", {
      precoCustomizadoId: id,
      fornecedorId,
    });

    return successResponse({
      id: updated.id,
      cliente: updated.cliente,
      produto: {
        ...updated.produto,
        precoBase: updated.produto.precoBase.toString(),
      },
      preco: updated.preco.toString(),
      criadoEm: updated.criadoEm,
      atualizadoEm: updated.atualizadoEm,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleZodError(error);
    }

    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    logger.error("Erro ao atualizar preço customizado", error);
    return errorResponse("Erro ao atualizar preço customizado", 500);
  }
}

// DELETE /api/precos-customizados/[id] - Deletar preço customizado
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { fornecedorId } = await requireFornecedor();
    const { id } = await params;

    // Buscar preço customizado e verificar ownership
    const precoCustomizado = await prisma.precoCustomizado.findUnique({
      where: { id },
      include: {
        produto: {
          select: {
            fornecedorId: true,
          },
        },
      },
    });

    if (!precoCustomizado) {
      return errorResponse("Preço customizado não encontrado", 404);
    }

    // Verificar se produto pertence ao fornecedor
    if (precoCustomizado.produto.fornecedorId !== fornecedorId) {
      return errorResponse("Preço customizado não encontrado", 404);
    }

    // Deletar preço customizado
    await prisma.precoCustomizado.delete({
      where: { id },
    });

    logger.info("Preço customizado deletado", {
      precoCustomizadoId: id,
      fornecedorId,
    });

    return successResponse({ message: "Preço customizado deletado com sucesso" });
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    logger.error("Erro ao deletar preço customizado", error);
    return errorResponse("Erro ao deletar preço customizado", 500);
  }
}
