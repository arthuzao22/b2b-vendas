import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, handleZodError, requireAuth } from "@/lib/api-helpers";
import { slugify } from "@/lib/utils";
import { logger } from "@/lib/logger";

const createCategoriaSchema = z.object({
  nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  descricao: z.string().optional(),
  imagem: z.string().url().optional(),
  categoriaPaiId: z.string().optional(),
});

// GET /api/categorias - Listar todas as categorias (hierárquico)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const flat = searchParams.get("flat") === "true";

    if (flat) {
      // Lista plana com paginação
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "50");
      const skip = (page - 1) * limit;

      const [categorias, total] = await Promise.all([
        prisma.categoria.findMany({
          skip,
          take: limit,
          orderBy: { nome: "asc" },
          include: {
            categoriaPai: {
              select: {
                id: true,
                nome: true,
                slug: true,
              },
            },
            _count: {
              select: {
                produtos: true,
                subcategorias: true,
              },
            },
          },
        }),
        prisma.categoria.count(),
      ]);

      return successResponse({
        categorias,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } else {
      // Lista hierárquica (apenas categorias pai)
      const categoriasPai = await prisma.categoria.findMany({
        where: { categoriaPaiId: null },
        orderBy: { nome: "asc" },
        include: {
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

      return successResponse({ categorias: categoriasPai });
    }
  } catch (error) {
    logger.error("Erro ao listar categorias", error);
    return errorResponse("Erro ao listar categorias", 500);
  }
}

// POST /api/categorias - Criar categoria
export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();
    const validatedData = createCategoriaSchema.parse(body);

    // Verificar se categoria pai existe
    if (validatedData.categoriaPaiId) {
      const categoriaPai = await prisma.categoria.findUnique({
        where: { id: validatedData.categoriaPaiId },
      });

      if (!categoriaPai) {
        return errorResponse("Categoria pai não encontrada", 404);
      }
    }

    // Gerar slug único
    let slug = slugify(validatedData.nome);
    let slugExists = await prisma.categoria.findUnique({
      where: { slug },
    });

    let counter = 1;
    while (slugExists) {
      slug = `${slugify(validatedData.nome)}-${counter}`;
      slugExists = await prisma.categoria.findUnique({
        where: { slug },
      });
      counter++;
    }

    const categoria = await prisma.categoria.create({
      data: {
        nome: validatedData.nome,
        slug,
        descricao: validatedData.descricao,
        imagem: validatedData.imagem,
        categoriaPaiId: validatedData.categoriaPaiId,
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

    logger.info("Categoria criada", { categoriaId: categoria.id });

    return successResponse(categoria, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleZodError(error);
    }

    logger.error("Erro ao criar categoria", error);
    return errorResponse("Erro ao criar categoria", 500);
  }
}
