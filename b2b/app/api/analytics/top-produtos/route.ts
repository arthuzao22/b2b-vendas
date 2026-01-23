import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireFornecedor, requireAdmin } from "@/lib/api-helpers";
import { TipoUsuario } from "@prisma/client";
import { logger } from "@/lib/logger";

// GET /api/analytics/top-produtos - Top produtos mais vendidos
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
    const limit = parseInt(searchParams.get("limit") || "10");

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const whereClause: any = {};
    if (Object.keys(dateFilter).length > 0) {
      whereClause.pedido = {
        criadoEm: dateFilter,
      };
    }

    // Filtrar por fornecedor se não for admin
    if (fornecedorId) {
      whereClause.produto = {
        fornecedorId,
      };
    }

    const itens = await prisma.itemPedido.findMany({
      where: whereClause,
      include: {
        produto: {
          select: {
            id: true,
            nome: true,
            sku: true,
          },
        },
      },
    });

    // Agrupar por produto
    const produtosMap = new Map<
      string,
      { produto: any; totalVendido: number; faturamento: number }
    >();

    itens.forEach((item) => {
      const key = item.produtoId;
      const current = produtosMap.get(key) || {
        produto: item.produto,
        totalVendido: 0,
        faturamento: 0,
      };

      produtosMap.set(key, {
        produto: item.produto,
        totalVendido: current.totalVendido + item.quantidade,
        faturamento: current.faturamento + Number(item.precoTotal),
      });
    });

    const result = Array.from(produtosMap.values())
      .sort((a, b) => b.totalVendido - a.totalVendido)
      .slice(0, limit)
      .map((item) => ({
        produto: item.produto,
        totalVendido: item.totalVendido,
        faturamento: item.faturamento.toFixed(2),
      }));

    logger.info("Top produtos consultados", { usuarioId: userId, limit });

    return successResponse(result);
  } catch (error: any) {
    return errorResponse(error.message || "Erro ao buscar top produtos", 500);
  }
}
