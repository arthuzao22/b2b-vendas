import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";

// DELETE /api/notificacoes/[id] - Deletar notificação
export async function DELETE(
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
      return errorResponse("Sem permissão para deletar esta notificação", 403);
    }

    await prisma.notificacao.delete({
      where: { id },
    });

    logger.info("Notificação deletada", { notificacaoId: id, usuarioId: user.id });

    return successResponse({ message: "Notificação deletada com sucesso" });
  } catch (error: any) {
    return errorResponse(error.message || "Erro ao deletar notificação", 500);
  }
}
