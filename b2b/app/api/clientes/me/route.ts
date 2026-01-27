import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, handleZodError, requireCliente } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";

const updateClienteSchema = z.object({
    nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").optional(),
    telefone: z.string().optional(),
    razaoSocial: z.string().min(2, "Razão Social deve ter no mínimo 2 caracteres").optional(),
    nomeFantasia: z.string().optional(),
    inscricaoEstadual: z.string().optional(),
    endereco: z.string().optional(),
    cidade: z.string().optional(),
    estado: z.string().max(2, "Estado deve ter no máximo 2 caracteres").optional(),
    cep: z.string().optional(),
});

// GET /api/clientes/me - Obter dados do cliente logado
export async function GET() {
    try {
        const { clienteId } = await requireCliente();

        const cliente = await prisma.cliente.findUnique({
            where: { id: clienteId },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                        telefone: true,
                    },
                },
            },
        });

        if (!cliente) {
            return errorResponse("Cliente não encontrado", 404);
        }

        return successResponse(cliente);
    } catch (error) {
        if (error instanceof Error) {
            return errorResponse(error.message, 400);
        }

        logger.error("Erro ao buscar dados do cliente", error);
        return errorResponse("Erro ao buscar dados do cliente", 500);
    }
}

// PUT /api/clientes/me - Atualizar dados do cliente logado
export async function PUT(request: NextRequest) {
    try {
        const { clienteId, user } = await requireCliente();

        const body = await request.json();
        const validatedData = updateClienteSchema.parse(body);

        const { nome, telefone, ...clienteData } = validatedData;

        // Atualizar dados em transação
        const resultado = await prisma.$transaction(async (tx) => {
            // Atualizar dados do usuário
            if (nome || telefone !== undefined) {
                await tx.usuario.update({
                    where: { id: user.id },
                    data: {
                        ...(nome && { nome }),
                        ...(telefone !== undefined && { telefone: telefone || null }),
                    },
                });
            }

            // Atualizar dados do cliente
            const clienteAtualizado = await tx.cliente.update({
                where: { id: clienteId },
                data: {
                    ...(clienteData.razaoSocial && { razaoSocial: clienteData.razaoSocial }),
                    ...(clienteData.nomeFantasia !== undefined && { nomeFantasia: clienteData.nomeFantasia || null }),
                    ...(clienteData.inscricaoEstadual !== undefined && { inscricaoEstadual: clienteData.inscricaoEstadual || null }),
                    ...(clienteData.endereco !== undefined && { endereco: clienteData.endereco || null }),
                    ...(clienteData.cidade !== undefined && { cidade: clienteData.cidade || null }),
                    ...(clienteData.estado !== undefined && { estado: clienteData.estado || null }),
                    ...(clienteData.cep !== undefined && { cep: clienteData.cep || null }),
                },
                include: {
                    usuario: {
                        select: {
                            id: true,
                            nome: true,
                            email: true,
                            telefone: true,
                        },
                    },
                },
            });

            return clienteAtualizado;
        });

        logger.info("Dados do cliente atualizados", { clienteId });

        return successResponse(resultado);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return handleZodError(error);
        }

        if (error instanceof Error) {
            return errorResponse(error.message, 400);
        }

        logger.error("Erro ao atualizar dados do cliente", error);
        return errorResponse("Erro ao atualizar dados do cliente", 500);
    }
}
