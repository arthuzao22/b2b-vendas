import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireFornecedor, requireAdmin } from "@/lib/api-helpers";
import { TipoUsuario } from "@prisma/client";
import { logger } from "@/lib/logger";

// GET /api/analytics/kpis - KPIs gerais
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

    const [pedidosData, produtosAtivos, pedidosPendentes, clientesAtivos] = await Promise.all([
      // Total de pedidos e faturamento
      prisma.pedido.aggregate({
        where: whereClause,
        _count: true,
        _sum: {
          total: true,
        },
      }),
      // Produtos ativos
      prisma.produto.count({
        where: {
          ativo: true,
          ...(fornecedorId ? { fornecedorId } : {}),
        },
      }),
      // Pedidos pendentes
      prisma.pedido.count({
        where: {
          status: "pendente",
          ...(fornecedorId ? { fornecedorId } : {}),
        },
      }),
      // Clientes ativos (com pedidos no período)
      prisma.pedido.groupBy({
        by: ["clienteId"],
        where: whereClause,
      }),
    ]);

    const totalPedidos = pedidosData._count;
    const faturamento = pedidosData._sum.total || 0;
    const ticketMedio = totalPedidos > 0 ? Number(faturamento) / totalPedidos : 0;

    logger.info("KPIs consultados", { usuarioId: userId });

    return successResponse({
      totalPedidos,
      faturamento: faturamento.toString(),
      ticketMedio: ticketMedio.toFixed(2),
      clientesAtivos: clientesAtivos.length,
      produtosAtivos,
      pedidosPendentes,
    });
  } catch (error: any) {
    return errorResponse(error.message || "Erro ao buscar KPIs", 500);
  }
}
