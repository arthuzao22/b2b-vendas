import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, requireFornecedor } from "@/lib/api-helpers";
import { logger } from "@/lib/logger";

// GET /api/clientes/[id]/pedidos - Obter pedidos do cliente
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { fornecedorId } = await requireFornecedor();
    const { id: clienteId } = await params;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const skip = (page - 1) * limit;
    const status = searchParams.get("status") || undefined;

    // Verificar se cliente pertence ao fornecedor
    const clienteFornecedor = await prisma.clienteFornecedor.findFirst({
      where: {
        clienteId,
        fornecedorId,
      },
    });

    if (!clienteFornecedor) {
      return errorResponse("Cliente não encontrado", 404);
    }

    // Construir filtros
    const where: any = {
      clienteId,
      fornecedorId,
    };

    if (status) {
      where.status = status;
    }

    const [pedidos, total] = await Promise.all([
      prisma.pedido.findMany({
        where,
        skip,
        take: limit,
        orderBy: { criadoEm: "desc" },
        include: {
          itens: {
            include: {
              produto: {
                select: {
                  id: true,
                  nome: true,
                  sku: true,
                  imagens: true,
                },
              },
            },
          },
          cliente: {
            select: {
              id: true,
              razaoSocial: true,
              nomeFantasia: true,
              cnpj: true,
            },
          },
        },
      }),
      prisma.pedido.count({ where }),
    ]);

    // Converter Decimal para string
    const pedidosResponse = pedidos.map((pedido) => ({
      id: pedido.id,
      numeroPedido: pedido.numeroPedido,
      status: pedido.status,
      cliente: pedido.cliente,
      subtotal: pedido.subtotal.toString(),
      desconto: pedido.desconto.toString(),
      frete: pedido.frete.toString(),
      total: pedido.total.toString(),
      observacoes: pedido.observacoes,
      enderecoEntrega: pedido.enderecoEntrega,
      cidadeEntrega: pedido.cidadeEntrega,
      estadoEntrega: pedido.estadoEntrega,
      cepEntrega: pedido.cepEntrega,
      codigoRastreio: pedido.codigoRastreio,
      previsaoEntrega: pedido.previsaoEntrega,
      dataEntrega: pedido.dataEntrega,
      itens: pedido.itens.map((item) => ({
        id: item.id,
        produto: item.produto,
        quantidade: item.quantidade,
        precoUnitario: item.precoUnitario.toString(),
        precoTotal: item.precoTotal.toString(),
      })),
      criadoEm: pedido.criadoEm,
      atualizadoEm: pedido.atualizadoEm,
    }));

    return successResponse({
      pedidos: pedidosResponse,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return errorResponse(error.message, 400);
    }

    logger.error("Erro ao buscar pedidos do cliente", error);
    return errorResponse("Erro ao buscar pedidos do cliente", 500);
  }
}
