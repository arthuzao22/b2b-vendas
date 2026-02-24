import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, handleZodError, requireFornecedor } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";

const vincularClienteSchema = z.object({
  busca: z.string().min(1, "Informe um termo de busca").optional(),
  clienteId: z.string().optional(),
});

// GET /api/clientes/buscar-independentes - Buscar clientes que não estão vinculados ao fornecedor
export async function GET(request: NextRequest) {
  try {
    const { fornecedorId } = await requireFornecedor();

    const { searchParams } = new URL(request.url);
    const busca = searchParams.get("busca") || "";

    if (!busca || busca.length < 2) {
      return successResponse({ clientes: [] });
    }

    // Buscar clientes que NÃO estão vinculados a este fornecedor
    const clientes = await prisma.cliente.findMany({
      where: {
        AND: [
          {
            NOT: {
              fornecedores: {
                some: {
                  fornecedorId,
                },
              },
            },
          },
          {
            OR: [
              { razaoSocial: { contains: busca, mode: "insensitive" } },
              { nomeFantasia: { contains: busca, mode: "insensitive" } },
              { cnpj: { contains: busca } },
              { usuario: { email: { contains: busca, mode: "insensitive" } } },
            ],
          },
        ],
      },
      take: 10,
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            nome: true,
            ativo: true,
          },
        },
      },
    });

    const clientesResponse = clientes.map((c) => ({
      id: c.id,
      razaoSocial: c.razaoSocial,
      nomeFantasia: c.nomeFantasia,
      cnpj: c.cnpj,
      email: c.usuario.email,
      nome: c.usuario.nome,
      ativo: c.usuario.ativo,
    }));

    return successResponse({ clientes: clientesResponse });
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    logger.error("Erro ao buscar clientes independentes", error);
    return errorResponse("Erro ao buscar clientes", 500);
  }
}

// POST /api/clientes/buscar-independentes - Vincular cliente existente ao fornecedor
export async function POST(request: NextRequest) {
  try {
    const { fornecedorId } = await requireFornecedor();

    const body = await request.json();
    const { clienteId } = vincularClienteSchema.parse(body);

    if (!clienteId) {
      return errorResponse("ID do cliente é obrigatório", 400);
    }

    // Verificar se cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            nome: true,
            ativo: true,
          },
        },
      },
    });

    if (!cliente) {
      return errorResponse("Cliente não encontrado", 404);
    }

    // Verificar se já está vinculado
    const existingLink = await prisma.clienteFornecedor.findFirst({
      where: {
        clienteId,
        fornecedorId,
      },
    });

    if (existingLink) {
      return errorResponse("Este cliente já está vinculado ao seu perfil", 409);
    }

    // Criar vínculo
    await prisma.clienteFornecedor.create({
      data: {
        clienteId,
        fornecedorId,
      },
    });

    logger.info("Cliente vinculado ao fornecedor", {
      clienteId,
      fornecedorId,
    });

    return successResponse(
      {
        message: "Cliente vinculado com sucesso",
        cliente: {
          id: cliente.id,
          razaoSocial: cliente.razaoSocial,
          nomeFantasia: cliente.nomeFantasia,
          cnpj: cliente.cnpj,
          email: cliente.usuario.email,
          nome: cliente.usuario.nome,
        },
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

    logger.error("Erro ao vincular cliente", error);
    return errorResponse("Erro ao vincular cliente", 500);
  }
}
