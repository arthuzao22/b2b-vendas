import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireFornecedor, requireAdmin } from "@/lib/api-helpers";
import { TipoUsuario } from "@prisma/client";
import { logger } from "@/lib/logger";

// GET /api/analytics/pedidos-por-status - Pedidos por status
export async function GET(request: NextRequest) {
  try {
    let fornecedorId: string | null = null;
    let userId: string;

    try {
      const { user, fornecedorId: fId } = await requireFornecedor();
      fornecedorId = fId;
      userId = user.id;
    } catch {
      const user = await requireAdmin();
      userId = user.id;
    }

    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const whereClause: any = {};
    if (Object.keys(dateFilter).length > 0) {
      whereClause.criadoEm = dateFilter;
    }

    // Filtrar por fornecedor se não for admin
    if (fornecedorId) {
      whereClause.fornecedorId = fornecedorId;
    }

    const pedidosByStatus = await prisma.pedido.groupBy({
      by: ["status"],
      where: whereClause,
      _count: true,
      _sum: {
        total: true,
      },
    });

    const result = pedidosByStatus.map((item) => ({
      status: item.status,
      count: item._count,
      total: (item._sum.total || 0).toString(),
    }));

    logger.info("Pedidos por status consultados", { usuarioId: userId });

    return successResponse(result);
  } catch (error: any) {
    return errorResponse(error.message || "Erro ao buscar pedidos por status", 500);
  }
}
