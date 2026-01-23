import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, handleZodError, requireFornecedor } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";
import { TipoMovimentacao } from "@prisma/client";

const createMovimentacaoSchema = z.object({
  produtoId: z.string().min(1, "Produto é obrigatório"),
  tipo: z.nativeEnum(TipoMovimentacao, {
    message: "Tipo inválido. Use: entrada, saida ou ajuste",
  }),
  quantidade: z.number().int().min(1, "Quantidade deve ser maior que 0"),
  motivo: z.string().min(3, "Motivo deve ter no mínimo 3 caracteres"),
  referencia: z.string().optional(),
});

// POST /api/estoque/movimentacoes - Criar movimentação de estoque (fornecedor only)
export async function POST(request: NextRequest) {
  try {
    const { fornecedorId, user } = await requireFornecedor();

    const body = await request.json();
    const validatedData = createMovimentacaoSchema.parse(body);

    const { produtoId, tipo, quantidade, motivo, referencia } = validatedData;

    // Buscar produto e verificar se pertence ao fornecedor
    const produto = await prisma.produto.findFirst({
      where: {
        id: produtoId,
        fornecedorId,
      },
    });

    if (!produto) {
      return errorResponse("Produto não encontrado", 404);
    }

    // Calcular novo estoque
    const estoqueAnterior = produto.quantidadeEstoque;
    let estoqueAtual = estoqueAnterior;

    if (tipo === TipoMovimentacao.entrada) {
      estoqueAtual = estoqueAnterior + quantidade;
    } else if (tipo === TipoMovimentacao.saida) {
      estoqueAtual = estoqueAnterior - quantidade;
    } else if (tipo === TipoMovimentacao.ajuste) {
      // Para ajuste, a quantidade é o valor final desejado
      estoqueAtual = quantidade;
    }

    // Prevenir estoque negativo
    if (estoqueAtual < 0) {
      return errorResponse(
        `Estoque insuficiente. Estoque atual: ${estoqueAnterior}, tentando remover: ${quantidade}`,
        400
      );
    }

    // Criar movimentação e atualizar estoque em transação
    const resultado = await prisma.$transaction(async (tx) => {
      // Atualizar estoque do produto
      const produtoAtualizado = await tx.produto.update({
        where: { id: produtoId },
        data: {
          quantidadeEstoque: estoqueAtual,
        },
      });

      // Criar movimentação
      const movimentacao = await tx.movimentacaoEstoque.create({
        data: {
          produtoId,
          tipo,
          quantidade: tipo === TipoMovimentacao.ajuste ? Math.abs(estoqueAtual - estoqueAnterior) : quantidade,
          estoqueAnterior,
          estoqueAtual,
          motivo,
          referencia,
          criadoPor: user.id,
        },
        include: {
          produto: {
            select: {
              id: true,
              nome: true,
              sku: true,
              quantidadeEstoque: true,
            },
          },
        },
      });

      return movimentacao;
    });

    logger.info("Movimentação de estoque criada", {
      movimentacaoId: resultado.id,
      produtoId,
      tipo,
      quantidade,
      estoqueAnterior,
      estoqueAtual,
      fornecedorId,
    });

    return successResponse(resultado, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleZodError(error);
    }

    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    logger.error("Erro ao criar movimentação de estoque", error);
    return errorResponse("Erro ao criar movimentação de estoque", 500);
  }
}

// GET /api/estoque/movimentacoes - Listar movimentações (fornecedor only)
export async function GET(request: NextRequest) {
  try {
    const { fornecedorId } = await requireFornecedor();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const skip = (page - 1) * limit;

    const produtoId = searchParams.get("produtoId") || undefined;
    const tipo = searchParams.get("tipo") as TipoMovimentacao | null;
    const dataInicio = searchParams.get("dataInicio");
    const dataFim = searchParams.get("dataFim");

    // Construir filtros
    const where: any = {
      produto: {
        fornecedorId,
      },
    };

    if (produtoId) {
      where.produtoId = produtoId;
    }

    if (tipo) {
      where.tipo = tipo;
    }

    if (dataInicio || dataFim) {
      where.criadoEm = {};
      if (dataInicio) {
        where.criadoEm.gte = new Date(dataInicio);
      }
      if (dataFim) {
        where.criadoEm.lte = new Date(dataFim);
      }
    }

    const [movimentacoes, total] = await Promise.all([
      prisma.movimentacaoEstoque.findMany({
        where,
        skip,
        take: limit,
        orderBy: { criadoEm: "desc" },
        include: {
          produto: {
            select: {
              id: true,
              nome: true,
              sku: true,
              quantidadeEstoque: true,
              imagens: true,
            },
          },
        },
      }),
      prisma.movimentacaoEstoque.count({ where }),
    ]);

    return successResponse({
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

    logger.error("Erro ao listar movimentações de estoque", error);
    return errorResponse("Erro ao listar movimentações de estoque", 500);
  }
}
