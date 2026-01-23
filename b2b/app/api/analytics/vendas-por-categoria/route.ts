import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireFornecedor, requireAdmin } from "@/lib/api-helpers";
import { TipoUsuario } from "@prisma/client";
import { logger } from "@/lib/logger";

// GET /api/analytics/vendas-por-categoria - Vendas por categoria
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
            categoriaId: true,
            categoria: {
              select: {
                id: true,
                nome: true,
                slug: true,
              },
            },
          },
        },
        pedido: {
          select: {
            id: true,
          },
        },
      },
    });

    // Agrupar por categoria
    const categoriasMap = new Map<
      string,
      { categoria: any; faturamento: number; pedidos: Set<string> }
    >();

    itens.forEach((item) => {
      if (!item.produto.categoria) return;

      const key = item.produto.categoriaId!;
      const current = categoriasMap.get(key) || {
        categoria: item.produto.categoria,
        faturamento: 0,
        pedidos: new Set<string>(),
      };

      current.faturamento += Number(item.precoTotal);
      current.pedidos.add(item.pedido.id);

      categoriasMap.set(key, current);
    });

    const result = Array.from(categoriasMap.values())
      .sort((a, b) => b.faturamento - a.faturamento)
      .slice(0, limit)
      .map((item) => ({
        categoria: item.categoria,
        faturamento: item.faturamento.toFixed(2),
        pedidos: item.pedidos.size,
      }));

    logger.info("Vendas por categoria consultadas", { usuarioId: userId, limit });

    return successResponse(result);
  } catch (error: any) {
    return errorResponse(error.message || "Erro ao buscar vendas por categoria", 500);
  }
}
