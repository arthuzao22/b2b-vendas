import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";

// PUT /api/notificacoes/marcar-todas-lidas - Marcar todas notificações como lidas
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();

    const result = await prisma.notificacao.updateMany({
      where: {
        usuarioId: user.id,
        lida: false,
      },
      data: { lida: true },
    });

    logger.info("Todas notificações marcadas como lidas", { usuarioId: user.id, count: result.count });

    return successResponse({ 
      message: "Todas as notificações foram marcadas como lidas",
      count: result.count 
    });
  } catch (error: any) {
    return errorResponse(error.message || "Erro ao marcar todas notificações como lidas", 500);
  }
}
