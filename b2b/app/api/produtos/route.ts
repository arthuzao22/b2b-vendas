import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, handleZodError, requireFornecedor } from "@/lib/api-helpers";
import { slugify } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { Decimal } from "@prisma/client/runtime/library";

const createProdutoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  sku: z.string().min(1, "SKU é obrigatório"),
  precoBase: z.union([z.number(), z.string()]).transform((val) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num) || num < 0) throw new Error("Preço base inválido");
    return new Decimal(num);
  }),
  categoriaId: z.string().optional(),
  descricao: z.string().optional(),
  imagens: z.array(z.string()).default([]),
  quantidadeEstoque: z.number().int().min(0).default(0),
  estoqueMinimo: z.number().int().min(0).default(0),
  estoqueMaximo: z.number().int().min(0).default(1000),
  peso: z.union([z.number(), z.string()]).optional().transform((val) => {
    if (val === undefined || val === null) return undefined;
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num) || num < 0) throw new Error("Peso inválido");
    return new Decimal(num);
  }),
  unidadeMedida: z.string().optional(),
  ativo: z.boolean().default(true),
});

// POST /api/produtos - Criar produto (fornecedor only)
export async function POST(request: NextRequest) {
  try {
    const { fornecedorId } = await requireFornecedor();

    const body = await request.json();
    const validatedData = createProdutoSchema.parse(body);

    // Verificar se categoria existe
    if (validatedData.categoriaId) {
      const categoria = await prisma.categoria.findUnique({
        where: { id: validatedData.categoriaId },
      });

      if (!categoria) {
        return errorResponse("Categoria não encontrada", 404);
      }
    }

    // Gerar slug único para este fornecedor
    let slug = slugify(validatedData.nome);
    let slugExists = await prisma.produto.findUnique({
      where: {
        fornecedorId_slug: {
          fornecedorId,
          slug,
        },
      },
    });

    let counter = 1;
    while (slugExists) {
      slug = `${slugify(validatedData.nome)}-${counter}`;
      slugExists = await prisma.produto.findUnique({
        where: {
          fornecedorId_slug: {
            fornecedorId,
            slug,
          },
        },
      });
      counter++;
    }

    // Verificar se SKU já existe para este fornecedor
    const skuExists = await prisma.produto.findUnique({
      where: {
        fornecedorId_sku: {
          fornecedorId,
          sku: validatedData.sku,
        },
      },
    });

    if (skuExists) {
      return errorResponse("SKU já existe para este fornecedor", 409);
    }

    const produto = await prisma.produto.create({
      data: {
        fornecedorId,
        nome: validatedData.nome,
        slug,
        sku: validatedData.sku,
        precoBase: validatedData.precoBase,
        categoriaId: validatedData.categoriaId,
        descricao: validatedData.descricao,
        imagens: validatedData.imagens,
        quantidadeEstoque: validatedData.quantidadeEstoque,
        estoqueMinimo: validatedData.estoqueMinimo,
        estoqueMaximo: validatedData.estoqueMaximo,
        peso: validatedData.peso,
        unidadeMedida: validatedData.unidadeMedida,
        ativo: validatedData.ativo,
      },
      include: {
        fornecedor: {
          select: {
            id: true,
            nomeFantasia: true,
            razaoSocial: true,
            cnpj: true,
          },
        },
        categoria: {
          select: {
            id: true,
            nome: true,
            slug: true,
          },
        },
      },
    });

    logger.info("Produto criado", { 
      produtoId: produto.id, 
      fornecedorId,
      sku: produto.sku 
    });

    // Converter Decimal para string para serialização JSON
    const produtoResponse = {
      ...produto,
      precoBase: produto.precoBase.toString(),
      peso: produto.peso?.toString(),
    };

    return successResponse(produtoResponse, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleZodError(error);
    }

    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    logger.error("Erro ao criar produto", error);
    return errorResponse("Erro ao criar produto", 500);
  }
}

// GET /api/produtos - Listar produtos com paginação e filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const skip = (page - 1) * limit;

    const fornecedorId = searchParams.get("fornecedorId") || undefined;
    const categoriaId = searchParams.get("categoriaId") || undefined;
    const search = searchParams.get("search") || undefined;
    const ativo = searchParams.get("ativo");

    // Construir filtros
    const where: any = {};

    if (fornecedorId) {
      where.fornecedorId = fornecedorId;
    }

    if (categoriaId) {
      where.categoriaId = categoriaId;
    }

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: "insensitive" } },
        { descricao: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    if (ativo !== null && ativo !== undefined) {
      where.ativo = ativo === "true";
    }

    const [produtos, total] = await Promise.all([
      prisma.produto.findMany({
        where,
        skip,
        take: limit,
        orderBy: { criadoEm: "desc" },
        include: {
          fornecedor: {
            select: {
              id: true,
              nomeFantasia: true,
              razaoSocial: true,
              cnpj: true,
            },
          },
          categoria: {
            select: {
              id: true,
              nome: true,
              slug: true,
            },
          },
        },
      }),
      prisma.produto.count({ where }),
    ]);

    // Converter Decimal para string
    const produtosResponse = produtos.map((produto) => ({
      ...produto,
      precoBase: produto.precoBase.toString(),
      peso: produto.peso?.toString(),
    }));

    return successResponse({
      produtos: produtosResponse,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Erro ao listar produtos", error);
    return errorResponse("Erro ao listar produtos", 500);
  }
}
