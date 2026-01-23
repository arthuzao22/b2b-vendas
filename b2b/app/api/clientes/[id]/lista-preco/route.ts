import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, handleZodError, requireFornecedor } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";

const assignListaPrecoSchema = z.object({
  listaPrecoId: z.string().nullable(),
});

// POST /api/clientes/[id]/lista-preco - Atribuir/remover lista de preço
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { fornecedorId } = await requireFornecedor();
    const { id: clienteId } = await params;

    const body = await request.json();
    const validatedData = assignListaPrecoSchema.parse(body);

    // Verificar se cliente pertence ao fornecedor
    const clienteFornecedor = await prisma.clienteFornecedor.findFirst({
      where: {
        clienteId,
        fornecedorId,
      },
    });

    if (!clienteFornecedor) {
      return errorResponse("Cliente não encontrado", 404);
    }

    // Se listaPrecoId foi fornecido, verificar se pertence ao fornecedor
    if (validatedData.listaPrecoId) {
      const listaPreco = await prisma.listaPreco.findFirst({
        where: {
          id: validatedData.listaPrecoId,
          fornecedorId,
        },
      });

      if (!listaPreco) {
        return errorResponse("Lista de preço não encontrada", 404);
      }

      if (!listaPreco.ativo) {
        return errorResponse("Lista de preço não está ativa", 400);
      }
    }

    // Atualizar relacionamento ClienteFornecedor
    const updated = await prisma.clienteFornecedor.update({
      where: { id: clienteFornecedor.id },
      data: {
        listaPrecoId: validatedData.listaPrecoId,
      },
      include: {
        listaPreco: {
          select: {
            id: true,
            nome: true,
            descricao: true,
            tipoDesconto: true,
            valorDesconto: true,
            ativo: true,
          },
        },
        cliente: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
            cnpj: true,
          },
        },
      },
    });

    logger.info("Lista de preço atribuída ao cliente", {
      clienteId,
      fornecedorId,
      listaPrecoId: validatedData.listaPrecoId,
    });

    const response: any = {
      clienteId: updated.clienteId,
      cliente: updated.cliente,
      listaPreco: updated.listaPreco,
    };

    // Converter Decimal para string
    if (response.listaPreco) {
      response.listaPreco.valorDesconto = response.listaPreco.valorDesconto.toString();
    }

    return successResponse(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleZodError(error);
    }

    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    logger.error("Erro ao atribuir lista de preço", error);
    return errorResponse("Erro ao atribuir lista de preço", 500);
  }
}
