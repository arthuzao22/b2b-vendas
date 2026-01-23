import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, handleZodError, requireFornecedor } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";
import { TipoDesconto } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const updateListaPrecoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").optional(),
  descricao: z.string().optional(),
  tipoDesconto: z.enum(["percentual", "fixo"]).optional(),
  valorDesconto: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      const num = typeof val === "string" ? parseFloat(val) : val;
      if (isNaN(num) || num < 0) throw new Error("Valor de desconto inválido");
      return new Decimal(num);
    }),
  ativo: z.boolean().optional(),
});

// GET /api/listas-preco/[id] - Obter lista de preço com produtos
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { fornecedorId } = await requireFornecedor();
    const { id } = await params;

    const listaPreco = await prisma.listaPreco.findFirst({
      where: {
        id,
        fornecedorId,
      },
      include: {
        fornecedor: {
          select: {
            id: true,
            nomeFantasia: true,
            razaoSocial: true,
          },
        },
        itens: {
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
        },
        _count: {
          select: {
            clientes: true,
          },
        },
      },
    });

    if (!listaPreco) {
      return errorResponse("Lista de preço não encontrada", 404);
    }

    const response = {
      id: listaPreco.id,
      fornecedor: listaPreco.fornecedor,
      nome: listaPreco.nome,
      descricao: listaPreco.descricao,
      tipoDesconto: listaPreco.tipoDesconto,
      valorDesconto: listaPreco.valorDesconto.toString(),
      ativo: listaPreco.ativo,
      totalClientes: listaPreco._count.clientes,
      produtos: listaPreco.itens.map((item) => ({
        id: item.id,
        produto: {
          ...item.produto,
          precoBase: item.produto.precoBase.toString(),
        },
        precoEspecial: item.precoEspecial?.toString() || null,
      })),
      criadoEm: listaPreco.criadoEm,
      atualizadoEm: listaPreco.atualizadoEm,
    };

    return successResponse(response);
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    logger.error("Erro ao buscar lista de preço", error);
    return errorResponse("Erro ao buscar lista de preço", 500);
  }
}

// PUT /api/listas-preco/[id] - Atualizar lista de preço
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { fornecedorId } = await requireFornecedor();
    const { id } = await params;

    const body = await request.json();
    const validatedData = updateListaPrecoSchema.parse(body);

    // Verificar se lista pertence ao fornecedor
    const listaExists = await prisma.listaPreco.findFirst({
      where: {
        id,
        fornecedorId,
      },
    });

    if (!listaExists) {
      return errorResponse("Lista de preço não encontrada", 404);
    }

    // Validar valor de desconto se tipo percentual
    if (
      validatedData.tipoDesconto === "percentual" ||
      (validatedData.valorDesconto &&
        listaExists.tipoDesconto === "percentual" &&
        !validatedData.tipoDesconto)
    ) {
      const percentual = parseFloat(
        (validatedData.valorDesconto || listaExists.valorDesconto).toString()
      );
      if (percentual > 100) {
        return errorResponse("Desconto percentual não pode ser maior que 100%", 400);
      }
    }

    const updateData: any = {};
    if (validatedData.nome) updateData.nome = validatedData.nome;
    if (validatedData.descricao !== undefined)
      updateData.descricao = validatedData.descricao;
    if (validatedData.tipoDesconto)
      updateData.tipoDesconto = validatedData.tipoDesconto as TipoDesconto;
    if (validatedData.valorDesconto !== undefined)
      updateData.valorDesconto = validatedData.valorDesconto;
    if (validatedData.ativo !== undefined) updateData.ativo = validatedData.ativo;

    const listaPreco = await prisma.listaPreco.update({
      where: { id },
      data: updateData,
      include: {
        fornecedor: {
          select: {
            id: true,
            nomeFantasia: true,
            razaoSocial: true,
          },
        },
      },
    });

    logger.info("Lista de preço atualizada", { listaPrecoId: id, fornecedorId });

    return successResponse({
      id: listaPreco.id,
      fornecedor: listaPreco.fornecedor,
      nome: listaPreco.nome,
      descricao: listaPreco.descricao,
      tipoDesconto: listaPreco.tipoDesconto,
      valorDesconto: listaPreco.valorDesconto.toString(),
      ativo: listaPreco.ativo,
      criadoEm: listaPreco.criadoEm,
      atualizadoEm: listaPreco.atualizadoEm,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleZodError(error);
    }

    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    logger.error("Erro ao atualizar lista de preço", error);
    return errorResponse("Erro ao atualizar lista de preço", 500);
  }
}

// DELETE /api/listas-preco/[id] - Deletar lista de preço
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { fornecedorId } = await requireFornecedor();
    const { id } = await params;

    // Verificar se lista pertence ao fornecedor
    const listaPreco = await prisma.listaPreco.findFirst({
      where: {
        id,
        fornecedorId,
      },
      include: {
        _count: {
          select: {
            clientes: true,
          },
        },
      },
    });

    if (!listaPreco) {
      return errorResponse("Lista de preço não encontrada", 404);
    }

    // Verificar se está atribuída a algum cliente
    if (listaPreco._count.clientes > 0) {
      return errorResponse(
        "Não é possível deletar lista de preço atribuída a clientes. Desative-a ao invés disso.",
        400
      );
    }

    // Deletar lista (itens serão deletados em cascata)
    await prisma.listaPreco.delete({
      where: { id },
    });

    logger.info("Lista de preço deletada", { listaPrecoId: id, fornecedorId });

    return successResponse({ message: "Lista de preço deletada com sucesso" });
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    logger.error("Erro ao deletar lista de preço", error);
    return errorResponse("Erro ao deletar lista de preço", 500);
  }
}
