import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";
import { TipoUsuario } from "@prisma/client";

// GET /api/pedidos/[id]/historico - Obter histórico de status do pedido
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Buscar pedido
    const pedido = await prisma.pedido.findUnique({
      where: { id },
      select: {
        id: true,
        numeroPedido: true,
        clienteId: true,
        fornecedorId: true,
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

    // Buscar histórico de status
    const historico = await prisma.historicoStatusPedido.findMany({
      where: { pedidoId: id },
      orderBy: { criadoEm: "desc" },
    });

    return successResponse({
      numeroPedido: pedido.numeroPedido,
      historico,
    });
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    logger.error("Erro ao obter histórico do pedido", error);
    return errorResponse("Erro ao obter histórico do pedido", 500);
  }
}
