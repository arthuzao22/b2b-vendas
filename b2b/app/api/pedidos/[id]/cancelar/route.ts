import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";
import { StatusPedido, TipoUsuario } from "@prisma/client";

// POST /api/pedidos/[id]/cancelar - Cancelar pedido (cliente/fornecedor)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

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

    // Verificar permissões
    if (user.tipo === TipoUsuario.cliente) {
      if (pedido.clienteId !== user.clienteId) {
        return errorResponse("Sem permissão para cancelar este pedido", 403);
      }
    } else if (user.tipo === TipoUsuario.fornecedor) {
      if (pedido.fornecedorId !== user.fornecedorId) {
        return errorResponse("Sem permissão para cancelar este pedido", 403);
      }
    }

    // Verificar se pode cancelar (apenas pendente ou confirmado)
    if (pedido.status !== StatusPedido.pendente && pedido.status !== StatusPedido.confirmado) {
      return errorResponse(
        `Não é possível cancelar pedido com status ${pedido.status}. Apenas pedidos pendentes ou confirmados podem ser cancelados.`,
        400
      );
    }

    // Cancelar pedido em transação
    const resultado = await prisma.$transaction(async (tx) => {
      // Atualizar status para cancelado
      const pedidoAtualizado = await tx.pedido.update({
        where: { id },
        data: { status: StatusPedido.cancelado },
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
          status: StatusPedido.cancelado,
          observacao: "Pedido cancelado",
          criadoPor: user.id,
        },
      });

      // Incrementar estoque de volta e criar movimentações
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

      return pedidoAtualizado;
    });

    logger.info("Pedido cancelado", {
      pedidoId: id,
      numeroPedido: pedido.numeroPedido,
      userId: user.id,
      userTipo: user.tipo,
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
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    logger.error("Erro ao cancelar pedido", error);
    return errorResponse("Erro ao cancelar pedido", 500);
  }
}
