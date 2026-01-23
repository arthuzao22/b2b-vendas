import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireFornecedor, requireAdmin } from "@/lib/api-helpers";
import { TipoUsuario } from "@prisma/client";
import { logger } from "@/lib/logger";

// GET /api/analytics/top-clientes - Top clientes
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
      whereClause.criadoEm = dateFilter;
    }

    // Filtrar por fornecedor se não for admin
    if (fornecedorId) {
      whereClause.fornecedorId = fornecedorId;
    }

    const pedidos = await prisma.pedido.findMany({
      where: whereClause,
      include: {
        cliente: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
          },
        },
      },
    });

    // Agrupar por cliente
    const clientesMap = new Map<
      string,
      { cliente: any; totalPedidos: number; faturamento: number; ultimoPedido: Date }
    >();

    pedidos.forEach((pedido) => {
      const key = pedido.clienteId;
      const current = clientesMap.get(key) || {
        cliente: pedido.cliente,
        totalPedidos: 0,
        faturamento: 0,
        ultimoPedido: pedido.criadoEm,
      };

      clientesMap.set(key, {
        cliente: pedido.cliente,
        totalPedidos: current.totalPedidos + 1,
        faturamento: current.faturamento + Number(pedido.total),
        ultimoPedido:
          pedido.criadoEm > current.ultimoPedido ? pedido.criadoEm : current.ultimoPedido,
      });
    });

    const result = Array.from(clientesMap.values())
      .sort((a, b) => b.faturamento - a.faturamento)
      .slice(0, limit)
      .map((item) => ({
        cliente: item.cliente,
        totalPedidos: item.totalPedidos,
        faturamento: item.faturamento.toFixed(2),
        ultimoPedido: item.ultimoPedido.toISOString(),
      }));

    logger.info("Top clientes consultados", { usuarioId: userId, limit });

    return successResponse(result);
  } catch (error: any) {
    return errorResponse(error.message || "Erro ao buscar top clientes", 500);
  }
}
