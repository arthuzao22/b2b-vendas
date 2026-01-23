import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, handleZodError, requireAuth } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";
import { StatusPedido, TipoUsuario } from "@prisma/client";

const updateStatusSchema = z.object({
  status: z.nativeEnum(StatusPedido, {
    message: "Status inválido",
  }),
  observacao: z.string().optional(),
});

// PUT /api/pedidos/[id]/status - Atualizar status do pedido (fornecedor/admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Apenas fornecedor ou admin podem atualizar status
    if (user.tipo !== TipoUsuario.fornecedor && user.tipo !== TipoUsuario.admin) {
      return errorResponse("Sem permissão para atualizar status do pedido", 403);
    }

    const body = await request.json();
    const validatedData = updateStatusSchema.parse(body);

    const { status, observacao } = validatedData;

    // Buscar pedido
    const pedido = await prisma.pedido.findUnique({
      where: { id },
      include: {
        itens: {
          include: {
            produto: true,
          },
        },
      },
    });

    if (!pedido) {
      return errorResponse("Pedido não encontrado", 404);
    }

    // Verificar permissões do fornecedor
    if (user.tipo === TipoUsuario.fornecedor) {
      if (pedido.fornecedorId !== user.fornecedorId) {
        return errorResponse("Sem permissão para atualizar este pedido", 403);
      }
    }

    // Se mudando para cancelado, incrementar estoque de volta
    const resultado = await prisma.$transaction(async (tx) => {
      // Atualizar status do pedido
      const pedidoAtualizado = await tx.pedido.update({
        where: { id },
        data: { status },
        include: {
          cliente: {
            include: {
              usuario: {
                select: {
                  nome: true,
                  email: true,
                },
              },
            },
          },
          fornecedor: {
            select: {
              id: true,
              nomeFantasia: true,
              razaoSocial: true,
            },
          },
          itens: {
            include: {
              produto: true,
            },
          },
        },
      });

      // Criar histórico de status
      await tx.historicoStatusPedido.create({
        data: {
          pedidoId: id,
          status,
          observacao,
          criadoPor: user.id,
        },
      });

      // Se cancelado, incrementar estoque de volta
      if (status === StatusPedido.cancelado) {
        for (const item of pedido.itens) {
          const estoqueAnterior = item.produto.quantidadeEstoque;
          const estoqueAtual = estoqueAnterior + item.quantidade;

          await tx.produto.update({
            where: { id: item.produtoId },
            data: {
              quantidadeEstoque: estoqueAtual,
            },
          });

          await tx.movimentacaoEstoque.create({
            data: {
              produtoId: item.produtoId,
              tipo: "entrada",
              quantidade: item.quantidade,
              estoqueAnterior,
              estoqueAtual,
              motivo: `Cancelamento pedido ${pedido.numeroPedido}`,
              referencia: pedido.numeroPedido,
              criadoPor: user.id,
            },
          });
        }
      }

      return pedidoAtualizado;
    });

    logger.info("Status do pedido atualizado", {
      pedidoId: id,
      numeroPedido: pedido.numeroPedido,
      statusAnterior: pedido.status,
      statusNovo: status,
      userId: user.id,
    });

    // Converter Decimals para string
    const pedidoResponse = {
      ...resultado,
      subtotal: resultado.subtotal.toString(),
      desconto: resultado.desconto.toString(),
      frete: resultado.frete.toString(),
      total: resultado.total.toString(),
      itens: resultado.itens.map(item => ({
        ...item,
        precoUnitario: item.precoUnitario.toString(),
        precoTotal: item.precoTotal.toString(),
        produto: {
          ...item.produto,
          precoBase: item.produto.precoBase.toString(),
          peso: item.produto.peso?.toString(),
        },
      })),
    };

    return successResponse(pedidoResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleZodError(error);
    }

    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    logger.error("Erro ao atualizar status do pedido", error);
    return errorResponse("Erro ao atualizar status do pedido", 500);
  }
}
