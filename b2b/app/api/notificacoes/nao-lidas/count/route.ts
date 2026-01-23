import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireAuth } from "@/lib/api-helpers";

// GET /api/notificacoes/nao-lidas/count - Contar notificações não lidas
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const count = await prisma.notificacao.count({
      where: {
        usuarioId: user.id,
        lida: false,
      },
    });

    return successResponse({ count });
  } catch (error: any) {
    return errorResponse(error.message || "Erro ao contar notificações não lidas", 500);
  }
}
