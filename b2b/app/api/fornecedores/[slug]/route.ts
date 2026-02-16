import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";

// GET /api/fornecedores/[slug] - Obter dados públicos do fornecedor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const fornecedor = await prisma.fornecedor.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        razaoSocial: true,
        nomeFantasia: true,
        descricao: true,
        logo: true,
        banner: true,
        cidade: true,
        estado: true,
        verificado: true,
        criadoEm: true,
        _count: {
          select: {
            produtos: {
              where: { ativo: true },
            },
          },
        },
      },
    });

    if (!fornecedor) {
      return errorResponse("Fornecedor não encontrado", 404);
    }

    // Buscar produtos ativos com paginação
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 50);
    const skip = (page - 1) * limit;
    const categoriaId = searchParams.get("categoriaId") || undefined;
    const search = searchParams.get("search") || undefined;

    const produtoWhere: any = {
      fornecedorId: fornecedor.id,
      ativo: true,
    };

    if (categoriaId) {
      produtoWhere.categoriaId = categoriaId;
    }

    if (search) {
      produtoWhere.OR = [
        { nome: { contains: search, mode: "insensitive" } },
        { descricao: { contains: search, mode: "insensitive" } },
      ];
    }

    const [produtos, totalProdutos, categorias] = await Promise.all([
      prisma.produto.findMany({
        where: produtoWhere,
        skip,
        take: limit,
        orderBy: { criadoEm: "desc" },
        select: {
          id: true,
          nome: true,
          slug: true,
          sku: true,
          descricao: true,
          precoBase: true,
          imagens: true,
          quantidadeEstoque: true,
          categoria: {
            select: {
              id: true,
              nome: true,
              slug: true,
            },
          },
        },
      }),
      prisma.produto.count({ where: produtoWhere }),
      // Buscar categorias disponíveis deste fornecedor
      prisma.categoria.findMany({
        where: {
          produtos: {
            some: {
              fornecedorId: fornecedor.id,
              ativo: true,
            },
          },
        },
        select: {
          id: true,
          nome: true,
          slug: true,
        },
        orderBy: { nome: "asc" },
      }),
    ]);

    logger.info("Fornecedor público consultado", { slug });

    return successResponse({
      fornecedor: {
        ...fornecedor,
        totalProdutos: fornecedor._count.produtos,
        _count: undefined,
      },
      produtos: produtos.map((p) => ({
        ...p,
        precoBase: p.precoBase.toString(),
      })),
      categorias,
      pagination: {
        page,
        limit,
        total: totalProdutos,
        totalPages: Math.ceil(totalProdutos / limit),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    logger.error("Erro ao buscar fornecedor", error);
    return errorResponse("Erro ao buscar fornecedor", 500);
  }
}
