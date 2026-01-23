import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, handleZodError, requireAuth } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";
import { TipoUsuario } from "@prisma/client";

const addRastreioSchema = z.object({
  codigoRastreio: z.string().min(1, "Código de rastreio é obrigatório"),
  previsaoEntrega: z.string().optional().transform((val) => {
    if (!val) return undefined;
    return new Date(val);
  }),
});

// PUT /api/pedidos/[id]/rastreio - Adicionar código de rastreio (fornecedor/admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Apenas fornecedor ou admin podem adicionar rastreio
    if (user.tipo !== TipoUsuario.fornecedor && user.tipo !== TipoUsuario.admin) {
      return errorResponse("Sem permissão para adicionar código de rastreio", 403);
    }

    const body = await request.json();
    const validatedData = addRastreioSchema.parse(body);

    const { codigoRastreio, previsaoEntrega } = validatedData;

    // Buscar pedido
    const pedido = await prisma.pedido.findUnique({
      where: { id },
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

    // Atualizar pedido
    const pedidoAtualizado = await prisma.pedido.update({
      where: { id },
      data: {
        codigoRastreio,
        previsaoEntrega,
      },
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

    logger.info("Código de rastreio adicionado", {
      pedidoId: id,
      numeroPedido: pedido.numeroPedido,
      codigoRastreio,
      userId: user.id,
    });

    // Converter Decimals para string
    const pedidoResponse = {
      ...pedidoAtualizado,
      subtotal: pedidoAtualizado.subtotal.toString(),
      desconto: pedidoAtualizado.desconto.toString(),
      frete: pedidoAtualizado.frete.toString(),
      total: pedidoAtualizado.total.toString(),
      itens: pedidoAtualizado.itens.map(item => ({
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

    logger.error("Erro ao adicionar código de rastreio", error);
    return errorResponse("Erro ao adicionar código de rastreio", 500);
  }
}
