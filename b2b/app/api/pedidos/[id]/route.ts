import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";
import { TipoUsuario } from "@prisma/client";

// GET /api/pedidos/[id] - Obter detalhes do pedido
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const pedido = await prisma.pedido.findUnique({
      where: { id },
      include: {
        cliente: {
          include: {
            usuario: {
              select: {
                nome: true,
                email: true,
                telefone: true,
              },
            },
          },
        },
        fornecedor: {
          include: {
            usuario: {
              select: {
                nome: true,
                email: true,
                telefone: true,
              },
            },
          },
        },
        itens: {
          include: {
            produto: true,
          },
        },
        historicoStatus: {
          orderBy: {
            criadoEm: "desc",
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
        return errorResponse("Sem permissão para visualizar este pedido", 403);
      }
    } else if (user.tipo === TipoUsuario.fornecedor) {
      if (pedido.fornecedorId !== user.fornecedorId) {
        return errorResponse("Sem permissão para visualizar este pedido", 403);
      }
    }

    // Converter Decimals para string
    const pedidoResponse = {
      ...pedido,
      subtotal: pedido.subtotal.toString(),
      desconto: pedido.desconto.toString(),
      frete: pedido.frete.toString(),
      total: pedido.total.toString(),
      itens: pedido.itens.map(item => ({
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

    logger.error("Erro ao obter pedido", error);
    return errorResponse("Erro ao obter pedido", 500);
  }
}
