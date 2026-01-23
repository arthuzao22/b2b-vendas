import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireFornecedor, requireAdmin } from "@/lib/api-helpers";
import { TipoUsuario } from "@prisma/client";
import { logger } from "@/lib/logger";

// GET /api/analytics/vendas - Vendas por período
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

    const periodo = searchParams.get("periodo") || "dia";
    let startDate = searchParams.get("startDate");
    let endDate = searchParams.get("endDate");

    // Default: últimos 30 dias se não especificado
    if (!startDate) {
      const date = new Date();
      date.setDate(date.getDate() - 30);
      startDate = date.toISOString();
    }

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const whereClause: any = {
      criadoEm: dateFilter,
    };

    // Filtrar por fornecedor se não for admin
    if (fornecedorId) {
      whereClause.fornecedorId = fornecedorId;
    }

    const pedidos = await prisma.pedido.findMany({
      where: whereClause,
      select: {
        criadoEm: true,
        total: true,
      },
    });

    // Agrupar por período
    const salesByPeriod = new Map<string, { total: number; pedidos: number }>();

    pedidos.forEach((pedido) => {
      let key: string;
      const date = new Date(pedido.criadoEm);

      switch (periodo) {
        case "ano":
          key = date.getFullYear().toString();
          break;
        case "mes":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          break;
        case "semana":
          const firstDay = new Date(date.setDate(date.getDate() - date.getDay()));
          key = firstDay.toISOString().split("T")[0];
          break;
        case "dia":
        default:
          key = date.toISOString().split("T")[0];
          break;
      }

      const current = salesByPeriod.get(key) || { total: 0, pedidos: 0 };
      salesByPeriod.set(key, {
        total: current.total + Number(pedido.total),
        pedidos: current.pedidos + 1,
      });
    });

    const result = Array.from(salesByPeriod.entries())
      .map(([data, stats]) => ({
        data,
        total: stats.total.toFixed(2),
        pedidos: stats.pedidos,
      }))
      .sort((a, b) => a.data.localeCompare(b.data));

    logger.info("Vendas por período consultadas", { usuarioId: userId, periodo });

    return successResponse(result);
  } catch (error: any) {
    return errorResponse(error.message || "Erro ao buscar vendas por período", 500);
  }
}
