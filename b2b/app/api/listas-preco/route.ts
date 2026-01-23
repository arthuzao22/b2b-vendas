import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, handleZodError, requireFornecedor } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";
import { TipoDesconto } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const createListaPrecoSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  descricao: z.string().optional(),
  tipoDesconto: z.enum(["percentual", "fixo"], {
    message: "Tipo de desconto deve ser 'percentual' ou 'fixo'",
  }),
  valorDesconto: z.union([z.number(), z.string()]).transform((val) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num) || num < 0) throw new Error("Valor de desconto inválido");
    return new Decimal(num);
  }),
  ativo: z.boolean().default(true),
});

// POST /api/listas-preco - Criar lista de preço (fornecedor only)
export async function POST(request: NextRequest) {
  try {
    const { fornecedorId } = await requireFornecedor();

    const body = await request.json();
    const validatedData = createListaPrecoSchema.parse(body);

    // Validar valor de desconto
    if (validatedData.tipoDesconto === "percentual") {
      const percentual = parseFloat(validatedData.valorDesconto.toString());
      if (percentual > 100) {
        return errorResponse("Desconto percentual não pode ser maior que 100%", 400);
      }
    }

    const listaPreco = await prisma.listaPreco.create({
      data: {
        fornecedorId,
        nome: validatedData.nome,
        descricao: validatedData.descricao,
        tipoDesconto: validatedData.tipoDesconto as TipoDesconto,
        valorDesconto: validatedData.valorDesconto,
        ativo: validatedData.ativo,
      },
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

    logger.info("Lista de preço criada", {
      listaPrecoId: listaPreco.id,
      fornecedorId,
      nome: listaPreco.nome,
    });

    return successResponse(
      {
        id: listaPreco.id,
        fornecedor: listaPreco.fornecedor,
        nome: listaPreco.nome,
        descricao: listaPreco.descricao,
        tipoDesconto: listaPreco.tipoDesconto,
        valorDesconto: listaPreco.valorDesconto.toString(),
        ativo: listaPreco.ativo,
        criadoEm: listaPreco.criadoEm,
        atualizadoEm: listaPreco.atualizadoEm,
      },
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleZodError(error);
    }

    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    logger.error("Erro ao criar lista de preço", error);
    return errorResponse("Erro ao criar lista de preço", 500);
  }
}

// GET /api/listas-preco - Listar listas de preço do fornecedor
export async function GET(request: NextRequest) {
  try {
    const { fornecedorId } = await requireFornecedor();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const skip = (page - 1) * limit;
    const search = searchParams.get("search") || undefined;
    const ativo = searchParams.get("ativo");

    // Construir filtros
    const where: any = {
      fornecedorId,
    };

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: "insensitive" } },
        { descricao: { contains: search, mode: "insensitive" } },
      ];
    }

    if (ativo !== null && ativo !== undefined) {
      where.ativo = ativo === "true";
    }

    const [listas, total] = await Promise.all([
      prisma.listaPreco.findMany({
        where,
        skip,
        take: limit,
        orderBy: { criadoEm: "desc" },
        include: {
          _count: {
            select: {
              itens: true,
              clientes: true,
            },
          },
        },
      }),
      prisma.listaPreco.count({ where }),
    ]);

    const listasResponse = listas.map((lista) => ({
      id: lista.id,
      nome: lista.nome,
      descricao: lista.descricao,
      tipoDesconto: lista.tipoDesconto,
      valorDesconto: lista.valorDesconto.toString(),
      ativo: lista.ativo,
      totalProdutos: lista._count.itens,
      totalClientes: lista._count.clientes,
      criadoEm: lista.criadoEm,
      atualizadoEm: lista.atualizadoEm,
    }));

    return successResponse({
      listas: listasResponse,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    logger.error("Erro ao listar listas de preço", error);
    return errorResponse("Erro ao listar listas de preço", 500);
  }
}
