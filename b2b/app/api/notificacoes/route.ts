import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, handleZodError, requireAuth } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";

const createNotificacaoSchema = z.object({
  usuarioId: z.string().min(1, "Usuário é obrigatório"),
  titulo: z.string().min(1, "Título é obrigatório"),
  mensagem: z.string().min(1, "Mensagem é obrigatória"),
  tipo: z.enum(['pedido', 'estoque', 'pagamento', 'sistema', 'cliente']),
  dados: z.any().optional(),
});

// POST /api/notificacoes - Criar notificação (system use)
export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();
    const validatedData = createNotificacaoSchema.parse(body);

    const notificacao = await prisma.notificacao.create({
      data: validatedData,
    });

    logger.info("Notificação criada", { notificacaoId: notificacao.id, usuarioId: notificacao.usuarioId });

    return successResponse(notificacao, 201);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return handleZodError(error);
    }
    return errorResponse(error.message || "Erro ao criar notificação", 500);
  }
}

// GET /api/notificacoes - Listar notificações do usuário
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const lida = searchParams.get("lida");
    const tipo = searchParams.get("tipo");

    const skip = (page - 1) * limit;

    const where: any = {
      usuarioId: user.id,
    };

    if (lida !== null) {
      where.lida = lida === "true";
    }

    if (tipo) {
      where.tipo = tipo;
    }

    const [notificacoes, total] = await Promise.all([
      prisma.notificacao.findMany({
        where,
        orderBy: { criadoEm: "desc" },
        skip,
        take: limit,
      }),
      prisma.notificacao.count({ where }),
    ]);

    return successResponse({
      notificacoes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return errorResponse(error.message || "Erro ao listar notificações", 500);
  }
}
