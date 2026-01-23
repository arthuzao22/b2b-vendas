import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, handleZodError, requireFornecedor } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";
import { Decimal } from "@prisma/client/runtime/library";

const createPrecoCustomizadoSchema = z.object({
  clienteId: z.string().min(1, "ID do cliente é obrigatório"),
  produtoId: z.string().min(1, "ID do produto é obrigatório"),
  preco: z.union([z.number(), z.string()]).transform((val) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num) || num < 0) throw new Error("Preço inválido");
    return new Decimal(num);
  }),
});

// POST /api/precos-customizados - Criar preço customizado (fornecedor only)
export async function POST(request: NextRequest) {
  try {
    const { fornecedorId } = await requireFornecedor();

    const body = await request.json();
    const validatedData = createPrecoCustomizadoSchema.parse(body);

    // Verificar se cliente pertence ao fornecedor
    const clienteFornecedor = await prisma.clienteFornecedor.findFirst({
      where: {
        clienteId: validatedData.clienteId,
        fornecedorId,
      },
    });

    if (!clienteFornecedor) {
      return errorResponse("Cliente não encontrado ou não pertence ao fornecedor", 404);
    }

    // Verificar se produto pertence ao fornecedor
    const produto = await prisma.produto.findFirst({
      where: {
        id: validatedData.produtoId,
        fornecedorId,
      },
    });

    if (!produto) {
      return errorResponse("Produto não encontrado ou não pertence ao fornecedor", 404);
    }

    // Verificar se já existe preço customizado
    const existingPreco = await prisma.precoCustomizado.findUnique({
      where: {
        clienteId_produtoId: {
          clienteId: validatedData.clienteId,
          produtoId: validatedData.produtoId,
        },
      },
    });

    if (existingPreco) {
      return errorResponse("Já existe preço customizado para este cliente e produto", 409);
    }

    // Criar preço customizado
    const precoCustomizado = await prisma.precoCustomizado.create({
      data: {
        clienteId: validatedData.clienteId,
        produtoId: validatedData.produtoId,
        preco: validatedData.preco,
      },
      include: {
        cliente: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
            cnpj: true,
          },
        },
        produto: {
          select: {
            id: true,
            nome: true,
            sku: true,
            precoBase: true,
            imagens: true,
          },
        },
      },
    });

    logger.info("Preço customizado criado", {
      precoCustomizadoId: precoCustomizado.id,
      clienteId: validatedData.clienteId,
      produtoId: validatedData.produtoId,
      fornecedorId,
    });

    return successResponse(
      {
        id: precoCustomizado.id,
        cliente: precoCustomizado.cliente,
        produto: {
          ...precoCustomizado.produto,
          precoBase: precoCustomizado.produto.precoBase.toString(),
        },
        preco: precoCustomizado.preco.toString(),
        criadoEm: precoCustomizado.criadoEm,
        atualizadoEm: precoCustomizado.atualizadoEm,
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

    logger.error("Erro ao criar preço customizado", error);
    return errorResponse("Erro ao criar preço customizado", 500);
  }
}

// GET /api/precos-customizados - Listar preços customizados
export async function GET(request: NextRequest) {
  try {
    const { fornecedorId } = await requireFornecedor();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const skip = (page - 1) * limit;
    const clienteId = searchParams.get("clienteId") || undefined;
    const produtoId = searchParams.get("produtoId") || undefined;

    // Construir filtros
    // Primeiro, obter os IDs dos produtos do fornecedor
    const produtosFornecedor = await prisma.produto.findMany({
      where: { fornecedorId },
      select: { id: true },
    });

    const produtoIds = produtosFornecedor.map((p) => p.id);

    const where: any = {
      produtoId: {
        in: produtoIds,
      },
    };

    // Se clienteId fornecido, verificar se pertence ao fornecedor
    if (clienteId) {
      const clienteFornecedor = await prisma.clienteFornecedor.findFirst({
        where: {
          clienteId,
          fornecedorId,
        },
      });

      if (!clienteFornecedor) {
        return errorResponse("Cliente não encontrado", 404);
      }

      where.clienteId = clienteId;
    } else {
      // Se não fornecido clienteId, filtrar apenas clientes do fornecedor
      const clientesFornecedor = await prisma.clienteFornecedor.findMany({
        where: { fornecedorId },
        select: { clienteId: true },
      });

      const clienteIds = clientesFornecedor.map((cf) => cf.clienteId);
      where.clienteId = {
        in: clienteIds,
      };
    }

    if (produtoId) {
      where.produtoId = produtoId;
    }

    const [precos, total] = await Promise.all([
      prisma.precoCustomizado.findMany({
        where,
        skip,
        take: limit,
        orderBy: { criadoEm: "desc" },
        include: {
          cliente: {
            select: {
              id: true,
              razaoSocial: true,
              nomeFantasia: true,
              cnpj: true,
            },
          },
          produto: {
            select: {
              id: true,
              nome: true,
              sku: true,
              precoBase: true,
              imagens: true,
            },
          },
        },
      }),
      prisma.precoCustomizado.count({ where }),
    ]);

    const precosResponse = precos.map((preco) => ({
      id: preco.id,
      cliente: preco.cliente,
      produto: {
        ...preco.produto,
        precoBase: preco.produto.precoBase.toString(),
      },
      preco: preco.preco.toString(),
      criadoEm: preco.criadoEm,
      atualizadoEm: preco.atualizadoEm,
    }));

    return successResponse({
      precos: precosResponse,
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

    logger.error("Erro ao listar preços customizados", error);
    return errorResponse("Erro ao listar preços customizados", 500);
  }
}
