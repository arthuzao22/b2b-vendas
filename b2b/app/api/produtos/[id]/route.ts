import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, handleZodError, requireFornecedor } from "@/lib/api-helpers";
import { slugify } from "@/lib/utils";
import { logger } from "@/lib/logger";
import { Decimal } from "@prisma/client/runtime/library";
import { StatusPedido } from "@prisma/client";
import { del } from "@vercel/blob";

const updateProdutoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").optional(),
  sku: z.string().min(1, "SKU é obrigatório").optional(),
  precoBase: z.union([z.number(), z.string()]).optional().transform((val) => {
    if (val === undefined || val === null) return undefined;
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num) || num < 0) throw new Error("Preço base inválido");
    return new Decimal(num);
  }),
  categoriaId: z.string().nullable().optional(),
  descricao: z.string().nullable().optional(),
  imagens: z.array(z.string()).optional(),
  quantidadeEstoque: z.number().int().min(0).optional(),
  estoqueMinimo: z.number().int().min(0).optional(),
  estoqueMaximo: z.number().int().min(0).optional(),
  peso: z.union([z.number(), z.string()]).nullable().optional().transform((val) => {
    if (val === undefined || val === null) return undefined;
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num) || num < 0) throw new Error("Peso inválido");
    return new Decimal(num);
  }),
  unidadeMedida: z.string().nullable().optional(),
  ativo: z.boolean().optional(),
});

// GET /api/produtos/[id] - Obter detalhes do produto
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const produto = await prisma.produto.findUnique({
      where: { id },
      include: {
        fornecedor: {
          select: {
            id: true,
            nomeFantasia: true,
            razaoSocial: true,
            cnpj: true,
            descricao: true,
            endereco: true,
            cidade: true,
            estado: true,
          },
        },
        categoria: {
          select: {
            id: true,
            nome: true,
            slug: true,
            descricao: true,
          },
        },
      },
    });

    if (!produto) {
      return errorResponse("Produto não encontrado", 404);
    }

    // Converter Decimal para string
    const produtoResponse = {
      ...produto,
      precoBase: produto.precoBase.toString(),
      peso: produto.peso?.toString(),
    };

    return successResponse(produtoResponse);
  } catch (error) {
    logger.error("Erro ao obter produto", error);
    return errorResponse("Erro ao obter produto", 500);
  }
}

// PUT /api/produtos/[id] - Atualizar produto (fornecedor only, own products)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { fornecedorId } = await requireFornecedor();
    const { id } = await params;

    // Verificar se produto existe e pertence ao fornecedor
    const produtoExistente = await prisma.produto.findUnique({
      where: { id },
    });

    if (!produtoExistente) {
      return errorResponse("Produto não encontrado", 404);
    }

    // Convert both IDs to strings for comparison to avoid type mismatch
    if (String(produtoExistente.fornecedorId) !== String(fornecedorId)) {
      logger.warn("Permission denied for product edit", {
        produtoFornecedorId: produtoExistente.fornecedorId,
        sessionFornecedorId: fornecedorId,
      });
      return errorResponse("Você não tem permissão para editar este produto", 403);
    }

    const body = await request.json();
    const validatedData = updateProdutoSchema.parse(body);

    // Limpar imagens removidas do Vercel Blob
    if (validatedData.imagens) {
      const imagensRemovidas = produtoExistente.imagens.filter(
        (url) => !validatedData.imagens!.includes(url)
      );
      for (const url of imagensRemovidas) {
        if (url.includes('.blob.vercel-storage.com')) {
          try {
            await del(url);
            logger.info('Imagem removida do Blob durante atualização', { url });
          } catch (err) {
            logger.warn('Falha ao remover imagem do Blob', { url, error: err });
          }
        }
      }
    }

    // Verificar se categoria existe
    if (validatedData.categoriaId) {
      const categoria = await prisma.categoria.findUnique({
        where: { id: validatedData.categoriaId },
      });

      if (!categoria) {
        return errorResponse("Categoria não encontrada", 404);
      }
    }

    // Atualizar slug se nome foi alterado
    let slug = produtoExistente.slug;
    if (validatedData.nome && validatedData.nome !== produtoExistente.nome) {
      slug = slugify(validatedData.nome);
      
      let slugExists = await prisma.produto.findFirst({
        where: {
          fornecedorId,
          slug,
          id: { not: id },
        },
      });

      let counter = 1;
      while (slugExists) {
        slug = `${slugify(validatedData.nome)}-${counter}`;
        slugExists = await prisma.produto.findFirst({
          where: {
            fornecedorId,
            slug,
            id: { not: id },
          },
        });
        counter++;
      }
    }

    // Verificar se SKU foi alterado e se já existe
    if (validatedData.sku && validatedData.sku !== produtoExistente.sku) {
      const skuExists = await prisma.produto.findFirst({
        where: {
          fornecedorId,
          sku: validatedData.sku,
          id: { not: id },
        },
      });

      if (skuExists) {
        return errorResponse("SKU já existe para este fornecedor", 409);
      }
    }

    const produto = await prisma.produto.update({
      where: { id },
      data: {
        ...(validatedData.nome && { nome: validatedData.nome }),
        ...(validatedData.nome && { slug }),
        ...(validatedData.sku && { sku: validatedData.sku }),
        ...(validatedData.precoBase && { precoBase: validatedData.precoBase }),
        ...(validatedData.categoriaId !== undefined && { categoriaId: validatedData.categoriaId }),
        ...(validatedData.descricao !== undefined && { descricao: validatedData.descricao }),
        ...(validatedData.imagens && { imagens: validatedData.imagens }),
        ...(validatedData.quantidadeEstoque !== undefined && { quantidadeEstoque: validatedData.quantidadeEstoque }),
        ...(validatedData.estoqueMinimo !== undefined && { estoqueMinimo: validatedData.estoqueMinimo }),
        ...(validatedData.estoqueMaximo !== undefined && { estoqueMaximo: validatedData.estoqueMaximo }),
        ...(validatedData.peso !== undefined && { peso: validatedData.peso }),
        ...(validatedData.unidadeMedida !== undefined && { unidadeMedida: validatedData.unidadeMedida }),
        ...(validatedData.ativo !== undefined && { ativo: validatedData.ativo }),
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

    logger.info("Produto atualizado", { 
      produtoId: produto.id, 
      fornecedorId 
    });

    // Converter Decimal para string
    const produtoResponse = {
      ...produto,
      precoBase: produto.precoBase.toString(),
      peso: produto.peso?.toString(),
    };

    return successResponse(produtoResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleZodError(error);
    }

    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    logger.error("Erro ao atualizar produto", error);
    return errorResponse("Erro ao atualizar produto", 500);
  }
}

// DELETE /api/produtos/[id] - Deletar produto (fornecedor only, own products)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { fornecedorId } = await requireFornecedor();
    const { id } = await params;

    // Verificar se produto existe e pertence ao fornecedor
    const produto = await prisma.produto.findUnique({
      where: { id },
    });

    if (!produto) {
      return errorResponse("Produto não encontrado", 404);
    }

    // Convert both IDs to strings for comparison to avoid type mismatch
    if (String(produto.fornecedorId) !== String(fornecedorId)) {
      return errorResponse("Você não tem permissão para excluir este produto", 403);
    }

    // Verificar se existem pedidos pendentes com este produto
    const pedidosPendentes = await prisma.itemPedido.findFirst({
      where: {
        produtoId: id,
        pedido: {
          status: {
            in: [
              StatusPedido.pendente,
              StatusPedido.confirmado,
              StatusPedido.processando,
              StatusPedido.enviado,
            ],
          },
        },
      },
      include: {
        pedido: {
          select: {
            numeroPedido: true,
            status: true,
          },
        },
      },
    });

    if (pedidosPendentes) {
      return errorResponse(
        `Não é possível excluir o produto. Existe pedido ${pedidosPendentes.pedido.numeroPedido} com status ${pedidosPendentes.pedido.status}`,
        409
      );
    }

    // Limpar imagens do Vercel Blob antes de deletar
    if (produto.imagens && produto.imagens.length > 0) {
      for (const url of produto.imagens) {
        if (url.includes('.blob.vercel-storage.com')) {
          try {
            await del(url);
            logger.info('Imagem removida do Blob durante deleção', { url });
          } catch (err) {
            logger.warn('Falha ao remover imagem do Blob', { url, error: err });
          }
        }
      }
    }

    await prisma.produto.delete({
      where: { id },
    });

    logger.info("Produto deletado", { 
      produtoId: id, 
      fornecedorId,
      sku: produto.sku 
    });

    return successResponse({ message: "Produto excluído com sucesso" });
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    logger.error("Erro ao deletar produto", error);
    return errorResponse("Erro ao deletar produto", 500);
  }
}
