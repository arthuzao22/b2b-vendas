import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";

// PUT /api/notificacoes/[id]/lida - Marcar notificação como lida
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const notificacao = await prisma.notificacao.findUnique({
      where: { id },
    });

    if (!notificacao) {
      return errorResponse("Notificação não encontrada", 404);
    }

    if (notificacao.usuarioId !== user.id) {
      return errorResponse("Sem permissão para atualizar esta notificação", 403);
    }

    const updatedNotificacao = await prisma.notificacao.update({
      where: { id },
      data: { lida: true },
    });

    logger.info("Notificação marcada como lida", { notificacaoId: id, usuarioId: user.id });

    return successResponse(updatedNotificacao);
  } catch (error: any) {
    return errorResponse(error.message || "Erro ao marcar notificação como lida", 500);
  }
}
