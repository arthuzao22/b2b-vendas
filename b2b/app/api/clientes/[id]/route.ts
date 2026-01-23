import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, handleZodError, requireFornecedor } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";

const updateClienteSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").optional(),
  telefone: z.string().optional(),
  razaoSocial: z.string().min(3, "Razão social deve ter no mínimo 3 caracteres").optional(),
  nomeFantasia: z.string().optional(),
  inscricaoEstadual: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  ativo: z.boolean().optional(),
});

// GET /api/clientes/[id] - Obter detalhes do cliente
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { fornecedorId } = await requireFornecedor();
    const { id } = await params;

    // Buscar cliente e verificar se pertence ao fornecedor
    const cliente = await prisma.cliente.findFirst({
      where: {
        id,
        fornecedores: {
          some: {
            fornecedorId,
          },
        },
      },
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            nome: true,
            telefone: true,
            ativo: true,
          },
        },
        fornecedores: {
          where: {
            fornecedorId,
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
          },
        },
        precosCustomizados: {
          include: {
            produto: {
              select: {
                id: true,
                nome: true,
                sku: true,
                precoBase: true,
              },
            },
          },
        },
      },
    });

    if (!cliente) {
      return errorResponse("Cliente não encontrado", 404);
    }

    const clienteResponse = {
      id: cliente.id,
      usuario: cliente.usuario,
      razaoSocial: cliente.razaoSocial,
      nomeFantasia: cliente.nomeFantasia,
      cnpj: cliente.cnpj,
      inscricaoEstadual: cliente.inscricaoEstadual,
      endereco: cliente.endereco,
      cidade: cliente.cidade,
      estado: cliente.estado,
      cep: cliente.cep,
      listaPreco: cliente.fornecedores[0]?.listaPreco
        ? {
            ...cliente.fornecedores[0].listaPreco,
            valorDesconto: cliente.fornecedores[0].listaPreco.valorDesconto.toString(),
          }
        : null,
      precosCustomizados: cliente.precosCustomizados.map((pc) => ({
        id: pc.id,
        produto: {
          ...pc.produto,
          precoBase: pc.produto.precoBase.toString(),
        },
        preco: pc.preco.toString(),
        criadoEm: pc.criadoEm,
        atualizadoEm: pc.atualizadoEm,
      })),
      criadoEm: cliente.criadoEm,
      atualizadoEm: cliente.atualizadoEm,
    };

    return successResponse(clienteResponse);
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    logger.error("Erro ao buscar cliente", error);
    return errorResponse("Erro ao buscar cliente", 500);
  }
}

// PUT /api/clientes/[id] - Atualizar informações do cliente
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { fornecedorId } = await requireFornecedor();
    const { id } = await params;

    const body = await request.json();
    const validatedData = updateClienteSchema.parse(body);

    // Verificar se cliente pertence ao fornecedor
    const clienteFornecedor = await prisma.clienteFornecedor.findFirst({
      where: {
        clienteId: id,
        fornecedorId,
      },
    });

    if (!clienteFornecedor) {
      return errorResponse("Cliente não encontrado", 404);
    }

    // Atualizar em transação
    const result = await prisma.$transaction(async (tx) => {
      // Atualizar dados do usuário se fornecidos
      const usuarioData: any = {};
      if (validatedData.nome) usuarioData.nome = validatedData.nome;
      if (validatedData.telefone !== undefined)
        usuarioData.telefone = validatedData.telefone;
      if (validatedData.ativo !== undefined) usuarioData.ativo = validatedData.ativo;

      let usuario;
      if (Object.keys(usuarioData).length > 0) {
        const clienteData = await tx.cliente.findUnique({
          where: { id },
          select: { usuarioId: true },
        });

        if (clienteData) {
          usuario = await tx.usuario.update({
            where: { id: clienteData.usuarioId },
            data: usuarioData,
            select: {
              id: true,
              email: true,
              nome: true,
              telefone: true,
              ativo: true,
            },
          });
        }
      }

      // Atualizar dados do cliente
      const clienteData: any = {};
      if (validatedData.razaoSocial) clienteData.razaoSocial = validatedData.razaoSocial;
      if (validatedData.nomeFantasia !== undefined)
        clienteData.nomeFantasia = validatedData.nomeFantasia;
      if (validatedData.inscricaoEstadual !== undefined)
        clienteData.inscricaoEstadual = validatedData.inscricaoEstadual;
      if (validatedData.endereco !== undefined)
        clienteData.endereco = validatedData.endereco;
      if (validatedData.cidade !== undefined) clienteData.cidade = validatedData.cidade;
      if (validatedData.estado !== undefined) clienteData.estado = validatedData.estado;
      if (validatedData.cep !== undefined) clienteData.cep = validatedData.cep;

      const cliente = await tx.cliente.update({
        where: { id },
        data: clienteData,
        include: {
          usuario: {
            select: {
              id: true,
              email: true,
              nome: true,
              telefone: true,
              ativo: true,
            },
          },
        },
      });

      return cliente;
    });

    logger.info("Cliente atualizado", { clienteId: id, fornecedorId });

    return successResponse({
      id: result.id,
      usuario: result.usuario,
      razaoSocial: result.razaoSocial,
      nomeFantasia: result.nomeFantasia,
      cnpj: result.cnpj,
      inscricaoEstadual: result.inscricaoEstadual,
      endereco: result.endereco,
      cidade: result.cidade,
      estado: result.estado,
      cep: result.cep,
      criadoEm: result.criadoEm,
      atualizadoEm: result.atualizadoEm,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleZodError(error);
    }

    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    logger.error("Erro ao atualizar cliente", error);
    return errorResponse("Erro ao atualizar cliente", 500);
  }
}

// DELETE /api/clientes/[id] - Deletar cliente
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { fornecedorId } = await requireFornecedor();
    const { id } = await params;

    // Verificar se cliente pertence ao fornecedor
    const clienteFornecedor = await prisma.clienteFornecedor.findFirst({
      where: {
        clienteId: id,
        fornecedorId,
      },
      include: {
        cliente: {
          select: {
            usuarioId: true,
          },
        },
      },
    });

    if (!clienteFornecedor) {
      return errorResponse("Cliente não encontrado", 404);
    }

    // Verificar se há pedidos
    const pedidosCount = await prisma.pedido.count({
      where: {
        clienteId: id,
        fornecedorId,
      },
    });

    if (pedidosCount > 0) {
      return errorResponse(
        "Não é possível deletar cliente com pedidos. Desative-o ao invés disso.",
        400
      );
    }

    // Deletar relacionamento ClienteFornecedor e cliente em transação
    await prisma.$transaction(async (tx) => {
      // Deletar relacionamento
      await tx.clienteFornecedor.delete({
        where: { id: clienteFornecedor.id },
      });

      // Verificar se cliente tem outros fornecedores
      const outrosRelacionamentos = await tx.clienteFornecedor.count({
        where: { clienteId: id },
      });

      // Se não tiver outros relacionamentos, deletar cliente e usuário
      if (outrosRelacionamentos === 0) {
        await tx.cliente.delete({
          where: { id },
        });

        // Usuario será deletado em cascata
      }
    });

    logger.info("Cliente deletado", { clienteId: id, fornecedorId });

    return successResponse({ message: "Cliente deletado com sucesso" });
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    logger.error("Erro ao deletar cliente", error);
    return errorResponse("Erro ao deletar cliente", 500);
  }
}
