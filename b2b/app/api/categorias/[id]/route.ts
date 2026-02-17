import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, handleZodError, requireRole } from "@/lib/api-helpers";
import { slugify } from "@/lib/utils";
import { logger } from "@/lib/logger";

const updateCategoriaSchema = z.object({
  nome: z.string().min(2).optional(),
  descricao: z.string().optional(),
  imagem: z.string().url().optional().nullable(),
  categoriaPaiId: z.string().optional().nullable(),
});

// GET /api/categorias/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoria = await prisma.categoria.findUnique({
      where: { id },
      include: {
        categoriaPai: {
          select: {
            id: true,
            nome: true,
            slug: true,
          },
        },
        subcategorias: {
          orderBy: { nome: "asc" },
          include: {
            _count: {
              select: {
                produtos: true,
              },
            },
          },
        },
        _count: {
          select: {
            produtos: true,
          },
        },
      },
    });

    if (!categoria) {
      return errorResponse("Categoria não encontrada", 404);
    }

    return successResponse(categoria);
  } catch (error) {
    logger.error("Erro ao buscar categoria", error);
    return errorResponse("Erro ao buscar categoria", 500);
  }
}

// PUT /api/categorias/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["admin", "fornecedor"]);
    const { id } = await params;

    const categoria = await prisma.categoria.findUnique({
      where: { id },
    });

    if (!categoria) {
      return errorResponse("Categoria não encontrada", 404);
    }

    const body = await request.json();
    const validatedData = updateCategoriaSchema.parse(body);

    // Se mudou o nome, atualizar slug
    let slug = categoria.slug;
    if (validatedData.nome && validatedData.nome !== categoria.nome) {
      slug = slugify(validatedData.nome);

      // Verificar se slug já existe
      const slugExists = await prisma.categoria.findFirst({
        where: {
          slug,
          id: { not: id },
        },
      });

      if (slugExists) {
        slug = `${slugify(validatedData.nome)}-${Date.now()}`;
      }
    }

    // Verificar se categoria pai existe
    if (validatedData.categoriaPaiId) {
      const categoriaPai = await prisma.categoria.findUnique({
        where: { id: validatedData.categoriaPaiId },
      });

      if (!categoriaPai) {
        return errorResponse("Categoria pai não encontrada", 404);
      }

      // Não permitir categoria ser pai de si mesma
      if (validatedData.categoriaPaiId === id) {
        return errorResponse("Categoria não pode ser pai de si mesma", 400);
      }
    }

    const categoriaAtualizada = await prisma.categoria.update({
      where: { id },
      data: {
        ...(validatedData.nome && { nome: validatedData.nome, slug }),
        ...(validatedData.descricao !== undefined && { descricao: validatedData.descricao }),
        ...(validatedData.imagem !== undefined && { imagem: validatedData.imagem }),
        ...(validatedData.categoriaPaiId !== undefined && {
          categoriaPaiId: validatedData.categoriaPaiId,
        }),
      },
      include: {
        categoriaPai: {
          select: {
            id: true,
            nome: true,
            slug: true,
          },
        },
      },
    });

    logger.info("Categoria atualizada", { categoriaId: id });

    return successResponse(categoriaAtualizada);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleZodError(error);
    }

    logger.error("Erro ao atualizar categoria", error);
    return errorResponse("Erro ao atualizar categoria", 500);
  }
}

// DELETE /api/categorias/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["admin", "fornecedor"]);
    const { id } = await params;

    const categoria = await prisma.categoria.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            produtos: true,
            subcategorias: true,
          },
        },
      },
    });

    if (!categoria) {
      return errorResponse("Categoria não encontrada", 404);
    }

    // Não permitir deletar se tiver produtos ou subcategorias
    if (categoria._count.produtos > 0) {
      return errorResponse(
        `Não é possível deletar: categoria tem ${categoria._count.produtos} produto(s)`,
        400
      );
    }

    if (categoria._count.subcategorias > 0) {
      return errorResponse(
        `Não é possível deletar: categoria tem ${categoria._count.subcategorias} subcategoria(s)`,
        400
      );
    }

    await prisma.categoria.delete({
      where: { id },
    });

    logger.info("Categoria deletada", { categoriaId: id });

    return successResponse({ message: "Categoria deletada com sucesso" });
  } catch (error) {
    logger.error("Erro ao deletar categoria", error);
    return errorResponse("Erro ao deletar categoria", 500);
  }
}
