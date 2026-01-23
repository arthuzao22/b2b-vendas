import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, handleZodError, requireFornecedor } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";
import { Decimal } from "@prisma/client/runtime/library";

const addProdutoSchema = z.object({
  produtoId: z.string().min(1, "ID do produto é obrigatório"),
  precoEspecial: z
    .union([z.number(), z.string()])
    .optional()
    .nullable()
    .transform((val) => {
      if (val === undefined || val === null) return null;
      const num = typeof val === "string" ? parseFloat(val) : val;
      if (isNaN(num) || num < 0) throw new Error("Preço especial inválido");
      return new Decimal(num);
    }),
});

// POST /api/listas-preco/[id]/produtos - Adicionar produto à lista
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { fornecedorId } = await requireFornecedor();
    const { id: listaPrecoId } = await params;

    const body = await request.json();
    const validatedData = addProdutoSchema.parse(body);

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

    // Verificar se produto pertence ao fornecedor
    const produto = await prisma.produto.findFirst({
      where: {
        id: validatedData.produtoId,
        fornecedorId,
      },
    });

    if (!produto) {
      return errorResponse("Produto não encontrado", 404);
    }

    // Verificar se produto já está na lista
    const itemExists = await prisma.itemListaPreco.findUnique({
      where: {
        listaPrecoId_produtoId: {
          listaPrecoId,
          produtoId: validatedData.produtoId,
        },
      },
    });

    if (itemExists) {
      return errorResponse("Produto já está na lista de preço", 409);
    }

    // Adicionar produto à lista
    const item = await prisma.itemListaPreco.create({
      data: {
        listaPrecoId,
        produtoId: validatedData.produtoId,
        precoEspecial: validatedData.precoEspecial,
      },
      include: {
        produto: {
          select: {
            id: true,
            nome: true,
            sku: true,
            precoBase: true,
            imagens: true,
            ativo: true,
          },
        },
      },
    });

    logger.info("Produto adicionado à lista de preço", {
      listaPrecoId,
      produtoId: validatedData.produtoId,
      fornecedorId,
    });

    return successResponse(
      {
        id: item.id,
        produto: {
          ...item.produto,
          precoBase: item.produto.precoBase.toString(),
        },
        precoEspecial: item.precoEspecial?.toString() || null,
      },
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleZodError(error);
    }

    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    logger.error("Erro ao adicionar produto à lista de preço", error);
    return errorResponse("Erro ao adicionar produto à lista de preço", 500);
  }
}

// GET /api/listas-preco/[id]/produtos - Listar produtos da lista
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { fornecedorId } = await requireFornecedor();
    const { id: listaPrecoId } = await params;

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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const skip = (page - 1) * limit;

    const [itens, total] = await Promise.all([
      prisma.itemListaPreco.findMany({
        where: {
          listaPrecoId,
        },
        skip,
        take: limit,
        include: {
          produto: {
            select: {
              id: true,
              nome: true,
              sku: true,
              precoBase: true,
              imagens: true,
              ativo: true,
              quantidadeEstoque: true,
            },
          },
        },
      }),
      prisma.itemListaPreco.count({
        where: {
          listaPrecoId,
        },
      }),
    ]);

    const itensResponse = itens.map((item) => ({
      id: item.id,
      produto: {
        ...item.produto,
        precoBase: item.produto.precoBase.toString(),
      },
      precoEspecial: item.precoEspecial?.toString() || null,
    }));

    return successResponse({
      listaPreco: {
        id: listaPreco.id,
        nome: listaPreco.nome,
        tipoDesconto: listaPreco.tipoDesconto,
        valorDesconto: listaPreco.valorDesconto.toString(),
      },
      produtos: itensResponse,
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

    logger.error("Erro ao listar produtos da lista de preço", error);
    return errorResponse("Erro ao listar produtos da lista de preço", 500);
  }
}
